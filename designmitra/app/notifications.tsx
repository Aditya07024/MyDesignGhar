import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "../lib/i18n";
import { NotificationService } from "../lib/api/services";

export default function NotificationsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);

  async function fetchNotifications() {
    try {
      const res = await NotificationService.list();
      setNotificationsList(res.notifications || res || []);
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    fetchNotifications();
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
      setNotificationsList((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.warn("Failed to mark notification as read:", err);
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case "design":
        return <Feather name="image" size={18} color={colors.primary} />;
      case "payment":
        return <Feather name="credit-card" size={18} color="#4CAF50" />;
      default:
        return <Feather name="bell" size={18} color={colors.mutedForeground} />;
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t("Notifications")}</Text>
        {notificationsList.some((n) => !n.isRead) ? (
          <TouchableOpacity onPress={handleMarkAllNotificationsRead}>
            <Text style={[styles.markReadText, { color: colors.primary }]}>{t("Mark all read")}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
          }
        >
          {notificationsList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.noItemsText, { color: colors.mutedForeground }]}>{t("No notifications yet")}</Text>
            </View>
          ) : (
            notificationsList.map((n) => (
              <TouchableOpacity
                key={n.id}
                onPress={() => !n.isRead && handleMarkNotificationRead(n.id)}
                style={[
                  styles.notificationItem,
                  {
                    borderColor: colors.border,
                    backgroundColor: n.isRead ? colors.card : colors.primary + "07",
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <View style={[styles.iconContainer, { backgroundColor: colors.muted }]}>
                  {getNotificationIcon(n.type)}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    {!n.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                    <Text style={[styles.notificationTitle, { color: colors.foreground, fontWeight: n.isRead ? "600" : "700" }]}>
                      {t(n.title)}
                    </Text>
                  </View>
                  <Text style={[styles.notificationBody, { color: colors.mutedForeground }]}>{t(n.body)}</Text>
                  <Text style={[styles.notificationTime, { color: colors.mutedForeground }]}>
                    {new Date(n.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    justifyContent: "space-between",
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  markReadText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  scroll: { padding: 16 },
  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 100, gap: 12 },
  noItemsText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  notificationItem: {
    flexDirection: "row",
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadDot: { width: 6, height: 6, borderRadius: 3 },
  notificationTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  notificationBody: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 18 },
  notificationTime: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 6 },
});
