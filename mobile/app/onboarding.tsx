import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Users, Sparkles, Compass, ChevronRight } from "lucide-react-native";
import { COLORS, Button, useStyles, useTranslation } from "../components/ui-kit";
import { useAuth } from "@clerk/clerk-expo";
import { useApp } from "../store/app";

import livingRoomAccent from "../assets/black-living-room-accent-colors.png";
import heroBg from "../assets/hero-bg.png";
import blueprints from "../assets/blueprints.png";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    icon: Sparkles,
    image: livingRoomAccent,
    title: "AI-Powered Speed",
    desc: "Generate high-fidelity, photorealistic 3D room renders in seconds. Visualize your dream space instantly across 10+ styles.",
  },
  {
    icon: Users,
    image: heroBg,
    title: "Vetted Design Experts",
    desc: "Collaborate with the top 5% of Indian interior design talent. Our consultants are verified experts in space optimization and materials.",
  },
  {
    icon: Compass,
    image: blueprints,
    title: "Transparent Blueprints",
    desc: "Get direct lists of furniture sources, paint codes, and modular configurations with zero hidden commissions.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const styles = useStyles(getStyles);
  const t = useTranslation();
  const { isLoaded, isSignedIn } = useAuth();
  const [slideIndex, setSlideIndex] = useState(0);
  const [showNameStep, setShowNameStep] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/(tabs)/home");
    }
  }, [isLoaded, isSignedIn]);

  const isLast = slideIndex === slides.length - 1;
  const current = slides[slideIndex];
  const Icon = current.icon;

  const handleNext = () => {
    if (isLast) {
      setShowNameStep(true);
    } else {
      setSlideIndex(slideIndex + 1);
    }
  };

  const handleSkip = () => {
    setShowNameStep(true);
  };

  if (showNameStep) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Glow circles */}
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.nameContent}>
          <View style={styles.glassCard}>
            <View style={styles.iconWrapper}>
              <Sparkles size={26} color="#12141a" />
            </View>
            <Text style={styles.nameTitle}>{t("What is your name?")}</Text>
            <Text style={styles.desc}>{t("Let's personalize your interior design experience.")}</Text>
            
            <TextInput
              style={styles.nameTextInput}
              placeholder={t("Enter your full name")}
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
            />

            <Button
              title={t("Continue")}
              full
              size="lg"
              disabled={!name.trim()}
              onPress={() => {
                if (name.trim()) {
                  useApp.getState().setUserName(name.trim());
                }
                router.replace("/(auth)/login");
              }}
              style={{ marginTop: 24 }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Glow Elements */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      {/* Skip Button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.8}>
          <Text style={styles.skipText}>{t("Skip")}</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Card Image View */}
      <View style={styles.imageFrameContainer}>
        <View style={styles.imageBorderFrame}>
          <Image
            source={current.image}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Glassmorphic Description Card */}
      <View style={styles.cardContainer}>
        <View style={styles.glassCard}>
          <View style={styles.iconWrapper}>
            <Icon size={24} color="#12141a" />
          </View>

          <Text style={styles.title}>{t(current.title)}</Text>
          <Text style={styles.desc}>{t(current.desc)}</Text>

          {/* Indicators Row */}
          <View style={styles.indicatorContainer}>
            {slides.map((_, idx) => {
              const active = idx === slideIndex;
              return (
                <View
                  key={idx}
                  style={[
                    styles.indicator,
                    active ? styles.indicatorActive : styles.indicatorInactive,
                  ]}
                />
              );
            })}
          </View>

          {/* Navigation Button */}
          <Button
            title={isLast ? t("Get Started") : t("Next")}
            full
            size="lg"
            icon={!isLast && <ChevronRight size={18} color="#12141a" />}
            onPress={handleNext}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: "light" | "dark") => {
  const isDark = theme === "dark";
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    glowTop: {
      position: "absolute",
      top: -100,
      right: -80,
      width: 320,
      height: 320,
      borderRadius: 160,
      backgroundColor: isDark ? "rgba(205, 162, 80, 0.15)" : "rgba(205, 162, 80, 0.4)",
      opacity: 0.8,
    },
    glowBottom: {
      position: "absolute",
      bottom: -100,
      left: -80,
      width: 320,
      height: 320,
      borderRadius: 160,
      backgroundColor: isDark ? "rgba(184, 143, 62, 0.08)" : "rgba(255, 218, 163, 0.35)",
      opacity: 0.8,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingHorizontal: 24,
      paddingTop: Platform.OS === "ios" ? 12 : 24,
      zIndex: 10,
    },
    skipBtn: {
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(18, 20, 26, 0.05)",
      borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(18, 20, 26, 0.1)",
      borderWidth: 1,
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 20,
    },
    skipText: {
      color: COLORS.text,
      fontSize: 13,
      fontWeight: "700",
    },
    imageFrameContainer: {
      flex: 1.1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
      marginTop: 10,
    },
    imageBorderFrame: {
      width: "100%",
      height: "100%",
      borderRadius: 28,
      overflow: "hidden",
      borderWidth: 6,
      borderColor: isDark ? "#2d3748" : "#ffffff",
      backgroundColor: COLORS.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.4 : 0.15,
      shadowRadius: 20,
      elevation: 10,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    cardContainer: {
      paddingHorizontal: 24,
      paddingBottom: Platform.OS === "ios" ? 32 : 24,
      justifyContent: "flex-end",
    },
    glassCard: {
      backgroundColor: isDark ? "rgba(26, 32, 44, 0.82)" : "rgba(255, 255, 255, 0.88)",
      borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(182, 212, 237, 0.6)",
      borderWidth: 1.5,
      borderRadius: 30,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
    },
    iconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: COLORS.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 3,
    },
    title: {
      fontSize: 24,
      fontWeight: "900",
      color: COLORS.text,
      lineHeight: 30,
      letterSpacing: -0.5,
    },
    desc: {
      fontSize: 14,
      color: COLORS.textMuted,
      marginTop: 8,
      lineHeight: 22,
      fontWeight: "500",
    },
    indicatorContainer: {
      flexDirection: "row",
      gap: 6,
      marginTop: 20,
      marginBottom: 24,
      alignItems: "center",
    },
    indicator: {
      height: 6,
      borderRadius: 3,
    },
    indicatorActive: {
      width: 24,
      backgroundColor: COLORS.primaryDark,
    },
    indicatorInactive: {
      width: 6,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(18, 20, 26, 0.15)",
    },
    nameContent: {
      flex: 1,
      padding: 24,
      justifyContent: "center",
    },
    nameTitle: {
      fontSize: 26,
      fontWeight: "900",
      color: COLORS.text,
      lineHeight: 32,
      letterSpacing: -0.5,
    },
    nameTextInput: {
      height: 52,
      backgroundColor: isDark ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.9)",
      borderColor: COLORS.border,
      borderWidth: 1.5,
      borderRadius: 16,
      paddingHorizontal: 16,
      color: COLORS.text,
      fontSize: 16,
      fontWeight: "600",
      marginTop: 20,
    },
  });
};
