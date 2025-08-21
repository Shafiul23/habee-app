import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
} from "react-native";

type Props = {
  onPress: () => void;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
};

export default function GoogleSigninButton({
  onPress,
  disabled = false,
  loading = false,
}: Props) {
  return (
    <Pressable
      style={styles.googleButton}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Image
        source={require("../../assets/g-logo.png")}
        style={styles.googleIcon}
      />
      {loading ? (
        <ActivityIndicator color="#000" />
      ) : (
        <Text style={styles.googleText}>Sign in with Google</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    justifyContent: "center",
  },
  googleIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  googleText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
});
