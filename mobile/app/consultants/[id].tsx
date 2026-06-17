import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Briefcase, Star, Calendar } from "lucide-react-native";
import {
  COLORS,
  Avatar,
  Button,
  EmptyState,
  GlassCard,
  StarRating,
  img,
  useStyles,
} from "../../components/ui-kit";
import { useApp } from "../../store/app";
import { consultants, reviews } from "../../src/lib/mock";
import { useConsultantDetailsQuery } from "../../hooks/useApi";
import { ActivityIndicator } from "react-native";

export default function ConsultantDetailScreen() {
  const router = useRouter();
  const styles = useStyles(getStyles);
  const { id } = useLocalSearchParams();

  const { data: realConsultant, isLoading } = useConsultantDetailsQuery(id as string);

  const c = React.useMemo(() => {
    if (realConsultant) {
      return {
        id: realConsultant.id,
        name: realConsultant.name,
        specialty: realConsultant.specialty,
        experience: realConsultant.experience,
        bio: realConsultant.bio,
        price: realConsultant.price,
        rating: realConsultant.rating || 5.0,
        reviews: realConsultant.reviewsCount || 0,
        avatarSeed: realConsultant.avatarUrl || `user-${realConsultant.id}`,
        state: "Karnataka", // Fallback state/region
        portfolio: realConsultant.portfolios?.map((p: any) => p.imageUrl) || ["room-living"],
      };
    }
    return consultants.find((x) => x.id === id);
  }, [realConsultant, id]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!c) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon={<Star size={32} color={COLORS.primary} />}
          title="Designer not found"
          body="This designer doesn't exist or couldn't be loaded."
          action={
            <Button
              title="Go back"
              onPress={() => router.back()}
            />
          }
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileHeader}>
          <Avatar seed={c.avatarSeed} size={88} />
          <Text style={styles.name}>{c.name}</Text>
          <Text style={styles.subtext}>
            {c.specialty} · {c.state}
          </Text>

          {/* Stats pills */}
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>{c.rating}★</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>{c.reviews}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>{c.experience}y</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
          </View>
        </View>

        {/* About Bio */}
        <Text style={styles.sectionHeading}>About</Text>
        <Text style={styles.bioText}>{c.bio}</Text>

        {/* Portfolio Carousel */}
        <Text style={styles.sectionHeading}>Portfolio</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.portfolioScroll}
        >
          {c.portfolio.map((p: string) => (
            <Image
              key={p}
              source={{ uri: img(p, 360, 360) }}
              style={styles.portfolioImg}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* Availability */}
        <Text style={styles.sectionHeading}>Availability</Text>
        <GlassCard style={styles.availCard}>
          <Calendar size={18} color={COLORS.primary} style={styles.availIcon} />
          <Text style={styles.availText}>
            Next available: <Text style={styles.availBold}>Tomorrow, 11:30 AM</Text>
          </Text>
        </GlassCard>

        {/* Reviews List */}
        <Text style={styles.sectionHeading}>Reviews</Text>
        <View style={styles.reviewsList}>
          {reviews.map((r) => (
            <View key={r.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{r.name}</Text>
                <StarRating value={r.rating} />
              </View>
              <Text style={styles.reviewText}>{r.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View style={styles.stickyFooter}>
        <View style={styles.footerPriceContainer}>
          <Text style={styles.footerPrice}>₹{c.price}</Text>
          <Text style={styles.footerPriceLabel}>per session</Text>
        </View>
        <Button
          title="Book Consultation"
          icon={<Briefcase size={16} color="#12141a" />}
          onPress={() => router.push({ pathname: "/booking", params: { c: c.id } })}
          style={styles.bookBtn}
        />
      </View>
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
    paddingBottom: 120, // offset for sticky footer
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
  profileHeader: {
    alignItems: "center",
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 12,
  },
  subtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  statPill: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
    minWidth: 80,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 10,
  },
  bioText: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  portfolioScroll: {
    gap: 12,
  },
  portfolioImg: {
    width: 120,
    height: 120,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  availCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  availIcon: {
    marginRight: 10,
  },
  availText: {
    fontSize: 13,
    color: COLORS.text,
  },
  availBold: {
    fontWeight: "700",
  },
  reviewsList: {
    gap: 10,
  },
  reviewItem: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },
  reviewText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
    lineHeight: 18,
  },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(30, 34, 43, 0.95)",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerPriceContainer: {
    justifyContent: "center",
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.primary,
  },
  footerPriceLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  bookBtn: {
    flex: 1,
    marginLeft: 20,
  },
});
