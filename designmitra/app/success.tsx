import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/GradientButton";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "../lib/i18n";

export default function SuccessScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { designId } = useLocalSearchParams<{ designId: string }>();
  const { designs } = useApp();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const design = designs.find((d) => d.id === designId) || designs[0];

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.successIcon, { transform: [{ scale: scaleAnim }], backgroundColor: colors.success + "15" }]}>
        <View style={[styles.innerCircle, { backgroundColor: colors.success }]}>
          <Feather name="check" size={36} color="#fff" />
        </View>
        <View style={styles.confetti}>
          {["#FF6B35", "#F7B32B", "#004E89", "#4CAF50"].map((c, i) => (
            <View key={i} style={[styles.confettiPiece, { backgroundColor: c, top: -10 + i * 6, left: -10 + i * 8 }]} />
          ))}
        </View>
      </Animated.View>

      <Animated.View style={[styles.textArea, { opacity: opacityAnim }]}>
        <Text style={[styles.successTitle, { color: colors.foreground }]}>{t("Unlock Successful!")}</Text>
        <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
          {t("Your designs are now unlocked. You can download and compare them without watermarks.")}
        </Text>
      </Animated.View>

      {design && (
        <View style={[styles.imageCard, { borderRadius: colors.radius, overflow: "hidden", borderColor: colors.border }]}>
          <Image source={{ uri: design.imageUri }} style={styles.designImage} resizeMode="cover" />
          <View style={[styles.imageCaption, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            <Text style={[styles.captionTitle, { color: colors.foreground }]}>{t(design.styleName)}</Text>
            <Text style={[styles.captionSub, { color: colors.success }]}>{t("No Watermarks")}</Text>
          </View>
        </View>
      )}

      <View style={styles.actions}>
        {/* <GradientButton
          label={t("View Unlocked Designs")}
          onPress={() => router.push({ pathname: "/shopping", params: { designId } })}
          style={{ marginBottom: 0 }}
        /> */}
        <GradientButton
          label={t("Book Designer Consultation — ₹999")}
          onPress={() => {}}
          variant="secondary"
          style={{ marginBottom: 0 }}
        />
        <Pressable
          onPress={() => router.replace("/(tabs)")}
          style={[styles.outlineBtn, { borderColor: colors.border, borderRadius: colors.radius }]}
        >
          <Text style={[styles.outlineBtnText, { color: colors.foreground }]}>{t("Create Design")}</Text>
        </Pressable>
      </View>

      <View style={[styles.crossSell, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "40", borderRadius: colors.radius }]}>
        <Ionicons name="pricetag" size={18} color={colors.accent} />
        <Text style={[styles.crossSellText, { color: colors.foreground }]}>
          {t("Get all 3 designs for")}{" "}
          <Text style={{ fontWeight: "700", color: colors.accent }}>₹599 {t("total")}</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { alignItems: "center", paddingHorizontal: 24, gap: 20 },
  successIcon: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 8,
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  confetti: { position: "absolute", top: 0, right: 0 },
  confettiPiece: { position: "absolute", width: 8, height: 8, borderRadius: 2 },
  textArea: { alignItems: "center", gap: 8 },
  successTitle: { fontSize: 28, fontWeight: "900", fontFamily: "Inter_700Bold" },
  successSub: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  imageCard: { width: "100%", borderWidth: 1 },
  designImage: { width: "100%", height: 220 },
  imageCaption: { padding: 14, borderTopWidth: 1 },
  captionTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  captionSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  actions: { width: "100%", gap: 12 },
  outlineBtn: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  outlineBtnText: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  crossSell: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    padding: 14,
  },
  crossSellText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
});
