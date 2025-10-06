import * as _ from '../struct-fu.js';

/**
 * @typedef {Object} StudioCharInfo
 * @property {number} beardColor
 * @property {number} beardType
 * @property {number} build
 * @property {number} eyeAspect
 * @property {number} eyeColor
 * @property {number} eyeRotate
 * @property {number} eyeScale
 * @property {number} eyeType
 * @property {number} eyeX
 * @property {number} eyeY
 * @property {number} eyebrowAspect
 * @property {number} eyebrowColor
 * @property {number} eyebrowRotate
 * @property {number} eyebrowScale
 * @property {number} eyebrowType
 * @property {number} eyebrowX
 * @property {number} eyebrowY
 * @property {number} facelineColor
 * @property {number} facelineMake
 * @property {number} facelineType
 * @property {number} facelineWrinkle
 * @property {number} favoriteColor
 * @property {number} gender
 * @property {number} glassColor
 * @property {number} glassScale
 * @property {number} glassType
 * @property {number} glassY
 * @property {number} hairColor
 * @property {number} hairFlip
 * @property {number} hairType
 * @property {number} height
 * @property {number} moleScale
 * @property {number} moleType
 * @property {number} moleX
 * @property {number} moleY
 * @property {number} mouthAspect
 * @property {number} mouthColor
 * @property {number} mouthScale
 * @property {number} mouthType
 * @property {number} mouthY
 * @property {number} mustacheScale
 * @property {number} mustacheType
 * @property {number} mustacheY
 * @property {number} noseScale
 * @property {number} noseType
 * @property {number} noseY
 */

import { commonColorMask, commonColorUnmask, FFLiCharInfo } from "@/StructFFLiCharModel";

/**
 * Structure representing data from the studio.mii.nintendo.com site and API.
 * @type {import('./struct-fu').StructInstance<StudioCharInfo>}
 */
export const StudioCharInfo = _.struct([
	// Fields are named according to nn::mii::CharInfo.
	_.uint8('beardColor'),
	_.uint8('beardType'),
	_.uint8('build'),
	_.uint8('eyeAspect'),
	_.uint8('eyeColor'),
	_.uint8('eyeRotate'),
	_.uint8('eyeScale'),
	_.uint8('eyeType'),
	_.uint8('eyeX'),
	_.uint8('eyeY'),
	_.uint8('eyebrowAspect'),
	_.uint8('eyebrowColor'),
	_.uint8('eyebrowRotate'),
	_.uint8('eyebrowScale'),
	_.uint8('eyebrowType'),
	_.uint8('eyebrowX'),
	_.uint8('eyebrowY'),
	_.uint8('facelineColor'),
	_.uint8('facelineMake'),
	_.uint8('facelineType'),
	_.uint8('facelineWrinkle'),
	_.uint8('favoriteColor'),
	_.uint8('gender'),
	_.uint8('glassColor'),
	_.uint8('glassScale'),
	_.uint8('glassType'),
	_.uint8('glassY'),
	_.uint8('hairColor'),
	_.uint8('hairFlip'),
	_.uint8('hairType'),
	_.uint8('height'),
	_.uint8('moleScale'),
	_.uint8('moleType'),
	_.uint8('moleX'),
	_.uint8('moleY'),
	_.uint8('mouthAspect'),
	_.uint8('mouthColor'),
	_.uint8('mouthScale'),
	_.uint8('mouthType'),
	_.uint8('mouthY'),
	_.uint8('mustacheScale'),
	_.uint8('mustacheType'),
	_.uint8('mustacheY'),
	_.uint8('noseScale'),
	_.uint8('noseType'),
	_.uint8('noseY')
]);

// ----------------- convertStudioCharInfoToFFLiCharInfo(src) -----------------
/**
 * Creates an FFLiCharInfo object from StudioCharInfo.
 * @param {StudioCharInfo} src - The StudioCharInfo instance.
 * @returns {FFLiCharInfo} The FFLiCharInfo output.
 */
export function convertStudioCharInfoToFFLiCharInfo(src: ReturnType<typeof StudioCharInfo.unpack>): ReturnType<typeof FFLiCharInfo.unpack> {
	return {
		miiVersion: 0,
		faceType: src.facelineType,
		faceColor: src.facelineColor,
		faceTex: src.facelineWrinkle,
		faceMake: src.facelineMake,
		hairType: src.hairType,
		hairColor: commonColorMask(src.hairColor),
		hairFlip: src.hairFlip,
		eyeType: src.eyeType,
		eyeColor: commonColorMask(src.eyeColor),
		eyeScale: src.eyeScale,
		eyeAspect: src.eyeAspect,
		eyeRotate: src.eyeRotate,
		eyeX: src.eyeX,
		eyeY: src.eyeY,
		eyebrowType: src.eyebrowType,
		eyebrowColor: commonColorMask(src.eyebrowColor),
		eyebrowScale: src.eyebrowScale,
		eyebrowAspect: src.eyebrowAspect,
		eyebrowRotate: src.eyebrowRotate,
		eyebrowX: src.eyebrowX,
		eyebrowY: src.eyebrowY,
		noseType: src.noseType,
		noseScale: src.noseScale,
		noseY: src.noseY,
		mouthType: src.mouthType,
		mouthColor: commonColorMask(src.mouthColor),
		mouthScale: src.mouthScale,
		mouthAspect: src.mouthAspect,
		mouthY: src.mouthY,
		beardMustache: src.mustacheType,
		beardType: src.beardType,
		beardColor: commonColorMask(src.beardColor),
		beardScale: src.mustacheScale,
		beardY: src.mustacheY,
		glassType: src.glassType,
		glassColor: commonColorMask(src.glassColor),
		glassScale: src.glassScale,
		glassY: src.glassY,
		moleType: src.moleType,
		moleScale: src.moleScale,
		moleX: src.moleX,
		moleY: src.moleY,
		height: src.height,
		build: src.build,
		name: '',
		creator: '',
		gender: src.gender,
		birthMonth: 0,
		birthDay: 0,
		favoriteColor: src.favoriteColor,
		favorite: 0,
		copyable: 0,
		ngWord: 0,
		localonly: 0,
		regionMove: 0,
		fontRegion: 0,
		roomIndex: 0,
		positionInRoom: 0,
		birthPlatform: 3, // FFL_BIRTH_PLATFORM_CTR
		createID: new Array(10),
		padding_0: 0,
		authorType: 0,
		authorID: new Array(8)
	};
}

// --------------------- studioURLObfuscationDecode(data) ---------------------
/**
 * @param {Uint8Array} data - Obfuscated Studio URL data.
 * @returns {Uint8Array} Decoded Uint8Array representing CharInfoStudio.
 */
export function studioURLObfuscationDecode(data: Uint8Array): Uint8Array {
	const decodedData = new Uint8Array(data);
	const random = decodedData[0];
	let previous = random;

	for (let i = 1; i < 48; i++) {
		const encodedByte = decodedData[i];
		const original = (encodedByte - 7 + 256) % 256;
		decodedData[i - 1] = original ^ previous;
		previous = encodedByte;
	}

	return decodedData.slice(0, StudioCharInfo.size); // Clamp to StudioCharInfo.size
}

// ----------------- convertFFLiCharInfoToStudioCharInfo(src) -----------------
/**
 * Creates a StudioCharInfo object from FFLiCharInfo.
 * @param {FFLiCharInfo} src - The FFLiCharInfo instance.
 * @returns {StudioCharInfo} The StudioCharInfo output.
 * @todo TODO: Currently does NOT convert color indices
 * to CommonColor indices (ToVer3... etc)
 */
export function convertFFLiCharInfoToStudioCharInfo(src: ReturnType<typeof FFLiCharInfo.unpack>): ReturnType<typeof StudioCharInfo.unpack> {
	return {
		beardColor: commonColorUnmask(src.beardColor),
		beardType: src.beardType,
		build: src.build,
		eyeAspect: src.eyeAspect,
		eyeColor: commonColorUnmask(src.eyeColor),
		eyeRotate: src.eyeRotate,
		eyeScale: src.eyeScale,
		eyeType: src.eyeType,
		eyeX: src.eyeX,
		eyeY: src.eyeY,
		eyebrowAspect: src.eyebrowAspect,
		eyebrowColor: commonColorUnmask(src.eyebrowColor),
		eyebrowRotate: src.eyebrowRotate,
		eyebrowScale: src.eyebrowScale,
		eyebrowType: src.eyebrowType,
		eyebrowX: src.eyebrowX,
		eyebrowY: src.eyebrowY,
		facelineColor: src.faceColor,
		facelineMake: src.faceMake,
		facelineType: src.faceType,
		facelineWrinkle: src.faceTex,
		favoriteColor: src.favoriteColor,
		gender: src.gender,
		glassColor: commonColorUnmask(src.glassColor),
		glassScale: src.glassScale,
		glassType: src.glassType,
		glassY: src.glassY,
		hairColor: commonColorUnmask(src.hairColor),
		hairFlip: src.hairFlip,
		hairType: src.hairType,
		height: src.height,
		moleScale: src.moleScale,
		moleType: src.moleType,
		moleX: src.moleX,
		moleY: src.moleY,
		mouthAspect: src.mouthAspect,
		mouthColor: commonColorUnmask(src.mouthColor),
		mouthScale: src.mouthScale,
		mouthType: src.mouthType,
		mouthY: src.mouthY,
		mustacheScale: src.beardScale,
		mustacheType: src.beardMustache,
		mustacheY: src.beardY,
		noseScale: src.noseScale,
		noseType: src.noseType,
		noseY: src.noseY
	};
}
