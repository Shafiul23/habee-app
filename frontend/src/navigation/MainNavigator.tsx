// MainNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import HomeScreen from "../screens/HomeScreen";
import CalendarScreen from "../screens/CalendarScreen";
import JournalScreen from "../screens/JournalScreen";
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
          else if (route.name === "Journal") iconName = "book";
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
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
