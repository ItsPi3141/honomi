import fs from "node:fs";
import path from "node:path";
import type {
	RedeemCodesCollectionJson,
	RedeemCodeItemJson,
	RedeemCodesCollectionRawJson,
	AllGames,
} from "@/types/codes";
import { JSDOM } from "jsdom";
import lzString from "lz-string";
const { compressToUint8Array: compress } = lzString;

import { genshinScraper } from "./scrapers/genshin";
import { hsrScraper } from "./scrapers/hsr";
import { zzzScraper } from "./scrapers/zzz";
import { wuwaScraper } from "./scrapers/wuwa";

const imagePrefixes = {
	genshin: "https://static.wikia.nocookie.net/gensin-impact/images/",
	hsr: "https://static.wikia.nocookie.net/houkai-star-rail/images/",
	zzz: "https://static.wikia.nocookie.net/zenless-zone-zero/images/",
	wuwa: "https://static.wikia.nocookie.net/wutheringwaves/images",
};
const imageSuffix = ".png/revision/latest/scale-to-width-down/32";

export const genericScraper = async (
	url: string,
	processor: (
		document: Document,
	) => RedeemCodesCollectionRawJson | RedeemCodeItemJson[],
) => {
	const html = await fetch(url).then((res) => {
		if (res.ok) return res.text();
		throw new Error(res.statusText);
	});
	const dom = new JSDOM(html);
	return processor(dom.window.document);
};

export const wikiaAssetProcessor = (
	url: string,
	game: keyof typeof imagePrefixes,
) => {
	const regex = new RegExp(
		`(?<=${imagePrefixes[game].replaceAll(/(?=[\/.])/g, "\\")}).*?(?=\\.png\\/revision\\/.*$)`,
	);
	return url.match(regex)?.[0];
};

const codesResolver = (
	newValidCodes: RedeemCodeItemJson[],
	newExpiredCodes: RedeemCodeItemJson[],
	{
		v: currentValidCodes,
		e: currentExpiredCodes,
	}: RedeemCodesCollectionRawJson,
): [RedeemCodesCollectionRawJson, boolean] => {
	const newData = {
		v: currentValidCodes,
		e: currentExpiredCodes,
	};
	let hasNewCodes = false;

	// process new valid codes
	for (const code of newValidCodes) {
		// check if the code has been manually set to expired
		if (currentExpiredCodes.find((c: RedeemCodeItemJson) => c.c === code.c))
			continue;

		// check if the code already exists
		if (currentValidCodes.find((c: RedeemCodeItemJson) => c.c === code.c))
			continue;

		newData.v.push(code);
		hasNewCodes = true;
	}

	// process new expired codes
	for (const code of newExpiredCodes) {
		// check if the code already exists
		if (currentExpiredCodes.find((c: RedeemCodeItemJson) => c.c === code.c))
			continue;

		newData.e.push(code);

		// remove the code from the valid codes
		newData.v = newData.v.filter((c: RedeemCodeItemJson) => c.c !== code.c);
	}

	// check if existing valid codes have been removed entirely
	for (const code of newData.v) {
		if (newValidCodes.find((c) => c.c === code.c)) continue;

		newData.v = newData.v.filter((c: RedeemCodeItemJson) => c.c !== code.c);
		newData.e.push(code);
	}

	return [newData, hasNewCodes];
};

export const scraper = async () => {
	const scrapedData = {
		genshin: await genshinScraper(),
		hsr: await hsrScraper(),
		zzz: await zzzScraper(),
		wuwa: await wuwaScraper(),
	};

	const newCodes: {
		[game in keyof typeof scrapedData]?: boolean;
	} = {};
	for (const game in scrapedData) {
		newCodes[game as keyof typeof newCodes] = false;
	}

	const dataPath = path.resolve("./api/codes.json");
	if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "{}");
	const data: {
		[game in keyof AllGames]: RedeemCodesCollectionJson;
	} = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

	for (const _game in scrapedData) {
		const game = _game as keyof AllGames;

		const [newData, hasNewCodes] = codesResolver(
			scrapedData[game].v,
			scrapedData[game].e,
			{
				v: data[game]?.v ?? [],
				e: data[game]?.e ?? [],
			},
		);
		newCodes[game] = hasNewCodes;
		data[game] = {
			p: imagePrefixes[game],
			s: imageSuffix,
			...newData,
		};
	}

	fs.writeFileSync(
		dataPath,
		JSON.stringify(data, null, 2).replaceAll("  ", "	"),
	);

	const compressed = compress(JSON.stringify(data));
	fs.writeFileSync(path.resolve("./api/codes.compressed.json"), compressed);

	return newCodes;
};

console.log(await scraper());
