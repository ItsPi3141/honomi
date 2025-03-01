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
					header: () => null,
				}}
			/>
			<ExpoStatusBar style="auto" />
		</>
	);
}
