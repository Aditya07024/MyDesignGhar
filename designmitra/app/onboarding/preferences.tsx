import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/GradientButton";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { AuthService } from "../../lib/api/services";

const USER_TYPES = ["New homeowner", "Renovating", "Interior designer", "Just exploring"];
const LANGUAGES = ["English", "हिंदी", "Both"];
const BUDGETS = ["₹50K–1L", "₹1–3L", "₹3–5L", "₹5L+"];

export default function PreferencesScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useApp();
  const [userTypes, setUserTypes] = useState<string[]>([]);
  const [lang, setLang] = useState("English");
  const [budget, setBudget] = useState("₹1–3L");

  function toggleType(t: string) {
    setUserTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }

  async function handleStart() {
    updateProfile({ userType: userTypes, language: lang as any, budgetRange: budget });
    
    try {
      if (user) {
        // Sync referral code first if they entered one during Step 1 details
        const syncRes = await AuthService.sync({ referralCode: user.referralCode });
        
        // Update user state with synced values (referralCode generated, wallet balance credited)
        if (syncRes?.user) {
          updateProfile({
            walletBalance: syncRes.user.walletBalance || 0,
            referralCode: syncRes.user.referralCode
          });
        }
        
        // Sync Full Name with backend Profile DB
        await AuthService.updateProfile({ fullName: user.name, phone: user.phone });
      }
    } catch (err) {
      console.warn("Backend sync during onboarding complete failed:", err);
    }
    
    router.replace("/(tabs)");
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "100%", backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.step, { color: colors.mutedForeground }]}>Step 3 of 3</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Your Preferences</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Final step! Help us tailor MyDesignGhar just for you.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>I am a... (select all that apply)</Text>
        <View style={styles.chipGrid}>
          {USER_TYPES.map((t) => (
            <Pressable
              key={t}
              onPress={() => toggleType(t)}
              style={[
                styles.chip,
                {
                  borderColor: userTypes.includes(t) ? colors.primary : colors.border,
                  backgroundColor: userTypes.includes(t) ? colors.primary + "14" : colors.card,
                  borderRadius: colors.radius - 4,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: userTypes.includes(t) ? colors.primary : colors.foreground }]}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 28 }]}>Preferred Language</Text>
        <View style={styles.chipGrid}>
          {LANGUAGES.map((l) => (
            <Pressable
              key={l}
              onPress={() => setLang(l)}
              style={[
                styles.chip,
                {
                  borderColor: lang === l ? colors.secondary : colors.border,
                  backgroundColor: lang === l ? colors.secondary + "14" : colors.card,
                  borderRadius: colors.radius - 4,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: lang === l ? colors.secondary : colors.foreground }]}>{l}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 28 }]}>Design Budget</Text>
        <View style={styles.chipGrid}>
          {BUDGETS.map((b) => (
            <Pressable
              key={b}
              onPress={() => setBudget(b)}
              style={[
                styles.chip,
                {
                  borderColor: budget === b ? colors.accent : colors.border,
                  backgroundColor: budget === b ? colors.accent + "20" : colors.card,
                  borderRadius: colors.radius - 4,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: budget === b ? "#b8820d" : colors.foreground }]}>{b}</Text>
            </Pressable>
          ))}
        </View>

        <GradientButton
          label="Start Designing"
          onPress={handleStart}
          style={{ marginTop: 44 }}
        />
      </ScrollView>
    </View>
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
  sectionTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 14 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: { borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 11 },
  chipText: { fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium" },
});
