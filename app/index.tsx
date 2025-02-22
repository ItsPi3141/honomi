import {
	ItemType,
	type RedeemCodeItem,
	type RedeemCodeCategory,
} from "@/types/codes";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useThemeColor";
import { useEffect, useState } from "react";
import { FlatList, Image, Linking, View } from "react-native";

import * as WebBrowser from "expo-web-browser";

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

	useEffect(() => {
		(async () => {
			await WebBrowser.warmUpAsync();
			await WebBrowser.mayInitWithUrlAsync(
				"https://genshin.hoyoverse.com/en/gift",
			);
		})();
	}, []);

	const [validCodes, setValidCodes] = useState<DataItem[]>([
		{
			type: ItemType.CODE,
			code: "HNGB5V9W8347",
			rewards: [
				{
					image:
						"https://static.wikia.nocookie.net/gensin-impact/images/d/d4/Item_Primogem.png/revision/latest/scale-to-width-down/32",
					count: 1,
				},
				{
					image:
						"https://static.wikia.nocookie.net/gensin-impact/images/0/07/Item_Adventurer%27s_Experience.png/revision/latest/scale-to-width-down/32",
					count: 1,
				},
			],
		},
		{
			type: ItemType.CODE,
			code: "KFM9PB834AWF",
			rewards: [
				{
					image:
						"https://static.wikia.nocookie.net/gensin-impact/images/d/d4/Item_Primogem.png/revision/latest/scale-to-width-down/32",
					count: 1,
				},
			],
		},
		{
			type: ItemType.CODE,
			code: "OSY387N4BH56",
			rewards: [
				{
					image:
						"https://static.wikia.nocookie.net/gensin-impact/images/d/d4/Item_Primogem.png/revision/latest/scale-to-width-down/32",
					count: 1,
				},
			],
		},
		{
			type: ItemType.CODE,
			code: "A2Y43WGO5HN",
			rewards: [
				{
					image:
						"https://static.wikia.nocookie.net/gensin-impact/images/d/d4/Item_Primogem.png/revision/latest/scale-to-width-down/32",
					count: 1,
				},
			],
		},
	]);

	const [expiredCodes, setExpiredCodes] = useState<RedeemCodeItem[]>([
		{
			type: ItemType.CODE,
			code: "HNGB5V9W8347",
			rewards: [
				{
					image:
						"https://static.wikia.nocookie.net/gensin-impact/images/d/d4/Item_Primogem.png/revision/latest/scale-to-width-down/32",
					count: 1,
				},
				{
					image:
						"https://static.wikia.nocookie.net/gensin-impact/images/0/07/Item_Adventurer%27s_Experience.png/revision/latest/scale-to-width-down/32",
					count: 1,
				},
			],
		},
		{
			type: ItemType.CODE,
			code: "KFM9PB834AWF",
			rewards: [
				{
					image:
						"https://static.wikia.nocookie.net/gensin-impact/images/d/d4/Item_Primogem.png/revision/latest/scale-to-width-down/32",
					count: 1,
				},
			],
		},
		{
			type: ItemType.CODE,
			code: "OSY387N4BH56",
			rewards: [
				{
					image:
						"https://static.wikia.nocookie.net/gensin-impact/images/d/d4/Item_Primogem.png/revision/latest/scale-to-width-down/32",
					count: 1,
				},
			],
		},
		{
			type: ItemType.CODE,
			code: "A2Y43WGO5HN",
			rewards: [
				{
					image:
						"https://static.wikia.nocookie.net/gensin-impact/images/d/d4/Item_Primogem.png/revision/latest/scale-to-width-down/32",
					count: 1,
				},
			],
		},
	]);

	return (
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
						...validCodes,
						...validCodes,
						...validCodes,
						{
							type: ItemType.CATEGORY,
							title: "Expired Codes",
						},
						...validCodes,
						...validCodes,
						...validCodes,
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
			/>
		</View>
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
				alignItems: "center",
				backgroundColor: theme.surface,
				padding: 12,
				marginBottom: 16,
				borderRadius: 8,
			}}
		>
			<View>
				<ThemedText style={{ fontWeight: "bold", fontSize: 16 }}>
					{item.code}
				</ThemedText>
				<View
					style={{
						flex: 1,
						flexDirection: "row",
						alignItems: "center",
						gap: 1,
						marginTop: 4,
					}}
				>
					{item.rewards.map((reward) => (
						<View
							key={reward.image}
							style={{
								flex: 1,
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
					<View style={{ flexGrow: 1 }} />
				</View>
			</View>

			<View style={{ flexGrow: 1 }} />

			<View>
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
