import { FFLModulateMode, FFLModulateType } from '../enums';
import type { Color, Vector3, Texture } from 'three';

type FFLShaderMaterialParameters = {
	/** Modulate mode. */
	modulateMode?: FFLModulateMode;
	/** Modulate type. */
	modulateType?: FFLModulateType;
	/**
	 * Constant color assigned to u_const1/2/3 depending on single or array.
	 */
	color?: Color | Array<Color>;
	/** Enable lighting. Needs to be off when drawing faceline/mask textures. */
	lightEnable?: boolean;
	/** Light direction. */
	lightDirection?: Vector3;
	/**
	 * Whether to override specular mode on all materials with 0 (Blinn-Phong specular).
	 */
	useSpecularModeBlinn?: boolean;
	/** Texture map. */
	map?: Texture;
};

export default FFLShaderMaterialParameters;
