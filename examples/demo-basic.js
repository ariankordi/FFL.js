// @ts-check

import * as THREE from 'three';
// import SPECTOR from 'https://cdn.jsdelivr.net/npm/spectorjs@0.9.30/+esm';
// globalThis.spector = new SPECTOR.Spector();
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
	FFL, CharModel, FFLCharModelDescDefault, matSupportsFFL,
	makeExpressionFlag, checkExpressionChangesShapes,
	ModelIcon, FFLExpression
} from '../ffl.js';
// import * as ModuleFFLImport from '../ffl-emscripten.cjs'; // Build with EXPORT_ES6 to not be UMD.
// Material classes.
import FFLShaderMaterial from '../materials/FFLShaderMaterial.js';
import LUTShaderMaterial from '../materials/LUTShaderMaterial.js';
import SampleShaderMaterial from '../materials/SampleShaderMaterial.js';
// import FFLShaderNodeMaterial from '../materials/FFLShaderNodeMaterial.js'; // For WebGPURenderer only.
// Helpers.
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
/** @type {THREE.WebGLRenderer|import('three/webgpu').Renderer} */
let renderer;
/** @type {THREE.Camera} */
let camera;
/** @type {import('three/addons/controls/OrbitControls.js').OrbitControls} */
let controls;
/** @type {CharModel|null} */
let currentCharModel;
/** @type {Promise<void>} */
let initializeRendererPromise;
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
	 * @param {THREE.ShaderMaterialParameters
	 * & import('../materials/FFLShaderMaterial.js').FFLShaderMaterialParameters} [options] -
	 * Parameters for the material.
	 */
	constructor(options = {}) {
		options = Object.assign({
			useSpecularModeBlinn: true
		}, options);
		super(options); // Construct the extended class.

		if (this.uniforms && this.uniforms.u_material_specular_power) {
			// Adjust specular power, which is the reflection point, to be larger.
			/** @type {THREE.ShaderMaterial} */ (this)
				.uniforms.u_material_specular_power = { value: 2 };
		}
	}
}

/**
 * Global object for storing all available material classes.
 * @type {Object<string, function(new: THREE.Material, ...*): THREE.Material>}
 */
const materials = {
	// from ffl.js
	FFLShaderMaterial, FFLShaderBlinnMaterial,
	LUTShaderMaterial, SampleShaderMaterial,
	// Three.js default shader materials
	MeshStandardMaterial: THREE.MeshStandardMaterial, // same as Standard/Lambert/Physical?
	MeshBasicMaterial: THREE.MeshBasicMaterial, // no lighting
	MeshPhongMaterial: THREE.MeshPhongMaterial
};

// WebGPU support is optional since three.module.js
// and three.webgpu.js aren't fully compatible.
// The hack below replaces FFLShaderMaterial with the WebGPU version if imported.
if ('WebGPURenderer' in THREE) {
	/* eslint-disable no-undef -- Only imported for WebGPU. */
	materials.FFLShaderMaterial =
		/** @type {typeof import('../materials/FFLShaderNodeMaterial.js').default} */
		// @ts-ignore -- Not defined by default.
		(FFLShaderNodeMaterial);
	/* eslint-enable no-undef -- Re-enable */
}

/** Expression flag with default expression, blink, FFL_EXPRESSION_LIKE_WINK_LEFT */
const expressionBlinking = [FFLExpression.NORMAL,
	FFLExpression.BLINK, FFLExpression.LIKE_WINK_LEFT];

// For debugging.
let reinitModelEveryFrame = false;
/** @type {HTMLElement|null} */
let displayRenderTexturesElement = null;
// Global options.
/** Default shader as first. */
let activeMaterialClassName = Object.keys(materials)[0];
/** Expression. */
let currentExpressionFlag = makeExpressionFlag(expressionBlinking);
/** Controls if the animation sets blinking. updateCanBlink() */
let canBlink = false;

// // ---------------------------------------------------------------------
// //  Scene Setup
// // ---------------------------------------------------------------------

/**
 * Adds {@link THREE.AmbientLight} and {@link THREE.DirectionalLight} to
 * a scene, using values similar to what the FFLShader is using.
 * @param {THREE.Scene} scene - The scene to add lights to.
 * @todo TODO: Why does it look worse when WebGLRenderer.useLegacyLights is not enabled?
 */
function addLightsToScene(scene) {
	const intensity = Number(THREE.REVISION) >= 155 ? Math.PI : 1;
	const ambientLight = new THREE.AmbientLight(new THREE.Color(0.73, 0.73, 0.73), intensity);
	const directionalLight = new THREE.DirectionalLight(
		new THREE.Color(0.6, 0.6, 0.6), intensity);
	directionalLight.position.set(-0.455, 0.348, 0.5);
	scene.add(ambientLight, directionalLight);
}

/** @returns {THREE.Scene} The scene with lights added. */
function getSceneWithLights() {
	const scene = new THREE.Scene();
	addLightsToScene(scene);
	return scene;
}

/** Initializes the Three.js {@link renderer} instance. */
async function initializeThreeRenderer() {
	if ('WebGPURenderer' in THREE) {
		console.info('Using THREE.WebGPURenderer.');
		renderer = new /** @type {typeof import('three/webgpu').WebGPURenderer} */
		// eslint-disable-next-line import-x/namespace -- We check if this exists.
		(THREE.WebGPURenderer)({ alpha: true });
	} else {
		// Uncomment the canvas/context lines to test WebGL 1.0.
		// const canvas = document.createElement('canvas');
		renderer = new THREE.WebGLRenderer({
			// canvas, context: canvas.getContext('webgl'),
			alpha: true // Needed for icons with transparent backgrounds.
		});
	}
	if (THREE.ColorManagement) {
		THREE.ColorManagement.enabled = false; // Ensures Color3s will be treated as sRGB.
	}
	renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // Makes shaders work in sRGB

	// Call renderer.init in case it is WebGPURenderer.
	('init' in renderer) && await renderer.init();

	// @ts-expect-error -- ignore, spector will be called if it is imported
	globalThis.spector?.displayUI();
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
	document.body.append(renderer.domElement);

	// Create camera.
	camera = new THREE.PerspectiveCamera(15,
		window.innerWidth / (window.innerHeight - 256), 1, 5000);
	// Note that faceline and mask are close, and
	// often you may run into Z-fighting if you
	// don't set near/far plane with care.
	camera.position.set(0, 10, 500);

	// eslint-disable-next-line unicorn/no-typeof-undefined -- Only this expression works.
	if (typeof OrbitControls === 'undefined') {
		// Don't use OrbitControls if not imported.
		console.warn('THREE.OrbitControls is undefined, continuing without controls.');
	} else {
		// Set up OrbitControls if it is loaded.
		controls = new OrbitControls(camera, renderer.domElement);
		controls.autoRotateSpeed = 8; // Set default rotate speed.
		controls.minDistance = 50;
		controls.maxDistance = 2000;
		controls.target.set(0, 20, 0);
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

	/**
	 * Main animation loop.
	 * @throws {Error} Rethrows exceptions when setting expression.
	 */
	function animate() {
		requestAnimationFrame(animate);

		// Optionally update OrbitControls.
		controls && controls.update();

		// Reinitialize CharModel every frame for debugging if enabled.
		if (reinitModelEveryFrame) {
			updateCharModelInScene(null, currentExpressionFlag);
		}

		// Update blink state.
		if (currentCharModel && canBlink) {
			// Disable blinking if an exception happens.
			try {
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
			} catch (e) {
				canBlink = false;
				console.warn('Disabled blinking due to an error.');
				throw e; // usually ExpressionNotSet
			}
		}

		renderer.render(scene, camera);
	}
	animate();
}

/**
 * Displays CharModel render textures, appending their images to `element` for debugging.
 * @param {CharModel} model - The CharModel whose textures to display.
 * @param {THREE.WebGLRenderer|import('three/webgpu').Renderer} renderer - The renderer.
 * @param {HTMLElement} element - The HTML list to append the images inside of.
 */
function displayCharModelTexturesDebug(model, renderer, element) {
	/** Limit before older textures are removed. */
	const maximum = 30;
	/**
	 * Displays and appends an image of a render target.
	 * @param {THREE.RenderTarget} target - The render target.
	 */
	function displayTarget(target) {
		const img = ModelIcon.textureToCanvas(target.texture, renderer);

		if (element.firstChild) {
			// Prepend instead of appending if available.
			element.insertBefore(img, element.firstChild);
		} else {
			element.append(img);
		}
		// Remove excess images in the list.
		while (element.children.length > maximum && element.lastChild) {
			element.lastChild.remove();
		}
	}
	const faceTarget = model.getFaceline();
	faceTarget && displayTarget(faceTarget);
	// for (let i = 0; i < FFLExpression.MAX; i++) {
	for (const tgt of model._maskTargets) {
		// const tgt = model.getMask(i);
		// While _maskTargets is public, looking here
		// makes sure that the RGBA textures added
		// in convModelTexturesToRGBA are also included.
		tgt !== null && displayTarget(tgt);
	}
}

/**
 * If the input material supports drawing textures, this function
 * will either return it, otherwise it will return the default texture material.
 * @param {import('../ffl.js').MaterialConstructor} mat - The input material.
 * @returns {import('../ffl.js').MaterialConstructor} The material that supports textures.
 */
function getTextureMaterial(mat) {
	return matSupportsFFL(mat)
		? mat
		: materials.FFLShaderMaterial;
}

/**
 * Either creates or updates CharModel and adds it to the scene.
 * @param {Uint8Array|string|null} data - Data as Uint8Array or hex or Base64 string.
 * @param {import('../ffl.js').CharModelDescOrExpressionFlag} [descOrExpFlag] -
 * Either a new FFLCharModelDesc object or an array of expressions.
 * @param {boolean} [texOnly] - Whether to only update the mask and faceline textures in the CharModel.
 * @throws {Error} cannot exclude modelDesc if no model was initialized yet
 */
function updateCharModelInScene(data, descOrExpFlag, texOnly = false) {
	// Decode data.
	if (typeof data === 'string') {
		data = parseHexOrBase64ToBytes(data);
	}
	const mat = materials[activeMaterialClassName];
	// Continue assuming it is Uint8Array.
	// If an existing CharModel exists, update it.
	try {
		if (currentCharModel) {
			// Remove current CharModel from the scene.
			scene.remove(currentCharModel.meshes);
			// Update existing model via updateCharModel.
			// (will also dispose it for us)
			currentCharModel = CharModel.update(currentCharModel,
				data, renderer, descOrExpFlag, {
					texOnly, materialTextureClass: getTextureMaterial(mat)
				});
		} else {
			// Create a new CharModel.
			if (!descOrExpFlag || !data) {
				throw new Error('cannot exclude modelDesc or data if no model was initialized yet');
			}
			currentCharModel = new CharModel(ffl, data, descOrExpFlag, mat);
			// Initialize textures for the new CharModel.
			// This is explicitly called with FFLShaderMaterial, which
			// would be the material drawing only the mask/faceline textures.
			currentCharModel.initTextures(renderer, getTextureMaterial(mat));
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
	/** @type {*} */ (globalThis).currentCharModel = currentCharModel;
}

const requireElementById = (/** @type {string} */ id) => {
	const el = document.getElementById(id);
	if (!el) {
		const msg = `HTML element not found: ${id}`;
		alert(msg);
		throw new Error(msg);
	}
	return el;
};

// // ---------------------------------------------------------------------
// //  Light Direction
// // ---------------------------------------------------------------------

const lightDirXElement = /** @type {HTMLInputElement} */ (requireElementById('lightDirX'));
const lightDirYElement = /** @type {HTMLInputElement} */ (requireElementById('lightDirY'));
const lightDirZElement = /** @type {HTMLInputElement} */ (requireElementById('lightDirZ'));

/**
 * Updates the light direction for all ShaderMaterials in the current CharModel.
 * Reads X, Y, Z values from range inputs and updates each material's lightDirection.
 * @param {boolean} [normalize] - Whether or not to normalize the light direction vector.
 * Sometimes the default light direction (like in LUTShaderMaterial) is not normalized
 * so when resetting, don't normalize, only normalize when setting from user input.
 */
function updateLightDirection(normalize = true) {
	// Get values from the three sliders.
	const x = Number.parseFloat(lightDirXElement.value);
	const y = Number.parseFloat(lightDirYElement.value);
	const z = Number.parseFloat(lightDirZElement.value);
	// Normalize the user-provided light direction.
	let newDir = new THREE.Vector3(x, y, z);
	if (normalize) {
		newDir = newDir.normalize();
	}

	// Update lightDirection on each mesh that uses our shader.
	if (!currentCharModel) {
		return;
	}
	// currentCharModel.meshes.forEach((mesh) => {
	currentCharModel.meshes.traverse((mesh) => {
		// Make sure this mesh is non-null and has a compatible ShaderMaterial.
		if (mesh instanceof THREE.Mesh && 'lightDirection' in mesh.material) {
			// mesh.material.opacity = 0.1; // Test materials updating
			// Set the lightDirection on the material.
			mesh.material.lightDirection = newDir.clone();
		}
	});
}

const resetLightButtonElement = requireElementById('resetLightButton');

/**
 * Resets the light direction of all ShaderMaterials in the current CharModel to the default.
 * The default is taken from the shader class's static property "defaultLightDirection".
 */
function resetLightDirection() {
	if (!currentCharModel) {
		return;
	}
	const mat = materials[activeMaterialClassName];
	// Make sure that the material has light direction before continuing.
	if (!('defaultLightDirection' in mat)) {
		return;
	}
	const defDir = /** @type {typeof FFLShaderMaterial} */ (mat).defaultLightDirection.clone();
	lightDirXElement.value = defDir.x.toString();
	lightDirYElement.value = defDir.y.toString();
	lightDirZElement.value = defDir.z.toString();
	updateLightDirection(false); // Do not normalize default light direction.
	console.log('Light direction reset to default:', defDir);
}

// // ---------------------------------------------------------------------
// //  Shader Material Selection
// // ---------------------------------------------------------------------

const shaderMaterialSelectElement = /** @type {HTMLInputElement} */ (requireElementById('shaderMaterialSelect'));

/**
 * Populates the shader selector (a <select> element)
 * with available shader material names from {@link materials}.
 * @throws {Error} Throws if the material class is undefined.
 */
function populateShaderSelector() {
	if (!shaderMaterialSelectElement || !materials) {
		return;
	}
	shaderMaterialSelectElement.innerHTML = ''; // clear any existing options
	for (const name of Object.keys(materials)) {
		// Make sure that this really exists.
		if (materials[name] === undefined) {
			throw new Error(`Material class name ${name} is listed in materials but is undefined.`);
		}
		const opt = document.createElement('option');
		opt.value = name;
		opt.textContent = name;
		shaderMaterialSelectElement.append(opt);
	}
}

/**
 * Called when the shader selector changes. Re-initializes the CharModel
 * materials using the new shader class, and resets the light direction.
 */
function onShaderMaterialChange() {
	activeMaterialClassName = shaderMaterialSelectElement.value;
	console.log(`Material class changed to: ${activeMaterialClassName}`);
	// For each mesh in the current CharModel, update its material:
	if (!currentCharModel) {
		return;
	}

	const newMatClass = materials[activeMaterialClassName];
	const curMat = /** @type {THREE.Mesh} */ (currentCharModel.meshes.children[0]).material;
	// Update _materialClass property used by updateCharModel.
	currentCharModel._materialClass = newMatClass;

	/** Whether the new material supports FFL swizzling. */
	const forFFLMaterial = matSupportsFFL(newMatClass);

	const isSampleMaterial = (/** @type {Object} */ mat) => 'colorInfo' in mat;

	/** @returns {boolean} Whether textures should be re-rendered and CharModel should be recreated. */
	function shouldRecreateCharModel() {
		if (!forFFLMaterial && 'modulateMode' in curMat) {
			return true; // Current is FFL material, but new one isn't.
		}

		if (isSampleMaterial(curMat) !== isSampleMaterial(newMatClass.prototype)) {
			console.log('The new or old material is SampleShaderMaterial, but both aren\'t.');
			return true;
		}

		return false;
	}

	if (shouldRecreateCharModel()) {
		console.log('New material requires recreating CharModel.');
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

		/**
		 * Parameters for the shader material. Using SampleShaderMaterialParameters
		 * as a lowest common denominator, but others can also be used.
		 * @type {THREE.MeshBasicMaterialParameters
		 * & import('../materials/SampleShaderMaterial.js').SampleShaderMaterialParameters}
		 */
		const params = {
			// _side = original side from LUTShaderMaterial, must be set first
			side: (oldMat._side === undefined) ? oldMat.side : oldMat._side,
			...modulateModeType,
			color: oldMat.color, // should be after modulateType
			map: oldMat.map,
			transparent: oldMat.transparent
		};
		if (isSampleMaterial(newMatClass.prototype) && currentCharModel) {
			params.colorInfo = currentCharModel.getColorInfo();
		}

		mesh.material = new (materials[activeMaterialClassName])(params);
	});

	resetLightDirection(); // There is now a new light direction.
	// Update the icon to reflect the shader.
	updateCharModelIcon();
}

// // ---------------------------------------------------------------------
// //  Rotation, Expressions
// // ---------------------------------------------------------------------

let rotationEnabled = false;

const rotationSpeedElement = /** @type {HTMLInputElement} */ (requireElementById('rotationSpeed'));

/** Updates the global rotation speed from the range input with id "rotationSpeed". */
function updateRotationSpeed() {
	controls.autoRotateSpeed = Number.parseFloat(rotationSpeedElement.value);
}

const toggleRotationElement = requireElementById('toggleRotation');

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
	// Deep compare the array contents for the blinking expression option.
	canBlink = JSON.stringify(expressionBlinking) ===
		JSON.stringify([...currentCharModel.expressions]);
}

const expressionSelectElement = /** @type {HTMLInputElement} */ (requireElementById('expressionSelect'));

/**
 * Updates the current expression on the CharModel based on the select element value.
 * If the selected value is -1, blinking mode is enabled; otherwise, blinking is disabled.
 */
function updateExpression() {
	const val = Number.parseInt(expressionSelectElement.value, 10);
	// Set currentExpressionFlag global.
	if (val === -1) {
		// For value of -1, set as expressionFlagBlinking.
		currentExpressionFlag = makeExpressionFlag(expressionBlinking);
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

const renderTexturesDisplayElement = /** @type {HTMLDetailsElement} */ (requireElementById('renderTexturesDisplay'));
const renderTexturesContainerElement = requireElementById('ffl-js-display-render-textures');
const reinitModelElement = /** @type {HTMLInputElement} */ (requireElementById('reinitModel'));

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

const modelIconElement = /** @type {HTMLCanvasElement} */ (requireElementById('modelIcon'));

/** Updates the icon beside the options for the current CharModel. */
function updateCharModelIcon() {
	// Skip if currentCharModel was not initialized properly.
	if (!currentCharModel || !modelIconElement) {
		return;
	}

	/** Asynchronously make the CharModel icon. */
	(async () => {
		// Yield to the event loop, allowing the UI to update.
		await new Promise(resolve => setTimeout(resolve, 0));
		ModelIcon.create(currentCharModel, renderer,
			{ canvas: modelIconElement, scene: getSceneWithLights() });
	})();
}

const charModelNameElement = requireElementById('charModelName');
const charModelFavoriteColorElement = requireElementById('charModelFavoriteColor');

/** Updates the info section above the options for the current CharModel. */
function updateCharModelInfo() {
	// Skip if currentCharModel was not initialized properly.
	if (!currentCharModel) {
		return;
	}

	// Update name from CharInfo.
	let name = currentCharModel.charInfo.name;
	// Sometimes the name is actually null, in which
	// case it still has length? Let's check for char 0 = null
	if (!name.length || !name.charCodeAt(0)) {
		// Make font bold when name is empty.
		charModelNameElement.style.fontWeight = 'bold';
		name = '(No Name)';
	} else {
		charModelNameElement.style.fontWeight = '';
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
	for (const element of [lightDirXElement, lightDirYElement, lightDirZElement]) {
		element.addEventListener('input', () => updateLightDirection());
	}
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
	const charFormElement = /** @type {HTMLFormElement} */ (requireElementById('charForm'));
	const charDataInputElement = /** @type {HTMLInputElement} */ (requireElementById('charData'));

	// -------------- Form Submission Handler ------------------
	charFormElement.addEventListener('submit', (event) => {
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
	(ffl) && ffl.dispose(); // Frees the existing resource.
	// Initialize FFL with the resource.
	ffl = await FFL.initWithResource(resource, ffl?.module ?? ModuleFFL);

	// Run post-initialization tasks.
	await initializeRendererPromise; // Wait for renderer to be ready.
	ffl.setRenderer(renderer); // Tell FFL.js we are WebGL 1 or WebGPU.
	loadCharacterButtons(); // Make icons after renderer and FFL are ready.
}

/**
 * Main initialization method called on DOMContentLoaded.
 * Initializes the ResourceLoadHelper with our onLoad callback assigned
 * to {@link callInitializeFFL} and calls {@link setupCharModelForm}.
 */
async function main() {	// Initialize FFL.
	// await callInitializeFFL(window.ffljsResourceFetchResponse);
	// ffl.module._FFLSetLinearGammaMode(1); // Use linear gamma colors in FFL.

	setupCharModelForm();
	initializeRendererPromise = initializeThreeRenderer();
	// let initFFLPromise = /** @type {Promise<void>|null} */ (null);
	// Container for the resource loader widget, if available.
	const resourceContainer = document.getElementById('resourceContainer') || document.body;
	const loader = new ResourceLoadHelper({
		container: resourceContainer,
		initialResource: null,
		onLoad: callInitializeFFL // r => initFFLPromise = callInitializeFFL(r)
	});
	await loader.init(); // Initialize the resource loader to load the default resource.
	// console.info('set initFFLPromise:', initFFLPromise);
}

// Call main when HTML is done loading.
document.addEventListener('DOMContentLoaded', main);

// // ---------------------------------------------------------------------
// //  Preset Character Button Handling
// // ---------------------------------------------------------------------

/** Creates buttons and icons for the `preset-character-selection` list. */
function loadCharacterButtons() {
	/** Create a custom camera with 45 degrees FOV. */
	const camera = new THREE.PerspectiveCamera(45, 1, 50, 1000);
	camera.position.set(0, 34, 110);

	/**
	 * Asynchronously makes a CharModel icon.
	 * @param {HTMLCanvasElement} el - The image element to set `src` of.
	 * @param {string} data - Data for the CharModel in a hex or Base64 string.
	 */
	async function setIcon(el, data) {
		// Yield to the event loop, allowing the UI to update.
		await new Promise(resolve => setTimeout(resolve, 0));
		// Render the icon using createCharModelIcon.
		let model;
		try {
			const dataU8 = parseHexOrBase64ToBytes(data);
			model = new CharModel(ffl, dataU8, null, materials[activeMaterialClassName]);
			model.initTextures(renderer,
				getTextureMaterial(materials[activeMaterialClassName]));

			ModelIcon.create(model, renderer, {
				canvas: el, camera, scene: getSceneWithLights()
			});
		} catch (e) {
			console.error(`loadCharacterButtons: Could not make icon for ${data}: ${e}`);
		} finally {
			if (model) {
				model.dispose();
			}
		}
	}

	const btnTemplateElement = requireElementById('btn-template');
	const elements = document.querySelectorAll('[data-name][data-data]');
	for (const el of elements) {
		const clone = /** @type {HTMLButtonElement} */ (btnTemplateElement.cloneNode(true));
		clone.style.display = '';
		clone.removeAttribute('id');

		const btn = /** @type {HTMLButtonElement} */ (clone.querySelector('button'));
		btn.removeAttribute('disabled');
		btn.addEventListener('click', onPresetCharacterClick);
		const img = /** @type {HTMLCanvasElement|null} */ (btn.querySelector('.image'));
		const name = btn.querySelector('div.name');

		const dataset = /** @type {HTMLElement} */ (el).dataset;
		const dataData = dataset.data || '';
		const data = dataset.dataIcon || dataData;
		if (img) {
			setIcon(img, data);
		} else {
			console.warn('setIcon > elements.forEach...: button.querySelector(img) returned null');
		}

		btn.dataset.data = dataData;
		if (name && dataset.name) {
			name.textContent = dataset.name;
		}

		el.replaceWith(clone);
	}

	if (location.hostname === 'localhost') {
		// Reveal the "ugly only for test" characters during local dev.
		/** @type {HTMLDetailsElement} */ (requireElementById('char-for-test')).open = true;
	}
}

/**
 * Event listener for clicking a preset character button.
 * @param {MouseEvent} event - The click event.
 */
function onPresetCharacterClick(event) {
	event.preventDefault();
	const data = /** @type {HTMLButtonElement} */ (event.currentTarget).dataset.data;
	console.log('Preset character data clicked, data:', data);
	if (data) {
		initAndUpdateScene(data);
	}
}
