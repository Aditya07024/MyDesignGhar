import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useSignIn, useOAuth, useAuth } from "@clerk/clerk-expo";
import { Mail, Lock, Sparkles } from "lucide-react-native";
import { COLORS, Button, useStyles } from "../../components/ui-kit";
import { useApp } from "../../store/app";
import { useSyncMutation } from "../../hooks/useApi";
import { setSessionToken } from "../../lib/api/client";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const styles = useStyles(getStyles);
  const { isLoaded: isAuthLoaded, isSignedIn, getToken } = useAuth();
  
  const login = useApp((s) => s.login);
  const isAuthed = useApp((s) => s.isAuthed);
  const setSelectedRole = useApp((s) => s.setSelectedRole);
  const syncMutation = useSyncMutation();
  const { isLoaded, signIn, setActive } = useSignIn();

  const [autoSyncAttempted, setAutoSyncAttempted] = useState(false);

  useEffect(() => {
    if (isAuthLoaded && isSignedIn) {
      if (isAuthed) {
        router.replace("/(tabs)/home");
      } else if (!autoSyncAttempted && !loading && !googleLoading && !appleLoading) {
        setAutoSyncAttempted(true);
        setLoading(true);
        getToken()
          .then((token) => {
            if (token) {
              setSessionToken(token);
            }
            syncMutation.mutate(
              { role: roleType },
              {
                onSuccess: (data) => {
                  login(token || undefined, data.user);
                  setLoading(false);
                  router.replace("/(tabs)/home");
                },
                onError: (syncErr: any) => {
                  setErr(syncErr.response?.data?.message || "Sync with backend server failed.");
                  setLoading(false);
                },
              }
            );
          })
          .catch((error) => {
            setErr(error.message || "Failed to retrieve session token.");
            setLoading(false);
          });
      }
    }
  }, [isAuthLoaded, isSignedIn, isAuthed, autoSyncAttempted]);

  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: "oauth_apple" });

  const [roleType, setRoleType] = useState<"USER" | "CONSULTANT">("USER");
  
  // Set default role in store on mount
  useEffect(() => {
    setSelectedRole("USER");
  }, []);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setErr("");
    setGoogleLoading(true);

    if (isSignedIn) {
      try {
        const token = await getToken();
        if (token) {
          setSessionToken(token);
        }
        syncMutation.mutate({ role: roleType }, {
          onSuccess: (data) => {
            login(token || undefined, data.user);
            setGoogleLoading(false);
            router.replace("/(tabs)/home");
          },
          onError: (syncErr: any) => {
            setErr(syncErr.response?.data?.message || "Sync with backend server failed.");
            setGoogleLoading(false);
          },
        });
      } catch (error: any) {
        setErr(error.message || "Failed to retrieve session token.");
        setGoogleLoading(false);
      }
      return;
    }

    try {
      const { createdSessionId, setActive: setOAuthActive } = await startGoogleFlow({
        redirectUrl: Linking.createURL("/(tabs)/home", { scheme: "mydesignghar" }),
      });

      if (createdSessionId) {
        if (setOAuthActive) {
          await setOAuthActive({ session: createdSessionId });
        }

        syncMutation.mutate({ role: roleType }, {
          onSuccess: (data) => {
            login(createdSessionId, data.user);
            setGoogleLoading(false);
            router.replace("/(tabs)/home");
          },
          onError: (syncErr: any) => {
            setErr(syncErr.response?.data?.message || "Sync with backend server failed.");
            setGoogleLoading(false);
          },
        });
      } else {
        setGoogleLoading(false);
      }
    } catch (error: any) {
      const errMsg = error.message || "";
      if (errMsg.toLowerCase().includes("already") || errMsg.toLowerCase().includes("signed in") || errMsg.toLowerCase().includes("sign in")) {
        try {
          const token = await getToken();
          if (token) {
            setSessionToken(token);
          }
          syncMutation.mutate({ role: roleType }, {
            onSuccess: (data) => {
              login(token || undefined, data.user);
              setGoogleLoading(false);
              router.replace("/(tabs)/home");
            },
            onError: (syncErr: any) => {
              setErr(syncErr.response?.data?.message || "Sync with backend server failed.");
              setGoogleLoading(false);
            },
          });
          return;
        } catch (tokenErr) {
          // Fall through to original error
        }
      }
      setErr(error.message || "Failed to log in with Google.");
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setErr("");
    setAppleLoading(true);

    if (isSignedIn) {
      try {
        const token = await getToken();
        if (token) {
          setSessionToken(token);
        }
        syncMutation.mutate({ role: roleType }, {
          onSuccess: (data) => {
            login(token || undefined, data.user);
            setAppleLoading(false);
            router.replace("/(tabs)/home");
          },
          onError: (syncErr: any) => {
            setErr(syncErr.response?.data?.message || "Sync with backend server failed.");
            setAppleLoading(false);
          },
        });
      } catch (error: any) {
        setErr(error.message || "Failed to retrieve session token.");
        setAppleLoading(false);
      }
      return;
    }

    try {
      const { createdSessionId, setActive: setOAuthActive } = await startAppleFlow({
        redirectUrl: Linking.createURL("/(tabs)/home", { scheme: "mydesignghar" }),
      });

      if (createdSessionId) {
        if (setOAuthActive) {
          await setOAuthActive({ session: createdSessionId });
        }

        syncMutation.mutate({ role: roleType }, {
          onSuccess: (data) => {
            login(createdSessionId, data.user);
            setAppleLoading(false);
            router.replace("/(tabs)/home");
          },
          onError: (syncErr: any) => {
            setErr(syncErr.response?.data?.message || "Sync with backend server failed.");
            setAppleLoading(false);
          },
        });
      } else {
        setAppleLoading(false);
      }
    } catch (error: any) {
      const errMsg = error.message || "";
      if (errMsg.toLowerCase().includes("already") || errMsg.toLowerCase().includes("signed in") || errMsg.toLowerCase().includes("sign in")) {
        try {
          const token = await getToken();
          if (token) {
            setSessionToken(token);
          }
          syncMutation.mutate({ role: roleType }, {
            onSuccess: (data) => {
              login(token || undefined, data.user);
              setAppleLoading(false);
              router.replace("/(tabs)/home");
            },
            onError: (syncErr: any) => {
              setErr(syncErr.response?.data?.message || "Sync with backend server failed.");
              setAppleLoading(false);
            },
          });
          return;
        } catch (tokenErr) {
          // Fall through to original error
        }
      }
      setErr(error.message || "Failed to log in with Apple.");
      setAppleLoading(false);
    }
  };

  const submit = async () => {
    if (!isLoaded) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setErr("Enter a valid email address.");
    }
    if (pwd.length < 4) {
      return setErr("Password must be at least 4 characters.");
    }
    setErr("");
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password: pwd,
      });

      if (result.status === "complete") {
        if (setActive) {
          await setActive({ session: result.createdSessionId });
        }

        // Retry token fetching to prevent race conditions in Clerk Expo
        let sessionTokenString = null;
        for (let attempt = 0; attempt < 5; attempt++) {
          sessionTokenString = await getToken();
          if (sessionTokenString) break;
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        if (sessionTokenString) {
          setSessionToken(sessionTokenString);
        }

        // Sync details to local PostgreSQL
        syncMutation.mutate({ role: roleType }, {
          onSuccess: (data) => {
            login(result.createdSessionId ?? undefined, data.user);
            setLoading(false);
            router.replace("/(tabs)/home");
          },
          onError: (syncErr: any) => {
            setErr(syncErr.response?.data?.message || "Sync with backend server failed.");
            setLoading(false);
          },
        });
      } else {
        setErr("Please complete verification steps to sign in.");
        setLoading(false);
      }
    } catch (error: any) {
      setErr(error.errors?.[0]?.message || "Invalid phone number or password. Try again.");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Sparkles size={28} color="#12141a" />
            </View>
            <Text style={styles.title}>
              {roleType === "USER" ? "Welcome back" : "Consultant Portal"}
            </Text>
            <Text style={styles.subtitle}>
              {roleType === "USER"
                ? "Log in to continue redesigning your home."
                : "Log in to access your client dashboard and manage sessions."}
            </Text>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, roleType === "USER" && styles.tabButtonActive]}
              onPress={() => {
                setRoleType("USER");
                setSelectedRole("USER");
              }}
            >
              <Text style={[styles.tabButtonText, roleType === "USER" && styles.tabButtonTextActive]}>
                Homeowner
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, roleType === "CONSULTANT" && styles.tabButtonActive]}
              onPress={() => {
                setRoleType("CONSULTANT");
                setSelectedRole("CONSULTANT");
              }}
            >
              <Text style={[styles.tabButtonText, roleType === "CONSULTANT" && styles.tabButtonTextActive]}>
                Consultant
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {/* Email field */}
            <View style={styles.inputContainer}>
              <Mail size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                placeholder="Email address"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {/* Password field */}
            <View style={styles.inputContainer}>
              <Lock size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor={COLORS.textMuted}
                value={pwd}
                onChangeText={setPwd}
                secureTextEntry
                style={styles.input}
              />
            </View>
          </View>

          {err ? <Text style={styles.errorText}>{err}</Text> : null}

          <Button
            title="Log In"
            full
            size="lg"
            onPress={submit}
            loading={loading}
            disabled={googleLoading || appleLoading}
            style={styles.submitBtn}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.oauthContainer}>
            <Button
              title="Continue with Google"
              full
              variant="outline"
              onPress={handleGoogleSignIn}
              loading={googleLoading}
              disabled={loading || appleLoading}
            />
            <Button
              title="Continue with Apple"
              full
              variant="outline"
              onPress={handleAppleSignIn}
              loading={appleLoading}
              disabled={loading || googleLoading}
              style={{ marginTop: 12 }}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              New here?{" "}
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.registerLink}>Create an account</Text>
                </TouchableOpacity>
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme: "light" | "dark") => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 32,
  },
  logoContainer: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
  },
  errorText: {
    color: COLORS.destructive,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
  },
  submitBtn: {
    marginTop: 24,
  },
  guestBtn: {
    marginTop: 16,
    alignItems: "center",
  },
  guestText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
    paddingTop: 40,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: "700",
    marginLeft: 4,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "700",
    marginHorizontal: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  oauthContainer: {
    width: "100%",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.cardAlt,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: COLORS.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  tabButtonTextActive: {
    color: COLORS.text,
    fontWeight: "700",
  },
});
