import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

type Theme = "light" | "dark";

// All 22 Scheduled Indian Languages + English
export type AppLanguage =
  | "en" | "hi" | "bn" | "te" | "mr" | "ta" | "ur" | "gu"
  | "kn" | "or" | "ml" | "pa" | "as" | "mai" | "sa" | "sat"
  | "ks" | "ne" | "sd" | "doi" | "kok" | "mni" | "brx";

export const SUPPORTED_LANGUAGES: { code: AppLanguage; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "as", label: "Assamese", native: "অসমীয়া" },
  { code: "mai", label: "Maithili", native: "मैथिली" },
  { code: "sa", label: "Sanskrit", native: "संस्कृतम्" },
  { code: "sat", label: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "ks", label: "Kashmiri", native: "कॉशुर" },
  { code: "ne", label: "Nepali", native: "नेपाली" },
  { code: "sd", label: "Sindhi", native: "سنڌي" },
  { code: "doi", label: "Dogri", native: "डोगरी" },
  { code: "kok", label: "Konkani", native: "कोंकणी" },
  { code: "mni", label: "Manipuri", native: "মৈতৈলোন্" },
  { code: "brx", label: "Bodo", native: "बड़ो" },
];

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

  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;

  isAuthed: boolean;
  userName: string;
  user: UserDetails | null;
  walletBalance: number;
  sessionToken: string | null;
  setSessionToken: (token: string | null) => void;
  
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

  hydrated: boolean;
}

export const useApp = create<AppState>((set, get) => ({
  hydrated: false,
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
  sessionToken: null,
  setSessionToken: (token) => set({ sessionToken: token }),

  login: (token, user) => {
    if (token && user) {
      SecureStore.setItemAsync("mdg_access_token", token).catch(() => {});
      SecureStore.setItemAsync("mdg_user", JSON.stringify(user)).catch(() => {});
      set({
        isAuthed: true,
        user,
        userName: user.fullName,
        walletBalance: user.walletBalance ?? 0,
        sessionToken: token,
      });
    } else {
      set({ isAuthed: true });
    }
  },
  
  logout: () => {
    SecureStore.deleteItemAsync("mdg_access_token").catch(() => {});
    SecureStore.deleteItemAsync("mdg_user").catch(() => {});
    set({ isAuthed: false, user: null, userName: "DemoUser", walletBalance: 1240, sessionToken: null });
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
      if (storedLang && SUPPORTED_LANGUAGES.some(l => l.code === storedLang)) {
        set({ language: storedLang as AppLanguage });
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
    } finally {
      set({ hydrated: true });
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
