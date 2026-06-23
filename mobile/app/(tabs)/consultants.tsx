import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { SlidersHorizontal, Briefcase } from "lucide-react-native";
import { COLORS, Avatar, Chip, StarRating, useStyles, useTranslation } from "../../components/ui-kit";
import { useApp } from "../../store/app";
import { consultants } from "../../src/lib/mock";
import { useConsultantsQuery } from "../../hooks/useApi";

const sortFilters = ["Top Rated", "Nearby", "Budget", "Experience"];

export default function ConsultantsScreen() {
  const router = useRouter();
  const styles = useStyles(getStyles);
  const t = useTranslation();
  const [activeFilter, setActiveFilter] = useState("Top Rated");

  const { data: realConsultants, isLoading } = useConsultantsQuery();

  const displayConsultants = React.useMemo(() => {
    if (realConsultants && realConsultants.length > 0) {
      return realConsultants.map((c: any) => ({
        id: c.id,
        name: c.name || "Specialist Designer",
        specialty: c.specialty,
        experience: c.experience,
        price: c.price,
        rating: c.rating || 5.0,
        avatarSeed: c.avatarUrl || `user-${c.id}`,
        state: "Karnataka", // Fallback state/region
      }));
    }
    return [];
  }, [realConsultants]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Top Header Row */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t("Designers")}</Text>
          <Text style={styles.subtitle}>{t("Book verified interior experts")}</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
          <SlidersHorizontal size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Horizontal filter chips */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {sortFilters.map((f) => (
            <Chip
              key={f}
              active={activeFilter === f}
              onPress={() => setActiveFilter(f)}
            >
              {t(f)}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Consultants List */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={displayConsultants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => router.push(`/consultants/${item.id}`)}
            >
              <Avatar seed={item.avatarSeed} size={64} />
              <View style={styles.cardMid}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <StarRating value={item.rating} />
                </View>
                <Text style={styles.cardSpecialty} numberOfLines={1}>
                  {item.specialty}
                </Text>
                <View style={styles.cardMeta}>
                  <View style={styles.metaRow}>
                    <Briefcase size={13} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>{item.experience} {t("yrs exp")}</Text>
                  </View>
                  <Text style={styles.metaSeparator}>·</Text>
                  <Text style={styles.metaText}>{item.state}</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.cardPrice}>₹{item.price}</Text>
                <Text style={styles.cardPriceLabel}>/{t("session")}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (theme: "light" | "dark") => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },
  filterWrapper: {
    marginVertical: 14,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  cardMid: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
    justifyContent: "center",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
    flex: 1,
  },
  cardSpecialty: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  metaSeparator: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginHorizontal: 6,
  },
  cardRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.primary,
  },
  cardPriceLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
