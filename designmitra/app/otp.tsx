import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
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
import { useApp } from "@/context/AppContext";

export default function OTPScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { login, isLoggedIn } = useApp();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  function handleChange(val: string, idx: number) {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }
    if (newOtp.every((d) => d !== "")) {
      autoSubmit(newOtp);
    }
  }

  function handleKeyPress(key: string, idx: number) {
    if (key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  }

  function autoSubmit(otpArr: string[]) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    verify(otpArr.join(""));
  }

  async function verify(code: string) {
    setLoading(true);
    Keyboard.dismiss();
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    login({
      id: Date.now().toString(),
      name: "",
      phone: "+91" + phone,
    });
    router.replace("/onboarding/details");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.inner, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>

        <Text style={[styles.title, { color: colors.foreground }]}>Verify OTP</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          6-digit code sent to{" "}
          <Text style={{ color: colors.foreground, fontWeight: "700" }}>+91 {phone}</Text>
        </Text>

        <View style={styles.otpRow}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(r) => { inputs.current[idx] = r; }}
              value={digit}
              onChangeText={(v) => handleChange(v, idx)}
              onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(key, idx)}
              keyboardType="number-pad"
              maxLength={1}
              style={[
                styles.otpBox,
                {
                  borderColor: digit ? colors.primary : colors.border,
                  backgroundColor: digit ? colors.primary + "10" : colors.card,
                  color: colors.foreground,
                  borderRadius: colors.radius - 4,
                },
              ]}
              autoFocus={idx === 0}
            />
          ))}
        </View>

        <GradientButton
          label={loading ? "Verifying..." : "Verify"}
          onPress={() => verify(otp.join(""))}
          loading={loading}
          disabled={otp.some((d) => !d)}
          style={{ marginTop: 32 }}
        />

        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={[styles.resendText, { color: colors.mutedForeground }]}>
              Resend OTP in{" "}
              <Text style={{ color: colors.primary, fontWeight: "700" }}>{countdown}s</Text>
            </Text>
          ) : (
            <Pressable onPress={() => setCountdown(60)}>
              <Text style={[styles.resendText, { color: colors.primary, fontWeight: "700" }]}>
                Resend OTP
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24 },
  back: { marginBottom: 32, alignSelf: "flex-start", padding: 4 },
  title: { fontSize: 28, fontWeight: "800", fontFamily: "Inter_700Bold", marginBottom: 8 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", marginBottom: 40, lineHeight: 22 },
  otpRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  otpBox: {
    flex: 1,
    height: 58,
    borderWidth: 1.5,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  resendRow: { alignItems: "center", marginTop: 24 },
  resendText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
