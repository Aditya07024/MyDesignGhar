import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  Lock,
  KeyRound,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { COLORS, Avatar, Button, GlassCard, useTranslation, useStyles } from "../components/ui-kit";
import { useApp } from "../store/app";
import { SUPPORTED_LANGUAGES, type AppLanguage } from "../store/app";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { AuthService } from "../lib/api/services";

export default function SettingsScreen() {
  const router = useRouter();
  const { user: appUser, userName, theme, toggleTheme, logout, setUser, language, setLanguage } = useApp();
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const dark = theme === "dark";
  const t = useTranslation();
  const styles = useStyles(getStyles);

  const [toggles, setToggles] = useState({
    push: true,
    email: false,
    privacy: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(appUser?.fullName || userName);
  const [saving, setSaving] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Language picker modal state
  const [showLangPicker, setShowLangPicker] = useState(false);

  useEffect(() => {
    if (appUser?.fullName) {
      setEditedName(appUser.fullName);
    }
  }, [appUser?.fullName]);

  const handleSaveProfile = async () => {
    if (editedName.trim().length < 2) {
      return Alert.alert("Error", "Name must be at least 2 characters.");
    }
    setSaving(true);
    try {
      const res = await AuthService.updateProfile({ fullName: editedName.trim() });
      if (res && res.profile) {
        if (appUser) {
          setUser({
            ...appUser,
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

  const handleChangePassword = async () => {
    setPasswordError("");
    if (!currentPassword.trim()) {
      setPasswordError("Current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    try {
      await clerkUser?.updatePassword({
        currentPassword,
        newPassword,
        signOutOfOtherSessions: false,
      });
      if (Platform.OS === "web") {
        alert("Password updated successfully!");
      } else {
        Alert.alert("Success", "Password updated successfully!");
      }
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Failed to update password. Please check your current password.";
      setPasswordError(msg);
    } finally {
      setPasswordSaving(false);
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
    logout();
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (e) {
      console.warn("Clerk signOut failed:", e);
      router.replace("/(auth)/login");
    }
  };

  const handleLanguageSelect = (lang: AppLanguage) => {
    setLanguage(lang);
    setShowLangPicker(false);
  };

  const currentLangLabel = SUPPORTED_LANGUAGES.find(l => l.code === language)?.native || "English";

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

  const renderLanguageItem = ({ item }: { item: typeof SUPPORTED_LANGUAGES[0] }) => {
    const isSelected = item.code === language;
    return (
      <TouchableOpacity
        onPress={() => handleLanguageSelect(item.code)}
        style={[styles.langItem, isSelected && styles.langItemSelected]}
        activeOpacity={0.7}
      >
        <View style={styles.langItemLeft}>
          <Text style={[styles.langNative, isSelected && styles.langTextSelected]}>{item.native}</Text>
          <Text style={[styles.langLabel, isSelected && styles.langLabelSelected]}>{item.label}</Text>
        </View>
        {isSelected && <Check size={20} color={COLORS.primary} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("Profile & Settings")}</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Avatar seed={appUser?.fullName || userName} size={64} />
          
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
              <Text style={styles.profileName}>{appUser?.fullName || userName}</Text>
              <Text style={styles.profileEmail}>{appUser?.email || "No email linked"}</Text>
              <Text style={styles.profilePhone}>{appUser?.phone || "No phone linked"}</Text>
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

        {/* Security Section – Change Password */}
        <Text style={styles.sectionHeading}>{t("Security")}</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setShowPasswordForm(!showPasswordForm);
              setPasswordError("");
            }}
            style={[styles.settingsRow, !showPasswordForm && styles.lastRow]}
          >
            <View style={styles.settingsRowLeft}>
              <View style={styles.iconContainer}>
                <KeyRound size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.settingsLabel}>{t("Change Password")}</Text>
            </View>
            <ChevronRight
              size={18}
              color={COLORS.textMuted}
              style={showPasswordForm ? { transform: [{ rotate: "90deg" }] } : undefined}
            />
          </TouchableOpacity>

          {showPasswordForm && (
            <View style={styles.passwordForm}>
              {passwordError ? (
                <View style={styles.passwordErrorBox}>
                  <Text style={styles.passwordErrorText}>{passwordError}</Text>
                </View>
              ) : null}

              <View style={styles.passwordInputRow}>
                <Lock size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder={t("Current Password")}
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry={!showCurrentPwd}
                  style={styles.passwordInput}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowCurrentPwd(!showCurrentPwd)}>
                  {showCurrentPwd ? (
                    <EyeOff size={18} color={COLORS.textMuted} />
                  ) : (
                    <Eye size={18} color={COLORS.textMuted} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.passwordInputRow}>
                <Lock size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder={t("New Password")}
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry={!showNewPwd}
                  style={styles.passwordInput}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowNewPwd(!showNewPwd)}>
                  {showNewPwd ? (
                    <EyeOff size={18} color={COLORS.textMuted} />
                  ) : (
                    <Eye size={18} color={COLORS.textMuted} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.passwordInputRow}>
                <Lock size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder={t("Confirm Password")}
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry={!showNewPwd}
                  style={styles.passwordInput}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.passwordActions}>
                <TouchableOpacity
                  onPress={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                  }}
                  style={styles.passwordCancelBtn}
                >
                  <Text style={styles.passwordCancelText}>{t("Cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleChangePassword}
                  style={[styles.passwordSaveBtn, passwordSaving && { opacity: 0.7 }]}
                  disabled={passwordSaving}
                >
                  <Text style={styles.passwordSaveText}>
                    {passwordSaving ? t("Saving") : t("Save")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
            onPress={() => setToggles((prev) => ({ ...prev, push: !prev.push }))}
            style={[styles.settingsRow, styles.lastRow]}
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

          <TouchableOpacity activeOpacity={0.8} onPress={() => setShowLangPicker(true)} style={styles.settingsRow}>
            <View style={styles.settingsRowLeft}>
              <View style={styles.iconContainer}>
                <Globe size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.settingsLabel}>{t("Language")}</Text>
            </View>
            <View style={styles.settingsRowRight}>
              <Text style={styles.settingsHint}>{currentLangLabel}</Text>
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

      {/* Language Picker Modal */}
      <Modal
        visible={showLangPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLangPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("Select Language")}</Text>
              <TouchableOpacity onPress={() => setShowLangPicker(false)} style={styles.modalCloseBtn}>
                <X size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={SUPPORTED_LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={renderLanguageItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        </View>
      </Modal>
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

  // Password form styles
  passwordForm: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  passwordErrorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  passwordErrorText: {
    color: COLORS.destructive,
    fontSize: 13,
    fontWeight: "500",
  },
  passwordInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardAlt,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    height: 46,
  },
  passwordInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    height: 46,
  },
  passwordActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  passwordCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  passwordCancelText: {
    color: COLORS.textMuted,
    fontWeight: "600",
    fontSize: 13,
  },
  passwordSaveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  passwordSaveText: {
    color: "#12141a",
    fontWeight: "700",
    fontSize: 13,
  },

  // Logout & delete
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

  // Language picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "70%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  langItemSelected: {
    backgroundColor: theme === "dark" ? "rgba(205, 162, 80, 0.08)" : "rgba(205, 162, 80, 0.06)",
  },
  langItemLeft: {
    flexDirection: "column",
  },
  langNative: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  langLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  langTextSelected: {
    color: COLORS.primary,
  },
  langLabelSelected: {
    color: COLORS.primary,
  },
});
