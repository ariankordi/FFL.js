// --------------- Main Entrypoint (Scene & Animation) -----------------

// Global variables for the main scene, renderer, camera, controls, etc.
/** @type {THREE.Scene} */
let scene = null;
/** @type {THREE.WebGLRenderer} */
let renderer = null;
/** @type {THREE.Camera} */
let camera = null;
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

// Global options.
let reinitTexturesEveryFrame = false; // For debugging.
// Set default shader to the first one.
let activeMaterialClassName = availableMaterialClasses[0];
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
	camera.position.set(0, 50, 500);

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

	function animate() {
		requestAnimationFrame(animate);

		// Update OrbitControls.
		if (controls.update) {
			controls.update();
		}

		// Reinitialize textures every frame for debugging if enabled.
		if (reinitTexturesEveryFrame) {
			currentCharModel._disposeTextures();
			initCharModelTextures(currentCharModel, renderer);
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
 * Either creates or updates CharModel and adds it to the scene.
 * @param {Uint8Array|string|null} data - Will be decoded if string.
 * @param {Object|Array|null} descOrExpFlag - Either a new FFLCharModelDesc object or an array of expressions.
 */
function updateCharModelInScene(data, descOrExpFlag = null) {
	// Decode data.
	if (typeof data === 'string') {
		data = parseHexOrB64ToUint8Array(data);
	}
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
			currentCharModel = createCharModel(data, descOrExpFlag, window[activeMaterialClassName], window.Module);
			// Initialize textures for the new CharModel.
			initCharModelTextures(currentCharModel, renderer);
		}
	} catch (err) {
		currentCharModel = null;
		alert(`Error creating/updating CharModel: ${err}`);
		console.error('Error creating/updating CharModel:', err);
		throw err;
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

const lightDirXElement = document.getElementById('lightDirX');
const lightDirYElement = document.getElementById('lightDirY');
const lightDirZElement = document.getElementById('lightDirZ');

/**
 * Updates the light direction for all ShaderMaterials in the current CharModel.
 * Reads X, Y, Z values from range inputs and updates each material's lightDirection.
 */
function updateLightDirection() {
	// Get values from the three sliders.
	const x = parseFloat(lightDirXElement.value);
	const y = parseFloat(lightDirYElement.value);
	const z = parseFloat(lightDirZElement.value);
	// Normalize the user-provided light direction.
	const newDir = new THREE.Vector3(x, y, z).normalize();

	// Update lightDirection on each mesh that uses our shader.
	if (!currentCharModel || !currentCharModel.meshes) {
		return;
	}
	// currentCharModel.meshes.forEach((mesh) => {
	currentCharModel.meshes.traverse((mesh) => {
		// Make sure this mesh is non-null and has a compatible ShaderMaterial.
		if (mesh && mesh.material && mesh.material.lightDirection) {
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
	const defDir = window[activeMaterialClassName].defaultLightDirection.clone();
	document.getElementById('lightDirX').value = defDir.x;
	document.getElementById('lightDirY').value = defDir.y;
	document.getElementById('lightDirZ').value = defDir.z;
	updateLightDirection();
	console.log('Light direction reset to default:', defDir);
}

// // ---------------------------------------------------------------------
// //  Shader Material Selection
// // ---------------------------------------------------------------------

const shaderMaterialSelectElement = document.getElementById('shaderMaterialSelect');

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
	if (currentCharModel && currentCharModel.meshes) {
		// Update _materialClass property that updating CharModels will use.
		currentCharModel._materialClass = window[activeMaterialClassName];
		currentCharModel.meshes.traverse((mesh) => {
			if (!mesh.isMesh) {
				return;
			}
			// Recreate material with same parameters but using the new shader class.
			const oldMat = mesh.material;
			// Create new material (assumes the new shader is accessible via window).
			const NewShader = window[activeMaterialClassName];

			const params = {
				modulateMode: oldMat.modulateMode,
				modulateType: oldMat.modulateType,
				modulateColor: oldMat.modulateColor,
				// _side = original side from LUTShaderMaterial
				side: (oldMat._side !== undefined) ? oldMat._side : oldMat.side,
				lightEnable: oldMat.lightEnable,
				map: oldMat.map
			};
			mesh.material = new NewShader(params);
		});

		resetLightDirection(); // There is now a new light direction.
		// Update the icon to reflect the shader.
		updateCharModelIcon();
	}
}

// // ---------------------------------------------------------------------
// //  Rotation, Expressions
// // ---------------------------------------------------------------------

let rotationEnabled = false;

const rotationSpeedElement = document.getElementById('rotationSpeed');

/**
 * Updates the global rotation speed from the range input with id "rotationSpeed".
 */
function updateRotationSpeed() {
	controls.autoRotateSpeed = parseFloat(document.getElementById('rotationSpeed').value);
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

const expressionSelectElement = document.getElementById('expressionSelect');

/**
 * Updates the current expression on the CharModel based on the select element value.
 * If the selected value is -1, blinking mode is enabled; otherwise, blinking is disabled.
 */
function updateExpression() {
	const exprSelect = document.getElementById('expressionSelect');
	const val = parseInt(exprSelect.value, 10);
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

const renderTexturesDisplayElement = document.getElementById('renderTexturesDisplay');
const renderTexturesContainerElement = document.getElementById('ffl-js-display-render-textures');
const reinitTexturesElement = document.getElementById('reinitTextures');

function toggleRenderTexturesDisplay() {
	if (renderTexturesDisplayElement.open) {
		// When opened, enable render texture display
		_displayRenderTexturesElement = renderTexturesContainerElement;
		console.log('Render texture view enabled.');
	} else {
		// When closed, disable render texture display and reinit checkbox
		_displayRenderTexturesElement = null;
		reinitTexturesElement.checked = false;
		toggleReinitTextures();
		// Clear the contents.
		renderTexturesContainerElement.innerHTML = '';
		console.log('Render texture view disabled.');
	}
}

function toggleReinitTextures() {
	reinitTexturesEveryFrame = reinitTexturesElement.checked;
	_noCharModelCleanupDebug = reinitTexturesEveryFrame;
	// Remake the same CharModel if it exists.
	if (currentCharModel) {
		updateCharModelInScene(null, currentExpressionFlag);
	}
	console.log(`Reinitialize textures every frame: ${reinitTexturesElement.checked}`);
}

// // ---------------------------------------------------------------------
// //  CharModel Icon and Info Updates
// // ---------------------------------------------------------------------

const modelIconElement = document.getElementById('modelIcon');

/**
 * Updates the icon beside the options for the current CharModel.
 */
function updateCharModelIcon() {
	// Skip if currentCharModel was not initialized properly.
	if (!currentCharModel) {
		return;
	}

	async function makeIcon(img, viewType = ViewType.MakeIcon) {
		// Yield to the event loop, allowing the UI to update.
		await new Promise(resolve => setTimeout(resolve, 0));
		const dataURL = createCharModelIcon(currentCharModel, renderer, viewType, 256, 256);
		img.setAttribute('src', dataURL);
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

	// Set global render textures element to null after FFL initialization
	_displayRenderTexturesElement = null;
	renderTexturesDisplayElement.addEventListener('toggle', toggleRenderTexturesDisplay);
	reinitTexturesElement.addEventListener('change', toggleReinitTextures);
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
const charFormElement = document.getElementById('charForm');
/** @type {HTMLInputElement | null} */
const charDataInputElement = document.getElementById('charData');

// -------------- Form Submission Handler ------------------
document.addEventListener('DOMContentLoaded', async function () {
	await initializeFFL(window.ffljsResourceFetchResponse, window.Module);

	// Initialize FFL and TextureManager.
	// await initializeFFLWithResource(window.Module);
	// window.Module._FFLSetLinearGammaMode(1);

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

function loadCharacterButtons(useLocalIcon = true) {
	async function setIcon(img, data, viewType = ViewType.IconFovy45) {
		// Yield to the event loop, allowing the UI to update.
		await new Promise(resolve => setTimeout(resolve, 0));
		if (useLocalIcon) {
			// Render the icon using createCharModelIcon.
			let model;
			try {
				const dataU8 = parseHexOrB64ToUint8Array(data);
				model = createCharModel(dataU8, null, window[activeMaterialClassName], window.Module);
				initCharModelTextures(model, renderer);
				const dataURL = createCharModelIcon(model, renderer, viewType);
				img.setAttribute('src', dataURL);
			} catch (e) {
				console.error(`loadCharacterButtons: Could not make icon for ${data}: ${e}`);
			} finally {
				model.dispose();
			}
		} else {
			img.setAttribute('src', img.getAttribute('data-src') + encodeURIComponent(data));
		}
	}

	const elements = document.querySelectorAll('[data-name][data-data]');
	elements.forEach((el) => {
		const clone = document.getElementById('btn-template').cloneNode(true);
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

function onPresetCharacterClick(event) {
	event.preventDefault();
	const data = event.currentTarget.getAttribute('data-data');
	console.log('Preset character data clicked: ', data);

	initAndUpdateScene(data);
}