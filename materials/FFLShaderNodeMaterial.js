/**
 * @file FFLShaderNodeMaterial.js
 * Three.js node material class (for WebGPURenderer) meant
 * to reproduce the FFLDefaultShader, like FFLShaderMaterial.js.
 * @author Arian Kordi <https://github.com/ariankordi>
 */
// @ts-check
import { Color, Vector4 } from 'three';
import { AttributeNode, NodeMaterial } from 'three/webgpu';
import {
	Fn, uniform, materialReference,
	vec3, vec4, float, select,
	dot, max, pow, reflect, abs,
	oneMinus, sqrt, negate, mix,
	nodeObject, normalView,
	tangentView, positionViewDirection
} from 'three/tsl';
import TextureShaderNodeMaterial from './TextureShaderNodeMaterial.js';
import FFLShaderMaterial from './FFLShaderMaterial.js';

/**
 * Provides the "_color" / "param" attribute, or a placeholder if it doesn't exist.
 * See VertexColorNode: https://github.com/mrdoob/three.js/blob/cbc975bfee24bca21d22797bacc45a8b8a2f3ebe/src/nodes/accessors/VertexColorNode.js#L63
 * @augments AttributeNode
 */
class ParamColorNode extends AttributeNode {
	constructor() {
		super('', 'vec4');
	}

	getAttributeName = () => '_color';

	/**
	 * @param {import('three/webgpu').NodeBuilder} builder - The builder.
	 * @returns {string|null|undefined}
	 */
	generate(builder) {
		return builder.hasGeometryAttribute(
			this.getAttributeName()
		) === true
			? super.generate(builder)
			// Vertex color fallback should be white
			: builder.generateConst(this.nodeType, new Vector4(1, 1, 0, 1));
	}
}

/**
 * NodeMaterial port of {@link FFLShaderMaterial} in Three.js Shading Language.
 * Makes use of {@link TextureShaderNodeMaterial} for texture modulation.
 */
export default class FFLShaderNodeMaterial extends NodeMaterial {
	/** @param {import('three').MeshBasicMaterialParameters & {color?: Color|Array<Color>}} [options] */
	constructor(options = {}) {
		super();

		this.map = options.map; // Set texture map.
		// Use setter to set all colors if they are there.
		this.color = options.color ?? new Color();

		// Set FFL specific defaults, which will be overridden by options.
		this.modulateMode = this.modulateType = 0;
		this.lightEnable = true;
		// TODO: I don't think properties such as opacity actually update.

		this.setValues(options); // Set all from options.

		// Default uniforms from FFLShaderMaterial.
		this.uLightAmbient = uniform(FFLShaderMaterial.defaultLightAmbient);
		this.uLightDiffuse = uniform(FFLShaderMaterial.defaultLightDiffuse);
		this.uLightSpecular = uniform(FFLShaderMaterial.defaultLightSpecular);
		this.uLightDir = uniform(FFLShaderMaterial.defaultLightDir.clone().normalize());
		this.uRimPower = uniform(FFLShaderMaterial.defaultRimPower);

		// TODO: Like TextureShaderNodeMaterial, this needs alpha testing.
		this.fragmentNode = Fn(() => {
			// TODO: This should be included more elegantly.
			// Like, we need it to be a colorNode.
			const color = TextureShaderNodeMaterial.fragmentNode({
				diffuse: uniform(this.diffuse),
				color1: uniform(this.color1),
				color2: uniform(this.color2),
				opacity: uniform(this.opacity),
				modulateMode: uniform(this._modulateMode),
				texel: this.map ? materialReference('map', 'texture') : null
			});

			if (!this.lightEnable) {
				return color;
			}
			// TODO: The logic below can probably be made into
			// specific nodes. lightsNode? or... MeshPhongNodeMaterial.specularNode?????

			// Normal vector, eye point, light direction.
			const norm = normalView;
			const eye = positionViewDirection;
			const lightDir = vec3(this.uLightDir);
			/** Light Direction * Normal, max = 0.1. */
			const fDot = max(dot(lightDir, norm), float(0.1));

			/** Ambient */
			const ambient = vec3(this.uLightAmbient).mul(vec3(this.uMaterialAmbient));
			/** Diffuse */
			const diffuse = vec3(this.uLightDiffuse)
				.mul(vec3(this.uMaterialDiffuse))
				.mul(fDot);

			/** Specular (Blinn) */
			const specularBlinn =
				pow(max(dot(reflect(
					negate(lightDir), norm), eye), float(0.0)),
				float(this.uMaterialSpecularPower));

			// Use tangent for aniso specular.
			const tangent = vec3(tangentView);

			const dotLT = dot(lightDir, tangent);
			const dotVT = dot(eye, tangent);
			const dotLN = sqrt(oneMinus(dotLT.mul(dotLT)));
			const dotVR = dotLN.mul(sqrt(oneMinus(dotVT.mul(dotVT)))).sub(dotLT.mul(dotVT));
			/** Anisotropic specular */
			const specularAniso = pow(max(dotVR, float(0.0)),
				float(this.uMaterialSpecularPower));

			// 0 = Blinn, 1 = Anisotropic
			const useAniso = float(this.uMaterialSpecularMode);

			/** Anisotropic/rim color parameters. */
			// const param = attribute('_color', 'vec4');
			const param = nodeObject(new ParamColorNode());
			const anisoReflection = mix(specularAniso, specularBlinn, param.r);

			/** Anisotropic or Blinn reflection. */
			const reflection = select(
				useAniso.equal(1),
				anisoReflection,
				specularBlinn
			);

			/** Specular strength. Blinn = always 1.0 */
			const strength = select(
				useAniso.equal(1),
				param.g, // Blend ratio.
				float(1.0)
			);

			/** Final specular calculation from blinn/aniso reflection and strength. */
			const specular = vec3(this.uLightSpecular)
				.mul(vec3(this.uMaterialSpecular))
				.mul(reflection)
				.mul(strength);

			/** Rim color */
			const rimColor = vec3(this.uRimColor)
				.mul(
					// param.a = rim width
					pow(param.a.mul(oneMinus(abs(norm.z))), float(this.uRimPower))
				);

			// Final combined ambient/specular/diffuse color.
			return vec4(
				ambient.add(diffuse)
					.mul(color.rgb)
					.add(specular)
					.add(rimColor),
				color.a);
		})();
	}

	/**
	 * Gets the constant color (diffuse) uniform as THREE.Color.
	 * @returns {import('three').Color|undefined} The constant color if set.
	 */
	get color() {
		return this.diffuse;
	}

	/**
	 * Sets the constant color uniforms from THREE.Color.
	 * @param {import('three').Color|Array<import('three').Color>} value -
	 * The constant color (diffuse), or multiple (diffuse/color1/color2) to set the uniforms for.
	 */
	set color(value) {
		// Set an array of colors, assumed to have 3 elements.
		if (Array.isArray(value)) {
			// Assign multiple color instances.
			this.diffuse = value[0];
			this.color1 = value[1];
			this.color2 = value[2];
		} else {
			// Otherwise, assign diffuse and the other colors
			// all to the single color instance.
			this.diffuse = this.color1 = this.color2 = value;
		}
	}

	/** @returns {import('../ffl.js').FFLModulateMode|undefined} The modulateMode value, or null if it is unset. */
	get modulateMode() {
		return this._modulateMode;
	}

	/** @param {import('../ffl.js').FFLModulateMode} value - The new modulateMode value. */
	set modulateMode(value) {
		this._modulateMode = value;
	}

	/**
	 * Gets the modulateType value.
	 * @returns {import('../ffl.js').FFLModulateType|undefined} The modulateType value if it is set.
	 */
	get modulateType() {
		// This isn't actually a uniform so this is a private property.
		return this._modulateType;
	}

	/**
	 * Sets the material uniforms based on the modulate type value.
	 * @param {import('../ffl.js').FFLModulateType} value - The new modulateType value.
	 */
	set modulateType(value) {
		// Get material uniforms for modulate type from materialParams table.
		const matParam = FFLShaderMaterial.materialParams[value];
		if (!matParam) {
			// Out of bounds modulateType that don't have materials
			// are usually for mask/faceline textures, so don't throw error
			return;
		}
		this._modulateType = value;

		this.uMaterialAmbient = uniform(matParam.ambient);
		this.uMaterialDiffuse = uniform(matParam.diffuse);
		this.uMaterialSpecular = uniform(matParam.specular);
		this.uMaterialSpecularMode = uniform(matParam.specularMode);
		this.uMaterialSpecularPower = uniform(matParam.specularPower);
		const rimColor = value > 8
			? FFLShaderMaterial.defaultRimColorBody
			: FFLShaderMaterial.defaultRimColor;
		this.uRimColor = uniform(rimColor);
	}

	/**
	 * Gets the light direction.
	 * @returns {import('three').Vector3} The light direction.
	 */
	get lightDirection() {
		// Should always be set as long as this is constructed.
		return this.uLightDir.value;
	}

	/**
	 * Sets the light direction.
	 * @param {import('three').Vector3} value - The new light direction.
	 */
	set lightDirection(value) {
		this.uLightDir.value = value;
	}
}
