import { FFLResourceType, FFLResult } from "./enums";
import { BrokenInitRes, FFLResultException } from "./Exceptions";
import Module from "./Module";
import { FFLResourceDesc } from "./StructFFLiCharModel";

/**
 * Loads data from TypedArray or fetch response directly into Emscripten heap.
 * If passed a fetch response, it streams it directly into memory and avoids copying.
 * @param {ArrayBuffer|Uint8Array|Response} resource - The resource data.
 * Use a Fetch response to stream directly, or a Uint8Array if you only have the raw bytes.
 * @param {Module} module - The Emscripten module instance.
 * @returns {Promise<{pointer: number, size: number}>} Pointer and size of the allocated heap memory.
 * @throws {Error} resource must be a Uint8Array or fetch that is streamable and has Content-Length.
 * @private
 */
async function _loadDataIntoHeap(resource: ArrayBuffer | Uint8Array | Response, module: Module): Promise<{ pointer: number; size: number; }> {
	// These need to be accessible by the catch statement:
	let heapSize;
	let heapPtr;
	try {
		// Copy resource into heap.
		if (resource instanceof ArrayBuffer) {
			resource = new Uint8Array(resource);
		}
		if (resource instanceof Uint8Array) {
			// Comes in as Uint8Array, allocate and set it.
			heapSize = resource.length;
			heapPtr = module._malloc(heapSize);
			console.debug(`_loadDataIntoHeap: Loading from buffer. Size: ${heapSize}, Pointer: ${heapPtr}`);
			// Allocate and set this area in the heap as the passed buffer.
			module.HEAPU8.set(resource, heapPtr);
		} else if (resource instanceof Response) {
			// Handle as fetch response.
			if (!resource.ok) {
				throw new Error(`_loadDataIntoHeap: Failed to fetch resource at URL = ${resource.url}, response code = ${resource.status}`);
			}
			// Throw an error if it is not a streamable response.
			if (!resource.body) {
				throw new Error(`_loadDataIntoHeap: Fetch response body is null (resource.body = ${resource.body})`);
			}
			// Get the total size of the resource from the headers.
			const contentLength = resource.headers.get('Content-Length');
			if (!contentLength) {
				// Cannot stream the response. Read as ArrayBuffer and reinvoke function.
				console.debug('_loadDataIntoHeap: Fetch response is missing Content-Length, falling back to reading as ArrayBuffer.');
				return _loadDataIntoHeap(await resource.arrayBuffer(), module);
			}

			// Allocate into heap using the Content-Length.
			heapSize = parseInt(contentLength, 10);
			heapPtr = module._malloc(heapSize);

			console.debug(`loadDataIntoHeap: Streaming from fetch response. Size: ${heapSize}, pointer: ${heapPtr}, URL: ${resource.url}`);

			// Begin reading and streaming chunks into the heap.
			const reader = resource.body.getReader();
			let offset = heapPtr;
			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					break;
				}
				// Copy value directly into HEAPU8 with offset.
				module.HEAPU8.set(value, offset);
				offset += value.length;
			}
		} else {
			throw new Error('loadDataIntoHeap: type is not Uint8Array or Response');
		}

		return { pointer: heapPtr, size: heapSize };
	} catch (error) {
		// Free memory upon exception, if allocated.
		if (heapPtr) {
			module._free(heapPtr);
		}
		throw error;
	}
}

// ----------------- initializeFFL(resource, moduleOrPromise) -----------------
/**
 * Initializes FFL by copying the resource into heap and calling FFLInitRes.
 * It will first wait for the Emscripten module to be ready.
 * @param {Uint8Array|Response} resource - The FFL resource data. Use a Uint8Array
 * if you have the raw bytes, or a fetch response containing the FFL resource file.
 * @param {Module|Promise<Module>|function(): Promise<Module>} moduleOrPromise - The Emscripten module
 * by itself (window.Module when MODULARIZE=0), as a promise (window.Module() when MODULARIZE=1),
 * or as a function returning a promise (window.Module when MODULARIZE=1).
 * @returns {Promise<{module: Module, resourceDesc: FFLResourceDesc}>} Resolves when FFL is fully initialized,
 * returning the final Emscripten {@link Module} instance and the {@link FFLResourceDesc} object
 * that can later be passed into {@link exitFFL}.
 */
async function initializeFFL(resource: Uint8Array | Response, moduleOrPromise: Module | Promise<Module> | (() => Promise<Module>)): Promise<{ module: Module; resourceDesc: ReturnType<typeof FFLResourceDesc.unpack> }> {
	console.debug('initializeFFL: Entrypoint, waiting for module to be ready.');

	/**
	 * Pointer to the FFLResourceDesc structure to free when FFLInitRes call is done.
	 * @type {number}
	 */
	let resourceDescPtr: number;
	/** Frees the FFLResourceDesc - not the resources it POINTS to unlike _freeResourceDesc. */
	function freeResDesc(): void {
		if (resourceDescPtr) {
			// Free FFLResourceDesc, unused after init.
			module._free(resourceDescPtr);
		}
	}
	/** Resource type to load single resource into. */
	const resourceType = FFLResourceType.HIGH;

	/**
	 * The Emscripten Module instance to set and return at the end.
	 * @type {Module}
	 */
	let module: Module;
	// Resolve moduleOrPromise to the Module instance.
	if (typeof moduleOrPromise === 'function') {
		// Assume this function gets the promise of the module.
		moduleOrPromise = moduleOrPromise();
	}
	if (moduleOrPromise instanceof Promise) {
		// Await if this is now a promise.
		module = await moduleOrPromise;
	} else {
		// Otherwise, assume it is already the module.
		module = moduleOrPromise;
	}

	// Wait for the Emscripten runtime to be ready if it isn't already.
	if (!module.calledRun && !module.onRuntimeInitialized) {
		// calledRun is not defined. Set onRuntimeInitialized and wait for it in a new promise.
		await new Promise((resolve) => {
			/** If onRuntimeInitialized is not defined on module, add it. */
			module.onRuntimeInitialized = () => {
				console.debug('initializeFFL: Emscripten runtime initialized, resolving.');
				resolve(null);
			};
			console.debug(`initializeFFL: module.calledRun: ${module.calledRun}, module.onRuntimeInitialized:\n${module.onRuntimeInitialized}\n // ^^ assigned and waiting.`);
			// If you are stuck here, the object passed in may not actually be an Emscripten module?
		});
	} else {
		console.debug('initializeFFL: Assuming module is ready.');
	}

	// Module should be ready after this point, begin loading the resource.
	/** @type {FFLResourceDesc|null} */
	let resourceDesc = null;
	try {
		// If resource is itself a promise (fetch() result), wait for it to finish.
		if (resource instanceof Promise) {
			resource = await resource;
		}

		// Load the resource (Uint8Array/fetch Response) into heap.
		const { pointer: heapPtr, size: heapSize } = await _loadDataIntoHeap(resource, module);
		console.debug(`initializeFFL: Resource loaded into heap. Pointer: ${heapPtr}, Size: ${heapSize}`);

		// Initialize and pack FFLResourceDesc.
		resourceDesc = { pData: [0, 0], size: [0, 0] };
		resourceDesc.pData[resourceType] = heapPtr;
		resourceDesc.size[resourceType] = heapSize;

		const resourceDescData = FFLResourceDesc.pack(resourceDesc);
		resourceDescPtr = module._malloc(FFLResourceDesc.size); // Freed by freeResDesc.
		module.HEAPU8.set(resourceDescData, resourceDescPtr);

		// Call FFL initialization using: FFL_FONT_REGION_JP_US_EU = 0
		const result = module._FFLInitRes(0, resourceDescPtr);

		// Handle failed result.
		if (result === FFLResult.FILE_INVALID) { // FFL_RESULT_BROKEN
			throw new BrokenInitRes();
		}
		FFLResultException.handleResult(result, 'FFLInitRes');

		// Set required globals in FFL.
		module._FFLInitResGPUStep(); // CanInitCharModel will fail if not called.
		module._FFLSetNormalIsSnorm8_8_8_8(true); // Set normal format to FFLiSnorm8_8_8_8.
		module._FFLSetTextureFlipY(true); // Set textures to be flipped for OpenGL.

		// Requires refactoring:
		// module._FFLSetScale(0.1); // Sets model scale back to 1.0.
		// module._FFLSetLinearGammaMode(1); // Use linear gamma.
		// I don't think ^^ will work because the shaders need sRGB
	} catch (error) {
		// Cleanup on error.
		_freeResourceDesc(resourceDesc, module);
		freeResDesc();
		console.error('initializeFFL failed:', error);
		throw error;
	} finally {
		// Always free the FFLResourceDesc struct itself.
		freeResDesc();
	}

	// Return final Emscripten module and FFLResourceDesc object.
	return {
		module: module,
		resourceDesc: resourceDesc
	};
}

/**
 * Frees all pData pointers within {@link FFLResourceDesc}.
 * @param {FFLResourceDesc|null} desc - {@link FFLResourceDesc} to free pointers from.
 * @param {Module} module - Emscripten module to call _free on.
 * @package
 */
export function _freeResourceDesc(desc: ReturnType<typeof FFLResourceDesc.unpack> | null, module: Module): void {
	if (!desc || !desc.pData) {
		return;
	}
	desc.pData.forEach((ptr: number, i: number) => {
		if (ptr) {
			module._free(ptr);
			desc.pData[i] = 0;
		}
	});
}

// ---------------------- exitFFL(module, resourceDesc) ----------------------
/**
 * @param {Module} module - Emscripten module.
 * @param {FFLResourceDesc} resourceDesc - The FFLResourceDesc received from {@link initializeFFL}.
 * @public
 * @todo TODO: Needs to somehow destroy Emscripten instance.
 */
export function exitFFL(module: Module, resourceDesc: ReturnType<typeof FFLResourceDesc.unpack>): void {
	console.debug('exitFFL called, resourceDesc:', resourceDesc);

	// All CharModels must be deleted before this point.
	const result = module._FFLExit();
	FFLResultException.handleResult(result, 'FFLExit');

	// Free resources in heap after FFLExit().
	_freeResourceDesc(resourceDesc, module);

	// Exit the module...? Is this even necessary?
	if (module._exit) {
		module._exit();
	} else {
		console.debug('exitFFL: not calling module._exit = ', module._exit);
	}
}
