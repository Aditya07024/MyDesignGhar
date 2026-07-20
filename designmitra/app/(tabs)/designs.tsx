import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DesignCard } from "@/components/DesignCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "../../lib/i18n";

const TABS = ["All", "Favorites", "Purchased"];

export default function DesignsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { designs, toggleFavorite, deleteDesign } = useApp();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 70);

  const filtered = designs.filter((d) => {
    const matchTab =
      activeTab === "All" ||
      (activeTab === "Favorites" && d.isFavorite) ||
      (activeTab === "Purchased" && d.isPurchased);
    const matchSearch = d.styleName.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>{t("My Designs")}</Text>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t("Search designs...")}
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>
        <View style={[styles.tabRow, { backgroundColor: colors.muted, borderRadius: 10 }]}>
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab && { backgroundColor: colors.card, borderRadius: 8 },
              ]}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? colors.foreground : colors.mutedForeground }]}>
                {t(tab)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
              <Feather name="layers" size={36} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {activeTab === "All" ? t("No designs yet") : `${t("No")} ${t(activeTab).toLowerCase()} ${t("designs")}`}
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {activeTab === "All" ? t("Take a photo to generate your first AI design") : `${t("Your")} ${t(activeTab).toLowerCase()} ${t("designs will appear here")}`}
            </Text>
            {activeTab === "All" && (
              <Pressable
                onPress={() => router.push("/camera")}
                style={[styles.emptyBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
              >
                <Feather name="camera" size={18} color="#fff" />
                <Text style={styles.emptyBtnText}>{t("Create Design")}</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.grid}>
            {filtered.map((d) => (
              <View key={d.id} style={styles.gridItem}>
                <DesignCard
                  design={d}
                  onPress={() => router.push({ pathname: "/results", params: { designId: d.id } })}
                  onFavorite={() => toggleFavorite(d.id)}
                  onDelete={() => deleteDesign(d.id)}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
  title: { fontSize: 28, fontWeight: "800", fontFamily: "Inter_700Bold" },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, height: 46, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  tabRow: { flexDirection: "row", padding: 3 },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center" },
  tabText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridItem: { width: "47%" },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, paddingHorizontal: 24 },
  emptyBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  emptyBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
