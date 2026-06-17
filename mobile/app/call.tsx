import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { COLORS, useStyles, Button } from "../components/ui-kit";

export default function CallScreen() {
  const router = useRouter();
  const styles = useStyles(getStyles);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.nativeFallback}>
        <Text style={styles.fallbackText}>Video calling is supported on Web only.</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
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
  nativeFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  fallbackText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 24,
  },
});
