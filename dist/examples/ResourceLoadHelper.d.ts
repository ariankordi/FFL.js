export default ResourceLoadHelper;
export type ErrorAndResponseStatus = Error & {
    responseStatus: number;
};
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
declare class ResourceLoadHelper {
    /**
     * @param {Object} options - Initialization options.
     * @param {HTMLElement} options.container - The container element to inject the widget's HTML into.
     * @param {string|Promise<Response>|Response|Uint8Array|null} options.initialResource
     * - The initial resource URL, fetch Response, or null to prompt for a resource to load.
     * @param {function((Response|Uint8Array)):Promise<void>} options.onLoad - Callback invoked when resource is loaded.
     */
    constructor({ container, initialResource, onLoad }: {
        container: HTMLElement;
        initialResource: string | Promise<Response> | Response | Uint8Array | null;
        onLoad: (arg0: (Response | Uint8Array)) => Promise<void>;
    });
    /** The container element in which to place the widget inside. */
    container: HTMLElement;
    /** The initial resource to load when calling {@link this.init} */
    initialResource: string | Uint8Array<ArrayBufferLike> | Response | Promise<Response> | null;
    /** The callback to load the resource back into. */
    onLoad: (arg0: (Response | Uint8Array)) => Promise<void>;
    /** The HTML ID of the widget including a timestamp. */
    widgetId: string;
    /**
     * Initialize the resource loader.
     * Sets up the widget UI and attempts initial resource load.
     * @throws {Error} Throws if detailsEl needs to be opened but is null or undefined.
     */
    init(): void;
    /**
     * Create the HTML widget using a multiline string.
     * The widget includes:
     * - A summary with the label and a separate status span.
     * - A dedicated error span for 404-specific messages.
     * - A file input and a URL form.
     * @private
     */
    private _createWidget;
    detailsEl: HTMLDetailsElement | undefined;
    errorSpan: HTMLElement | undefined;
    fetchErrorEl: HTMLElement | undefined;
    labelSpan: HTMLElement | undefined;
    statusLoadedSpan: HTMLElement | undefined;
    statusNotLoadedSpan: HTMLElement | undefined;
    urlInput: HTMLInputElement | undefined;
    /**
     * Display an error message in the widget.
     * Also, open the widget to alert the user.
     * @param {string} message - The error message.
     * @private
     */
    private _displayError;
    /**
     * Clear any error message currently displayed.
     * @private
     */
    private _clearError;
    /**
     * Load a resource from either a URL (string) or a Promise.
     * If the resource URL ends with ".zip" (or if its contents indicate a zip),
     * then process and pass a Uint8Array to onLoad. Otherwise, pass the fetch Response.
     * @param {string|Response|Promise<Response>|Uint8Array} resource - The resource URL or promise.
     * @private
     */
    private _loadResource;
    /**
     * Toggle loaded/unloaded status spans.
     * @private
     */
    private _updateWidgetStatus;
    /**
     * Handle the file selected via file upload.
     * Reads the file as an ArrayBuffer and processes it.
     * @param {File} file - The uploaded file.
     * @private
     */
    private _loadFromFile;
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
    private _loadFromURL;
    /**
     * Read a File object as an ArrayBuffer.
     * @param {File} file - The file to read.
     * @returns {Promise<ArrayBuffer>} The file read as ArrayBuffer.
     * @private
     */
    private _bufferFromFile;
    /**
     * Process an ArrayBuffer to check if it represents a zip.
     * If it is a zip (detected by "PK" magic), use fflate to unzip and return the .dat resource.
     * Otherwise, wrap and return a Uint8Array.
     * @param {ArrayBuffer} buffer - The raw data.
     * @returns {Uint8Array} The data as Uint8Array.
     * @throws {Error} Throws if file was not found in zip.
     * @private
     */
    private _maybeUnzipResource;
}
