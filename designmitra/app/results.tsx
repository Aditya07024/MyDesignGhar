import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/GradientButton";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { DesignService } from "../lib/api/services";
import { useTranslation } from "../lib/i18n";

const STYLE_PATTERNS = ["Modern", "Traditional", "Minimal", "Bohemian", "Rustic", "Industrial", "Contemporary", "Classic"];

const { width } = Dimensions.get("window");

function StarRating({ rating }: { rating: number }) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons
          key={s}
          name={s <= Math.floor(rating) ? "star" : "star-outline"}
          size={14}
          color={colors.accent}
        />
      ))}
      <Text style={{ color: colors.mutedForeground, fontSize: 12, marginLeft: 4, fontFamily: "Inter_400Regular" }}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}

export default function ResultsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { designs, toggleFavorite, publishDesign } = useApp();
  const { t } = useTranslation();
  const { ids, designId } = useLocalSearchParams<{ ids?: string; designId?: string }>();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const idList = (ids && ids.length > 0) ? ids.split(",") : (designId ? [designId] : []);
  const resultDesigns = idList.length > 0
    ? idList.map((id) => designs.find((d) => d.id === id)).filter(Boolean) as any[]
    : designs.slice(0, 3);

  const currentDesign = resultDesigns[activeIndex];

  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState("Modern");
  const [publishing, setPublishing] = useState(false);

  async function handlePublish() {
    if (!currentDesign) return;
    setPublishing(true);
    try {
      await DesignService.submitChallenge(currentDesign.id, selectedPattern);
      alert("Design published to community successfully!");
      publishDesign(currentDesign.id);
      setPublishModalVisible(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to publish to community.");
    } finally {
      setPublishing(false);
    }
  }

  if (resultDesigns.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.foreground }]}>No results found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.primary }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  function handleScroll(e: any) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(idx);
  }

  async function handleShare() {
    const msg = `Check out this AI-designed ${currentDesign?.roomType || "room"} by MyDesignGhar!`;
    if (Platform.OS === "web") {
      try {
        if (navigator.share) {
          await navigator.share({ text: msg });
        } else {
          await navigator.clipboard.writeText(msg);
          alert("Link copied to clipboard!");
        }
      } catch {}
    } else {
      await Share.share({ message: msg });
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t("Your Designs")}</Text>
        <Pressable onPress={handleShare} style={styles.shareBtn}>
          <Feather name="share-2" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      <FlatList
        ref={flatRef}
        data={resultDesigns}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <Pressable
              onPress={() =>
                router.push({ pathname: "/compare", params: { designId: item.id } })
              }
              style={styles.imageContainer}
            >
              <Image source={{ uri: item.imageUri }} style={styles.designImage} resizeMode="cover" />
              {!item.isPurchased && (
                <View style={styles.watermarkOverlay}>
                  <Text style={styles.watermark}>MyDesignGhar</Text>
                </View>
              )}
              {item.isPurchased ? (
                <View style={styles.unlockTooltip}>
                  <Feather name="columns" size={12} color="#fff" />
                  <Text style={styles.unlockText}>{t("Tap to compare")}</Text>
                </View>
              ) : (
                <View style={styles.unlockTooltip}>
                  <Feather name="lock" size={12} color="#fff" />
                  <Text style={styles.unlockText}>{t("Tap to compare")} | {t("Unlock for ₹299")}</Text>
                </View>
              )}
            </Pressable>

            <View style={styles.designInfo}>
              <View style={styles.designInfoRow}>
                <View>
                  <Text style={[styles.styleName, { color: colors.foreground }]}>{t(item.styleName)}</Text>
                  <StarRating rating={item.rating ?? 4.5} />
                </View>
                <View style={[styles.budgetBadge, { backgroundColor: colors.accent + "20", borderRadius: 8 }]}>
                  <Text style={[styles.budgetText, { color: "#b8820d" }]}>{item.budget}</Text>
                </View>
              </View>
              <Text style={[styles.styleDesc, { color: colors.mutedForeground }]}>{item.description}</Text>

              {!item.isPublished && (
                <TouchableOpacity
                  onPress={() => setPublishModalVisible(true)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginTop: 14,
                    backgroundColor: colors.primary + "12",
                    paddingVertical: 11,
                    paddingHorizontal: 20,
                    borderRadius: colors.radius,
                    borderWidth: 1,
                    borderColor: colors.primary + "30",
                  }}
                >
                  <Feather name="globe" size={16} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" }}>
                    {t("Publish to Community")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />

      <View style={styles.dots}>
        {resultDesigns.map((_, i) => (
          <Pressable
            key={i}
            onPress={() => { flatRef.current?.scrollToIndex({ index: i, animated: true }); setActiveIndex(i); }}
            style={[styles.dot, { backgroundColor: i === activeIndex ? colors.primary : colors.muted }]}
          />
        ))}
      </View>

      <View style={[styles.actionBar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleFavorite(currentDesign.id); }}
          style={[styles.iconAction, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons
            name={currentDesign.isFavorite ? "heart" : "heart-outline"}
            size={22}
            color={currentDesign.isFavorite ? colors.destructive : colors.mutedForeground}
          />
        </Pressable>
        <Pressable
          onPress={() =>
            router.push({ pathname: "/compare", params: { designId: currentDesign.id } })
          }
          style={[styles.iconAction, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="columns" size={20} color={colors.mutedForeground} />
        </Pressable>
        
        <Pressable onPress={handleShare} style={[styles.iconAction, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="share-2" size={20} color={colors.mutedForeground} />
        </Pressable>
        {currentDesign.isPurchased ? (
          <View
            style={{
              flex: 1,
              height: 48,
              borderRadius: colors.radius,
              backgroundColor: colors.success + "15",
              borderWidth: 1,
              borderColor: colors.success + "40",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.success, fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" }}>
              {t("Unlocked")}
            </Text>
          </View>
        ) : (
          <GradientButton
            label={t("Unlock for ₹299")}
            onPress={() => router.push({ pathname: "/payment", params: { designId: currentDesign.id } })}
            style={{ flex: 1, borderRadius: colors.radius }}
          />
        )}
      </View>

      {/* Publish to Community Modal */}
      <Modal
        visible={publishModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPublishModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>{t("Publish to Community")}</Text>
              <Pressable onPress={() => setPublishModalVisible(false)}>
                <Feather name="x" size={24} color={colors.foreground} />
              </Pressable>
            </View>

            <Text style={[styles.modalSub, { color: colors.mutedForeground, marginBottom: 16 }]}>
              {t("Select style pattern to publish under")}:
            </Text>

            <ScrollView style={{ maxHeight: 250 }} showsVerticalScrollIndicator={false}>
              {STYLE_PATTERNS.map((pattern) => (
                <TouchableOpacity
                  key={pattern}
                  onPress={() => setSelectedPattern(pattern)}
                  style={[
                    styles.patternBtn,
                    {
                      borderColor: selectedPattern === pattern ? colors.primary : colors.border,
                      backgroundColor: colors.card,
                      borderRadius: colors.radius - 4,
                    },
                  ]}
                >
                  <Text style={[styles.patternText, { color: selectedPattern === pattern ? colors.primary : colors.foreground }]}>
                    {t(pattern)}
                  </Text>
                  {selectedPattern === pattern && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {publishing ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <GradientButton
                label={t("Confirm & Publish")}
                onPress={handlePublish}
                style={{ marginTop: 20 }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorText: { textAlign: "center", marginTop: 100, fontSize: 16 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 8, justifyContent: "space-between" },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  shareBtn: { padding: 8 },
  imageContainer: { position: "relative" },
  designImage: { width, height: 300 },
  watermarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  watermark: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 28,
    fontWeight: "900",
    transform: [{ rotate: "-30deg" }],
    letterSpacing: 3,
    fontFamily: "Inter_700Bold",
  },
  unlockTooltip: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  unlockText: { color: "#fff", fontSize: 12, fontFamily: "Inter_400Regular" },
  designInfo: { padding: 20, gap: 8 },
  designInfoRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  styleName: { fontSize: 20, fontWeight: "800", fontFamily: "Inter_700Bold", marginBottom: 4 },
  styleDesc: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  budgetBadge: { paddingHorizontal: 12, paddingVertical: 6 },
  budgetText: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  actionBar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 8,
    alignItems: "center",
  },
  iconAction: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 380,
    padding: 24,
    borderWidth: 1,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
  },
  modalSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  patternBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  patternText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});
