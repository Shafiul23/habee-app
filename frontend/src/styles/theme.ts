import { StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export const useGlobalStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    text: {
      color: colors.text,
    },
  });
};
