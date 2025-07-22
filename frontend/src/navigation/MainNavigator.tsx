// MainNavigator.tsx
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";

import CalendarScreen from "../screens/CalendarScreen";
import GridScreen from "../screens/GridScreen";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#f7ce46",
          paddingTop: 1,
        },
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#333333",
        tabBarLabelStyle: {
          fontWeight: "600",
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = "home";

          if (route.name === "Calendar") iconName = "calendar";
          else if (route.name === "Grid") iconName = "grid";
          else if (route.name === "Settings") iconName = "settings";

          return (
            <Ionicons
              name={iconName}
              size={focused ? size + 4 : size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Grid" component={GridScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
