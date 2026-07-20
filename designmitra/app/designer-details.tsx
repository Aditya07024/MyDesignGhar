import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "../lib/i18n";
import { useApp } from "../context/AppContext";
import { ConsultantService, WalletService } from "../lib/api/services";
import { WebView } from "react-native-webview";

export default function DesignerDetailsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, updateProfile } = useApp();

  const [loading, setLoading] = useState(true);
  const [designer, setDesigner] = useState<any>(null);
  
  // Date and slot selection state
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [showPaymentOptionsModal, setShowPaymentOptionsModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"WALLET" | "RAZORPAY">("RAZORPAY");
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [paymentHtml, setPaymentHtml] = useState("");
  const [pendingOrderId, setPendingOrderId] = useState("");
  const [pendingBookingId, setPendingBookingId] = useState("");

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

  async function fetchDesignerDetails() {
    if (!id) return;
    try {
      const res = await ConsultantService.getById(id);
      setDesigner(res.consultant);
      
      // Auto-select first date if available
      if (res.consultant.availability && res.consultant.availability.length > 0) {
        const slotsByDate: Record<string, any[]> = {};
        res.consultant.availability.forEach((slot: any) => {
          const dateStr = new Date(slot.date).toDateString();
          if (!slotsByDate[dateStr]) {
            slotsByDate[dateStr] = [];
          }
          slotsByDate[dateStr].push(slot);
        });
        const dates = Object.keys(slotsByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        if (dates.length > 0) {
          setSelectedDateStr(dates[0]);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch designer details:", err);
      Alert.alert(t("Error"), t("Failed to load designer details"));
    } finally {
      setLoading(false);
    }
  }

  async function refreshWalletBalance() {
    try {
      const res = await WalletService.getBalance();
      updateProfile({ walletBalance: res.wallet.balance });
    } catch (err) {
      console.warn("Failed to refresh wallet balance:", err);
    }
  }

  useEffect(() => {
    fetchDesignerDetails();
    refreshWalletBalance();
  }, [id]);

  function getAvatarSource(avatarUrl: string) {
    if (!avatarUrl) {
      return { uri: "https://api.dicebear.com/7.x/adventurer/svg?seed=fallback" };
    }
    switch (avatarUrl) {
      case "priya":
        return { uri: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" };
      case "rohan":
        return { uri: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80" };
      case "ananya":
        return { uri: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80" };
      case "vikram":
        return { uri: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80" };
      default:
        if (avatarUrl.startsWith("http")) {
          return { uri: avatarUrl };
        }
        return { uri: `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarUrl}` };
    }
  }

  // Parse availability into date objects
  const slotsByDate: Record<string, any[]> = {};
  if (designer && designer.availability) {
    designer.availability.forEach((slot: any) => {
      const dateStr = new Date(slot.date).toDateString();
      if (!slotsByDate[dateStr]) {
        slotsByDate[dateStr] = [];
      }
      slotsByDate[dateStr].push(slot);
    });
  }

  const dates = Object.keys(slotsByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const activeSlots = selectedDateStr ? slotsByDate[selectedDateStr] : [];

  async function handleBookSession() {
    if (!selectedSlotId || !designer) return;
    
    // Auto-select wallet if they have enough balance, otherwise default to razorpay
    const walletBalance = user?.walletBalance ?? 0;
    if (walletBalance >= designer.price) {
      setSelectedPaymentMethod("WALLET");
    } else {
      setSelectedPaymentMethod("RAZORPAY");
    }
    
    setShowPaymentOptionsModal(true);
  }

  async function handleProceedPayment() {
    if (selectedPaymentMethod === "WALLET") {
      await handleWalletPayment();
    } else {
      await handleRazorpayPayment();
    }
  }

  async function handleWalletPayment() {
    if (!selectedSlotId || !designer) return;
    
    const walletBalance = user?.walletBalance ?? 0;
    if (walletBalance < designer.price) {
      Alert.alert(
        t("Insufficient Balance"),
        t("Wallet Balance insufficient, please add money or pay using Card/UPI"),
        [
          { text: t("Cancel"), style: "cancel" },
          { text: t("Add Money"), onPress: () => {
              setShowPaymentOptionsModal(false);
              router.push("/(tabs)/profile");
            }
          }
        ]
      );
      return;
    }

    setBookingInProgress(true);
    try {
      const res = await ConsultantService.createBooking({
        consultantId: designer.id,
        availabilityId: selectedSlotId,
        paymentMethod: "WALLET"
      });
      
      // Update wallet balance state locally
      updateProfile({ walletBalance: walletBalance - designer.price });
      setShowPaymentOptionsModal(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to book session";
      Alert.alert(t("Booking Failed"), t(msg));
    } finally {
      setBookingInProgress(false);
    }
  }

  async function handleRazorpayPayment() {
    if (!selectedSlotId || !designer) return;

    setBookingInProgress(true);
    try {
      // 1. Create booking with PENDING status and get Razorpay order
      const orderData = await ConsultantService.createBooking({
        consultantId: designer.id,
        availabilityId: selectedSlotId,
        paymentMethod: "RAZORPAY"
      });

      const { orderId, amount, currency, bookingId } = orderData;
      setPendingOrderId(orderId);
      setPendingBookingId(bookingId);

      const apiKey = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_SrZjx0jgQ3fnmi";

      if (Platform.OS === "web") {
        const success = await loadRazorpay();
        if (!success) {
          Alert.alert(t("Error"), t("Failed to load Razorpay SDK."));
          setBookingInProgress(false);
          return;
        }

        const options = {
          key: apiKey,
          amount: amount,
          currency: currency || "INR",
          name: "MyDesignGhar",
          description: `Consultation with ${designer.name}`,
          order_id: orderId,
          handler: async function (response: any) {
            try {
              setBookingInProgress(true);
              await WalletService.verifyBookingPayment({
                orderId: orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                bookingId: bookingId,
              });

              setShowPaymentOptionsModal(false);
              setShowSuccessModal(true);
            } catch (err: any) {
              Alert.alert(t("Payment Failed"), t(err.response?.data?.message || err.message || "Payment verification failed."));
            } finally {
              setBookingInProgress(false);
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
              setBookingInProgress(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Native (WebView checkout)
        // If apiKey is mock or missing, allow quick simulation on native
        if (!apiKey || apiKey.includes("yourKeyId") || orderId.startsWith("order_mock_")) {
          Alert.alert(
            t("Payment Simulation"),
            t("Razorpay is in test mode. Simulate successful payment?"),
            [
              { text: t("Cancel"), style: "cancel", onPress: () => setBookingInProgress(false) },
              {
                text: t("Simulate Payment"),
                onPress: async () => {
                  try {
                    setBookingInProgress(true);
                    await WalletService.verifyBookingPayment({
                      orderId: orderId,
                      paymentId: `pay_mock_${Math.random().toString(36).substr(2, 9)}`,
                      signature: "mock_signature",
                      bookingId: bookingId,
                    });
                    setShowPaymentOptionsModal(false);
                    setShowSuccessModal(true);
                  } catch (err: any) {
                    Alert.alert(t("Simulation Failed"), t(err.response?.data?.message || err.message));
                  } finally {
                    setBookingInProgress(false);
                  }
                }
              }
            ]
          );
          return;
        }

        const isDark = colors.background === "#12141a";
        const htmlBg = isDark ? "#12141a" : "#ffffff";
        const htmlTextCol = isDark ? "#ffffff" : "#12141a";

        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
            <style>
              body {
                background-color: ${htmlBg};
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                font-family: sans-serif;
                color: ${htmlTextCol};
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
                "amount": ${amount},
                "currency": "${currency}",
                "name": "MyDesignGhar",
                "description": "Consultation Booking",
                "order_id": "${orderId}",
                "handler": function (response) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    status: 'success',
                    data: {
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                      razorpay_order_id: response.razorpay_order_id || '${orderId}'
                    }
                  }));
                },
                "prefill": {
                  "name": "${user?.name || ''}",
                  "email": "${user?.email || ''}",
                  "contact": "${user?.phone || ''}"
                },
                "theme": {
                  "color": "${colors.primary}"
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
        setShowRazorpayModal(true);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to book session";
      Alert.alert(t("Booking Failed"), t(msg));
      setBookingInProgress(false);
    }
  }

  const handleWebViewMessage = async (event: any) => {
    try {
      const response = JSON.parse(event.nativeEvent.data);
      setShowRazorpayModal(false);

      if (response.status === "success") {
        const { razorpay_payment_id, razorpay_signature, razorpay_order_id } = response.data;
        setBookingInProgress(true);
        
        await WalletService.verifyBookingPayment({
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          bookingId: pendingBookingId,
        });

        setShowPaymentOptionsModal(false);
        setShowSuccessModal(true);
      } else if (response.status === "failed") {
        Alert.alert(t("Payment Failed"), response.error?.description || t("Payment failed or was declined."));
      } else if (response.status === "cancelled") {
        Alert.alert(t("Payment Cancelled"), t("You cancelled the payment transaction."));
      }
    } catch (err: any) {
      console.error("Payment handle error:", err);
      Alert.alert(t("Error"), t("Could not complete payment verification."));
    } finally {
      setBookingInProgress(false);
    }
  };

  function handleSuccessClose() {
    setShowSuccessModal(false);
    // Refresh slot availability lists
    fetchDesignerDetails();
    // Navigate back to home or booking tab
    router.back();
  }

  // Helper to format date label
  function formatDateLabel(dateStr: string) {
    const d = new Date(dateStr);
    const dayName = d.toLocaleDateString(undefined, { weekday: "short" }); // e.g. "Mon"
    const dateNum = d.getDate(); // e.g. "20"
    const monthName = d.toLocaleDateString(undefined, { month: "short" }); // e.g. "Jul"
    return { dayName, dateNum, monthName };
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!designer) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.foreground }]}>{t("Designer not found")}</Text>
      </View>
    );
  }

  const selectedSlot = designer.availability.find((a: any) => a.id === selectedSlotId);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t("Consultant Details")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Profile Card Section */}
        <View style={[styles.profileSection, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.profileHeader}>
            <Image source={getAvatarSource(designer.avatarUrl)} style={styles.avatar} />
            <View style={styles.profileMainInfo}>
              <Text style={[styles.nameText, { color: colors.foreground }]}>{designer.name}</Text>
              <Text style={[styles.specialtyText, { color: colors.mutedForeground }]}>{designer.specialty}</Text>
              
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={[styles.ratingVal, { color: colors.foreground }]}>{designer.rating}</Text>
                <Text style={[styles.reviewsCount, { color: colors.mutedForeground }]}>
                  ({designer.reviewsCount} {t("reviews")})
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.experienceGrid}>
            <View style={[styles.expItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Feather name="briefcase" size={16} color={colors.primary} />
              <View>
                <Text style={[styles.expTitle, { color: colors.mutedForeground }]}>{t("Experience")}</Text>
                <Text style={[styles.expValue, { color: colors.foreground }]}>
                  {designer.experience} {t("years")}
                </Text>
              </View>
            </View>

            <View style={[styles.expItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Feather name="tag" size={16} color="#4CAF50" />
              <View>
                <Text style={[styles.expTitle, { color: colors.mutedForeground }]}>{t("Hourly Rate")}</Text>
                <Text style={[styles.expValue, { color: colors.foreground }]}>
                  ₹{designer.price}/{t("hr")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("About the Designer")}</Text>
          <Text style={[styles.bioText, { color: colors.mutedForeground }]}>{designer.bio}</Text>
        </View>

        {/* Available Dates */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("Choose Date & Time Slot")}</Text>
          <Text style={[styles.sectionSubText, { color: colors.mutedForeground, marginBottom: 12 }]}>
            {t("Select date and time slot below")}
          </Text>

          {dates.length === 0 ? (
            <View style={[styles.emptySlotsCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Feather name="calendar" size={24} color={colors.mutedForeground} />
              <Text style={[styles.emptySlotsText, { color: colors.mutedForeground }]}>
                {t("No availability slots set up")}
              </Text>
            </View>
          ) : (
            <>
              {/* Horizontal Dates Picker */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesContainer}>
                {dates.map((dateStr) => {
                  const { dayName, dateNum, monthName } = formatDateLabel(dateStr);
                  const isSelected = selectedDateStr === dateStr;
                  return (
                    <Pressable
                      key={dateStr}
                      onPress={() => {
                        setSelectedDateStr(dateStr);
                        setSelectedSlotId(null); // Reset slot selection when date changes
                      }}
                      style={[
                        styles.dateCard,
                        {
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected ? `${colors.primary}10` : colors.card,
                        },
                      ]}
                    >
                      <Text style={[styles.dateDay, { color: isSelected ? colors.primary : colors.mutedForeground }]}>
                        {t(dayName)}
                      </Text>
                      <Text style={[styles.dateNum, { color: isSelected ? colors.primary : colors.foreground }]}>
                        {dateNum}
                      </Text>
                      <Text style={[styles.dateMonth, { color: isSelected ? colors.primary : colors.mutedForeground }]}>
                        {t(monthName)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Time Slots Grid */}
              <View style={styles.timeSlotsGrid}>
                {activeSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <Pressable
                      key={slot.id}
                      onPress={() => setSelectedSlotId(slot.id)}
                      style={[
                        styles.timeSlotChip,
                        {
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected ? colors.primary : colors.card,
                        },
                      ]}
                    >
                      <Text style={[styles.timeSlotText, { color: isSelected ? "#fff" : colors.foreground }]}>
                        {slot.timeSlot}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* Reviews Section */}
        {designer.reviews && designer.reviews.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {t("Reviews")} ({designer.reviewsCount})
            </Text>
            {designer.reviews.map((review: any) => (
              <View
                key={review.id}
                style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewAuthor, { color: colors.foreground }]}>{review.name}</Text>
                  <View style={styles.starsRow}>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Ionicons
                        key={idx}
                        name="star"
                        size={12}
                        color={idx < review.rating ? "#FFD700" : colors.border}
                      />
                    ))}
                  </View>
                </View>
                <Text style={[styles.reviewDate, { color: colors.mutedForeground }]}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
                <Text style={[styles.reviewBody, { color: colors.foreground }]}>{review.text}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 12,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.footerInfo}>
          <Text style={[styles.footerPriceLabel, { color: colors.mutedForeground }]}>{t("Total Price")}</Text>
          <Text style={[styles.footerPrice, { color: colors.foreground }]}>₹{designer.price}</Text>
        </View>

        <Pressable
          disabled={!selectedSlotId || bookingInProgress}
          onPress={handleBookSession}
          style={({ pressed }) => [
            styles.bookBtn,
            {
              backgroundColor: selectedSlotId ? colors.primary : colors.border,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          {bookingInProgress ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.bookBtnText}>{t("Book Appointment")}</Text>
              <Feather name="arrow-right" size={16} color="#fff" />
            </>
          )}
        </Pressable>
      </View>

      {/* Booking Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={[styles.successIconBadge, { backgroundColor: "#4CAF5020" }]}>
              <Ionicons name="checkmark-circle" size={56} color="#4CAF50" />
            </View>

            <Text style={[styles.successTitle, { color: colors.foreground }]}>{t("Booking Successful!")}</Text>
            
            <Text style={[styles.successDesc, { color: colors.mutedForeground }]}>
              {t("Your consultation session has been booked. You will receive notifications with meeting join link.")}
            </Text>

            <View style={[styles.receiptCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>{t("Designer")}</Text>
                <Text style={[styles.receiptVal, { color: colors.foreground }]}>{designer.name}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>{t("Date")}</Text>
                <Text style={[styles.receiptVal, { color: colors.foreground }]}>
                  {selectedDateStr ? new Date(selectedDateStr).toLocaleDateString() : ""}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>{t("Time")}</Text>
                <Text style={[styles.receiptVal, { color: colors.foreground }]}>
                  {selectedSlot ? selectedSlot.timeSlot : ""}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleSuccessClose}
              style={[styles.modalCloseBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.modalCloseBtnText}>{t("Done")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Payment Options Modal */}
      <Modal visible={showPaymentOptionsModal} transparent animationType="slide" onRequestClose={() => setShowPaymentOptionsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, paddingHorizontal: 20 }]}>
            {/* Header */}
            <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold", color: colors.foreground }}>
                {t("Select Payment Method")}
              </Text>
              <TouchableOpacity onPress={() => setShowPaymentOptionsModal(false)}>
                <Ionicons name="close" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* Price Details */}
            <View style={{ width: "100%", padding: 16, backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 20, alignItems: "center" }}>
              <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>{t("Amount to Pay")}</Text>
              <Text style={{ fontSize: 26, fontWeight: "800", color: colors.foreground, fontFamily: "Inter_700Bold", marginTop: 4 }}>₹{designer.price}</Text>
            </View>

            {/* Methods */}
            <View style={{ width: "100%", gap: 12, marginBottom: 24 }}>
              {/* Option A: Razorpay */}
              <Pressable
                onPress={() => setSelectedPaymentMethod("RAZORPAY")}
                style={{
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 14,
                  borderWidth: selectedPaymentMethod === "RAZORPAY" ? 2 : 1,
                  borderColor: selectedPaymentMethod === "RAZORPAY" ? colors.primary : colors.border,
                  backgroundColor: selectedPaymentMethod === "RAZORPAY" ? colors.primary + "08" : colors.card,
                  borderRadius: 12,
                  gap: 14,
                }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: selectedPaymentMethod === "RAZORPAY" ? colors.primary + "18" : colors.background, alignItems: "center", justifyContent: "center" }}>
                  <Feather name="credit-card" size={20} color={selectedPaymentMethod === "RAZORPAY" ? colors.primary : colors.foreground} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
                    {t("UPI / Card / Netbanking")}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 }}>
                    {t("Pay instantly via Razorpay")}
                  </Text>
                </View>
                {selectedPaymentMethod === "RAZORPAY" && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </Pressable>

              {/* Option B: Wallet */}
              {(() => {
                const walletBalance = user?.walletBalance ?? 0;
                const isInsufficient = walletBalance < designer.price;
                return (
                  <Pressable
                    disabled={isInsufficient}
                    onPress={() => setSelectedPaymentMethod("WALLET")}
                    style={{
                      width: "100%",
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 14,
                      borderWidth: selectedPaymentMethod === "WALLET" ? 2 : 1,
                      borderColor: selectedPaymentMethod === "WALLET" ? colors.primary : colors.border,
                      backgroundColor: selectedPaymentMethod === "WALLET" ? colors.primary + "08" : colors.card,
                      borderRadius: 12,
                      gap: 14,
                      opacity: isInsufficient ? 0.5 : 1,
                    }}
                  >
                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: selectedPaymentMethod === "WALLET" ? colors.primary + "18" : colors.background, alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="wallet" size={20} color={selectedPaymentMethod === "WALLET" ? colors.primary : colors.foreground} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
                        {t("MyDesignGhar Wallet")}
                      </Text>
                      <Text style={{ fontSize: 12, color: isInsufficient ? "#F44336" : colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 }}>
                        {isInsufficient 
                          ? `${t("Insufficient Balance")} (₹${walletBalance})`
                          : `${t("Available Balance")}: ₹${walletBalance}`
                        }
                      </Text>
                    </View>
                    {selectedPaymentMethod === "WALLET" && (
                      <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                    )}
                  </Pressable>
                );
              })()}
            </View>

            {/* Pay Button */}
            <Pressable
              disabled={bookingInProgress}
              onPress={handleProceedPayment}
              style={{
                width: "100%",
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {bookingInProgress ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" }}>
                  {t("Proceed to Pay")} ₹{designer.price}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Razorpay WebView Modal */}
      <Modal visible={showRazorpayModal} animationType="slide" onRequestClose={() => setShowRazorpayModal(false)}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: colors.foreground }}>{t("Razorpay Payment")}</Text>
            <TouchableOpacity onPress={() => {
              setShowRazorpayModal(false);
              setBookingInProgress(false);
            }}>
              <Text style={{ color: "#F44336", fontWeight: "700" }}>{t("Cancel")}</Text>
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
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  profileSection: {
    padding: 20,
    borderBottomWidth: 1,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#eaeaea",
  },
  profileMainInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  specialtyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  ratingVal: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  reviewsCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  experienceGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  expItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  expTitle: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  expValue: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginTop: 1,
  },
  sectionContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  sectionSubText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  emptySlotsCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  emptySlotsText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  datesContainer: {
    gap: 10,
    paddingRight: 10,
    marginBottom: 16,
  },
  dateCard: {
    width: 68,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dateDay: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  dateNum: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginVertical: 2,
  },
  dateMonth: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  timeSlotChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
  reviewCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewAuthor: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  reviewBody: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 10,
  },
  footerInfo: {
    justifyContent: "center",
  },
  footerPriceLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  footerPrice: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  bookBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  successIconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },
  receiptCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  receiptVal: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  modalCloseBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  modalCloseBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});
