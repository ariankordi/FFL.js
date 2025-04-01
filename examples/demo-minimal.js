// @ts-check
/*
import * as THREE from 'three';
import {
	initializeFFLWithResource, initializeFFL, createCharModel,
	initCharModelTextures, parseHexOrB64ToUint8Array,
	FFLCharModelDescDefault, CharModel
} from '../ffl.js';
import * as FFLShaderMaterialImport from '../FFLShaderMaterial.js';
*/
// Hack to get library globals recognized throughout the file (uncomment for ESM).
/** @typedef {import('../FFLShaderMaterial.js')} FFLShaderMaterial */
window.FFLShaderMaterial = /** @type {*} */ (globalThis).FFLShaderMaterial;
window.FFLShaderMaterial = (!FFLShaderMaterial) ? FFLShaderMaterialImport : FFLShaderMaterial;
/* globals FFLShaderMaterial -- Imported materials whose names are set above. */


// --------------- Main Entrypoint (Scene & Animation) -----------------

/**
 * Emscripten module instance returned after initialization.
 * @type {import('../ffl').Module}
 */
let moduleFFL;

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

let isInitialized = false;
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
	const space = THREE.ColorManagement ? THREE.ColorManagement.workingColorSpace : null;
	scene.background = new THREE.Color().setHex(0xE6E6FA, space);

	renderer.setSize(window.innerWidth, window.innerHeight - 256);
	document.body.appendChild(renderer.domElement);

	// Create camera.
	camera = new THREE.PerspectiveCamera(15, window.innerWidth / (window.innerHeight - 256), 1, 5000);
	// Note that faceline and mask are close, and
	// often you may run into Z-fighting if you
	// don't set near/far plane with care.
	camera.position.set(0, 30, 500);

	isInitialized = true;
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

		// Rotate CharModel.
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
	// boxHelper = new THREE.BoxHelper(charModel.meshes);
	boxHelper = new THREE.Box3Helper(charModel.boundingBox);
	scene.add(boxHelper);
}

/**
 * Either creates or updates CharModel and adds it to the scene.
 * @param {Uint8Array|string} data - Data as Uint8Array or hex or Base64 string.
 * @param {FFLCharModelDesc} modelDesc - CharModelDesc object to update CharModel with.
 * @throws {Error} cannot exclude modelDesc if no model was initialized yet
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
		scene.remove(currentCharModel.meshes);
		currentCharModel.dispose();
	}

	// Create a new CharModel.
	currentCharModel = createCharModel(data, modelDesc, FFLShaderMaterial, moduleFFL);
	// Initialize textures for the new CharModel.
	initCharModelTextures(currentCharModel, renderer);

	// Add CharModel meshes to scene.
	scene.add(currentCharModel.meshes);
	updateBoxHelper(currentCharModel); // Update boxHelper.
}

// // ---------------------------------------------------------------------
// //  Form Submission Handling
// // ---------------------------------------------------------------------

// Assume a form with id "charform" exists in the HTML.
const charFormElement = /** @type {HTMLFormElement|null} */ (document.getElementById('charForm'));
const charDataInputElement = /** @type {HTMLInputElement|null} */ (document.getElementById('charData'));

// -------------- Form Submission Handler ------------------
document.addEventListener('DOMContentLoaded', async function () {
	// Initialize FFL.
	const initResult = await initializeFFLWithResource(window.ModuleFFL);
	if (!initResult || !initResult.module) {
		throw new Error(`initializeFFLWithResource returned unexpected result: ${initResult}`);
	}
	// Set moduleFFL global from initialization result.
	moduleFFL = initResult.module;

	// Create renderer now.
	renderer = new THREE.WebGLRenderer();

	if (!charFormElement) {
		throw new Error('element #charForm not found');
	}
	charFormElement.addEventListener('submit', function (event) {
		event.preventDefault();

		// Read input from the form.
		if (!charDataInputElement || !charDataInputElement.value) {
			throw new Error('need you to enter something in that there form...');
		}

		// Define the FFLCharModelDesc.
		/** Default expression. */
		const modelDesc = FFLCharModelDescDefault;

		try {
			// First-time scene initialization.
			if (!isInitialized) {
				initializeScene();
			}

			// Create or update single CharModel in the scene.
			updateCharModelInScene(charDataInputElement.value, modelDesc);

			// Start the animation loop if not already started.
			if (!isAnimating) {
				startAnimationLoop();
			}
		} catch (err) {
			alert(`Error creating/updating CharModel: ${err}`);
			console.error('Error creating/updating CharModel:', err);
			throw err;
		}
	});
});
