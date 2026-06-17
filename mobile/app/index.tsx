import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Sparkles } from "lucide-react-native";
import { COLORS, img } from "../components/ui-kit";

export default function IndexSplash() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    
    const timer = setTimeout(() => {
      if (isSignedIn) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/onboarding");
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

        {/* Icon Container */}
        <View style={styles.iconContainer}>
          <Sparkles size={32} color="#12141a" />
        </View>

        <Text style={styles.title}>
          MyDesign<Text style={styles.accentText}>Ghar</Text>
        </Text>
        <Text style={styles.subtitle}>AI Interior Design for India</Text>
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
    backgroundColor: "rgba(140, 192, 235, 0.3)", // Sky Blue glow
    opacity: 0.8,
  },
  glowRight: {
    position: "absolute",
    right: -80,
    bottom: 150,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255, 235, 204, 0.45)", // Peach glow
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
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
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
