import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";
import { Pressable, Text, View } from "react-native";

import api from "../../lib/api";
import { AuthProvider, useAuth } from "../../src/contexts/AuthContext";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("../../lib/api", () => ({
  __esModule: true,
  default: {
    defaults: { headers: { common: {} as Record<string, string> } },
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

function Probe() {
  const { isLoggedIn, token, login, logout } = useAuth();
  return (
    <View>
      <Text>{isLoggedIn ? "logged-in" : "logged-out"}</Text>
      <Text>{token ?? "no-token"}</Text>
      <Text>{JSON.stringify((api as any).defaults.headers.common)}</Text>
      <Pressable onPress={() => login("manual-token")}>
        <Text>login</Text>
      </Pressable>
      <Pressable onPress={() => logout()}>
        <Text>logout</Text>
      </Pressable>
    </View>
  );
}

describe("AuthContext integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api as any).defaults.headers.common = {};
  });

  it("keeps logged in when stored token validates against backend", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce("stored-token");
    (api.get as jest.Mock).mockResolvedValueOnce({});

    const screen = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText("logged-in")).toBeTruthy();
      expect(screen.queryByText("stored-token")).toBeTruthy();
    });
    expect(api.get).toHaveBeenCalledWith("/habits/test");
    expect((api as any).defaults.headers.common.Authorization).toBe("Bearer stored-token");
  });

  it("clears invalid stored token and logs out", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce("bad-token");
    (api.get as jest.Mock).mockRejectedValueOnce(new Error("unauthorized"));

    const screen = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText("logged-out")).toBeTruthy();
      expect(screen.queryByText("no-token")).toBeTruthy();
    });
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("token");
  });

  it("login and logout update secure storage and headers", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

    const screen = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText("logged-out")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("login"));
    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith("token", "manual-token");
      expect(screen.queryByText("logged-in")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("logout"));
    await waitFor(() => {
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("token");
      expect(screen.queryByText("logged-out")).toBeTruthy();
    });
  });
});
