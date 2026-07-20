import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useApp } from "@/context/AppContext";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const { isLoggedIn } = useApp();
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (isLoggedIn) {
        router.replace("/(tabs)");
      } else {
        router.replace("/welcome");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  return (
    <View style={styles.container}>
      <View style={styles.bg1} />
      <View style={styles.bg2} />
      <Animated.View
        style={[styles.logoContainer, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}
      >
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.name}>MyDesignGhar</Text>
        <Text style={styles.tagline}>
          अपने कमरे को 10 सेकंड में नया रूप दें
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F3",
    alignItems: "center",
    justifyContent: "center",
  },
  bg1: {
    position: "absolute",
    top: -100,
    right: -60,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255,107,53,0.08)",
  },
  bg2: {
    position: "absolute",
    bottom: -80,
    left: -80,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "rgba(0,78,137,0.06)",
  },
  logoContainer: {
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 24,
  },
  name: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FF6B35",
    letterSpacing: 1,
    fontFamily: "Inter_700Bold",
  },
  tagline: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    paddingHorizontal: 20,
    fontFamily: "Inter_400Regular",
  },
});
