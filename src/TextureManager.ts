import * as THREE from 'three';
import { Module } from "@/Module";
import { FFLTextureCallback, FFLTextureFormat, FFLTextureInfo } from '@/StructFFLiCharModel';
import { _isWebGPU } from '@/RenderTargetUtils';
import Renderer from '@/renderer';

/**
 * Manages THREE.Texture objects created via FFL.
 * Must be instantiated after FFL is fully initialized.
 * @package
 */
export default class TextureManager {
	private _module: Module;
	private _textures = new Map<number, THREE.Texture>();
	private _createCallback?: number;
	private _deleteCallback?: number;

	public _textureCallbackPtr = 0;

	/**
	 * Controls whether or not the TextureManager
	 * will log creations and deletions of textures
	 * in order to better track memory allocations.
	 */
	public logging = false;

	/**
	 * Global that controls if texture creation should be changed
	 * to account for WebGL 1.0. (Shapes should be fine)
	 */
	static isWebGL1 = false;

	/**
	 * Constructs the TextureManager. This MUST be created after initializing FFL.
	 * @param {Module} module - The Emscripten module.
	 * @param {boolean} [setToFFLGlobal] - Whether or not to call FFLSetTextureCallback on the constructed callback.
	 */
	constructor(module: Module, setToFFLGlobal = false) {
		this._module = module;

		// Create and set texture callback instance.
		this._setTextureCallback();
		if (setToFFLGlobal) {
			// Set texture callback globally within FFL if chosen.
			module._FFLSetTextureCallback(this._textureCallbackPtr);
		}
	}

	/**
	 * Creates and allocates an {@link FFLTextureCallback} instance from callback function pointers.
	 * @param {Module} module - The Emscripten module.
	 * @param {number} createCallback - Function pointer for the create callback.
	 * @param {number} deleteCallback - Function pointer for the delete callback.
	 * @returns {number} Pointer to the {@link FFLTextureCallback}.
	 * Note that you MUST free this after using it (done in {@link TextureManager.disposeCallback}).
	 */
	private static _allocateTextureCallback(module: Module, createCallback: number, deleteCallback: number): number {
		const ptr = module._malloc(FFLTextureCallback.size);
		const textureCallback = {
			pObj: 0,
			useOriginalTileMode: false,
			_padding: [0, 0, 0],
			pCreateFunc: createCallback,
			pDeleteFunc: deleteCallback
		};
		const packed = FFLTextureCallback.pack(textureCallback);
		module.HEAPU8.set(packed, ptr);
		return ptr;
	}

	/**
	 * Creates the create/delete functions in Emscripten and allocates and sets
	 * the {@link FFLTextureCallback} object as {@link TextureManager._textureCallbackPtr}.
	 * @param {boolean} addDeleteCallback - Whether or not to bind the delete function to the texture callback.
	 */
	public _setTextureCallback(addDeleteCallback = false): void {
		const mod = this._module;

		this._createCallback = mod.addFunction(this._textureCreateFunc.bind(this), 'vppp');

		if (addDeleteCallback) {
			this._deleteCallback = mod.addFunction(this._textureDeleteFunc.bind(this), 'vpp');
		}

		this._textureCallbackPtr = TextureManager._allocateTextureCallback(mod,
			this._createCallback, this._deleteCallback ? this._deleteCallback : 0);
	}

	/**
	 * @param {number} format - Enum value for FFLTextureFormat.
	 * @returns {import('three').PixelFormat} Three.js texture format constant.
	 * Note that this function won't work on WebGL1Renderer in Three.js r137-r162
	 * since R and RG textures need to use Luminance(Alpha)Format
	 * (you'd somehow need to detect which renderer is used)
	 */
	private _getTextureFormat(format: FFLTextureFormat): THREE.PixelFormat {
		// Map FFLTextureFormat to Three.js texture formats.

		// THREE.RGFormat did not work for me on Three.js r136/older.
		const useGLES2Formats = Number(THREE.REVISION) <= 136 || TextureManager.isWebGL1;
		const r8 = useGLES2Formats
			// eslint-disable-next-line import/namespace -- deprecated, maybe deleted
			? THREE.LuminanceFormat
			: THREE.RedFormat;
		const r8g8 = useGLES2Formats
		// NOTE: Using THREE.LuminanceAlphaFormat before it
		// was removed on WebGL 1.0/2.0 causes the texture
		// to be converted to RGBA resulting in two issues.
		//     - There is a black outline around glasses
		//     - For glasses that have an inner color, the color is wrongly applied to the frames as well.
			// eslint-disable-next-line import/namespace -- deprecated, maybe deleted
			? THREE.LuminanceAlphaFormat
			: THREE.RGFormat;

		const textureFormatToThreeFormat: Partial<Record<FFLTextureFormat, THREE.PixelFormat>> = {
			[FFLTextureFormat.R8_UNORM]: r8,
			[FFLTextureFormat.R8_G8_UNORM]: r8g8,
			[FFLTextureFormat.R8_G8_B8_A8_UNORM]: THREE.RGBAFormat
		};

		// Determine the data format from the table.
		const dataFormat = textureFormatToThreeFormat[format];
		console.assert(dataFormat !== undefined, `_textureCreateFunc: Unexpected FFLTextureFormat value: ${format}`);
		return dataFormat!;
	}

	/**
	 * @param {number} _ - Originally pObj, unused here.
	 * @param {number} textureInfoPtr - Pointer to {@link FFLTextureInfo}.
	 * @param {number} texturePtrPtr - Pointer to the texture handle (pTexture2D).
	 */
	private _textureCreateFunc(_: never, textureInfoPtr: number, texturePtrPtr: number): void {
		const u8 = this._module.HEAPU8.subarray(textureInfoPtr,
			textureInfoPtr + FFLTextureInfo.size);
		const textureInfo = FFLTextureInfo.unpack(u8);
		if (this.logging) {
			console.debug(`_textureCreateFunc: width=${textureInfo.width}, height=${textureInfo.height}, format=${textureInfo.format}, imageSize=${textureInfo.imageSize}, mipCount=${textureInfo.mipCount}`);
		}

		/** Resolve THREE.PixelFormat. */
		const format = this._getTextureFormat(textureInfo.format);
		// Copy image data from HEAPU8 via slice. This is base level/mip level 0.
		const imageData = this._module.HEAPU8.slice(textureInfo.imagePtr,
			textureInfo.imagePtr + textureInfo.imageSize);

		/**
		 * Determine whether mipmaps can be used at all.
		 * Implemented in Three.js r137 and only works properly on r138.
		 *
		 * This is also disabled for WebGL 1.0, since there are some NPOT textures.
		 * Those aren't supposed to have mipmaps e.g., glass, but I found that
		 * while in GLES2, some textures that didn't wrap could have mips with
		 * NPOT, this didn't work in WebGL 1.0.
		 */
		const canUseMipmaps = Number(THREE.REVISION) >= 138 && !TextureManager.isWebGL1;
		// Actually use mipmaps if the mip count is over 1.
		const useMipmaps = textureInfo.mipCount > 1 && canUseMipmaps;

		// Create new THREE.Texture with the specified format.
		const texture = new THREE.DataTexture(useMipmaps ? null : imageData,
			textureInfo.width, textureInfo.height, format, THREE.UnsignedByteType);

		texture.magFilter = THREE.LinearFilter;
		// texture.generateMipmaps = true; // not necessary at higher resolutions
		texture.minFilter = THREE.LinearFilter;

		if (useMipmaps) {
			// Add base texture.
			texture.mipmaps = [{
				data: imageData,
				width: textureInfo.width,
				height: textureInfo.height
			}];
			// Enable filtering option for mipmap and add levels.
			texture.minFilter = THREE.LinearMipmapLinearFilter;
			texture.generateMipmaps = false;
			this._addMipmaps(texture, textureInfo);
		}

		texture.needsUpdate = true;
		this.set(texture.id, texture);
		this._module.HEAPU32[texturePtrPtr / 4] = texture.id;
	}

	/**
	 * @param {import('three').Texture} texture - Texture to upload mipmaps into.
	 * @param {FFLTextureInfo} textureInfo - FFLTextureInfo object representing this texture.
	 */
	private _addMipmaps(texture: THREE.Texture, textureInfo: ReturnType<typeof FFLTextureInfo.unpack>): void {
		// Make sure mipPtr is not null.
		console.assert(textureInfo.mipPtr, '_addMipmaps: mipPtr is null, so the caller incorrectly assumed this texture has mipmaps');

		// Iterate through mip levels starting from 1 (base level is mip level 0).
		for (let mipLevel = 1; mipLevel < textureInfo.mipCount; mipLevel++) {
			// Calculate the offset for the current mip level.
			const mipOffset = textureInfo.mipLevelOffset[mipLevel - 1];

			// Calculate dimensions of the current mip level.
			const mipWidth = Math.max(1, textureInfo.width >> mipLevel);
			const mipHeight = Math.max(1, textureInfo.height >> mipLevel);

			// Get the offset of the next mipmap and calculate end offset.
			const nextMipOffset = textureInfo.mipLevelOffset[mipLevel] || textureInfo.mipSize;
			const end = textureInfo.mipPtr + nextMipOffset;

			// Copy the data from the heap.
			const start = textureInfo.mipPtr + mipOffset;
			const mipData = this._module.HEAPU8.slice(start, end);

			if (this.logging) {
				console.debug(`  - Mip ${mipLevel}: ${mipWidth}x${mipHeight}, offset=${mipOffset}, range=${start}-${end}`);
			}
			// console.debug(uint8ArrayToBase64(mipData)); // will leak the data

			// Push this mip level data into the texture's mipmaps array.
			// @ts-ignore - data = "CompressedTextureMipmap & CubeTexture & HTMLCanvasElement"
			texture.mipmaps.push({
				data: mipData, // Should still accept Uint8Array.
				width: mipWidth,
				height: mipHeight
			});
		}
	}

	/**
	 * @param {number} _ - Originally pObj, unused here.
	 * @param {number} texturePtrPtr - Pointer to the texture handle (pTexture2D).
	 */
	private _textureDeleteFunc(_: never, texturePtrPtr: number): void {
		const texId = this._module.HEAPU32[texturePtrPtr / 4];
		// this.delete(texId);
		// NOTE: This is effectively no longer used as when
		// we delete a CharModel instance it deletes
		// cap/noseline/glass textures before we are
		// finished with the model itself. It is now only logging
		const tex = this._textures.get(texId);
		if (tex && this.logging) {
			console.debug('Delete texture    ', tex.id);
		}
	}

	/**
	 * @param {number} id - ID assigned to the texture.
	 * @returns {import('three').Texture|null|undefined} Returns the texture if it is found.
	 */
	public get(id: number): THREE.Texture | null | undefined {
		const texture = this._textures.get(id);
		if (!texture && this.logging) {
			console.error('Unknown texture', id);
		}
		return texture;
	}

	/**
	 * @param {number} id - ID assigned to the texture.
	 * @param {import('three').Texture} texture - Texture to add.
	 */
	public set(id: number, texture: THREE.Texture): void {
		// Set texture with an override for dispose.
		const disposeReal = texture.dispose.bind(texture);
		texture.dispose = () => {
			// Remove this texture from the map after disposing.
			disposeReal();
			this.delete(id); // this = TextureManager
		};

		this._textures.set(id, texture);
		// Log is spaced to match delete/deleting/dispose messages.
		if (this.logging) {
			console.debug('Adding texture    ', texture.id);
		}
	}

	/**
	 * @param {number} id - ID assigned to the texture.
	 */
	public delete(id: number): void {
		// Get texture from array instead of with get()
		// because it's okay if it was already deleted.
		const texture = this._textures.get(id);
		if (texture) {
			// This is assuming the texture has already been disposed.
			(texture as Record<string, any>).source = null;
			(texture as Record<string, any>).mipmaps = null;
			if (this.logging) {
				console.debug('Deleted texture   ', id);
			}
			this._textures.delete(id);
		}
	}

	/**
	 * Disposes/frees the {@link FFLTextureCallback} along with
	 * removing the created Emscripten functions.
	 */
	public disposeCallback(): void {
		// if (!this._module) {
		// 	return;
		// }
		if (this._textureCallbackPtr) {
			this._module._free(this._textureCallbackPtr);
			this._textureCallbackPtr = 0;
		}
		if (this._deleteCallback) {
			this._module.removeFunction(this._deleteCallback);
			this._deleteCallback = 0;
		}
		// should always exist?:
		if (this._createCallback) {
			this._module.removeFunction(this._createCallback);
			this._createCallback = 0;
		}
		// this._module = null;
	}

	/**
	 * Disposes of all textures and frees the {@link FFLTextureCallback}.
	 */
	public dispose(): void {
		// Dispose of all stored textures.
		this._textures.forEach((tex) => {
			tex.dispose();
		});

		// Clear texture map.
		this._textures.clear();
		// Free texture callback.
		this.disposeCallback();
	}
}

/** @typedef {import('three/src/renderers/common/Renderer.js', {with:{'resolution-mode':'import'}}).default} Renderer */

/**
 * Sets the state for whether WebGL 1.0 or WebGPU is being used.
 * Otherwise, textures will appear wrong when not using WebGL 2.0.
 * @param {Renderer} renderer - The WebGLRenderer or WebGPURenderer.
 * @param {Module} module - The module. Must be initialized along with the renderer.
 */
export function setRendererState(renderer: Renderer, module: Module): void {
	console.assert(renderer && module, `setRendererState: The renderer and module must both be valid.`);
	if ('capabilities' in renderer &&
		!((renderer.capabilities as THREE.WebGLCapabilities).isWebGL2)) {
		TextureManager.isWebGL1 = true;
	} else if (_isWebGPU(renderer)) {
		module._FFLSetTextureFlipY(false);
	}
}
