import type {
	RedeemCodeItemJson,
	RedeemCodesCollectionRawJson,
} from "@/types/codes";
import { wikiaAssetProcessor, genericScraper } from "../codesScraper";

export const genshinScraper =
	async (): Promise<RedeemCodesCollectionRawJson> => {
		const handler = (document: Document): RedeemCodeItemJson[] => {
			const codes: RedeemCodeItemJson[] = [];

			for (const row of document
				.querySelector(".wikitable tbody")
				?.querySelectorAll("tr:has(td)") ?? []) {
				const codeCell = row.querySelector("td:nth-child(1)");
				const rewardCell = row.querySelector("td:nth-child(3)");

				if (!codeCell || !rewardCell) continue;

				const code = codeCell.querySelector("a code")?.textContent;
				if (!code) continue;

				const rewards = [];
				for (const reward of rewardCell.querySelectorAll("span.item")) {
					let image = reward.querySelector("img")?.getAttribute("src");
					if (!image) continue;
					image = wikiaAssetProcessor(image, "genshin");

					const count = (
						reward.querySelector(".item-text") as HTMLSpanElement
					)?.innerHTML
						.replaceAll(",", "")
						.trim()
						.match("\\d+$")?.[0];
					if (!image || !count) continue;
					rewards.push({ i: image, n: Number.parseInt(count) });
				}
				if (rewards.length === 0) continue;

				const item: RedeemCodeItemJson = {
					c: code,
					r: rewards,
				};
				codes.push(item);
			}
			return codes;
		};

		const validCodes = await genericScraper(
			"https://antifandom.com/genshin-impact/wiki/Promotional_Code",
			handler,
		);
		const expiredCodes = await genericScraper(
			"https://antifandom.com/genshin-impact/wiki/Promotional_Code/History",
			handler,
		);

		return {
			v: validCodes as RedeemCodeItemJson[],
			e: expiredCodes as RedeemCodeItemJson[],
		};
	};
