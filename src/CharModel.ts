import * as THREE from 'three';
import { Module } from '@/Module';
import TextureManager from '@/TextureManager';
import { FFLExpression, FFLiShapeType, FFLModelFlag, FFLModulateType } from '@/enums';
import { FFL_RESOLUTION_MASK, FFLCharModelDesc, FFLiCharInfo, FFLiCharModel, FFLiMaskTexturesTempObject, FFLiTextureTempObject, FFLStoreData_size, FFLPartsTransform } from '@/StructFFLiCharModel';
import { _getFFLColor, _getFFLColor3, drawParamToMesh } from '@/DrawParam';
import { FFLColor, FFLVec3 } from '@/structs';
import { disposeMany } from '@/RenderTargetUtils';
import { ExpressionNotSet } from '@/Exceptions';
import { PantsColor } from '@/Body';
import SampleShaderMaterialColorInfo from '@/materials/SampleShaderMaterialColorInfo';

export type MaterialConstructor = new (...args: any[]) => THREE.Material;


// --------------------------- Class: CharModel -------------------------------
/**
 * Represents an FFLCharModel, which is the head model.
 * Encapsulates a pointer to the underlying instance and provides helper methods.
 *
 * NOTE: This is a wrapper around CharModel. In order to create one,
 * either call createCharModel or pass the pointer of a manually created
 * CharModel in here. So *DO NOT* call this constructor directly!
 * @public
 */
export default class CharModel {
	/** Permanent reference to the original pointer. */
	private __ptr: number;
	private _facelineColor?: THREE.Color;
	private _favoriteColor?: THREE.Color;
	private _boundingBox?: THREE.Box3;
	private _partsTransform?: ReturnType<typeof FFLPartsTransform.unpack>;

	/**
	 * The unpacked representation of the underlying
	 * FFLCharModel instance. Note that this is not
	 * meant to be updated at all and changes to
	 * this instance will not apply in FFL whatsoever.
	 */
	public readonly _model: ReturnType<typeof FFLiCharModel.unpack>;

	/** The {@link TextureManager} instance for this CharModel. */
	public _textureManager: TextureManager;

	/**
	 * The data used to construct the CharModel, set in {@link createCharModel} and used in {@link updateCharModel}.
	 */
	public _data: any;

	/**
	 * Pointer to the FFLiCharModel in memory, set to null when deleted.
	 */
	public _ptr: number | null;

	/** The Emscripten module. */
	public _module: Module;

	/** RenderTarget for faceline. */
	public _facelineTarget: THREE.RenderTarget | null;

	/** RenderTargets for each expression mask. */
	public _maskTargets: (THREE.RenderTarget | null)[];

	/**
	 * Material class used for the CharModel.
	 */
	public _materialClass: MaterialConstructor;

	/**
	 * Material class used to initialize textures specifically.
	 */
	public _materialTextureClass: MaterialConstructor;

	/**
	 * List of enabled expressions that can be set with {@link CharModel.setExpression}.
	 */
	public expressions: Array<FFLExpression>;

	/**
	 * Group of THREE.Mesh objects representing the CharModel.
	 */
	public meshes: THREE.Group;

	public _facelineMesh?: THREE.Mesh | null;
	public _maskMesh?: THREE.Mesh | null;

	/**
	 * @param {number} ptr - Pointer to the FFLiCharModel structure in heap.
	 * @param {Module} module - The Emscripten module.
	 * @param {MaterialConstructor} materialClass - Class for the material (constructor), e.g.: FFLShaderMaterial
	 * @param {TextureManager} texManager - The {@link TextureManager} instance for this CharModel.
	 */
	constructor(ptr: number, module: Module, materialClass: MaterialConstructor, texManager: TextureManager) {
		this._module = module;
		this._data = null;
		this._materialClass = materialClass; // Store the material class.
		this._materialTextureClass = materialClass;
		this._textureManager = texManager;
		this._ptr = ptr;
		this.__ptr = ptr; // Permanent reference.

		// Unpack the FFLiCharModel structure from heap.
		const charModelData = this._module.HEAPU8.subarray(ptr, ptr + FFLiCharModel.size);

		this._model = FFLiCharModel.unpack(charModelData);
		// NOTE: The only property SET in _model is expression.
		// Everything else is read.

		// Add RenderTargets for faceline and mask.
		this._facelineTarget = null;
		this._maskTargets = new Array(FFLExpression.MAX).fill(null);
		this.expressions = [];
		this.meshes = new THREE.Group();
		// Set boundingBox getter ("this" = CharModel), dummy geometry needed
		// this.meshes.geometry = { }; // NOTE: is this a good idea?
		// Object.defineProperty(this.meshes.geometry, 'boundingBox',
		// { get: () => this.boundingBox }); // NOTE: box is too large using this

		this._addCharModelMeshes(module); // Populate this.meshes.
	}

	// ----------------------- _addCharModelMeshes(module) -----------------------
	/**
	 * This is the method that populates meshes
	 * from the internal FFLiCharModel instance.
	 * @param {Module} module - Module to pass to drawParamToMesh to access mesh data.
	 */
	private _addCharModelMeshes(module: Module): void {
		console.assert(this.meshes, '_addCharModelMeshes: this.meshes is null or undefined, was this CharModel disposed?');

		/** @type {import('./materials/SampleShaderMaterial').SampleShaderMaterialColorInfo|null} */
		let colorInfo = null;
		// Prepare colorInfo from CharModel if it is needed on the mesh's material.
		if ('colorInfo' in this._materialClass.prototype) {
			colorInfo = this.getColorInfo();
		}

		// Add all meshes in the CharModel to the class instance.
		for (let shapeType = 0; shapeType < FFLiShapeType.MAX; shapeType++) {
			// Iterate through all DrawParams and convert to THREE.Mesh.
			const drawParam = this._model.drawParam[shapeType];

			// Skip shape if it's not empty.
			if (!drawParam.primitiveParam.indexCount) {
				continue;
			}
			const mesh = drawParamToMesh(drawParam, this._materialClass,
				module, this._textureManager);
			// Use FFLModulateType to indicate render order.
			mesh.renderOrder = drawParam.modulateParam.type;

			// Assign colorInfo from the CharModel.
			if ('colorInfo' in mesh.material) {
				mesh.material.colorInfo = colorInfo;
			}

			// Set faceline and mask meshes to use later.
			switch (shapeType) {
				case FFLiShapeType.OPA_FACELINE:
					this._facelineMesh = mesh;
					break;
				case FFLiShapeType.XLU_MASK:
					this._maskMesh = mesh;
					break;
			}

			this.meshes.add(mesh); // Add the mesh or null.
		}
	}

	// --------------------------- Private Get Methods ---------------------------

	/**
	 * @returns {number} Pointer to pTextureTempObject.
	 */
	private _getTextureTempObjectPtr(): number {
		return this._model.pTextureTempObject;
	}

	/**
	 * @returns {FFLiTextureTempObject} The TextureTempObject containing faceline and mask DrawParams.
	 */
	public _getTextureTempObject(): ReturnType<typeof FFLiTextureTempObject.unpack> {
		const ptr = this._getTextureTempObjectPtr();
		return FFLiTextureTempObject.unpack(
			this._module.HEAPU8.subarray(ptr, ptr + FFLiTextureTempObject.size));
	}

	/**
	 * Accesses partsTransform in FFLiCharModel,
	 * converting every FFLVec3 to THREE.Vector3.
	 * @returns {PartsTransform} PartsTransform using THREE.Vector3 as keys.
	 */
	private _getPartsTransform(): ReturnType<typeof FFLPartsTransform.unpack> {
		const obj: Record<string, ReturnType<typeof FFLVec3.unpack>> = (this._model.partsTransform);
		const newPartsTransform: ReturnType<typeof FFLPartsTransform.unpack> = {};
		for (const key in obj) {
			const vec = obj[key];
			// sanity check make sure there is "x"
			console.assert(vec.x);
			// convert to THREE.Vector3
			newPartsTransform[key] = new THREE.Vector3(vec.x, vec.y, vec.z);
		}
		return newPartsTransform;
	}

	/**
	 * @returns {import('three').Color} The faceline color as THREE.Color.
	 */
	private _getFacelineColor(): THREE.Color {
		// const color = this.additionalInfo.skinColor;
		// return new THREE.Color(color.r, color.g, color.b);
		const mod = this._module;
		const facelineColor = this._model.charInfo.faceColor;
		/** Allocate return pointer. */
		const colorPtr = mod._malloc(FFLColor.size);
		mod._FFLGetFacelineColor(colorPtr, facelineColor);
		const color = _getFFLColor3(_getFFLColor(colorPtr, mod.HEAPF32));
		mod._free(colorPtr);
		return color;
		// Assume this is in working color space because it is used for clear color.
	}

	/**
	 * @returns {import('three').Color} The favorite color as THREE.Color.
	 */
	private _getFavoriteColor(): THREE.Color {
		const mod = this._module;
		const favoriteColor = this._model.charInfo.favoriteColor;
		/** Allocate return pointer. */
		const colorPtr = mod._malloc(FFLColor.size);
		mod._FFLGetFavoriteColor(colorPtr, favoriteColor); // Get favoriteColor from CharInfo.
		const color = _getFFLColor3(_getFFLColor(colorPtr, mod.HEAPF32));
		mod._free(colorPtr);
		return color;
	}

	/**
	 * @returns {Uint8Array} The CharInfo instance.
	 */
	private _getCharInfoUint8Array(): Uint8Array {
		return FFLiCharInfo.pack(this._model.charInfo);
	}

	/**
	 * @returns {number} Pointer to pTextureTempObject->maskTextures->partsTextures.
	 */
	protected _getPartsTexturesPtr(): number {
		// eslint-disable-next-line @stylistic/max-len -- indent conflicts with something else
		return this._model.pTextureTempObject + FFLiTextureTempObject.fields.maskTextures.offset + FFLiMaskTexturesTempObject.fields.partsTextures.offset;
	}

	/**
	 * @returns {number} Pointer to pTextureTempObject->facelineTexture.
	 */
	public _getFacelineTempObjectPtr(): number {
		// eslint-disable-next-line @stylistic/max-len -- indent conflicts with something else
		return this._model.pTextureTempObject + FFLiTextureTempObject.fields.facelineTexture.offset;
	}

	/**
	 * @returns {number} Pointer to pTextureTempObject->maskTextures.
	 */
	public _getMaskTempObjectPtr(): number {
		// eslint-disable-next-line @stylistic/max-len -- indent conflicts with something else
		return this._model.pTextureTempObject + FFLiTextureTempObject.fields.maskTextures.offset;
	}

	/**
	 * @returns {number} Pointer to charModelDesc.allExpressionFlag.
	 */
	public _getExpressionFlagPtr(): number {
		// eslint-disable-next-line @stylistic/max-len -- indent conflicts with something else
		return (this._ptr || 0) + (FFLiCharModel.fields.charModelDesc.offset as number) + (FFLCharModelDesc.fields.allExpressionFlag.offset as number);
	}

	/**
	 * Calculates the bounding box from the meshes.
	 * @returns {import('three').Box3} The bounding box.
	 */
	private _getBoundingBox(): THREE.Box3 {
		// Note: FFL includes three different bounding boxes for each
		// FFLModelType. This only creates one box per CharModel.
		const excludeFromBox = [FFLModulateType.SHAPE_MASK, FFLModulateType.SHAPE_GLASS];
		// Create bounding box selectively excluding mask and glass.
		const box = new THREE.Box3();

		this.meshes.traverse((child) => {
			if (!(child instanceof THREE.Mesh) ||
				// Exclude meshes whose modulateType are in excludeFromBox.
				excludeFromBox.indexOf(child.geometry.userData.modulateType) !== -1) {
				return;
			}
			// Expand the box.
			box.expandByObject(child);
		});
		return box;
	}

	/**
	 * Get the texture resolution.
	 * @returns {number} The texture resolution.
	 */
	public _getResolution(): number {
		return this._model.charModelDesc.resolution & FFL_RESOLUTION_MASK;
	}

	/**
	 * Returns the value for whether the CharModel was created without shapes.
	 * @returns {boolean} Whether the CharModel was created without shapes.
	 */
	public _isTexOnly(): boolean {
		return (this._model.charModelDesc.modelFlag & FFLModelFlag.NEW_MASK_ONLY) !== 0;
	}

	// --------------------------------- Disposal ---------------------------------

	/**
	 * Finalizes the CharModel.
	 * Frees and deletes the CharModel right after generating textures.
	 * This is **not** the same as `dispose()` which cleans up the scene.
	 */
	public _finalizeCharModel(): void {
		if (!this._ptr) {
			return;
		}
		this._module._FFLDeleteCharModel(this._ptr);
		this._module._free(this._ptr);
		this._ptr = 0;
	}

	/**
	 * Disposes RenderTargets for textures created by the CharModel.
	 */
	public disposeTargets(): void {
		// Dispose RenderTargets.
		if (this._facelineTarget) {
			console.debug(`Disposing target ${this._facelineTarget.texture.id} for faceline`);
			this._facelineTarget.dispose();
			this._facelineTarget = null;
		}
		// _maskTargets should always be defined.
		this._maskTargets.forEach((target, i) => {
			if (!target) {
				// No mask for this expression.
				return;
			}
			console.debug(`Disposing target ${target.texture.id} for mask ${i}`);
			target.dispose();
			this._maskTargets[i] = null;
		});
	}

	// ---------------------- Public Methods - Cleanup, Data ----------------------

	/**
	 * Disposes the CharModel and removes all associated resources.
	 * - Disposes materials and geometries.
	 * - Deletes faceline texture if it exists.
	 * - Deletes all mask textures.
	 * - Removes all meshes from the scene.
	 * @param {boolean} disposeTargets - Whether or not to dispose of mask and faceline render targets.
	 */
	public dispose(disposeTargets = true): void {
		// Print the permanent __ptr rather than _ptr.
		console.debug('CharModel.dispose: ptr =', this.__ptr);
		this._finalizeCharModel(); // Should've been called already
		// Dispose meshes: materials, geometries, textures.
		if (this.meshes) {
			// Break these references first (still in meshes)
			this._facelineMesh = null;
			this._maskMesh = null;
			disposeMany(this.meshes);
			// @ts-expect-error - null not assignable. Always non-null except disposed.
			this.meshes = null;
		}
		// Dispose render textures.
		if (disposeTargets) {
			this.disposeTargets();
		}
		if (this._textureManager) {
			this._textureManager.dispose();
			// Null out reference to TextureManager, assuming
			// all textures within are already deleted by now.
			// @ts-expect-error - null not assignable. Always non-null except disposed.
			this._textureManager = null;
		}
	}

	/**
	 * Serializes the CharModel data to FFLStoreData.
	 * @returns {Uint8Array} The exported FFLStoreData.
	 * @throws {Error} Throws if call to _FFLpGetStoreDataFromCharInfo
	 * returns false, usually when CharInfo verification fails.
	 */
	public getStoreData(): Uint8Array {
		// Serialize the CharInfo.
		const charInfoData = this._getCharInfoUint8Array();

		const mod = this._module;
		// Allocate function arguments.
		/** Input */
		const charInfoPtr = mod._malloc(FFLiCharInfo.size);
		/** Output */
		const storeDataPtr = mod._malloc(FFLStoreData_size);
		mod.HEAPU8.set(charInfoData, charInfoPtr);

		// Call conversion function.
		const result = mod._FFLpGetStoreDataFromCharInfo(storeDataPtr, charInfoPtr);
		// Free and return data.
		const storeData = mod.HEAPU8.slice(storeDataPtr, storeDataPtr + FFLStoreData_size);
		mod._free(charInfoPtr);
		mod._free(storeDataPtr);

		if (!result) {
			throw new Error('getStoreData: call to FFLpGetStoreDataFromCharInfo returned false, CharInfo verification probably failed');
		}

		return storeData;
	}

	// TODO: getStudioCharInfo

	// ------------------------ Mask and Faceline Textures ------------------------

	/**
	 * Sets the expression for this CharModel and updates the corresponding mask texture.
	 * @param {FFLExpression} expression - The new expression index.
	 * @throws {Error} CharModel must have been initialized with the
	 * expression enabled in the flag and have XLU_MASK in meshes.
	 */
	public setExpression(expression: FFLExpression): void {
		this._model.expression = expression;

		/** or getMaskTexture()? */
		const targ = this._maskTargets[expression];
		if (!targ || !targ.texture) {
			throw new ExpressionNotSet(expression);
		}
		if (this._isTexOnly()) {
			return;
		}
		const mesh = this._maskMesh;
		if (!mesh || !(mesh instanceof THREE.Mesh)) {
			// So there is no mask mesh, which is not supposed to happen...
			// ... except for when the expression is 61 or 62, in which case just return.
			if (expression === FFLExpression.BLANK_61 || expression === FFLExpression.BLANK_62) {
				return; // Drop out without throwing or setting expression.
			}
			throw new Error('setExpression: mask mesh does not exist, cannot set expression on it');
		}
		// Update texture and material.
		(targ.texture as THREE.Texture & { _target: THREE.RenderTarget })._target = targ;
		(mesh.material as THREE.MeshBasicMaterial).map = targ.texture;
		(mesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
	}

	/**
	 * Gets the faceline texture, or the texture that wraps around
	 * the faceline shape (opaque, the one hair is placed atop).
	 * Not to be confused with the texture containing facial features
	 * such as eyes, mouth, etc. which is the mask.
	 * The faceline texture may not exist if it is not needed, in which
	 * case the faceline color is used directly, see property {@link facelineColor}.
	 * @returns {import('three').RenderTarget|null} The faceline render target, or null if it does not exist,
	 * in which case {@link facelineColor} should be used. Access .texture on this object to
	 * get a {@link THREE.Texture} from it. It becomes invalid if the CharModel is disposed.
	 */
	public getFaceline(): THREE.RenderTarget | null { // getFaceTexture / "FFLiGetFaceTextureFromCharModel"
		// Return the render target if it exists.
		if (this._facelineTarget) {
			return this._facelineTarget;
		}
		return null;
	}

	/**
	 * Gets the mask texture, or the texture containing facial
	 * features such as eyes, mouth, eyebrows, etc. This is wrapped
	 * around the mask shape, which is a transparent shape
	 * placed in front of the head model.
	 * @param {FFLExpression} expression - The desired expression, or the current expression.
	 * @returns {import('three').RenderTarget|null} The mask render target for the given expression,
	 * or null if the CharModel was not initialized with that expression.
	 * Access .texture on this object to get a {@link THREE.Texture} from it.
	 * It becomes invalid if the CharModel is disposed.
	 */
	public getMask(expression = this.expression): THREE.RenderTarget | null { // getMaskTexture
		// Return the render target if it exists.
		if (this._maskTargets && this._maskTargets[expression]) {
			return this._maskTargets[expression];
		}
		return null;
	}

	// ------------------------------ Public Getters ------------------------------

	/**
	 * The current expression for this CharModel.
	 * Read-only. Use setExpression to set the expression.
	 * @returns {FFLExpression} The current expression.
	 */
	public get expression(): FFLExpression {
		return this._model.expression; // mirror
	}

	/**
	 * Contains the CharInfo of the model.
	 * Changes to this will not be reflected whatsoever.
	 * @returns {FFLiCharInfo} The CharInfo of the model.
	 */
	public get charInfo(): void {
		return this._model.charInfo;
	}

	/**
	 * The faceline color for this CharModel.
	 * @returns {import('three').Color} The faceline color.
	 */
	public get facelineColor(): THREE.Color {
		if (!this._facelineColor) {
			/** @private */
			this._facelineColor = this._getFacelineColor();
		}
		return this._facelineColor;
	}

	/**
	 * The favorite color for this CharModel.
	 * @returns {import('three').Color} The favorite color.
	 */
	public get favoriteColor(): THREE.Color {
		if (!this._favoriteColor) {
			this._favoriteColor = this._getFavoriteColor();
		}
		return this._favoriteColor;
	}

	/**
	 * @returns {number} Gender as 0 = male, 1 = female
	 */
	public get gender(): number {
		return this._model.charInfo.gender;
	}

	/**
	 * The parameters in which to transform hats and other accessories.
	 * @returns {PartsTransform} PartsTransform using THREE.Vector3 as keys.
	 */
	public get partsTransform(): ReturnType<typeof FFLPartsTransform.unpack> {
		if (!this._partsTransform) {
			// Set partsTransform property as THREE.Vector3.
			this._partsTransform = this._getPartsTransform();
		}
		return this._partsTransform;
	}

	/**
	 * @returns {import('three').Box3} The bounding box.
	 */
	public get boundingBox(): THREE.Box3 {
		if (!this._boundingBox) {
			// Set boundingBox property as THREE.Box3.
			this._boundingBox = this._getBoundingBox();
		}
		return this._boundingBox;
	}

	/**
	 * Gets the ColorInfo object needed for SampleShaderMaterial.
	 * @param {boolean} isSpecial - Determines the pants color, gold if special or gray otherwise.
	 * @returns {import('./materials/SampleShaderMaterial').SampleShaderMaterialColorInfo}
	 * The colorInfo object needed by SampleShaderMaterial.
	 */
	public getColorInfo(isSpecial = false): SampleShaderMaterialColorInfo {
		const info = this._model.charInfo;
		return {
			facelineColor: info.faceColor,
			favoriteColor: info.favoriteColor,
			hairColor: info.hairColor,
			beardColor: info.beardColor,
			pantsColor: isSpecial
				? PantsColor.GoldSpecial
				: PantsColor.GrayNormal
		};
	}

	// -------------------------------- Body Scale --------------------------------

	/**
	 * Gets a vector in which to scale the body model for this CharModel.
	 * @returns {import('three').Vector3Like} Scale vector for the body model.
	 */
	public getBodyScale(): THREE.Vector3Like {
		const build = this._model.charInfo.build;
		const height = this._model.charInfo.height;

		// calculated here in libnn_mii/draw/src/detail/mii_VariableIconBodyImpl.cpp:
		// void nn::mii::detail::`anonymous namespace'::GetBodyScale(struct nn::util::Float3 *, int, int)
		// also in Mii Maker USA (0x000500101004A100 v50 ffl_app.rpx): FUN_020737b8
		const m = 128.0;
		const x = (build * (height * (0.47 / m) + 0.4)) / m +
			height * (0.23 / m) + 0.4;
		const y = (height * (0.77 / m)) + 0.5;

		return { x, y, z: x }; // z is always set to x
	}
}
