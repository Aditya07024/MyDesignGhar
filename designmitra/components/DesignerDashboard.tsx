import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Platform,
  RefreshControl,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "../lib/i18n";
import { ConsultantService, AuthService } from "../lib/api/services";
import { GradientButton } from "./GradientButton";

function getErrorMessage(err: any, fallback: string): string {
  if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
    return err.response.data.errors.map((e: any) => e.message).join("\n");
  }
  return err.response?.data?.message || err.response?.data?.error || err.message || fallback;
}

export function DesignerDashboard() {
  const colors = useColors();
  const { t } = useTranslation();
  const { user, updateProfile } = useApp();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);

  // Registration Form States
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [price, setPrice] = useState("500");
  const [regLoading, setRegLoading] = useState(false);

  // Add Slot Modal States
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split("T")[0]);
  const [slotTime, setSlotTime] = useState("10:00 AM - 11:00 AM");
  const [slotLoading, setSlotLoading] = useState(false);

  // Add Notes Modal States
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);

  const fetchDashboardData = async () => {
    if (!user?.consultantProfile) return;
    try {
      const [bookingsRes, meRes] = await Promise.all([
        ConsultantService.listBookings(),
        AuthService.getMe(),
      ]);
      setBookings(bookingsRes.bookings || []);
      setSlots(meRes.user?.consultantProfile?.availability || []);
      
      // Update app context user data in background
      updateProfile({
        consultantProfile: meRes.user?.consultantProfile,
        walletBalance: meRes.user?.walletBalance,
      });
    } catch (err) {
      console.warn("Failed to fetch designer dashboard data:", err);
    }
  };

  useEffect(() => {
    if (user?.consultantProfile) {
      setLoading(true);
      fetchDashboardData().finally(() => setLoading(false));
    }
  }, [user?.consultantProfile?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleRegister = async () => {
    if (!specialty || !experience || !bio || !price) {
      Alert.alert(t("Error"), t("All fields are required"));
      return;
    }
    const expNum = Number(experience);
    const priceNum = Number(price);

    if (isNaN(expNum) || expNum < 0) {
      Alert.alert(t("Error"), t("Experience must be a non-negative number"));
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert(t("Error"), t("Consultation price must be a positive number"));
      return;
    }
    if (bio.length < 10) {
      Alert.alert(t("Error"), t("Bio must be at least 10 characters long"));
      return;
    }

    setRegLoading(true);
    try {
      await ConsultantService.register({
        specialty,
        experience: expNum,
        bio,
        price: priceNum,
      });
      // Retrieve full updated user model from backend
      const meRes = await AuthService.getMe();
      updateProfile({
        consultantProfile: meRes.user.consultantProfile,
        role: meRes.user.role,
      });
      Alert.alert(t("Success"), t("Designer Profile Registered Successfully!"));
    } catch (err: any) {
      Alert.alert(t("Error"), getErrorMessage(err, t("Registration failed")));
    } finally {
      setRegLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!slotDate || !slotTime) {
      Alert.alert(t("Error"), t("Date and Time slot are required"));
      return;
    }
    setSlotLoading(true);
    try {
      await ConsultantService.addAvailabilitySlots([
        { date: slotDate, timeSlot: slotTime },
      ]);
      setShowAddSlotModal(false);
      Alert.alert(t("Success"), t("Availability slot added successfully"));
      fetchDashboardData();
    } catch (err: any) {
      Alert.alert(t("Error"), getErrorMessage(err, t("Failed to add slot")));
    } finally {
      setSlotLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedBookingId || !notesText) return;
    setNotesLoading(true);
    try {
      await ConsultantService.addSessionNotes(selectedBookingId, notesText);
      setSelectedBookingId(null);
      setNotesText("");
      Alert.alert(t("Success"), t("Session notes updated successfully"));
      fetchDashboardData();
    } catch (err: any) {
      Alert.alert(t("Error"), getErrorMessage(err, t("Failed to save notes")));
    } finally {
      setNotesLoading(false);
    }
  };

  // 1. If Profile is not registered/complete
  if (!user?.consultantProfile) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.centerScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.centerIcon}>
            <MaterialCommunityIcons name="badge-account-outline" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>{t("Register as Designer")}</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {t("Complete your details to start accepting interior design consultation bookings from MyDesignGhar users.")}
          </Text>

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.foreground }]}>{t("Specialty (e.g. Modern Concepts, Kitchens)")}</Text>
            <TextInput
              value={specialty}
              onChangeText={setSpecialty}
              placeholder={t("e.g. Modern, Minimalist, Traditional Rooms")}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
            />

            <Text style={[styles.label, { color: colors.foreground }]}>{t("Experience (Years)")}</Text>
            <TextInput
              value={experience}
              onChangeText={setExperience}
              keyboardType="numeric"
              placeholder={t("e.g. 5")}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
            />

            <Text style={[styles.label, { color: colors.foreground }]}>{t("Consultation Price per Session (₹)")}</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="e.g. 500"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
            />

            <Text style={[styles.label, { color: colors.foreground }]}>{t("Professional Bio")}</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              placeholder={t("Describe your style philosophy, certifications, or past projects...")}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
            />

            <GradientButton
              label={regLoading ? t("Registering...") : t("Complete Registration")}
              onPress={handleRegister}
              loading={regLoading}
              style={{ marginTop: 10 }}
            />
          </View>
        </View>
      </ScrollView>
    );
  }

  // 2. Active Dashboard
  const profile = user.consultantProfile;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Designer Summary Header */}
      <View style={[styles.dashboardHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.designerMeta}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + "15" }]}>
            <Ionicons name="person" size={28} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.designerName, { color: colors.foreground }]}>{user.name}</Text>
            <Text style={[styles.specialtyText, { color: colors.mutedForeground }]}>
              {profile.specialty} · {profile.experience} {t("years exp")}
            </Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={[styles.ratingVal, { color: colors.foreground }]}>{profile.rating}</Text>
          </View>
        </View>

        <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>₹{user.walletBalance ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t("Balance")}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{bookings.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t("Bookings")}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{slots.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t("Active Slots")}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        {/* Availability Slots Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("Availability Slots")}</Text>
          <Pressable onPress={() => setShowAddSlotModal(true)} style={[styles.addSlotBtn, { backgroundColor: colors.primary + "12" }]}>
            <Feather name="plus" size={14} color={colors.primary} />
            <Text style={[styles.addSlotBtnText, { color: colors.primary }]}>{t("Add Slot")}</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : slots.length === 0 ? (
          <View style={[styles.emptyCard, { borderColor: colors.border }]}>
            <Feather name="calendar" size={24} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{t("No active slots. Add slots to get booked.")}</Text>
          </View>
        ) : (
          <View style={styles.slotsGrid}>
            {slots.map((slot) => (
              <View key={slot.id} style={[styles.slotItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.slotDate, { color: colors.foreground }]}>
                    {new Date(slot.date).toLocaleDateString()}
                  </Text>
                  <Text style={[styles.slotTime, { color: colors.mutedForeground }]}>{slot.timeSlot}</Text>
                </View>
                <View style={[
                  styles.slotBadge, 
                  { backgroundColor: slot.isBooked ? colors.success + "15" : colors.primary + "12" }
                ]}>
                  <Text style={{ 
                    fontSize: 11, 
                    fontWeight: "700", 
                    color: slot.isBooked ? colors.success : colors.primary 
                  }}>
                    {slot.isBooked ? t("Booked") : t("Available")}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Consultations Bookings Header */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>{t("Customer Bookings")}</Text>

        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : bookings.length === 0 ? (
          <View style={[styles.emptyCard, { borderColor: colors.border }]}>
            <Feather name="clock" size={24} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{t("No consultation bookings received yet.")}</Text>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {bookings.map((booking) => (
              <View key={booking.id} style={[styles.bookingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.bookingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.clientName, { color: colors.foreground }]}>{booking.name || t("Client")}</Text>
                    <Text style={[styles.bookingTimeText, { color: colors.mutedForeground }]}>
                      {new Date(booking.date).toLocaleDateString()} @ {booking.time}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    {
                      backgroundColor: 
                        booking.status === "CONFIRMED" ? colors.success + "15" : 
                        booking.status === "COMPLETED" ? colors.muted : "#E53E3E15"
                    }
                  ]}>
                    <Text style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color:
                        booking.status === "CONFIRMED" ? colors.success : 
                        booking.status === "COMPLETED" ? colors.mutedForeground : "#E53E3E"
                    }}>
                      {booking.status}
                    </Text>
                  </View>
                </View>

                {booking.notes && (
                  <View style={[styles.notesSection, { backgroundColor: colors.background, borderRadius: 8 }]}>
                    <Text style={[styles.notesLabel, { color: colors.mutedForeground }]}>{t("Session Notes:")}</Text>
                    <Text style={[styles.notesText, { color: colors.foreground }]}>{booking.notes}</Text>
                  </View>
                )}

                {/* Session Actions */}
                <View style={styles.bookingActions}>
                  {booking.status === "CONFIRMED" && (
                    <Pressable
                      onPress={() => {
                        Alert.alert(
                          t("Video Consultation"),
                          t("Please open the video consultation room link on your registered email or browser to join the LiveKit call.")
                        );
                      }}
                      style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    >
                      <Feather name="video" size={14} color="#fff" />
                      <Text style={styles.actionButtonText}>{t("Join Call")}</Text>
                    </Pressable>
                  )}

                  <Pressable
                    onPress={() => {
                      setSelectedBookingId(booking.id);
                      setNotesText(booking.notes || "");
                    }}
                    style={[styles.actionButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
                  >
                    <Feather name="edit" size={14} color={colors.foreground} />
                    <Text style={[styles.actionButtonText, { color: colors.foreground }]}>
                      {booking.notes ? t("Edit Notes") : t("Add Notes")}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Add Slot Modal */}
      <Modal visible={showAddSlotModal} transparent animationType="fade" onRequestClose={() => setShowAddSlotModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{t("Add Availability Slot")}</Text>

            <Text style={[styles.label, { color: colors.foreground }]}>{t("Date (YYYY-MM-DD)")}</Text>
            <TextInput
              value={slotDate}
              onChangeText={setSlotDate}
              placeholder="e.g. 2026-07-25"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
            />

            <Text style={[styles.label, { color: colors.foreground }]}>{t("Time Slot")}</Text>
            <TextInput
              value={slotTime}
              onChangeText={setSlotTime}
              placeholder="e.g. 10:00 AM - 11:00 AM"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
            />

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowAddSlotModal(false)}
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
              >
                <Text style={{ color: colors.mutedForeground, fontWeight: "600" }}>{t("Cancel")}</Text>
              </Pressable>
              <Pressable
                disabled={slotLoading}
                onPress={handleAddSlot}
                style={[styles.modalSubmitBtn, { backgroundColor: colors.primary }]}
              >
                {slotLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "600" }}>{t("Add")}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Notes Modal */}
      <Modal visible={selectedBookingId !== null} transparent animationType="fade" onRequestClose={() => setSelectedBookingId(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{t("Add Session Notes")}</Text>

            <Text style={[styles.label, { color: colors.foreground, marginBottom: 8 }]}>
              {t("Provide consultation notes or recommendations for the client:")}
            </Text>
            <TextInput
              value={notesText}
              onChangeText={setNotesText}
              multiline
              numberOfLines={6}
              placeholder={t("e.g. Suggested Minimalist theme, beige curtains, and wood flooring recommendations...")}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
            />

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setSelectedBookingId(null)}
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
              >
                <Text style={{ color: colors.mutedForeground, fontWeight: "600" }}>{t("Cancel")}</Text>
              </Pressable>
              <Pressable
                disabled={notesLoading}
                onPress={handleSaveNotes}
                style={[styles.modalSubmitBtn, { backgroundColor: colors.primary }]}
              >
                {notesLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "600" }}>{t("Save")}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerScroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    width: "100%",
  },
  centerIcon: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "Inter_700Bold",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: "Inter_400Regular",
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    fontFamily: "Inter_600SemiBold",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
    fontFamily: "Inter_400Regular",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dashboardHeader: {
    margin: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  designerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  designerName: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  specialtyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ratingVal: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  statsDivider: {
    height: 1,
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  addSlotBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addSlotBtnText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: "dashed",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  slotsGrid: {
    gap: 10,
  },
  slotItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  slotDate: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  slotTime: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  slotBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bookingsList: {
    gap: 12,
    marginTop: 12,
  },
  bookingCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  bookingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  clientName: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  bookingTimeText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  notesSection: {
    padding: 10,
  },
  notesLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginBottom: 2,
  },
  notesText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
  bookingActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSubmitBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
