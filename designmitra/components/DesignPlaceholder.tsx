import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "../lib/i18n";
import { DesignService } from "../lib/api/services";

export interface DesignPlaceholderProps {
  id: string;
  color: string;
  user: string;
  city: string;
  likes: number;
  style: string;
  room: string;
  imageUri?: string;
}

export function DesignPlaceholder({ id, color, user, city, likes, style, room, imageUri }: DesignPlaceholderProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  async function handleLike() {
    setLiked((v) => !v);
    setLikeCount((n) => liked ? n - 1 : n + 1);
    try {
      if (id && id.length > 5) {
        await DesignService.likeChallengeEntry(id);
      }
    } catch (err) {
      console.warn("Failed to like design:", err);
    }
  }

  return (
    <Pressable style={[styles.communityCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      <View style={styles.communityImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} />
        ) : (
          <LinearGradient
            colors={[color, color + "88"]}
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={styles.styleTag}>
          <Text style={styles.styleTagText}>{style}</Text>
        </View>
        <Pressable onPress={handleLike} style={styles.heartBtn}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={18} color={liked ? "#E53935" : "#fff"} />
        </Pressable>
      </View>
      <View style={styles.communityInfo}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.communityUser, { color: colors.foreground }]}>{user}</Text>
          <Text style={[styles.communityLoc, { color: colors.mutedForeground }]}>
            {city} · {room}
          </Text>
        </View>
        <View style={styles.likesRow}>
          <Ionicons name="heart" size={14} color="#E53935" />
          <Text style={[styles.likesText, { color: colors.mutedForeground }]}>{likeCount}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  communityCard: {
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 4,
  },
  communityImage: {
    height: 140,
    width: "100%",
    position: "relative",
  },
  styleTag: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  styleTagText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  heartBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  communityInfo: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  communityUser: {
    fontSize: 14,
    fontWeight: "700",
  },
  communityLoc: {
    fontSize: 12,
    marginTop: 2,
  },
  likesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  likesText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
