import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Plus, ArrowUpRight, ArrowDownLeft, Gift } from "lucide-react-native";
import { COLORS, Button, GlassCard, SectionTitle, useStyles } from "../../components/ui-kit";
import { useApp } from "../../store/app";
import { walletPackages } from "../../src/lib/mock";
import { useWalletBalanceQuery, useWalletHistoryQuery, useWalletTopUpMutation, useWalletVerifyTopUpMutation } from "../../hooks/useApi";
import { Platform } from "react-native";

export default function WalletScreen() {
  const router = useRouter();
  const styles = useStyles(getStyles);
  const { data: walletBalance = 0, isLoading: loadingBalance, refetch: refetchBalance } = useWalletBalanceQuery();
  const { data: realTransactions = [], isLoading: loadingHistory, refetch: refetchHistory } = useWalletHistoryQuery();
  const topUpMutation = useWalletTopUpMutation();
  const verifyTopUpMutation = useWalletVerifyTopUpMutation();
  const [rechargeAmount, setRechargeAmount] = useState("");

  const handleAddMoney = async (amount: number) => {
    if (Platform.OS === "web") {
      // Real Razorpay Checkout flow
      try {
        // 1. Load Razorpay script dynamically
        const isLoaded = await new Promise<boolean>((resolve) => {
          if ((window as any).Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });

        if (!isLoaded) {
          alert("Failed to load Razorpay payment SDK. Please check your internet connection.");
          return;
        }

        // 2. Create order on backend (mock: false)
        const orderData = await topUpMutation.mutateAsync({ amount, mock: false });
        
        // 3. Open Razorpay checkout form
        const options = {
          key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_SrZjx0jgQ3fnmi", // User key
          amount: orderData.amount,
          currency: orderData.currency,
          name: "MyDesignGhar",
          description: "Wallet Top-Up",
          order_id: orderData.orderId,
          handler: async function (response: any) {
            try {
              // 4. Verify payment on backend
              await verifyTopUpMutation.mutateAsync({
                orderId: orderData.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                amount,
              });
              refetchBalance();
              refetchHistory();
              alert(`₹${amount} has been successfully credited to your wallet via Razorpay!`);
            } catch (err: any) {
              alert("Payment verification failed: " + (err.response?.data?.message || "Unknown error"));
            }
          },
          prefill: {
            name: "",
            email: "",
            contact: "",
          },
          theme: {
            color: "#8CC0EB",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err: any) {
        alert(err.response?.data?.message || "Failed to initiate Razorpay recharge.");
      }
      return;
    }

    // Native platforms (iOS/Android fallback) - direct them to Web for Razorpay
    Alert.alert("Razorpay Checkout", "Please use our web portal to securely complete Razorpay wallet recharges.");
  };

  const user = useApp((s) => s.user);
  const isConsultant = user?.role === "CONSULTANT";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{isConsultant ? "Earnings" : "Wallet"}</Text>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.heroGlow} />
          <Text style={styles.balanceLabel}>
            {isConsultant ? "Total earnings" : "Available balance"}
          </Text>
          {loadingBalance ? (
            <ActivityIndicator size="small" color={COLORS.text} style={{ marginVertical: 12, alignSelf: "flex-start" }} />
          ) : (
            <Text style={styles.balanceAmount}>₹{walletBalance.toLocaleString("en-IN")}</Text>
          )}
          {!isConsultant && (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, gap: 10 }}>
              <TextInput
                keyboardType="numeric"
                placeholder="Enter amount (e.g. 500)"
                placeholderTextColor={COLORS.textMuted}
                value={rechargeAmount}
                onChangeText={setRechargeAmount}
                style={{
                  backgroundColor: COLORS.cardAlt,
                  borderColor: COLORS.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  color: COLORS.text,
                  paddingHorizontal: 12,
                  height: 40,
                  flex: 1,
                  fontSize: 14,
                }}
              />
              <Button
                title="Add Money"
                size="sm"
                icon={<Plus size={14} color="#12141a" />}
                onPress={() => {
                  const amt = parseFloat(rechargeAmount);
                  if (isNaN(amt) || amt <= 0) {
                    Alert.alert("Invalid Amount", "Please enter a valid positive number.");
                    return;
                  }
                  handleAddMoney(amt);
                }}
                loading={topUpMutation.isPending}
              />
            </View>
          )}
        </View>

        {!isConsultant && (
          <>
            {/* Recharge Packages */}
            <SectionTitle>Recharge packages</SectionTitle>
            <View style={styles.packagesGrid}>
              {walletPackages.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  activeOpacity={0.8}
                  onPress={() => handleAddMoney(p.amount + p.bonus)}
                  style={styles.packageCard}
                >
                  <Text style={styles.packageAmt}>₹{p.amount}</Text>
                  {p.bonus > 0 ? (
                    <Text style={styles.packageBonus}>+₹{p.bonus} bonus</Text>
                  ) : (
                    <Text style={styles.packageStarter}>Starter</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Referral earnings banner card */}
            <GlassCard style={styles.referralCard}>
              <View style={styles.referralIconContainer}>
                <Gift size={20} color={COLORS.accent} />
              </View>
              <View style={styles.referralInfo}>
                <Text style={styles.referralTitle}>Referral earnings</Text>
                <Text style={styles.referralSubtitle}>Earn credits by inviting friends</Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/referral")}>
                <Text style={styles.referralLink}>Invite →</Text>
              </TouchableOpacity>
            </GlassCard>
          </>
        )}

        {/* Transactions list */}
        <SectionTitle>Transactions</SectionTitle>
        {loadingHistory ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
        ) : realTransactions.length === 0 ? (
          <Text style={{ color: COLORS.textMuted, fontSize: 13, textAlign: "center", marginVertical: 20 }}>
            No transactions yet.
          </Text>
        ) : (
          <View style={styles.transactionsList}>
            {realTransactions.map((t: any) => {
              const isCredit = t.type === "CREDIT" || t.type === "credit";
              return (
                <View key={t.id} style={styles.transactionItem}>
                  <View
                    style={[
                      styles.txIconContainer,
                      { backgroundColor: isCredit ? "rgba(16, 185, 129, 0.15)" : COLORS.cardAlt },
                    ]}
                  >
                    {isCredit ? (
                      <ArrowDownLeft size={20} color={COLORS.success} />
                    ) : (
                      <ArrowUpRight size={20} color={COLORS.textMuted} />
                    )}
                  </View>
                  
                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle}>{t.description || t.title}</Text>
                    <Text style={styles.txDate}>
                      {new Date(t.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.txAmount,
                      { color: isCredit ? COLORS.success : COLORS.text },
                    ]}
                  >
                    {isCredit ? "+" : "-"}₹{t.amount}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
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
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 16,
  },
  balanceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroGlow: {
    position: "absolute",
    right: -30,
    top: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accent,
    opacity: 0.1,
  },
  balanceLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 4,
  },
  addBtn: {
    marginTop: 16,
    alignSelf: "flex-start",
  },
  packagesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  packageCard: {
    width: "31%",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  packageAmt: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },
  packageBonus: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.success,
    marginTop: 2,
  },
  packageStarter: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  referralCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    padding: 14,
  },
  referralIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  referralInfo: {
    flex: 1,
    marginLeft: 12,
  },
  referralTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  referralSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  referralLink: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
  transactionsList: {
    gap: 10,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  txIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: {
    flex: 1,
    marginLeft: 12,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  txDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: "800",
  },
});
