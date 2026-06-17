import { create } from "zustand";

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
  hydrateAuth: () => void;

  selectedRole: "USER" | "CONSULTANT";
  setSelectedRole: (role: "USER" | "CONSULTANT") => void;

  isBackendDown: boolean;
  setBackendDown: (down: boolean) => void;

  favorites: string[];
  setFavorites: (favs: string[]) => void;
  toggleFavorite: (id: string) => void;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem("mdg-theme", theme);
  } catch {
    /* ignore */
  }
}

export const useApp = create<AppState>((set, get) => ({
  theme: "light",
  setTheme: (t) => {
    applyTheme(t);
    set({ theme: t });
  },
  toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
  hydrateTheme: () => {
    if (typeof window === "undefined") return;
    let t: Theme = "light";
    try {
      const stored = localStorage.getItem("mdg-theme");
      if (stored === "dark" || stored === "light") t = stored;
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) t = "dark";
    } catch {
      /* ignore */
    }
    set({ theme: t });
  },

  language: "en",
  setLanguage: (lang) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("mdg-lang", lang);
      } catch {
        /* ignore */
      }
    }
    set({ language: lang });
  },

  isAuthed: false,
  userName: "DemoUser",
  user: null,
  walletBalance: 1240,

  login: (token, user) => {
    if (token && user) {
      if (typeof window !== "undefined") {
        localStorage.setItem("mdg_access_token", token);
        localStorage.setItem("mdg_user", JSON.stringify(user));
      }
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
    if (typeof window !== "undefined") {
      localStorage.removeItem("mdg_access_token");
      localStorage.removeItem("mdg_user");
    }
    set({ isAuthed: false, user: null, userName: "DemoUser", walletBalance: 1240 });
  },

  setUser: (user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mdg_user", JSON.stringify(user));
    }
    set({ user, userName: user.fullName });
  },

  setUserName: (name) => {
    set({ userName: name });
  },

  addMoney: (amt) => set((s) => ({ walletBalance: s.walletBalance + amt })),
  setWalletBalance: (walletBalance) => set({ walletBalance }),

  hydrateAuth: () => {
    if (typeof window === "undefined") return;
    try {
      const token = localStorage.getItem("mdg_access_token");
      const storedUser = localStorage.getItem("mdg_user");
      const storedLang = localStorage.getItem("mdg-lang");
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
