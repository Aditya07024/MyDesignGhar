import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  TextInput,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Moon,
  Sun,
  Globe,
  Shield,
  FileText,
  Bell,
  LogOut,
  ChevronRight,
  Edit3,
} from "lucide-react-native";
import { COLORS, Avatar, Button, GlassCard, useTranslation, useStyles } from "../components/ui-kit";
import { useApp } from "../store/app";
import { useAuth } from "@clerk/clerk-expo";
import { AuthService } from "../lib/api/services";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, userName, theme, toggleTheme, logout, setUser, language, setLanguage } = useApp();
  const { signOut } = useAuth();
  const dark = theme === "dark";
  const t = useTranslation();
  const styles = useStyles(getStyles);

  const [toggles, setToggles] = useState({
    push: true,
    email: false,
    privacy: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.fullName || userName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.fullName) {
      setEditedName(user.fullName);
    }
  }, [user?.fullName]);

  const handleSaveProfile = async () => {
    if (editedName.trim().length < 2) {
      return Alert.alert("Error", "Name must be at least 2 characters.");
    }
    setSaving(true);
    try {
      const res = await AuthService.updateProfile({ fullName: editedName.trim() });
      if (res && res.profile) {
        if (user) {
          setUser({
            ...user,
            fullName: res.profile.fullName,
          });
        }
        Alert.alert("Success", "Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      const confirmLogout = window.confirm("Are you sure you want to log out?");
      if (confirmLogout) {
        performLogout();
      }
      return;
    }

    Alert.alert(t("Log Out"), t("Logout Alert"), [
      { text: t("Cancel"), style: "cancel" },
      {
        text: t("Log Out"),
        style: "destructive",
        onPress: performLogout,
      },
    ]);
  };

  const performLogout = async () => {
    logout(); // Clear local Zustand auth state first
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (e) {
      console.warn("Clerk signOut failed:", e);
      router.replace("/(auth)/login");
    }
  };

  const handleLanguageChange = () => {
    if (Platform.OS === "web") {
      const selectHindi = window.confirm("Switch language to हिन्दी (Hindi)? Select Cancel to keep English.");
      if (selectHindi) {
        setLanguage("hi");
      } else {
        setLanguage("en");
      }
      return;
    }

    Alert.alert(
      t("Language"),
      t("Select Language") || "Select Language / भाषा चुनें",
      [
        { text: "English", onPress: () => setLanguage("en") },
        { text: "हिन्दी (Hindi)", onPress: () => setLanguage("hi") },
        { text: t("Cancel"), style: "cancel" }
      ]
    );
  };

  const handleDeleteAccount = () => {
    if (Platform.OS === "web") {
      const confirmDelete = window.confirm("Are you sure you want to delete your account permanently? This action cannot be undone.");
      if (confirmDelete) {
        performDeleteAccount();
      }
      return;
    }

    Alert.alert(t("Delete Account"), t("Delete Account Alert"), [
      { text: t("Cancel"), style: "cancel" },
      {
        text: t("Delete Account"),
        style: "destructive",
        onPress: performDeleteAccount,
      },
    ]);
  };

  const performDeleteAccount = async () => {
    try {
      await AuthService.deleteAccount();
      logout();
      await signOut();
      router.replace("/(auth)/login");
      if (Platform.OS === "web") {
        alert("Account deleted successfully.");
      } else {
        Alert.alert("Success", "Account deleted successfully.");
      }
    } catch (err: any) {
      if (Platform.OS === "web") {
        alert(err.response?.data?.message || "Failed to delete account.");
      } else {
        Alert.alert("Error", err.response?.data?.message || "Failed to delete account.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("Profile & Settings")}</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Avatar seed={user?.fullName || userName} size={64} />
          
          {isEditing ? (
            <View style={styles.editForm}>
              <TextInput
                value={editedName}
                onChangeText={setEditedName}
                style={styles.nameInput}
                placeholder="Enter full name"
                placeholderTextColor={COLORS.textMuted}
              />
              <TouchableOpacity 
                onPress={handleSaveProfile} 
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>{saving ? t("Saving") : t("Save")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.fullName || userName}</Text>
              <Text style={styles.profileEmail}>{user?.email || "No email linked"}</Text>
              <Text style={styles.profilePhone}>{user?.phone || "No phone linked"}</Text>
            </View>
          )}

          {!isEditing && (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={styles.editBtn}
            >
              <Edit3 size={18} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Preferences / Toggles */}
        <Text style={styles.sectionHeading}>{t("Preferences")}</Text>
        <View style={styles.settingsGroup}>
          {/* Dark Mode toggle */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleTheme}
            style={styles.settingsRow}
          >
            <View style={styles.settingsRowLeft}>
              <View style={styles.iconContainer}>
                {dark ? (
                  <Moon size={20} color={COLORS.primary} />
                ) : (
                  <Sun size={20} color={COLORS.primary} />
                )}
              </View>
              <Text style={styles.settingsLabel}>{t("Dark Mode")}</Text>
            </View>
            <View
              style={[
                styles.switchContainer,
                dark ? styles.switchActive : styles.switchInactive,
              ]}
            >
              <View style={[styles.switchThumb, dark ? styles.thumbActive : styles.thumbInactive]} />
            </View>
          </TouchableOpacity>

          {/* Push notifications toggle */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setToggles((t) => ({ ...t, push: !t.push }))}
            style={styles.settingsRow}
          >
            <View style={styles.settingsRowLeft}>
              <View style={styles.iconContainer}>
                <Bell size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.settingsLabel}>{t("Push Notifications")}</Text>
            </View>
            <View
              style={[
                styles.switchContainer,
                toggles.push ? styles.switchActive : styles.switchInactive,
              ]}
            >
              <View style={[styles.switchThumb, toggles.push ? styles.thumbActive : styles.thumbInactive]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Support & Legal */}
        <Text style={styles.sectionHeading}>{t("Legal & Languages")}</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/notifications")}
            style={styles.settingsRow}
          >
            <View style={styles.settingsRowLeft}>
              <View style={styles.iconContainer}>
                <Bell size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.settingsLabel}>{t("Notifications")}</Text>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={handleLanguageChange} style={styles.settingsRow}>
            <View style={styles.settingsRowLeft}>
              <View style={styles.iconContainer}>
                <Globe size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.settingsLabel}>{t("Language")}</Text>
            </View>
            <View style={styles.settingsRowRight}>
              <Text style={styles.settingsHint}>{language === "hi" ? "हिन्दी" : "English"}</Text>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={styles.settingsRow}>
            <View style={styles.settingsRowLeft}>
              <View style={styles.iconContainer}>
                <Shield size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.settingsLabel}>{t("Privacy Policy")}</Text>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={[styles.settingsRow, styles.lastRow]}>
            <View style={styles.settingsRowLeft}>
              <View style={styles.iconContainer}>
                <FileText size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.settingsLabel}>{t("Terms & Conditions")}</Text>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={styles.logoutBtn}
        >
          <LogOut size={20} color={COLORS.destructive} />
          <Text style={styles.logoutText}>{t("Log Out")}</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDeleteAccount}
          style={styles.deleteAccountBtn}
        >
          <Text style={styles.deleteAccountText}>{t("Delete Account")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: "light" | "dark") => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  profileEmail: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  profilePhone: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.cardAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  editForm: {
    flex: 1,
    marginLeft: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nameInput: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.cardAlt,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: COLORS.text,
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: {
    color: "#12141a",
    fontWeight: "700",
    fontSize: 12,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 10,
  },
  settingsGroup: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  settingsRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.cardAlt,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  settingsRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  settingsHint: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  switchContainer: {
    width: 44,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  switchActive: {
    backgroundColor: COLORS.primary,
  },
  switchInactive: {
    backgroundColor: COLORS.border,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  thumbActive: {
    alignSelf: "flex-end",
  },
  thumbInactive: {
    alignSelf: "flex-start",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.destructive,
  },
  deleteAccountBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.4)",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingVertical: 14,
  },
  deleteAccountText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.destructive,
  },
});
