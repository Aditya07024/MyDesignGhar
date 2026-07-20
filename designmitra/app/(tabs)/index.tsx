import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DesignCard } from "@/components/DesignCard";
import { StyleChip } from "@/components/StyleChip";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "../../lib/i18n";
import { ConsultantService } from "../../lib/api/services";

import { DesignerDashboard } from "../../components/DesignerDashboard";

const STYLES = ["Modern", "Traditional", "Minimal", "Bohemian", "Rustic", "Industrial", "Contemporary", "Classic"];

const POPULAR_ROOMS = [
  { id: "1", name: "Living Room", icon: "sofa" as const },
  { id: "2", name: "Bedroom", icon: "bed-empty" as const },
  { id: "3", name: "Kitchen", icon: "chef-hat" as const },
  { id: "4", name: "Bathroom", icon: "bathtub" as const },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, designs, streak, toggleFavorite, deleteDesign } = useApp();

  if (user?.role === "CONSULTANT") {
    return <DesignerDashboard />;
  }

  const [clientBookings, setClientBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Review Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewConsultantId, setReviewConsultantId] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== "CONSULTANT") {
      setLoadingBookings(true);
      ConsultantService.listBookings()
        .then((res) => {
          setClientBookings(res.bookings || []);
        })
        .catch((err) => {
          console.warn("Failed to load client bookings:", err);
        })
        .finally(() => {
          setLoadingBookings(false);
        });
    }
  }, [user?.id]);

  const { t } = useTranslation();
  const [selectedStyle, setSelectedStyle] = useState("Modern");
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const recentDesigns = designs.slice(0, 4);
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 70);

  function handleCapture() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    router.push("/camera");
  }

  async function pickFromGallery() {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      alert("Gallery permission is required to select photos");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      router.push({ pathname: "/preview", params: { uri: result.assets[0].uri } });
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#FF6B35", "#FF8C5A"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{t(getGreeting())},</Text>
            <Text style={styles.userName}>{user?.name || "Designer"}</Text>
          </View>
          <View style={styles.headerRight}>
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Feather name="zap" size={14} color="#F7B32B" />
                <Text style={styles.streakText}>{streak}d</Text>
              </View>
            )}
            <Pressable onPress={() => router.push("/challenge")} style={styles.headerBtn}>
              <Ionicons name="trophy-outline" size={22} color="#fff" />
            </Pressable>
            <Pressable onPress={() => router.push("/notifications")} style={styles.headerBtn}>
              <Ionicons name="notifications-outline" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>

        <View style={styles.ctaArea}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable onPress={handleCapture} style={styles.photoBtn}>
              <Feather name="camera" size={28} color="#FF6B35" />
              <View>
                <Text style={styles.photoBtnTitle}>{t("Take a Photo")}</Text>
                <Text style={styles.photoBtnSub}>{t("Transform your room in 30 seconds")}</Text>
              </View>
            </Pressable>
          </Animated.View>

          <Pressable
            onPress={pickFromGallery}
            style={styles.galleryBtn}
          >
            <Feather name="image" size={18} color="#fff" />
            <Text style={styles.galleryBtnText}>{t("Upload from Gallery")}</Text>
          </Pressable>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Client Bookings / VC & Review option */}
        {clientBookings.filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED").length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 10 }}>
              {t("My Consultations")}
            </Text>
            {clientBookings
              .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
              .map((booking) => (
                <View
                  key={booking.id}
                  style={{
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: colors.radius || 12,
                    padding: 16,
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.success + "15", alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="videocam" size={20} color={colors.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold", color: colors.foreground }}>
                        {booking.name || t("Designer Consultation")}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 }}>
                        {new Date(booking.date).toLocaleDateString()} @ {booking.time}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: booking.status === "CONFIRMED" ? colors.success + "15" : colors.muted, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: booking.status === "CONFIRMED" ? colors.success : colors.mutedForeground }}>{booking.status}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", gap: 10 }}>
                    {booking.status === "CONFIRMED" && (
                      <Pressable
                        onPress={() => {
                          Alert.alert(
                            t("Video Consultation"),
                            t("Please open the video consultation room link on your registered email or browser to join the LiveKit call.")
                          );
                        }}
                        style={{
                          flex: 1,
                          backgroundColor: colors.primary,
                          borderRadius: 8,
                          paddingVertical: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <Feather name="video" size={14} color="#fff" />
                        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" }}>
                          {t("Join Call")}
                        </Text>
                      </Pressable>
                    )}

                    <Pressable
                      onPress={() => {
                        setReviewConsultantId(booking.consultantId);
                        setReviewRating(5);
                        setReviewText("");
                        setShowReviewModal(true);
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 8,
                        paddingVertical: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" }}>
                        {t("Rate & Review")}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}
          </View>
        )}

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/designers");
          }}
          style={[styles.bookingBanner, { borderColor: colors.border }]}
        >
          <LinearGradient
            colors={["#4F46E5", "#7C3AED"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bookingGradient}
          >
            <View style={styles.bookingLeft}>
              <View style={styles.bookingIconBadge}>
                <Ionicons name="sparkles" size={20} color="#FFD700" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bookingTitle}>{t("Book a Session with Designer")}</Text>
                <Text style={styles.bookingSub}>{t("Get personalized 1-on-1 AI & layout consultation")}</Text>
              </View>
            </View>
            <View style={styles.bookingRightBtn}>
              <Feather name="arrow-right" size={20} color="#fff" />
            </View>
          </LinearGradient>
        </Pressable>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("Popular Styles")}</Text>
        <FlatList
          horizontal
          data={STYLES}
          keyExtractor={(s) => s}
          renderItem={({ item }) => (
            <StyleChip
              label={item}
              selected={selectedStyle === item}
              onPress={() => setSelectedStyle(item)}
            />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 0, paddingRight: 8 }}
        />

        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 28 }]}>{t("Room Types")}</Text>
        <View style={styles.roomGrid}>
          {POPULAR_ROOMS.map((room) => (
            <Pressable
              key={room.id}
              onPress={handleCapture}
              style={({ pressed }) => [
                styles.roomCard,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <MaterialCommunityIcons name={room.icon} size={28} color={colors.primary} />
              <Text style={[styles.roomName, { color: colors.foreground }]}>{t(room.name)}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => router.push("/challenge")}
          style={({ pressed }) => [
            styles.challengeBanner,
            { backgroundColor: colors.secondary + "12", borderColor: colors.secondary + "30", borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <View style={[styles.challengeIcon, { backgroundColor: colors.secondary }]}>
            <Ionicons name="trophy" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.challengeTitle, { color: colors.secondary }]}>{t("Daily Design Challenge")}</Text>
            <Text style={[styles.challengeSub, { color: colors.mutedForeground }]}>
              {t("Win ₹500 credit — 128 entries today")}
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.secondary} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  greeting: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  userName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  streakText: {
    color: "#F7B32B",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  ctaArea: { gap: 10 },
  photoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
  },
  photoBtnTitle: {
    color: "#2C2C2C",
    fontSize: 17,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
  },
  photoBtnSub: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },
  galleryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  galleryBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  content: { padding: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  roomGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  roomCard: {
    width: "46%",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
    borderWidth: 1,
  },
  roomName: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  emptyCard: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
  designGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  designGridItem: { width: "47%" },
  challengeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    padding: 16,
    marginTop: 20,
  },
  challengeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  challengeTitle: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  challengeSub: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },
  bookingBanner: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
  },
  bookingGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  bookingLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bookingIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  bookingSub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },
  bookingRightBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
