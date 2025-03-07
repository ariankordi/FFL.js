// @ts-check
// import * as THREE from 'three';
// import { initializeFFL, createCharModel, initCharModelTextures, updateCharModel, makeExpressionFlag, parseHexOrB64ToUint8Array, FFLExpression, FFLCharModelDescDefault, FFLCharModelDesc, CharModel, Module } from './ffl';

// --------------- Main Entrypoint (Scene & Animation) -----------------

/**
 * Emscripten module instance returned after initialization.
 * @type {Module}
 */
let moduleFFL;

// Global variables for the main scene, renderer, camera, controls, etc.
/** @type {THREE.Scene} */
let scene;
/** @type {THREE.WebGLRenderer} */
let renderer;
/** @type {THREE.Camera} */
let camera;
/** @type {THREE.OrbitControls|Object} */
let controls = {}; // Initialize to empty so properties can be set.
/** @type {CharModel} */
let currentCharModel;
let isInitialized = false;
// window.isInitialized = false;
let isAnimating = false;

// Available shader materials.
const availableMaterialClasses = ['FFLShaderMaterial', 'LUTShaderMaterial'];
// Expression flag with default expression, blink, FFL_EXPRESSION_LIKE_WINK_LEFT
const expressionFlagBlinking = makeExpressionFlag([FFLExpression.NORMAL, 5, 16]);

// For debugging.
let reinitModelEveryFrame = false;
let displayRenderTexturesElement = null;
// Global options.
let activeMaterialClassName = availableMaterialClasses[0]; // Default shader as first.
let currentExpressionFlag = expressionFlagBlinking; // Expression.
let canBlink = false; // Controls if the animation sets blinking. updateCanBlink()

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

	renderer.setPixelRatio(window.devicePixelRatio);
	// 256 = height of #ffl-js-display-render-textures.
	renderer.setSize(window.innerWidth, window.innerHeight - 256);
	document.body.appendChild(renderer.domElement);

	// Create camera.
	camera = new THREE.PerspectiveCamera(15, window.innerWidth / (window.innerHeight - 256), 1, 5000);
	// Note that faceline and mask are close, and
	// often you may run into Z-fighting if you
	// don't set near/far plane with care.
	camera.position.set(0, 10, 500);

	// Set up OrbitControls if it is loaded.
	if (THREE.OrbitControls !== undefined) {
		const controlsOld = controls;
		controls = new THREE.OrbitControls(camera, renderer.domElement);
		// Initialize defaults.
		if (Object.keys(controlsOld).length) {
			for (prop in controlsOld) {
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

	isInitialized = true;
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
	const expressionBlink = 5; // FFL_EXPRESSION_WINK
	const expressionWink = 16; // FFL_EXPRESSION_LIKE_WINK_LEFT
	const winkChance = 0.25;

	const blinkInterval = 1500; // 1.5s
	const blinkDuration = 100; // 100ms

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
 * @param {THREE.WebGLRenderer} renderer - The renderer.
 * @param {HTMLElement} element - The HTML list to append the images inside of.
 */
function displayCharModelTexturesDebug(model, renderer, element) {
	const maximum = 30; // Limit before older textures are removed.
	/**
	 * Displays and appends an image of a render target.
	 * @param {THREE.WebGLRenderTarget} target - The render target.
	 */
	function displayTarget(target) {
		const dataURL = renderTargetToDataURL(target, renderer, true);
		const img = new Image();
		img.src = dataURL;
		if (element.firstChild) {
			// Prepend instead of appending if available.
			element.insertBefore(img, element.firstChild);
		} else {
			element.appendChild(img);
		}
		// Remove excess images in the list.
		while (element.children.length > maximum) {
			element.removeChild(element.lastChild);
		}
	}
	const faceTarget = model.getFaceline();
	faceTarget && displayTarget(faceTarget);
	model._maskTargets.forEach(tgt => tgt !== null && displayTarget(tgt));
}

/**
 * Either creates or updates CharModel and adds it to the scene.
 * @param {Uint8Array|string} data - Data as Uint8Array or hex or Base64 string.
 * @param {Object|Array|null} descOrExpFlag - Either a new FFLCharModelDesc object or an array of expressions.
 * @throws {Error} cannot exclude modelDesc if no model was initialized yet
 */
function updateCharModelInScene(data, descOrExpFlag = null) {
	// Decode data.
	if (typeof data === 'string') {
		data = parseHexOrB64ToUint8Array(data);
	}
	const mat = window[activeMaterialClassName];
	// Continue assuming it is Uint8Array.
	// If an existing CharModel exists, update it.
	try {
		if (currentCharModel) {
			// Remove current CharModel from the scene.
			scene.remove(currentCharModel.meshes);
			// Update existing model via updateCharModel.
			// (will also dispose it for us)
			currentCharModel = updateCharModel(currentCharModel, data, renderer, descOrExpFlag);
		} else {
			// Create a new CharModel.
			if (!descOrExpFlag) {
				throw new Error('cannot exclude modelDesc if no model was initialized yet');
			}
			currentCharModel = createCharModel(data, descOrExpFlag, mat, moduleFFL);
			// Initialize textures for the new CharModel.
			initCharModelTextures(currentCharModel, renderer);
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
	const mat = window[activeMaterialClassName];
	// Make sure that the material has light direction before continuing.
	if (!mat.defaultLightDirection) {
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
 * with available shader material names from availableMaterialClasses.
 */
function populateShaderSelector() {
	if (!shaderMaterialSelectElement || !availableMaterialClasses) {
		return;
	}
	shaderMaterialSelectElement.innerHTML = ''; // clear any existing options
	availableMaterialClasses.forEach((name) => {
		// Make sure that this really exists in window.
		if (window[activeMaterialClassName] === undefined) {
			throw new Error(`Material class name ${name} is listed in availableMaterialClasses but cannot be found in window.`);
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
	// Update _materialClass property that updating CharModels will use.
	currentCharModel._materialClass = window[activeMaterialClassName];
	currentCharModel.meshes.traverse((mesh) => {
		if (!(mesh instanceof THREE.Mesh)) {
			return;
		}
		// Recreate material with same parameters but using the new shader class.
		const oldMat = mesh.material;
		const userData = mesh.geometry.userData; // Get modulateMode/Type
		// Create new material (assumes the new shader is accessible via window).

		const params = {
			// _side = original side from LUTShaderMaterial, must be set first
			side: (oldMat._side !== undefined) ? oldMat._side : oldMat.side,
			modulateMode: userData.modulateMode,
			modulateType: userData.modulateType, // this setter sets side too
			color: oldMat.color, // should be after modulateType
			map: oldMat.map,
			transparent: oldMat.transparent
		};
		mesh.material = new window[activeMaterialClassName](params);
	});

	resetLightDirection(); // There is now a new light direction.
	// Update the icon to reflect the shader.
	updateCharModelIcon();
}

// // ---------------------------------------------------------------------
// //  Rotation, Expressions
// // ---------------------------------------------------------------------

let rotationEnabled = false;

const rotationSpeedElement = /** @type {HTMLInputElement|null} */ (document.getElementById)('rotationSpeed');

/**
 * Updates the global rotation speed from the range input with id "rotationSpeed".
 */
function updateRotationSpeed() {
	controls.autoRotateSpeed = parseFloat(rotationSpeedElement.value);
}

const toggleRotationElement = document.getElementById('toggleRotation');

/**
 * Toggles rotation on/off.
 */
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
		updateCharModelInScene(null, currentExpressionFlag);
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

const modelIconElement = /** @type {HTMLImageElement|null} */ (document.getElementById('modelIcon'));

/**
 * Updates the icon beside the options for the current CharModel.
 */
function updateCharModelIcon() {
	// Skip if currentCharModel was not initialized properly.
	if (!currentCharModel) {
		return;
	}

	/**
	 * Asynchronously makes a CharModel icon.
	 * @param {HTMLImageElement} img - The image to set `src` of.
	 * @param {ViewType} viewType - The view type for the icon.
	 */
	async function makeIcon(img, viewType = ViewType.MakeIcon) {
		// Yield to the event loop, allowing the UI to update.
		await new Promise(resolve => setTimeout(resolve, 0));
		const dataURL = createCharModelIcon(currentCharModel, renderer, viewType, 256, 256);
		img.src = dataURL;
	}

	makeIcon(modelIconElement);
}

const charModelNameElement = document.getElementById('charModelName');
const charModelFavoriteColorElement = document.getElementById('charModelFavoriteColor');

/**
 * Updates the info section above the options for the current CharModel.
 */
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

const defaultTextureResolution = 512; // Typical default.
/**
 * Same as updateCharModelInScene, but also initializes scene and animation loop if needed.
 * @param {string} charData - CharModel data passed to updateCharModelInScene.
 */
function initAndUpdateScene(charData) {
	// First-time scene initialization.
	if (!isInitialized) {
		initializeScene();
	}

	// Define the FFLCharModelDesc.
	const modelDesc = FFLCharModelDescDefault;
	modelDesc.resolution = defaultTextureResolution;
	modelDesc.allExpressionFlag = currentExpressionFlag;

	// Create or update single CharModel in the scene.
	updateCharModelInScene(charData, modelDesc);

	// Start the animation loop if not already started.
	if (!isAnimating) {
		startAnimationLoop();
	}
}

// Assume a form with id "charform" exists in the HTML.
const charFormElement = /** @type {HTMLFormElement|null} */ (document.getElementById('charForm'));
const charDataInputElement = /** @type {HTMLInputElement|null} */ (document.getElementById('charData'));

// -------------- Form Submission Handler ------------------
document.addEventListener('DOMContentLoaded', async function () {
	// Initialize FFL.
	const initResult = await initializeFFL(window.ffljsResourceFetchResponse, window.ModuleFFL);
	if (!initResult || !initResult.module) {
		throw new Error(`initializeFFLWithResource returned unexpected result: ${initResult}`);
	}
	// Set moduleFFL global from initialization result.
	moduleFFL = initResult.module;

	// Initialize FFL.
	// await initializeFFLWithResource(window.Module);

	// moduleFFL._FFLSetLinearGammaMode(1); // Use linear gamma colors in FFL.

	// Create renderer now.
	renderer = new THREE.WebGLRenderer({
		alpha: true // Needed for icons with transparent backgrounds.
	});

	loadCharacterButtons(); // Load character buttons.

	addUIControls(); // Set up UI controls.
	// Populate shader selector (assumes window.availableMaterialClasses is defined).
	populateShaderSelector();

	charFormElement.addEventListener('submit', function (event) {
		event.preventDefault();

		// Read input from the form.
		if (!charDataInputElement || !charDataInputElement.value) {
			throw new Error('need you to enter something in that there form...');
		}

		initAndUpdateScene(charDataInputElement.value);
	});
});

// // ---------------------------------------------------------------------
// //  Preset Character Button Handling
// // ---------------------------------------------------------------------

/**
 * Creates buttons and icons for the `preset-character-selection` list.
 * @param {boolean} useLocalIcon - Whether or not to create the icon locally with createCharModelIcon.
 */
function loadCharacterButtons(useLocalIcon = true) {
	/**
	 * Asynchronously makes a CharModel icon.
	 * @param {HTMLImageElement} img - The image to set `src` of.
	 * @param {string} data - Data for the CharModel in a hex or Base64 string.
	 * @param {ViewType} viewType - The view type for the icon.
	 */
	async function setIcon(img, data, viewType = ViewType.IconFovy45) {
		// Yield to the event loop, allowing the UI to update.
		await new Promise(resolve => setTimeout(resolve, 0));
		if (useLocalIcon) {
			// Render the icon using createCharModelIcon.
			let model;
			try {
				const dataU8 = parseHexOrB64ToUint8Array(data);
				model = createCharModel(dataU8, null, window[activeMaterialClassName], moduleFFL);
				initCharModelTextures(model, renderer);
				const dataURL = createCharModelIcon(model, renderer, viewType);
				img.src = dataURL;
			} catch (e) {
				console.error(`loadCharacterButtons: Could not make icon for ${data}: ${e}`);
			} finally {
				model.dispose();
			}
		} else {
			img.src = img.getAttribute('data-src') + encodeURIComponent(data);
		}
	}

	const btnTemplateElement = document.getElementById('btn-template');
	const elements = document.querySelectorAll('[data-name][data-data]');
	elements.forEach((el) => {
		const clone = btnTemplateElement.cloneNode(true);
		clone.style.display = '';
		clone.removeAttribute('id');

		const btn = clone.querySelector('button');
		btn.removeAttribute('disabled');
		btn.addEventListener('click', onPresetCharacterClick);
		const img = btn.querySelector('img');
		const div = btn.querySelector('div');

		const data = el.getAttribute('data-data-icon') || el.getAttribute('data-data');
		setIcon(img, data);

		btn.setAttribute('data-data', el.getAttribute('data-data'));
		div.textContent = el.getAttribute('data-name');

		el.replaceWith(clone);
	});
}

/**
 * Event listener for clicking a preset character button.
 * @param {Event} event - The click event.
 */
function onPresetCharacterClick(event) {
	event.preventDefault();
	const data = /** @type {HTMLButtonElement} */ (event.currentTarget).getAttribute('data-data');
	console.log('Preset character data clicked: ', data);

	initAndUpdateScene(data);
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
			let arrayType = '*'; // Assume first element type.
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
 * @param {_.StructInstance<*>} structInstance - Result of _.struct for the type.
 * @param {string} [typeName] - Name of the type.
 * @returns {string} The JSDoc typedef with type name set to just "type".
 * @throws {Error} typeName must be a string
 */
function generateJSDocStructFu(structInstance, typeName = 'type') {
	const empty = new Uint8Array(structInstance.size);
	const obj = structInstance.unpack(empty); // Object containing all struct fields.
	return generateJSDoc(obj, typeName);
}
