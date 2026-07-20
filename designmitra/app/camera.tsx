import { Feather, Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");

const TIPS = [
  "Capture the full room for best results",
  "Good natural lighting works best",
  "Hold steady for a sharp photo",
];

export default function CameraScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isChallenge } = useLocalSearchParams<{ isChallenge?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [flashMode, setFlashMode] = useState<"off" | "on" | "auto">("auto");
  const [gridVisible, setGridVisible] = useState(true);
  const cameraRef = useRef<CameraView>(null);
  const [tipIndex] = useState(0);

  async function takePhoto() {
    if (Platform.OS === "web") {
      pickFromGallery();
      return;
    }
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.85 });
    if (photo?.uri) {
      router.push({ pathname: "/preview", params: { uri: photo.uri, isChallenge: isChallenge || "" } });
    }
  }

  async function pickFromGallery() {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      router.push({ pathname: "/preview", params: { uri: result.assets[0].uri, isChallenge: isChallenge || "" } });
    }
  }

  if (!permission) {
    return <View style={[styles.container, { backgroundColor: "#000" }]} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: "#000", alignItems: "center", justifyContent: "center" }]}>
        <Feather name="camera-off" size={48} color="#fff" />
        <Text style={styles.permText}>Camera access needed</Text>
        <TouchableOpacity onPress={requestPermission} style={[styles.permBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.permBtnText}>Grant Access</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={pickFromGallery} style={styles.galleryFallback}>
          <Text style={styles.galleryFallbackText}>Upload from Gallery instead</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      {Platform.OS !== "web" ? (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          flash={flashMode}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "#1a1a1a", alignItems: "center", justifyContent: "center" }]}>
          <Feather name="camera" size={60} color="#444" />
          <Text style={{ color: "#666", marginTop: 12, fontFamily: "Inter_400Regular" }}>Camera preview on device</Text>
        </View>
      )}

      {gridVisible && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={styles.gridH1} />
          <View style={styles.gridH2} />
          <View style={styles.gridV1} />
          <View style={styles.gridV2} />
        </View>
      )}

      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.topBtn}>
          <Feather name="x" size={24} color="#fff" />
        </Pressable>

        <View style={styles.tipsOverlay}>
          <Text style={styles.tipText}>{TIPS[tipIndex]}</Text>
        </View>

        <Pressable
          onPress={() => setFlashMode(f => f === "off" ? "on" : f === "on" ? "auto" : "off")}
          style={styles.topBtn}
        >
          <Ionicons
            name={flashMode === "off" ? "flash-off" : flashMode === "on" ? "flash" : "flash-outline"}
            size={22}
            color="#fff"
          />
        </Pressable>
      </View>

      <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable onPress={() => setGridVisible((v) => !v)} style={styles.sideBtn}>
          <Feather name="grid" size={22} color={gridVisible ? colors.primary : "#fff"} />
        </Pressable>

        <Pressable onPress={takePhoto} style={styles.captureBtn}>
          <View style={styles.captureBtnInner} />
        </Pressable>

        <Pressable onPress={pickFromGallery} style={styles.sideBtn}>
          <Feather name="image" size={22} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  topBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  tipsOverlay: {
    flex: 1,
    marginHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
  },
  tipText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 40,
  },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  captureBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
  sideBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  gridH1: { position: "absolute", top: "33.33%", left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.25)" },
  gridH2: { position: "absolute", top: "66.66%", left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.25)" },
  gridV1: { position: "absolute", left: "33.33%", top: 0, bottom: 0, width: 1, backgroundColor: "rgba(255,255,255,0.25)" },
  gridV2: { position: "absolute", left: "66.66%", top: 0, bottom: 0, width: 1, backgroundColor: "rgba(255,255,255,0.25)" },
  permText: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 24, fontFamily: "Inter_700Bold" },
  permBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  permBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  galleryFallback: { marginTop: 16 },
  galleryFallbackText: { color: "rgba(255,255,255,0.6)", fontSize: 15, textDecorationLine: "underline", fontFamily: "Inter_400Regular" },
});
