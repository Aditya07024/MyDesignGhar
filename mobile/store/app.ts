import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

type Theme = "light" | "dark";

interface UserDetails {
  id: string;
  phone: string;
  email: string | null;
  fullName: string;
  referralCode: string;
  walletBalance?: number;
  role?: "USER" | "CONSULTANT" | "ADMIN" | "SUPER_ADMIN";
  isPhoneVerified?: boolean;
}

interface AppState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  hydrateTheme: () => void;

  language: "en" | "hi";
  setLanguage: (lang: "en" | "hi") => void;

  isAuthed: boolean;
  userName: string;
  user: UserDetails | null;
  walletBalance: number;
  
  login: (token?: string, user?: UserDetails) => void;
  logout: () => void;
  setUser: (user: UserDetails) => void;
  setUserName: (name: string) => void;
  addMoney: (amt: number) => void;
  setWalletBalance: (balance: number) => void;
  hydrateAuth: () => Promise<void>;

  selectedRole: "USER" | "CONSULTANT";
  setSelectedRole: (role: "USER" | "CONSULTANT") => void;

  isBackendDown: boolean;
  setBackendDown: (down: boolean) => void;

  favorites: string[];
  setFavorites: (favs: string[]) => void;
  toggleFavorite: (id: string) => void;
}

export const useApp = create<AppState>((set, get) => ({
  theme: "light",
  setTheme: (t) => {
    set({ theme: t });
  },
  toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
  hydrateTheme: () => {
    // Default fallback theme
    set({ theme: "light" });
  },

  language: "en",
  setLanguage: (lang) => {
    set({ language: lang });
    SecureStore.setItemAsync("mdg_lang", lang).catch(() => {});
  },

  isAuthed: false,
  userName: "DemoUser",
  user: null,
  walletBalance: 1240,

  login: (token, user) => {
    if (token && user) {
      SecureStore.setItemAsync("mdg_access_token", token).catch(() => {});
      SecureStore.setItemAsync("mdg_user", JSON.stringify(user)).catch(() => {});
      set({
        isAuthed: true,
        user,
        userName: user.fullName,
        walletBalance: user.walletBalance ?? 0,
      });
    } else {
      set({ isAuthed: true });
    }
  },
  
  logout: () => {
    SecureStore.deleteItemAsync("mdg_access_token").catch(() => {});
    SecureStore.deleteItemAsync("mdg_user").catch(() => {});
    set({ isAuthed: false, user: null, userName: "DemoUser", walletBalance: 1240 });
  },

  setUser: (user) => {
    SecureStore.setItemAsync("mdg_user", JSON.stringify(user)).catch(() => {});
    set({ user, userName: user.fullName });
  },

  setUserName: (name) => {
    set({ userName: name });
  },

  addMoney: (amt) => set((s) => ({ walletBalance: s.walletBalance + amt })),
  setWalletBalance: (walletBalance) => set({ walletBalance }),

  hydrateAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync("mdg_access_token");
      const storedUser = await SecureStore.getItemAsync("mdg_user");
      const storedLang = await SecureStore.getItemAsync("mdg_lang");
      if (storedLang === "en" || storedLang === "hi") {
        set({ language: storedLang });
      }
      if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        set({
          isAuthed: true,
          user: parsedUser,
          userName: parsedUser.fullName,
          walletBalance: parsedUser.walletBalance ?? 0,
        });
      }
    } catch {
      /* ignore */
    }
  },

  selectedRole: "USER",
  setSelectedRole: (role) => set({ selectedRole: role }),

  isBackendDown: false,
  setBackendDown: (down) => set({ isBackendDown: down }),

  favorites: ["d2"],
  setFavorites: (favorites) => set({ favorites }),
  toggleFavorite: (id) =>
    set((s) => ({
      favorites: s.favorites.includes(id)
        ? s.favorites.filter((f) => f !== id)
        : [...s.favorites, id],
    })),
}));
