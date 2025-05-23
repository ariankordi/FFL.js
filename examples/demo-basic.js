// @ts-check
/*

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
	initializeFFL, createCharModel, textureToCanvas, initCharModelTextures,
	matSupportsFFL, updateCharModel, makeExpressionFlag, checkExpressionChangesShapes,
	makeIconFromCharModel, parseHexOrB64ToUint8Array, FFLExpression, exitFFL,
	FFLCharModelDescDefault, CharModel, ViewType
} from '../ffl.js';
// All UMDs below:
// import * as ModuleFFLImport from '../ffl-emscripten.js'; // Build with EXPORT_ES6 to not be UMD.
import * as FFLShaderMaterialImport from '../FFLShaderMaterial.js';
import * as LUTShaderMaterialImport from '../LUTShaderMaterial.js';
*/

// Hack to get library globals recognized throughout the file (uncomment for ESM).
/**
 * @typedef {import('../ffl-emscripten.js')} ModuleFFL
 * @typedef {import('../FFLShaderMaterial.js')} FFLShaderMaterial
 * @typedef {import('../LUTShaderMaterial.js')} LUTShaderMaterial
 * @typedef {import('three')} THREE
 */
/* eslint-disable no-self-assign -- Get TypeScript to identify global imports. */
// /** @type {ModuleFFL} */ let ModuleFFL = globalThis.ModuleFFL;
// ModuleFFL = (!ModuleFFL) ? ModuleFFLImport : ModuleFFL;
// /** @type {ModuleFFL} */ const ModuleFFL = window.ModuleFFL; // Uncomment for ESM (browser).

/** @type {FFLShaderMaterial} */
let FFLShaderMaterial = /** @type {*} */ (globalThis).FFLShaderMaterial;
FFLShaderMaterial = (!FFLShaderMaterial) ? FFLShaderMaterialImport : FFLShaderMaterial;
/** @type {LUTShaderMaterial} */
let LUTShaderMaterial = /** @type {*} */ (globalThis).LUTShaderMaterial;
LUTShaderMaterial = (!LUTShaderMaterial) ? LUTShaderMaterialImport : LUTShaderMaterial;
globalThis.THREE = /** @type {THREE} */ (/** @type {*} */ (globalThis).THREE);
/* eslint-enable no-self-assign -- Get TypeScript to identify global imports. */
/* globals FFLShaderMaterial LUTShaderMaterial THREE -- Imported materials whose names are set above. */

if ('OrbitControls' in THREE) {
	globalThis.OrbitControls =
		/** @type {import('three/addons/controls/OrbitControls.js')} */
		// eslint-disable-next-line import/namespace -- not explicitly imported
		(THREE.OrbitControls);
}

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
/** @type {import('three').Scene} */
let scene;
/** @type {import('three').WebGLRenderer} */
let renderer;
/** @type {import('three').Camera} */
let camera;
/** @type {import('three/addons/controls/OrbitControls.js')} */
/** Initialize to empty so properties can be set. */
let controls = {};
/** @type {CharModel|null} */
let currentCharModel;
let isRendererInitialized = false;
let isSceneInitialized = false;
// window.isInitialized = false;
let isAnimating = false;

/**
 * Variant of FFLShaderMaterial that forces specular mode to Blinn-Phong.
 * @augments {FFLShaderMaterial}
 */
class FFLShaderBlinnMaterial extends FFLShaderMaterial {
	/**
	 * Constructs an FFLShaderMaterial instance.
	 * @param {import('three').ShaderMaterialParameters
	 * & import('../FFLShaderMaterial').FFLShaderMaterialParameters} [options] -
	 * Parameters for the material.
	 */
	constructor(options = {}) {
		options = Object.assign({
			useSpecularModeBlinn: true
		}, options);
		super(options); // Construct the extended class.

		if (this.uniforms && this.uniforms.u_material_specular_power) {
			// Adjust specular power, which is the reflection point, to be larger.
			/** @type {import('three').ShaderMaterial} */ (this)
				.uniforms.u_material_specular_power = { value: 2.0 };
		}
	}
}

/**
 * Global object for storing all available material classes.
 * @type {Object<string, function(new: import('three').Material, ...*): import('three').Material>}
 */
const materials = {
	// from ffl.js
	FFLShaderMaterial, FFLShaderBlinnMaterial, LUTShaderMaterial,
	// Three.js default shader materials
	MeshStandardMaterial: THREE.MeshStandardMaterial, // same as Standard/Lambert/Physical?
	MeshBasicMaterial: THREE.MeshBasicMaterial, // no lighting
	MeshPhongMaterial: THREE.MeshPhongMaterial
};

// Expression flag with default expression, blink, FFL_EXPRESSION_LIKE_WINK_LEFT
const expressionFlagBlinking = makeExpressionFlag(
	[FFLExpression.NORMAL, FFLExpression.BLINK, FFLExpression.LIKE_WINK_LEFT]
);

// For debugging.
let reinitModelEveryFrame = false;
let displayRenderTexturesElement = null;
// Global options.
/** Default shader as first. */
let activeMaterialClassName = Object.keys(materials)[0];
/** Expression. */
let currentExpressionFlag = expressionFlagBlinking;
/** Controls if the animation sets blinking. updateCanBlink() */
let canBlink = false;

// // ---------------------------------------------------------------------
// //  Scene Setup
// // ---------------------------------------------------------------------

/**
 * Adds {@link THREE.AmbientLight} and {@link THREE.DirectionalLight} to
 * a scene, using values similar to what the FFLShader is using.
 * @param {import('three').Scene} scene - The scene to add lights to.
 * @todo TODO: Why does it look worse when WebGLRenderer.useLegacyLights is not enabled?
 */
function addLightsToScene(scene) {
	const intensity = Number(THREE.REVISION) >= 155 ? Math.PI : 1.0;
	const ambientLight = new THREE.AmbientLight(new THREE.Color(0.73, 0.73, 0.73), intensity);
	const directionalLight = new THREE.DirectionalLight(
		new THREE.Color(0.60, 0.60, 0.60), intensity);
	directionalLight.position.set(-0.455, 0.348, 0.5);
	scene.add(ambientLight, directionalLight);
}

/** @returns {import('three').Scene} The scene with lights added. */
function getSceneWithLights() {
	const scene = new THREE.Scene();
	addLightsToScene(scene);
	return scene;
}

/** Initializes the Three.js {@link renderer} instance. */
async function initializeThreeRenderer() {
	// renderer = new THREE.WebGPURenderer({
	renderer = new THREE.WebGLRenderer({
		alpha: true // Needed for icons with transparent backgrounds.
	});
	if (THREE.ColorManagement) {
		THREE.ColorManagement.enabled = false; // Ensures Color3s will be treated as sRGB.
	}
	renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // Makes shaders work in sRGB

	// Call renderer.init in case it is WebGPURenderer.
	if (renderer['init'] !== undefined) {
		await /** @type {*} */ (renderer).init();
	}

	isRendererInitialized = true;
}

/**
 * Initializes the Three.js scene, renderer, camera, lights, and OrbitControls.
 * Called only the first time the button is clicked.
 */
async function initializeScene() {
	// Create scene.
	scene = new THREE.Scene();

	addLightsToScene(scene);

	const space = THREE.ColorManagement ? THREE.ColorManagement.workingColorSpace : '';
	scene.background = new THREE.Color().setHex(0xE6E6FA, space);

	// Create renderer now.
	renderer.setPixelRatio(window.devicePixelRatio);
	// 256 = height of #ffl-js-display-render-textures.
	renderer.setSize(window.innerWidth, window.innerHeight - 256);
	document.body.appendChild(renderer.domElement);

	// Create camera.
	camera = new THREE.PerspectiveCamera(15,
		window.innerWidth / (window.innerHeight - 256), 1, 5000);
	// Note that faceline and mask are close, and
	// often you may run into Z-fighting if you
	// don't set near/far plane with care.
	camera.position.set(0, 10, 500);

	// Set up OrbitControls if it is loaded.
	if (typeof OrbitControls !== 'undefined') {
		const controlsOld = controls;
		controls = new OrbitControls(camera, renderer.domElement);
		// Initialize defaults.
		if (Object.keys(controlsOld).length) {
			for (const prop in controlsOld) {
				// Apply properties already set to controls.
				controls[prop] = controlsOld[prop];
			}
		} else {
			controls.autoRotateSpeed = 8; // Set default rotate speed.
		}
		controls.minDistance = 50;
		controls.maxDistance = 2000;
		controls.target.set(0, 20, 0);
	} else {
		console.warn('THREE.OrbitControls is undefined, continuing without controls.');
	}

	isSceneInitialized = true;
	console.log('initializeScene: Scene, renderer, camera created.');
}

/**
 * Starts the animation loop (only once). The loop updates the
 * CharModel and updates OrbitControls.
 */
function startAnimationLoop() {
	if (isAnimating) {
		return;
	}
	// Prevent multiple loops.
	isAnimating = true;
	// Blink state.
	let lastBlinkTime = Date.now();
	let isBlinking = false;
	// Expression parameters.
	/** FFL_EXPRESSION_WINK */
	const expressionBlink = 5;
	/** FFL_EXPRESSION_LIKE_WINK_LEFT */
	const expressionWink = 16;
	const winkChance = 0.25;

	/** 1.5s */
	const blinkInterval = 1500;
	/** 100ms */
	const blinkDuration = 100;

	/** Main animation loop. */
	function animate() {
		requestAnimationFrame(animate);

		// Update OrbitControls.
		if (controls.update) {
			controls.update();
		}

		// Reinitialize CharModel every frame for debugging if enabled.
		if (reinitModelEveryFrame) {
			updateCharModelInScene(null, currentExpressionFlag);
		}

		// Update blink state.
		if (currentCharModel && canBlink) {
			// Disable blinking if an exception happens.
			// try {
			const now = Date.now();
			// Blink
			if (!isBlinking && now - lastBlinkTime >= blinkInterval) {
				// Choose wink or blink by random chance.
				const expr = (Math.random() < winkChance)
					? expressionWink
					: expressionBlink;
				currentCharModel.setExpression(expr);
				isBlinking = true;
				lastBlinkTime = now;
			}
			// Unblink
			if (isBlinking && now - lastBlinkTime >= blinkDuration) {
				currentCharModel.setExpression(FFLExpression.NORMAL);
				isBlinking = false;
				lastBlinkTime = now;
			}
			// } catch (e) {
			// 	blinking = false;
			// 	console.warn('Disabled blinking.');
			// 	throw e;
			// }
		}

		renderer.render(scene, camera);
	}
	animate();
}

/**
 * Displays CharModel render textures, appending their images to `element` for debugging.
 * @param {CharModel} model - The CharModel whose textures to display.
 * @param {import('three').WebGLRenderer} renderer - The renderer.
 * @param {HTMLElement} element - The HTML list to append the images inside of.
 */
function displayCharModelTexturesDebug(model, renderer, element) {
	/** Limit before older textures are removed. */
	const maximum = 30;
	/**
	 * Displays and appends an image of a render target.
	 * @param {import('three').RenderTarget} target - The render target.
	 */
	function displayTarget(target) {
		const img = textureToCanvas(target.texture, renderer);

		if (element.firstChild) {
			// Prepend instead of appending if available.
			element.insertBefore(img, element.firstChild);
		} else {
			element.appendChild(img);
		}
		// Remove excess images in the list.
		while (element.children.length > maximum && element.lastChild) {
			element.removeChild(element.lastChild);
		}
	}
	const faceTarget = model.getFaceline();
	faceTarget && displayTarget(faceTarget);
	model._maskTargets.forEach(tgt => tgt !== null && displayTarget(tgt));
}

/**
 * Either creates or updates CharModel and adds it to the scene.
 * @param {Uint8Array|string|null} data - Data as Uint8Array or hex or Base64 string.
 * @param {Object|Array|number|null} [descOrExpFlag] - Either a new FFLCharModelDesc object or an array of expressions.
 * @param {boolean} [texOnly] - Whether to only update the mask and faceline textures in the CharModel.
 * @throws {Error} cannot exclude modelDesc if no model was initialized yet
 */
function updateCharModelInScene(data, descOrExpFlag = null, texOnly = false) {
	// Decode data.
	if (typeof data === 'string') {
		data = parseHexOrB64ToUint8Array(data);
	}
	const mat = materials[activeMaterialClassName];
	// Continue assuming it is Uint8Array.
	// If an existing CharModel exists, update it.
	try {
		if (currentCharModel) {
			// Remove current CharModel from the scene.
			currentCharModel.meshes && scene.remove(currentCharModel.meshes);
			// Update existing model via updateCharModel.
			// (will also dispose it for us)
			currentCharModel = updateCharModel(currentCharModel,
				data, renderer, descOrExpFlag, { texOnly });
		} else {
			// Create a new CharModel.
			if (!descOrExpFlag || !data) {
				throw new Error('cannot exclude modelDesc or data if no model was initialized yet');
			}
			currentCharModel = createCharModel(data, descOrExpFlag, mat, moduleFFL);
			// Initialize textures for the new CharModel.
			// This is explicitly called with FFLShaderMaterial, which
			// would be the material drawing only the mask/faceline textures.
			initCharModelTextures(currentCharModel, renderer, FFLShaderMaterial);
		}
		if (!currentCharModel.meshes) {
			throw new Error('updateCharModelInScene: currentCharModel.meshes is null or undefined after initialization');
		}
	} catch (err) {
		currentCharModel = null;
		alert(`Error creating/updating CharModel: ${err}`);
		console.error('Error creating/updating CharModel:', err);
		throw err;
	}

	// Display CharModel render textures if the element is non-null.
	if (displayRenderTexturesElement) {
		displayCharModelTexturesDebug(currentCharModel, renderer, displayRenderTexturesElement);
	}
	// Add CharModel meshes to scene.
	scene.add(currentCharModel.meshes);

	// Update states set by options.
	updateCharModelIcon();

	updateCanBlink();
	updateCharModelInfo();
	// TODO: Either have a default light direction
	// settable on the class, or store the set light
	// directions in a global then use updateLightDirection
	// which should now take direct XYZ values and set them here.
	resetLightDirection();

	// Specifically allow currentCharModel to be accessible on window.
	/** @type {*} */ (window).currentCharModel = currentCharModel;
}

// // ---------------------------------------------------------------------
// //  Light Direction
// // ---------------------------------------------------------------------

const lightDirXElement = /** @type {HTMLInputElement|null} */ (document.getElementById('lightDirX'));
const lightDirYElement = /** @type {HTMLInputElement|null} */ (document.getElementById('lightDirY'));
const lightDirZElement = /** @type {HTMLInputElement|null} */ (document.getElementById('lightDirZ'));

/**
 * Updates the light direction for all ShaderMaterials in the current CharModel.
 * Reads X, Y, Z values from range inputs and updates each material's lightDirection.
 * @param {boolean} [normalize] - Whether or not to normalize the light direction vector.
 * Sometimes the default light direction (like in LUTShaderMaterial) is not normalized
 * so when resetting, don't normalize, only normalize when setting from user input.
 */
function updateLightDirection(normalize = true) {
	// Get values from the three sliders.
	const x = parseFloat(lightDirXElement.value);
	const y = parseFloat(lightDirYElement.value);
	const z = parseFloat(lightDirZElement.value);
	// Normalize the user-provided light direction.
	let newDir = new THREE.Vector3(x, y, z);
	if (normalize) {
		newDir = newDir.normalize();
	}

	// Update lightDirection on each mesh that uses our shader.
	if (!currentCharModel || !currentCharModel.meshes) {
		return;
	}
	// currentCharModel.meshes.forEach((mesh) => {
	currentCharModel.meshes.traverse((mesh) => {
		// Make sure this mesh is non-null and has a compatible ShaderMaterial.
		if (mesh instanceof THREE.Mesh && mesh.material.lightDirection) {
			// Set the lightDirection on the material.
			mesh.material.lightDirection = newDir.clone();
		}
	});
}

const resetLightButtonElement = document.getElementById('resetLightButton');

/**
 * Resets the light direction of all ShaderMaterials in the current CharModel to the default.
 * The default is taken from the shader class's static property "defaultLightDirection".
 */
function resetLightDirection() {
	if (!currentCharModel || !currentCharModel.meshes) {
		return;
	}
	const mat = materials[activeMaterialClassName];
	// Make sure that the material has light direction before continuing.
	if (mat.defaultLightDirection === undefined) {
		return;
	}
	const defDir = mat.defaultLightDirection.clone();
	lightDirXElement.value = defDir.x;
	lightDirYElement.value = defDir.y;
	lightDirZElement.value = defDir.z;
	updateLightDirection(false); // Do not normalize default light direction.
	console.log('Light direction reset to default:', defDir);
}

// // ---------------------------------------------------------------------
// //  Shader Material Selection
// // ---------------------------------------------------------------------

const shaderMaterialSelectElement = /** @type {HTMLInputElement|null} */ (document.getElementById('shaderMaterialSelect'));

/**
 * Populates the shader selector (a <select> element)
 * with available shader material names from {@link materials}.
 */
function populateShaderSelector() {
	if (!shaderMaterialSelectElement || !materials) {
		return;
	}
	shaderMaterialSelectElement.innerHTML = ''; // clear any existing options
	Object.keys(materials).forEach((name) => {
		// Make sure that this really exists.
		if (materials[name] === undefined) {
			throw new Error(`Material class name ${name} is listed in materials but is undefined.`);
		}
		const opt = document.createElement('option');
		opt.value = name;
		opt.textContent = name;
		shaderMaterialSelectElement.appendChild(opt);
	});
}

/**
 * Called when the shader selector changes. Re-initializes the CharModel
 * materials using the new shader class, and resets the light direction.
 */
function onShaderMaterialChange() {
	activeMaterialClassName = shaderMaterialSelectElement.value;
	console.log(`Material class changed to: ${activeMaterialClassName}`);
	// For each mesh in the current CharModel, update its material:
	if (!currentCharModel || !currentCharModel.meshes) {
		return;
	}

	// Update _materialClass property used by updateCharModel.
	currentCharModel._materialClass = materials[activeMaterialClassName];

	/** Whether the new material supports FFL swizzling. */
	const forFFLMaterial = matSupportsFFL(materials[activeMaterialClassName]);
	/** Whether the model is currently using a material with FFL swizzling. */
	const isModelUsingFFLMaterial =
		'modulateMode' in /** @type {THREE.Mesh} */ (currentCharModel.meshes.children[0]).material;
	// In this case, the CharModel should be recreated.
	if (!forFFLMaterial && isModelUsingFFLMaterial) {
		console.log('Switching to non-FFL material from FFL material. Recreating CharModel.');
		updateCharModelInScene(null);
		// The work done in this function will already be done.
		return;
	}
	currentCharModel.meshes.traverse((mesh) => {
		if (!(mesh instanceof THREE.Mesh)) {
			return;
		}
		// Recreate material with same parameters but using the new shader class.
		const oldMat = mesh.material;
		/** Get modulateMode/Type */
		const userData = mesh.geometry.userData;

		/** Do not include the parameters if forFFLMaterial is false. */
		const modulateModeType = forFFLMaterial
			? {
				modulateMode: userData.modulateMode,
				modulateType: userData.modulateType // this setter sets side too
			}
			: {};

		const params = {
			// _side = original side from LUTShaderMaterial, must be set first
			side: (oldMat._side !== undefined) ? oldMat._side : oldMat.side,
			...modulateModeType,
			color: oldMat.color, // should be after modulateType
			map: oldMat.map,
			transparent: oldMat.transparent
		};

		mesh.material = new materials[activeMaterialClassName](params);
	});

	resetLightDirection(); // There is now a new light direction.
	// Update the icon to reflect the shader.
	updateCharModelIcon();
}

// // ---------------------------------------------------------------------
// //  Rotation, Expressions
// // ---------------------------------------------------------------------

let rotationEnabled = false;

const rotationSpeedElement = /** @type {HTMLInputElement|null} */ (document.getElementById('rotationSpeed'));

/** Updates the global rotation speed from the range input with id "rotationSpeed". */
function updateRotationSpeed() {
	controls.autoRotateSpeed = parseFloat(rotationSpeedElement.value);
}

const toggleRotationElement = document.getElementById('toggleRotation');

/** Toggles rotation on/off. */
function toggleRotation() {
	rotationEnabled = !rotationEnabled;
	controls.autoRotate = rotationEnabled;
	console.log(`Rotation ${rotationEnabled ? 'enabled' : 'paused'}`);
}

/**
 * Updates the canBlink variable to control if blinking cycle if enabled.
 * It checks the currentCharModel's expression flag to see if it is
 * equal to the one used for blinking.
 */
function updateCanBlink() {
	if (!currentCharModel) {
		return;
	}
	const flag = currentCharModel._model.charModelDesc.allExpressionFlag;
	// Compare expressionFlagBlinking to flag to see if they match.
	canBlink = expressionFlagBlinking.every((val, i) => val === flag[i]);
}

const expressionSelectElement = /** @type {HTMLInputElement|null} */ (document.getElementById('expressionSelect'));

/**
 * Updates the current expression on the CharModel based on the select element value.
 * If the selected value is -1, blinking mode is enabled; otherwise, blinking is disabled.
 */
function updateExpression() {
	const val = parseInt(expressionSelectElement.value, 10);
	// Set currentExpressionFlag global.
	if (val === -1) {
		// For value of -1, set as expressionFlagBlinking.
		currentExpressionFlag = expressionFlagBlinking;
		console.log('Expression set to normal blinking mode.');
	} else {
		currentExpressionFlag = makeExpressionFlag(val);
		console.log(`Expression fixed to ${val}.`);
	}
	if (currentCharModel) {
		/** Update CharModel textures if the old or new expression doesn't change shapes. */
		const texOnly = !(checkExpressionChangesShapes(val) ||
			checkExpressionChangesShapes(currentCharModel.expression));
		updateCharModelInScene(null, currentExpressionFlag, texOnly);
	}
}

// // ---------------------------------------------------------------------
// //  CharModel Render Textures Control
// // ---------------------------------------------------------------------

const renderTexturesDisplayElement = /** @type {HTMLDetailsElement|null} */ (document.getElementById('renderTexturesDisplay'));
const renderTexturesContainerElement = document.getElementById('ffl-js-display-render-textures');
const reinitModelElement = /** @type {HTMLInputElement|null} */ (document.getElementById('reinitModel'));

/** Toggle display of render textures for newly created CharModels. */
function toggleRenderTexturesDisplay() {
	if (renderTexturesDisplayElement.open) {
		// When opened, enable render texture display.
		displayRenderTexturesElement = renderTexturesContainerElement;
		console.log('Render texture view enabled.');
	} else {
		// When closed, disable render texture display and reinit checkbox
		displayRenderTexturesElement = null;
		reinitModelElement.checked = false;
		toggleReinitModel();
		// Clear the contents.
		renderTexturesContainerElement.innerHTML = '';
		console.log('Render texture view disabled.');
	}
}

/** Toggle the option to reinitialize the current CharModel every frame. */
function toggleReinitModel() {
	reinitModelEveryFrame = reinitModelElement.checked;
	console.log(`Reinitialize CharModel every frame: ${reinitModelElement.checked}`);
}

// // ---------------------------------------------------------------------
// //  CharModel Icon and Info Updates
// // ---------------------------------------------------------------------

const modelIconElement = /** @type {HTMLCanvasElement|null} */ (document.getElementById('modelIcon'));

/** Updates the icon beside the options for the current CharModel. */
function updateCharModelIcon() {
	// Skip if currentCharModel was not initialized properly.
	if (!currentCharModel || !modelIconElement) {
		return;
	}

	/**
	 * Asynchronously make the CharModel icon.
	 * @param {ViewType} [viewType] - The view type for the icon.
	 */
	(async (viewType = ViewType.MakeIcon) => {
		// Yield to the event loop, allowing the UI to update.
		await new Promise(resolve => setTimeout(resolve, 0));
		makeIconFromCharModel(currentCharModel, renderer,
			{ canvas: modelIconElement, viewType, scene: getSceneWithLights() });
	})();
}

const charModelNameElement = document.getElementById('charModelName');
const charModelFavoriteColorElement = document.getElementById('charModelFavoriteColor');

/** Updates the info section above the options for the current CharModel. */
function updateCharModelInfo() {
	// Skip if currentCharModel was not initialized properly.
	if (!currentCharModel || !currentCharModel._model) {
		return;
	}

	// Update name from CharInfo.
	let name = currentCharModel._model.charInfo.personal.name;
	if (name.length === 0) {
		// Make font bold when name is empty.
		charModelNameElement.style.fontWeight = 'bold';
		name = '(No Name)';
	} else {
		charModelNameElement.style = '';
	}
	charModelNameElement.textContent = name;

	// Update favorite color block
	const favColor = currentCharModel.favoriteColor;
	charModelFavoriteColorElement.style.backgroundColor = favColor.getStyle();
}

// // ---------------------------------------------------------------------
// //  Bind UI Control Handlers
// // ---------------------------------------------------------------------

/**
 * Adds event listeners to UI controls (rotation speed, pause rotation, light direction, shader, expression).
 */
function addUIControls() {
	// Rotation speed slider.
	rotationSpeedElement.addEventListener('input', updateRotationSpeed);
	// Toggle rotation checkbox.
	toggleRotationElement.addEventListener('change', toggleRotation);
	// Light direction sliders.
	[lightDirXElement, lightDirYElement, lightDirZElement].forEach((element) => {
		element.addEventListener('input', updateLightDirection);
	});
	// Reset light direction button.
	resetLightButtonElement.addEventListener('click', resetLightDirection);

	// Shader material selector.
	shaderMaterialSelectElement.addEventListener('change', onShaderMaterialChange);
	// Expression select list.
	expressionSelectElement.addEventListener('change', updateExpression);

	renderTexturesDisplayElement.addEventListener('toggle', toggleRenderTexturesDisplay);
	reinitModelElement.addEventListener('change', toggleReinitModel);
}

// // ---------------------------------------------------------------------
// //  Form Submission Handling
// // ---------------------------------------------------------------------

/** Typical default. */
const defaultTextureResolution = 512;
/**
 * Same as updateCharModelInScene, but also initializes scene and animation loop if needed.
 * @param {string} charData - CharModel data passed to updateCharModelInScene.
 */
function initAndUpdateScene(charData) {
	// First-time scene initialization.
	if (!isSceneInitialized) {
		initializeScene();
	}

	/** Define the CharModelDesc by cloning the default. */
	const modelDesc = Object.assign({}, FFLCharModelDescDefault);
	modelDesc.resolution = defaultTextureResolution;
	modelDesc.allExpressionFlag = currentExpressionFlag;

	// Create or update single CharModel in the scene.
	updateCharModelInScene(charData, modelDesc);

	// Start the animation loop if not already started.
	if (!isAnimating) {
		startAnimationLoop();
	}
}

/** Set up event handling for the CharModel submission form and other UI elements. */
function setupCharModelForm() {
	addUIControls(); // Set up UI controls.
	// Populate shader selector (assumes materials is defined).
	populateShaderSelector();

	// Assume a form with id "charform" exists in the HTML.
	const charFormElement = /** @type {HTMLFormElement|null} */ (document.getElementById('charForm'));
	const charDataInputElement = /** @type {HTMLInputElement|null} */ (document.getElementById('charData'));

	// -------------- Form Submission Handler ------------------
	charFormElement.addEventListener('submit', function (event) {
		event.preventDefault();

		// Read input from the form.
		if (!charDataInputElement || !charDataInputElement.value) {
			throw new Error('You need to input something into the CharModel form input.');
		}

		initAndUpdateScene(charDataInputElement.value);
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

	loadCharacterButtons(); // Load character buttons after initializing FFL.
}

/**
 * Main initialization method called on DOMContentLoaded.
 * Initializes the ResourceLoadHelper with our onLoad callback assigned
 * to {@link callInitializeFFL} and calls {@link setupCharModelForm}.
 */
async function main() {	// Initialize FFL.
	// await callInitializeFFL(window.ffljsResourceFetchResponse);
	// moduleFFL._FFLSetLinearGammaMode(1); // Use linear gamma colors in FFL.

	setupCharModelForm();
	// Container for the resource loader widget, if available.
	const resourceContainer = document.getElementById('resourceContainer') || document.body;
	const loader = new ResourceLoadHelper({
		container: resourceContainer,
		initialResource: null,
		onLoad: callInitializeFFL
	});
	loader.init(); // Initialize the resource loader to load the default resource.

	if (!isRendererInitialized) {
		await initializeThreeRenderer();
	}
}

// Call main when HTML is done loading.
document.addEventListener('DOMContentLoaded', main);

// // ---------------------------------------------------------------------
// //  Preset Character Button Handling
// // ---------------------------------------------------------------------

/** Creates buttons and icons for the `preset-character-selection` list. */
function loadCharacterButtons() {
	/**
	 * Asynchronously makes a CharModel icon.
	 * @param {HTMLCanvasElement} el - The image element to set `src` of.
	 * @param {string} data - Data for the CharModel in a hex or Base64 string.
	 * @param {ViewType} viewType - The view type for the icon.
	 */
	async function setIcon(el, data, viewType = ViewType.IconFovy45) {
		// Yield to the event loop, allowing the UI to update.
		await new Promise(resolve => setTimeout(resolve, 0));
		// Render the icon using createCharModelIcon.
		let model;
		try {
			const dataU8 = parseHexOrB64ToUint8Array(data);
			model = createCharModel(dataU8, null, materials[activeMaterialClassName], moduleFFL);
			initCharModelTextures(model, renderer, FFLShaderMaterial);

			makeIconFromCharModel(model, renderer, {
				canvas: el, viewType, scene: getSceneWithLights()
			});
		} catch (e) {
			console.error(`loadCharacterButtons: Could not make icon for ${data}: ${e}`);
		} finally {
			if (model) {
				model.dispose();
			}
		}
	}

	const btnTemplateElement = document.getElementById('btn-template');
	const elements = document.querySelectorAll('[data-name][data-data]');
	elements.forEach((el) => {
		const clone = /** @type {HTMLButtonElement} */ (btnTemplateElement.cloneNode(true));
		clone.style.display = '';
		clone.removeAttribute('id');

		const btn = /** @type {HTMLButtonElement} */ (clone.querySelector('button'));
		btn.removeAttribute('disabled');
		btn.addEventListener('click', onPresetCharacterClick);
		const img = /** @type {HTMLCanvasElement|null} */ (btn.querySelector('.image'));
		const name = btn.querySelector('div.name');

		const dataData = el.getAttribute('data-data') || '';
		const data = el.getAttribute('data-data-icon') || dataData;
		if (img) {
			setIcon(img, data);
		} else {
			console.warn('setIcon > elements.forEach...: button.querySelector(img) returned null');
		}

		btn.setAttribute('data-data', dataData);
		if (name) {
			name.textContent = el.getAttribute('data-name');
		}

		el.replaceWith(clone);
	});
}

// TODO: NULL CHECK
// * expressionSelectElement
// * lightDir{X,Y,Z}Element
// * shaderMaterialSelectElement
// * rotationSpeedElement
// * expressionSelectElement
// * renderTexturesDisplayElement
// * reinitModelElement
// * charModelNameElement
// * charModelFavoriteColorElement
// * rotationSpeedElement
// * resetLightButtonElement
// * shaderMaterialSelectElement
// * expressionSelectElement
// * charFormElement

/**
 * Event listener for clicking a preset character button.
 * @param {Event} event - The click event.
 */
function onPresetCharacterClick(event) {
	event.preventDefault();
	const data = /** @type {HTMLButtonElement} */ (event.currentTarget).getAttribute('data-data');
	console.log('Preset character data clicked, data: ', data);
	if (data) {
		initAndUpdateScene(data);
	}
}

// // ---------------------------------------------------------------------
// //  JSDoc Generation Functions for ffl.js Structures
// // ---------------------------------------------------------------------

/**
 * Generate JSDoc typedef from an object, supporting nested types up to depth 5.
 * Ignores keys starting with "_".
 * @param {Object<string, *>} obj - The object to analyze.
 * @param {string} [typeName] - The name of the type.
 * @param {number} [depth] - Current recursion depth (default: 0).
 * @param {Set<string>} [definedTypes] - Tracks already defined types to avoid duplicates.
 * @returns {string} JSDoc typedef output.
 */
function generateJSDoc(obj, typeName = 'GeneratedType', depth = 0, definedTypes = new Set()) {
	// Stop at max depth 5.
	if (depth > 5) {
		return '';
	}

	let text = `/**\n * @typedef {Object} ${typeName}\n`;
	let nestedDefinitions = '';

	Object.keys(obj).forEach((key) => {
		// Ignore private keys beginning with underscore.
		if (key.startsWith('_')) {
			// Ignore private keys beginning with underscore.
			return;
		}

		const value = obj[key];
		const valueType = typeof value;
		let propType;

		if (value === null) {
			propType = 'null';
		} else if (Array.isArray(value)) {
			/** Assume first element type. */
			let arrayType = '*';
			if (value.length > 0) {
				const firstElem = value[0];
				if (typeof firstElem === 'object' && firstElem !== null) {
					const subType = `${typeName}_${key}_Item`;
					if (!definedTypes.has(subType)) {
						nestedDefinitions += generateJSDoc(firstElem, subType, depth + 1, definedTypes) + '\n';
						definedTypes.add(subType);
					}
					arrayType = subType;
				} else {
					arrayType = typeof firstElem;
				}
			}
			propType = `Array<${arrayType}>`;
		} else if (valueType === 'object') {
			const subType = `${typeName}_${key}`;
			if (!definedTypes.has(subType)) {
				nestedDefinitions += generateJSDoc(value, subType, depth + 1, definedTypes) + '\n';
				definedTypes.add(subType);
			}
			propType = subType;
		} else {
			propType = valueType;
		}

		text += ` * @property {${propType}} ${key}\n`;
	});

	text += ' */';
	return nestedDefinitions + text;
}

/**
 * Generates JSDoc, calling {@link generateJSDoc}, from the name
 * of a type defined as a struct-fu struct.
 * The result will be logged to console.
 * @param {import('../struct-fu').StructInstance<*>} structInstance - Result of _.struct for the type.
 * @param {string} [typeName] - Name of the type.
 * @returns {string} The JSDoc typedef with type name set to just "type".
 * @throws {Error} typeName must be a string
 */
function generateJSDocStructFu(structInstance, typeName = 'type') {
	const empty = new Uint8Array(structInstance.size);
	/** Object containing all struct fields. */
	const obj = structInstance.unpack(empty);
	return generateJSDoc(obj, typeName);
}

/** @type {*} */ (window).generateJSDoc = generateJSDoc;
/** @type {*} */ (window).generateJSDocStructFu = generateJSDocStructFu;
