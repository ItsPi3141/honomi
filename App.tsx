import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PortalProvider } from "@gorhom/portal";

import MainPage from "./src/app/main";

const Stack = createNativeStackNavigator();

function RootStack() {
	return (
		<Stack.Navigator initialRouteName="Main">
			<Stack.Screen
				name="Main"
				component={MainPage}
				options={{
					headerShown: false,
					statusBarTranslucent: true,
					statusBarStyle: "auto",
					statusBarBackgroundColor: "transparent",
				}}
			/>
		</Stack.Navigator>
	);
}

export default function App() {
	return (
		<PortalProvider>
			<NavigationContainer>
				<RootStack />
			</NavigationContainer>
		</PortalProvider>
	);
}
