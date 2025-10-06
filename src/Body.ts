import * as THREE from 'three';

export enum PantsColor {
	GrayNormal = 0,
	BluePresent = 1,
	RedRegular = 2,
	GoldSpecial = 3
};

export const pantsColors: Record<PantsColor, THREE.Color> = {
	[PantsColor.GrayNormal]: new THREE.Color(0x40474E),
	[PantsColor.BluePresent]: new THREE.Color(0x28407A),
	[PantsColor.RedRegular]: new THREE.Color(0x702015),
	[PantsColor.GoldSpecial]: new THREE.Color(0xC0A030)
};
