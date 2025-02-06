const FFLiShapeType = {
    OPA_BEARD: 0,
    OPA_FACELINE: 1,
    OPA_HAIR_NORMAL: 2,
    OPA_FOREHEAD_NORMAL: 3,
    XLU_MASK: 4,
    XLU_NOSELINE: 5,
    OPA_NOSE: 6,
    OPA_HAT_NORMAL: 7,
    XLU_GLASS: 8,
    OPA_HAIR_CAP: 9,
    OPA_FOREHEAD_CAP: 10,
    OPA_HAT_CAP: 11,
    MAX: 12
};

const FFLAttributeBufferType = {
    POSITION: 0,
    TEXCOORD: 1,
    NORMAL: 2,
    TANGENT: 3,
    COLOR: 4,
    MAX: 5
};

const FFLCullMode = {
    NONE: 0,
    BACK: 1,
    FRONT: 2,
    MAX: 3
};

const FFLModulateMode = {
    CONSTANT: 0,         // No Texture, Has Color (R)
    TEXTURE_DIRECT: 1,   // Has Texture, No Color
    RGB_LAYERED: 2,      // Has Texture, Has Color (R + G + B)
    ALPHA: 3,            // Has Texture, Has Color (R)
    LUMINANCE_ALPHA: 4,  // Has Texture, Has Color (R)
    ALPHA_OPA: 5         // Has Texture, Has Color (R)
};

const FFLModulateType = {
    SHAPE_FACELINE: 0,
    SHAPE_BEARD: 1,
    SHAPE_NOSE: 2,
    SHAPE_FOREHEAD: 3,
    SHAPE_HAIR: 4,
    SHAPE_CAP: 5,
    SHAPE_MASK: 6,
    SHAPE_NOSELINE: 7,
    SHAPE_GLASS: 8,
    MUSTACHE: 9,
    MOUTH: 10,
    EYEBROW: 11,
    EYE: 12,
    MOLE: 13,
    FACE_MAKE: 14,
    FACE_LINE: 15,
    FACE_BEARD: 16,
    FILL: 17,
    SHAPE_MAX: 9
};

const FFLExpression = {
    NORMAL: 0,
    MAX: 70,
}

const FFLAttributeBuffer = _.struct([
    _.uint32le('size'),
    _.uint32le('stride'),
    _.uint32le('ptr')  // Pointer (wasm is 32 bit)
]);

const FFLAttributeBufferParam = _.struct([
    _.struct('attributeBuffers', [FFLAttributeBuffer], 5),
    _.byte('padding', 0x3C - (FFLAttributeBufferType.MAX * 12))  // Ensure correct size (0x3C)
]);

const FFLPrimitiveParam = _.struct([
    _.uint32le('primitiveType'), // FFLRIOPrimitiveMode (u32)
    _.uint32le('indexCount'),
    _.uint32le('_8'),             // Padding or unknown field
    _.uint32le('pIndexBuffer')     // Pointer to index buffer
]);

const FFLColor = _.struct([
    _.float32le('r'),
    _.float32le('g'),
    _.float32le('b'),
    _.float32le('a')
]);

const FFLModulateParam = _.struct([
    _.uint32le('mode'),      // FFLModulateMode
    _.uint32le('type'),      // FFLModulateType
    _.uint32le('pColorR'),   // Pointer to FFLColor (dereference needed)
    _.uint32le('pColorG'),   // Pointer to FFLColor (dereference needed)
    _.uint32le('pColorB'),   // Pointer to FFLColor (dereference needed)
    _.uint32le('pTexture2D') // Pointer to FFLTexture (stub, unused in this case)
]);

const FFLDrawParam = _.struct([
    _.struct('attributeBufferParam', [FFLAttributeBufferParam]),
    _.struct('modulateParam', [FFLModulateParam]),
    _.uint32le('cullMode'),  // FFLCullMode (u32)
    _.struct('primitiveParam', [FFLPrimitiveParam])
]);

var FFLiCharInfo = _.struct([
    _.int32le('miiVersion'),

    _.struct('faceline', [
        _.int32le('type'),
        _.int32le('color'),
        _.int32le('texture'),
        _.int32le('make')
    ]),
    _.struct('hair', [
        _.int32le('type'),
        _.int32le('color'),
        _.int32le('flip')
    ]),
    _.struct('eye', [
        _.int32le('type'),
        _.int32le('color'),
        _.int32le('scale'),
        _.int32le('aspect'),
        _.int32le('rotate'),
        _.int32le('x'),
        _.int32le('y')
    ]),
    _.struct('eyebrow', [
        _.int32le('type'),
        _.int32le('color'),
        _.int32le('scale'),
        _.int32le('aspect'),
        _.int32le('rotate'),
        _.int32le('x'),
        _.int32le('y')
    ]),
    _.struct('nose', [
        _.int32le('type'),
        _.int32le('scale'),
        _.int32le('y')
    ]),
    _.struct('mouth', [
        _.int32le('type'),
        _.int32le('color'),
        _.int32le('scale'),
        _.int32le('aspect'),
        _.int32le('y')
    ]),
    _.struct('beard', [
        _.int32le('mustache'),
        _.int32le('type'),
        _.int32le('color'),
        _.int32le('scale'),
        _.int32le('y')
    ]),
    _.struct('glass', [
        _.int32le('type'),
        _.int32le('color'),
        _.int32le('scale'),
        _.int32le('y')
    ]),
    _.struct('mole', [
        _.int32le('type'),
        _.int32le('scale'),
        _.int32le('x'),
        _.int32le('y')
    ]),
    _.struct('body', [
        _.int32le('height'),
        _.int32le('build')
    ]),
    _.struct('personal', [
        _.char16le('name', 22),    // u16[11]
        _.char16le('creator', 22), // u16[11]
        _.int32le('gender'),
        _.int32le('birthMonth'),
        _.int32le('birthDay'),
        _.int32le('favoriteColor'),
        _.uint8('favorite'),
        _.uint8('copyable'),
        _.uint8('ngWord'),
        _.uint8('localonly'),
        _.int32le('regionMove'),
        _.int32le('fontRegion'),
        _.int32le('roomIndex'),
        _.int32le('positionInRoom'),
        _.int32le('birthPlatform')
    ]),
    
    _.byte('createID', 10), // FFLCreateID stub
    _.uint16le('padding_0'),
    _.int32le('authorType'),
    _.byte('authorID', 8)   // FFLiAuthorID stub
]);

const FFLAdditionalInfo = _.struct([
    _.char16le('name', 22),
    _.char16le('creatorName', 22),
    _.byte('createID', 10), // FFLCreateID stub
    _.padTo(0x38),
    _.struct('facelineColor', [FFLColor]),
    //_.uint32le('flags'),
    _.ubitLE('hairFlip', 1),
    _.ubitLE('fontRegion', 2),
    _.ubitLE('ngWord', 1),
    _.ubitLE('build', 7),
    _.ubitLE('height', 7),
    _.ubitLE('favoriteColor', 4),
    _.ubitLE('birthDay', 5),
    _.ubitLE('birthMonth', 4),
    _.ubitLE('gender', 1),
    _.uint8('facelineType'),
    _.uint8('hairType'),
    // there may be another field here for alignment but its never written to
    _.padTo(0x50)
]);

const FFLiRenderTexture = _.struct([
    // STUB: four pointers in one field
    _.uint32le('pTexture2DRenderBufferColorTargetDepthTarget', 4)
]);

const FFLiFacelineTextureTempObject = _.struct([
    _.uint32le('pTextureFaceLine'),
    _.struct('drawParamFaceLine', [FFLDrawParam]),
    _.uint32le('pTextureFaceMake'),
    _.struct('drawParamFaceMake', [FFLDrawParam]),
    _.uint32le('pTextureFaceBeard'),
    _.struct('drawParamFaceBeard', [FFLDrawParam]),
    _.uint32le('_144_148', 2)
]);
const FFLiRawMaskDrawParam = _.struct([
    _.struct('drawParamRawMaskPartsEye', [FFLDrawParam], 2),
    _.struct('drawParamRawMaskPartsEyebrow', [FFLDrawParam], 2),
    _.struct('drawParamRawMaskPartsMouth', [FFLDrawParam]),
    _.struct('drawParamRawMaskPartsMustache', [FFLDrawParam], 2),
    _.struct('drawParamRawMaskPartsMole', [FFLDrawParam]),
    _.struct('drawParamRawMaskPartsFill', [FFLDrawParam]),
]);
const FFLiMaskTexturesTempObject = _.struct([
    _.byte('partsTextures', 0x154), // Stub for FFLiPartsTextures
    _.uint32le('pRawMaskDrawParam', FFLExpression.MAX), // Pointers to FFLDrawParams
    _.byte('_remaining', 0x388 - 620)
]);
const FFLiTextureTempObject = _.struct([
    _.struct('maskTextures', [FFLiMaskTexturesTempObject]),
    _.struct('facelineTexture', [FFLiFacelineTextureTempObject])
]);

const FFLiMaskTextures = _.struct([
    _.uint32le('pRenderTextures', FFLExpression.MAX)
]);

const FFL_RESOLUTION_MASK = 0x3fffffff; // first 2 bits cleared
const FFLCharModelDesc = _.struct([
    _.uint32le('resolution'),
    _.uint32le('allExpressionFlag', 3),
    _.uint32le('modelFlag'),
    _.uint32le('resourceType')
]);

const FFLiCharModel = _.struct([
    _.struct('charInfo', [FFLiCharInfo]),
    _.struct('charModelDesc', [FFLCharModelDesc]),
    _.uint32le('expression'),          // FFLExpression (u32)
    _.uint32le('pTextureTempObject'),  // FFLiTextureTempObject
    _.struct('drawParam', [FFLDrawParam], FFLiShapeType.MAX), // FFLDrawParam[12]
    _.uint32le('pShapeData', FFLiShapeType.MAX),
    _.struct('facelineRenderTexture', [FFLiRenderTexture]),
    _.uint32le('pCapGlassNoselineTextures', 3),
    _.struct('maskTextures', [FFLiMaskTextures]),
    // vvvv sizeof(FFLiCharModel) - size of this
    _.byte('_remaining', 0x0848 - 172) // Stub for rest of the fields.
]);


const FFLDataSource = {
    OFFICIAL: 0,
    DEFAULT: 1,
    MIDDLE_DB: 2,
    STORE_DATA_OFFICIAL: 3,
    STORE_DATA: 4,
    BUFFER: 5,
    DIRECT_POINTER: 6
};

const FFLCharModelSource = _.struct([
    _.uint32le('dataSource'),
    _.uint32le('pBuffer'),
    _.uint16le('index')
]);

const FFLResourceType = {
    MIDDLE: 0,
    HIGH: 1,
    MAX: 2
}

const FFLResourceDesc = _.struct([
    _.uint32le('pData', FFLResourceType.MAX),
    _.uint32le('size', FFLResourceType.MAX)
]);

// ------ texture callback ---------

// Define the FFLTextureFormat enum
const FFLTextureFormat = {
    R8_UNORM: 0,
    R8_G8_UNORM: 1,
    R8_G8_B8_A8_UNORM: 2,
    MAX: 3
};

// Define the FFLTextureInfo struct
const FFLTextureInfo = _.struct([
    _.uint16le('width'),           // u16 width
    _.uint16le('height'),          // u16 height
    _.uint8('mipCount'),           // u8 mipCount
    _.uint8('format'),             // u8 format (FFLTextureFormat)
    _.uint8('isGX2Tiled'),          // bool isGX2Tiled
    _.byte('_padding', 1),         // u8 padding (alignment)

    _.uint32le('imageSize'),       // u32 imageSize
    _.uint32le('imagePtr'),        // void* imagePtr (32-bit pointer in WASM)
    _.uint32le('mipSize'),         // u32 mipSize
    _.uint32le('mipPtr'),          // void* mipPtr (32-bit pointer in WASM)

    _.uint32le('mipLevelOffset', 13) // u32 mipLevelOffset[13]
]);

// Define the FFLTextureCallback struct
const FFLTextureCallback = _.struct([
    _.uint32le('pObj'),            // void* pObj (pointer in WASM)

    _.uint8('useOriginalTileMode'),  // bool useOriginalTileMode
    _.byte('_padding', 3),          // u8 _padding[3] for alignment

    _.uint32le('pCreateFunc'),      // void (*pCreateFunc)(void*, const FFLTextureInfo*, FFLTexture)
    _.uint32le('pDeleteFunc')       // void (*pDeleteFunc)(void*, FFLTexture)
]);


async function fetchIntoWasmHeap(url, wasmModule) {
    const response = await fetch(url);

    // Try to get the Content-Length header
    const contentLength = response.headers.get('Content-Length');

    if (!contentLength) {
        throw new Error('Content-Length header is missing. Cannot pre-allocate memory.');
    }

    const totalSize = parseInt(contentLength, 10);

    // Allocate memory in the WebAssembly heap
    const wasmHeapPtr = wasmModule._malloc(totalSize);
    const heap = wasmModule.HEAPU8;

    const reader = response.body.getReader();
    let offset = wasmHeapPtr;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Write directly into the WebAssembly heap
        heap.set(value, offset);
        offset += value.length;
    }

    return { pointer: wasmHeapPtr, size: offset - wasmHeapPtr };
};

    window.callFFL = async function() {


const textureRegistry = new Map();  // Store created textures

// Dummy texture management in Three.js
function textureCreateFunc(pObjPtr, textureInfoPtr, texturePtrPtr) {
    const u8 = Module.HEAPU8.subarray(textureInfoPtr, textureInfoPtr + FFLTextureInfo.size);
    //const buffer = Buffer.from(u8);
    // Read texture info from WASM memory
    const pTextureInfo = FFLTextureInfo.unpack(u8);//buffer);

    console.log(`Creating texture: ptr=${textureInfoPtr}, width=${pTextureInfo.width}, height=${pTextureInfo.height}, format=${pTextureInfo.format}, imageSize=${pTextureInfo.imageSize}`);

    let internalFormat;
    let dataFormat;
    let type = THREE.UnsignedByteType;

    switch (pTextureInfo.format) {
        case FFLTextureFormat.R8_UNORM:
            internalFormat = THREE.LuminanceFormat;
            dataFormat = THREE.LuminanceFormat;
            break;

        case FFLTextureFormat.R8_G8_UNORM:
            internalFormat = THREE.LuminanceAlphaFormat;
            dataFormat = THREE.LuminanceAlphaFormat;
            break;

        case FFLTextureFormat.R8_G8_B8_A8_UNORM:
            internalFormat = THREE.RGBAFormat;
            dataFormat = THREE.RGBAFormat;
            break;

        default:
            console.error("Unsupported texture format:", pTextureInfo.format);
            return null;
    }

    // Get and copy the image data from WASM memory by slicing
    const imageData = Module.HEAPU8.slice(pTextureInfo.imagePtr, pTextureInfo.imagePtr + pTextureInfo.imageSize);

    // Create Three.js texture
    const texture = new THREE.DataTexture(
        imageData,
        pTextureInfo.width,
        pTextureInfo.height,
        dataFormat,
        type
    );

    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.wrapS = THREE.MirroredRepeatWrapping;
    texture.wrapT = THREE.MirroredRepeatWrapping;
    texture.needsUpdate = true;  // Ensure Three.js updates it

    // Store texture reference by pointer address
    textureRegistry.set(texture.id, texture);

    // Store the WebGL texture handle in WASM memory
    Module.HEAP32[texturePtrPtr / 4] = texture.id;  // Storing WebGL texture ID

    return texture;
}

function textureDeleteFunc(pObjPtr, texturePtr) {
    const textureId = Module.HEAP32[texturePtr / 4];

    if (textureRegistry.has(textureId)) {
        const texture = textureRegistry.get(textureId);
        texture.dispose();  // Free GPU memory
        textureRegistry.delete(texturePtr);

        console.log(`Deleted texture at ptr: ${textureId}`);
    } else {
        console.warn(`Attempted to delete non-existent texture at ptr: ${textureId}`);
    }
}

function getTextureForDrawParam(drawParam) {
//debugger
    if (drawParam.modulateParam.pTexture2D) {
        const texturePtr = drawParam.modulateParam.pTexture2D;
        const texture = textureRegistry.get(texturePtr);

        if (texture) {
            console.log(`Binding texture to mesh, ptr: ${texturePtr}, texture:`, texture);
            return texture;
        } else {
            console.warn(`Texture not found for ptr: ${texturePtr}`);
        }
        return null;
    }
}

function getVector4FromFFLColorPtr(colorPtr) {
    if (colorPtr === 0) {
        console.error('aaarghhhhh you passed a null pointer into this');
        return null;
    }
    const colorPtr_ = colorPtr / 4;
    const colorData = Module.HEAPF32.subarray(colorPtr_, colorPtr + 4);
    return new THREE.Vector4(colorData[0], colorData[1], colorData[2], colorData[3]);
}

// ----- begin ffffffflllll --------

    //window.callFFLFunction = function() {
      if (!Module) {
        console.error("FFL Module not initialized yet!");
        return;
      }

      // HACK: map _malloc and _free to raylib equivalents
      //Module._malloc = Module._MemAlloc;
      //Module._free = Module._MemFree;
      // prerequisites
      //Module._SetNullTextureCallback();
      Module._FFLSetNormalIsSnorm8_8_8_8(1);


      const resourceDesc = {
          pData: [0, 0],
          size: [0, 0]
      };
      
      const resourceFetchPath = document.querySelector('meta[itemprop=ffl-resource-fetch-path]').content;
      //'https://debian.local:8445/assets/web%20builds/FFLResHigh.dat'
      
      const heapy = await fetchIntoWasmHeap(resourceFetchPath, Module);
      resourceDesc.pData[FFLResourceType.HIGH] = heapy.pointer;
      resourceDesc.size[FFLResourceType.HIGH] = heapy.size;
      const resourceDescU8 = FFLResourceDesc.pack(resourceDesc);
      const resourceDescPtr = Module._malloc(FFLResourceDesc.size);
      Module.HEAPU8.set(resourceDescU8, resourceDescPtr);
      const initResult = Module._FFLInitRes(0, resourceDescPtr);
      if (initResult !== 0) throw new Error(`FFLInitRes result: ${initResult}`);

      Module._FFLInitResGPUStep();
      
      
      
      
            // texture calllbackkkkkkk
      const textureCallback = {
          pObj: 0,  // No object, can be set later if needed
          useOriginalTileMode: false,
          _padding: [0, 0, 0],
          pCreateFunc: Module.addFunction(textureCreateFunc, 'viii'),
          pDeleteFunc: Module.addFunction(textureDeleteFunc, 'vii')
      };

      // Pack the callback structure
      const textureCallbackBuffer = FFLTextureCallback.pack(textureCallback);

      // Allocate memory in the WASM heap and copy the packed struct
      const textureCallbackPtr = Module._malloc(FFLTextureCallback.size);
      Module.HEAPU8.set(new Uint8Array(textureCallbackBuffer), textureCallbackPtr);

      console.log('FFLTextureCallback struct allocated at:', textureCallbackPtr);

      // Pass the struct pointer to FFLSetTextureCallback
      Module._FFLSetTextureCallback(textureCallbackPtr);
      

      // Example: Prepare inputs and call FFLInitCharModelCPUStep
      const modelSourcePtr = Module._malloc(FFLCharModelSource.size); // Mock FFLCharModelSource
      const modelDescPtr = Module._malloc(FFLCharModelDesc.size);   // Mock FFLCharModelDesc

      const charModelPtr = Module._malloc(FFLiCharModel.size);

      const charInfoPtr = Module._malloc(FFLiCharInfo.size);      
      const base64ToUint8Array = base64 => Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const charInfoU8 = base64ToUint8Array('AwAAAAkAAAAAAAAAAAAAAAEAAAB7AAAAAQAAAAAAAAAhAAAAAAAAAAcAAAADAAAAAwAAAAIAAAAOAAAADQAAAAAAAAAEAAAABgAAAAcAAAAGAAAADAAAAAAAAAAAAAAABAAAAB4AAAAAAAAAAQAAAAQAAAANAAAAAAAAAAAAAAAGAAAABAAAABAAAAADAAAAAwAAAAcAAAALAAAAAAAAAAEAAAAMAAAAGwAAABwAAAA3AAAASgBhAHMAbQBpAG4AZQAAAAAAAAAAAAAAbwBzAGkAZwBvAG4AYQBsAAAAAAABAAAADAAAAAoAAAALAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAA27iHMb5gKyoqQgAAAAAAAKBBOMSghAAA');
      Module.HEAPU8.set(charInfoU8, charInfoPtr); // Example

      const modelSource = {
        dataSource: FFLDataSource.BUFFER,
        //dataSource: FFLDataSource.DEFAULT,
        pBuffer: charInfoPtr,
        index: 0
      };
      const modelSourceBuffer = FFLCharModelSource.pack(modelSource);

      const modelDesc = {
        resolution: 192,
        allExpressionFlag: [1, 0, 0],
        modelFlag: 1 << 0,
        resourceType: 1
      };
      const modelDescBuffer = FFLCharModelDesc.pack(modelDesc);


      // write modelSource and modelDesc in heap
      Module.HEAPU8.set(new Uint8Array(modelSourceBuffer), modelSourcePtr); // Example
      Module.HEAPU8.set(new Uint8Array(modelDescBuffer), modelDescPtr);   // Example

      //try {
        const result = Module._FFLInitCharModelCPUStep(
          charModelPtr,
          modelSourcePtr,
          modelDescPtr
        );
        if (result !== 0) throw new Error(`FFLInitCharModelCPUStep result: ${result}`);
      //} catch (err) {
      //  console.error("Error calling FFLInitCharModelCPUStep:", err);
      //}

      Module._free(modelSourcePtr);
      Module._free(modelDescPtr);
      Module._free(charInfoPtr);

      // do stuffff...
      const charModelU8 = Module.HEAPU8.subarray(charModelPtr, charModelPtr+FFLiCharModel.size);
      const charModel = FFLiCharModel.unpack(charModelU8)//Buffer.from(charModelU8));
      
      console.log('charModel:', charModel)

      const textureTempObjectU8 = Module.HEAPU8.subarray(charModel.pTextureTempObject, charModel.pTextureTempObject+FFLiTextureTempObject.size)
      const textureTempObject = FFLiTextureTempObject.unpack(textureTempObjectU8)
      console.log('textureTempObject:', textureTempObject)

      const additionalInfoPtr = Module._malloc(FFLAdditionalInfo.size);
      // FFLAdditionalInfo*, FFLDataSource, const void* pBuffer, u16 index, bool checkFontRegion
      Module._FFLGetAdditionalInfo(additionalInfoPtr, FFLDataSource.BUFFER, charModelPtr, 0, false);
      const additionalInfo = FFLAdditionalInfo.unpack(Module.HEAPU8.subarray(additionalInfoPtr, additionalInfoPtr+FFLAdditionalInfo.size));
      Module._free(additionalInfoPtr);
      console.log('additionalInfo:', additionalInfo)
      const facelineColor = additionalInfo.facelineColor;

      const partsTexturesPtr = charModel.pTextureTempObject + FFLiTextureTempObject.fields.maskTextures.offset + FFLiMaskTexturesTempObject.fields.partsTextures.offset;
      Module._FFLiInvalidatePartsTextures(partsTexturesPtr); // Invalidate before looping
      const rawMaskDrawParam0Ptr = textureTempObject.maskTextures.pRawMaskDrawParam[0];
      const rawMaskDrawParam0 = FFLiRawMaskDrawParam.unpack(Module.HEAPU8.subarray(rawMaskDrawParam0Ptr, rawMaskDrawParam0Ptr+FFLiRawMaskDrawParam.size));
      console.log(rawMaskDrawParam0)

      //var spector = new SPECTOR.Spector();
      //spector.displayUI();

      // begin three.js scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xE6E6FA); // Light lavender
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 100;
camera.position.y = 40;

const ambientLight = new THREE.AmbientLight(new THREE.Color(0.73, 0.73, 0.73));
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(new THREE.Color(0.60, 0.60, 0.60), 1.0);
directionalLight.position.set(-0.455, 0.348, 0.5).normalize();
scene.add(directionalLight);
const specularLight = new THREE.PointLight(new THREE.Color(0.70, 0.70, 0.70), 0.5);
specularLight.position.set(10, 10, 10);
scene.add(specularLight);



function createMeshFromDrawParam(drawParam, disableLighting = false) {
    if (!drawParam || drawParam.primitiveParam.indexCount === 0) return null;

    const attributes = drawParam.attributeBufferParam.attributeBuffers;

    // Ensure position data exists
    const positionBuffer = attributes[FFLAttributeBufferType.POSITION];
    if (positionBuffer.size === 0) {
        console.error("Missing position data for drawParam!");
        return null;
    }

    const posPtr = positionBuffer.ptr / 4;
    const vertexCount = positionBuffer.size / positionBuffer.stride;
    const positions = Module.HEAPF32.subarray(posPtr, posPtr + (vertexCount * 4));

    // Create geometry and attributes
    const geometry = new THREE.BufferGeometry();
    const interleavedBuffer = new THREE.InterleavedBuffer(positions, 4);
    geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(interleavedBuffer, 3, 0));

    // Process indices
    const indexPtr = drawParam.primitiveParam.pIndexBuffer / 2;
    const indexCount = drawParam.primitiveParam.indexCount;
    const indices = Module.HEAPU16.subarray(indexPtr, indexPtr + indexCount);
    geometry.setIndex(new THREE.Uint16BufferAttribute(new Uint16Array(indices), 1));

    // Process additional attributes
    Object.entries(attributes).forEach(([typeStr, buffer]) => {
        const type = parseInt(typeStr);
        if (buffer.size === 0 && type !== FFLAttributeBufferType.POSITION) return;

        switch (type) {
            case FFLAttributeBufferType.NORMAL:
            case FFLAttributeBufferType.TANGENT:
                const data = Module.HEAP8.subarray(buffer.ptr, buffer.ptr + buffer.size);
                geometry.setAttribute(
                    type === FFLAttributeBufferType.NORMAL ? 'normal' : 'tangent',
                    new THREE.Int8BufferAttribute(data, buffer.stride, true)
                );
                break;

            case FFLAttributeBufferType.TEXCOORD:
                const texcoords = Module.HEAPF32.subarray(buffer.ptr / 4, buffer.ptr / 4 + vertexCount * 2);
                geometry.setAttribute('uv', new THREE.Float32BufferAttribute(texcoords, buffer.stride / 4));
                break;

            case FFLAttributeBufferType.COLOR:
                if (buffer.stride === 0)
                    break;
                const colorData = new Uint8Array(Module.HEAPU8.subarray(buffer.ptr, buffer.ptr + buffer.size));
                geometry.setAttribute('_color', new THREE.Uint8BufferAttribute(colorData, buffer.stride, true));
                break;
        }
    });

    // assuming the primitive type is always triangles
    if (drawParam.primitiveParam.primitiveType !== 4) {
        console.warn(`Unknown primitive type: ${drawParam.primitiveParam.primitiveType}`);
    }

    // Handle cull mode
    let side = THREE.FrontSide;
    switch (drawParam.cullMode) {
        case FFLCullMode.NONE:
            side = THREE.DoubleSide; // No culling
            break;
        case FFLCullMode.BACK:
            side = THREE.FrontSide; // Default back-face culling
            break;
        case FFLCullMode.FRONT:
            side = THREE.BackSide; // Cull front faces instead
            break;
        default:
            side = THREE.DoubleSide; // No culling
            //console.warn(`Unknown cull mode: ${drawParam.cullMode}`);
    }

    // Choose material based on lighting requirement
    /*
    const material = disableLighting
        ? new THREE.MeshBasicMaterial({ transparent: true, side: side })
        : new THREE.MeshPhongMaterial({
            side: side,
            specular: new THREE.Color(0.30, 0.30, 0.30),
            shininess: 12,
            reflectivity: 0.3,
        });
    */
    
    let modulateColor = new THREE.Vector4(0, 0, 0, 0);
    if (drawParam.modulateParam.pColorR !== 0) {
        const colorPtr = drawParam.modulateParam.pColorR / 4;
        const colorData = Module.HEAPF32.subarray(colorPtr, colorPtr + 4);
        modulateColor = new THREE.Vector4(colorData[0], colorData[1], colorData[2], colorData[3]);
    }
    if (drawParam.modulateParam.pColorG !== 0 && drawParam.modulateParam.pColorB !== 0) {
        modulateColor = [
          getVector4FromFFLColorPtr(drawParam.modulateParam.pColorR),
          getVector4FromFFLColorPtr(drawParam.modulateParam.pColorG),
          getVector4FromFFLColorPtr(drawParam.modulateParam.pColorB)
        ];
    }

    const material = new FFLShaderMaterial({
      modulateMode: drawParam.modulateParam.mode,
      modulateType: drawParam.modulateParam.type,
      modulateColor: modulateColor,
      side: side,
      lightEnable: !disableLighting,
      map: getTextureForDrawParam(drawParam)
    });

    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
}

/**
 * Creates an offscreen Three.js scene from an array of drawParams.
 * Returns an object containing the temporary scene and the list of meshes.
 *
 * @param {Array} drawParams - Array of drawParam objects.
 * @param {THREE.Color} backgroundColor - The background color for the offscreen scene.
 * @returns {{scene: THREE.Scene, meshes: Array<THREE.Mesh>}}
 */
function createOffscreenScene(drawParams, backgroundColor = null) {
    const tempScene = new THREE.Scene();
    tempScene.background = backgroundColor;
    
    const meshes = [];
    
    drawParams.forEach(dp => {
        const mesh = createMeshFromDrawParam(dp, true);
        if (mesh) {
            tempScene.add(mesh);
            meshes.push(mesh);
        }
    });
    
    return { scene: tempScene, meshes };
}

/**
 * Renders a given scene to a texture using an Orthographic camera.
 *
 * @param {THREE.Scene} scene - The offscreen scene to render.
 * @param {number} width - The texture width.
 * @param {number} height - The texture height.
 * @returns {THREE.Texture} - The generated texture.
 */
function renderSceneToTexture(scene, width = 512, height = 512) {
    // Create an orthographic camera for 2D render target.
    const tempCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    tempCamera.position.z = 1;

    // Create a render target.
    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        wrapS: THREE.MirroredRepeatWrapping,
        wrapT: THREE.MirroredRepeatWrapping,
        format: THREE.RGBAFormat,
        depthBuffer: false,
        stencilBuffer: false
    });

    // Save previous render target.
    const prevTarget = renderer.getRenderTarget();

    // Render the scene to the render target.
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, tempCamera);
    renderer.setRenderTarget(prevTarget);

    return renderTarget.texture;
}

// Example: Create a faceline texture using multiple drawParams
function generateFacelineTexture(charModel, textureTempObject) {
    // Gather the drawParams that make up the faceline texture.
    const drawParams = [
        textureTempObject.facelineTexture.drawParamFaceLine,
        textureTempObject.facelineTexture.drawParamFaceBeard,
        textureTempObject.facelineTexture.drawParamFaceMake
    ].filter(dp => dp && dp.modulateParam.pTexture2D !== 0);
    
    if (drawParams.length === 0) {
        console.error("No faceline drawParams found!");
        return null;
    }
    
    const bgColor = new THREE.Color(facelineColor.r, facelineColor.g, facelineColor.b, facelineColor.a);
    // Create an offscreen scene with the specified background color.
    const { scene: offscreenScene, meshes } = createOffscreenScene(drawParams, bgColor);
 
    // Render the offscreen scene to a texture.
    const width = (charModel.charModelDesc.resolution / 2);
    const height = charModel.charModelDesc.resolution;
    const facelineTexture = renderSceneToTexture(offscreenScene, width, height);
    if (!facelineTexture) {
        console.error("Failed to generate faceline texture");
        return null;
    }
        
    // Store texture reference by pointer address
    textureRegistry.set(facelineTexture.id, facelineTexture);

    // Assign it to the character model
    const param = charModel.drawParam[FFLiShapeType.OPA_FACELINE];
    param.modulateParam.pTexture2D = facelineTexture.id;
}

const facelineTempObjectPtr = charModel.pTextureTempObject + FFLiTextureTempObject.fields.facelineTexture.offset;
Module._FFLiInvalidateTempObjectFacelineTexture(facelineTempObjectPtr); // Invalidate before drawing
generateFacelineTexture(charModel, textureTempObject);
Module._FFLiDeleteTempObjectFacelineTexture(facelineTempObjectPtr, charModelPtr, charModel.charModelDesc.resourceType);

function generateMaskTexture(charModel, rawMaskParam) {
    // Gather the drawParams that make up the mask texture.
    const drawParams = [
        rawMaskParam.drawParamRawMaskPartsMustache[0],
        rawMaskParam.drawParamRawMaskPartsMustache[1],
        rawMaskParam.drawParamRawMaskPartsMouth,
        rawMaskParam.drawParamRawMaskPartsEyebrow[0],
        rawMaskParam.drawParamRawMaskPartsEyebrow[1],
        rawMaskParam.drawParamRawMaskPartsEye[0],
        rawMaskParam.drawParamRawMaskPartsEye[1],
        rawMaskParam.drawParamRawMaskPartsMole
        //rawMaskParam.drawParamRawMaskPartsFill, // will never be used
    ].filter(dp => dp && dp.primitiveParam.indexCount !== 0);
    
    if (drawParams.length === 0) {
        console.error("No mask drawParams found!");
        return null;
    }
    
    // Create an offscreen scene with no background color.
    const { scene: offscreenScene, meshes } = createOffscreenScene(drawParams);
  
    // Render the offscreen scene to a texture.
    const width = charModel.charModelDesc.resolution;
    const maskTexture = renderSceneToTexture(offscreenScene, width, width);
    if (!maskTexture) {
        console.error("Failed to generate mask texture");
        return null;
    }
        
    // Store texture reference by pointer address
    textureRegistry.set(maskTexture.id, maskTexture);

    // Assign it to the character model
    const param = charModel.drawParam[FFLiShapeType.XLU_MASK];
    param.modulateParam.pTexture2D = maskTexture.id;
}

Module._FFLiInvalidateRawMask(rawMaskDrawParam0Ptr); // Invalidate before drawing
generateMaskTexture(charModel, rawMaskDrawParam0);
const maskTempObjectPtr = charModel.pTextureTempObject + FFLiTextureTempObject.fields.maskTextures.offset;
const expressionFlagPtr = charModelPtr + FFLiCharModel.fields.charModelDesc.offset + FFLCharModelDesc.fields.allExpressionFlag.offset;
Module._FFLiDeleteTempObjectMaskTextures(maskTempObjectPtr, expressionFlagPtr, charModel.charModelDesc.resourceType);

Module._FFLiDeleteTextureTempObject(charModelPtr);

// Loop through all drawParams
const meshes = [];

for (let shapeType = 0; shapeType < FFLiShapeType.MAX; shapeType++) {    
    const drawParam = charModel.drawParam[shapeType];
    const mesh = createMeshFromDrawParam(drawParam);
    if (!mesh) continue;

    mesh.renderOrder = drawParam.modulateParam.type;
/*
    mesh.material.blending = THREE.CustomBlending;
    mesh.material.blendDstAlpha = THREE.OneFactor;
    mesh.material.blendSrcAlpha = THREE.SrcAlphaFactor;
    mesh.material.transparent = shapeType === FFLiShapeType.XLU_MASK
*/
    scene.add(mesh);
    meshes.push(mesh);
}

console.log('meshes:', meshes)

// we are done with charmodel object, delete it
console.log('FFLDeleteCharModel ptr:', charModelPtr);
Module._FFLDeleteCharModel(charModelPtr);
Module._free(charModelPtr); // dispose and then free memory

// Animation loop to rotate all objects
function animate() {
    requestAnimationFrame(animate);
    meshes.forEach(mesh => {
        mesh.rotation.y += 0.01;
    });
    renderer.render(scene, camera);
    
    //generateMaskTexture(charModel, rawMaskDrawParam0);
}

animate();

    }
