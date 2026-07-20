import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/GradientButton";
import { useColors } from "@/hooks/useColors";
import { useChallengeEntriesQuery, useLikeChallengeEntryMutation } from "../hooks/useApi";
import { useTranslation } from "../lib/i18n";

const PRIZES = [
  { rank: "1st", amount: "₹500", label: "Wallet Credit", icon: "trophy" as const, color: "#F7B32B" },
  { rank: "2nd", amount: "Free", label: "Consultation", icon: "calendar" as const, color: "#C0C0C0" },
  { rank: "3rd", amount: "1 Free", label: "Design Download", icon: "download" as const, color: "#CD7F32" },
];

function Countdown() {
  const colors = useColors();
  const [secs, setSecs] = useState(14 * 3600 + 32 * 60 + 45);

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  return (
    <View style={styles.countdownRow}>
      {[h, m, s].map((val, i) => (
        <React.Fragment key={i}>
          <View style={[styles.countdownBlock, { backgroundColor: colors.foreground }]}>
            <Text style={[styles.countdownNum, { color: colors.background }]}>
              {String(val).padStart(2, "0")}
            </Text>
          </View>
          {i < 2 && <Text style={[styles.colon, { color: colors.foreground }]}>:</Text>}
        </React.Fragment>
      ))}
    </View>
  );
}

export default function ChallengeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"challenge" | "leaderboard">("challenge");

  const { data: entries, isLoading, error } = useChallengeEntriesQuery();
  const likeMutation = useLikeChallengeEntryMutation();

  const totalEntries = entries?.length || 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ExpoLinearGradient
        colors={["#004E89", "#006BB3"]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>{t("Daily Design Challenge")}</Text>
          <View style={{ width: 38 }} />
        </View>

        <Text style={styles.challengeTitle}>{t("Living Room Makeover")}</Text>
        <Text style={styles.challengeDesc}>
          {t("Transform a compact 300 sq ft living room into a functional, stylish space on a ₹1L budget.")}
        </Text>
        <Text style={styles.entryCount}>
          {totalEntries > 0 ? `${totalEntries} ${t("entries today")}` : t("Be the first to enter today!")}
        </Text>

        <View style={styles.timerLabel}>
          <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
          <Text style={styles.timerText}>{t("Ends in")}</Text>
        </View>
        <Countdown />
      </ExpoLinearGradient>

      <View style={[styles.tabRow, { backgroundColor: colors.muted }]}>
        {(["challenge", "leaderboard"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && { backgroundColor: colors.card, borderRadius: 8 }]}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? colors.foreground : colors.mutedForeground }]}>
              {tab === "challenge" ? t("Challenge") : t("Leaderboard")}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === "challenge" ? (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("Prizes")}</Text>
          <View style={styles.prizesRow}>
            {PRIZES.map((p) => (
              <View
                key={p.rank}
                style={[styles.prizeCard, { backgroundColor: p.color + "18", borderColor: p.color + "40", borderRadius: colors.radius }]}
              >
                <Ionicons name={p.icon} size={28} color={p.color} />
                <Text style={[styles.prizeRank, { color: p.color }]}>{t(p.rank)}</Text>
                <Text style={[styles.prizeAmount, { color: colors.foreground }]}>{t(p.amount)}</Text>
                <Text style={[styles.prizeLabel, { color: colors.mutedForeground }]}>{t(p.label)}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 20 }]}>{t("Sample Room")}</Text>
          <View style={[styles.sampleCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <View style={[styles.sampleImagePlaceholder, { backgroundColor: colors.muted }]}>
              <Feather name="home" size={40} color={colors.mutedForeground} />
              <Text style={[styles.sampleImageText, { color: colors.mutedForeground }]}>{t("Compact Living Room")}</Text>
            </View>
            <View style={styles.sampleInfo}>
              <Text style={[styles.sampleLabel, { color: colors.mutedForeground }]}>{t("Room size: 300 sq ft")}</Text>
              <Text style={[styles.sampleLabel, { color: colors.mutedForeground }]}>{t("Budget: ₹1 lakh")}</Text>
              <Text style={[styles.sampleLabel, { color: colors.mutedForeground }]}>{t("Style: Your choice")}</Text>
            </View>
          </View>

          <GradientButton
            label={t("Join This Challenge")}
            onPress={() => router.push({ pathname: "/camera", params: { isChallenge: "true" } })}
            style={{ marginTop: 20 }}
          />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("Top Entries")}</Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
          ) : error ? (
            <Text style={{ color: colors.mutedForeground, textAlign: "center", marginTop: 50 }}>{t("Failed to load entries.")}</Text>
          ) : !entries || entries.length === 0 ? (
            <Text style={{ color: colors.mutedForeground, textAlign: "center", marginTop: 50 }}>{t("No entries submitted yet today.")}</Text>
          ) : (
            entries.map((entry: any) => (
              <View
                key={entry.id}
                style={[
                  styles.leaderItem,
                  {
                    backgroundColor: entry.rank <= 3 ? entry.color + "10" : colors.card,
                    borderColor: entry.rank <= 3 ? entry.color + "30" : colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <View style={[styles.rankBadge, { backgroundColor: entry.rank <= 3 ? entry.color : colors.muted }]}>
                  <Text style={[styles.rankNum, { color: entry.rank <= 3 ? "#fff" : colors.mutedForeground }]}>{entry.rank}</Text>
                </View>
                <View style={[styles.leaderAvatar, { backgroundColor: entry.color }]}>
                  <Text style={styles.leaderAvatarText}>{entry.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.leaderName, { color: colors.foreground }]}>{entry.name}</Text>
                  <Text style={[styles.leaderCity, { color: colors.mutedForeground }]}>{entry.city}</Text>
                </View>
                <Pressable
                  onPress={() => likeMutation.mutate(entry.id)}
                  style={styles.likeRow}
                >
                  <Ionicons name="heart" size={16} color="#E53935" />
                  <Text style={[styles.likeCount, { color: colors.foreground }]}>
                    {entry.likes.toLocaleString("en-IN")}
                  </Text>
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn: { padding: 8 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  challengeTitle: { color: "#fff", fontSize: 22, fontWeight: "800", fontFamily: "Inter_700Bold", marginBottom: 8 },
  challengeDesc: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 10 },
  entryCount: { color: "rgba(255,255,255,0.65)", fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 16 },
  timerLabel: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  timerText: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular" },
  countdownRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  countdownBlock: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  countdownNum: { fontSize: 24, fontWeight: "900", fontFamily: "Inter_700Bold" },
  colon: { fontSize: 22, fontWeight: "900", fontFamily: "Inter_700Bold" },
  tabRow: { flexDirection: "row", margin: 16, borderRadius: 10, padding: 3 },
  tab: { flex: 1, paddingVertical: 9, alignItems: "center" },
  tabText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  scroll: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 14 },
  prizesRow: { flexDirection: "row", gap: 10 },
  prizeCard: { flex: 1, alignItems: "center", borderWidth: 1, padding: 14, gap: 4 },
  prizeRank: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  prizeAmount: { fontSize: 16, fontWeight: "800", fontFamily: "Inter_700Bold" },
  prizeLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  sampleCard: { borderWidth: 1, overflow: "hidden" },
  sampleImagePlaceholder: { height: 160, alignItems: "center", justifyContent: "center", gap: 10 },
  sampleImageText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  sampleInfo: { padding: 14, gap: 6 },
  sampleLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  leaderItem: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  rankBadge: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  rankNum: { fontSize: 14, fontWeight: "800", fontFamily: "Inter_700Bold" },
  leaderAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  leaderAvatarText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  leaderName: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  leaderCity: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  likeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  likeCount: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
