import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { Design } from "@/context/AppContext";

type Props = {
  design: Design;
  onPress: () => void;
  onFavorite?: () => void;
  onDelete?: () => void;
  compact?: boolean;
};

export function DesignCard({ design, onPress, onFavorite, onDelete, compact }: Props) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={[styles.imageContainer, { borderRadius: colors.radius }]}>
        <Image
          source={{ uri: design.imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
        {!design.isPurchased && (
          <View style={[styles.watermarkOverlay]}>
            <Text style={styles.watermark}>MyDesignGhar</Text>
          </View>
        )}
        <View
          style={[styles.badge, { backgroundColor: design.isPurchased ? colors.success : colors.accent }]}
        >
          <Text style={[styles.badgeText, { color: design.isPurchased ? "#fff" : colors.accentForeground }]}>
            {design.isPurchased ? "Purchased" : "Preview"}
          </Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={[styles.styleName, { color: colors.foreground }]} numberOfLines={1}>
          {design.styleName}
        </Text>
        {!compact && (
          <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={1}>
            {design.description}
          </Text>
        )}
        <View style={styles.row}>
          <Text style={[styles.budget, { color: colors.primary }]}>{design.budget}</Text>
          <View style={styles.actions}>
            {onFavorite && (
              <Pressable onPress={onFavorite} style={styles.action}>
                <Ionicons
                  name={design.isFavorite ? "heart" : "heart-outline"}
                  size={18}
                  color={design.isFavorite ? colors.destructive : colors.mutedForeground}
                />
              </Pressable>
            )}
            {onDelete && (
              <Pressable onPress={onDelete} style={styles.action}>
                <Feather name="trash-2" size={16} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 150,
  },
  watermarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  watermark: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 18,
    fontWeight: "800",
    transform: [{ rotate: "-30deg" }],
    letterSpacing: 2,
    fontFamily: "Inter_700Bold",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  info: {
    padding: 10,
    gap: 4,
  },
  styleName: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  desc: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  budget: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  action: {
    padding: 4,
  },
});
