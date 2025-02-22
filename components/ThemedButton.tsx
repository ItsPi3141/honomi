import { useTheme } from "@/hooks/useThemeColor";
import {
	Pressable,
	type StyleProp,
	type ViewStyle,
	type PressableProps,
} from "react-native";

export function ThemedButton(props: PressableProps) {
	const theme = useTheme();

	return (
		<Pressable
			{...props}
			style={({ pressed }) => [
				{
					backgroundColor: pressed ? `${theme.accent}38` : "transparent",
					borderColor: theme.accent,
					borderWidth: 1,
					borderRadius: 99,
					paddingHorizontal: 10,
					paddingVertical: 6,
				},
				props.style as StyleProp<ViewStyle>,
			]}
		>
			{props.children}
		</Pressable>
	);
}
