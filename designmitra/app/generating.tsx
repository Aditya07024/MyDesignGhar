import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
  Platform,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { Design } from "@/context/AppContext";
import { DesignService } from "../lib/api/services";
import { API_BASE_URL, resolveImageUri } from "../lib/api/client";
import { GradientButton } from "@/components/GradientButton";
import { useTranslation } from "../lib/i18n";

const { width } = Dimensions.get("window");

const STATUSES = [
  { time: 0, text: "Analyzing your room structure..." },
  { time: 5, text: "Understanding your style preferences..." },
  { time: 10, text: "Generating design 1..." },
  { time: 15, text: "Generating design 2..." },
  { time: 20, text: "Generating design 3..." },
  { time: 25, text: "Almost ready..." },
];

const TIPS = [
  "Mirrors make small rooms look bigger",
  "Light colors help compact spaces feel open",
  "Plants add life to any room",
  "Good lighting is 50% of good design",
  "Rugs define living spaces beautifully",
];

export default function GeneratingScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { uri, roomType, description, isChallenge } = useLocalSearchParams<{
    uri: string;
    roomType: string;
    description: string;
    isChallenge?: string;
  }>();
  const { addDesign } = useApp();

  const [secondsLeft, setSecondsLeft] = useState(35);
  const [currentStatus, setCurrentStatus] = useState(STATUSES[0].text);
  const [tipIndex, setTipIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const elapsed = useRef(0);
  const isDone = useRef(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // 1. Core API generation request
  useEffect(() => {
    let active = true;

    async function startGeneration() {
      try {
        const formData = new FormData();
        const uriParts = uri.split("/");
        const filename = uriParts[uriParts.length - 1] || "room.jpg";

        if (Platform.OS === "web") {
          const response = await fetch(uri);
          const blob = await response.blob();
          formData.append("image", blob, filename);
        } else {
          formData.append("image", {
            uri: uri,
            name: filename,
            type: "image/jpeg",
          } as any);
        }

        formData.append("roomType", roomType || "auto");
        formData.append("style", "Modern"); // Default style
        formData.append("budget", "₹1 lakh"); // Default budget
        formData.append("customKeywords", description || "");

        const res = await DesignService.generate(formData);

        if (!active) return;

        // Process generated designs
        const returnedImages = res.design.images;
        const mappedDesigns: Design[] = returnedImages.map((img: any, idx: number) => {
          const imageUri = resolveImageUri(img.previewUrl);

          return {
            id: img.id,
            imageUri,
            originalUri: uri,
            styleName: `${res.design.style} Concept ${idx + 1}`,
            description: `AI-designed ${res.design.roomType} in ${res.design.style} style.`,
            budget: res.design.budget,
            createdAt: res.design.createdAt || new Date().toISOString(),
            isPurchased: false,
            isFavorite: false,
            roomType: res.design.roomType,
            rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
          };
        });

        // Add to local context/storage
        mappedDesigns.forEach((d) => addDesign(d));

        // Submit to daily challenge if isChallenge query is set
        if (isChallenge === "true" && mappedDesigns.length > 0) {
          try {
            await DesignService.submitChallenge(mappedDesigns[0].id);
          } catch (cErr) {
            console.warn("Auto-challenge submission failed:", cErr);
          }
        }

        isDone.current = true;
        
        // Quick progress to 100% and navigate
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start(() => {
          router.replace({
            pathname: "/results",
            params: { ids: mappedDesigns.map((d) => d.id).join(",") },
          });
        });
      } catch (err: any) {
        console.error("Generation API error:", err);
        if (active) {
          setError(err.response?.data?.message || "Failed to generate designs. Please try again.");
        }
      }
    }

    startGeneration();

    return () => {
      active = false;
    };
  }, [uri, roomType, description]);

  // 2. Loading status timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      if (isDone.current || error) {
        clearInterval(timer);
        return;
      }

      elapsed.current += 1;
      setSecondsLeft((s) => Math.max(0, s - 1));

      const status = [...STATUSES].reverse().find((s) => elapsed.current >= s.time);
      if (status) setCurrentStatus(status.text);

      Animated.timing(progressAnim, {
        toValue: Math.min(elapsed.current / 35, 0.95), // cap at 95% until API finishes
        duration: 800,
        useNativeDriver: false,
      }).start();

      if (elapsed.current % 5 === 0) {
        setTipIndex((i) => (i + 1) % TIPS.length);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [error]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width - 80],
  });

  const percent = Math.min(Math.round((isDone.current ? 1.0 : elapsed.current / 35) * 100), 100);

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 50, justifyContent: "center" }]}>
        <Feather name="alert-triangle" size={50} color={colors.destructive} style={{ alignSelf: "center", marginBottom: 20 }} />
        <Text style={[styles.title, { color: colors.foreground }]}>{t("Generation Failed")}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, marginHorizontal: 20, marginTop: 10 }]}>{t(error)}</Text>
        <GradientButton
          label={t("Go Back")}
          onPress={() => router.back()}
          style={{ marginTop: 30, width: "100%" }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24 }]}>
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <Text style={[styles.title, { color: colors.foreground }]}>{t("Creating Your Designs")}</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{t("Sit back — our AI is working its magic")}</Text>

      <Animated.View style={[styles.aiIcon, { transform: [{ scale: pulseAnim }], backgroundColor: colors.primary + "18" }]}>
        <Text style={styles.aiIconText}>AI</Text>
      </Animated.View>

      <Text style={[styles.status, { color: colors.foreground }]}>{t(currentStatus)}</Text>

      <View style={[styles.progressContainer, { backgroundColor: colors.muted }]}>
        <Animated.View style={[styles.progressBar, { width: progressWidth, backgroundColor: colors.primary }]} />
      </View>

      <View style={styles.row}>
        <Text style={[styles.percentText, { color: colors.primary }]}>{percent}%</Text>
        <Text style={[styles.timer, { color: colors.mutedForeground }]}>
          {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:
          {String(secondsLeft % 60).padStart(2, "0")}
        </Text>
      </View>

      <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.tipLabel, { color: colors.primary }]}>{t("Design Tip")}</Text>
        <Text style={[styles.tipText, { color: colors.foreground }]}>{t(TIPS[tipIndex])}</Text>
      </View>

      <View style={styles.designIcons}>
        {[1, 2, 3].map((n) => (
          <View
            key={n}
            style={[
              styles.designDot,
              { backgroundColor: percent >= n * 30 ? colors.primary : colors.muted, borderRadius: colors.radius },
            ]}
          >
            <Text style={[styles.designDotText, { color: percent >= n * 30 ? "#fff" : colors.mutedForeground }]}>
              {n}
            </Text>
          </View>
        ))}
      </View>
      <Text style={[styles.dotsLabel, { color: colors.mutedForeground }]}>{t("3 unique designs being crafted")}</Text>
    </View>
  );
}

// Reuse Feather icon inside error state
import { Feather } from "@expo/vector-icons";

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingHorizontal: 40 },
  decorCircle1: {
    position: "absolute",
    top: -50,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,107,53,0.07)",
  },
  decorCircle2: {
    position: "absolute",
    bottom: 100,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(0,78,137,0.05)",
  },
  title: { fontSize: 24, fontWeight: "800", fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 6 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 40 },
  aiIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  aiIconText: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FF6B35",
    fontFamily: "Inter_700Bold",
  },
  status: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 20,
    textAlign: "center",
  },
  progressContainer: {
    height: 8,
    width: width - 80,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBar: { height: 8, borderRadius: 4 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: width - 80,
    marginBottom: 32,
  },
  percentText: { fontSize: 15, fontWeight: "800", fontFamily: "Inter_700Bold" },
  timer: { fontSize: 15, fontFamily: "Inter_500Medium" },
  tipCard: {
    borderWidth: 1,
    padding: 18,
    width: "100%",
    gap: 6,
    marginBottom: 36,
  },
  tipLabel: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 1 },
  tipText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  designIcons: { flexDirection: "row", gap: 16, marginBottom: 8 },
  designDot: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  designDotText: { fontSize: 18, fontWeight: "800", fontFamily: "Inter_700Bold" },
  dotsLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
