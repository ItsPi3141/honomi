import type {
	RedeemCodeItem,
	AllGames,
	RedeemCodeItemJson,
	AllGamesRaw,
	AllGamesImages,
} from "../types/codes";

import { ThemedButton } from "../components/ThemedButton";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useThemeColor";

import {
	Fragment,
	memo,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import {
	Dimensions,
	Image,
	Linking,
	Pressable,
	SectionList,
	View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import MaskedView from "@react-native-masked-view/masked-view";
import AutoHeightImage from "react-native-auto-height-image";

import { useMMKVString } from "react-native-mmkv";

import { openBrowser } from "@swan-io/react-native-browser";
import { ApiContext, ApiImagesContext } from "../contexts/apiContext";
import { decompressFromUint8Array } from "lz-string";
import { gameDisplayName, redeemCodesPage } from "../constants/Constants";
import { useStatusBarHeight } from "../hooks/useStatusBarHeight";
import { Icons } from "../components/Icons";
import { Portal } from "@gorhom/portal";
import { Overlay } from "../components/Overlay";
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
} from "react-native-reanimated";
import { Accordion } from "../constants/Animations";

type DataItem = {
	title: string;
	data: RedeemCodeItem[];
};

let windowWidth = Dimensions.get("window").width;
Dimensions.addEventListener("change", ({ window }) => {
	windowWidth = window.width;
});
const headerBorderRadius = 24;
const headerHeight = 72;

const defaultGame = "genshin";

export default function MainPage() {
	const theme = useTheme();

	const openRedeemPage = useCallback(async (code: string) => {
		const url = `https://genshin.hoyoverse.com/en/gift?code=${code}`;
		try {
			openBrowser(url, {});
		} catch {
			Linking.openURL(url);
		}
	}, []);

	const [apiData, setApiData] = useState<AllGames | null>(null);
	useEffect(() => {
		fetch(
			`https://raw.githubusercontent.com/itspi3141/honomi/main/api/codes.compressed.json?v=${Date.now()}`,
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

	const [selectedGame, setSelectedGame] = useMMKVString("selected-game") as [
		keyof AllGames,
		(value: keyof AllGames) => void,
	];

	const scrollViewHeightOffset =
		useStatusBarHeight() + headerHeight - headerBorderRadius;

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
					style={{
						marginTop: scrollViewHeightOffset,
					}}
					sections={
						[
							{
								title: "Valid Codes",
								data: apiData?.[selectedGame ?? defaultGame]?.valid ?? [],
							},
							{
								title: "Expired Codes",
								data: apiData?.[selectedGame ?? defaultGame]?.expired ?? [],
							},
						] as DataItem[]
					}
					renderItem={({ item }: { item: RedeemCodeItem; index: number }) => (
						<RedeemCode item={item} handleOpen={(e) => openRedeemPage(e)} />
					)}
					renderSectionHeader={({ section }) => (
						<ThemedText
							style={{
								fontWeight: "bold",
								fontSize: 16,
								paddingVertical: 12,
								marginTop: section.title.includes("Valid") ? 24 : 0,
							}}
						>
							{section.title}
						</ThemedText>
					)}
					keyExtractor={(item, index) => `${item}_${index}`}
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
					removeClippedSubviews={true}
				/>
			</View>
		</ApiContext.Provider>
	);
}

const RedeemCode = memo(
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
							<View key={reward.image} style={{ flexDirection: "row" }}>
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
						width: 48,
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
	},
	(prev, next) => prev.item.code === next.item.code,
);

function Header() {
	const theme = useTheme();
	const height = useStatusBarHeight() + headerHeight;

	const [apiImagesData, setApiImagesData] = useState<AllGamesImages | null>(
		null,
	);
	useEffect(() => {
		fetch(
			`https://raw.githubusercontent.com/itspi3141/honomi/main/api/images.json?v=${Date.now()}`,
		)
			.then((res) => res.json())
			.then((res) => {
				setApiImagesData(res as AllGamesImages);
			});
	}, []);

	const [selectedGame, setSelectedGame] = useMMKVString("selected-game") as [
		keyof AllGames,
		(value: keyof AllGames) => void,
	];

	const [dropdownVisible, setDropdownVisible] = useState(false);

	return (
		<ApiImagesContext.Provider value={apiImagesData}>
			<MaskedView
				style={[
					{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						zIndex: 100,
					},
					{ width: windowWidth },
					{ height: height + headerBorderRadius },
					{
						backgroundColor: apiImagesData?.[selectedGame ?? defaultGame]
							? `#${apiImagesData?.[selectedGame ?? defaultGame]?.color.toString(16)}`
							: theme.surface,
					},
				]}
				maskElement={
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
				}
			>
				{apiImagesData?.[selectedGame ?? defaultGame] && (
					<View
						style={{
							zIndex: 1,
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,

							display: "flex",
							alignItems: "stretch",
							justifyContent: "center",
						}}
					>
						<AutoHeightImage
							width={windowWidth}
							source={{
								uri: apiImagesData?.[selectedGame ?? defaultGame]?.banner,
							}}
							style={{
								position: "absolute",
								top: -16,
								opacity: (selectedGame ?? defaultGame) === "wuwa" ? 0.5 : 1,
							}}
						/>
					</View>
				)}

				<Pressable
					style={{
						zIndex: 2,
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,

						padding: 16,
						paddingTop: 32,

						display: "flex",
						flexDirection: "row",
						gap: 8,
						alignItems: "center",
					}}
					onPress={() => setDropdownVisible(true)}
				>
					{apiImagesData?.[selectedGame ?? defaultGame]?.icon && (
						<Image
							source={{
								uri: apiImagesData?.[selectedGame ?? defaultGame]?.icon,
								width: 40,
								height: 40,
							}}
							borderRadius={8}
						/>
					)}
					<ThemedText
						style={{ fontWeight: "bold", fontSize: 20, marginLeft: 8 }}
					>
						{gameDisplayName[selectedGame ?? defaultGame]}
					</ThemedText>

					<Icons.ArrowDown size={14} />
				</Pressable>
			</MaskedView>
			<GameSelector
				visible={dropdownVisible}
				onClose={() => setDropdownVisible(false)}
			/>
		</ApiImagesContext.Provider>
	);
}

function GameSelector({
	visible,
	onClose,
}: {
	visible: boolean;
	onClose: () => void;
}) {
	const theme = useTheme();
	const statusBarHeight = useStatusBarHeight();

	const apiData = useContext(ApiContext);
	const apiImagesData = useContext(ApiImagesContext);

	const [selectedGame, setSelectedGame] = useMMKVString("selected-game") as [
		keyof AllGames,
		(value: keyof AllGames) => void,
	];

	return (
		<Portal>
			<Overlay>
				<View
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
					}}
				>
					<>
						{visible && (
							<Animated.View
								entering={FadeIn.duration(200)}
								exiting={FadeOut.duration(200)}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									backgroundColor: "#0006",
								}}
							>
								<Pressable
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										right: 0,
										bottom: 0,
									}}
									onPress={onClose}
								/>
							</Animated.View>
						)}
						<Animated.View
							layout={LinearTransition.duration(150)}
							style={{
								backgroundColor: theme.surfaceHigher,
								display: "flex",
								alignSelf: "flex-start",
								flexDirection: "column",

								position: "absolute",
								top: statusBarHeight + 64,
								left: 16,

								borderRadius: 8,
								overflow: "hidden",
								maxHeight: visible ? "auto" : Number.EPSILON,
							}}
						>
							{Object.entries(apiImagesData ?? {})
								.filter(([game]) => apiData?.[game as keyof AllGames])
								.map(([game, data]) => (
									<Pressable
										key={game}
										style={({ pressed }) => ({
											padding: 12,
											display: "flex",
											flexDirection: "row",
											alignItems: "center",
											gap: 8,
											backgroundColor: pressed
												? theme.surfacePressed
												: "transparent",
										})}
										onPress={() => {
											setSelectedGame(game as keyof AllGames);
											onClose();
										}}
									>
										<Image
											source={{
												uri: data?.icon,
												width: 32,
												height: 32,
											}}
											borderRadius={8}
										/>
										<ThemedText
											style={{
												fontSize: 15,
												marginLeft: 8,
												color:
													game === (selectedGame ?? defaultGame)
														? theme.accent
														: theme.text,
											}}
										>
											{gameDisplayName[game as keyof AllGames]}
										</ThemedText>
									</Pressable>
								))}
						</Animated.View>
					</>
				</View>
			</Overlay>
		</Portal>
	);
}
