import Svg, { Path } from "react-native-svg";
import { useTheme } from "../hooks/useThemeColor";
import { memo } from "react";

export const Icons = {
	ArrowDown: memo(({ size }: { size: number }) => {
		const theme = useTheme();
		return (
			<Svg
				width={size}
				height={size}
				viewBox="0 0 100 100"
				fill={theme.secondaryText}
			>
				<Path d="M59.4 78.3L59.4 78.3Q55.3 81.4 50.1 81.3Q44.9 81.3 40.9 78.0L40.9 78.0Q32.9 71.6 26.6 64.5L26.6 64.5Q20.3 57.6 14.0 48.3L14.0 48.3Q10.9 43.9 11.3 38.8Q11.6 33.7 14.7 29.9L14.7 29.9Q18.2 25.9 23.3 24.8L23.3 24.8Q37.5 22.1 50.0 22.1Q62.6 22.2 77.1 25.1L77.1 25.1Q80.9 25.8 83.8 28.2Q86.7 30.6 88.2 34.0Q89.6 37.5 89.3 41.3Q89.0 45.0 86.9 48.2L86.9 48.2Q80.7 57.7 74.3 64.6L74.3 64.6Q67.9 71.9 59.4 78.3Z" />
			</Svg>
		);
	}),
};
