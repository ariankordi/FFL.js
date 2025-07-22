declare namespace _exports {
    export { FFLModulateMode, FFLModulateType, THREE, SampleShaderMaterialColorInfo, SampleShaderMaterialParameters };
}
declare const _exports: {
    new (options?: import("three").ShaderMaterialParameters & SampleShaderMaterialParameters): {
        /** @type {FFLModulateType} */
        _modulateType: FFLModulateType;
        /** @package */
        _sssColorTable: (number[] | null)[];
        /** @package */
        _specularColorTable: (number[] | null)[];
        /**
         * Gets the constant color (constColor1) uniform as THREE.Color.
         * @returns {import('three').Color|null} The constant color, or null if it is not set.
         */
        get color(): import("three").Color | null;
        /**
         * Sets the constant color uniforms from THREE.Color.
         * @param {import('three').Color|Array<import('three').Color>} value - The
         * constant color (constColor1), or multiple (constColor1/2/3) to set the uniforms for.
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
        setUniformsFromMatParam(matParam: {
            halfLambertFactor: number;
            sssSpecularBlendFactor: number;
            specularFactorA: number;
            specularFactorB: number;
            specularShinness: number;
            rimLightPower: number;
            rimLightWidth: number;
        }): void;
        /**
         * Gets the texture map if it is set.
         * @returns {import('three').Texture|null} The texture map, or null if it is unset.
         */
        get map(): import("three").Texture | null;
        /**
         * Sets the texture map (s_Tex uniform).
         * @param {import('three').Texture} value - The new texture map.
         */
        set map(value: import("three").Texture);
        /**
         * Gets the light direction.
         * @returns {import('three').Vector3} The light direction.
         */
        lightDirection: import("three").Vector3;
        colorInfo: SampleShaderMaterialColorInfo;
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
    /** Indicates that this material requires an alpha value of 0 in the faceline color. */
    needsFacelineAlpha: boolean;
    /**
     * Default ambient light color.
     * @type {import('three').Color}
     */
    defaultLightColor: import("three").Color;
    /**
     * Default light direction.
     * @type {import('three').Vector3}
     */
    defaultLightDir: import("three").Vector3;
    /**
     * Alias for default light direction.
     * @type {import('three').Vector3}
     */
    defaultLightDirection: import("three").Vector3;
    /**
     * Method to get colorInfo from FFLiCharInfo included in glTFs.
     * @param {string} base64 - Base64-encoded FFLiCharInfo from glTF.
     * @returns {SampleShaderMaterialColorInfo} The colorInfo for use in this material.
     * @throws {Error} Throws if the input's size does not match.
     */
    getColorInfoFromCharInfoB64(base64: string): SampleShaderMaterialColorInfo;
    /**
     * Re-assigns normal attribute on the glass mesh to the
     * normals for glass found in ShapeHigh.dat.
     * @param {import('three').BufferGeometry} geometry -
     * The geometry in which to re-assign the normal attribute.
     */
    assignNormalsForGlass(geometry: import("three").BufferGeometry): void;
    /**
     * @param {import('./ffl').FFLDrawParam} drawParam - The DrawParam for the mesh to check.
     * @param {import('three').BufferGeometry} geometry - BufferGeometry to modify.
     */
    modifyBufferGeometry(drawParam: import("./ffl").FFLDrawParam, geometry: import("three").BufferGeometry): void;
};
export = _exports;
type FFLModulateMode = number;
type FFLModulateType = number;
type THREE = typeof import("three");
type SampleShaderMaterialColorInfo = {
    facelineColor: number;
    favoriteColor: number;
    hairColor: number;
    beardColor: number;
    pantsColor: import("./ffl").PantsColor;
};
type SampleShaderMaterialParameters = {
    /**
     * - Modulate mode.
     */
    modulateMode?: number | undefined;
    /**
     * - Modulate type.
     */
    modulateType?: number | undefined;
    /**
     * -
     * Constant color assigned to constColor1/2/3 depending on single or array.
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
     * - Texture map.
     */
    map?: import("three").Texture | undefined;
    /**
     * -
     * Info needed to resolve shader uniforms. This is required
     * or else lighting will not be applied. It can come from
     * CharModel.getColorInfo, or getColorInfoFromCharInfoB64 for glTFs.
     */
    colorInfo?: SampleShaderMaterialColorInfo | undefined;
};
