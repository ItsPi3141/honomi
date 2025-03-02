import { Keyframe } from "react-native-reanimated";

export const Accordion = {
	Enter: new Keyframe({
		0: { maxHeight: 0 },
		100: { maxHeight: 1 },
	}),
	Exit: new Keyframe({
		0: { maxHeight: 1 },
		100: { maxHeight: 0 },
	}),
};
