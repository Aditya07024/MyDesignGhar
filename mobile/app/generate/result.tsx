import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Heart, Share2, Bookmark, Download, RefreshCw, Users, Sparkles, CheckCircle2, Circle } from "lucide-react-native";
import { COLORS, Button, GlassCard, BeforeAfter, useStyles } from "../../components/ui-kit";
import { useApp } from "../../store/app";
import { useDesignDetailsQuery, useWalletBalanceQuery, usePurchaseImagesMutation } from "../../hooks/useApi";
import { DesignService } from "../../lib/api/services";

export default function ResultScreen() {
  const router = useRouter();
  const styles = useStyles(getStyles);
  const params = useLocalSearchParams();
  const { favorites, toggleFavorite } = useApp();

  const designId = (params.designId as string) || "";
  const { data: realDesign, isLoading, refetch } = useDesignDetailsQuery(designId);
  const { data: walletBalance = 0 } = useWalletBalanceQuery();
  const purchaseMutation = usePurchaseImagesMutation();

  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  const hasRealData = !!(realDesign && realDesign.images && realDesign.images.length > 0);

  const displayDesigns = useMemo(() => {
    if (hasRealData) {
      return realDesign.images.map((img: any, index: number) => ({
        id: img.id,
        title: `${realDesign.style} ${realDesign.roomType} Option ${index + 1}`,
        style: realDesign.style,
        room: realDesign.roomType,
        beforeSeed: realDesign.beforeUrl || (params.imageUri as string) || "",
        afterSeed: img.previewUrl as string,
        purchased: img.purchased || realDesign.isOwner || false,
      }));
    }

    // Fallback: backend is offline. Use the user's uploaded photo directly.
    const selectedRoom = (params.room as string) || "bedroom";
    const selectedStyle = (params.style as string) || "Modern";
    const userBeforeImage = (params.imageUri as string) || "";

    return [0, 1, 2].map((index) => ({
      id: `offline-${index}`,
      title: `${selectedStyle} ${selectedRoom} Concept ${index + 1}`,
      style: selectedStyle,
      room: selectedRoom,
      beforeSeed: userBeforeImage,
      afterSeed: userBeforeImage,
      purchased: false,
    }));
  }, [hasRealData, realDesign, params.imageUri, params.room, params.style]);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedImages(newSelected);
  };

  const handleShare = async (title: string) => {
    try {
      await Share.share({
        message: `Check out this amazing AI room redesign: "${title}" on MyDesignGhar!`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadPurchased = async (imageId: string) => {
    try {
      const res = await DesignService.getDownloadUrl(imageId);
      Alert.alert(
        "Download Link Ready",
        `High-res image is ready! Copy the link to open in your browser:\n\n${res.downloadUrl}`,
        [
          { text: "Close" }
        ]
      );
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to retrieve download link.");
    }
  };

  const handlePurchaseSingle = (imageId: string) => {
    if (walletBalance < 299) {
      Alert.alert(
        "Insufficient Balance",
        "You do not have enough wallet balance. Would you like to recharge?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Recharge", onPress: () => router.push("/(tabs)/wallet") }
        ]
      );
      return;
    }

    Alert.alert(
      "Confirm Purchase",
      "Purchase this design option for ₹299?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Buy Now",
          onPress: async () => {
            try {
              await purchaseMutation.mutateAsync([imageId]);
              refetch();
              Alert.alert("Success", "Design purchased successfully! High-resolution download is unlocked.");
            } catch (err: any) {
              Alert.alert("Purchase Failed", err.response?.data?.message || "Something went wrong.");
            }
          }
        }
      ]
    );
  };

  const handleCheckoutSelected = () => {
    const totalCost = selectedImages.size * 299;
    if (walletBalance < totalCost) {
      Alert.alert(
        "Insufficient Balance",
        `You need ₹${totalCost} but only have ₹${walletBalance}. Would you like to recharge?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Recharge", onPress: () => router.push("/(tabs)/wallet") }
        ]
      );
      return;
    }

    Alert.alert(
      "Confirm Purchase",
      `Purchase ${selectedImages.size} selected design(s) for ₹${totalCost}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Buy",
          onPress: async () => {
            try {
              const idsArray = Array.from(selectedImages);
              await purchaseMutation.mutateAsync(idsArray);
              setSelectedImages(new Set());
              refetch();
              Alert.alert("Success", "All selected designs purchased successfully!");
            } catch (err: any) {
              Alert.alert("Purchase Failed", err.response?.data?.message || "Something went wrong.");
            }
          }
        }
      ]
    );
  };

  if (designId && isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.textMuted, marginTop: 12 }}>Loading your designs...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your AI Designs</Text>
          <Text style={styles.headerSubtitle}>3 fresh concepts, just for you</Text>
        </View>
 
        {/* Status Banner */}
        {hasRealData ? (
          <View style={styles.successBanner}>
            <Sparkles size={20} color={COLORS.success} />
            <Text style={styles.successText}>Designs generated successfully!</Text>
          </View>
        ) : (
          <View style={[styles.successBanner, { backgroundColor: "rgba(140, 192, 235, 0.1)", borderColor: "rgba(140, 192, 235, 0.2)" }]}>
            <Sparkles size={20} color={COLORS.primary} />
            <Text style={[styles.successText, { color: COLORS.primaryDark }]}>
              Backend offline — using local fallbacks
            </Text>
          </View>
        )}
 
        {/* Generated list */}
        <View style={styles.list}>
          {displayDesigns.map((d: any) => {
            const isFav = favorites.includes(d.id);
            return (
              <GlassCard key={d.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {d.title}
                    </Text>
                    <Text style={styles.cardSubtitle}>
                      {d.style} · {d.room}
                    </Text>
                  </View>

                  {!d.purchased ? (
                    <TouchableOpacity
                      onPress={() => toggleSelection(d.id)}
                      style={styles.checkboxWrapper}
                    >
                      {selectedImages.has(d.id) ? (
                        <CheckCircle2 size={24} color={COLORS.primary} fill={COLORS.primaryDark} />
                      ) : (
                        <Circle size={24} color={COLORS.border} />
                      )}
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.purchasedBadge}>
                      <Text style={styles.purchasedText}>Unlocked</Text>
                    </View>
                  )}
                </View>

                <View style={{ position: "relative" }}>
                  <BeforeAfter beforeSeed={d.beforeSeed} afterSeed={d.afterSeed} height={220} />
                  {!d.purchased && (
                    <View style={{
                      ...StyleSheet.absoluteFillObject,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgba(0, 0, 0, 0.03)",
                      pointerEvents: "none",
                      zIndex: 10,
                    }}>
                      <Text style={{
                        fontSize: 28,
                        fontWeight: "900",
                        color: "rgba(255, 255, 255, 0.22)",
                        transform: [{ rotate: "-30deg" }],
                        letterSpacing: 4,
                      }}>
                        MYDESIGNGHAR PREVIEW
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.cardFooter}>
                  <View style={styles.iconRow}>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(d.id)}
                      style={[styles.iconBtn, isFav && styles.iconBtnActive]}
                    >
                      <Heart size={16} color={isFav ? COLORS.primary : COLORS.textMuted} fill={isFav ? COLORS.primary : "transparent"} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconBtn}>
                      <Bookmark size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleShare(d.title)} style={styles.iconBtn}>
                      <Share2 size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Button
                  title={d.purchased ? "Download High-Res" : "Download HD · ₹299"}
                  full
                  variant={d.purchased ? "success" : "primary"}
                  icon={<Download size={16} color={d.purchased ? "#ffffff" : "#12141a"} />}
                  onPress={() => d.purchased ? handleDownloadPurchased(d.id) : handlePurchaseSingle(d.id)}
                  style={styles.downloadBtn}
                />
              </GlassCard>
            );
          })}
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionsGrid}>
          <Button
            title="Regenerate"
            variant="outline"
            icon={<RefreshCw size={16} color={COLORS.text} />}
            onPress={() => router.push("/generate")}
            style={styles.actionBtn}
          />
          <Button
            title="Book Expert"
            variant="secondary"
            icon={<Users size={16} color={COLORS.text} />}
            onPress={() => router.push("/(tabs)/consultants")}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>

      {/* Floating Bottom Checkout Bar */}
      {selectedImages.size > 0 && (
        <View style={styles.checkoutBar}>
          <View style={styles.checkoutInfo}>
            <Text style={styles.checkoutTitle}>{selectedImages.size} selected</Text>
            <Text style={styles.checkoutPrice}>Total: ₹{selectedImages.size * 299}</Text>
          </View>
          <Button
            title="Buy Combined"
            onPress={handleCheckoutSelected}
            style={styles.checkoutBtn}
            loading={purchaseMutation.isPending}
          />
        </View>
      )}
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
    paddingBottom: 110,
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
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.2)",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 10,
    marginBottom: 20,
  },
  successText: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: "700",
  },
  list: {
    gap: 20,
  },
  card: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  checkboxWrapper: {
    padding: 4,
  },
  purchasedBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  purchasedText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: "700",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 12,
    paddingHorizontal: 4,
  },
  cardInfo: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  iconRow: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(140, 192, 235, 0.1)",
  },
  downloadBtn: {
    marginTop: 14,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
  },
  checkoutBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  checkoutInfo: {
    flexDirection: "column",
  },
  checkoutTitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  checkoutPrice: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: "800",
    marginTop: 2,
  },
  checkoutBtn: {
    minWidth: 120,
  },
});
