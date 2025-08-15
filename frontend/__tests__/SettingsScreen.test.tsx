import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SettingsScreen from "../src/screens/SettingsScreen";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";

const mockLogout = jest.fn();

jest.mock("../src/contexts/AuthContext", () => ({
  useAuth: () => ({ logout: mockLogout, deleteAccount: jest.fn() }),
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

jest.mock("expo-constants", () => ({
  expoConfig: { version: "1.0.0" },
}));

describe("SettingsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls logout when pressing Log Out", () => {
    const { getByText } = render(<SettingsScreen />);
    fireEvent.press(getByText("Log Out"));
    expect(mockLogout).toHaveBeenCalled();
  });

  it("toggles about section", () => {
    const { getByText, queryByText } = render(<SettingsScreen />);
    expect(queryByText(/Habee is built by a solo developer/i)).toBeNull();
    fireEvent.press(getByText("About"));
    expect(queryByText(/Habee is built by a solo developer/i)).not.toBeNull();
    fireEvent.press(getByText("About"));
    expect(queryByText(/Habee is built by a solo developer/i)).toBeNull();
  });

  it("shows confirmation when deleting account", () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const { getByText } = render(<SettingsScreen />);
    fireEvent.press(getByText("Delete Account"));
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
