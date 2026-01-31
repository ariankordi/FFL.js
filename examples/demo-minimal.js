// @ts-check

import * as THREE from 'three';
import { FFL, CharModel, FFLCharModelDescDefault } from '../ffl.js';
import FFLShaderMaterial from '../materials/FFLShaderMaterial.js';
import ResourceLoadHelper from '../helpers/ResourceLoadHelper.js';

// Assumes that the Emscripten module is already imported from elsewhere.
/** @type {import('../ffl-emscripten.cjs')} */
const ModuleFFL = /** @type {*} */ (globalThis).ModuleFFL;

// Snippets to help with decoding to bytes.

const base64ToBytes = (/** @type {string} */ base64) =>
	Uint8Array.from(atob(base64), c => c.charCodeAt(0));
const hexToBytes = (/** @type {string} */ hex) =>
	Uint8Array.from({ length: hex.length >>> 1 }, (_, i) =>
		Number.parseInt(hex.slice(i << 1, (i << 1) + 2), 16));
/**
 * Parses either hex or Base64 -> U8.
 * Additionally strips spaces from the input.
 * @param {string} text - Input encoded text.
 * @returns {Uint8Array} Decoded bytes.
 */
function parseHexOrBase64ToBytes(text) {
	text = text.replace(/\s+/g, ''); // Strip spaces.
	// Check if it is hex, otherwise assume it is Base64.
	return /^[0-9a-fA-F]+$/.test(text)
		? hexToBytes(text)
		: base64ToBytes(text);
}

// --------------- Main Entrypoint (Scene & Animation) -----------------

/**
 * FFL.js instance and state.
 * @type {FFL}
 */
let ffl;

// Global variables for the main scene, renderer, camera, controls, etc.
/** @type {THREE.Scene} */
let scene;
/** @type {THREE.WebGLRenderer} */
let renderer;
/** @type {THREE.Camera} */
let camera;
/** @type {CharModel|null} */
let currentCharModel;

/** @type {THREE.Box3Helper|null} */
let boxHelper;
let isSceneInitialized = false;
let isAnimating = false;

// // ---------------------------------------------------------------------
// //  Scene Setup
// // ---------------------------------------------------------------------

/**
 * Initializes the Three.js scene, renderer, camera, lights, and OrbitControls.
 * Called only the first time the button is clicked.
 */
function initializeScene() {
	// Create scene.
	scene = new THREE.Scene();
	const space = THREE.ColorManagement ? THREE.ColorManagement.workingColorSpace : '';
	scene.background = new THREE.Color().setHex(0xE6E6FA, space);

	// Create renderer here.
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight - 256);
	document.body.append(renderer.domElement);

	ffl.setRenderer(renderer);

	// Create camera.
	camera = new THREE.PerspectiveCamera(
		15, window.innerWidth / (window.innerHeight - 256), 1, 5000);
	// Note that faceline and mask are close, and
	// often you may run into Z-fighting if you
	// don't set near/far plane with care.
	camera.position.set(0, 30, 500);

	isSceneInitialized = true;
	console.log('initializeScene: Scene, renderer, camera created.');
}

/** Starts the animation loop only once. */
function startAnimationLoop() {
	if (isAnimating) {
		return;
	} // Prevent multiple loops.
	isAnimating = true;

	/** Main animation loop. */
	function animate() {
		requestAnimationFrame(animate);

		// Rotate all top-level non-mesh Object3D nodes.
		scene.traverse((node) => {
			if (node.isObject3D && !(node instanceof THREE.Mesh)) {
				node.rotation.y += 0.01;
			}
		});

		renderer.render(scene, camera);
	}
	animate();
}

/**
 * Adds or updates the BoxHelper in the scene to the CharModel bounding box.
 * @param {CharModel} charModel - CharModel to get bounding box from.
 */
function updateBoxHelper(charModel) {
	if (boxHelper) {
		scene.remove(boxHelper);
		boxHelper.geometry.dispose();
		/** @type {THREE.Material} */ (boxHelper.material).dispose();
		boxHelper = null;
	}
	boxHelper = new THREE.Box3Helper(charModel.boundingBox);
	scene.add(boxHelper);
}

/**
 * Either creates or updates CharModel and adds it to the scene.
 * @param {Uint8Array|string} data - Data as Uint8Array or hex or Base64 string.
 * @param {import('../ffl.js').FFLCharModelDesc} modelDesc - CharModelDesc object to update CharModel with.
 * @throws {Error} cannot exclude modelDesc if no model was initialized yet, currentCharModel.meshes is null
 */
function updateCharModelInScene(data, modelDesc) {
	// Decode data.
	if (typeof data === 'string') {
		data = parseHexOrBase64ToBytes(data);
	}
	// Continue assuming it is Uint8Array.
	// If an existing CharModel exists, update it.
	if (currentCharModel) {
		// Remove current CharModel from the scene, then dispose it.
		scene.remove(currentCharModel.meshes);
		currentCharModel.dispose();
		currentCharModel = null;
	}

	// Create a new CharModel.
	currentCharModel = new CharModel(ffl, data,
		modelDesc, FFLShaderMaterial, renderer);

	// Add CharModel meshes to scene.
	scene.add(currentCharModel.meshes);
	updateBoxHelper(currentCharModel); // Update boxHelper.
}

// // ---------------------------------------------------------------------
// //  Form Submission Handling
// // ---------------------------------------------------------------------

const requireElementById = (/** @type {string} */ id) => {
	const el = document.getElementById(id);
	if (!el) {
		const msg = `HTML element not found: ${id}`;
		alert(msg);
		throw new Error(msg);
	}
	return el;
};

/** Set up event handling for the CharModel submission form (charForm). */
function setupCharModelForm() {
	const charFormElement = /** @type {HTMLFormElement} */ requireElementById(('charForm'));
	const charDataInputElement = /** @type {HTMLInputElement} */ (requireElementById('charData'));

	// -------------- Form Submission Handler ------------------
	charFormElement.addEventListener('submit', (event) => {
		event.preventDefault();
		try {
			if (!ffl) {
				throw new Error('FFL is not initialized yet. Please make sure the resource is loaded first.');
			}
			const userData = charDataInputElement.value;
			if (!userData) {
				throw new Error('You need to input something into the CharModel form input.');
			}
			if (!isSceneInitialized) {
				initializeScene();
			}

			updateCharModelInScene(userData, FFLCharModelDescDefault); // Use default expression.

			// Start the animation loop if not already started.
			if (!isAnimating) {
				startAnimationLoop();
			}
		} catch (error) {
			const e = error instanceof Error ? error.message : error;
			alert('Error creating/updating CharModel: ' + e);
			console.error(error);
			throw error;
		}
	});
}

/**
 * Callback invoked once the FFL resource is loaded.
 * @param {Response | Uint8Array} resource - Resource data compatible with initializeFFL.
 */
async function callInitializeFFL(resource) {
	// If FFL is already initialized, exit it first.
	(ffl) && ffl.dispose(); // Frees the existing resource.
	// Initialize FFL with the resource.
	ffl = await FFL.initWithResource(resource, ffl?.module ?? ModuleFFL);
}

/**
 * Main initialization method called on DOMContentLoaded.
 * Initializes the ResourceLoadHelper with our onLoad callback assigned
 * to {@link callInitializeFFL} and calls {@link setupCharModelForm}.
 */
function main() {
	const loader = new ResourceLoadHelper({
		container: document.getElementById('resourceContainer') || document.body,
		initialResource: null,
		onLoad: callInitializeFFL
	});
	loader.init(); // Initialize the resource loader to load the default resource.

	// Set up the CharModel form regardless, so that once FFL is ready, the user can submit.
	setupCharModelForm();
}

// Call main when HTML is done loading.
document.addEventListener('DOMContentLoaded', main);
