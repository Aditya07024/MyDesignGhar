import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Sparkles, CheckCircle, Calendar, Gift } from "lucide-react-native";
import { COLORS, EmptyState, useStyles } from "../components/ui-kit";
import { useApp } from "../store/app";
import { notifications } from "../src/lib/mock";
import { useNotificationsQuery, useMarkNotificationsReadMutation, useMarkNotificationReadMutation } from "../hooks/useApi";

const icons: Record<string, any> = {
  design: Sparkles,
  payment: CheckCircle,
  reminder: Calendar,
  referral: Gift,
};

export default function NotificationsScreen() {
  const styles = useStyles(getStyles);
  const { data: realNotifications, isLoading } = useNotificationsQuery();
  const markReadMutation = useMarkNotificationsReadMutation();
  const markSingleReadMutation = useMarkNotificationReadMutation();

  // Removed auto-mark read on mount to support the manual read button

  const displayNotifications = React.useMemo(() => {
    if (realNotifications && realNotifications.length > 0) {
      return realNotifications.map((n: any) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type,
        unread: !n.isRead,
        time: new Date(n.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
      }));
    }
    return [];
  }, [realNotifications]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {displayNotifications.some((n: any) => n.unread) && (
            <TouchableOpacity
              onPress={() => markReadMutation.mutate()}
              style={styles.markReadBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.markReadText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : displayNotifications.length === 0 ? (
          <EmptyState
            icon={<Sparkles size={32} color={COLORS.primary} />}
            title="All caught up"
            body="You have no new notifications."
          />
        ) : (
          <View style={styles.list}>
            {displayNotifications.map((n: any) => {
              const Icon = icons[n.type] || Sparkles;
              return (
                <View
                  key={n.id}
                  style={[
                    styles.item,
                    n.unread ? styles.itemUnread : styles.itemRead,
                  ]}
                >
                  <View style={styles.iconContainer}>
                    <Icon size={18} color={COLORS.primary} />
                  </View>
                  <View style={styles.content}>
                    <View style={styles.row}>
                      <Text style={styles.itemTitle}>{n.title}</Text>
                      <Text style={styles.itemTime}>{n.time}</Text>
                    </View>
                    <Text style={styles.itemBody}>{n.body}</Text>
                  </View>
                  {n.unread && (
                    <TouchableOpacity
                      onPress={() => markSingleReadMutation.mutate(n.id)}
                      style={styles.readBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.readBtnText}>Read</Text>
                    </TouchableOpacity>
                  )}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
  },
  markReadBtn: {
    backgroundColor: "rgba(140, 192, 235, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(140, 192, 235, 0.3)",
  },
  markReadText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "700",
  },
  list: {
    gap: 10,
  },
  item: {
    flexDirection: "row",
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  itemUnread: {
    borderColor: "rgba(234, 179, 8, 0.25)",
    backgroundColor: "rgba(234, 179, 8, 0.05)",
  },
  itemRead: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  itemTime: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  itemBody: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  readBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  readBtnText: {
    color: "#12141a",
    fontSize: 11,
    fontWeight: "700",
  },
});
