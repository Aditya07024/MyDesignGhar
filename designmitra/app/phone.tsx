import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/GradientButton";
import { useColors } from "@/hooks/useColors";

export default function PhoneScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("");

  function handleSend() {
    if (phone.length === 10) {
      router.push({ pathname: "/otp", params: { phone } });
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.inner, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>

        <Text style={[styles.title, { color: colors.foreground }]}>Enter Phone Number</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          We'll send a one-time password to verify your number
        </Text>

        <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <View style={[styles.flag, { borderRightColor: colors.border }]}>
            <Text style={styles.flagText}>🇮🇳</Text>
            <Text style={[styles.code, { color: colors.foreground }]}>+91</Text>
          </View>
          <TextInput
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit mobile number"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
            style={[styles.input, { color: colors.foreground }]}
            autoFocus
          />
        </View>

        <GradientButton
          label="Send OTP"
          onPress={handleSend}
          disabled={phone.length !== 10}
          style={{ marginTop: 24 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24 },
  back: { marginBottom: 32, alignSelf: "flex-start", padding: 4 },
  title: { fontSize: 28, fontWeight: "800", fontFamily: "Inter_700Bold", marginBottom: 8 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", marginBottom: 32, lineHeight: 22 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    height: 56,
    overflow: "hidden",
  },
  flag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 6,
    borderRightWidth: 1,
    height: "100%",
  },
  flagText: { fontSize: 20 },
  code: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  input: { flex: 1, paddingHorizontal: 14, fontSize: 17, fontFamily: "Inter_400Regular" },
});
