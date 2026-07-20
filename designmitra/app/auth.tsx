import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOAuth, useAuth, useSignIn } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { GradientButton } from "@/components/GradientButton";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { AuthService } from "../lib/api/services";
import { setSessionToken } from "../lib/api/client";
import { useTranslation } from "../lib/i18n";

const OPTIONS = [
  {
    id: "google",
    icon: "logo-google" as const,
    iconSet: "ionicons" as const,
    label: "Continue with Google",
    sub: "Fast and easy",
    route: null,
  },
  {
    id: "apple",
    icon: "logo-apple" as const,
    iconSet: "ionicons" as const,
    label: "Continue with Apple",
    sub: "",
    route: null,
  },
  {
    id: "email",
    icon: "mail" as const,
    iconSet: "feather" as const,
    label: "Email with OTP",
    sub: "",
    route: "/email-auth",
  },
];

export default function AuthScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useApp();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: "oauth_apple" });
  const { getToken, isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();

  // Auto-login on mount if already signed in to Clerk (handles web OAuth redirect return)
  useEffect(() => {
    if (isAuthLoaded && isSignedIn && !loading) {
      setLoading(true);
      getToken()
        .then((token) => {
          if (token) {
            setSessionToken(token);
          }
          return AuthService.sync();
        })
        .then((syncRes) => {
          login({
            id: syncRes.user.id,
            name: syncRes.user.fullName || "User",
            email: syncRes.user.email || undefined,
            phone: syncRes.user.phone || undefined,
            streak: syncRes.user.streak || 1,
            walletBalance: syncRes.user.walletBalance || 0,
            referralCode: syncRes.user.referralCode,
          });
          router.replace("/onboarding/details");
        })
        .catch((err) => {
          console.warn("Auto-sync failed on mount:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isAuthLoaded, isSignedIn]);

  async function handleOAuth(strategy: "google" | "apple") {
    setLoading(true);

    // On web: use redirect-based OAuth (stays in same tab)
    if (Platform.OS === "web" && signIn && isSignInLoaded) {
      try {
        await signIn.authenticateWithRedirect({
          strategy: strategy === "google" ? "oauth_google" : "oauth_apple",
          redirectUrl: `${window.location.origin}/auth`,
          redirectUrlComplete: `${window.location.origin}/auth`,
        });
        // Page will redirect away — no further code runs here
        return;
      } catch (err: any) {
        console.error("Web OAuth redirect error:", err);
        setLoading(false);
        return;
      }
    }

    // On native: use popup-based OAuth flow
    const flow = strategy === "google" ? startGoogleFlow : startAppleFlow;
    try {
      const redirectUrl = Linking.createURL("/(tabs)", { scheme: "mydesignghar" });
      const { createdSessionId, setActive } = await flow({ redirectUrl });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        
        // Wait briefly for token sync to register
        const token = await getToken();
        if (token) {
          setSessionToken(token);
        }

        // Sync with backend
        const syncRes = await AuthService.sync();
        
        login({
          id: syncRes.user.id,
          name: syncRes.user.fullName || "User",
          email: syncRes.user.email || undefined,
          phone: syncRes.user.phone || undefined,
          streak: syncRes.user.streak || 1,
          walletBalance: syncRes.user.walletBalance || 0,
          referralCode: syncRes.user.referralCode,
        });

        router.replace("/onboarding/details");
      }
    } catch (error: any) {
      const errMsg = error.message || "";
      if (errMsg.toLowerCase().includes("already") || errMsg.toLowerCase().includes("signed in") || errMsg.toLowerCase().includes("active")) {
        try {
          const token = await getToken();
          if (token) {
            setSessionToken(token);
          }
          const syncRes = await AuthService.sync();
          login({
            id: syncRes.user.id,
            name: syncRes.user.fullName || "User",
            email: syncRes.user.email || undefined,
            phone: syncRes.user.phone || undefined,
            streak: syncRes.user.streak || 1,
            walletBalance: syncRes.user.walletBalance || 0,
            referralCode: syncRes.user.referralCode,
          });
          router.replace("/onboarding/details");
          return;
        } catch (tokenErr) {
          console.error("Failed to sync existing session:", tokenErr);
        }
      }
      console.error(`${strategy} OAuth error:`, error);
    } finally {
      setLoading(false);
    }
  }

  function handleOption(option: (typeof OPTIONS)[0]) {
    if (option.id === "google" || option.id === "apple") {
      handleOAuth(option.id);
      return;
    }
    router.push(option.route as any);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24 }]}>
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {isSignup ? "Create Account" : "Welcome Back"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {isSignup
            ? "Join 50,000+ Indians redesigning their homes"
            : "Your AI designer is waiting"}
        </Text>
      </View>

      <View style={styles.options}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
        ) : (
          OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => handleOption(opt)}
              style={({ pressed }) => [
                styles.optionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: opt.id === "google" ? colors.primary : colors.border,
                  borderWidth: opt.id === "google" ? 1.5 : 1,
                  opacity: pressed ? 0.85 : 1,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: opt.id === "google" ? colors.primary + "18" : colors.muted }]}>
                {opt.iconSet === "ionicons" ? (
                  <Ionicons name={opt.icon as any} size={22} color={opt.id === "google" ? colors.primary : colors.foreground} />
                ) : (
                  <Feather name={opt.icon as any} size={22} color={opt.id === "google" ? colors.primary : colors.foreground} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionLabel, { color: colors.foreground }]}>{opt.label}</Text>
                {!!opt.sub && (
                  <Text style={[styles.optionSub, { color: colors.primary }]}>{opt.sub}</Text>
                )}
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          ))
        )}
      </View>

      <TouchableOpacity
        onPress={() => setIsSignup(!isSignup)}
        style={styles.toggle}
      >
        <Text style={[styles.toggleText, { color: colors.mutedForeground }]}>
          {isSignup ? "Already have an account? " : "New user? "}
          <Text style={{ color: colors.primary, fontWeight: "700" }}>
            {isSignup ? "Login" : "Sign Up"}
          </Text>
        </Text>
      </TouchableOpacity>

      <View style={{ paddingBottom: insets.bottom + 16, paddingHorizontal: 24, marginTop: "auto" }}>
        <Text style={[styles.terms, { color: colors.mutedForeground }]}>
          By continuing, you agree to our{" "}
          <Text style={{ color: colors.secondary }}>Terms of Service</Text> and{" "}
          <Text style={{ color: colors.secondary }}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  decorCircle1: {
    position: "absolute",
    top: -50,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,107,53,0.07)",
  },
  decorCircle2: {
    position: "absolute",
    bottom: 100,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(0,78,137,0.05)",
  },
  header: {
    marginTop: 32,
    marginBottom: 40,
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  options: {
    gap: 14,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  optionSub: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginTop: 2,
  },
  toggle: {
    alignItems: "center",
    marginTop: 28,
  },
  toggleText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  terms: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
  },
});
