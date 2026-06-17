import React, { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Home, LayoutGrid, Users, Wallet } from "lucide-react-native";
import { COLORS } from "../../components/ui-kit";
import { ActivityIndicator, View, Platform } from "react-native";
import { useApp } from "../../store/app";

export default function TabsLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const isAuthed = useApp((s) => s.isAuthed);
  const user = useApp((s) => s.user);
  const router = useRouter();
  const theme = useApp((s) => s.theme);

  useEffect(() => {
    if (isLoaded && (!isSignedIn || !isAuthed)) {
      router.replace("/(auth)/login");
    }
  }, [isLoaded, isSignedIn, isAuthed]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isSignedIn || !isAuthed) {
    return null;
  }

  const isConsultant = user?.role === "CONSULTANT";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 90 : 70,
          paddingBottom: Platform.OS === "ios" ? 24 : 10,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: COLORS.card,
          borderBottomColor: COLORS.border,
          borderBottomWidth: 1,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 18,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          paddingBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="designs"
        options={{
          title: "Designs",
          headerTitle: "My Designs",
          tabBarIcon: ({ color, size }) => <LayoutGrid size={size} color={color} />,
          href: isConsultant ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="consultants"
        options={{
          title: "Consultants",
          headerTitle: "Experts Marketplace",
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          href: isConsultant ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: isConsultant ? "Earnings" : "Wallet",
          headerTitle: isConsultant ? "My Earnings" : "My Wallet",
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
