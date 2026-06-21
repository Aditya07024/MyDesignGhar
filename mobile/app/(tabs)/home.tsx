import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Bell,
  Sparkles,
  Wand2,
  LayoutGrid,
  MapPin,
  Users,
  Wallet,
  TrendingUp,
  Settings,
  Star,
  User,
  Phone,
} from "lucide-react-native";
import { AuthService } from "../../lib/api/services";
import { useApp } from "../../store/app";
import {
  COLORS,
  Avatar,
  Button,
  GlassCard,
  SectionTitle,
  img,
  useTranslation,
  useStyles,
} from "../../components/ui-kit";
import { roomTypes, quickActions } from "../../src/lib/mock";
import {
  useDesignsQuery,
  useBookingsQuery,
  useAddSlotsMutation,
  useAddSessionNotesMutation,
  useNotificationsQuery,
  useMeQuery,
} from "../../hooks/useApi";

const qaIcons: Record<string, any> = {
  gallery: LayoutGrid,
  map: MapPin,
  users: Users,
  wallet: Wallet,
};

const statIcons: Record<string, any> = {
  sparkles: Sparkles,
  wallet: Wallet,
  users: Users,
};

const WEEKDAYS = [
  { label: "S", value: 0 },
  { label: "M", value: 1 },
  { label: "T", value: 2 },
  { label: "W", value: 3 },
  { label: "T", value: 4 },
  { label: "F", value: 5 },
  { label: "S", value: 6 },
];

export default function HomeScreen() {
  const router = useRouter();
  const user = useApp((s) => s.user);
  const userName = useApp((s) => s.userName);
  const setUser = useApp((s) => s.setUser);
  const t = useTranslation();
  const styles = useStyles(getStyles);

  const { data: designs = [] } = useDesignsQuery();
  const { data: bookings = [] } = useBookingsQuery();
  const { data: notifications = [] } = useNotificationsQuery();
  
  const isConsultant = user?.role === "CONSULTANT";
  const { data: freshUser, refetch: refetchMe } = useMeQuery(isConsultant);

  React.useEffect(() => {
    if (freshUser) {
      setUser(freshUser);
    }
  }, [freshUser]);
  
  const hasUnread = notifications.some((n: any) => !n.isRead);

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const today = new Date();
  const fortnightLater = new Date();
  fortnightLater.setDate(today.getDate() + 14);

  const [startDate, setStartDate] = React.useState(formatDate(today));
  const [endDate, setEndDate] = React.useState(formatDate(fortnightLater));
  const [selectedDays, setSelectedDays] = React.useState<number[]>([1, 2, 3, 4, 5]); // default Mon-Fri
  const [slotTime, setSlotTime] = React.useState("");
  const [activeNotesBookingId, setActiveNotesBookingId] = React.useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = React.useState("");

  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [completeName, setCompleteName] = React.useState("");
  const [completePhone, setCompletePhone] = React.useState("");
  const [modalErr, setModalErr] = React.useState("");
  const [modalLoading, setModalLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      const needsName = !user.fullName || user.fullName === "User" || user.fullName.trim() === "";
      const needsPhone = !user.phone || !user.isPhoneVerified;
      if (needsName || needsPhone) {
        setShowProfileModal(true);
        if (!needsName) setCompleteName(user.fullName);
        // Pre-fill phone if it is verified, otherwise leave it empty for them to enter
        if (!needsPhone) setCompletePhone(user.phone.replace("+91", ""));
      } else {
        setShowProfileModal(false);
      }
    }
  }, [user]);

  const handleCompleteProfile = async () => {
    if (completeName.trim().length < 2) {
      return setModalErr(t("Please enter your full name."));
    }
    const cleanPhone = completePhone.trim().replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      return setModalErr(t("Please enter a valid 10-digit phone number."));
    }
    
    setModalErr("");
    setModalLoading(true);
    try {
      const formattedPhone = `+91${cleanPhone}`;
      const res = await AuthService.updateProfile({
        fullName: completeName.trim(),
        phone: formattedPhone,
      });

      if (res && res.user) {
        setUser(res.user);
        setShowProfileModal(false);
        Alert.alert(t("Success"), t("Profile completed successfully."));
      }
    } catch (err: any) {
      setModalErr(err.response?.data?.message || t("Failed to update profile. Please try again."));
    } finally {
      setModalLoading(false);
    }
  };

  const addSlotsMutation = useAddSlotsMutation();
  const addNotesMutation = useAddSessionNotesMutation();

  const handleAddSlot = () => {
    if (!startDate.trim() || !endDate.trim() || !slotTime.trim()) {
      return Alert.alert(t("Error") || "Error", "Please enter start date, end date, and time slot.");
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate.trim()) || !dateRegex.test(endDate.trim())) {
      return Alert.alert(t("Error") || "Error", "Dates must be in YYYY-MM-DD format.");
    }
    if (selectedDays.length === 0) {
      return Alert.alert(t("Error") || "Error", "Please select at least one weekday.");
    }

    const start = new Date(startDate.trim());
    const end = new Date(endDate.trim());
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return Alert.alert(t("Error") || "Error", "Invalid date range selected.");
    }

    // Generate slots array
    const slots: { date: string; timeSlot: string }[] = [];
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay(); // 0 is Sunday, 1 is Monday...
      if (selectedDays.includes(day)) {
        slots.push({
          date: formatDate(current),
          timeSlot: slotTime.trim(),
        });
      }
      current.setDate(current.getDate() + 1);
    }

    if (slots.length === 0) {
      return Alert.alert(t("Error") || "Error", "No matching weekdays found in the selected date range.");
    }

    addSlotsMutation.mutate(slots, {
      onSuccess: () => {
        Alert.alert(t("Success") || "Success", `Successfully added ${slots.length} availability slots.`);
        const todayVal = new Date();
        const fortnightVal = new Date();
        fortnightVal.setDate(todayVal.getDate() + 14);
        setStartDate(formatDate(todayVal));
        setEndDate(formatDate(fortnightVal));
        setSelectedDays([1, 2, 3, 4, 5]);
        setSlotTime("");
        refetchMe();
      },
      onError: (err: any) => {
        Alert.alert(t("Error") || "Error", err.response?.data?.message || "Failed to add availability slots.");
      }
    });
  };

  const handleSaveNotes = (bookingId: string) => {
    if (!sessionNotes.trim()) {
      return Alert.alert(t("Error") || "Error", t("Notes cannot be empty") || "Notes cannot be empty.");
    }
    addNotesMutation.mutate({ bookingId, notes: sessionNotes.trim() }, {
      onSuccess: () => {
        Alert.alert(t("Success") || "Success", t("Notes saved successfully") || "Session notes saved successfully.");
        setActiveNotesBookingId(null);
        setSessionNotes("");
      },
      onError: (err: any) => {
        Alert.alert(t("Error") || "Error", err.response?.data?.message || "Failed to save session notes.");
      }
    });
  };

  const dynamicStats = React.useMemo(() => {
    const designsCount = designs.length;
    const bookingsCount = bookings.length;
    const moneySavedAmt = designsCount * 5000;

    let moneySavedStr = `₹${moneySavedAmt.toLocaleString("en-IN")}`;
    if (moneySavedAmt >= 100000) {
      moneySavedStr = `₹${(moneySavedAmt / 100000).toFixed(1)}L`;
    }

    return [
      { label: t("Designs Generated"), value: String(designsCount), icon: "sparkles" },
      { label: t("Money Saved"), value: moneySavedStr, icon: "wallet" },
      { label: t("Consultants Booked"), value: String(bookingsCount), icon: "users" },
    ];
  }, [designs, bookings, t]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.userInfo}
            onPress={() => router.push("/settings")}
            activeOpacity={0.7}
          >
            <Avatar seed={userName} size={44} />
            <View style={styles.userTextContainer}>
              <Text style={styles.greetingText}>{t("Namaste 🙏")}</Text>
              <Text style={styles.userNameText}>{userName}</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.topBarActions}>
            <TouchableOpacity
              onPress={() => router.push("/notifications")}
              style={styles.actionBtn}
            >
              <Bell size={20} color={COLORS.text} />
              {hasUnread && <View style={styles.bellDot} />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/settings")}
              style={[styles.actionBtn, { marginLeft: 10 }]}
            >
              <Settings size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        {isConsultant ? (
          <>
            {/* Consultant Badge */}
            <View style={styles.consultantBadgeContainer}>
              <View style={styles.consultantBadge}>
                <Text style={styles.consultantBadgeText}>{t("Consultant Portal")}</Text>
              </View>
            </View>

            {/* Consultant Stats */}
            <View style={styles.statsGrid}>
              <GlassCard style={styles.statCard}>
                <Users size={20} color={COLORS.primary} style={styles.statIcon} />
                <Text style={styles.statVal}>{bookings.length}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>{t("Total Bookings")}</Text>
              </GlassCard>
              <GlassCard style={styles.statCard}>
                <Wallet size={20} color={COLORS.primary} style={styles.statIcon} />
                <Text style={styles.statVal}>₹{bookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0)}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>{t("Earnings")}</Text>
              </GlassCard>
              <GlassCard style={styles.statCard}>
                <Star size={20} color={COLORS.primary} style={styles.statIcon} />
                <Text style={styles.statVal}>5.0</Text>
                <Text style={styles.statLabel} numberOfLines={1}>{t("Rating")}</Text>
              </GlassCard>
            </View>

            {/* Slot Scheduler Card */}
            <View style={{ marginTop: 20 }}>
              <GlassCard style={styles.schedulerCard}>
                <Text style={schedulerTitleStyle}>{t("Availability slots")}</Text>
                
                <Text style={styles.inputLabel}>{t("Date Range")}</Text>
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t("Start Date") + " (YYYY-MM-DD)"}
                    placeholderTextColor={COLORS.textMuted}
                    value={startDate}
                    onChangeText={setStartDate}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder={t("End Date") + " (YYYY-MM-DD)"}
                    placeholderTextColor={COLORS.textMuted}
                    value={endDate}
                    onChangeText={setEndDate}
                  />
                </View>

                <Text style={styles.inputLabel}>{t("Select Weekdays")}</Text>
                <View style={styles.weekdaysRow}>
                  {WEEKDAYS.map((day) => {
                    const isSelected = selectedDays.includes(day.value);
                    return (
                      <TouchableOpacity
                        key={day.value}
                        onPress={() => {
                          if (isSelected) {
                            setSelectedDays(selectedDays.filter((d) => d !== day.value));
                          } else {
                            setSelectedDays([...selectedDays, day.value]);
                          }
                        }}
                        style={[
                          styles.weekdayCircle,
                          isSelected && styles.weekdayCircleActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.weekdayText,
                            isSelected && styles.weekdayTextActive,
                          ]}
                        >
                          {day.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.inputLabel}>{t("Time Slot")}</Text>
                <TextInput
                  style={[styles.textInput, { width: "100%", marginBottom: 16 }]}
                  placeholder={t("Time Slot (e.g. 10:00 AM)")}
                  placeholderTextColor={COLORS.textMuted}
                  value={slotTime}
                  onChangeText={setSlotTime}
                />

                <Button
                  title={t("Add Slots")}
                  onPress={handleAddSlot}
                  loading={addSlotsMutation.isPending}
                  style={styles.addSlotBtn}
                />
              </GlassCard>
            </View>

            {/* Client Sessions List */}
            <SectionTitle>{t("My Schedule")}</SectionTitle>
            {bookings.length === 0 ? (
              <View style={styles.emptySessions}>
                <Text style={styles.emptySessionsText}>{t("No upcoming sessions")}</Text>
              </View>
            ) : (
              bookings.map((booking: any) => (
                <GlassCard key={booking.id} style={styles.sessionCard}>
                  <View style={styles.sessionHeader}>
                    <View>
                      <Text style={styles.clientName}>{booking.name || "Client"}</Text>
                      <Text style={styles.sessionTime}>{booking.date} | {booking.time}</Text>
                    </View>
                    <View style={[styles.statusBadge, booking.status === "CONFIRMED" ? styles.statusConfirmed : styles.statusPending]}>
                      <Text style={styles.statusText}>{booking.status}</Text>
                    </View>
                  </View>

                  {booking.notes && (
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesLabel}>{t("Update Notes")}:</Text>
                      <Text style={styles.notesText}>{booking.notes}</Text>
                    </View>
                  )}

                  <View style={styles.sessionActions}>
                    {booking.dailyRoomUrl && (
                      <Button
                        title={t("Join Video Consultation")}
                        size="sm"
                        onPress={() => router.push(booking.dailyRoomUrl)}
                        style={styles.joinBtn}
                      />
                    )}
                    
                    {activeNotesBookingId === booking.id ? (
                      <View style={styles.notesInputContainer}>
                        <TextInput
                          style={styles.notesInput}
                          placeholder={t("Enter session notes...")}
                          placeholderTextColor={COLORS.textMuted}
                          multiline
                          value={sessionNotes}
                          onChangeText={setSessionNotes}
                        />
                        <View style={styles.notesActionButtons}>
                          <Button
                            title={t("Cancel")}
                            variant="secondary"
                            size="sm"
                            onPress={() => {
                              setActiveNotesBookingId(null);
                              setSessionNotes("");
                            }}
                          />
                          <Button
                            title={t("Save Notes")}
                            size="sm"
                            loading={addNotesMutation.isPending}
                            onPress={() => handleSaveNotes(booking.id)}
                          />
                        </View>
                      </View>
                    ) : (
                      <Button
                        title={booking.notes ? t("Update Notes") : t("Add note")}
                        variant="outline"
                        size="sm"
                        onPress={() => {
                          setActiveNotesBookingId(booking.id);
                          setSessionNotes(booking.notes || "");
                        }}
                        style={styles.notesBtn}
                      />
                    )}
                  </View>
                </GlassCard>
              ))
            )}
          </>
        ) : (
          <>
            {/* Hero banner */}
            <View style={styles.heroBanner}>
              <View style={styles.heroGlow} />
              <Text style={styles.heroBadge}>AI POWERED</Text>
              <Text style={styles.heroTitle}>{t("Redesign Your Room Today")}</Text>
              <Text style={styles.heroSubtitle}>{t("Upload a photo, pick a style, get magic.")}</Text>
              <Button
                title={t("Generate Design")}
                size="sm"
                icon={<Wand2 size={16} color="#12141a" />}
                onPress={() => router.push("/generate")}
                style={styles.heroBtn}
              />
            </View>

            {/* Room Types Grid */}
            <SectionTitle>{t("Choose a room")}</SectionTitle>
            <View style={styles.roomsGrid}>
              {roomTypes.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => router.push({ pathname: "/generate", params: { roomId: r.id } })}
                  style={styles.roomItem}
                >
                  <View style={styles.roomImageContainer}>
                    <Image source={{ uri: img(r.seed, 160, 160) }} style={styles.roomImage} />
                  </View>
                  <Text style={styles.roomText} numberOfLines={1}>
                    {r.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick actions */}
            <SectionTitle>{t("Quick actions")}</SectionTitle>
            <View style={styles.actionsGrid}>
              {quickActions.map((a) => {
                const IconComponent = qaIcons[a.icon] || LayoutGrid;
                return (
                  <TouchableOpacity
                    key={a.id}
                    onPress={() => {
                      if (a.to === "/generate") {
                        router.push("/generate");
                      } else if (a.to === "/designs") {
                        router.push("/(tabs)/designs");
                      } else if (a.to === "/consultants") {
                        router.push("/(tabs)/consultants");
                      } else if (a.to === "/wallet") {
                        router.push("/(tabs)/wallet");
                      }
                    }}
                    style={styles.actionItem}
                  >
                    <View style={styles.actionIconContainer}>
                      <IconComponent size={24} color={COLORS.primary} />
                    </View>
                    <Text style={styles.actionText} numberOfLines={1}>
                      {t(a.label)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Stats Section */}
            <SectionTitle
              action={<TrendingUp size={16} color={COLORS.success} />}
            >
              {t("Your impact")}
            </SectionTitle>
            <View style={styles.statsGrid}>
              {dynamicStats.map((s) => {
                const StatIcon = statIcons[s.icon] || Sparkles;
                return (
                  <GlassCard key={s.label} style={styles.statCard}>
                    <StatIcon size={20} color={COLORS.primary} style={styles.statIcon} />
                    <Text style={styles.statVal}>{s.value}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>
                      {s.label}
                    </Text>
                  </GlassCard>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {/* Profile Completion Modal */}
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType="slide"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalLogoContainer}>
                <Sparkles size={24} color="#12141a" />
              </View>
              <Text style={styles.modalTitle}>{t("Complete Profile")}</Text>
              <Text style={styles.modalSubtitle}>{t("Please provide your name and phone number to continue.")}</Text>
            </View>

            <View style={styles.modalForm}>
              {/* Full Name input */}
              <View style={styles.modalInputContainer}>
                <User size={18} color={COLORS.textMuted} style={styles.modalInputIcon} />
                <TextInput
                  placeholder={t("Full name")}
                  placeholderTextColor={COLORS.textMuted}
                  value={completeName}
                  onChangeText={setCompleteName}
                  style={styles.modalInput}
                />
              </View>

              {/* Phone number input */}
              <View style={styles.modalInputContainer}>
                <Phone size={18} color={COLORS.textMuted} style={styles.modalInputIcon} />
                <TextInput
                  placeholder={t("Phone number")}
                  placeholderTextColor={COLORS.textMuted}
                  value={completePhone}
                  onChangeText={setCompletePhone}
                  keyboardType="numeric"
                  maxLength={10}
                  style={styles.modalInput}
                />
              </View>
            </View>

            {modalErr ? <Text style={styles.modalErrorText}>{modalErr}</Text> : null}

            <Button
              title={t("Save & Continue")}
              full
              size="lg"
              loading={modalLoading}
              onPress={handleCompleteProfile}
              style={styles.modalSubmitBtn}
            />
          </GlassCard>
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userTextContainer: {
    justifyContent: "center",
  },
  greetingText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },
  topBarActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bellDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    position: "absolute",
    top: 10,
    right: 12,
    borderWidth: 1.5,
    borderColor: COLORS.card,
  },
  heroBanner: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  heroGlow: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    opacity: 0.15,
  },
  heroBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 12,
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  heroBtn: {
    marginTop: 16,
    alignSelf: "flex-start",
  },
  roomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  roomItem: {
    width: "22%",
    alignItems: "center",
  },
  roomImageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 6,
  },
  roomImage: {
    width: "100%",
    height: "100%",
  },
  roomText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textMuted,
    textAlign: "center",
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionItem: {
    width: "22%",
    alignItems: "center",
  },
  actionIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textMuted,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    width: "31%",
    alignItems: "center",
    paddingVertical: 14,
  },
  statIcon: {
    marginBottom: 4,
  },
  statVal: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: "center",
  },
  consultantBadgeContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  consultantBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  consultantBadgeText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#12141a",
  },
  schedulerCard: {
    padding: 16,
    marginBottom: 20,
  },
  inputGroup: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.cardAlt,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: COLORS.text,
    fontSize: 13,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 6,
  },
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
    marginBottom: 14,
  },
  weekdayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardAlt,
    borderColor: COLORS.border,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  weekdayTextActive: {
    color: "#12141a",
  },
  addSlotBtn: {
    width: "100%",
  },
  emptySessions: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptySessionsText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  sessionCard: {
    padding: 16,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  clientName: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  sessionTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusConfirmed: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  statusPending: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.text,
  },
  notesContainer: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 16,
  },
  sessionActions: {
    flexDirection: "column",
    gap: 8,
  },
  joinBtn: {
    width: "100%",
  },
  notesBtn: {
    width: "100%",
  },
  notesInputContainer: {
    marginTop: 8,
    width: "100%",
    gap: 8,
  },
  notesInput: {
    minHeight: 60,
    backgroundColor: COLORS.cardAlt,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    color: COLORS.text,
    fontSize: 13,
    textAlignVertical: "top",
  },
  notesActionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    padding: 24,
    borderRadius: 24,
    alignItems: "stretch",
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 16,
  },
  modalForm: {
    gap: 12,
    marginBottom: 16,
  },
  modalInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardAlt,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  modalInputIcon: {
    marginRight: 8,
  },
  modalInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
  modalErrorText: {
    color: COLORS.destructive,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  modalSubmitBtn: {
    marginTop: 8,
  },
});

// Since the rest of the styles don't reference schedulerTitle, we define it inline as styles.schedulerTitle below,
// but to be extremely safe, we declare it or keep its value.
const schedulerTitleStyle = {
  fontSize: 16,
  fontWeight: "800" as const,
  color: COLORS.text,
  marginBottom: 12,
};
