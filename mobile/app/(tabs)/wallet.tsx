import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";
import { Plus, ArrowUpRight, ArrowDownLeft, Gift } from "lucide-react-native";
import { COLORS, Button, GlassCard, SectionTitle, useStyles, useTranslation } from "../../components/ui-kit";
import { useApp } from "../../store/app";
import { walletPackages } from "../../src/lib/mock";
import { useWalletBalanceQuery, useWalletHistoryQuery, useWalletTopUpMutation, useWalletVerifyTopUpMutation } from "../../hooks/useApi";
import { Platform } from "react-native";

export default function WalletScreen() {
  const router = useRouter();
  const styles = useStyles(getStyles);
  const t = useTranslation();
  const { data: walletBalance = 0, isLoading: loadingBalance, refetch: refetchBalance } = useWalletBalanceQuery();
  const { data: realTransactions = [], isLoading: loadingHistory, refetch: refetchHistory } = useWalletHistoryQuery();
  const topUpMutation = useWalletTopUpMutation();
  const verifyTopUpMutation = useWalletVerifyTopUpMutation();
  const [rechargeAmount, setRechargeAmount] = useState("");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentHtml, setPaymentHtml] = useState("");
  const [pendingAmount, setPendingAmount] = useState<number>(0);

  const handleWebViewMessage = async (event: any) => {
    try {
      const response = JSON.parse(event.nativeEvent.data);
      setShowPaymentModal(false);

      if (response.status === "success") {
        const { razorpay_payment_id, razorpay_signature, razorpay_order_id } = response.data;
        // Verify payment on backend
        await verifyTopUpMutation.mutateAsync({
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          amount: pendingAmount,
        });
        refetchBalance();
        refetchHistory();
        Alert.alert("Success", `₹${pendingAmount} has been successfully credited to your wallet via Razorpay!`);
      } else if (response.status === "failed") {
        Alert.alert("Payment Failed", response.error?.description || "Payment failed or was declined.");
      } else if (response.status === "cancelled") {
        Alert.alert("Payment Cancelled", "You cancelled the payment transaction.");
      }
    } catch (err: any) {
      console.error("Payment handle error:", err);
      Alert.alert("Error", "Could not complete payment verification.");
    }
  };

  const handleAddMoney = async (amount: number) => {
    try {
      // 1. Create order on backend (mock: false)
      const orderData = await topUpMutation.mutateAsync({ amount, mock: false });
      
      // Check if it was a mock top-up (backend returned wallet balance directly because of placeholder keys)
      if (orderData.wallet) {
        refetchBalance();
        refetchHistory();
        Alert.alert("Mock Recharge", `₹${amount} has been successfully credited to your mock wallet balance!`);
        return;
      }

      if (Platform.OS === "web") {
        // Real Razorpay Checkout flow
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

        // Open Razorpay checkout form on Web
        const options = {
          key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_SrZjx0jgQ3fnmi",
          amount: orderData.amount,
          currency: orderData.currency,
          name: "MyDezineGhar",
          description: "Wallet Top-Up",
          order_id: orderData.orderId,
          handler: async function (response: any) {
            try {
              // Verify payment on backend
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
            name: user?.fullName || "",
            email: user?.email || "",
            contact: user?.phone || "",
          },
          theme: {
            color: "#8CC0EB",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      }

      // Native Razorpay Checkout flow (using WebView)
      setPendingAmount(amount);
      const apiKey = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_SrZjx0jgQ3fnmi";
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
          <style>
            body {
              background-color: #12141a;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              font-family: sans-serif;
              color: #ffffff;
            }
            .loader {
              text-align: center;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          <div class="loader">
            <h3>Connecting to Razorpay...</h3>
            <p>Please complete your payment in the checkout window.</p>
          </div>
          <script>
            var options = {
              "key": "${apiKey}",
              "amount": ${orderData.amount},
              "currency": "${orderData.currency}",
              "name": "MyDezineGhar",
              "description": "Wallet Top-Up",
              "order_id": "${orderData.orderId}",
              "handler": function (response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  status: 'success',
                  data: {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    razorpay_order_id: response.razorpay_order_id || '${orderData.orderId}'
                  }
                }));
              },
              "prefill": {
                "name": "${user?.fullName || ''}",
                "email": "${user?.email || ''}",
                "contact": "${user?.phone || ''}"
              },
              "theme": {
                "color": "#8CC0EB"
              },
              "modal": {
                "ondismiss": function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    status: 'cancelled'
                  }));
                }
              }
            };
            var rzp = new Razorpay(options);
            rzp.on('payment.failed', function (response){
              window.ReactNativeWebView.postMessage(JSON.stringify({
                status: 'failed',
                error: response.error
              }));
            });
            rzp.open();
          </script>
        </body>
        </html>
      `;
      
      setPaymentHtml(html);
      setShowPaymentModal(true);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to initiate Razorpay recharge.";
      if (Platform.OS === "web") {
        alert(errorMsg);
      } else {
        Alert.alert("Recharge Failed", errorMsg);
      }
    }
  };

  const user = useApp((s) => s.user);
  const isConsultant = user?.role === "CONSULTANT";

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{isConsultant ? t("Earnings") : t("Wallet")}</Text>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.heroGlow} />
          <Text style={styles.balanceLabel}>
            {isConsultant ? t("Total earnings") : t("Available balance")}
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
                placeholder={t("Enter amount (e.g. 500)")}
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
                title={t("Add Money")}
                size="sm"
                icon={<Plus size={14} color="#12141a" />}
                onPress={() => {
                  const amt = parseFloat(rechargeAmount);
                  if (isNaN(amt) || amt <= 0) {
                    Alert.alert(t("Error") || "Error", t("Please enter a valid positive number.") || "Please enter a valid positive number.");
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
            <SectionTitle>{t("Recharge packages")}</SectionTitle>
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
                    <Text style={styles.packageBonus}>+₹{p.bonus} {t("bonus")}</Text>
                  ) : (
                    <Text style={styles.packageStarter}>{t("Starter")}</Text>
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
                <Text style={styles.referralTitle}>{t("Referral earnings")}</Text>
                <Text style={styles.referralSubtitle}>{t("Earn credits by inviting friends")}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/referral")}>
                <Text style={styles.referralLink}>{t("Invite")} →</Text>
              </TouchableOpacity>
            </GlassCard>
          </>
        )}

        {/* Transactions list */}
        <SectionTitle>{t("Transactions")}</SectionTitle>
        {loadingHistory ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
        ) : realTransactions.length === 0 ? (
          <Text style={{ color: COLORS.textMuted, fontSize: 13, textAlign: "center", marginVertical: 20 }}>
            {t("No transactions yet.")}
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

      {/* Razorpay WebView Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={["top", "bottom", "left", "right"]}>
          <View style={{
            height: 56,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
            backgroundColor: COLORS.card
          }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.text }}>Razorpay Payment</Text>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <Text style={{ color: COLORS.destructive, fontWeight: "700" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{ html: paymentHtml }}
            onMessage={handleWebViewMessage}
            style={{ flex: 1 }}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={["*"]}
          />
        </SafeAreaView>
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
    paddingBottom: 100,
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
