import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "../lib/i18n";
import { useApp } from "../context/AppContext";

export default function DesignersScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const { designers, refreshDesigners } = useApp();
  const [loading, setLoading] = useState(designers.length === 0);

  useEffect(() => {
    if (designers.length === 0) {
      setLoading(true);
    }
    refreshDesigners().finally(() => {
      setLoading(false);
    });
  }, []);

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t("Designers")}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={designers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 20 }]}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: "/designer-details", params: { id: item.id } })}
              style={({ pressed }) => [
                styles.designerCard,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  opacity: pressed ? 0.95 : 1,
                  transform: [{ scale: pressed ? 0.99 : 1 }],
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Image source={getAvatarSource(item.avatarUrl)} style={styles.avatar} />
                <View style={styles.headerInfo}>
                  <Text style={[styles.nameText, { color: colors.foreground }]}>{item.name}</Text>
                  <Text style={[styles.specialtyText, { color: colors.mutedForeground }]}>{item.specialty}</Text>
                  
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={[styles.ratingText, { color: colors.foreground }]}>{item.rating}</Text>
                    <Text style={[styles.reviewsText, { color: colors.mutedForeground }]}>
                      ({item.reviewsCount} {t("reviews")})
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.cardFooter}>
                <View style={styles.footerDetail}>
                  <Feather name="briefcase" size={14} color={colors.primary} />
                  <Text style={[styles.footerText, { color: colors.foreground }]}>
                    {item.experience} {t("years")}
                  </Text>
                </View>

                <View style={styles.footerDetail}>
                  <Feather name="tag" size={14} color="#4CAF50" />
                  <Text style={[styles.priceText, { color: colors.foreground }]}>
                    ₹{item.price}/{t("hr")}
                  </Text>
                </View>

                <View style={[styles.bookBtn, { backgroundColor: colors.primary }]}>
                  <Text style={styles.bookBtnText}>{t("Book")}</Text>
                  <Feather name="arrow-right" size={14} color="#fff" />
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="users" size={48} color={colors.mutedForeground} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {t("No availability slots set up")}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  listContainer: {
    padding: 16,
  },
  designerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#eaeaea",
  },
  headerInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  specialtyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  reviewsText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  bookBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
