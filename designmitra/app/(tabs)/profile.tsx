import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Clipboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { GradientButton } from "@/components/GradientButton";
import { AuthService, WalletService, NotificationService } from "../../lib/api/services";
import { useTranslation } from "../../lib/i18n";

const SETTING_SECTIONS = [
  {
    title: "Account",
    items: [
      { icon: "user", label: "Personal Details" },
      { icon: "bell", label: "Notifications" },
      { icon: "globe", label: "Language" },
      { icon: "credit-card", label: "Payment Methods" },
    ],
  },
  {
    title: "More",
    items: [
      { icon: "help-circle", label: "Help & Support" },
      { icon: "star", label: "Rate MyDesignGhar" },
      { icon: "info", label: "About" },
    ],
  },
];

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "as", label: "Assamese", native: "অসমীয়া" },
  { code: "mai", label: "Maithili", native: "मैथिली" },
  { code: "sa", label: "Sanskrit", native: "संस्कृतम्" },
  { code: "sat", label: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "ks", label: "Kashmiri", native: "कॉशुर" },
  { code: "ne", label: "Nepali", native: "नेपाली" },
  { code: "sd", label: "Sindhi", native: "سنڌि" },
  { code: "doi", label: "Dogri", native: "डोगरी" },
  { code: "kok", label: "Konkani", native: "कोंकणी" },
  { code: "mni", label: "Manipuri", native: "মৈতৈলোন্" },
  { code: "brx", label: "Bodo", native: "बड़ो" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, designs, logout, achievements, updateProfile } = useApp();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  // Edit Profile modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [editCity, setEditCity] = useState(user?.city || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Add Money modal state
  const [addMoneyVisible, setAddMoneyVisible] = useState(false);
  const [amount, setAmount] = useState("100");
  const [addingMoney, setAddingMoney] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Language & Rating modal states
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);

  // Notifications modal & list state
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Transactions modal & list state
  const [transactionsVisible, setTransactionsVisible] = useState(false);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 70);

  const purchased = designs.filter((d) => d.isPurchased).length;
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  function handleLogout() {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to logout?");
      if (confirmed) {
        logout().then(() => router.replace("/auth"));
      }
    } else {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: async () => {
          await logout();
          router.replace("/auth");
        } },
      ]);
    }
  }

  async function handleCopyReferral() {
    const code = user?.referralCode || "DM00000";
    if (Platform.OS === "web") {
      try {
        await navigator.clipboard.writeText(code);
      } catch (err) {
        console.warn("Failed to copy clipboard:", err);
      }
    } else {
      Clipboard.setString(code);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function fetchNotifications() {
    setLoadingNotifications(true);
    try {
      const res = await NotificationService.list();
      setNotificationsList(res.notifications || res || []);
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  }

  async function handleMarkAllNotificationsRead() {
    try {
      await NotificationService.markAllAsRead();
      setNotificationsList((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.warn("Failed to mark all as read:", err);
    }
  }

  async function handleMarkNotificationRead(id: string) {
    try {
      await NotificationService.markAsRead(id);
      setNotificationsList((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.warn("Failed to mark notification as read:", err);
    }
  }

  async function fetchTransactions() {
    setLoadingTransactions(true);
    try {
      const res = await WalletService.getHistory();
      setTransactionsList(res.transactions || res || []);
    } catch (err) {
      console.warn("Failed to fetch transactions:", err);
    } finally {
      setLoadingTransactions(false);
    }
  }

  function handleSettingPress(label: string) {
    if (label === "Personal Details") {
      setEditName(user?.name || "");
      setEditPhone(user?.phone || "");
      setEditCity(user?.city || "");
      setProfileError("");
      setEditModalVisible(true);
    } else if (label === "Language") {
      setLangModalVisible(true);
    } else if (label === "Notifications") {
      router.push("/notifications");
    } else if (label === "Payment Methods") {
      fetchTransactions();
      setTransactionsVisible(true);
    } else if (label === "Help & Support") {
      if (Platform.OS === "web") {
        window.open("https://mydesignghr.com", "_blank");
      } else {
        const WebBrowser = require("expo-web-browser");
        WebBrowser.openBrowserAsync("https://mydesignghr.com");
      }
    } else if (label === "Rate MyDesignGhar") {
      setSelectedRating(0);
      setRateModalVisible(true);
    } else if (label === "About") {
      if (Platform.OS === "web") {
        window.open("https://mydesignghr.com", "_blank");
      } else {
        const WebBrowser = require("expo-web-browser");
        WebBrowser.openBrowserAsync("https://mydesignghr.com");
      }
    }
  }

  async function handleSaveProfile() {
    if (!editName.trim()) {
      setProfileError("Name cannot be empty");
      return;
    }
    setUpdatingProfile(true);
    setProfileError("");
    try {
      await AuthService.updateProfile({
        fullName: editName.trim(),
        phone: editPhone.trim() || undefined,
        city: editCity.trim() || undefined,
      });

      updateProfile({
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        city: editCity.trim() || undefined,
      });

      setEditModalVisible(false);
      alert("Profile updated successfully!");
    } catch (err: any) {
      setProfileError(err?.response?.data?.message || err?.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  }

  function loadRazorpay(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handleAddMoney(type: "razorpay" | "mock") {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 100) {
      setPaymentError("Minimum amount is ₹100");
      return;
    }

    setAddingMoney(true);
    setPaymentError("");

    try {
      if (type === "mock") {
        const res = await WalletService.requestTopUp(amt, true);
        if (res?.wallet) {
          updateProfile({ walletBalance: res.wallet.balance });
        }
        setAddingMoney(false);
        setAddMoneyVisible(false);
        alert(`Mock Top-Up of ₹${amt} successful!`);
      } else {
        if (Platform.OS !== "web") {
          alert("Razorpay checkout is only supported on Web in development. Simulating payment...");
          const res = await WalletService.requestTopUp(amt, true);
          if (res?.wallet) {
            updateProfile({ walletBalance: res.wallet.balance });
          }
          setAddingMoney(false);
          setAddMoneyVisible(false);
          return;
        }

        const success = await loadRazorpay();
        if (!success) {
          setPaymentError("Failed to load Razorpay Checkout SDK. Try again.");
          setAddingMoney(false);
          return;
        }

        const orderData = await WalletService.requestTopUp(amt, false);
        const { orderId, amount: orderAmt, currency, key } = orderData;

        const options = {
          key: key || "rzp_live_SrZjx0jgQ3fnmi",
          amount: orderAmt,
          currency: currency || "INR",
          name: "MyDesignGhar",
          description: "Wallet Top-up",
          order_id: orderId,
          handler: async function (response: any) {
            try {
              setAddingMoney(true);
              await WalletService.verifyTopUp({
                orderId: orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                amount: amt,
              });
              
              const balanceRes = await WalletService.getBalance();
              if (balanceRes?.wallet) {
                updateProfile({ walletBalance: balanceRes.wallet.balance });
              }
              alert(`Payment Verified! ₹${amt} added successfully.`);
              setAddMoneyVisible(false);
            } catch (err: any) {
              alert(`Payment verification failed: ${err?.message || "Unknown error"}`);
            } finally {
              setAddingMoney(false);
            }
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: user?.phone || "",
          },
          theme: {
            color: colors.primary,
          },
          modal: {
            ondismiss: function () {
              setAddingMoney(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      setPaymentError(err?.response?.data?.message || err?.message || "Payment request failed");
      setAddingMoney(false);
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>{t("Profile")}</Text>
      </View>

      <View style={[styles.profileCard, { backgroundColor: colors.primary, marginHorizontal: 20 }]}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user?.name || "Your Name"}</Text>
            <Text style={styles.profileSub}>{user?.phone || user?.email || user?.city || t("Set up your profile")}</Text>
          </View>
          <Pressable
            onPress={() => {
              setEditName(user?.name || "");
              setEditPhone(user?.phone || "");
              setProfileError("");
              setEditModalVisible(true);
            }}
            style={styles.editBtn}
          >
            <Feather name="edit-2" size={18} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{designs.length}</Text>
            <Text style={styles.statLabel}>{t("Designs")}</Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{purchased}</Text>
            <Text style={styles.statLabel}>{t("Purchased")}</Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{achievements.length}</Text>
            <Text style={styles.statLabel}>{t("Badges")}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.walletCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 20, borderRadius: colors.radius }]}>
        <View style={styles.walletRow}>
          <View>
            <Text style={[styles.walletLabel, { color: colors.mutedForeground }]}>{t("Wallet Balance")}</Text>
            <Text style={[styles.walletAmt, { color: colors.foreground }]}>₹{user?.walletBalance ?? 0}</Text>
          </View>
          <Pressable
            onPress={() => {
              setAmount("100");
              setPaymentError("");
              setAddMoneyVisible(true);
            }}
            style={[styles.addMoneyBtn, { backgroundColor: colors.primary, borderRadius: colors.radius - 4 }]}
          >
            <Text style={styles.addMoneyText}>{t("Add Money")}</Text>
          </Pressable>
        </View>
      </View>

      {achievements.length > 0 && (
        <View style={[styles.section, { marginHorizontal: 20 }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("Achievements")}</Text>
          <View style={styles.badgeRow}>
            {achievements.map((badge) => (
              <View key={badge} style={[styles.badge, { backgroundColor: colors.accent + "22", borderColor: colors.accent, borderRadius: 8 }]}>
                <Ionicons name="trophy" size={16} color={colors.accent} />
                <Text style={[styles.badgeText, { color: colors.foreground }]}>{badge}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={[styles.referralCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 20, borderRadius: colors.radius }]}>
        <Text style={[styles.referralTitle, { color: colors.foreground }]}>{t("Refer & Earn")}</Text>
        <Text style={[styles.referralSub, { color: colors.mutedForeground }]}>{t("Share your code and earn ₹100 per referral")}</Text>
        <View style={styles.referralCodeRow}>
          <Text style={[styles.referralCode, { color: colors.primary, backgroundColor: colors.primary + "15", borderRadius: 8 }]}>
            {user?.referralCode || "DM00000"}
          </Text>
          <Pressable
            onPress={handleCopyReferral}
            style={[styles.copyBtn, { backgroundColor: colors.primary + "15", borderRadius: 8 }]}
          >
            <Feather name={copied ? "check" : "copy"} size={16} color={colors.primary} />
            <Text style={[styles.copyText, { color: colors.primary }]}>{copied ? t("Copied!") : t("Copy")}</Text>
          </Pressable>
        </View>
      </View>

      {SETTING_SECTIONS.map((section) => (
        <View key={section.title} style={[styles.section, { marginHorizontal: 20 }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t(section.title)}</Text>
          <View style={[styles.settingGroup, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            {section.items.map((item, i) => (
              <Pressable
                key={item.label}
                onPress={() => handleSettingPress(item.label)}
                style={({ pressed }) => [
                  styles.settingItem,
                  { borderBottomColor: colors.border, borderBottomWidth: i < section.items.length - 1 ? 1 : 0 },
                  pressed && { backgroundColor: colors.muted },
                ]}
              >
                <View style={[styles.settingIcon, { backgroundColor: colors.muted }]}>
                  <Feather name={item.icon as any} size={18} color={colors.foreground} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>{t(item.label)}</Text>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <Pressable
        onPress={handleLogout}
        style={[styles.logoutBtn, { borderColor: colors.destructive, borderRadius: colors.radius, marginHorizontal: 20 }]}
      >
        <Feather name="log-out" size={18} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>{t("Logout")}</Text>
      </Pressable>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>{t("Edit Profile")}</Text>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <Feather name="x" size={24} color={colors.foreground} />
              </Pressable>
            </View>

            {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}

            <Text style={[styles.modalLabel, { color: colors.foreground }]}>{t("Full Name")}</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder={t("Full Name")}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.modalInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card, borderRadius: colors.radius - 4 }]}
            />

            <Text style={[styles.modalLabel, { color: colors.foreground, marginTop: 16 }]}>{t("Phone Number")}</Text>
            <TextInput
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="e.g. +919999999999"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              style={[styles.modalInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card, borderRadius: colors.radius - 4 }]}
            />

            <Text style={[styles.modalLabel, { color: colors.foreground, marginTop: 16 }]}>{t("City")}</Text>
            <TextInput
              value={editCity}
              onChangeText={setEditCity}
              placeholder="e.g. Mumbai"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.modalInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card, borderRadius: colors.radius - 4 }]}
            />

            <GradientButton
              label={updatingProfile ? t("Saving...") : t("Save Changes")}
              onPress={handleSaveProfile}
              loading={updatingProfile}
              style={{ marginTop: 24 }}
            />
          </View>
        </View>
      </Modal>

      {/* Add Money Modal */}
      <Modal
        visible={addMoneyVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddMoneyVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>{t("Add Money")}</Text>
              <Pressable onPress={() => setAddMoneyVisible(false)}>
                <Feather name="x" size={24} color={colors.foreground} />
              </Pressable>
            </View>

            {paymentError ? <Text style={styles.errorText}>{paymentError}</Text> : null}

            <Text style={[styles.modalLabel, { color: colors.foreground }]}>{t("Enter Amount (₹)")}</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
              placeholder={t("Minimum 100")}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.modalInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card, borderRadius: colors.radius - 4 }]}
            />

            <View style={styles.quickAmtRow}>
              {["100", "200", "500"].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  onPress={() => setAmount(amt)}
                  style={[styles.quickAmtBtn, { borderColor: amount === amt ? colors.primary : colors.border, backgroundColor: colors.card, borderRadius: colors.radius - 4 }]}
                >
                  <Text style={[styles.quickAmtText, { color: amount === amt ? colors.primary : colors.foreground }]}>+ ₹{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <GradientButton
              label={addingMoney ? t("Processing...") : `${t("Add")} ₹${amount}`}
              onPress={() => handleAddMoney("razorpay")}
              loading={addingMoney}
              style={{ marginTop: 24 }}
            />

            <TouchableOpacity
              onPress={() => handleAddMoney("mock")}
              disabled={addingMoney}
              style={{ marginTop: 16, alignItems: "center", padding: 12 }}
            >
              <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 14 }}>{t("Mock Recharge (Test Mode)")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={langModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>{t("Select Language")}</Text>
              <Pressable onPress={() => setLangModalVisible(false)}>
                <Feather name="x" size={24} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {SUPPORTED_LANGUAGES.map((langItem) => (
                <TouchableOpacity
                  key={langItem.code}
                  onPress={() => {
                    updateProfile({ language: langItem.code as any });
                    setLangModalVisible(false);
                    alert(`Language preference updated to ${langItem.native} (${langItem.label})`);
                  }}
                  style={[
                    styles.langBtn,
                    {
                      borderColor: user?.language === langItem.code ? colors.primary : colors.border,
                      backgroundColor: colors.card,
                      borderRadius: colors.radius - 4,
                    },
                  ]}
                >
                  <View style={{ flexDirection: "column" }}>
                    <Text style={[styles.langText, { color: user?.language === langItem.code ? colors.primary : colors.foreground }]}>
                      {langItem.native}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                      {langItem.label}
                    </Text>
                  </View>
                  {user?.language === langItem.code && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Rate DesignMitra Modal */}
      <Modal
        visible={rateModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>{t("Rate MyDesignGhar")}</Text>
              <Pressable onPress={() => setRateModalVisible(false)}>
                <Feather name="x" size={24} color={colors.foreground} />
              </Pressable>
            </View>

            <Text style={[styles.modalSub, { color: colors.mutedForeground, textAlign: "center", marginBottom: 20 }]}>
              {t("How has your experience been with our AI designs?")}
            </Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setSelectedRating(star)}
                  style={{ padding: 4 }}
                >
                  <Ionicons
                    name={star <= selectedRating ? "star" : "star-outline"}
                    size={36}
                    color={star <= selectedRating ? colors.accent : colors.mutedForeground}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <GradientButton
              label={t("Submit Rating")}
              onPress={() => {
                if (selectedRating === 0) {
                  alert(t("Please select a rating before submitting!"));
                  return;
                }
                setRateModalVisible(false);
                alert(`${t("Thank you for rating us")} ${selectedRating} ${t("stars!")} ❤️`);
              }}
              style={{ marginTop: 24 }}
            />
          </View>
        </View>
      </Modal>

      {/* Notifications Modal (Backend Data) */}
      <Modal
        visible={notificationsVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius, maxHeight: "80%" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>{t("Notifications")}</Text>
              <Pressable onPress={() => setNotificationsVisible(false)}>
                <Feather name="x" size={24} color={colors.foreground} />
              </Pressable>
            </View>

            {loadingNotifications ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
            ) : (
              <>
                {notificationsList.length > 0 && (
                  <TouchableOpacity
                    onPress={handleMarkAllNotificationsRead}
                    style={{ alignSelf: "flex-end", marginBottom: 12 }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>Mark all as read</Text>
                  </TouchableOpacity>
                )}

                <ScrollView showsVerticalScrollIndicator={false}>
                  {notificationsList.length === 0 ? (
                    <Text style={[styles.noItemsText, { color: colors.mutedForeground }]}>No notifications yet</Text>
                  ) : (
                    notificationsList.map((n) => (
                      <TouchableOpacity
                        key={n.id}
                        onPress={() => !n.isRead && handleMarkNotificationRead(n.id)}
                        style={[
                          styles.notificationItem,
                          {
                            borderColor: colors.border,
                            backgroundColor: n.isRead ? colors.card : colors.primary + "06",
                          },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            {!n.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                            <Text style={[styles.notificationTitle, { color: colors.foreground, fontWeight: n.isRead ? "600" : "700" }]}>
                              {n.title}
                            </Text>
                          </View>
                          <Text style={[styles.notificationBody, { color: colors.mutedForeground }]}>{n.body}</Text>
                          <Text style={[styles.notificationTime, { color: colors.mutedForeground }]}>
                            {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Payment History / Wallet Transactions Modal (Backend Data) */}
      <Modal
        visible={transactionsVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTransactionsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius, maxHeight: "80%" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Payment History</Text>
              <Pressable onPress={() => setTransactionsVisible(false)}>
                <Feather name="x" size={24} color={colors.foreground} />
              </Pressable>
            </View>

            <View style={styles.walletStatusBlock}>
              <Text style={{ color: colors.mutedForeground, fontSize: 13, fontFamily: "Inter_400Regular" }}>Current Wallet Balance</Text>
              <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "900", fontFamily: "Inter_700Bold", marginTop: 4 }}>
                ₹{user?.walletBalance ?? 0}
              </Text>
            </View>

            {loadingTransactions ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
                {transactionsList.length === 0 ? (
                  <Text style={[styles.noItemsText, { color: colors.mutedForeground }]}>No transactions recorded</Text>
                ) : (
                  transactionsList.map((t) => {
                    const isCredit = t.type === "CREDIT";
                    return (
                      <View
                        key={t.id}
                        style={[styles.transactionItem, { borderColor: colors.border, backgroundColor: colors.card }]}
                      >
                        <View style={{ flex: 1, gap: 4 }}>
                          <Text style={[styles.transactionDesc, { color: colors.foreground }]}>{t.description}</Text>
                          <Text style={[styles.transactionCategory, { color: colors.primary, backgroundColor: colors.primary + "12" }]}>
                            {t.category}
                          </Text>
                          <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                            {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </Text>
                        </View>
                        <Text style={[styles.transactionAmount, { color: isCredit ? "#4CAF50" : "#F44336" }]}>
                          {isCredit ? "+" : "-"} ₹{t.amount}
                        </Text>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            )}

            <View style={styles.securedRowBlock}>
              <Ionicons name="lock-closed" size={13} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_400Regular" }}>
                Secured via Razorpay Checkout
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", fontFamily: "Inter_700Bold" },
  profileCard: { borderRadius: 16, padding: 20, marginBottom: 14 },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 22, fontWeight: "800", fontFamily: "Inter_700Bold" },
  profileName: { color: "#fff", fontSize: 20, fontWeight: "800", fontFamily: "Inter_700Bold" },
  profileSub: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2, fontFamily: "Inter_400Regular" },
  editBtn: { padding: 10, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20 },
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  stat: { alignItems: "center", gap: 2 },
  statNum: { color: "#fff", fontSize: 20, fontWeight: "800", fontFamily: "Inter_700Bold" },
  statLabel: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "Inter_400Regular" },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.3)", height: 30 },
  walletCard: { borderWidth: 1, padding: 16, marginBottom: 14 },
  walletRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  walletLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  walletAmt: { fontSize: 22, fontWeight: "800", fontFamily: "Inter_700Bold", marginTop: 2 },
  addMoneyBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  addMoneyText: { color: "#fff", fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 10 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  badgeText: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },
  referralCard: { borderWidth: 1, padding: 16, marginBottom: 14 },
  referralTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 4 },
  referralSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 14 },
  referralCodeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  referralCode: { flex: 1, paddingVertical: 10, paddingHorizontal: 14, fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center" },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10 },
  copyText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  settingGroup: { borderWidth: 1, overflow: "hidden" },
  settingItem: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  settingLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1.5, paddingVertical: 14, marginBottom: 24 },
  logoutText: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  
  // Modals Styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { width: "100%", maxWidth: 400, borderRadius: 16, padding: 24, borderWidth: 1, elevation: 5 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "800", fontFamily: "Inter_700Bold" },
  modalLabel: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  modalInput: { height: 50, borderWidth: 1, paddingHorizontal: 16, fontSize: 15, fontFamily: "Inter_400Regular", marginBottom: 12 },
  errorText: { color: "#ff4444", fontSize: 13, marginBottom: 14, fontFamily: "Inter_400Regular" },
  quickAmtRow: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginVertical: 8 },
  quickAmtBtn: { flex: 1, paddingVertical: 10, borderWidth: 1, alignItems: "center" },
  quickAmtText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  langBtn: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderWidth: 1.5, marginBottom: 12 },
  langText: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  modalSub: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  starsRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginVertical: 16 },
  noItemsText: { textAlign: "center", paddingVertical: 40, fontSize: 15, fontFamily: "Inter_400Regular" },
  notificationItem: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notificationTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  notificationBody: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 18 },
  notificationTime: { fontSize: 11, marginTop: 8 },
  walletStatusBlock: { padding: 20, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.03)", alignItems: "center", marginBottom: 16 },
  transactionItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderWidth: 1, borderRadius: 12, marginBottom: 10 },
  transactionDesc: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  transactionCategory: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 11, fontWeight: "700" },
  transactionAmount: { fontSize: 16, fontWeight: "800", fontFamily: "Inter_700Bold" },
  securedRowBlock: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 20 },
});
