export enum Game {
	Genshin = 2,
	Hsr = 6,
	Zzz = 8,
}
export type RedeemCodeItem = {
	code: string;
	rewards: {
		image: string;
		count: number;
	}[];
};
export type RedeemCodeItemJson = {
	c: string;
	r: {
		i: string;
		n: number;
	}[];
};
export type RedeemCodeCategory = {
	title: string;
};

export type AllGames = {
	genshin: RedeemCodesCollection;
	hsr: RedeemCodesCollection;
	zzz: RedeemCodesCollection;
	wuwa: RedeemCodesCollection;
};
export type AllGamesRaw = {
	[game in keyof AllGames]: RedeemCodesCollectionJson;
};
export type RedeemCodesCollection = {
	valid: RedeemCodeItem[];
	expired: RedeemCodeItem[];
};
export type RedeemCodesCollectionJson = {
	p: string;
	s: string;
	v: RedeemCodeItemJson[];
	e: RedeemCodeItemJson[];
};
export type RedeemCodesCollectionRawJson = {
	v: RedeemCodeItemJson[];
	e: RedeemCodeItemJson[];
};

export type GameImages = {
	icon: string;
	banner: string;
	color: number;
};
export type AllGamesImages = {
	[game in keyof AllGames]: GameImages;
};
