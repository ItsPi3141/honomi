import type { RedeemCodeItemJson, Game } from "../../src/types/codes";

export const genericHoyolabScraper = async (
	validCodes: RedeemCodeItemJson[],
	game: Game,
): Promise<RedeemCodeItemJson[]> => {
	const hylData = await (
		await fetch(
			`https://bbs-api-os.hoyolab.com/community/painter/wapi/circle/channel/guide/material?game_id=${game}`,
			{
				headers: {
					"x-rpc-client_type": "4",
				},
			},
		)
	).json();
	const hylCodes = hylData.data.modules.find(
		(item: Record<string, any>) => item?.exchange_group?.bonuses != null,
	);
	if (!hylCodes) return validCodes;
	for (const code of hylCodes.exchange_group.bonuses) {
		if (validCodes.find((item) => item.c === code.code)) continue;
		validCodes.push({
			c: code.exchange_code,
			r: code.icon_bonuses.map((item: Record<string, string | number>) => ({
				i: `${(item.icon_url as string).split("?")[0]}?x-oss-process=image/resize,w_20`,
				n: item.bonus_num,
			})),
		});
	}

	return validCodes;
};
