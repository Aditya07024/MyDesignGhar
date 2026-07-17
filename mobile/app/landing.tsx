import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { ChevronRight, ArrowRight } from "lucide-react-native";
import { COLORS, Button, BeforeAfter, useStyles, useTranslation } from "../components/ui-kit";
import { useApp } from "../store/app";

const FEATURED_ROOMS = [
  {
    id: "room-living",
    title: "Sunlit Living Room",
    styleName: "Rajasthan Heritage Style",
    beforeSeed: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    afterSeed: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    description: "Boring plain room turned into a vibrant Rajasthani heritage space with hand-carved wood, warm tones, and classic local textiles.",
  },
  {
    id: "room-bedroom",
    title: "Calm Japandi Bedroom",
    styleName: "Japandi Style",
    beforeSeed: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80",
    afterSeed: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80",
    description: "A cluttered standard bedroom redesigned into a peaceful, minimalist Japandi oasis of light oak wood, clean lines, and soft organic textures.",
  },
  {
    id: "room-balcony",
    title: "Coastal Goa Balcony",
    styleName: "Goa Tropical Style",
    afterSeed: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    beforeSeed: "https://images.unsplash.com/photo-1713192704825-74a0017f585d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z29hJTIwbGl2aW5nJTIwcm9vbXxlbnwwfHwwfHx8MA%3D%3D",
    description: "An empty concrete balcony converted into a relaxing, green tropical Goan deck with a cane swing chair, ambient lighting, and potted plants.",
  },
];

export default function LandingScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/(tabs)/home");
    }
  }, [isLoaded, isSignedIn]);

  const styles = useStyles(getStyles);
  const t = useTranslation();
  const theme = useApp((s) => s.theme);
  const isDark = theme === "dark";

  const currentRoom = FEATURED_ROOMS[slideIndex];
  const isLast = slideIndex === FEATURED_ROOMS.length - 1;

  const handleNext = () => {
    if (isLast) {
      router.replace("/(auth)/login");
    } else {
      setSlideIndex(slideIndex + 1);
    }
  };

  const handleSkip = () => {
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Glow circles */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Image
              source={require("../assets/logo.png")}
              style={{ width: "100%", height: "100%", borderRadius: 10 }}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.logoText}>
            MyDezine<Text style={{ color: COLORS.primary }}>Ghar</Text>
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.skipBtnText}>{t("Skip")}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Slide Page Content */}
      <View style={styles.content}>
        
        {/* Title and Style Details */}
        <View style={styles.roomHeader}>
          <Text style={styles.badgeText}>
            {t("DESIGN PREVIEW")} · {slideIndex + 1} / {FEATURED_ROOMS.length}
          </Text>
          <Text style={styles.roomTitle}>{t(currentRoom.title)}</Text>
          <Text style={styles.roomStyleText}>{t(currentRoom.styleName)}</Text>
          <Text style={styles.roomDescription}>{t(currentRoom.description)}</Text>
        </View>

        {/* Interactive Comparison Slider */}
        <View style={styles.sliderWrapper}>
          <BeforeAfter 
            key={currentRoom.id} // Key forces recreate component state on slide change
            beforeSeed={currentRoom.beforeSeed} 
            afterSeed={currentRoom.afterSeed} 
            height={350} 
          />
        </View>

        {/* Slide Indicators and Navigation Button */}
        <View style={styles.footerSection}>
          {/* Indicator Dots */}
          <View style={styles.indicatorContainer}>
            {FEATURED_ROOMS.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.indicatorDot,
                  idx === slideIndex ? styles.indicatorActive : styles.indicatorInactive,
                ]}
              />
            ))}
          </View>

          {/* Action CTA Button */}
          <Button
            title={isLast ? t("Login or Sign Up") : t("Next Design")}
            size="lg"
            full
            icon={isLast ? <ArrowRight size={18} color="#12141a" /> : <ChevronRight size={18} color="#12141a" />}
            onPress={handleNext}
            style={styles.ctaButton}
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
      backgroundColor: isDark ? "rgba(205, 162, 80, 0.12)" : "rgba(205, 162, 80, 0.25)",
      opacity: 0.8,
    },
    glowBottom: {
      position: "absolute",
      bottom: -100,
      left: -80,
      width: 320,
      height: 320,
      borderRadius: 160,
      backgroundColor: isDark ? "rgba(184, 143, 62, 0.06)" : "rgba(255, 218, 163, 0.2)",
      opacity: 0.8,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      backgroundColor: COLORS.background,
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    logoIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: COLORS.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    logoText: {
      fontSize: 18,
      fontWeight: "900",
      color: COLORS.text,
      letterSpacing: -0.5,
    },
    skipBtn: {
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(18, 20, 26, 0.05)",
      borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(18, 20, 26, 0.1)",
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    skipBtnText: {
      color: COLORS.text,
      fontSize: 13,
      fontWeight: "700",
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      justifyContent: "center",
      gap: 16,
      paddingVertical: Platform.OS === "ios" ? 16 : 24,
    },
    roomHeader: {
      marginTop: 10,
      alignItems: "stretch",
    },
    badgeText: {
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(18, 20, 26, 0.05)",
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      fontSize: 9,
      fontWeight: "800",
      color: COLORS.textMuted,
      letterSpacing: 0.5,
      marginBottom: 10,
    },
    roomTitle: {
      fontSize: 24,
      fontWeight: "900",
      color: COLORS.text,
    },
    roomStyleText: {
      fontSize: 14,
      fontWeight: "700",
      color: COLORS.primaryDark,
      marginTop: 2,
      marginBottom: 8,
    },
    roomDescription: {
      fontSize: 13,
      color: COLORS.textMuted,
      lineHeight: 18,
    },
    sliderWrapper: {
      flex: 1,
      justifyContent: "center",
      marginVertical: 18,
      borderRadius: 24,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.35 : 0.12,
          shadowRadius: 16,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    footerSection: {
      alignItems: "stretch",
      gap: 16,
      marginBottom: Platform.OS === "ios" ? 10 : 0,
    },
    indicatorContainer: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    indicatorDot: {
      height: 6,
      borderRadius: 3,
    },
    indicatorActive: {
      width: 20,
      backgroundColor: COLORS.primary,
    },
    indicatorInactive: {
      width: 6,
      backgroundColor: COLORS.border,
    },
    ctaButton: {
      width: "100%",
    },
  });
};
