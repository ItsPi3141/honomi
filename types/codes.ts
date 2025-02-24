export enum ItemType {
	CODE = 0,
	CATEGORY = 1,
}

export interface RedeemCodeItem {
	type: ItemType.CODE;
	code: string;
	rewards: {
		image: string;
		count: number;
	}[];
}
export interface RedeemCodeItemJson {
	c: string;
	r: {
		i: string;
		n: number;
	}[];
}
export interface RedeemCodeCategory {
	type: ItemType.CATEGORY;
	title: string;
}

export interface AllGames {
	genshin: RedeemCodesCollection;
	hsr: RedeemCodesCollection;
	zzz: RedeemCodesCollection;
	wuwa: RedeemCodesCollection;
}
export interface AllGamesRaw {
	genshin: RedeemCodesCollectionJson;
	hsr: RedeemCodesCollectionJson;
	zzz: RedeemCodesCollectionJson;
	wuwa: RedeemCodesCollectionJson;
}
export interface RedeemCodesCollection {
	valid: RedeemCodeItem[];
	expired: RedeemCodeItem[];
}
export interface RedeemCodesCollectionJson {
	p: string;
	s: string;
	v: RedeemCodeItemJson[];
	e: RedeemCodeItemJson[];
}
export interface RedeemCodesCollectionRawJson {
	v: RedeemCodeItemJson[];
	e: RedeemCodeItemJson[];
}
