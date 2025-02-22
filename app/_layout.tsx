import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useThemeColor";
import { Stack } from "expo-router";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { SafeAreaView, StatusBar, View } from "react-native";

export default function RootLayout() {
	return (
		<>
			<Stack
				screenOptions={{
					header: () => <Header />,
				}}
			/>
			<ExpoStatusBar style="auto" />
		</>
	);
}

function Header() {
	const theme = useTheme();
	const headerPadding = 10;

	return (
		<View
			style={{
				alignItems: "center",
				padding: headerPadding,
				paddingTop: (StatusBar.currentHeight ?? 36) + headerPadding,
				backgroundColor: theme.background,
				borderBottomColor: theme.surface,
				borderBottomWidth: 1,
			}}
		>
			<ThemedText style={{ fontWeight: "bold", fontSize: 16 }}>
				Honomi
			</ThemedText>
		</View>
	);
}
