import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/GradientButton";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal",
];

const CITIES_BY_STATE: Record<string, string[]> = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
  Delhi: ["New Delhi", "Noida", "Gurgaon", "Faridabad"],
  Karnataka: ["Bengaluru", "Mysuru", "Hubli", "Mangaluru"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj"],
  "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Asansol"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
};

function getDefaultCities(state: string): string[] {
  return CITIES_BY_STATE[state] || ["Capital City", "Other City"];
}

export default function LocationScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateProfile } = useApp();
  const [state, setState] = useState("");
  const [showStates, setShowStates] = useState(false);

  function handleContinue() {
    updateProfile({ state });
    router.push("/onboarding/preferences");
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "66%", backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.step, { color: colors.mutedForeground }]}>Step 2 of 3</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Where are you based?</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          We use your location to suggest region-specific interior styles
        </Text>

        <Text style={[styles.label, { color: colors.foreground }]}>Country</Text>
        <View style={[styles.dropdownDisabled, { borderColor: colors.border, backgroundColor: colors.muted, borderRadius: colors.radius }]}>
          <Text style={[styles.dropdownText, { color: colors.mutedForeground }]}>India</Text>
          <Feather name="lock" size={16} color={colors.mutedForeground} />
        </View>

        <Text style={[styles.label, { color: colors.foreground, marginTop: 20 }]}>State *</Text>
        <Pressable
          onPress={() => setShowStates(!showStates)}
          style={[styles.dropdown, { borderColor: state ? colors.primary : colors.border, backgroundColor: colors.card, borderRadius: colors.radius }]}
        >
          <Text style={[styles.dropdownText, { color: state ? colors.foreground : colors.mutedForeground }]}>
            {state || "Select state"}
          </Text>
          <Feather name={showStates ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
        </Pressable>
        {showStates && (
          <ScrollView style={[styles.dropdownList, { borderColor: colors.border, backgroundColor: colors.card, borderRadius: colors.radius }]} nestedScrollEnabled>
            {STATES.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => { setState(s); setShowStates(false); }}
                style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
              >
                <Text style={[styles.dropdownItemText, { color: s === state ? colors.primary : colors.foreground }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <GradientButton
          label="Continue"
          onPress={handleContinue}
          disabled={!state}
          style={{ marginTop: 40 }}
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
  label: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  dropdown: { flexDirection: "row", alignItems: "center", height: 52, borderWidth: 1.5, paddingHorizontal: 16, justifyContent: "space-between" },
  dropdownDisabled: { flexDirection: "row", alignItems: "center", height: 52, borderWidth: 1, paddingHorizontal: 16, justifyContent: "space-between" },
  dropdownText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  dropdownList: { borderWidth: 1, marginTop: 4, maxHeight: 200, overflow: "hidden" },
  dropdownItem: { paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1 },
  dropdownItemText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
