import * as Device from "expo-device";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";
import { AuthService } from "./api/services";

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let Notifications: any = null;
if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch (e) {
    console.warn("expo-notifications failed to load:", e);
  }
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === "web" || isExpoGo || !Notifications) {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7A",
    });
  }

  if (!Device.isDevice) {
    console.log("Must use physical device for Push Notifications");
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Failed to get push token for push notification (permission not granted)");
      return null;
    }

    // Resolve project ID from Expo constants if configured
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    
    return tokenData.data;
  } catch (error) {
    console.error("Error getting Expo Push Token:", error);
    return null;
  }
}

export async function registerPushToken(token: string) {
  try {
    await AuthService.savePushToken(token);
    console.log("Successfully registered push token with backend:", token);
  } catch (error) {
    console.error("Failed to register push token with backend:", error);
  }
}
