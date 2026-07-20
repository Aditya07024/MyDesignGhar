import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { useColors } from "@/hooks/useColors";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  style?: ViewStyle;
  small?: boolean;
};

export function GradientButton({
  label,
  onPress,
  loading,
  disabled,
  variant = "primary",
  style,
  small,
}: Props) {
  const colors = useColors();

  if (variant === "outline") {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.btn,
          small && styles.small,
          {
            borderWidth: 1.5,
            borderColor: colors.primary,
            backgroundColor: "transparent",
            borderRadius: colors.radius,
            opacity: pressed || disabled ? 0.6 : 1,
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={[styles.label, { color: colors.primary }]}>{label}</Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        { borderRadius: colors.radius, overflow: "hidden", opacity: pressed || disabled ? 0.7 : 1 },
        style,
      ]}
    >
      <LinearGradient
        colors={
          variant === "secondary"
            ? ["#004E89", "#006BB3"]
            : ["#FF6B35", "#FF8C5A"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.btn, small && styles.small]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.label, { color: "#fff" }]}>{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  small: {
    height: 40,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
    fontFamily: "Inter_700Bold",
  },
});
