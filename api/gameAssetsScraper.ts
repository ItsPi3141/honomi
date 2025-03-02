import fs from "node:fs";
import path from "node:path";
import type { AllGames, GameImages } from "@/types/codes";

const dataPath = path.resolve("./api/images.json");
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "{}");
const data: {
	[game in keyof AllGames]: GameImages;
} = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// genshin
// star rail
// zzz
const hyvScraper = async (): Promise<Record<string, GameImages>> => {
	const idMap: { [id: string]: keyof AllGames } = {
		"2": "genshin",
		"6": "hsr",
		"8": "zzz",
	};

	const scrapedData = await fetch(
		"https://bbs-api-os.hoyolab.com/community/painter/wapi/circle/info",
	).then((res) => res.json());
	if (scrapedData.message !== "OK" || !scrapedData.data?.game_list) {
		console.error("API Error! Got the following response", scrapedData);
		return {};
	}

	const images: {
		[game in keyof AllGames]?: GameImages;
	} = {};
	for (const gameData of scrapedData.data.game_list) {
		if (!idMap[gameData.id]) continue;
		images[idMap[gameData.id]] = {
			banner: gameData.bg,
			icon: `${gameData.icon}?x-oss-process=image/resize,w_128`,
			color: Number.parseInt(gameData.bg_color.replace("#", ""), 16),
		};
	}

	return images;
};
Object.assign(data, await hyvScraper());

// wuwa
const wuwaScraper = (): Record<string, GameImages> => {
	return {
		wuwa: {
			banner:
				"https://static.wikia.nocookie.net/wutheringwaves/images/0/08/Site-background-dark/revision/latest/scale-to-width-down/900",
			icon: "https://static.wikia.nocookie.net/wutheringwaves/images/4/4a/Site-favicon.ico/revision/latest/scale-to-width-down/128",
			color: 0x403929,
		},
	};
};
Object.assign(data, wuwaScraper());

fs.writeFileSync(
	dataPath,
	JSON.stringify(data, null, 2).replaceAll("  ", "	"),
);
