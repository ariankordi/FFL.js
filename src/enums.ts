/**
 * Uses FFL decomp enum rather than real FFL enum.
 * Reference: https://github.com/aboood40091/ffl/blob/master/include/nn/ffl/FFLResult.h
 */
export enum FFLResult {
	OK = 0,
	ERROR = 1,
	HDB_EMPTY = 2,
	FILE_INVALID = 3,
	MANAGER_NOT_CONSTRUCT = 4,
	FILE_LOAD_ERROR = 5,
	//  = 6,
	FILE_SAVE_ERROR = 7,
	//  = 8,
	RES_FS_ERROR = 9,
	ODB_EMPTY = 10,
	//  =  11,
	OUT_OF_MEMORY = 12,
	//  =  13,
	//  =  14,
	//  =  15,
	//  =  16,
	UNKNOWN_17 = 17,
	FS_ERROR = 18,
	FS_NOT_FOUND = 19,
	MAX = 20
};

export enum FFLiShapeType {
	OPA_BEARD = 0,
	OPA_FACELINE = 1,
	OPA_HAIR_NORMAL = 2,
	OPA_FOREHEAD_NORMAL = 3,
	XLU_MASK = 4,
	XLU_NOSELINE = 5,
	OPA_NOSE = 6,
	OPA_HAT_NORMAL = 7,
	XLU_GLASS = 8,
	OPA_HAIR_CAP = 9,
	OPA_FOREHEAD_CAP = 10,
	OPA_HAT_CAP = 11,
	MAX = 12
};

export enum FFLAttributeBufferType {
	POSITION = 0,
	TEXCOORD = 1,
	NORMAL = 2,
	TANGENT = 3,
	COLOR = 4,
	MAX = 5
};

export enum FFLCullMode {
	NONE = 0,
	BACK = 1,
	FRONT = 2,
	MAX = 3
};

export enum FFLModulateMode {
	/** No Texture, Has Color (R) */
	CONSTANT = 0,
	/** Has Texture, No Color */
	TEXTURE_DIRECT = 1,
	/** Has Texture, Has Color (R + G + B) */
	RGB_LAYERED = 2,
	/** Has Texture, Has Color (R) */
	ALPHA = 3,
	/** Has Texture, Has Color (R) */
	LUMINANCE_ALPHA = 4,
	/** Has Texture, Has Color (R) */
	ALPHA_OPA = 5
};

export enum FFLModulateType {
	SHAPE_FACELINE = 0,
	SHAPE_BEARD = 1,
	SHAPE_NOSE = 2,
	SHAPE_FOREHEAD = 3,
	SHAPE_HAIR = 4,
	SHAPE_CAP = 5,
	SHAPE_MASK = 6,
	SHAPE_NOSELINE = 7,
	SHAPE_GLASS = 8,
	MUSTACHE = 9,
	MOUTH = 10,
	EYEBROW = 11,
	EYE = 12,
	MOLE = 13,
	FACE_MAKE = 14,
	FACE_LINE = 15,
	FACE_BEARD = 16,
	FILL = 17,
	SHAPE_MAX = 9
};

export enum FFLResourceType {
	MIDDLE = 0,
	HIGH = 1,
	MAX = 2
};

/**
 * Reference = https://github.com/ariankordi/ffl/blob/nsmbu-win-port-linux64/include/nn/ffl/FFLExpression.h
 */
export enum FFLExpression {
	NORMAL = 0,
	SMILE = 1,
	ANGER = 2,
	/** Primary name for expression 3. */
	SORROW = 3,
	PUZZLED = 3,
	/** Primary name for expression 4. */
	SURPRISE = 4,
	SURPRISED = 4,
	BLINK = 5,
	OPEN_MOUTH = 6,
	/** Primary name for expression 7. */
	SMILE_OPEN_MOUTH = 7,
	HAPPY = 7,
	ANGER_OPEN_MOUTH = 8,
	SORROW_OPEN_MOUTH = 9,
	SURPRISE_OPEN_MOUTH = 10,
	BLINK_OPEN_MOUTH = 11,
	WINK_LEFT = 12,
	WINK_RIGHT = 13,
	WINK_LEFT_OPEN_MOUTH = 14,
	WINK_RIGHT_OPEN_MOUTH = 15,
	/** Primary name for expression 16. */
	LIKE_WINK_LEFT = 16,
	LIKE = 16,
	LIKE_WINK_RIGHT = 17,
	FRUSTRATED = 18,

	// Additional expressions from AFL.
	// Enum names are completely made up.
	BORED = 19,
	BORED_OPEN_MOUTH = 20,
	SIGH_MOUTH_STRAIGHT = 21,
	SIGH = 22,
	DISGUSTED_MOUTH_STRAIGHT = 23,
	DISGUSTED = 24,
	LOVE = 25,
	LOVE_OPEN_MOUTH = 26,
	DETERMINED_MOUTH_STRAIGHT = 27,
	DETERMINED = 28,
	CRY_MOUTH_STRAIGHT = 29,
	CRY = 30,
	BIG_SMILE_MOUTH_STRAIGHT = 31,
	BIG_SMILE = 32,
	CHEEKY = 33,
	CHEEKY_DUPLICATE = 34,
	JOJO_EYES_FUNNY_MOUTH = 35,
	JOJO_EYES_FUNNY_MOUTH_OPEN = 36,
	SMUG = 37,
	SMUG_OPEN_MOUTH = 38,
	RESOLVE = 39,
	RESOLVE_OPEN_MOUTH = 40,
	UNBELIEVABLE = 41,
	UNBELIEVABLE_DUPLICATE = 42,
	CUNNING = 43,
	CUNNING_DUPLICATE = 44,
	RASPBERRY = 45,
	RASPBERRY_DUPLICATE = 46,
	INNOCENT = 47,
	INNOCENT_DUPLICATE = 48,
	CAT = 49,
	CAT_DUPLICATE = 50,
	DOG = 51,
	DOG_DUPLICATE = 52,
	TASTY = 53,
	TASTY_DUPLICATE = 54,
	MONEY_MOUTH_STRAIGHT = 55,
	MONEY = 56,
	SPIRAL_MOUTH_STRAIGHT = 57,
	CONFUSED = 58,
	CHEERFUL_MOUTH_STRAIGHT = 59,
	CHEERFUL = 60,
	BLANK_61 = 61,
	BLANK_62 = 62,
	GRUMBLE_MOUTH_STRAIGHT = 63,
	GRUMBLE = 64,
	MOVED_MOUTH_STRAIGHT = 65,
	MOVED = 66,
	SINGING_MOUTH_SMALL = 67,
	SINGING = 68,
	STUNNED = 69,

	MAX = 70
};

/**
 * Model flags modify how the head model is created. These are
 * used in the `modelFlag` property of {@link FFLCharModelDesc}.
 */
export enum FFLModelFlag {
	/** Default model setting. */
	NORMAL = 1 << 0,
	/** Uses a variant of hair designed for hats. */
	HAT = 1 << 1,
	/** Discards hair from the model, used for helmets and similar headwear. */
	FACE_ONLY = 1 << 2,
	/** Limits Z depth on the nose, useful for helmets and similar headwear. */
	FLATTEN_NOSE = 1 << 3,
	/** Enables the model's expression flag to use expressions beyond 32. */
	NEW_EXPRESSIONS = 1 << 4,
	/**
	 * This flag only generates new textures when initializing a CharModel
	 * but does not initialize shapes.
	 * **Note:** This means you cannot use DrawOpa/Xlu when this is set.
	 */
	NEW_MASK_ONLY = 1 << 5
};
