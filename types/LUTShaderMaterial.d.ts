declare namespace _exports {
    export { FFLModulateMode, FFLModulateType, THREE };
}
declare const _exports: {
    new (options?: {
        modulateMode?: number | undefined;
        modulateType?: number | undefined;
        modulateColor?: import("three").Vector4 | import("three").Vector4[] | undefined;
        lightEnable?: boolean | undefined;
        lightDirection?: import("three").Vector3 | undefined;
        alphaTest?: boolean | undefined;
        hslightGroundColor?: import("three").Color | undefined;
        hslightSkyColor?: import("three").Color | undefined;
        dirLightColor0?: import("three").Color | undefined;
        dirLightColor1?: import("three").Color | undefined;
        dirLightCount?: number | undefined;
        dirLightDirAndType0?: import("three").Vector4 | undefined;
        dirLightDirAndType1?: import("three").Vector4 | undefined;
        lightColor?: import("three").Color | undefined;
        map?: import("three").Texture | undefined;
        vertexShader?: string | undefined;
        fragmentShader?: string | undefined;
        side?: import("three").Side | undefined;
    }): {
        /** @type {FFLModulateMode} */
        modulateMode: FFLModulateMode;
        /** @type {FFLModulateType} */
        modulateType: FFLModulateType;
        /** @package */
        _modulateColor: import("three").Vector4 | null | undefined;
        /** @type {boolean} */
        lightEnable: boolean;
        /** @type {number|undefined} */
        _side: number | undefined;
        /**
         * Gets the texture map.
         * @returns {THREE['Texture']} The texture map.
         */
        get map(): THREE["Texture"];
        /**
         * Sets the texture map.
         * @param {import('three').Texture} value - The new texture map.
         */
        set map(value: import("three").Texture);
        /**
         * Gets the first/primary constant color.
         * @returns {import('three').Vector4} The color as Vector4.
         */
        modulateColor: import("three").Vector4;
        /**
         * Gets the light direction.
         * @returns {import('three').Vector3} The light direction.
         */
        lightDirection: import("three").Vector3;
        readonly isShaderMaterial: true;
        defines: {
            [key: string]: any;
        };
        uniforms: {
            [uniform: string]: import("three").IUniform;
        };
        uniformsGroups: import("three").UniformsGroup[];
        vertexShader: string;
        fragmentShader: string;
        linewidth: number;
        wireframe: boolean;
        wireframeLinewidth: number;
        fog: boolean;
        lights: boolean;
        clipping: boolean;
        extensions: {
            clipCullDistance: boolean;
            multiDraw: boolean;
        };
        defaultAttributeValues: any;
        index0AttributeName: string | undefined;
        uniformsNeedUpdate: boolean;
        glslVersion: import("three").GLSLVersion | null;
        setValues(parameters: import("three").ShaderMaterialParameters): void;
        toJSON(meta?: import("three").JSONMeta): import("three").ShaderMaterialJSON;
        readonly isMaterial: true;
        type: string;
        alphaHash: boolean;
        alphaToCoverage: boolean;
        blendAlpha: number;
        blendColor: import("three").Color;
        blendDst: import("three").BlendingDstFactor;
        blendDstAlpha: number | null;
        blendEquation: import("three").BlendingEquation;
        blendEquationAlpha: number | null;
        blending: import("three").Blending;
        blendSrc: import("three").BlendingSrcFactor | import("three").BlendingDstFactor;
        blendSrcAlpha: number | null;
        clipIntersection: boolean;
        clippingPlanes: import("three").Plane[] | null;
        clipShadows: boolean;
        colorWrite: boolean;
        depthFunc: import("three").DepthModes;
        depthTest: boolean;
        depthWrite: boolean;
        id: number;
        stencilWrite: boolean;
        stencilFunc: import("three").StencilFunc;
        stencilRef: number;
        stencilWriteMask: number;
        stencilFuncMask: number;
        stencilFail: import("three").StencilOp;
        stencilZFail: import("three").StencilOp;
        stencilZPass: import("three").StencilOp;
        name: string;
        opacity: number;
        polygonOffset: boolean;
        polygonOffsetFactor: number;
        polygonOffsetUnits: number;
        precision: "highp" | "mediump" | "lowp" | null;
        premultipliedAlpha: boolean;
        forceSinglePass: boolean;
        dithering: boolean;
        side: import("three").Side;
        shadowSide: import("three").Side | null;
        toneMapped: boolean;
        transparent: boolean;
        uuid: string;
        vertexColors: boolean;
        visible: boolean;
        userData: Record<string, any>;
        version: number;
        alphaTest: number;
        onBeforeRender(renderer: import("three").WebGLRenderer, scene: import("three").Scene, camera: import("three").Camera, geometry: import("three").BufferGeometry, object: import("three").Object3D, group: import("three").Group): void;
        onBeforeCompile(parameters: import("three").WebGLProgramParametersWithUniforms, renderer: import("three").WebGLRenderer): void;
        customProgramCacheKey(): string;
        clone(): /*elided*/ any;
        copy(material: import("three").Material): /*elided*/ any;
        dispose(): void;
        needsUpdate: boolean;
        onBuild(object: import("three").Object3D, parameters: import("three").WebGLProgramParametersWithUniforms, renderer: import("three").WebGLRenderer): void;
        addEventListener<T extends "dispose">(type: T, listener: import("three").EventListener<{
            dispose: {};
        }[T], T, /*elided*/ any>): void;
        hasEventListener<T extends "dispose">(type: T, listener: import("three").EventListener<{
            dispose: {};
        }[T], T, /*elided*/ any>): boolean;
        removeEventListener<T extends "dispose">(type: T, listener: import("three").EventListener<{
            dispose: {};
        }[T], T, /*elided*/ any>): void;
        dispatchEvent<T extends "dispose">(event: import("three").BaseEvent<T> & {
            dispose: {};
        }[T]): void;
    };
    /**
     * @enum {number}
     */
    LUTSpecularTextureType: {
        NONE: number;
        DEFAULT_02: number;
        SKIN_01: number;
        MAX: number;
    };
    /**
     * @enum {number}
     */
    LUTFresnelTextureType: {
        NONE: number;
        DEFAULT_02: number;
        SKIN_01: number;
        MAX: number;
    };
    /**
     * LUT definitions for materials used in the original shader.
     * Taken from XMLs in the same folder as the original TGAs..
     * @typedef {Object<LUTSpecularTextureType, HermitianCurve>} SpecularLUT
     * @typedef {Object<LUTFresnelTextureType, HermitianCurve>} FresnelLUT
     * @type {{ specular: SpecularLUT, fresnel: FresnelLUT }}
     * @package
     */
    lutDefinitions: {
        specular: any;
        fresnel: any;
    };
    /**
     * @type {Object<FFLModulateType, LUTSpecularTextureType>}
     */
    modulateTypeToLUTSpecular: any;
    /**
     * @type {Object<FFLModulateType, LUTFresnelTextureType>}
     */
    modulateTypeToLUTFresnel: any;
    /**
     * Cached LUT textures to avoid redundant generation.
     * @typedef {Object} LUTTextures
     * @property {Object<LUTSpecularTextureType, import('three').DataTexture>} specular - Specular LUT textures indexed by LUT type.
     * @property {Object<LUTSpecularTextureType, import('three').DataTexture>} fresnel - Fresnel LUT textures indexed by LUT type.
     */
    /**
     * @type {LUTTextures|null}
     * @package
     */
    _lutTextures: {
        /**
         * - Specular LUT textures indexed by LUT type.
         */
        specular: any;
        /**
         * - Fresnel LUT textures indexed by LUT type.
         */
        fresnel: any;
    } | null;
    /**
     * Generates and return LUT textures.
     * @param {number} [lutSize] - Width of the LUT.
     * @returns {LUTTextures} Specular and fresnel LUT textures.
     */
    getLUTTextures(lutSize?: number): {
        /**
         * - Specular LUT textures indexed by LUT type.
         */
        specular: any;
        /**
         * - Fresnel LUT textures indexed by LUT type.
         */
        fresnel: any;
    };
    /** @type {import('three').Color} */
    defaultHSLightGroundColor: import("three").Color;
    /** @type {import('three').Color} */
    defaultHSLightSkyColor: import("three").Color;
    /** @type {import('three').Color} */
    defaultDirLightColor0: import("three").Color;
    /** @type {import('three').Color} */
    defaultDirLightColor1: import("three").Color;
    defaultDirLightCount: number;
    /** @type {import('three').Vector4} */
    defaultDirLightDirAndType0: import("three").Vector4;
    /** @type {import('three').Vector4} */
    defaultDirLightDirAndType1: import("three").Vector4;
    /** @type {import('three').Color} */
    defaultLightColor: import("three").Color;
    /**
     * Alias for default light direction.
     * @type {import('three').Vector4}
     */
    defaultLightDirection: import("three").Vector4;
    /**
     * Retrieves blending parameters based on the FFLModulateType.
     * @param {FFLModulateType} modulateType - The modulate type.
     * @returns {Object} An object containing blending parameters for the material constructor.
     * @throws {Error} Unknown modulate type
     * @package
     */
    getBlendOptionsFromModulateType(modulateType: FFLModulateType): Object;
    /**
     * Multiplies beard and hair colors by a factor seen
     * in libcocos2dcpp.so in order to match its rendering style.
     * Refer to: https://github.com/ariankordi/FFL-Testing/blob/16dd44c8848e0820e03f8ccb0efa1f09f4bc2dca/src/ShaderMiitomo.cpp#L587
     * @param {import('three').Vector4} color - The original color.
     * @param {FFLModulateType} modulateType - The modulate type, or type of shape.
     * @param {FFLModulateMode} modulateMode - The modulate mode, used to confirm custom body type.
     * @returns {import('three').Vector4} The final color.
     * @package
     */
    multiplyColorIfNeeded(color: import("three").Vector4, modulateType: FFLModulateType, modulateMode: FFLModulateMode): import("three").Vector4;
};
export = _exports;
type FFLModulateMode = number;
type FFLModulateType = number;
type THREE = typeof import("three");
