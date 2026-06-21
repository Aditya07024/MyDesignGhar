import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Linking,
  Alert,
  Clipboard,
} from "react-native";
import { Gift, Copy, Share2 } from "lucide-react-native";
import { COLORS, Button, GlassCard, useStyles, useTranslation } from "../components/ui-kit";
import { useApp } from "../store/app";

const code = "DemoUser150";
const stats = [
  { label: "Friends joined", value: "3" },
  { label: "Pending", value: "1" },
  { label: "Total earned", value: "₹450" },
];

export default function ReferralScreen() {
  const styles = useStyles(getStyles);
  const t = useTranslation();

  const handleCopy = () => {
    Clipboard.setString(code);
    Alert.alert(t("Code Copied"), t("Referral code '{code}' has been copied to your clipboard.").replace("{code}", code));
  };

  const handleShare = async (wa = false) => {
    const text = t("Redesign your home with AI on MyDezineGhar! Use my code {code} for ₹150 off. https://mydezineghar.app").replace("{code}", code);
    
    if (wa) {
      const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert(t("WhatsApp not installed"), t("WhatsApp could not be opened on your device."));
        }
      } catch (err) {
        // Fallback to standard share
        await Share.share({ message: text });
      }
    } else {
      try {
        await Share.share({ message: text });
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("Refer & Earn")}</Text>
        </View>

        {/* Gift Banner */}
        <View style={styles.banner}>
          <Gift size={44} color={COLORS.accent} style={styles.giftIcon} />
          <Text style={styles.bannerTitle}>{t("Earn ₹150 per friend")}</Text>
          <Text style={styles.bannerSubtitle}>{t("They get ₹150 off too. Everyone wins!")}</Text>
        </View>

        {/* Referral Code Row */}
        <Text style={styles.sectionHeading}>{t("Your referral code")}</Text>
        <TouchableOpacity
          onPress={handleCopy}
          activeOpacity={0.8}
          style={styles.codeContainer}
        >
          <Text style={styles.codeText}>{code}</Text>
          <Copy size={20} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Invite Buttons */}
        <View style={styles.btnRow}>
          <Button
            title={t("Invite Friends")}
            icon={<Share2 size={16} color="#12141a" />}
            onPress={() => handleShare(false)}
            style={styles.inviteBtn}
          />
          <Button
            title={t("WhatsApp")}
            variant="success"
            icon={<Share2 size={16} color="#ffffff" />}
            onPress={() => handleShare(true)}
            style={styles.inviteBtn}
          />
        </View>

        {/* Stats card */}
        <GlassCard style={styles.statsCard}>
          <View style={styles.statsRow}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statCol}>
                <Text style={styles.statVal}>{s.value}</Text>
                <Text style={styles.statLabel}>{t(s.label)}</Text>
              </View>
            ))}
          </View>
        </GlassCard>
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
  banner: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  giftIcon: {
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#ffffff",
  },
  bannerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: "center",
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 10,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(234, 179, 8, 0.05)",
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 56,
  },
  codeText: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: 2,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  inviteBtn: {
    flex: 1,
  },
  statsCard: {
    marginTop: 24,
    paddingVertical: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statVal: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
