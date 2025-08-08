import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

interface ThemeContextProps {
  theme: ThemeMode;
  colors: {
    background: string;
    text: string;
  };
  toggleTheme: () => void;
}

const lightColors = {
  background: "#fff",
  text: "#000",
};

const darkColors = {
  background: "#111",
  text: "#fff",
};

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  colors: lightColors,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const loadTheme = async () => {
      const stored = await AsyncStorage.getItem("theme");
      if (stored === "dark") setTheme("dark");
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    await AsyncStorage.setItem("theme", newTheme);
  };

  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export const themes = { light: lightColors, dark: darkColors };
