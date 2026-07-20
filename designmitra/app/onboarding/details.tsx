import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/GradientButton";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

export default function DetailsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateProfile } = useApp();
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [referralCode, setReferralCode] = useState("");

  function handleContinue() {
    updateProfile({
      name: name.trim() || "User",
      referralCode: referralCode.trim() || undefined,
      ...( gender && { gender })
    });
    router.push("/onboarding/location");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "33%", backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.step, { color: colors.mutedForeground }]}>Step 1 of 3</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Tell us about yourself</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          We use this to personalize your design recommendations
        </Text>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.foreground }]}>Full Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, {
              borderColor: name ? colors.primary : colors.border,
              backgroundColor: colors.card,
              color: colors.foreground,
              borderRadius: colors.radius,
            }]}
            autoFocus
          />

          <Text style={[styles.label, { color: colors.foreground, marginTop: 24 }]}>Referral Code (Optional)</Text>
          <TextInput
            value={referralCode}
            onChangeText={setReferralCode}
            placeholder="e.g. DMLMFDZZ"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, {
              borderColor: referralCode ? colors.primary : colors.border,
              backgroundColor: colors.card,
              color: colors.foreground,
              borderRadius: colors.radius,
            }]}
            autoCapitalize="characters"
          />

          <Text style={[styles.label, { color: colors.foreground, marginTop: 24 }]}>Gender (Optional)</Text>
          <View style={styles.genderRow}>
            {GENDERS.map((g) => (
              <Pressable
                key={g}
                onPress={() => setGender(g)}
                style={[
                  styles.genderBtn,
                  {
                    borderColor: gender === g ? colors.primary : colors.border,
                    backgroundColor: gender === g ? colors.primary + "12" : colors.card,
                    borderRadius: colors.radius - 4,
                  },
                ]}
              >
                <Text style={[styles.genderText, { color: gender === g ? colors.primary : colors.mutedForeground }]}>
                  {g}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <GradientButton
          label="Continue"
          onPress={handleContinue}
          disabled={!name.trim()}
          style={{ marginTop: 40 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, flexGrow: 1 },
  progressBar: { height: 4, backgroundColor: "#E8E8E8", borderRadius: 2, marginBottom: 12 },
  progressFill: { height: 4, borderRadius: 2 },
  step: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", fontFamily: "Inter_700Bold", marginBottom: 8 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22, marginBottom: 32 },
  form: { gap: 0 },
  label: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  input: {
    height: 52,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  genderRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  genderBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1.5,
  },
  genderText: { fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium" },
});
