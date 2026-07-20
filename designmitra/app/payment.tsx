import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/GradientButton";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { WalletService, ReferralService } from "../lib/api/services";
import { useTranslation } from "../lib/i18n";

const PAYMENT_METHODS = [
  // { id: "upi", label: "UPI", sub: "Google Pay, PhonePe, Paytm", icon: "zap" as const },
  { id: "app_wallet", label: "App Wallet", sub: "Pay using your MyDesignGhar wallet balance", icon: "smartphone" as const },
];

const BENEFITS = [
  "High-resolution image (4K, no watermark)",
  "Full shopping list with buy links",
  "Room-wise budget breakdown",
  "DIY implementation guide",
];

export default function PaymentScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { designId } = useLocalSearchParams<{ designId: string }>();
  const { user, designs, purchaseDesign, updateProfile } = useApp();
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(false);

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [verifyingCoupon, setVerifyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);

  const design = designs.find((d) => d.id === designId) || designs[0];

  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      setCouponError(t("Please enter a coupon code"));
      return;
    }
    setVerifyingCoupon(true);
    setCouponError(null);
    try {
      const res = await ReferralService.verifyCoupon(couponCode.trim());
      if (res.valid) {
        setAppliedCoupon(couponCode.trim());
        setReferrerName(res.referrerName);
        setSelectedMethod("coupon"); // Select coupon method automatically
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setCouponError(res.message || t("Invalid coupon code"));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || err.message || t("Invalid coupon code"));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setVerifyingCoupon(false);
    }
  }

  async function handlePay() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      if (appliedCoupon) {
        if (designId) {
          await ReferralService.useCoupon(designId, appliedCoupon);
          purchaseDesign(designId);
        }
      } else if (selectedMethod === "app_wallet") {
        const currentBal = user?.walletBalance ?? 0;
        if (currentBal < 299) {
          Alert.alert(t("Insufficient Balance"), t("Please add money to your wallet from the profile screen before checking out."));
          setLoading(false);
          return;
        }

        if (designId) {
          await WalletService.purchaseImages([designId]);
          purchaseDesign(designId);
          updateProfile({ walletBalance: currentBal - 299 });
        }
      } else {
        // Direct UPI payment
        await new Promise((r) => setTimeout(r, 2000));
        if (designId) purchaseDesign(designId);
      }
      router.replace({ pathname: "/success", params: { designId } });
    } catch (err: any) {
      Alert.alert(t("Payment Failed"), t(err.response?.data?.message || "Payment failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t("Unlock Design")}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 90 }]} showsVerticalScrollIndicator={false}>
        {design && (
          <View style={[styles.designCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Image source={{ uri: design.imageUri }} style={[styles.designThumb, { borderRadius: colors.radius - 2 }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.designName, { color: colors.foreground }]}>{t(design.styleName)}</Text>
              <Text style={[styles.designRoom, { color: colors.mutedForeground }]}>{t(design.roomType)}</Text>
            </View>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("What You'll Get")}</Text>
        <View style={[styles.benefitsCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          {BENEFITS.map((b, i) => (
            <View key={i} style={[styles.benefitItem, { borderBottomColor: colors.border, borderBottomWidth: i < BENEFITS.length - 1 ? 1 : 0 }]}>
              <View style={[styles.checkCircle, { backgroundColor: colors.success }]}>
                <Feather name="check" size={12} color="#fff" />
              </View>
              <Text style={[styles.benefitText, { color: colors.foreground }]}>{t(b)}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 20 }]}>{t("Use Referral Coupon")}</Text>
        <View style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: colors.radius,
          padding: 14,
          gap: 12,
          marginBottom: 20,
        }}>
          {appliedCoupon ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.success + "15", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" }}>
                  {t("Referral Coupon Applied!")}
                </Text>
                <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 }}>
                  {t("Referred by")}: {referrerName} (100% Free)
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  setAppliedCoupon(null);
                  setReferrerName(null);
                  setSelectedMethod("");
                  setCouponCode("");
                }}
                style={{ padding: 4 }}
              >
                <Feather name="trash-2" size={18} color={colors.destructive} />
              </Pressable>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TextInput
                  value={couponCode}
                  onChangeText={setCouponCode}
                  placeholder={t("Enter referral code (e.g. MDG-ABCDEF)")}
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="characters"
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    fontSize: 14,
                    color: colors.foreground,
                    backgroundColor: colors.background,
                    fontFamily: "Inter_400Regular",
                  }}
                />
                <Pressable
                  disabled={verifyingCoupon}
                  onPress={handleApplyCoupon}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 80,
                  }}
                >
                  {verifyingCoupon ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13, fontFamily: "Inter_600SemiBold" }}>
                      {t("Apply")}
                    </Text>
                  )}
                </Pressable>
              </View>
              {couponError && (
                <Text style={{ fontSize: 12, color: colors.destructive, fontFamily: "Inter_400Regular" }}>
                  {couponError}
                </Text>
              )}
            </>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("Payment Method")}</Text>
        <View style={styles.methodList}>
          {PAYMENT_METHODS.map((m) => (
            <Pressable
              key={m.id}
              disabled={!!appliedCoupon}
              onPress={() => setSelectedMethod(m.id)}
              style={[
                styles.methodCard,
                {
                  borderColor: selectedMethod === m.id ? colors.primary : colors.border,
                  backgroundColor: selectedMethod === m.id ? colors.primary + "08" : colors.card,
                  borderWidth: selectedMethod === m.id ? 2 : 1,
                  borderRadius: colors.radius,
                  opacity: appliedCoupon ? 0.5 : 1,
                },
              ]}
            >
              <View style={[styles.methodIcon, { backgroundColor: selectedMethod === m.id ? colors.primary + "18" : colors.muted }]}>
                <Feather name={m.icon} size={20} color={selectedMethod === m.id ? colors.primary : colors.foreground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.methodLabel, { color: colors.foreground }]}>{t(m.label)}</Text>
                <Text style={[styles.methodSub, { color: colors.mutedForeground }]}>
                  {m.id === "app_wallet" ? `${t("Pay using your DesignMitra wallet balance")} (${t("Balance")}: ₹${user?.walletBalance ?? 0})` : t(m.sub)}
                </Text>
              </View>
              {selectedMethod === m.id && (
                <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <View style={styles.priceRow}>
          <View>
            <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>₹599</Text>
            <Text style={[styles.price, { color: colors.foreground }]}>{appliedCoupon ? "₹0" : "₹299"}</Text>
          </View>
          <View style={[styles.saveBadge, { backgroundColor: colors.success + "20" }]}>
            <Text style={[styles.saveText, { color: colors.success }]}>{appliedCoupon ? t("100% OFF") : t("Save 50%")}</Text>
          </View>
        </View>
        <GradientButton
          label={loading ? t("Processing...") : (appliedCoupon ? t("Unlock Free Design") : t("Pay ₹299"))}
          onPress={handlePay}
          loading={loading}
          disabled={!selectedMethod}
          style={{ width: "100%" }}
        />
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 16, justifyContent: "space-between" },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  scroll: { paddingHorizontal: 20 },
  designCard: { flexDirection: "row", borderWidth: 1, padding: 14, gap: 14, alignItems: "center", marginBottom: 20 },
  designThumb: { width: 72, height: 72 },
  designName: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 4 },
  designRoom: { fontSize: 13, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 12 },
  benefitsCard: { borderWidth: 1, overflow: "hidden", marginBottom: 4 },
  benefitItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  checkCircle: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  benefitText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  methodList: { gap: 10 },
  methodCard: { flexDirection: "row", alignItems: "center", padding: 14, gap: 14 },
  methodIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  methodLabel: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  methodSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  footer: { padding: 16, borderTopWidth: 1, gap: 10 },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  originalPrice: { fontSize: 14, textDecorationLine: "line-through", fontFamily: "Inter_400Regular" },
  price: { fontSize: 26, fontWeight: "900", fontFamily: "Inter_700Bold" },
  saveBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  saveText: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  securedRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  securedText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
