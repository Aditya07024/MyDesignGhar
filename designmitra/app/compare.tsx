import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/GradientButton";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "../lib/i18n";

const { width } = Dimensions.get("window");
const IMAGE_HEIGHT = 350;

const TRANSFORMATIONS = [
  "New color palette applied",
  "Furniture arrangement optimized",
  "Lighting scheme updated",
  "Decor elements added",
  "Textiles and soft furnishings refreshed",
];

export default function CompareScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { designId } = useLocalSearchParams<{ designId: string }>();
  const { designs } = useApp();
  const [dividerX, setDividerX] = useState(width / 2);

  const design = designs.find((d) => d.id === designId) || designs[0];
  const beforeUri = design?.originalUri || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600";
  const afterUri = design?.imageUri || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600";

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const newX = Math.max(40, Math.min(width - 40, gesture.moveX));
        setDividerX(newX);
      },
    })
  ).current;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t("Before vs After")}</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.compareContainer} {...panResponder.panHandlers}>
        <Image source={{ uri: afterUri }} style={styles.fullImage} resizeMode="cover" />
        <View style={[styles.beforeClip, { width: dividerX }]}>
          <Image source={{ uri: beforeUri }} style={styles.fullImage} resizeMode="cover" />
        </View>
        <View style={[styles.divider, { left: dividerX - 1 }]}>
          <View style={styles.dividerLine} />
          <View style={[styles.dividerHandle, { borderColor: colors.primary }]}>
            <Feather name="chevron-left" size={12} color={colors.primary} />
            <Feather name="chevron-right" size={12} color={colors.primary} />
          </View>
        </View>
        <View style={[styles.labelLeft, { backgroundColor: "rgba(0,0,0,0.55)" }]}>
          <Text style={styles.labelText}>{t("BEFORE")}</Text>
        </View>
        <View style={[styles.labelRight, { backgroundColor: "rgba(255,107,53,0.85)" }]}>
          <Text style={styles.labelText}>{t("AFTER")}</Text>
        </View>
      </View>

      <View style={[styles.content, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("Transformations Applied")}</Text>
        <View style={styles.transformList}>
          {TRANSFORMATIONS.map((tItem, i) => (
            <View key={i} style={styles.transformItem}>
              <View style={[styles.checkCircle, { backgroundColor: colors.success }]}>
                <Feather name="check" size={12} color="#fff" />
              </View>
              <Text style={[styles.transformText, { color: colors.foreground }]}>{t(tItem)}</Text>
            </View>
          ))}
        </View>

        <GradientButton
          label={design?.isPurchased ? t("Unlocked") : t("Unlock for ₹299")}
          onPress={() => {
            if (!design?.isPurchased) {
              router.push({ pathname: "/payment", params: { designId } });
            }
          }}
          style={{ marginTop: 16 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 8, justifyContent: "space-between" },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  compareContainer: { position: "relative", height: IMAGE_HEIGHT, overflow: "hidden" },
  fullImage: { position: "absolute", width, height: IMAGE_HEIGHT },
  beforeClip: { position: "absolute", left: 0, top: 0, height: IMAGE_HEIGHT, overflow: "hidden" },
  divider: { position: "absolute", top: 0, bottom: 0, width: 2, alignItems: "center", justifyContent: "center" },
  dividerLine: { position: "absolute", top: 0, bottom: 0, width: 2, backgroundColor: "#fff" },
  dividerHandle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  labelLeft: { position: "absolute", top: 14, left: 14, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  labelRight: { position: "absolute", top: 14, right: 14, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  labelText: { color: "#fff", fontSize: 11, fontWeight: "800", fontFamily: "Inter_700Bold", letterSpacing: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 14 },
  transformList: { gap: 10, marginBottom: 8 },
  transformItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  transformText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
