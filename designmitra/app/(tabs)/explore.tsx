import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { DesignService } from "../../lib/api/services";
import { useTranslation } from "../../lib/i18n";

import { resolveImageUri } from "../../lib/api/client";
import { DesignPlaceholder } from "../../components/DesignPlaceholder";

const STYLE_FILTERS = ["All", "Modern", "Traditional", "Minimal", "Bohemian", "Rustic"];
const ROOM_FILTERS = ["All", "Bedroom", "Living", "Kitchen", "Bathroom"];

const DEFAULT_COMMUNITY_DESIGNS = [
  { id: "1", user: "Rajesh K", city: "Mumbai", likes: 245, style: "Modern", room: "Living Room", color: "#004E89", imageUri: "" },
  { id: "2", user: "Priya M", city: "Bangalore", likes: 189, style: "Minimal", room: "Bedroom", color: "#FF6B35", imageUri: "" },
  { id: "3", user: "Anjali S", city: "Jaipur", likes: 412, style: "Traditional", room: "Kitchen", color: "#F7B32B", imageUri: "" },
  { id: "4", user: "Vikram P", city: "Delhi", likes: 97, style: "Industrial", room: "Living Room", color: "#4CAF50", imageUri: "" },
  { id: "5", user: "Meera R", city: "Chennai", likes: 338, style: "Bohemian", room: "Bedroom", color: "#E53935", imageUri: "" },
  { id: "6", user: "Arjun T", city: "Pune", likes: 156, style: "Rustic", room: "Dining", color: "#795548", imageUri: "" },
];

const DEFAULT_TRENDING = [
  { id: "t1", name: "Japandi Fusion", count: "1.2K designs", color: "#F0EBE3" },
  { id: "t2", name: "Kerala Traditional", count: "890 designs", color: "#E8F5E9" },
  { id: "t3", name: "Mumbai Minimalist", count: "2.1K designs", color: "#E3F2FD" },
  { id: "t4", name: "Rajasthani Royal", count: "674 designs", color: "#FFF8E1" },
];

export default function ExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [styleFilter, setStyleFilter] = useState("All");
  const [roomFilter, setRoomFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [trending, setTrending] = useState<any[]>(DEFAULT_TRENDING);
  const [communityDesigns, setCommunityDesigns] = useState<any[]>(DEFAULT_COMMUNITY_DESIGNS);
  const [loading, setLoading] = useState(true);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 70);

  useEffect(() => {
    async function loadExploreData() {
      try {
        const res = await DesignService.getTrending();
        if (res?.trendingStyles) {
          setTrending(res.trendingStyles);
        }
        if (res?.communityDesigns) {
          const resolved = res.communityDesigns.map((d: any) => ({
            ...d,
            imageUri: resolveImageUri(d.imageUri),
          }));
          setCommunityDesigns(resolved);
        }
      } catch (err) {
        console.warn("Failed to load explore data from backend:", err);
      } finally {
        setLoading(false);
      }
    }
    loadExploreData();
  }, []);

  const filteredDesigns = communityDesigns.filter((d) => {
    if (!d || !d.style || !d.room) return false;

    if (styleFilter !== "All" && d.style.toLowerCase() !== styleFilter.toLowerCase()) {
      return false;
    }
    if (roomFilter !== "All") {
      const rf = roomFilter.toLowerCase();
      const r = d.room.toLowerCase();
      if (rf === "bedroom" && !r.includes("bedroom") && !r.includes("bed")) return false;
      if (rf === "living" && !r.includes("living") && !r.includes("lounge")) return false;
      if (rf === "kitchen" && !r.includes("kitchen")) return false;
      if (rf === "bathroom" && !r.includes("bathroom") && !r.includes("bath")) return false;
      if (rf !== "bedroom" && rf !== "living" && rf !== "kitchen" && rf !== "bathroom" && !r.includes(rf)) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        (d.user || "").toLowerCase().includes(q) ||
        (d.city || "").toLowerCase().includes(q) ||
        (d.style || "").toLowerCase().includes(q) ||
        (d.room || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t("Explore")}</Text>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t("Search designs...")}
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.filtersSection}>
        <FlatList
          horizontal
          data={STYLE_FILTERS}
          keyExtractor={(s) => s}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setStyleFilter(item)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: styleFilter === item ? colors.primary : colors.card,
                  borderColor: styleFilter === item ? colors.primary : colors.border,
                  borderRadius: 20,
                },
              ]}
            >
              <Text style={[styles.filterText, { color: styleFilter === item ? "#fff" : colors.foreground }]}>
                {t(item)}
              </Text>
            </Pressable>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        />

        <View style={{ height: 8 }} />

        <FlatList
          horizontal
          data={ROOM_FILTERS}
          keyExtractor={(r) => r}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setRoomFilter(item)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: roomFilter === item ? colors.secondary : colors.card,
                  borderColor: roomFilter === item ? colors.secondary : colors.border,
                  borderRadius: 20,
                },
              ]}
            >
              <Text style={[styles.filterText, { color: roomFilter === item ? "#fff" : colors.foreground }]}>
                {t(item)}
              </Text>
            </Pressable>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
      ) : (
        <>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("Trending Now")}</Text>
            <FlatList
              horizontal
              data={trending}
              keyExtractor={(t) => t.id}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.trendCard, { backgroundColor: item.color, borderRadius: colors.radius }]}
                >
                  <Text style={styles.trendName}>{item.name}</Text>
                  <Text style={styles.trendCount}>{item.count}</Text>
                </Pressable>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 20, gap: 12 }}
            />
          </View>

          <View style={[styles.section, { paddingHorizontal: 16 }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("Community Designs")}</Text>
            <View style={styles.communityGrid}>
              {filteredDesigns.map((d) => (
                <View key={d.id} style={styles.communityCol}>
                  <DesignPlaceholder {...d} />
                </View>
              ))}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: "800", fontFamily: "Inter_700Bold", marginBottom: 14 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, height: 48, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  filtersSection: { paddingVertical: 12 },
  filterChip: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 7 },
  filterText: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },
  section: { paddingTop: 8, paddingBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "800", fontFamily: "Inter_700Bold", marginBottom: 14, paddingHorizontal: 4 },
  trendCard: { width: 150, padding: 16, height: 80, justifyContent: "flex-end" },
  trendName: { fontSize: 14, fontWeight: "700", color: "#333", fontFamily: "Inter_700Bold" },
  trendCount: { fontSize: 11, color: "#666", marginTop: 2, fontFamily: "Inter_400Regular" },
  communityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  communityCol: { width: "47%" },
  communityCard: { borderWidth: 1, overflow: "hidden" },
  communityImage: { height: 130, justifyContent: "space-between", padding: 8, flexDirection: "row", alignItems: "flex-start" },
  styleTag: { backgroundColor: "rgba(0,0,0,0.35)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  styleTagText: { color: "#fff", fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold" },
  heartBtn: { padding: 4 },
  communityInfo: { padding: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  communityUser: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  communityCity: { fontSize: 10, fontFamily: "Inter_400Regular" },
  likeRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  likeCount: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
