import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, Plus, ImageOff } from "lucide-react-native";
import { COLORS, Button, Chip, EmptyState, useStyles } from "../../components/ui-kit";
import { useApp } from "../../store/app";
import { designs, img } from "../../src/lib/mock";
import { useDesignsQuery } from "../../hooks/useApi";

const filters = ["All", "Purchased", "Favorites", "Recent"] as const;

export default function DesignsScreen() {
  const router = useRouter();
  const styles = useStyles(getStyles);
  const favorites = useApp((s) => s.favorites);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [q, setQ] = useState("");

  const { data: realDesigns, isLoading, refetch } = useDesignsQuery();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const displayList = useMemo(() => {
    if (realDesigns) {
      return realDesigns.map((d: any) => {
        const firstImage = d.images?.[0];
        return {
          id: d.id,
          title: `${d.style} ${d.roomType}`,
          style: d.style,
          room: d.roomType,
          date: new Date(d.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          }),
          purchased: true, // User generated these, so they are unlocked
          afterSeed: firstImage ? firstImage.previewUrl : "",
        };
      });
    }
    return [];
  }, [realDesigns]);

  const filteredList = useMemo(() => {
    let l = displayList;
    if (filter === "Purchased") l = l.filter((d: any) => d.purchased);
    if (filter === "Favorites") l = l.filter((d: any) => favorites.includes(d.id));
    if (filter === "Recent") l = l.slice(0, 4);
    if (q.trim()) {
      l = l.filter((d: any) =>
        (d.title + d.style + d.room)
          .toLowerCase()
          .includes(q.toLowerCase())
      );
    }
    return l;
  }, [filter, q, favorites, displayList]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Designs</Text>
        <Button
          title="New"
          size="sm"
          icon={<Plus size={16} color="#12141a" />}
          onPress={() => router.push("/generate")}
        />
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Search size={20} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search designs..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.searchInput}
        />
      </View>

      {/* Filters list horizontal scrolling */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filters.map((f) => (
            <Chip key={f} active={filter === f} onPress={() => setFilter(f)}>
              {f}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={[styles.centerContainer, { flex: 1, alignItems: "center", justifyContent: "center" }]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : filteredList.length === 0 ? (
        <ScrollView contentContainerStyle={styles.centerContainer}>
          <EmptyState
            icon={<ImageOff size={32} color={COLORS.primary} />}
            title="No designs found"
            body="Try a different filter or generate a new AI design!"
            action={
              <Button
                title="Create a design"
                onPress={() => router.push("/generate")}
              />
            }
          />
        </ScrollView>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.gridRow}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/details/${item.id}`)}
              style={styles.designCard}
              activeOpacity={0.8}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: img(item.afterSeed, 400, 300) }}
                  style={styles.image}
                  resizeMode="cover"
                />
                {item.purchased && (
                  <View style={styles.hdBadge}>
                    <Text style={styles.hdText}>HD</Text>
                  </View>
                )}
                {favorites.includes(item.id) && (
                  <View style={styles.favBadge}>
                    <Text style={styles.favText}>❤️</Text>
                  </View>
                )}
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.designTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.designMeta}>
                  {item.style} · {item.date}
                </Text>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
  filterWrapper: {
    marginVertical: 14,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  gridContainer: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: "space-between",
  },
  designCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    overflow: "hidden",
  },
  imageContainer: {
    height: 120,
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  hdBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  hdText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "800",
  },
  favBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  favText: {
    fontSize: 12,
  },
  infoContainer: {
    padding: 10,
  },
  designTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },
  designMeta: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  centerContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
