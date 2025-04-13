// @ts-check
/*
import * as THREE from 'three';
import {
	initializeFFLWithResource, initializeFFL, createCharModel,
	initCharModelTextures, parseHexOrB64ToUint8Array,
	FFLCharModelDescDefault, CharModel, exitFFL
} from '../ffl.js';
import * as FFLShaderMaterialImport from '../FFLShaderMaterial.js';
// All UMDs below:
// import * as ModuleFFLImport from '../ffl-emscripten.js'; // Build with EXPORT_ES6 to not be UMD.
import FFLResourceLoader from './ResourceLoadHelper.js';
*/
// Hack to get library globals recognized throughout the file (uncomment for ESM).
/**
 * @typedef {import('../ffl-emscripten.js')} ModuleFFL
 * @typedef {import('../FFLShaderMaterial.js')} FFLShaderMaterial
 * @typedef {import('three')} THREE
 */
/* eslint-disable no-self-assign -- Get TypeScript to identify global imports. */
// /** @type {ModuleFFL} */ let ModuleFFL = globalThis.ModuleFFL;
// ModuleFFL = (!ModuleFFL) ? ModuleFFLImport : ModuleFFL;
// /** @type {ModuleFFL} */ const ModuleFFL = window.ModuleFFL; // Uncomment for ESM (browser).

/** @type {FFLShaderMaterial} */
let FFLShaderMaterial = /** @type {*} */ (globalThis).FFLShaderMaterial;
FFLShaderMaterial = (!FFLShaderMaterial) ? FFLShaderMaterialImport : FFLShaderMaterial;
globalThis.THREE = /** @type {THREE} */ (/** @type {*} */ (globalThis).THREE);
/* eslint-enable no-self-assign -- Get TypeScript to identify global imports. */

// --------------- Main Entrypoint (Scene & Animation) -----------------

/**
 * Emscripten module instance returned after initialization.
 * @type {import('../ffl').Module}
 */
let moduleFFL;
/**
 * FFLResourceDesc returned by {@link initializeFFL}, needed for calling {@link exitFFL}.
 * @type {import('../ffl').FFLResourceDesc}
 */
let resourceDesc;

// Global variables for the main scene, renderer, camera, controls, etc.
/** @type {THREE.Scene} */
let scene;
/** @type {THREE.WebGLRenderer} */
let renderer;
/** @type {THREE.Camera} */
let camera;
/** @type {CharModel} */
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
	document.body.appendChild(renderer.domElement);

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
 * @param {import('../ffl').FFLCharModelDesc} modelDesc - CharModelDesc object to update CharModel with.
 * @throws {Error} cannot exclude modelDesc if no model was initialized yet, currentCharModel.meshes is null
 */
function updateCharModelInScene(data, modelDesc) {
	// Decode data.
	if (typeof data === 'string') {
		data = parseHexOrB64ToUint8Array(data);
	}
	// Continue assuming it is Uint8Array.
	// If an existing CharModel exists, update it.
	if (currentCharModel) {
		// Remove current CharModel from the scene, then dispose it.
		currentCharModel.meshes && scene.remove(currentCharModel.meshes);
		currentCharModel.dispose();
	}

	// Create a new CharModel.
	currentCharModel = createCharModel(data, modelDesc, FFLShaderMaterial, moduleFFL);
	// Initialize textures for the new CharModel.
	initCharModelTextures(currentCharModel, renderer);

	// Add CharModel meshes to scene.
	if (!currentCharModel.meshes) {
		throw new Error('updateCharModelInScene: currentCharModel.meshes is null.');
	}
	scene.add(currentCharModel.meshes);
	updateBoxHelper(currentCharModel); // Update boxHelper.
}

// // ---------------------------------------------------------------------
// //  Form Submission Handling
// // ---------------------------------------------------------------------

/**
 * Logging helper for missing elements.
 * @param {string} elementName - The name of the HTML element.
 */
function elNotFound(elementName) {
	const msg = `HTML element not found: ${elementName}`;
	console.error(msg);
	alert(msg);
}

/** Set up event handling for the CharModel submission form (charform). */
function setupCharModelForm() {
	const charFormElement = /** @type {HTMLFormElement} */ (document.getElementById('charForm')) || elNotFound('charForm');
	const charDataInputElement = /** @type {HTMLInputElement} */ (document.getElementById('charData')) || elNotFound('charData');

	// -------------- Form Submission Handler ------------------
	charFormElement.addEventListener('submit', (event) => {
		event.preventDefault();
		try {
			if (!moduleFFL) {
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
			alert('Error creating/updating CharModel: ' + error.message);
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
	if (moduleFFL) {
		exitFFL(moduleFFL, resourceDesc); // Frees the existing resource.
	}
	// Initialize FFL with the resource.
	const initResult = await initializeFFL(resource, moduleFFL ?? ModuleFFL);
	if (!initResult || !initResult.module) {
		throw new Error(`initializeFFL returned unexpected result: ${initResult}`);
	}
	// Set globals from initialization result.
	moduleFFL = initResult.module;
	resourceDesc = initResult.resourceDesc;
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
