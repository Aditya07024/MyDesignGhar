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
import { useApp } from "@/context/AppContext";

export default function EmailAuthScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useApp();
  const [email, setEmail] = useState("");

  function handleSend() {
    if (email.includes("@")) {
      login({ id: Date.now().toString(), name: "", email });
      router.replace("/onboarding/details");
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

        <Text style={[styles.title, { color: colors.foreground }]}>Enter Email Address</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          We'll send a magic link to sign you in
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, {
            borderColor: email.includes("@") ? colors.primary : colors.border,
            backgroundColor: colors.card,
            color: colors.foreground,
            borderRadius: colors.radius,
          }]}
          autoFocus
        />

        <GradientButton
          label="Continue with Email"
          onPress={handleSend}
          disabled={!email.includes("@")}
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
  input: { height: 52, borderWidth: 1.5, paddingHorizontal: 16, fontSize: 16, fontFamily: "Inter_400Regular" },
});
