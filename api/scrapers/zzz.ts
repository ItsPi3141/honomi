import type {
	RedeemCodeItemJson,
	RedeemCodesCollectionRawJson,
} from "@/types/codes";
import { wikiaAssetProcessor, genericScraper } from "../scraper";

export const zzzScraper = async (): Promise<RedeemCodesCollectionRawJson> => {
	const handler = (document: Document): RedeemCodesCollectionRawJson => {
		const validCodes: RedeemCodeItemJson[] = [];
		const expiredCodes: RedeemCodeItemJson[] = [];

		for (const row of document
			.querySelector(".wikitable tbody")
			?.querySelectorAll("tr:has(td)") ?? []) {
			const codeCell = row.querySelector("td:nth-child(1)");
			const rewardCell = row.querySelector("td:nth-child(3)");

			if (!codeCell || !rewardCell) continue;

			const code = codeCell.querySelector("code")?.textContent;
			if (!code) continue;

			const rewards = [];
			for (const reward of rewardCell.querySelectorAll("span.item")) {
				let image = reward.querySelector("img")?.getAttribute("src");
				if (!image) continue;
				image = wikiaAssetProcessor(image, "zzz");

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

			if (row.querySelector("td.bg-green")) {
				validCodes.push(item);
			} else if (row.querySelector("td.bg-red")) {
				expiredCodes.push(item);
			}
		}
		return {
			v: validCodes,
			e: expiredCodes,
		};
	};

	const codes = await genericScraper(
		"https://antifandom.com/zenless-zone-zero/wiki/Redemption_Code",
		handler,
	);

	return codes as RedeemCodesCollectionRawJson;
};
