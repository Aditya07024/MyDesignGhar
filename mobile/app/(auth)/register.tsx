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
  SafeAreaView,
} from "react-native";
import { useRouter, Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useSignUp, useOAuth, useAuth } from "@clerk/clerk-expo";
import { User, Phone, Mail, Lock, Gift, Briefcase, DollarSign, FileText } from "lucide-react-native";
import { COLORS, Button, useStyles } from "../../components/ui-kit";
import { useApp } from "../../store/app";
import { useSyncMutation } from "../../hooks/useApi";
import { setSessionToken } from "../../lib/api/client";
import { ConsultantService } from "../../lib/api/services";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const router = useRouter();
  const styles = useStyles(getStyles);
  const { isLoaded: isAuthLoaded, isSignedIn, getToken } = useAuth();
  
  const login = useApp((s) => s.login);
  const isAuthed = useApp((s) => s.isAuthed);
  const setSelectedRole = useApp((s) => s.setSelectedRole);
  const syncMutation = useSyncMutation();
  const { isLoaded, signUp, setActive } = useSignUp();
  
  useEffect(() => {
    if (isAuthLoaded && isSignedIn && isAuthed) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthLoaded, isSignedIn, isAuthed]);

  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: "oauth_apple" });

  const [roleType, setRoleType] = useState<"USER" | "CONSULTANT">("USER");

  // Set default role in store on mount
  useEffect(() => {
    setSelectedRole("USER");
  }, []);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    pwd: "",
    referralCode: "",
  });
  const [consultantForm, setConsultantForm] = useState({
    specialty: "",
    experience: "",
    bio: "",
    price: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setErr("");
    setGoogleLoading(true);
    try {
      const { createdSessionId, setActive: setOAuthActive } = await startGoogleFlow({
        redirectUrl: Linking.createURL("/(tabs)/home", { scheme: "mydesignghar" }),
      });

      if (createdSessionId) {
        if (setOAuthActive) {
          await setOAuthActive({ session: createdSessionId });
        }

        // Sync details to local PostgreSQL, applying referral if provided
        syncMutation.mutate({ referralCode: form.referralCode || undefined, role: roleType }, {
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
      setErr(error.message || "Failed to sign up with Google.");
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setErr("");
    setAppleLoading(true);
    try {
      const { createdSessionId, setActive: setOAuthActive } = await startAppleFlow({
        redirectUrl: Linking.createURL("/(tabs)/home", { scheme: "mydesignghar" }),
      });

      if (createdSessionId) {
        if (setOAuthActive) {
          await setOAuthActive({ session: createdSessionId });
        }

        // Sync details to local PostgreSQL, applying referral if provided
        syncMutation.mutate({ referralCode: form.referralCode || undefined, role: roleType }, {
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
      setErr(error.message || "Failed to sign up with Apple.");
      setAppleLoading(false);
    }
  };

  const updateField = (key: keyof typeof form, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const submit = async () => {
    if (!isLoaded) return;
    if (form.name.trim().length < 2) {
      return setErr("Please enter your name.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return setErr("Enter a valid email address.");
    }
    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      return setErr("Enter a valid 10-digit phone number.");
    }
    if (form.pwd.length < 4) {
      return setErr("Password must be at least 4 characters.");
    }

    if (roleType === "CONSULTANT") {
      if (consultantForm.specialty.trim().length < 2) {
        return setErr("Specialty description must be at least 2 characters.");
      }
      const exp = parseInt(consultantForm.experience.trim());
      if (isNaN(exp) || exp < 0) {
        return setErr("Experience must be a valid non-negative number of years.");
      }
      if (consultantForm.bio.trim().length < 10) {
        return setErr("Bio must be at least 10 characters.");
      }
      const prc = parseFloat(consultantForm.price.trim());
      if (isNaN(prc) || prc <= 0) {
        return setErr("Price must be a valid positive number.");
      }
    }

    setErr("");
    setLoading(true);

    try {
      const formattedPhone = form.phone ? (form.phone.startsWith("+") ? form.phone : `+91${form.phone}`) : undefined;

      const result = await signUp.create({
        emailAddress: form.email.trim(),
        password: form.pwd,
        phoneNumber: formattedPhone || undefined,
        firstName: form.name.trim().split(" ")[0],
        lastName: form.name.trim().split(" ").slice(1).join(" ") || undefined,
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

        // Sync profile metadata with backend & apply referral code credit
        syncMutation.mutate({ referralCode: form.referralCode || undefined, role: roleType }, {
          onSuccess: async (data) => {
            if (roleType === "CONSULTANT") {
              try {
                const consultantData = {
                  specialty: consultantForm.specialty.trim(),
                  experience: parseInt(consultantForm.experience.trim()),
                  bio: consultantForm.bio.trim(),
                  price: parseFloat(consultantForm.price.trim()),
                };

                await ConsultantService.register(consultantData);
                const updatedUser = {
                  ...data.user,
                  role: "CONSULTANT" as const,
                };
                login(result.createdSessionId ?? undefined, updatedUser);
              } catch (regErr: any) {
                setErr(regErr.response?.data?.message || "Failed to register consultant profile.");
                setLoading(false);
                return;
              }
            } else {
              login(result.createdSessionId ?? undefined, data.user);
            }
            setLoading(false);
            router.replace("/(tabs)/home");
          },
          onError: (syncErr: any) => {
            setErr(syncErr.response?.data?.message || "Sync with database failed.");
            setLoading(false);
          },
        });
      } else {
        setErr("Please complete verification steps to finish signup.");
        setLoading(false);
      }
    } catch (error: any) {
      setErr(error.errors?.[0]?.message || "Registration failed. Try checking details.");
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
            <Text style={styles.title}>
              {roleType === "USER" ? "Create account" : "Consultant Registry"}
            </Text>
            <Text style={styles.subtitle}>
              {roleType === "USER"
                ? "Join thousands designing smarter homes."
                : "Sign up to offer expert design consultations."}
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
            {/* Full Name field */}
            <View style={styles.inputContainer}>
              <User size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                placeholder="Full name"
                placeholderTextColor={COLORS.textMuted}
                value={form.name}
                onChangeText={(v) => updateField("name", v)}
                style={styles.input}
              />
            </View>

            {/* Email field */}
            <View style={styles.inputContainer}>
              <Mail size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                placeholder="Email address"
                placeholderTextColor={COLORS.textMuted}
                value={form.email}
                onChangeText={(v) => updateField("email", v)}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {/* Phone field */}
            <View style={styles.inputContainer}>
              <Phone size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                placeholder="Phone number (optional)"
                placeholderTextColor={COLORS.textMuted}
                value={form.phone}
                onChangeText={(v) => updateField("phone", v)}
                keyboardType="numeric"
                maxLength={10}
                style={styles.input}
              />
            </View>

            {/* Password field */}
            <View style={styles.inputContainer}>
              <Lock size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor={COLORS.textMuted}
                value={form.pwd}
                onChangeText={(v) => updateField("pwd", v)}
                secureTextEntry
                style={styles.input}
              />
            </View>

            {/* Referral code field */}
            <View style={styles.inputContainer}>
              <Gift size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                placeholder="Referral code (optional)"
                placeholderTextColor={COLORS.textMuted}
                value={form.referralCode}
                onChangeText={(v) => updateField("referralCode", v)}
                autoCapitalize="characters"
                style={styles.input}
              />
            </View>

            {/* Consultant Specific Fields */}
            {roleType === "CONSULTANT" && (
              <>
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Consultant Profile</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Specialty field */}
                <View style={styles.inputContainer}>
                  <User size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Specialty (e.g. Interior Designer)"
                    placeholderTextColor={COLORS.textMuted}
                    value={consultantForm.specialty}
                    onChangeText={(v) => setConsultantForm((f) => ({ ...f, specialty: v }))}
                    style={styles.input}
                  />
                </View>

                {/* Experience field */}
                <View style={styles.inputContainer}>
                  <Briefcase size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Experience (years)"
                    placeholderTextColor={COLORS.textMuted}
                    value={consultantForm.experience}
                    onChangeText={(v) => setConsultantForm((f) => ({ ...f, experience: v }))}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>

                {/* Price field */}
                <View style={styles.inputContainer}>
                  <DollarSign size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Consultation Price (₹)"
                    placeholderTextColor={COLORS.textMuted}
                    value={consultantForm.price}
                    onChangeText={(v) => setConsultantForm((f) => ({ ...f, price: v }))}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>

                {/* Bio field */}
                <View style={[styles.inputContainer, { height: 100, alignItems: "flex-start", paddingTop: 14 }]}>
                  <FileText size={20} color={COLORS.textMuted} style={[styles.inputIcon, { marginTop: 2 }]} />
                  <TextInput
                    placeholder="Short Bio (minimum 10 characters)"
                    placeholderTextColor={COLORS.textMuted}
                    value={consultantForm.bio}
                    onChangeText={(v) => setConsultantForm((f) => ({ ...f, bio: v }))}
                    multiline
                    style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                  />
                </View>
              </>
            )}
          </View>

          {err ? <Text style={styles.errorText}>{err}</Text> : null}

          <Button
            title={roleType === "USER" ? "Create Account" : "Register as Consultant"}
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
              Already have an account?{" "}
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Log in</Text>
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
  loginLink: {
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
