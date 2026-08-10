import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/GradientButton";
import { useTranslation } from "../lib/i18n";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    image: require("../assets/images/onboarding1.png"),
    title: "Transform Any Room",
    subtitle: "See your room redesigned by AI in seconds. Living room, bedroom, kitchen — anything.",
  },
  {
    id: "2",
    image: require("../assets/images/onboarding2.png"),
    title: "Made for India",
    subtitle: "Styles crafted for Indian homes. From modern Mumbai to traditional Rajasthani aesthetics.",
  },
  {
    id: "3",
    image: require("../assets/images/onboarding3.png"),
    title: "Shop the Look",
    subtitle: "Get everything you need for your dream space—all in one place.",
  },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  function handleScroll(e: any) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(idx);
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={{ width, height }}>
            <ImageBackground source={item.image} style={styles.slideImage} resizeMode="cover">
              <View style={styles.slideOverlay} />
              <View style={[styles.slideContent, { paddingBottom: insets.bottom + 180 }]}>
                <Text style={styles.slideTitle}>{t(item.title)}</Text>
                <Text style={styles.slideSubtitle}>{t(item.subtitle)}</Text>
              </View>
            </ImageBackground>
          </View>
        )}
      />

      {/* <Pressable
        onPress={() => router.replace("/auth")}
        style={[styles.skipBtn, { top: insets.top + 16, right: 20 }]}
      >
        <Text style={styles.skipText}>{t("Skip")}</Text>
      </Pressable> */}

      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === activeIndex ? "#FF6B35" : "rgba(255,255,255,0.4)" },
                i === activeIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <GradientButton
          label={t("Get Started — Free")}
          onPress={() => router.replace("/auth")}
          style={{ marginHorizontal: 0, borderRadius: 12 }}
        />
        <Text style={styles.terms}>
          {t("By continuing, you agree to our Terms & Privacy Policy")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  slideImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  slideOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  slideContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 28,
  },
  slideTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 12,
    fontFamily: "Inter_700Bold",
  },
  slideSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Inter_400Regular",
  },
  skipBtn: {
    position: "absolute",
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    paddingHorizontal: 14,
  },
  skipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    gap: 16,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  terms: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
});
