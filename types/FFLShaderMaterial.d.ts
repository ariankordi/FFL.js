declare namespace _exports {
    export { FFLModulateMode, FFLModulateType, THREE, FFLShaderMaterialParameters };
}
declare const _exports: {
    new (options?: import("three").ShaderMaterialParameters & FFLShaderMaterialParameters): {
        /** @type {FFLModulateType} */
        _modulateType: FFLModulateType;
        /**
         * Gets the value for whether to override specular mode with 0.
         * @returns {boolean|undefined} The useSpecularModeBlinn value.
         */
        get useSpecularModeBlinn(): boolean | undefined;
        /**
         * Sets whether to override specular mode with 0.
         * @param {boolean} value - The useSpecularModeBlinn value.
         */
        set useSpecularModeBlinn(value: boolean);
        /**
         * Gets the constant color (u_const1) uniform as THREE.Color.
         * @returns {import('three').Color|null} The constant color, or null if it is not set.
         */
        get color(): import("three").Color | null;
        /**
         * Sets the constant color uniforms from THREE.Color.
         * @param {import('three').Color|Array<import('three').Color>} value - The constant color (u_const1), or multiple (u_const1/2/3) to set the uniforms for.
         */
        set color(value: import("three").Color | Array<import("three").Color>);
        _color3: import("three").Color | undefined;
        /**
         * Gets the opacity of the constant color.
         * @returns {number} The opacity value.
         */
        opacity: number;
        _opacity: number | undefined;
        /**
         * Gets the value of the modulateMode uniform.
         * @returns {FFLModulateMode|null} The modulateMode value, or null if it is unset.
         */
        get modulateMode(): FFLModulateMode | null;
        /**
         * Sets the value of the modulateMode uniform.
         * @param {FFLModulateMode} value - The new modulateMode value.
         */
        set modulateMode(value: FFLModulateMode);
        /**
         * Sets the value determining whether lighting is enabled or not.
         * @returns {boolean|null} The lightEnable value, or null if it is unset.
         */
        get lightEnable(): boolean | null;
        /**
         * Sets the value determining whether lighting is enabled or not.
         * @param {boolean} value - The lightEnable value.
         */
        set lightEnable(value: boolean);
        _useSpecularModeBlinn: boolean | undefined;
        /**
         * Gets the modulateType value.
         * @returns {FFLModulateType|undefined} The modulateType value if it is set.
         */
        get modulateType(): FFLModulateType | undefined;
        /**
         * Sets the material uniforms based on the modulate type value.
         * @param {FFLModulateType} value - The new modulateType value.
         */
        set modulateType(value: FFLModulateType);
        /**
         * Gets the texture map if it is set.
         * @returns {import('three').Texture|null} The texture map, or null if it is unset.
         */
        get map(): import("three").Texture | null;
        /**
         * Sets the texture map (s_texture uniform).
         * @param {import('three').Texture} value - The new texture map.
         */
        set map(value: import("three").Texture);
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
    /** Indicates if this material is compatible with FFL swizzled textures (modulateMode). */
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
     * Reference: https://github.com/aboood40091/FFL-Testing/blob/master/src/Shader.cpp
     * @package
     */
    materialParams: {
        ambient: import("three").Color;
        diffuse: import("three").Color;
        specular: import("three").Color;
        specularPower: number;
        specularMode: number;
    }[];
};
export = _exports;
type FFLModulateMode = number;
type FFLModulateType = number;
type THREE = typeof import("three");
type FFLShaderMaterialParameters = {
    /**
     * - Modulate mode.
     */
    modulateMode?: number | undefined;
    /**
     * - Modulate type.
     */
    modulateType?: number | undefined;
    /**
     * - Constant color assigned to u_const1/2/3 depending on single or array.
     */
    color?: import("three").Color | import("three").Color[] | undefined;
    /**
     * - Enable lighting. Needs to be off when drawing faceline/mask textures.
     */
    lightEnable?: boolean | undefined;
    /**
     * - Light direction.
     */
    lightDirection?: import("three").Vector3 | undefined;
    /**
     * - Whether to override specular mode on all materials with 0 (Blinn-Phong specular).
     */
    useSpecularModeBlinn?: boolean | undefined;
    /**
     * - Texture map.
     */
    map?: import("three").Texture | undefined;
};
