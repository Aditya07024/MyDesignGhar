import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { DesignService, ConsultantService } from "../lib/api/services";
import { API_BASE_URL, resolveImageUri } from "../lib/api/client";
import { useTranslation } from "../lib/i18n";

export type UserProfile = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  userType?: string[];
  language?: "english" | "hindi" | "both";
  budgetRange?: string;
  streak?: number;
  lastOpenDate?: string;
  walletBalance?: number;
  referralCode?: string;
};

export type Design = {
  id: string;
  imageUri: string;
  originalUri?: string;
  styleName: string;
  description: string;
  budget: string;
  createdAt: string;
  isPurchased: boolean;
  isFavorite: boolean;
  isPublished: boolean;
  roomType: string;
  rating: number;
};

type AppContextType = {
  user: UserProfile | null;
  isLoggedIn: boolean;
  designs: Design[];
  designers: any[];
  streak: number;
  achievements: string[];
  login: (profile: UserProfile) => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addDesign: (design: Design) => void;
  toggleFavorite: (id: string) => void;
  deleteDesign: (id: string) => void;
  purchaseDesign: (id: string) => void;
  publishDesign: (id: string) => void;
  addAchievement: (badge: string) => void;
  refreshDesigns: () => Promise<void>;
  refreshDesigners: () => Promise<void>;
};

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [designers, setDesigners] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { signOut } = useAuth();

  useEffect(() => {
    loadPersistedData();
  }, []);

  async function refreshDesigners() {
    try {
      const res = await ConsultantService.list();
      const list = res.consultants || [];
      setDesigners(list);
      await AsyncStorage.setItem("designers", JSON.stringify(list));
    } catch (err) {
      console.warn("Failed to refresh designers in background:", err);
    }
  }

  async function loadPersistedData() {
    try {
      const [userStr, designsStr, achievementsStr, designersStr] = await Promise.all([
        AsyncStorage.getItem("user"),
        AsyncStorage.getItem("designs"),
        AsyncStorage.getItem("achievements"),
        AsyncStorage.getItem("designers"),
      ]);

      if (designersStr) {
        setDesigners(JSON.parse(designersStr));
      }

      if (userStr) {
        const savedUser: UserProfile = JSON.parse(userStr);
        setUser(savedUser);
        setIsLoggedIn(true);
        updateStreak(savedUser);

        // Fetch fresh designs from backend since user is logged in
        try {
          const res = await DesignService.list();
          const backendDesigns: Design[] = [];
          res.designs.forEach((d: any) => {
            const beforeUrl = d.beforeUrl;
            d.images?.forEach((img: any, idx: number) => {
              const imageUri = resolveImageUri(img.previewUrl);
              backendDesigns.push({
                id: img.id,
                imageUri,
                originalUri: beforeUrl,
                styleName: `${d.style} Concept ${idx + 1}`,
                description: `AI-designed ${d.roomType} in ${d.style} style.`,
                budget: d.budget,
                createdAt: d.createdAt,
                isPurchased: d.purchased || false,
                isFavorite: img.isFavorite || false,
                isPublished: d.isPublished || false,
                roomType: d.roomType,
                rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
              });
            });
          });
          setDesigns(backendDesigns);
          AsyncStorage.setItem("designs", JSON.stringify(backendDesigns));
        } catch (apiErr) {
          console.warn("Failed to load designs from API, falling back to local cache:", apiErr);
          if (designsStr) setDesigns(JSON.parse(designsStr));
        }

        // Fetch fresh designers from backend in background since user is logged in
        refreshDesigners().catch((err) => console.warn("Background designers fetch failed:", err));
      }
      if (achievementsStr) setAchievements(JSON.parse(achievementsStr));
    } catch {}
  }

  async function refreshDesigns() {
    if (!isLoggedIn) return;
    try {
      const res = await DesignService.list();
      const backendDesigns: Design[] = [];
      res.designs.forEach((d: any) => {
        const beforeUrl = d.beforeUrl;
        d.images?.forEach((img: any, idx: number) => {
          const imageUri = resolveImageUri(img.previewUrl);
          backendDesigns.push({
            id: img.id,
            imageUri,
            originalUri: beforeUrl,
            styleName: `${d.style} Concept ${idx + 1}`,
            description: `AI-designed ${d.roomType} in ${d.style} style.`,
            budget: d.budget,
            createdAt: d.createdAt,
            isPurchased: d.purchased || false,
            isFavorite: img.isFavorite || false,
            isPublished: d.isPublished || false,
            roomType: d.roomType,
            rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
          });
        });
      });
      setDesigns(backendDesigns);
      AsyncStorage.setItem("designs", JSON.stringify(backendDesigns));
    } catch (err) {
      console.warn("Failed to refresh designs from API:", err);
    }
  }

  function login(profile: UserProfile) {
    setUser(profile);
    setIsLoggedIn(true);
    AsyncStorage.setItem("user", JSON.stringify(profile));
    updateStreak(profile);
    // Trigger design refresh immediately on login
    refreshDesigns();
    refreshDesigners();
  }

  async function logout() {
    setUser(null);
    setIsLoggedIn(false);
    setDesigns([]);
    setAchievements([]);
    await AsyncStorage.clear();
    await signOut();
  }

  function updateProfile(updates: Partial<UserProfile>) {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }

  function updateStreak(profile: UserProfile) {
    const today = new Date().toISOString().split("T")[0];
    const lastOpen = profile.lastOpenDate;

    if (lastOpen === today) return;

    let newStreak = profile.streak || 1;
    if (lastOpen) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (lastOpen !== yesterdayStr) {
        newStreak = 1;
      } else {
        newStreak += 1;
      }
    }

    setStreak(newStreak);
    updateProfile({ streak: newStreak, lastOpenDate: today });
  }

  function addDesign(design: Design) {
    setDesigns((prev) => {
      const updated = [design, ...prev];
      AsyncStorage.setItem("designs", JSON.stringify(updated));
      return updated;
    });
  }

  function purchaseDesign(id: string) {
    setDesigns((prev) => {
      const updated = prev.map((d) =>
        d.id === id ? { ...d, isPurchased: true } : d
      );
      AsyncStorage.setItem("designs", JSON.stringify(updated));
      return updated;
    });
  }

  function publishDesign(id: string) {
    setDesigns((prev) => {
      const updated = prev.map((d) =>
        d.id === id ? { ...d, isPublished: true } : d
      );
      AsyncStorage.setItem("designs", JSON.stringify(updated));
      return updated;
    });
  }

  async function toggleFavorite(id: string) {
    // Optimistic UI update
    setDesigns((prev) => {
      const updated = prev.map((d) =>
        d.id === id ? { ...d, isFavorite: !d.isFavorite } : d
      );
      AsyncStorage.setItem("designs", JSON.stringify(updated));
      return updated;
    });

    try {
      await DesignService.toggleFavorite(id);
    } catch (err) {
      console.warn("Failed to toggle favorite on backend:", err);
      // Revert if failed
      setDesigns((prev) => {
        const updated = prev.map((d) =>
          d.id === id ? { ...d, isFavorite: !d.isFavorite } : d
        );
        AsyncStorage.setItem("designs", JSON.stringify(updated));
        return updated;
      });
    }
  }

  async function deleteDesign(id: string) {
    setDesigns((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      AsyncStorage.setItem("designs", JSON.stringify(updated));
      return updated;
    });

    try {
      await DesignService.delete(id);
    } catch (err) {
      console.warn("Failed to delete design on backend:", err);
    }
  }

  function addAchievement(badge: string) {
    setAchievements((prev) => {
      if (prev.includes(badge)) return prev;
      const updated = [...prev, badge];
      AsyncStorage.setItem("achievements", JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <AppContext.Provider
      value={{
        user,
        isLoggedIn,
        designs,
        designers,
        streak,
        achievements,
        login,
        logout,
        updateProfile,
        addDesign,
        purchaseDesign,
        publishDesign,
        toggleFavorite,
        deleteDesign,
        addAchievement,
        refreshDesigns,
        refreshDesigners,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
