import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Download, Share2, Trash2, RefreshCw, Heart } from "lucide-react-native";
import { COLORS, Button, EmptyState, BeforeAfter, img, useStyles } from "../../components/ui-kit";
import { useApp } from "../../store/app";
import { designs } from "../../src/lib/mock";
import { useDesignDetailsQuery, usePurchaseImagesMutation, useWalletBalanceQuery } from "../../hooks/useApi";
import { DesignService } from "../../lib/api/services";
import { ActivityIndicator, Platform } from "react-native";

export default function DesignDetailScreen() {
  const router = useRouter();
  const styles = useStyles(getStyles);
  const { id } = useLocalSearchParams();
  const { favorites, toggleFavorite } = useApp();

  const { data: realDesign, isLoading } = useDesignDetailsQuery(id as string);
  const purchaseMutation = usePurchaseImagesMutation();
  const { data: walletBalance = 0 } = useWalletBalanceQuery();

  const d = React.useMemo(() => {
    if (realDesign) {
      const firstImage = realDesign.images?.[0];
      return {
        id: realDesign.id,
        title: `${realDesign.style} ${realDesign.roomType}`,
        style: realDesign.style,
        room: realDesign.roomType,
        beforeSeed: realDesign.beforeUrl || "",
        afterSeed: firstImage ? firstImage.previewUrl : "",
        purchased: realDesign.purchased || realDesign.isOwner,
      };
    }
    return designs.find((x) => x.id === id);
  }, [realDesign, id]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!d) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon={<RefreshCw size={32} color={COLORS.primary} />}
          title="Design not found"
          body="This design no longer exists or couldn't be loaded."
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

  const isFav = favorites.includes(d.id);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Look at this incredible design details for "${d.title}" (${d.style} style ${d.room}) I created on MyDezineGhar!`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    if (d.purchased) {
      const firstImage = realDesign?.images?.[0];
      if (firstImage) {
        DesignService.getDownloadUrl(firstImage.id)
          .then((res) => {
            if (Platform.OS === "web") {
              window.open(res.downloadUrl, "_blank");
            } else {
              Alert.alert(
                "Download Link Ready",
                `High-res image is ready! Copy the link to open in your browser:\n\n${res.downloadUrl}`,
                [{ text: "Close" }]
              );
            }
          })
          .catch((err) => {
            Alert.alert("Error", err.response?.data?.message || "Failed to retrieve download link.");
          });
      } else {
        Alert.alert("Success", "HD design saved to your photo gallery.");
      }
    } else {
      const firstImage = realDesign?.images?.[0];
      if (!firstImage) {
        Alert.alert("Error", "No image found to purchase.");
        return;
      }

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

      if (Platform.OS === "web") {
        const confirmBuy = window.confirm("Purchase this design option for ₹299 from your wallet?");
        if (confirmBuy) {
          performPurchase(firstImage.id);
        }
        return;
      }

      Alert.alert(
        "Purchase HD Design",
        "Get high-resolution, watermark-free render files for ₹299. The cost will be debited from your wallet.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Confirm & Buy",
            onPress: () => performPurchase(firstImage.id),
          },
        ]
      );
    }
  };

  const performPurchase = async (imageId: string) => {
    try {
      await purchaseMutation.mutateAsync([imageId]);
      if (Platform.OS === "web") {
        alert("Design purchased successfully! High-resolution download is unlocked.");
      } else {
        Alert.alert("Success", "Design purchased successfully! High-resolution download is unlocked.");
      }
    } catch (err: any) {
      if (Platform.OS === "web") {
        alert("Purchase Failed: " + (err.response?.data?.message || "Something went wrong."));
      } else {
        Alert.alert("Purchase Failed", err.response?.data?.message || "Something went wrong.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{d.title}</Text>
            <Text style={styles.headerSubtitle}>
              {d.style} · {d.room}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => toggleFavorite(d.id)}
            style={[styles.favBtn, isFav && styles.favBtnActive]}
          >
            <Heart size={20} color={isFav ? COLORS.primary : COLORS.textMuted} fill={isFav ? COLORS.primary : "transparent"} />
          </TouchableOpacity>
        </View>

        {/* Large Main Render */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: img(d.afterSeed, 900, 700) }} style={styles.mainImage} resizeMode="cover" />
          {!d.purchased && (
            <View style={{
              ...StyleSheet.absoluteFillObject,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.03)",
              pointerEvents: "none",
            }}>
              <Text style={{
                fontSize: 32,
                fontWeight: "900",
                color: "rgba(255, 255, 255, 0.22)",
                transform: [{ rotate: "-30deg" }],
                letterSpacing: 4,
              }}>
                MYDEZINEGHAR PREVIEW
              </Text>
            </View>
          )}
        </View>

        {/* Before After Slider */}
        <Text style={styles.sectionTitle}>Before & After comparison</Text>
        <BeforeAfter beforeSeed={d.beforeSeed} afterSeed={d.afterSeed} height={200} />

        {/* Action Button Grid */}
        <View style={styles.actionsGrid}>
          <Button
            title={d.purchased ? "Download HD" : "Buy HD · ₹299"}
            icon={<Download size={16} color="#12141a" />}
            onPress={handleDownload}
            style={styles.actionBtn}
          />
          <Button
            title="Share Design"
            variant="outline"
            icon={<Share2 size={16} color="#ffffff" />}
            onPress={handleShare}
            style={styles.actionBtn}
          />
          <Button
            title="Regenerate"
            variant="outline"
            icon={<RefreshCw size={16} color="#ffffff" />}
            onPress={() => router.push("/generate")}
            style={styles.actionBtn}
          />
          <Button
            title="Delete Design"
            variant="ghost"
            icon={<Trash2 size={16} color={COLORS.destructive} />}
            onPress={() => {
              Alert.alert("Delete Design", "Are you sure you want to delete this design?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => router.back(),
                },
              ]);
            }}
            style={[styles.actionBtn, styles.deleteBtn]}
          />
        </View>
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 10,
  },
  headerText: {
    flex: 1,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  favBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },
  favBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(234, 179, 8, 0.1)",
  },
  imageContainer: {
    height: 240,
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 10,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 24,
    rowGap: 12,
  },
  actionBtn: {
    width: "48%",
  },
  deleteBtn: {
    borderColor: COLORS.destructive,
  },
});
