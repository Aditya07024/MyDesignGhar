// Mock data for MyDesignGhar — UI demo only.

const ROOM_IMAGES: Record<string, string> = {
  "mdg-living": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80",
  "mdg-bedroom": "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80",
  "mdg-kitchen": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80",
  "mdg-bathroom": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80",
  "mdg-dining": "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&q=80",
  "mdg-office": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80",
  "mdg-kids": "https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&q=80",
  "mdg-balcony": "https://images.unsplash.com/photo-1506974210756-8e1b8985d348?auto=format&fit=crop&q=80",
};

export const img = (seed: string, w = 800, h = 600) => {
  if (!seed) return "";
  let url = seed;
  if (url.includes("localhost:5001") || url.includes("127.0.0.1:5001")) {
    try {
      const { API_BASE_URL } = require("../../lib/api/client");
      const apiHost = API_BASE_URL.replace(/\/api$/, "");
      url = url.replace(/http:\/\/(localhost|127\.0\.0\.1):5001/, apiHost);
    } catch (e) {
      // Ignore
    }
  }
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("file://") ||
    url.startsWith("content://") ||
    url.startsWith("data:") ||
    url.startsWith("/")
  ) {
    return url;
  }
  if (ROOM_IMAGES[seed]) {
    return `${ROOM_IMAGES[seed]}&w=${w}&h=${h}`;
  }
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
};

export interface RoomType {
  id: string;
  name: string;
  emoji: string;
  seed: string;
}

export const roomTypes: RoomType[] = [
  { id: "living", name: "Living Room", emoji: "🛋️", seed: "mdg-living" },
  { id: "bedroom", name: "Bedroom", emoji: "🛏️", seed: "mdg-bedroom" },
  { id: "kitchen", name: "Kitchen", emoji: "🍳", seed: "mdg-kitchen" },
  { id: "bathroom", name: "Bathroom", emoji: "🛁", seed: "mdg-bathroom" },
  { id: "dining", name: "Dining Room", emoji: "🍽️", seed: "mdg-dining" },
  { id: "office", name: "Office", emoji: "💼", seed: "mdg-office" },
  { id: "kids", name: "Kids Room", emoji: "🧸", seed: "mdg-kids" },
  { id: "balcony", name: "Balcony", emoji: "🪴", seed: "mdg-balcony" },
];

export const modernStyles = [
  "Modern",
  "Luxury",
  "Minimalist",
  "Japandi",
  "Scandinavian",
  "Bohemian",
];

export const regionalStyles = [
  "Rajasthan",
  "Kerala",
  "Kashmir",
  "Punjab",
  "Gujarat",
  "Tamil Nadu",
  "Karnataka",
  "Telangana",
  "Uttar Pradesh",
  "Maharashtra",
  "Goa",
  "West Bengal",
  "Assam",
  "Sikkim",
  "Bihar",
  "Odisha",
  "Himachal Pradesh",
  "Uttarakhand",
  "Delhi",
  "Andhra Pradesh",
  "Haryana",
  "Madhya Pradesh",
  "Chhattisgarh",
  "Jharkhand",
  "Manipur",
  "Meghalaya",
];

export const budgets = ["Under ₹50K", "₹50K–2L", "₹2L–5L", "₹5L+"];

export interface DesignItem {
  id: string;
  title: string;
  style: string;
  room: string;
  beforeSeed: string;
  afterSeed: string;
  purchased: boolean;
  date: string;
}

export const designs: DesignItem[] = [
  { id: "d1", title: "Sunlit Living Room", style: "Rajasthan", room: "Living Room", beforeSeed: "before-1", afterSeed: "after-1", purchased: true, date: "Today" },
  { id: "d2", title: "Calm Japandi Bedroom", style: "Japandi", room: "Bedroom", beforeSeed: "before-2", afterSeed: "after-2", purchased: false, date: "Today" },
  { id: "d3", title: "Coastal Goa Balcony", style: "Goa", room: "Balcony", beforeSeed: "before-3", afterSeed: "after-3", purchased: true, date: "Yesterday" },
  { id: "d4", title: "Modern Luxe Kitchen", style: "Luxury", room: "Kitchen", beforeSeed: "before-4", afterSeed: "after-4", purchased: false, date: "Yesterday" },
  { id: "d5", title: "Kerala Heritage Dining", style: "Kerala", room: "Dining Room", beforeSeed: "before-5", afterSeed: "after-5", purchased: false, date: "2 days ago" },
  { id: "d6", title: "Minimal Home Office", style: "Minimalist", room: "Office", beforeSeed: "before-6", afterSeed: "after-6", purchased: true, date: "3 days ago" },
  { id: "d7", title: "Boho Kids Room", style: "Bohemian", room: "Kids Room", beforeSeed: "before-7", afterSeed: "after-7", purchased: false, date: "Last week" },
  { id: "d8", title: "Kashmiri Warmth", style: "Kashmir", room: "Living Room", beforeSeed: "before-8", afterSeed: "after-8", purchased: false, date: "Last week" },
];

export interface Consultant {
  id: string;
  name: string;
  avatarSeed: string;
  rating: number;
  reviews: number;
  experience: number;
  specialty: string;
  state: string;
  price: number;
  bio: string;
  portfolio: string[];
}

export const consultants: Consultant[] = [
  {
    id: "c1",
    name: "Priya Sharma",
    avatarSeed: "priya",
    rating: 4.9,
    reviews: 214,
    experience: 8,
    specialty: "Luxury & Modern",
    state: "Maharashtra",
    price: 1499,
    bio: "Award-winning designer crafting warm, liveable luxury spaces across Mumbai and Pune.",
    portfolio: ["port-1", "port-2", "port-3", "port-4"],
  },
  {
    id: "c2",
    name: "Rohan Mehta",
    avatarSeed: "rohan",
    rating: 4.8,
    reviews: 167,
    experience: 6,
    specialty: "Rajasthani Heritage",
    state: "Rajasthan",
    price: 999,
    bio: "Blends traditional Jaipur craftsmanship with contemporary comfort.",
    portfolio: ["port-5", "port-6", "port-7", "port-8"],
  },
  {
    id: "c3",
    name: "Ananya Nair",
    avatarSeed: "ananya",
    rating: 5.0,
    reviews: 98,
    experience: 5,
    specialty: "Kerala & Coastal",
    state: "Kerala",
    price: 1199,
    bio: "Specialist in airy, tropical interiors using natural wood and stone.",
    portfolio: ["port-9", "port-10", "port-11", "port-12"],
  },
  {
    id: "c4",
    name: "Vikram Singh",
    avatarSeed: "vikram",
    rating: 4.7,
    reviews: 142,
    experience: 10,
    specialty: "Minimalist & Japandi",
    state: "Delhi",
    price: 1799,
    bio: "Decade of experience designing calm, clutter-free urban homes.",
    portfolio: ["port-13", "port-14", "port-15", "port-16"],
  },
];

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
}

export const reviews: Review[] = [
  { id: "r1", name: "Sneha K.", rating: 5, text: "Transformed our flat beautifully. Highly recommended!" },
  { id: "r2", name: "Amit P.", rating: 5, text: "Professional, punctual and very creative." },
  { id: "r3", name: "Divya R.", rating: 4, text: "Great experience overall, loved the mood boards." },
];

export const timeSlots = ["10:00 AM", "11:30 AM", "1:00 PM", "3:00 PM", "4:30 PM", "6:00 PM"];

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "credit" | "debit";
  date: string;
}

export const transactions: Transaction[] = [
  { id: "t1", title: "Added Money", amount: 999, type: "credit", date: "Jun 5" },
  { id: "t2", title: "HD Design Download", amount: 299, type: "debit", date: "Jun 4" },
  { id: "t3", title: "Referral Reward", amount: 150, type: "credit", date: "Jun 2" },
  { id: "t4", title: "Consultation — Priya Sharma", amount: 1499, type: "debit", date: "May 30" },
  { id: "t5", title: "Added Money", amount: 499, type: "credit", date: "May 28" },
];

export const walletPackages = [
  { id: "p1", amount: 499, bonus: 0 },
  { id: "p2", amount: 999, bonus: 100 },
  { id: "p3", amount: 1999, bonus: 300 },
];

export interface AppNotification {
  id: string;
  type: "design" | "payment" | "reminder" | "referral";
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

export const notifications: AppNotification[] = [
  { id: "n1", type: "design", title: "Your design is ready!", body: "3 new Rajasthan living room designs are waiting.", time: "2m ago", unread: true },
  { id: "n2", type: "payment", title: "Payment successful", body: "₹999 added to your wallet.", time: "1h ago", unread: true },
  { id: "n3", type: "reminder", title: "Consultation reminder", body: "Session with Priya Sharma tomorrow at 11:30 AM.", time: "3h ago", unread: false },
  { id: "n4", type: "referral", title: "Referral reward earned", body: "You earned ₹150 — your friend joined MyDesignGhar.", time: "1d ago", unread: false },
];

export interface Session {
  id: string;
  consultant: string;
  avatarSeed: string;
  date: string;
  time: string;
  status: "upcoming" | "past";
}

export const sessions: Session[] = [
  { id: "s1", consultant: "Priya Sharma", avatarSeed: "priya", date: "Jun 8, 2026", time: "11:30 AM", status: "upcoming" },
  { id: "s2", consultant: "Ananya Nair", avatarSeed: "ananya", date: "Jun 12, 2026", time: "3:00 PM", status: "upcoming" },
  { id: "s3", consultant: "Rohan Mehta", avatarSeed: "rohan", date: "May 24, 2026", time: "1:00 PM", status: "past" },
  { id: "s4", consultant: "Vikram Singh", avatarSeed: "vikram", date: "May 10, 2026", time: "4:30 PM", status: "past" },
];

export const homeStats = [
  { label: "Designs Generated", value: "48", icon: "sparkles" },
  { label: "Money Saved", value: "₹2.4L", icon: "wallet" },
  { label: "Consultants Booked", value: "3", icon: "users" },
];

export const quickActions = [
  { id: "designs", label: "My Designs", to: "/designs", icon: "gallery" },
  { id: "regional", label: "Regional Styles", to: "/generate", icon: "map" },
  { id: "consultants", label: "Consultants", to: "/consultants", icon: "users" },
  { id: "wallet", label: "Wallet", to: "/wallet", icon: "wallet" },
];
