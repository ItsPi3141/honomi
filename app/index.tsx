import type {
	RedeemCodeItem,
	AllGames,
	RedeemCodeItemJson,
	AllGamesRaw,
} from "@/types/codes";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useThemeColor";
import { useEffect, useState } from "react";
import {
	Dimensions,
	Image,
	Linking,
	SectionList,
	StatusBar,
	View,
} from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import MaskedView from "@react-native-masked-view/masked-view";

import { MMKV, useMMKVString } from "react-native-mmkv";

import * as WebBrowser from "expo-web-browser";
import { ApiContext } from "@/contexts/apiContext";
import { decompressFromUint8Array } from "lz-string";
import { gameDisplayName, redeemCodesPage } from "@/constants/Constants";

type DataItem = {
	title: string;
	data: RedeemCodeItem[];
};

const headerHeight = 72;

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
							code: item.c,
							rewards: item.r.map((reward) => ({
								image: `${raw[game].p}${reward.i}${raw[game].s}`,
								count: reward.n,
							})),
						})),
						expired: raw[game].e.map((item: RedeemCodeItemJson) => ({
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
		})();
	}, []);
	const [selectedGame, setSelectedGame] = useMMKVString("selected-game") as [
		keyof AllGames,
		(value: keyof AllGames) => void,
	];
	useEffect(() => {
		async () => {
			const g = selectedGame ?? "genshin";
			if (!redeemCodesPage[g]) return;
			await WebBrowser.mayInitWithUrlAsync(redeemCodesPage[g]);
		};
	}, [selectedGame]);

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
				<Header />
				<SectionList
					sections={
						[
							{
								title: "Valid Codes",
								data: apiData?.genshin.valid ?? [],
							},
							{
								title: "Expired Codes",
								data: apiData?.genshin.expired ?? [],
							},
						] as DataItem[]
					}
					renderItem={({
						item,
						index,
					}: { item: RedeemCodeItem; index: number }) => (
						<RedeemCode item={item} handleOpen={(e) => openRedeemPage(e)} />
					)}
					renderSectionHeader={({ section }) => (
						<ThemedText
							style={{
								fontWeight: "bold",
								fontSize: 16,
								paddingVertical: 12,
								marginTop: section.title.includes("Valid")
									? headerHeight + 24 + 16
									: 0,
							}}
						>
							{section.title}
						</ThemedText>
					)}
					keyExtractor={(item, index) => `${item}_${index}`}
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
				/>
			</View>
		</ApiContext.Provider>
	);
}

function RedeemCode({
	item,
	handleOpen,
}: {
	item: RedeemCodeItem;
	handleOpen: (code: string) => void;
}) {
	const theme = useTheme();

	return (
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
	);
}

let windowWidth = Dimensions.get("window").width;
Dimensions.addEventListener("change", ({ window }) => {
	windowWidth = window.width;
	headerMask = createHeaderMask();
});
const headerBorderRadius = 24;
const statusBarHeight = StatusBar.currentHeight ?? 36;
const height = statusBarHeight + headerHeight;
const createHeaderMask = () => (
	<Svg
		preserveAspectRatio="none"
		height="100%"
		width="100%"
		viewBox={`0 0 ${windowWidth} ${height + headerBorderRadius}`}
	>
		<Path
			d={`M0 0 L${windowWidth} 0 L${windowWidth} ${
				height + headerBorderRadius
			} Q${windowWidth} ${height}, ${
				windowWidth - headerBorderRadius
			} ${height} L${headerBorderRadius} ${height} Q0 ${height}, 0 ${
				height + headerBorderRadius
			} Z`}
			fill="black"
		/>
	</Svg>
);
let headerMask = createHeaderMask();

function Header() {
	const theme = useTheme();

	const [selectedGame, setSelectedGame] = useMMKVString("selected-game") as [
		keyof AllGames,
		(value: keyof AllGames) => void,
	];

	return (
		<MaskedView
			style={[
				{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					zIndex: 100,
					backgroundColor: theme.surface,
					padding: 16,
					paddingTop: 32,

					flex: 1,
					gap: 8,
					justifyContent: "center",
				},
				{ width: windowWidth },
				{ height: height + headerBorderRadius },
			]}
			maskElement={headerMask}
		>
			<ThemedText style={{ fontWeight: "bold", fontSize: 20 }}>
				{gameDisplayName[selectedGame ?? "genshin"]}
			</ThemedText>
		</MaskedView>
	);
}
