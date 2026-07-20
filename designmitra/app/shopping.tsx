import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "../lib/i18n";

type ShoppingItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  selected: boolean;
};

const INITIAL_ITEMS: ShoppingItem[] = [
  { id: "1", name: "L-Shape Sofa (Grey Fabric)", price: 32000, category: "Furniture", selected: true },
  { id: "2", name: "Teak Wood Coffee Table", price: 8500, category: "Furniture", selected: true },
  { id: "3", name: "Bookshelf (5-tier)", price: 6200, category: "Furniture", selected: false },
  { id: "4", name: "Ceramic Vase Set", price: 1800, category: "Decor & Accessories", selected: true },
  { id: "5", name: "Macrame Wall Hanging", price: 1200, category: "Decor & Accessories", selected: true },
  { id: "6", name: "Floor Lamp (Brass)", price: 4500, category: "Lighting", selected: true },
  { id: "7", name: "Fairy Light String (10m)", price: 650, category: "Lighting", selected: false },
  { id: "8", name: "Lime White Paint (10L)", price: 2800, category: "Paint & Wall Treatments", selected: true },
  { id: "9", name: "Geometric Wallpaper Roll", price: 1500, category: "Paint & Wall Treatments", selected: false },
];

const CATEGORY_ICONS: Record<string, any> = {
  "Furniture": "sofa-single",
  "Decor & Accessories": "flower",
  "Lighting": "lightbulb-outline",
  "Paint & Wall Treatments": "format-paint",
};

const CATEGORIES = ["Furniture", "Decor & Accessories", "Lighting", "Paint & Wall Treatments"];

export default function ShoppingScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [items, setItems] = useState<ShoppingItem[]>(INITIAL_ITEMS);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [budgetFilter, setBudgetFilter] = useState("");

  const total = items.filter((i) => i.selected).reduce((s, i) => s + i.price, 0);

  function toggleItem(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)));
  }

  function toggleCategory(cat: string) {
    setCollapsed((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  }

  function openBuy(platform: "amazon" | "flipkart") {
    const url = platform === "amazon" ? "https://amazon.in" : "https://flipkart.com";
    Linking.openURL(url);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t("Shopping List")}</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={[styles.totalBar, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
        <View>
          <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>{t("Total Estimated Cost")}</Text>
          <Text style={[styles.totalAmt, { color: colors.primary }]}>₹{total.toLocaleString("en-IN")}</Text>
        </View>
        <Text style={[styles.itemCount, { color: colors.mutedForeground }]}>
          {items.filter((i) => i.selected).length} {t("items selected")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORIES.map((cat) => {
          const catItems = items.filter((i) => i.category === cat);
          const isCollapsed = collapsed.includes(cat);
          return (
            <View key={cat} style={styles.categorySection}>
              <TouchableOpacity
                onPress={() => toggleCategory(cat)}
                style={[styles.categoryHeader, { backgroundColor: colors.muted, borderRadius: colors.radius - 4 }]}
              >
                <Text style={[styles.categoryTitle, { color: colors.foreground }]}>{t(cat)}</Text>
                <View style={styles.categoryRight}>
                  <Text style={[styles.categoryCount, { color: colors.mutedForeground }]}>
                    ₹{catItems.filter((i) => i.selected).reduce((s, i) => s + i.price, 0).toLocaleString("en-IN")}
                  </Text>
                  <Feather name={isCollapsed ? "chevron-down" : "chevron-up"} size={18} color={colors.mutedForeground} />
                </View>
              </TouchableOpacity>

              {!isCollapsed && catItems.map((item) => (
                <View
                  key={item.id}
                  style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
                >
                  <Pressable onPress={() => toggleItem(item.id)} style={styles.checkbox}>
                    <View style={[styles.checkboxBox, {
                      borderColor: item.selected ? colors.primary : colors.border,
                      backgroundColor: item.selected ? colors.primary : "transparent",
                    }]}>
                      {item.selected && <Feather name="check" size={12} color="#fff" />}
                    </View>
                  </Pressable>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemName, { color: item.selected ? colors.foreground : colors.mutedForeground }]}>
                      {t(item.name)}
                    </Text>
                    <Text style={[styles.itemPrice, { color: colors.primary }]}>
                      ₹{item.price.toLocaleString("en-IN")}
                    </Text>
                  </View>
                  <View style={styles.buyButtons}>
                    <TouchableOpacity
                      onPress={() => openBuy("amazon")}
                      style={[styles.buyBtn, { backgroundColor: "#FF9900" + "20" }]}
                    >
                      <Text style={[styles.buyBtnText, { color: "#FF9900" }]}>Amazon</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => openBuy("flipkart")}
                      style={[styles.buyBtn, { backgroundColor: "#2874F0" + "20" }]}
                    >
                      <Text style={[styles.buyBtnText, { color: "#2874F0" }]}>Flipkart</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 12, justifyContent: "space-between" },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  totalBar: { marginHorizontal: 20, borderWidth: 1, borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  totalLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  totalAmt: { fontSize: 24, fontWeight: "900", fontFamily: "Inter_700Bold", marginTop: 2 },
  itemCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  scroll: { paddingHorizontal: 20 },
  categorySection: { marginBottom: 16 },
  categoryHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, marginBottom: 8 },
  categoryTitle: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  categoryRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  categoryCount: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  itemCard: { flexDirection: "row", alignItems: "flex-start", borderWidth: 1, padding: 14, gap: 12, marginBottom: 8 },
  checkbox: { paddingTop: 2 },
  checkboxBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  itemName: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 20 },
  itemPrice: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold", marginTop: 4 },
  buyButtons: { gap: 6 },
  buyBtn: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, alignItems: "center" },
  buyBtnText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
