import React, { useState } from "react";
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
import { useRouter } from "expo-router";
import {
  Sparkles,
  Users,
  Compass,
  Upload,
  Rocket,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
} from "lucide-react-native";
import { COLORS, Button, useStyles, useTranslation } from "../components/ui-kit";

import heroBg from "../assets/hero-bg.png";
import blueprints from "../assets/blueprints.png";
import livingRoomAccent from "../assets/black-living-room-accent-colors.png";

const { width } = Dimensions.get("window");

export default function LandingScreen() {
  const router = useRouter();
  const styles = useStyles(getStyles);
  const t = useTranslation();
  const [activeTenet, setActiveTenet] = useState<number | null>(0);

  const steps = [
    { num: "01", icon: Upload, title: "Upload", desc: "Share photos of your space" },
    { num: "02", icon: Sparkles, title: "AI Render", desc: "Generate instant 3D styles" },
    { num: "03", icon: Users, title: "Consult", desc: "Review with top 5% experts" },
    { num: "04", icon: Compass, title: "Plan", desc: "Get transparent blueprints" },
    { num: "05", icon: Rocket, title: "Realize", desc: "Execute with zero commission" },
  ];

  const offers = [
    {
      title: "AI Room Generation",
      desc: "Upload a room photo and see it fully redesigned in 10+ visual styles instantly.",
      icon: Sparkles,
    },
    {
      title: "Expert Consultation",
      desc: "Connect with professional interior architects for space planning and budget guidance.",
      icon: Users,
    },
    {
      title: "Interactive Design Calls",
      desc: "Schedule high-definition 1-on-1 virtual design meetings with consultants directly.",
      icon: Compass,
    },
  ];

  const tenets = [
    {
      title: "AI-POWERED SPEED",
      content: "Generate high-fidelity, photorealistic 3D room renders in seconds. Visualize your dream space across multiple styles instantly before spending a single rupee.",
    },
    {
      title: "VETTED DESIGN EXPERTS",
      content: "Collaborate with the top 5% of Indian interior design talent. Our consultants are verified experts in space optimization, lighting, and materials.",
    },
    {
      title: "TRANSPARENT BLUEPRINTS",
      content: "Get direct lists of furniture sources, paint codes, and modular configurations with zero hidden vendor commissions. Save up to 35% compared to traditional agencies.",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Glow circles */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Sparkles size={18} color="#12141a" />
          </View>
          <Text style={styles.logoText}>
            MyDezine<Text style={{ color: COLORS.primary }}>Ghar</Text>
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          style={styles.loginBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.loginBtnText}>{t("Log In")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroBadge}>{t("AI-POWERED DESIGN PORTAL")}</Text>
          <Text style={styles.heroTitle}>
            {t("Transform Your Home")}{"\n"}
            <Text style={{ color: COLORS.primary }}>{t("with AI & Designers")}</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            {t("Generate photorealistic room designs in seconds and book 1-on-1 virtual consultations with India's top vetted design specialists.")}
          </Text>

          {/* Hero Banner Image */}
          <View style={styles.bannerWrapper}>
            <Image source={livingRoomAccent} style={styles.bannerImage} resizeMode="cover" />
            <View style={styles.bannerOverlay} />
          </View>

          <Button
            title={t("START DESIGNING")}
            size="lg"
            full
            onPress={() => router.push("/onboarding")}
            style={styles.heroCta}
          />
        </View>

        {/* Quote Banner */}
        <View style={styles.quoteCard}>
          <View style={styles.quoteBorder} />
          <Text style={styles.quoteText}>
            "{t("Our mission is to democratize premium interior design. By combining advanced AI visualization with real-time designer expertise, we make beautiful homes accessible to everyone.")}"
          </Text>
        </View>

        {/* 5D Process Section */}
        <View style={styles.section}>
          <Text style={styles.sectionSub}>{t("THE WORKFLOW")}</Text>
          <Text style={styles.sectionTitle}>{t("How MyDezineGhar Works")}</Text>
          <View style={styles.divider} />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.processScroll}
          >
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <View key={idx} style={styles.processItem}>
                  <View style={styles.processCircleContainer}>
                    <Text style={styles.processNum}>{step.num}</Text>
                    <View style={styles.processCircle}>
                      <StepIcon size={20} color={COLORS.primary} />
                    </View>
                    {idx < steps.length - 1 && <View style={styles.processLine} />}
                  </View>
                  <Text style={styles.processTitle}>{t(step.title)}</Text>
                  <Text style={styles.processDesc}>{t(step.desc)}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* What We Offer */}
        <View style={styles.section}>
          <Text style={styles.sectionSub}>{t("SERVICES")}</Text>
          <Text style={styles.sectionTitle}>{t("What We Offer")}</Text>
          <View style={styles.divider} />

          <View style={styles.offersGrid}>
            {offers.map((offer, idx) => {
              const OfferIcon = offer.icon;
              return (
                <View key={idx} style={styles.offerCard}>
                  <View style={styles.offerIconWrapper}>
                    <OfferIcon size={20} color="#12141a" />
                  </View>
                  <Text style={styles.offerCardTitle}>{t(offer.title)}</Text>
                  <Text style={styles.offerCardDesc}>{t(offer.desc)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>10k+</Text>
              <Text style={styles.statLbl}>{t("AI RENDERS")}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>500+</Text>
              <Text style={styles.statLbl}>{t("VETTED EXPERTS")}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>98.7%</Text>
              <Text style={styles.statLbl}>{t("SATISFACTION")}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>15m</Text>
              <Text style={styles.statLbl}>{t("MATCH TIME")}</Text>
            </View>
          </View>
        </View>

        {/* Core Design Philosophy */}
        <View style={styles.section}>
          <Text style={styles.sectionSub}>{t("PHILOSOPHY")}</Text>
          <Text style={styles.sectionTitle}>{t("Our Core Tenets")}</Text>
          <View style={styles.divider} />

          <View style={styles.tenetsContainer}>
            {tenets.map((tenet, idx) => {
              const isActive = activeTenet === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => setActiveTenet(isActive ? null : idx)}
                  style={[styles.tenetItem, isActive && styles.tenetItemActive]}
                >
                  <View style={styles.tenetHeader}>
                    <Text style={[styles.tenetTitle, isActive && styles.tenetTitleActive]}>
                      {idx + 1}. {t(tenet.title)}
                    </Text>
                    <ChevronDown
                      size={18}
                      color={isActive ? COLORS.primary : COLORS.textMuted}
                      style={{ transform: [{ rotate: isActive ? "180deg" : "0deg" }] }}
                    />
                  </View>
                  {isActive && <Text style={styles.tenetContent}>{t(tenet.content)}</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Footer CTA */}
        <View style={styles.footerCta}>
          <Text style={styles.footerTitle}>{t("Ready to Redesign Your Home?")}</Text>
          <Text style={styles.footerSubtitle}>
            {t("Step into the future of luxury interior styling with MyDezineGhar.")}
          </Text>

          <Button
            title={t("START AI DESIGN NOW")}
            size="lg"
            full
            onPress={() => router.push("/onboarding")}
            style={{ marginTop: 24 }}
          />

          <Text style={styles.copyright}>
            © {new Date().getFullYear()} MyDezineGhar. {t("All Rights Reserved.")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: "light" | "dark") => {
  const isDark = theme === "dark";
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    glowTop: {
      position: "absolute",
      top: -150,
      right: -100,
      width: 350,
      height: 350,
      borderRadius: 175,
      backgroundColor: "rgba(205, 162, 80, 0.15)",
      opacity: 0.7,
    },
    glowBottom: {
      position: "absolute",
      bottom: -150,
      left: -100,
      width: 350,
      height: 350,
      borderRadius: 175,
      backgroundColor: "rgba(184, 143, 62, 0.08)",
      opacity: 0.7,
    },
    header: {
      height: 60,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      zIndex: 10,
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    logoIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: COLORS.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: {
      fontSize: 18,
      fontWeight: "900",
      color: COLORS.text,
      letterSpacing: -0.5,
    },
    loginBtn: {
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(18, 20, 26, 0.05)",
      borderColor: COLORS.border,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 14,
    },
    loginBtnText: {
      color: COLORS.text,
      fontSize: 12,
      fontWeight: "700",
    },
    scrollContent: {
      paddingBottom: 40,
    },
    heroSection: {
      paddingHorizontal: 24,
      paddingTop: 30,
      alignItems: "center",
    },
    heroBadge: {
      fontSize: 11,
      fontWeight: "800",
      color: COLORS.primary,
      letterSpacing: 1.5,
      marginBottom: 12,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: "900",
      color: COLORS.text,
      textAlign: "center",
      lineHeight: 34,
      letterSpacing: -0.5,
    },
    heroSubtitle: {
      fontSize: 14,
      color: COLORS.textMuted,
      textAlign: "center",
      lineHeight: 22,
      marginTop: 14,
      paddingHorizontal: 10,
    },
    bannerWrapper: {
      width: "100%",
      height: 180,
      borderRadius: 24,
      overflow: "hidden",
      marginTop: 24,
      position: "relative",
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    bannerImage: {
      width: "100%",
      height: "100%",
    },
    bannerOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(10, 13, 20, 0.2)",
    },
    heroCta: {
      marginTop: 24,
    },
    quoteCard: {
      marginHorizontal: 24,
      marginTop: 32,
      backgroundColor: isDark ? "rgba(26, 32, 44, 0.6)" : "rgba(255, 255, 255, 0.8)",
      borderColor: COLORS.border,
      borderWidth: 1,
      borderRadius: 20,
      padding: 20,
      position: "relative",
      overflow: "hidden",
    },
    quoteBorder: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: COLORS.primary,
    },
    quoteText: {
      fontSize: 14,
      fontStyle: "italic",
      color: COLORS.text,
      lineHeight: 22,
      paddingLeft: 8,
      fontWeight: "500",
    },
    section: {
      marginTop: 40,
      paddingHorizontal: 24,
    },
    sectionSub: {
      fontSize: 10,
      fontWeight: "800",
      color: COLORS.primary,
      letterSpacing: 2,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: COLORS.text,
      marginTop: 4,
    },
    divider: {
      width: 40,
      height: 3,
      backgroundColor: COLORS.primary,
      marginTop: 8,
      marginBottom: 20,
      borderRadius: 2,
    },
    processScroll: {
      gap: 16,
      paddingRight: 24,
      paddingVertical: 8,
    },
    processItem: {
      width: 140,
      alignItems: "flex-start",
    },
    processCircleContainer: {
      flexDirection: "row",
      alignItems: "center",
      position: "relative",
      width: "100%",
      marginBottom: 12,
    },
    processNum: {
      fontSize: 24,
      fontWeight: "900",
      color: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      position: "absolute",
      left: -4,
      top: -12,
    },
    processCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? "#111215" : "#ffffff",
      borderWidth: 1.5,
      borderColor: COLORS.primary,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    processLine: {
      position: "absolute",
      left: 40,
      right: -16,
      height: 1,
      backgroundColor: COLORS.border,
      zIndex: 1,
    },
    processTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: COLORS.text,
    },
    processDesc: {
      fontSize: 11,
      color: COLORS.textMuted,
      lineHeight: 16,
      marginTop: 4,
    },
    offersGrid: {
      gap: 16,
    },
    offerCard: {
      backgroundColor: isDark ? "rgba(26, 32, 44, 0.5)" : "rgba(255, 255, 255, 0.8)",
      borderColor: COLORS.border,
      borderWidth: 1,
      borderRadius: 20,
      padding: 20,
    },
    offerIconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: COLORS.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    offerCardTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: COLORS.text,
    },
    offerCardDesc: {
      fontSize: 13,
      color: COLORS.textMuted,
      lineHeight: 18,
      marginTop: 6,
    },
    statsSection: {
      backgroundColor: isDark ? "#111215" : "#f0f2f5",
      marginTop: 40,
      paddingVertical: 24,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: COLORS.border,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      paddingHorizontal: 24,
    },
    statBox: {
      width: "48%",
      paddingVertical: 12,
      alignItems: "center",
    },
    statVal: {
      fontSize: 24,
      fontWeight: "900",
      color: COLORS.primary,
    },
    statLbl: {
      fontSize: 9,
      fontWeight: "800",
      color: COLORS.textMuted,
      letterSpacing: 1,
      marginTop: 4,
    },
    tenetsContainer: {
      gap: 12,
    },
    tenetItem: {
      backgroundColor: isDark ? "rgba(26, 32, 44, 0.5)" : "rgba(255, 255, 255, 0.8)",
      borderColor: COLORS.border,
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
    },
    tenetItemActive: {
      borderColor: COLORS.primary,
    },
    tenetHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    tenetTitle: {
      fontSize: 14,
      fontWeight: "800",
      color: COLORS.textMuted,
    },
    tenetTitleActive: {
      color: COLORS.text,
    },
    tenetContent: {
      fontSize: 13,
      color: COLORS.textMuted,
      lineHeight: 20,
      marginTop: 10,
    },
    footerCta: {
      marginTop: 48,
      paddingHorizontal: 24,
      alignItems: "center",
    },
    footerTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: COLORS.text,
      textAlign: "center",
    },
    footerSubtitle: {
      fontSize: 13,
      color: COLORS.textMuted,
      textAlign: "center",
      lineHeight: 20,
      marginTop: 8,
    },
    copyright: {
      fontSize: 11,
      color: COLORS.textMuted,
      marginTop: 32,
      textAlign: "center",
    },
  });
};
