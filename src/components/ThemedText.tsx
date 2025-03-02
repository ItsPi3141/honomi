import { useTheme } from "../hooks/useThemeColor";
import { Text, type TextProps } from "react-native";

export function ThemedText(props: TextProps) {
	const theme = useTheme();

	return (
		<Text
			{...props}
			style={[
				{
					color: theme.text,
				},
				props.style,
			]}
		>
			{props.children}
		</Text>
	);
}
