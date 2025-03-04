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
        lightAmbient?: import("three").Color | undefined;
        lightDiffuse?: import("three").Color | undefined;
        lightSpecular?: import("three").Color | undefined;
        useSpecularModeBlinn?: boolean | undefined;
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
        /**
         * Gets the texture map.
         * @returns {import('three').Texture} The texture map.
         */
        map: import("three").Texture;
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
     * Default ambient light color.
     * @type {import('three').Color}
     */
    defaultLightAmbient: import("three").Color;
    /**
     * Default diffuse light color.
     * @type {import('three').Color}
     */
    defaultLightDiffuse: import("three").Color;
    /**
     * Default specular light color.
     * @type {import('three').Color}
     */
    defaultLightSpecular: import("three").Color;
    /**
     * Default light direction.
     * @type {import('three').Vector3}
     */
    defaultLightDir: import("three").Vector3;
    /**
     * Default rim color.
     * @type {import('three').Color}
     */
    defaultRimColor: import("three").Color;
    /**
     * Default rim power (intensity).
     * @type {number}
     */
    defaultRimPower: number;
    /**
     * Alias for default light direction.
     * @type {import('three').Vector3}
     */
    defaultLightDirection: import("three").Vector3;
    /**
     * Material uniform table mapping to FFLModulateType.
     * @package
     */
    materialParams: {
        ambient: import("three").Color;
        diffuse: import("three").Color;
        specular: import("three").Color;
        specularPower: number;
        specularMode: number;
    }[];
    /**
     * Retrieves blending parameters based on the FFLModulateType.
     * @param {FFLModulateType} modulateType - The modulate type.
     * @returns {Object} An object containing blending parameters for the material constructor.
     * @throws {Error} Unknown modulate type
     * @package
     */
    getBlendOptionsFromModulateType(modulateType: FFLModulateType): Object;
};
export = _exports;
type FFLModulateMode = number;
type FFLModulateType = number;
type THREE = typeof import("three");
