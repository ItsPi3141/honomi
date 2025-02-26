import {
	ItemType,
	type RedeemCodeItem,
	type RedeemCodeCategory,
	AllGames,
	RedeemCodeItemJson,
	AllGamesRaw,
} from "@/types/codes";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useThemeColor";
import { useEffect, useState } from "react";
import { FlatList, Image, Linking, View } from "react-native";

import * as WebBrowser from "expo-web-browser";
import { ApiContext } from "@/contexts/apiContext";
import { decompressFromUint8Array } from "lz-string";

type DataItem = RedeemCodeItem | RedeemCodeCategory;

const openRedeemPage = async (code: string) => {
	const url = `https://genshin.hoyoverse.com/en/gift?code=${code}`;
	try {
		await WebBrowser.openBrowserAsync(url, {
			showTitle: true,
		});
	} catch {
		Linking.openURL(url);
	}
};

export default function Index() {
	const theme = useTheme();

	const [apiData, setApiData] = useState<AllGames | null>(null);
	useEffect(() => {
		fetch(
			"https://raw.githubusercontent.com/itspi3141/honomi/main/api/codes.compressed.json",
		)
			.then((res) => res.arrayBuffer())
			.then((buffer) => decompressFromUint8Array(new Uint8Array(buffer)))
			.then((res) => {
				const raw: AllGamesRaw = JSON.parse(res);
				const processed: Partial<AllGames> = {};
				for (const _game in raw) {
					const game = _game as keyof typeof raw;
					processed[game] = {
						valid: raw[game].v.map((item: RedeemCodeItemJson) => ({
							type: ItemType.CODE,
							code: item.c,
							rewards: item.r.map((reward) => ({
								image: `${raw[game].p}${reward.i}${raw[game].s}`,
								count: reward.n,
							})),
						})),
						expired: raw[game].e.map((item: RedeemCodeItemJson) => ({
							type: ItemType.CODE,
							code: item.c,
							rewards: item.r.map((reward) => ({
								image: `${raw[game].p}${reward.i}${raw[game].s}`,
								count: reward.n,
							})),
						})),
					};
				}

				setApiData(processed as AllGames);
			});
	}, []);

	useEffect(() => {
		(async () => {
			await WebBrowser.warmUpAsync();
			await WebBrowser.mayInitWithUrlAsync(
				"https://genshin.hoyoverse.com/en/gift",
			);
		})();
	}, []);

	return (
		<ApiContext.Provider value={apiData}>
			<View
				style={{
					flex: 1,
					flexDirection: "column",
					justifyContent: "flex-start",
					alignItems: "stretch",
					backgroundColor: theme.background,
					padding: 16,
					paddingTop: 0,
				}}
			>
				<FlatList
					data={
						[
							{
								type: ItemType.CATEGORY,
								title: "Valid Codes",
							},
							...(apiData?.genshin.valid ?? []),
							{
								type: ItemType.CATEGORY,
								title: "Expired Codes",
							},
							...(apiData?.genshin.expired ?? []),
						] as DataItem[]
					}
					renderItem={({ item, index }: { item: DataItem; index: number }) => (
						<RedeemCode
							item={item}
							index={index}
							handleOpen={(e) => openRedeemPage(e)}
						/>
					)}
					keyExtractor={(item, index) =>
						`${item.type === ItemType.CODE ? item.code : item.title}_${index}`
					}
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
				/>
			</View>
		</ApiContext.Provider>
	);
}

function RedeemCode({
	item,
	index,
	handleOpen,
}: {
	item: DataItem;
	index: number;
	handleOpen: (code: string) => void;
}) {
	const theme = useTheme();

	return item.type === ItemType.CODE ? (
		<View
			style={{
				flex: 1,
				flexDirection: "row",
				justifyContent: "space-between",
				alignItems: "flex-start",
				backgroundColor: theme.surface,
				padding: 12,
				marginBottom: 16,
				borderRadius: 8,
			}}
		>
			<View style={{ flexShrink: 1 }}>
				<ThemedText style={{ fontWeight: "bold", fontSize: 16 }}>
					{item.code}
				</ThemedText>
				<View
					style={{
						flex: 0,
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "flex-start",
						gap: 4,
						marginTop: 4,
						flexWrap: "wrap",
						width: "100%",
					}}
				>
					{item.rewards.map((reward) => (
						<View
							key={reward.image}
							style={{
								flex: 0,
								flexDirection: "row",
								alignItems: "center",
							}}
						>
							<Image
								source={{
									uri: reward.image,
									width: 20,
									height: 20,
								}}
							/>
							<ThemedText>{reward.count}</ThemedText>
						</View>
					))}
				</View>
			</View>

			<View
				style={{
					flexGrow: 1,
					minWidth: 48,
				}}
			/>

			<View style={{ flexShrink: 0, paddingTop: 8, paddingRight: 6 }}>
				<ThemedButton
					onPress={() => {
						handleOpen(item.code);
					}}
				>
					<ThemedText
						style={{ fontSize: 12, fontWeight: "bold", color: theme.accent }}
					>
						Redeem
					</ThemedText>
				</ThemedButton>
			</View>
		</View>
	) : (
		<ThemedText
			style={{
				fontWeight: "bold",
				fontSize: 16,
				paddingVertical: 12,
				marginTop: index === 0 ? 16 : 0,
			}}
		>
			{item.title}
		</ThemedText>
	);
}
