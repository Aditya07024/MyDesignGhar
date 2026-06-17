import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { COLORS, useStyles, Button } from "../components/ui-kit";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";

// Import LiveKit styles for standard visual look.
import "@livekit/components-styles";

export default function CallScreen() {
  const router = useRouter();
  const styles = useStyles(getStyles);
  const { id: bookingId, token, url } = useLocalSearchParams();

  // Handle the string or string[] query params safely.
  const roomToken = Array.isArray(token) ? token[0] : token;
  const serverUrl = Array.isArray(url) ? url[0] : url;

  if (!roomToken || !serverUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Missing connection token or server URL. Please try joining the call again.
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={{ marginTop: 20 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LiveKitRoom
        video={true}
        audio={true}
        token={roomToken}
        serverUrl={serverUrl}
        connect={true}
        onDisconnected={() => {
          router.back();
        }}
        data-lk-theme="default"
        style={{ flex: 1, height: "100%" }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </SafeAreaView>
  );
}

const getStyles = (theme: "light" | "dark") => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#12141a", // Sleek dark mode background for video call screen
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 400,
    lineHeight: 24,
  },
});
