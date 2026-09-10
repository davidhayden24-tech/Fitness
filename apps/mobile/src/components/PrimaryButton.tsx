import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing } from "../theme";

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "danger" | "ghost";
}

export function PrimaryButton({ title, onPress, disabled, variant = "primary" }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "danger" && styles.danger,
        variant === "ghost" && styles.ghost,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === "ghost" ? styles.textGhost : styles.textOnFill,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing(1.75),
    paddingHorizontal: spacing(3),
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8 },
  text: { fontSize: 16, fontWeight: "600" },
  textOnFill: { color: colors.primaryText },
  textGhost: { color: colors.text },
});
