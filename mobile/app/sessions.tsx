import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Calendar, Clock, Video } from "lucide-react-native";
import { COLORS, Avatar, Button, EmptyState, useStyles, useTranslation } from "../components/ui-kit";
import { useApp } from "../store/app";
import { useBookingsQuery } from "../hooks/useApi";

export default function SessionsScreen() {
  const router = useRouter();
  const styles = useStyles(getStyles);
  const t = useTranslation();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const { data: realBookings = [], isLoading } = useBookingsQuery();

  const handleJoinSession = (bookingId: string) => {
    router.push({
      pathname: "/call",
      params: { id: bookingId },
    });
  };

  const filteredList = realBookings.filter((b: any) => {
    const isUpcoming = b.status === "PENDING" || b.status === "CONFIRMED";
    return activeTab === "upcoming" ? isUpcoming : !isUpcoming;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("My Sessions")}</Text>
        </View>

        {/* Tabs Row */}
        <View style={styles.tabContainer}>
          {(["upcoming", "past"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.8}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabBtn,
                activeTab === tab && styles.tabBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === tab && styles.tabBtnTextActive,
                ]}
              >
                {tab === "upcoming" ? t("Upcoming") : t("Past")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sessions list */}
        {isLoading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : filteredList.length === 0 ? (
          <EmptyState
            icon={<Calendar size={32} color={COLORS.primary} />}
            title={activeTab === "upcoming" ? t("No upcoming sessions") : t("No past sessions")}
            body={t("Book an interior designer to get personalized recommendations.")}
          />
        ) : (
          <View style={styles.list}>
            {filteredList.map((s: any) => (
              <View key={s.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Avatar seed={s.id} size={48} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.consultantName}>{s.name}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaCol}>
                        <Calendar size={12} color={COLORS.textMuted} />
                        <Text style={styles.metaText}>
                          {new Date(s.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </Text>
                      </View>
                      <View style={[styles.metaCol, { marginLeft: 12 }]}>
                        <Clock size={12} color={COLORS.textMuted} />
                        <Text style={styles.metaText}>{s.time}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                {activeTab === "upcoming" && (
                  <Button
                    title={t("Join Session")}
                    size="sm"
                    icon={<Video size={14} color="#12141a" />}
                    onPress={() => handleJoinSession(s.id)}
                    style={styles.joinBtn}
                  />
                )}
              </View>
            ))}
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
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: COLORS.cardAlt,
  },
  tabBtnText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  tabBtnTextActive: {
    color: COLORS.text,
    fontWeight: "700",
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  consultantName: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  joinBtn: {
    marginTop: 12,
  },
});
