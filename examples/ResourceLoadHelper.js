// @ts-check

import { unzipSync } from 'fflate';
const fflate = { unzipSync };

/** @typedef {Error & {responseStatus: number}} ErrorAndResponseStatus */

/**
 * A helper component to load the FFL resource.
 * It displays an inline widget (inside a <details> element) that
 * catches errors and provides a UI for uploading or fetching the resource.
 * @example
 * import ResourceLoadHelper from './ResourceLoadHelper.js'; // Import loader as ESM.
 * // Construct new instance.
 * const loader = new ResourceLoadHelper({
 *	 container: document.getElementById('resourceContainer'), // Container for the UI.
 *	 initialResource: resourceURLOrFetchResponse, // Set to null for none.
 *	 onLoad: async (resourceData) => {
 *     // Call initializeFFL(resourceData, window.ModuleFFL).
 *     // Then set up your Three.js scene and use FFL.js.
 *	 }
 * });
 * loader.init(); // Creates element and attempts initial load.
 */
class ResourceLoadHelper {
	/**
	 * @param {Object} options - Initialization options.
	 * @param {HTMLElement} options.container - The container element to inject the widget's HTML into.
	 * @param {string|Promise<Response>|Response|Uint8Array|null} options.initialResource
	 * - The initial resource URL, fetch Response, or null to prompt for a resource to load.
	 * @param {function((Response|Uint8Array)):Promise<void>} options.onLoad - Callback invoked when resource is loaded.
	 */
	constructor({ container, initialResource, onLoad }) {
		if (!container) {
			throw new Error('ResourceLoadHelper: container element is required.');
		}
		/** The container element in which to place the widget inside. */
		this.container = container;
		/** The initial resource to load when calling {@link this.init} */
		this.initialResource = initialResource;
		/** The callback to load the resource back into. */
		this.onLoad = onLoad;
		/** The HTML ID of the widget including a timestamp. */
		this.widgetId = `res-widget-${Date.now()}`;
	}

	/**
	 * Initialize the resource loader.
	 * Sets up the widget UI and attempts initial resource load.
	 * @throws {Error} Throws if detailsEl needs to be opened but is null or undefined.
	 */
	init() {
		/** Query selector for default resource fetch path, where the path is in content. */
		const DEFAULT_RESOURCE_FETCH_PATH_SELECTOR = 'meta[itemprop=ffl-js-resource-fetch-path]';

		this._createWidget(); // Insert the widget's HTML into the container.
		if (!this.initialResource) {
			// If no resource is explicitly passed in, try to read this meta tag.
			const defaultURL = /** @type {HTMLMetaElement|null} */
				(document.querySelector(DEFAULT_RESOURCE_FETCH_PATH_SELECTOR))?.content?.trim();
			// Open widget if no initial resource is specified.
			if (defaultURL) {
				(this.urlInput) && (this.urlInput.value = defaultURL);
				this._loadResource(defaultURL);
				return;
			}

			// Otherwise, there is no default.
			if (!this.detailsEl) {
				throw new Error('ResourceLoadHelper.init: Tried to open detailsEl but it is null or undefined.');
			}
			this.detailsEl.open = true;
		} else {
			// Attempt to load initial resource.
			this._loadResource(this.initialResource);
		}
	}

	/**
	 * Create the HTML widget using a multiline string.
	 * The widget includes:
	 * - A summary with the label and a separate status span.
	 * - A dedicated error span for 404-specific messages.
	 * - A file input and a URL form.
	 * @private
	 */
	_createWidget() {
		/** Inline HTML for the widget, inserted into {@link this.container}. */
		const html = `
			<details id="${this.widgetId}">
				<summary>
					<span id="${this.widgetId}-label">Resource File</span>
					<span id="${this.widgetId}-status-loaded" style="display: none;">(Loaded)</span>
					<span id="${this.widgetId}-status-not-loaded">(Not Loaded)</span>
				</summary>
				<div id="${this.widgetId}-error" style="border: 1px solid red; padding: 0.5em; margin-bottom: 0.5em; display:none;"></div>
				<div id="${this.widgetId}-fetch-error" style="display: none; margin-top: 0.5em; font-size: 0.9em; color: orange;">
					Could not fetch resource. You will need to download it below, or otherwise
					<a href="https://github.com/ariankordi/FFL.js/blob/master/README.md" target="_blank">refer to the README for more details.</a>
				</div>
				<div>
					<label for="${this.widgetId}-file-input">
						Upload an FFL/AFL resource file from .dat or .zip.
						<div style="font-size: 12px;">
							If you need it, download it here: <a target="_blank" href="https://web.archive.org/web/20180502054513/http://download-cdn.miitomo.com/native/20180125111639/android/v2/asset_model_character_mii_AFLResHigh_2_3_dat.zip">https://web.archive.org/web/20180502054513/http://download-cdn.miitomo.com/native/20180125111639/android/v2/asset_model_character_mii_AFLResHigh_2_3_dat.zip</a>
							<br><i>Note that you cannot enter this link below.</i>
						</div>
					</label>
					<input type="file" id="${this.widgetId}-file-input" accept=".zip,.dat">
				</div>
				<div style="margin-top: 0.5em;">
					<form id="${this.widgetId}-url-form">
						<!-- Psst: If you are lurking, you can try this URL: http://ia-proxy.fs3d.net:8989/20180502054513/http://download-cdn.miitomo.com/native/20180125111639/android/v2/asset_model_character_mii_AFLResHigh_2_3_dat.zip -->
						<!-- That is a CORS proxy hosted by Kaeru Team. However, since it is plain HTTP, it will only work from a plain HTTP site or file:// -->
						<input type="text" id="${this.widgetId}-url-input" placeholder="Or enter a URL to the resource (Needs CORS enabled)." size="50">
						<input type="submit" id="${this.widgetId}-url-button">
					</form>
				</div>
			</details>
		`;
		// Inject the HTML directly into the container.
		this.container.insertAdjacentHTML('beforeend', html);
		// Define all elements within the container.
		this.detailsEl = /** @type {HTMLDetailsElement} */ (document.getElementById(this.widgetId));
		this.errorSpan = /** @type {HTMLElement} */ (document.getElementById(`${this.widgetId}-error`));
		this.fetchErrorEl = /** @type {HTMLElement} */ (document.getElementById(`${this.widgetId}-fetch-error`));
		this.labelSpan = /** @type {HTMLElement} */ (document.getElementById(`${this.widgetId}-label`));
		this.statusLoadedSpan = /** @type {HTMLElement} */ (document.getElementById(`${this.widgetId}-status-loaded`));
		this.statusNotLoadedSpan = /** @type {HTMLElement} */ (document.getElementById(`${this.widgetId}-status-not-loaded`));

		// File input event handler.
		const fileInput = /** @type {HTMLInputElement} */ (document.getElementById(`${this.widgetId}-file-input`));
		fileInput.addEventListener('change', () => {
			if (fileInput.files && fileInput.files[0]) {
				this._loadFromFile(fileInput.files[0]);
			}
		});

		// URL form event handler.
		const urlForm = /** @type {HTMLFormElement} */ (document.getElementById(`${this.widgetId}-url-form`));
		this.urlInput = /** @type {HTMLInputElement} */ (document.getElementById(`${this.widgetId}-url-input`));
		const urlButton = /** @type {HTMLInputElement} */ (document.getElementById(`${this.widgetId}-url-button`));
		urlForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const url = this.urlInput?.value.trim();
			if (!url) {
				return;
			}
			urlButton.disabled = true; // Disable button while submitting.
			try {
				await this._loadResource(url);
			} finally {
				urlButton.disabled = false;
			}
		});
	}

	/**
	 * Display an error message in the widget.
	 * Also, open the widget to alert the user.
	 * @param {string} message - The error message.
	 * @private
	 */
	_displayError(message) {
		if (this.errorSpan) {
			this.errorSpan.textContent = message;
			this.errorSpan.style.display = 'block';
		}
		// Show the specific fetch error if error contains "Failed to fetch"
		if (this.fetchErrorEl) {
			this.fetchErrorEl.style.display = message.includes('Failed to fetch')
				? 'initial'
				: 'none';
		}
		if (this.detailsEl) {
			this.detailsEl.open = true;
		}
		console.error(message);
	}

	/**
	 * Clear any error message currently displayed.
	 * @private
	 */
	_clearError() {
		if (this.errorSpan) {
			this.errorSpan.textContent = '';
			this.errorSpan.style.display = 'none';
		}
		if (this.fetchErrorEl) {
			this.fetchErrorEl.style.display = 'none';
		}
	}

	/**
	 * Load a resource from either a URL (string) or a Promise.
	 * If the resource URL ends with ".zip" (or if its contents indicate a zip),
	 * then process and pass a Uint8Array to onLoad. Otherwise, pass the fetch Response.
	 * @param {string|Response|Promise<Response>|Uint8Array} resource - The resource URL or promise.
	 * @private
	 */
	async _loadResource(resource) {
		this._clearError();
		try {
			let loaded;
			if (typeof resource === 'string') {
				loaded = await this._loadFromURL(resource);
			} else if (resource instanceof Promise) {
				loaded = await resource;
			} else if (resource instanceof Uint8Array) {
				loaded = resource;
			} else {
				throw new Error('_loadResource: Unexpected type for resource passed in.');
			}

			await this.onLoad(loaded); // Invoke the onLoad callback with the loaded resource.
			this._updateWidgetStatus(); // Update status indicating success.
		} catch (error) {
			const errorMsg = `${error instanceof Error ? error.message : error}` || 'Unknown error';
			this._displayError(errorMsg);
		}
	}

	/**
	 * Toggle loaded/unloaded status spans.
	 * @private
	 */
	_updateWidgetStatus() {
		if (this.statusLoadedSpan && this.statusNotLoadedSpan) {
			this.statusLoadedSpan.style.display = 'inline';
			this.statusNotLoadedSpan.style.display = 'none';
		}
	}

	/**
	 * Handle the file selected via file upload.
	 * Reads the file as an ArrayBuffer and processes it.
	 * @param {File} file - The uploaded file.
	 * @private
	 */
	async _loadFromFile(file) {
		try {
			// Get file as ArrayBuffer.
			const buffer = await this._bufferFromFile(file);
			// Potentially unzip it and convert to Uint8Array.
			const loadedResource = this._maybeUnzipResource(buffer);
			this._clearError(); // Clear previous errors.
			await this.onLoad(loadedResource); // Call user callback.
			this._updateWidgetStatus(); // Toggle "Not Loaded" to "Loaded"
		} catch (error) {
			this._displayError(`${error instanceof Error ? error.message : error}`);
		}
	}

	/**
	 * Fetch the resource from a URL.
	 * If the URL ends with ".zip", it will be fetched, converted to an ArrayBuffer,
	 * unzipped via fflate, and then return a Uint8Array.
	 * Otherwise, the original Response is returned for streaming.
	 * @param {string} url - The URL to fetch.
	 * @returns {Promise<(Response|Uint8Array)>}
	 * The returned fetch Response, or Uint8Array if the resource is from a zip.
	 * @private
	 */
	async _loadFromURL(url) {
		const response = await fetch(url);
		if (!response.ok) {
			const err = new Error(`_fetchResource: Failed to fetch resource at URL = ${url}, HTTP status = ${response.status}`);
			// /** @type {ErrorAndResponseStatus} */ (err).responseStatus = response.status;
			throw err;
		}
		// If URL ends with ".zip", process unzipping.
		if (url.endsWith('.zip')) {
			const buffer = await response.arrayBuffer();
			return this._maybeUnzipResource(buffer);
		}
		// Otherwise, pass along the Response as-is so initializeFFL can stream it.
		return response;
	}

	/**
	 * Read a File object as an ArrayBuffer.
	 * @param {File} file - The file to read.
	 * @returns {Promise<ArrayBuffer>} The file read as ArrayBuffer.
	 * @private
	 */
	_bufferFromFile(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				if (!(reader.result instanceof ArrayBuffer)) {
					reject(new Error('_bufferFromFile: FileReader result is not an ArrayBuffer.'));
				} else {
					resolve(reader.result);
				}
			};
			reader.onerror = (event) => {
				reject(new Error(`_bufferFromFile: Failed to read file: ${event.target?.error?.message}`));
			};
			reader.readAsArrayBuffer(file);
		});
	}

	/**
	 * Process an ArrayBuffer to check if it represents a zip.
	 * If it is a zip (detected by "PK" magic), use fflate to unzip and return the .dat resource.
	 * Otherwise, wrap and return a Uint8Array.
	 * @param {ArrayBuffer} buffer - The raw data.
	 * @returns {Uint8Array} The data as Uint8Array.
	 * @throws {Error} Throws if file was not found in zip.
	 * @private
	 */
	_maybeUnzipResource(buffer) {
		/** Expected file suffix for valid files. */
		const EXPECTED_SUFFIX_IN_ZIP = '.dat';
		/** Expected fourcc header. */
		const EXPECTED_FOURCC_IN_ZIP = 'FFRA';
		/** Prefix for zip file magic. */
		const ZIP_MAGIC_PREFIX = 'PK';

		/** Get magic/fourcc of the file. */
		const magic = String.fromCharCode(...new Uint8Array(buffer.slice(0, 2)));
		if (!magic.startsWith(ZIP_MAGIC_PREFIX)) {
			// Not a zip file. Return the raw data as Uint8Array.
			return new Uint8Array(buffer);
		}

		// Constants for zip decompression.
		/** Maximum allowed number of files in the zip. */
		const MAX_FILES = 5;
		/** Maximum allowed directory recursion level. */
		const MAX_RECURSION_LEVEL = 10;
		/** Minimum allowed file size in bytes (90 kb). */
		const MIN_FILE_SIZE = 90 * 1024;

		/** Unzip the data with fflate. */
		const files = fflate.unzipSync(new Uint8Array(buffer));
		/** File entries as [name, data] pairs. */
		const entries = Object.entries(files);
		if (entries.length > MAX_FILES) {
			// Fail if too many files.
			throw new Error(`_maybeUnzipResource: Amount of files in zip exceeded ${MAX_FILES}.`);
		}
		for (const [name, data] of entries) { // Begin iterating.
			/** Calculate directory recursion level. */
			const level = name.split('/').length - 1;
			if (level > MAX_RECURSION_LEVEL) {
				// Fail if recursion level too deep.
				throw new Error(`_maybeUnzipResource: Recursion level in zip exceeded ${MAX_RECURSION_LEVEL}.`);
			}
			if (!name.endsWith(EXPECTED_SUFFIX_IN_ZIP)) {
				continue;
			}
			if (data.length < MIN_FILE_SIZE) {
				// Fail if file is too small.
				throw new Error(`_maybeUnzipResource: File in zip ${name} is smaller than minimum: ${MIN_FILE_SIZE}.`);
			}
			/** Peek first 4 bytes for fourcc. */
			const header = String.fromCharCode(...data.slice(0, 4));
			if (header === EXPECTED_FOURCC_IN_ZIP) {
				// Needed file was found. Return now.
				return data;
			}
		}
		// Still in the zip file path but didn't find the file.
		throw new Error(`_maybeUnzipResource: Input was a zip, but no file with required fourcc (${EXPECTED_FOURCC_IN_ZIP}) or suffix (${EXPECTED_SUFFIX_IN_ZIP}) was found in it.`);
	}
}

export default ResourceLoadHelper;
