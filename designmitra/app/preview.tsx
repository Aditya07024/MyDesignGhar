import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/GradientButton";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "../lib/i18n";

const ROOM_TYPES = ["Bedroom", "Living Room", "Kitchen", "Bathroom", "Dining Room", "Home Office", "Kids Room"];

export default function PreviewScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { uri, isChallenge } = useLocalSearchParams<{ uri: string; isChallenge?: string }>();
  const [roomType, setRoomType] = useState("");
  const [suggestedRoom, setSuggestedRoom] = useState("");
  const [detecting, setDetecting] = useState(true);
  const [description, setDescription] = useState("");
  const [showRooms, setShowRooms] = useState(false);

  const displayUri = uri || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800";

  // Auto-detect room type from image dimensions as a suggestion
  useEffect(() => {
    setDetecting(true);
    Image.getSize(
      displayUri,
      (w, h) => {
        const ratio = w / h;
        let detected: string;
        if (ratio > 1.3) {
          detected = "Living Room";
        } else if (ratio < 0.8) {
          detected = "Bathroom";
        } else {
          detected = "Bedroom";
        }
        setSuggestedRoom(detected);
        setDetecting(false);
      },
      () => {
        setSuggestedRoom("Bedroom");
        setDetecting(false);
      }
    );
  }, [displayUri]);

  function handleGenerate() {
    if (!roomType) {
      alert("Please select a Room Type before generating!");
      return;
    }
    router.push({
      pathname: "/generating",
      params: {
        uri: displayUri,
        roomType: roomType,
        description,
        isChallenge: isChallenge || "",
      },
    });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: displayUri }}
            style={styles.roomImage}
            resizeMode="cover"
          />
          <View style={[styles.imageOverlay, { paddingTop: insets.top + 12 }]}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={24} color="#fff" />
            </Pressable>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius - 4 }]}
          >
            <Feather name="rotate-ccw" size={18} color={colors.foreground} />
            <Text style={[styles.actionText, { color: colors.foreground }]}>{t("Retake")}</Text>
          </Pressable>
        </View>

        <View style={styles.form}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={[styles.label, { color: colors.foreground, marginBottom: 0 }]}>{t("Room Type")}</Text>
              {detecting && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={{ color: colors.primary, fontSize: 12, fontFamily: "Inter_400Regular" }}>{t("Detecting...")}</Text>
                </View>
              )}
            </View>
            {!detecting && suggestedRoom && !roomType && (
              <TouchableOpacity
                onPress={() => setRoomType(suggestedRoom)}
                style={{ backgroundColor: colors.primary + "12", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: colors.primary + "30" }}
              >
                <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" }}>
                  {t("Use Suggestion: ")}{t(suggestedRoom)}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ height: 10 }} />
          <Pressable
            onPress={() => setShowRooms(!showRooms)}
            style={[styles.dropdown, { borderColor: colors.border, backgroundColor: colors.card, borderRadius: colors.radius }]}
          >
            <Text style={[styles.dropdownText, { color: roomType ? colors.foreground : colors.mutedForeground }]}>
              {roomType ? t(roomType) : t("Select Room Type")}
            </Text>
            <Feather name={showRooms ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
          </Pressable>
          {showRooms && (
            <View style={[styles.dropdownList, { borderColor: colors.border, backgroundColor: colors.card, borderRadius: colors.radius }]}>
              {ROOM_TYPES.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => { setRoomType(r); setShowRooms(false); }}
                  style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                >
                  <Text style={[styles.dropdownItemText, { color: r === roomType ? colors.primary : colors.foreground }]}>{t(r)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.label, { color: colors.foreground, marginTop: 20 }]}>{t("Describe what you want (optional)...")}</Text>
          <View style={[styles.textAreaWrap, { borderColor: colors.border, backgroundColor: colors.card, borderRadius: colors.radius }]}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t('Describe what you want (optional)...')}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.textArea, { color: colors.foreground }]}
              multiline
              numberOfLines={3}
            />
            <Pressable style={styles.micBtn}>
              <Ionicons name="mic-outline" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            {t("Supports English, Hindi, and Hinglish")}
          </Text>

          <GradientButton
            label={t("Generate Designs")}
            onPress={handleGenerate}
            style={{ marginTop: 24 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: { position: "relative" },
  roomImage: { width: "100%", height: 280 },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  actionText: { fontSize: 15, fontWeight: "500", fontFamily: "Inter_500Medium" },
  form: { paddingHorizontal: 20, paddingTop: 16 },
  label: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  dropdown: { flexDirection: "row", alignItems: "center", height: 52, borderWidth: 1.5, paddingHorizontal: 16, justifyContent: "space-between" },
  dropdownText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  dropdownList: { borderWidth: 1, marginTop: 4, overflow: "hidden" },
  dropdownItem: { paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1 },
  dropdownItemText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  textAreaWrap: { borderWidth: 1.5, minHeight: 100, padding: 12, position: "relative" },
  textArea: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", minHeight: 70, textAlignVertical: "top" },
  micBtn: { position: "absolute", right: 12, bottom: 12 },
  hint: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 6 },
});
