import React, { useEffect, useState, useRef } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Camera, ImagePlus, Wand2, Sparkles } from "lucide-react-native";
import { COLORS, Button, Chip, GlassCard, img, useStyles, useTranslation } from "../../components/ui-kit";
import { useApp } from "../../store/app";
import { roomTypes, modernStyles, regionalStyles, budgets } from "../../src/lib/mock";
import { useGenerateDesignMutation } from "../../hooks/useApi";

export default function GenerateScreen() {
  const router = useRouter();
  const styles = useStyles(getStyles);
  const t = useTranslation();
  const params = useLocalSearchParams();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [room, setRoom] = useState(() => {
    return (params.roomId && typeof params.roomId === "string") ? params.roomId : "living";
  });
  const [styleTab, setStyleTab] = useState<"modern" | "regional">("modern");
  const [style, setStyle] = useState("Modern");
  const [budget, setBudget] = useState(budgets[1]);
  const [prompt, setPrompt] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(15);



  const generateMutation = useGenerateDesignMutation();

  // Loading timer simulation (fallback if server offline or to show progress)
  useEffect(() => {
    if (!isGenerating) return;
    if (secondsLeft <= 0) {
      // If the real API generation is still running, wait for it
      if (generateMutation.isPending) {
        return;
      }

      setIsGenerating(false);

      // Get the real generated design ID if successful
      const designId = generateMutation.data?.design?.id || "";

      // Navigate to results
      router.push({
        pathname: "/generate/result",
        params: {
          room,
          style,
          budget,
          imageUri: imageUri || img(`upload-${room}`, 800, 500),
          designId,
        },
      });
      return;
    }
    const t = setTimeout(() => setSecondsLeft((c) => c - 1), 220);
    return () => clearTimeout(t);
  }, [isGenerating, secondsLeft, generateMutation.isPending, generateMutation.data]);

  const requestPermissions = async () => {
    const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
    const libraryPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return cameraPerm.granted && libraryPerm.granted;
  };

  const handleTakePhoto = async () => {
    const hasPerm = await requestPermissions();
    if (!hasPerm) {
      Alert.alert(t("Permissions needed"), t("We need camera access to capture your room."));
      return;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePickGallery = async () => {
    const hasPerm = await requestPermissions();
    if (!hasPerm) {
      Alert.alert(t("Permissions needed"), t("We need library access to pick your room."));
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerGeneration = async () => {
    setIsGenerating(true);
    setSecondsLeft(15);

    // Call real API in background
    if (imageUri) {
      try {
        const formData = new FormData();
        const filename = imageUri.split("/").pop() || "room.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        if (Platform.OS === "web") {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          formData.append("image", blob, filename);
        } else {
          formData.append("image", {
            uri: imageUri,
            name: filename,
            type,
          } as any);
        }
        formData.append("roomType", room);
        formData.append("style", style);
        formData.append("budget", budget);
        formData.append("customKeywords", prompt);

        // We run it asynchronously. If it succeeds, TanStack query cache updates.
        // If it fails, our local simulated timer will still land the user on the results page.
        generateMutation.mutate(formData, {
          onSuccess: (res) => {
            console.log("AI Generation success:", res);
          },
          onError: (err) => {
            console.warn("AI Generation API failed, continuing with simulated visual fallback:", err);
          },
        });
      } catch (err) {
        console.warn("Could not submit design generation payload:", err);
      }
    }
  };

  const activeStyles = styleTab === "modern" ? modernStyles : regionalStyles;

  if (isGenerating) {
    const currentRoomName = roomTypes.find((r) => r.id === room)?.name || "Room";
    const progressPercent = ((15 - secondsLeft) / 15) * 100;
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIconWrapper}>
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
          <View style={styles.sparklesAbs}>
            <Sparkles size={24} color={COLORS.primary} />
          </View>
        </View>
        <Text style={styles.loadingTitle}>{t("Designing your space…")}</Text>
        <Text style={styles.loadingSubtitle}>
          {t("Crafting a beautiful")} {t(style)} {t("style")} {t(currentRoomName)}
        </Text>
        {/* <Text style={styles.loadingTimer}>Estimated time: ~{Math.max(secondsLeft, 0)}s</Text> */}
        
        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("Generate Design")}</Text>
          <Text style={styles.headerSubtitle}>{t("Upload, customize and create")}</Text>
        </View>

        {/* Upload Container */}
        {imageUri ? (
          <View style={styles.uploadedContainer}>
            <Image source={{ uri: imageUri }} style={styles.uploadedImage} resizeMode="cover" />
            <TouchableOpacity onPress={() => setImageUri(null)} style={styles.changeBtn}>
              <Text style={styles.changeText}>{t("Change")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <GlassCard style={styles.uploadCard}>
            <View style={styles.uploadIconContainer}>
              <ImagePlus size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.uploadPrompt}>{t("Upload a room photo")}</Text>
            <View style={styles.uploadBtnRow}>
              <Button
                title={t("Take Photo")}
                size="sm"
                variant="outline"
                icon={<Camera size={14} color="#ffffff" />}
                onPress={handleTakePhoto}
              />
              <Button
                title={t("Gallery")}
                size="sm"
                icon={<ImagePlus size={14} color="#12141a" />}
                onPress={handlePickGallery}
              />
            </View>
          </GlassCard>
        )}

        {/* Room type picker */}
        <Text style={styles.sectionHeading}>{t("Room type")}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {roomTypes.map((r) => (
            <Chip key={r.id} active={room === r.id} onPress={() => setRoom(r.id)}>
              {r.emoji} {t(r.name)}
            </Chip>
          ))}
        </ScrollView>

        {/* Style selection */}
        <Text style={styles.sectionHeading}>{t("Style")}</Text>
        <View style={styles.styleTabRow}>
          {(["modern", "regional"] as const).map((tVal) => (
            <TouchableOpacity
              key={tVal}
              activeOpacity={0.8}
              onPress={() => {
                setStyleTab(tVal);
                setStyle(tVal === "modern" ? modernStyles[0] : regionalStyles[0]);
              }}
              style={[
                styles.styleTabBtn,
                styleTab === tVal && styles.styleTabBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.styleTabText,
                  styleTab === tVal && styles.styleTabTextActive,
                ]}
              >
                {tVal === "modern" ? t("Modern Styles") : t("Regional Styles")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Style chips */}
        <View style={styles.styleChipsWrapper}>
          {activeStyles.map((s) => (
            <Chip key={s} active={style === s} onPress={() => setStyle(s)}>
              {t(s)}
            </Chip>
          ))}
        </View>

        {/* Budget picker */}
        <Text style={styles.sectionHeading}>{t("Budget")}</Text>
        <View style={styles.budgetRow}>
          {budgets.map((b) => (
            <TouchableOpacity
              key={b}
              activeOpacity={0.8}
              onPress={() => setBudget(b)}
              style={[
                styles.budgetBtn,
                budget === b ? styles.budgetBtnActive : styles.budgetBtnInactive,
              ]}
            >
              <Text
                style={[
                  styles.budgetText,
                  budget === b ? styles.budgetTextActive : styles.budgetTextInactive,
                ]}
              >
                {t(b)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Text prompt description */}
        <Text style={styles.sectionHeading}>{t("Describe your vision")}</Text>
        <View style={styles.promptContainer}>
          <TextInput
            multiline
            numberOfLines={3}
            value={prompt}
            onChangeText={setPrompt}
            placeholder={t("e.g. warm earthy tones, lots of plants, cozy reading nook...")}
            placeholderTextColor={COLORS.textMuted}
            style={styles.promptInput}
          />
        </View>

        {/* Submit */}
        <Button
          title={t("Generate 3 Designs")}
          full
          size="lg"
          icon={<Wand2 size={20} color="#12141a" />}
          onPress={triggerGeneration}
          style={styles.submitBtn}
        />

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: "light" | "dark") => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  uploadCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.border,
  },
  uploadIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.cardAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  uploadPrompt: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
  },
  uploadBtnRow: {
    flexDirection: "row",
    gap: 12,
  },
  uploadedContainer: {
    height: 200,
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
  },
  changeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(18, 20, 26, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  changeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 10,
  },
  horizontalScroll: {
    gap: 8,
  },
  styleTabRow: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  styleTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  styleTabBtnActive: {
    backgroundColor: COLORS.cardAlt,
  },
  styleTabText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  styleTabTextActive: {
    color: COLORS.text,
    fontWeight: "700",
  },
  styleChipsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  budgetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  budgetBtn: {
    width: "48%",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  budgetBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(140, 192, 235, 0.15)",
  },
  budgetBtnInactive: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  budgetText: {
    fontSize: 14,
    fontWeight: "700",
  },
  budgetTextActive: {
    color: COLORS.primaryDark,
  },
  budgetTextInactive: {
    color: COLORS.textMuted,
  },
  promptContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  promptInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: "top",
  },

  submitBtn: {
    marginTop: 30,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  loadingIconWrapper: {
    position: "relative",
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  spinner: {
    transform: [{ scale: 1.5 }],
  },
  sparklesAbs: {
    position: "absolute",
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 6,
  },
  loadingTimer: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 20,
  },
  progressBarBg: {
    width: "100%",
    maxWidth: 240,
    height: 6,
    backgroundColor: COLORS.card,
    borderRadius: 3,
    marginTop: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
});
