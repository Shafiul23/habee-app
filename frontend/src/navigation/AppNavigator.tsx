// frontend/src/navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import MainNavigator from "./MainNavigator";
import CreateHabitScreen from "../screens/CreateHabitScreen";
import { RootStackParamList } from "../../types";
import RegisterScreen from "../screens/RegisterScreen";
import EditHabitScreen from "../screens/EditHabitScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import NotificationSettingsScreen from "../screens/NotificationSettingsScreen";
import * as Linking from "expo-linking";

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      ResetPassword: "reset-password/:token",
    },
  },
};

export default function AppNavigator() {
  const { isLoggedIn } = useAuth();

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen
              name="CreateHabit"
              component={CreateHabitScreen}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="EditHabit"
              component={EditHabitScreen}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="NotificationSettings"
              component={NotificationSettingsScreen}
              options={{ presentation: "modal" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
              options={{ presentation: "modal" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
