import { Platform } from "react-native";
import { FullWindowOverlay } from "react-native-screens";

export function Overlay({ children }: { children: React.ReactNode }) {
	if (Platform.OS === "ios") {
		return <FullWindowOverlay>{children}</FullWindowOverlay>;
	}

	return <>{children}</>;
}
