import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CheckCircle, CreditCard } from "lucide-react-native";
import { COLORS, Button, Chip, GlassCard, useStyles, useTranslation } from "../components/ui-kit";
import { useApp } from "../store/app";
import { consultants, timeSlots } from "../src/lib/mock";

const days = [
  { d: "Mon", n: 9 },
  { d: "Tue", n: 10 },
  { d: "Wed", n: 11 },
  { d: "Thu", n: 12 },
  { d: "Fri", n: 13 },
];

export default function BookingScreen() {
  const router = useRouter();
  const styles = useStyles(getStyles);
  const params = useLocalSearchParams();
  const t = useTranslation();
  
  const consultantId = typeof params.c === "string" ? params.c : "c1";
  const consultant = consultants.find((x) => x.id === consultantId) ?? consultants[0];

  const [day, setDay] = useState(10);
  const [slot, setSlot] = useState(timeSlots[1]);
  const [step, setStep] = useState<"select" | "pay" | "done">("select");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  if (step === "done") {
    return (
      <SafeAreaView style={styles.doneContainer}>
        <View style={styles.doneContent}>
          <CheckCircle size={80} color={COLORS.success} style={styles.doneIcon} />
          <Text style={styles.doneTitle}>{t("Booking confirmed!")}</Text>
          <Text style={styles.doneSubtitle}>
            {t("Your session with {name} is set for Jun {day}, {slot}.").replace("{name}", consultant.name).replace("{day}", day.toString()).replace("{slot}", slot)}
          </Text>
          
          <Button
            title={t("View my sessions")}
            full
            onPress={() => router.replace("/sessions")}
            style={styles.doneBtn}
          />
          <Button
            title={t("Back to home")}
            variant="ghost"
            full
            onPress={() => router.replace("/(tabs)/home")}
            style={styles.doneGhostBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
    return (
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={[styles.summaryVal, bold && styles.summaryValBold]}>
          {value}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {step === "select" ? t("Book Session") : t("Payment")}
          </Text>
          <Text style={styles.headerSubtitle}>{consultant.name}</Text>
        </View>

        {step === "select" ? (
          <>
            <Text style={styles.sectionHeading}>{t("Select a date")}</Text>
            <View style={styles.daysRow}>
              {days.map((dd) => (
                <TouchableOpacity
                  key={dd.n}
                  activeOpacity={0.8}
                  onPress={() => setDay(dd.n)}
                  style={[
                    styles.dayCard,
                    day === dd.n ? styles.dayCardActive : styles.dayCardInactive,
                  ]}
                >
                  <Text style={[styles.dayName, day === dd.n && styles.dayTextActive]}>
                    {t(dd.d)}
                  </Text>
                  <Text style={[styles.dayNumber, day === dd.n && styles.dayTextActive]}>
                    {dd.n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionHeading}>{t("Select a time")}</Text>
            <View style={styles.slotsWrapper}>
              {timeSlots.map((tVal) => (
                <Chip key={tVal} active={slot === tVal} onPress={() => setSlot(tVal)}>
                  {tVal}
                </Chip>
              ))}
            </View>

            {/* Booking Summary */}
            <GlassCard style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{t("Booking summary")}</Text>
              <SummaryRow label={t("Designer")} value={consultant.name} />
              <SummaryRow label={t("Date & time")} value={`${t("Jun")} ${day}, ${slot}`} />
              <SummaryRow label={t("Session fee")} value={`₹${consultant.price}`} />
            </GlassCard>

            <Button
              title={t("Proceed to Payment")}
              full
              size="lg"
              onPress={() => setStep("pay")}
              style={styles.actionBtn}
            />
          </>
        ) : (
          <>
            <GlassCard style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{t("Order summary")}</Text>
              <SummaryRow label={t("Consultation")} value={`₹${consultant.price}`} />
              <SummaryRow label={t("Platform fee")} value="₹49" />
              <View style={styles.divider} />
              <SummaryRow label={t("Total")} value={`₹${consultant.price + 49}`} bold />
            </GlassCard>

            <Text style={styles.sectionHeading}>{t("Payment method")}</Text>
            <View style={styles.paymentMethods}>
              {["UPI", "Credit / Debit Card", "Wallet Balance"].map((m) => {
                const isActive = paymentMethod === m;
                return (
                  <TouchableOpacity
                    key={m}
                    activeOpacity={0.8}
                    onPress={() => setPaymentMethod(m)}
                    style={[
                      styles.payMethodCard,
                      isActive ? styles.payMethodActive : styles.payMethodInactive,
                    ]}
                  >
                    <View style={styles.radioOuter}>
                      {isActive && <View style={styles.radioInner} />}
                    </View>
                    <CreditCard size={18} color={COLORS.textMuted} style={styles.payIcon} />
                    <Text style={styles.payMethodText}>{t(m)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button
              title={`${t("Pay")} ₹${consultant.price + 49}`}
              full
              size="lg"
              onPress={() => setStep("done")}
              style={styles.actionBtn}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// SummaryRow is defined inline inside the component to access the dynamic theme styles.

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
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 10,
  },
  daysRow: {
    flexDirection: "row",
    gap: 8,
  },
  dayCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  dayCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(234, 179, 8, 0.1)",
  },
  dayCardInactive: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  dayName: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 2,
  },
  dayTextActive: {
    color: COLORS.primary,
  },
  slotsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  summaryCard: {
    marginTop: 24,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  summaryValBold: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  actionBtn: {
    marginTop: 24,
  },
  doneContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  doneContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  doneIcon: {
    marginBottom: 20,
  },
  doneTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },
  doneSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: "700",
    color: COLORS.text,
  },
  doneBtn: {
    marginTop: 32,
  },
  doneGhostBtn: {
    marginTop: 8,
  },
  paymentMethods: {
    gap: 8,
  },
  payMethodCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 52,
  },
  payMethodActive: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(234, 179, 8, 0.05)",
  },
  payMethodInactive: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  payIcon: {
    marginRight: 10,
  },
  payMethodText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
});
