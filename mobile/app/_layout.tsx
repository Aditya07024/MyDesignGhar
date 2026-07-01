if (typeof global.DOMException === "undefined") {
  global.DOMException = class DOMException extends Error {
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name || "DOMException";
    }
  } as any;
}

import { Slot, Stack, useSegments } from "expo-router";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, StatusBar, Platform, ActivityIndicator, Appearance } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { tokenCache } from "../lib/auth-cache";
import { setSessionToken, tokenRef } from "../lib/api/client";
import { useApp } from "../store/app";
import { COLORS, Button } from "../components/ui-kit";
import { AuthService } from "../lib/api/services";
import { Wrench, RefreshCw } from "lucide-react-native";
import * as SecureStore from "expo-secure-store";
import { registerForPushNotificationsAsync, registerPushToken } from "../lib/push";

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let Notifications: any = null;
if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch (e) {
    console.warn("expo-notifications failed to load:", e);
  }
}

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

const isClerkKeyValid =
  CLERK_PUBLISHABLE_KEY.length > 0 &&
  !CLERK_PUBLISHABLE_KEY.includes("placeholder") &&
  !CLERK_PUBLISHABLE_KEY.includes("...") &&
  (CLERK_PUBLISHABLE_KEY.startsWith("pk_test_") || CLERK_PUBLISHABLE_KEY.startsWith("pk_live_"));

const queryClient = new QueryClient();

function TokenSync() {
  const { getToken, userId } = useAuth();

  useEffect(() => {
    tokenRef.getToken = getToken;
  }, [getToken]);

  const hydrateAuth = useApp((s) => s.hydrateAuth);
  const hydrateTheme = useApp((s) => s.hydrateTheme);
  const sessionToken = useApp((s) => s.sessionToken);
  const segments = useSegments();

  useEffect(() => {
    hydrateTheme();
    hydrateAuth();

    // Listen to system theme appearance changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only override theme dynamically if there is no user-saved preference stored in SecureStore
      // Alternatively, we can let system changes automatically update if the user hasn't toggled manually,
      // but to align default to system:
      SecureStore.getItemAsync("mdg_theme").then((storedTheme) => {
        if (!storedTheme) {
          useApp.getState().setTheme(colorScheme === "dark" ? "dark" : "light");
        }
      }).catch(() => {});
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const sync = async () => {
      try {
        if (userId) {
          // If we already have a valid session token, skip syncing to avoid duplicate API requests and rate limits
          if (useApp.getState().sessionToken) {
            return;
          }

          const token = await getToken();
          setSessionToken(token);
          
          // Skip background sync on login/register screens to let the forms handle it manually
          const isAuthScreen = segments[0] === "(auth)";
          if (isAuthScreen) {
            return;
          }
          
          // Fetch user profile from PostgreSQL backend, sync roles, and update Zustand store
          const selectedRole = useApp.getState().selectedRole || "USER";
          const res = await AuthService.sync({ role: selectedRole });
          if (res && res.user) {
            useApp.getState().login(token || undefined, res.user);
            useApp.getState().setBackendDown(false);

            // Register push notifications
            registerForPushNotificationsAsync().then((pushToken) => {
              if (pushToken) {
                registerPushToken(pushToken);
              }
            });
          }
        } else {
          setSessionToken(null);
          useApp.getState().logout();
        }
      } catch (err: any) {
        console.error("TokenSync failed:", err);
        const isMaint = !err.response || [502, 503, 504].includes(err.response?.status);
        if (isMaint) {
          useApp.getState().setBackendDown(true);
        }
      }
    };
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, segments, sessionToken]);

  return null;
}

function MaintenanceScreen() {
  const setBackendDown = useApp((s) => s.setBackendDown);
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const selectedRole = useApp.getState().selectedRole || "USER";
      await AuthService.sync({ role: selectedRole });
      setBackendDown(false);
    } catch (err) {
      alert("Server is still under maintenance. Please try again shortly.");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <SafeAreaView style={styles.fallbackContainer}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.fallbackContent}>
        <View style={styles.instructionsCard}>
          <View style={{ alignItems: "center", marginVertical: 12 }}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16
            }}>
              <Wrench size={32} color={COLORS.destructive} />
            </View>
            <Text style={styles.fallbackTitle}>System Maintenance</Text>
            <Text style={[styles.fallbackBody, { marginBottom: 20 }]}>
              Our servers are currently undergoing scheduled maintenance. We will be back online shortly. Thank you for your patience!
            </Text>
            
            <Button
              title={retrying ? "Checking..." : "Retry Connection"}
              full
              icon={!retrying && <RefreshCw size={16} color="#12141a" />}
              onPress={handleRetry}
              loading={retrying}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  if (!isClerkKeyValid) {
    return (
      <SafeAreaView style={styles.fallbackContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.fallbackContent}>
          <Text style={styles.fallbackTitle}>Clerk Configuration Required</Text>
          <Text style={styles.fallbackBody}>
            To run the MyDezineGhar mobile app, you need to configure your Clerk Publishable Key.
          </Text>
          
          <View style={styles.instructionsCard}>
            <Text style={[styles.stepTitle, { color: COLORS.destructive, marginBottom: 8 }]}>Debug Info (Current Resolution):</Text>
            <Text style={[styles.stepText, { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 11, backgroundColor: COLORS.background, padding: 8, borderRadius: 6, marginBottom: 16, lineHeight: 16 }]}>
              Key: "{CLERK_PUBLISHABLE_KEY || "undefined/empty"}"{"\n"}
              Valid Format: {String(CLERK_PUBLISHABLE_KEY.startsWith("pk_test_") || CLERK_PUBLISHABLE_KEY.startsWith("pk_live_"))}{"\n"}
              Has Placeholder: {String(CLERK_PUBLISHABLE_KEY.includes("placeholder"))}{"\n"}
              Has Dots: {String(CLERK_PUBLISHABLE_KEY.includes("..."))}{"\n"}
              Environment: {Constants.executionEnvironment}
            </Text>

            <Text style={styles.stepTitle}>1. Get your Publishable Key</Text>
            <Text style={styles.stepText}>
              Find it in the Clerk Dashboard under "API Keys".
            </Text>
            
            <Text style={[styles.stepTitle, { marginTop: 14 }]}>2. Add to Environment</Text>
            <Text style={styles.stepText}>
              Add the key to your local environment variables:{"\n"}
              <Text style={styles.codeText}>
                EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
              </Text>
            </Text>
            
            <Text style={[styles.stepTitle, { marginTop: 14 }]}>3. Restart Metro Bundler</Text>
            <Text style={styles.stepText}>
              Restart the server with cache clearing:{"\n"}
              <Text style={styles.codeText}>npx expo start --clear</Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const theme = useApp((s) => s.theme);
  const language = useApp((s) => s.language);
  const hydrated = useApp((s) => s.hydrated);
  const isBackendDown = useApp((s) => s.isBackendDown);

  useEffect(() => {
    if (hydrated) {
      queryClient.invalidateQueries();
    }
  }, [language, hydrated]);

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <TokenSync />
          <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />
          {!hydrated ? (
            <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <Stack
              key={`${theme}-${language}`}
              screenOptions={{
                headerStyle: {
                  backgroundColor: COLORS.card,
                },
                headerTintColor: COLORS.text,
                headerTitleStyle: {
                  fontWeight: "bold",
                },
                headerBackTitle: "",
                // @ts-ignore
                headerBackTitleVisible: false,
                contentStyle: {
                  backgroundColor: COLORS.background,
                },
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false, headerBackTitle: "" }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false, headerBackTitle: "" }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false, headerBackTitle: "" }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false, headerBackTitle: "" }} />
              <Stack.Screen name="landing" options={{ headerShown: false, headerBackTitle: "" }} />
              <Stack.Screen name="generate/index" options={{ title: "Generate Design" }} />
              <Stack.Screen name="generate/result" options={{ title: "AI Redesign Result" }} />
              <Stack.Screen name="call" options={{ title: "Consultation Call" }} />
              <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
              <Stack.Screen name="booking" options={{ title: "Book Consultation" }} />
              <Stack.Screen name="referral" options={{ title: "Referral Program" }} />
              <Stack.Screen name="sessions" options={{ title: "Session Details" }} />
              <Stack.Screen name="settings" options={{ title: "Settings" }} />
            </Stack>
          )}
          {isBackendDown && (
            <View style={StyleSheet.absoluteFill}>
              <MaintenanceScreen />
            </View>
          )}
        </SafeAreaProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackContent: {
    paddingHorizontal: 28,
    width: "100%",
  },
  fallbackTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  fallbackBody: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  instructionsCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },
  stepText: {
    fontSize: 13,
    color: COLORS.text,
    marginTop: 4,
    lineHeight: 18,
  },
  codeText: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: COLORS.text,
    fontSize: 12,
    backgroundColor: COLORS.background,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});
