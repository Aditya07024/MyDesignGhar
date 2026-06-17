import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
  StyleProp,
} from "react-native";

import { useApp } from "../store/app";

// Premium Color System
export const COLORS = {
  get primary() {
    return "#8CC0EB"; // Sky Blue Accent
  },
  get primaryDark() {
    return "#5b9ed3";
  },
  get background() {
    return useApp.getState().theme === "dark" ? "#12141a" : "#FFF9D2"; // Dark Gray vs Cream Base
  },
  get card() {
    return useApp.getState().theme === "dark" ? "#1a202c" : "#FFEBCC"; // Dark Card vs Peach Card
  },
  get cardAlt() {
    return useApp.getState().theme === "dark" ? "#2d3748" : "#ffd9a3"; // Dark Card Alt vs Alt Peach
  },
  get border() {
    return useApp.getState().theme === "dark" ? "#2d3748" : "#BFDDF0"; // Dark Border vs Light Blue Border
  },
  get text() {
    return useApp.getState().theme === "dark" ? "#f7fafc" : "#12141a"; // Light Text vs Dark Text
  },
  get textMuted() {
    return useApp.getState().theme === "dark" ? "#a0aec0" : "#4b5563";
  },
  get accent() {
    return "#8CC0EB";
  },
  get success() {
    return "#10b981";
  },
  get destructive() {
    return "#ef4444";
  },
};

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {},
  hi: {
    "Choose a room": "कमरा चुनें",
    "Quick actions": "त्वरित कार्रवाई",
    "Your impact": "आपका प्रभाव",
    "Generate Design": "डिज़ाइन बनाएं",
    "Redesign Your Room Today": "आज ही अपना कमरा नया रूप दें",
    "Upload a photo, pick a style, get magic.": "फोटो अपलोड करें, शैली चुनें, जादू देखें।",
    "Profile & Settings": "प्रोफ़ाइल और सेटिंग्स",
    "Log Out": "लॉग आउट",
    "Language": "भाषा",
    "Dark Mode": "डार्क मोड",
    "Delete Account": "खाता हटाएँ",
    "Delete Account Alert": "क्या आप वाकई अपना खाता स्थायी रूप से हटाना चाहते हैं? इस क्रिया को पूर्ववत नहीं किया जा सकता है।",
    "Delete success": "खाता सफलतापूर्वक हटा दिया गया है",
    "Logout Alert": "क्या आप लॉग आउट करना चाहते हैं?",
    "Cancel": "रद्द करें",
    "Save": "सहेजें",
    "Saving": "सहेज रहे हैं...",
    "Preferences": "पसंद",
    "Push Notifications": "पुश नोटिफिकेशन",
    "Legal & Languages": "कानूनी और भाषाएँ",
    "Notifications": "सूचनाएं",
    "Privacy Policy": "गोपनीयता नीति",
    "Terms & Conditions": "नियम और शर्तें",
    "Namaste 🙏": "नमस्ते 🙏",
    "Expert Marketplace": "विशेषज्ञ बाज़ार",
    "My Wallet": "मेरा वॉलेट",
    "My Designs": "मेरे डिज़ाइन",
    "Wallet": "वॉलेट",
    "Consultants": "सलाहकार",
    "Home": "होम",
    "Designs": "डिज़ाइन",
    "Choose a room style to generate details": "विवरण उत्पन्न करने के लिए एक कमरा शैली चुनें",
    "Settings": "सेटिंग्स",
    "Consultant Portal": "सलाहकार पोर्टल",
    "Expert Dashboard": "विशेषज्ञ डैशबोर्ड",
    "Total Bookings": "कुल बुकिंग",
    "Earnings": "कमाई",
    "Rating": "रेटिंग",
    "My Schedule": "मेरी अनुसूची",
    "Availability slots": "उपलब्धता स्लॉट",
    "Add Slot": "स्लॉट जोड़ें",
    "Select Date": "तारीख चुनें",
    "Select Time": "समय चुनें",
    "Time Slot (e.g. 10:00 AM)": "समय स्लॉट (जैसे 10:00 AM)",
    "No upcoming sessions": "कोई आगामी सत्र नहीं",
    "Join Video Consultation": "वीडियो परामर्श में शामिल हों",
    "Update Notes": "नोट्स अपडेट करें",
    "Add note": "नोट जोड़ें",
    "Save Notes": "नोट्स सहेजें",
    "Enter session notes...": "सत्र नोट्स दर्ज करें...",
    "Consultants Booked": "सलाहकार बुक किए गए",
    "Money Saved": "बचाए गए पैसे",
    "Designs Generated": "डिज़ाइन उत्पन्न किए गए",
  }
};

export function useTranslation() {
  const language = useApp((s) => s.language) || "en";
  return (key: string) => {
    return TRANSLATIONS[language]?.[key] || key;
  };
}

// Reusable Helper
export const img = (seed: string, w = 800, h = 600) => {
  if (!seed) return "";
  if (
    seed.startsWith("http://") ||
    seed.startsWith("https://") ||
    seed.startsWith("file://") ||
    seed.startsWith("content://") ||
    seed.startsWith("data:") ||
    seed.startsWith("/")
  ) {
    return seed;
  }
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
};

// --- BUTTON COMPONENT ---
interface ButtonProps {
  onPress?: () => void;
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  full?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  onPress,
  title,
  variant = "primary",
  size = "md",
  full = false,
  icon,
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isOutline = variant === "outline";
  const isGhost = variant === "ghost";
  const isSecondary = variant === "secondary";
  const isSuccess = variant === "success";

  let bg = COLORS.primary;
  let textCol = "#12141a";
  let borderCol = "transparent";

  if (isSecondary) {
    bg = COLORS.cardAlt;
    textCol = COLORS.text;
  } else if (isOutline) {
    bg = "transparent";
    textCol = COLORS.text;
    borderCol = COLORS.border;
  } else if (isGhost) {
    bg = "transparent";
    textCol = COLORS.primary;
  } else if (isSuccess) {
    bg = COLORS.success;
    textCol = "#ffffff";
  }

  const height = size === "sm" ? 36 : size === "lg" ? 54 : 46;
  const paddingH = size === "sm" ? 14 : size === "lg" ? 22 : 18;
  const fontSz = size === "sm" ? 13 : size === "lg" ? 16 : 14;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.btn,
        {
          backgroundColor: bg,
          borderColor: borderCol,
          borderWidth: borderCol !== "transparent" ? 1 : 0,
          height,
          paddingHorizontal: paddingH,
          width: full ? "100%" : undefined,
          opacity: disabled || loading ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textCol} />
      ) : (
        <View style={styles.btnContent}>
          {icon && <View style={styles.btnIcon}>{icon}</View>}
          <Text style={[styles.btnText, { color: textCol, fontSize: fontSz }]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// --- GLASS CARD ---
export function GlassCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

// --- CHIP ---
export function Chip({
  active,
  onPress,
  children,
}: {
  active?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        {
          backgroundColor: active ? COLORS.primary : COLORS.card,
          borderColor: active ? "transparent" : COLORS.border,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? "#12141a" : COLORS.textMuted },
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

// --- AVATAR ---
export function Avatar({ seed, size = 40 }: { seed: string; size?: number }) {
  return (
    <Image
      source={{ uri: img(`avatar-${seed}`, size * 2, size * 2) }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: COLORS.background,
      }}
    />
  );
}

// --- SKELETON ---
export function Skeleton({ style }: { style?: ViewStyle }) {
  return <View style={[styles.skeleton, style]} />;
}

// --- EMPTY STATE ---
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>{icon}</View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {action && <View style={styles.emptyAction}>{action}</View>}
    </View>
  );
}

// --- STAR RATING ---
export function StarRating({ value }: { value: number }) {
  return (
    <View style={styles.ratingContainer}>
      <Text style={styles.starText}>★</Text>
      <Text style={styles.ratingVal}>{value.toFixed(1)}</Text>
    </View>
  );
}

// --- SECTION TITLE ---
export function SectionTitle({
  children,
  action,
}: {
  children: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitleText}>{children}</Text>
      {action}
    </View>
  );
}

// --- BEFORE AFTER VISUALIZER ---
const resolveUri = (seedOrUrl: string) => {
  if (!seedOrUrl) return "";
  if (
    seedOrUrl.startsWith("http://") ||
    seedOrUrl.startsWith("https://") ||
    seedOrUrl.startsWith("file://") ||
    seedOrUrl.startsWith("content://") ||
    seedOrUrl.startsWith("data:") ||
    seedOrUrl.startsWith("/")
  ) {
    return seedOrUrl;
  }
  return img(seedOrUrl, 800, 600);
};

export function BeforeAfter({
  beforeSeed,
  afterSeed,
  height = 240,
}: {
  beforeSeed: string;
  afterSeed: string;
  height?: number;
}) {
  const [showAfter, setShowAfter] = React.useState(true);

  return (
    <View style={[styles.baContainer, { height }]}>
      <Image
        source={{
          uri: showAfter
            ? resolveUri(afterSeed)
            : resolveUri(beforeSeed),
        }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      
      {/* Before / After Label */}
      <View style={styles.baHeader}>
        <View style={[styles.baBadge, { backgroundColor: showAfter ? COLORS.primary : COLORS.cardAlt }]}>
          <Text style={[styles.baBadgeText, { color: showAfter ? "#12141a" : COLORS.text }]}>
            {showAfter ? "AFTER DESIGN" : "BEFORE DESIGN"}
          </Text>
        </View>
      </View>

      {/* Toggle Control Bar at the Bottom */}
      <View style={styles.baControls}>
        <TouchableOpacity
          onPress={() => setShowAfter(false)}
          style={[styles.baBtn, !showAfter && styles.baBtnActive]}
        >
          <Text style={[styles.baBtnText, !showAfter && styles.baBtnTextActive]}>Before</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowAfter(true)}
          style={[styles.baBtn, showAfter && styles.baBtnActive]}
        >
          <Text style={[styles.baBtnText, showAfter && styles.baBtnTextActive]}>After AI Redesign</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnIcon: {
    marginRight: 8,
  },
  btnText: {
    fontWeight: "700",
  },
  glassCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  chip: {
    borderRadius: 100,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  skeleton: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    opacity: 0.6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 280,
  },
  emptyAction: {
    width: "100%",
    maxWidth: 200,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starText: {
    color: COLORS.accent,
    fontSize: 16,
    marginRight: 4,
  },
  ratingVal: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    flex: 1,
  },
  baContainer: {
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  baHeader: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  baBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  baBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  baControls: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: "rgba(18, 20, 26, 0.85)",
    borderRadius: 14,
    padding: 4,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  baBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  baBtnActive: {
    backgroundColor: COLORS.primary,
  },
  baBtnText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  baBtnTextActive: {
    color: "#12141a",
    fontWeight: "700",
  },
});

export function useStyles<T>(
  styleFactory: (theme: "light" | "dark") => T
): T {
  const theme = useApp((s) => s.theme);
  return React.useMemo(() => styleFactory(theme), [theme, styleFactory]);
}

