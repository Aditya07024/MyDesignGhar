import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { COLORS, img, useTranslation } from "../components/ui-kit";

export default function IndexSplash() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const t = useTranslation();

  useEffect(() => {
    if (!isLoaded) return;
    
    const timer = setTimeout(() => {
      if (isSignedIn) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/landing");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn]);

  return (
    <View style={styles.container}>
      {/* Glow Circles */}
      <View style={styles.glowLeft} />
      <View style={styles.glowRight} />

      <View style={styles.content}>
        {/* Splash Images Grid */}
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Image source={{ uri: img("room-a", 300, 300) }} style={styles.gridImage} />
          </View>
          <View style={styles.gridItem}>
            <Image source={{ uri: img("room-b", 300, 300) }} style={styles.gridImage} />
          </View>
        </View>

        {/* Logo Header */}
        <View style={styles.logoHeader}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logoIcon}
            resizeMode="cover"
          />
          <Text style={styles.title}>
            MyDezine<Text style={styles.accentText}>Ghar</Text>
          </Text>
        </View>
        <Text style={styles.subtitle}>{t("AI Interior Design for India")}</Text>
      </View>

      <View style={styles.loader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  glowLeft: {
    position: "absolute",
    left: -80,
    top: 100,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(205, 162, 80, 0.15)", // Luxury Gold glow
    opacity: 0.8,
  },
  glowRight: {
    position: "absolute",
    right: -80,
    bottom: 150,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(184, 143, 62, 0.1)", // Bronze glow
    opacity: 0.8,
  },
  content: {
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  gridItem: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gridImage: {
    width: 110,
    height: 110,
  },
  logoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  accentText: {
    color: COLORS.primaryDark,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 6,
    fontWeight: "500",
  },
  loader: {
    position: "absolute",
    bottom: 60,
  },
});
