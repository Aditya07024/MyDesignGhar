import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let sessionToken: string | null = null;

export const setSessionToken = (token: string | null) => {
  sessionToken = token;
};

apiClient.interceptors.request.use(
  (config) => {
    if (sessionToken && config.headers) {
      config.headers.Authorization = `Bearer ${sessionToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setSessionToken(null);
    }
    return Promise.reject(error);
  }
);

export const AuthService = {
  async sync(data?: { referralCode?: string; role?: "USER" | "CONSULTANT" | "ADMIN" }) {
    const res = await apiClient.post("/auth/sync", data);
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get("/auth/me");
    return res.data;
  },

  async updateProfile(data: { fullName: string; phone: string; bio?: string }) {
    const res = await apiClient.put("/auth/profile", data);
    return res.data;
  },

  async deleteAccount() {
    const res = await apiClient.delete("/auth/delete");
    return res.data;
  },
};

export const ConsultantService = {
  async register(data: { specialty: string; experience: number; bio: string; price: number; portfolioUrls?: string[] }) {
    const res = await apiClient.post("/consultants/register", data);
    return res.data;
  },

  async list() {
    const res = await apiClient.get("/consultants");
    return res.data;
  },

  async getById(id: string) {
    const res = await apiClient.get(`/consultants/${id}`);
    return res.data;
  },

  async addAvailabilitySlots(slots: Array<{ date: string; timeSlot: string }>) {
    const res = await apiClient.post("/consultants/slots", { slots });
    return res.data;
  },

  async createBooking(data: { consultantId: string; availabilityId: string; paymentMethod: "WALLET" | "RAZORPAY" }) {
    const res = await apiClient.post("/consultants/bookings", data);
    return res.data;
  },

  async addSessionNotes(bookingId: string, notes: string) {
    const res = await apiClient.post(`/consultants/bookings/${bookingId}/notes`, { notes });
    return res.data;
  },

  async listBookings() {
    const res = await apiClient.get("/consultants/bookings/sessions");
    return res.data;
  },

  async addReview(consultantId: string, data: { rating: number; text: string }) {
    const res = await apiClient.post(`/consultants/${consultantId}/review`, data);
    return res.data;
  },
};

export const AdminService = {
  async listUsers() {
    const res = await apiClient.get("/admin/users");
    return res.data;
  },

  async banUser(id: string) {
    const res = await apiClient.post(`/admin/users/${id}/ban`);
    return res.data;
  },

  async updateConsultantStatus(id: string, status: "APPROVED" | "REJECTED" | "SUSPENDED") {
    const res = await apiClient.post(`/admin/consultants/${id}/status`, { status });
    return res.data;
  },

  async refundPurchase(id: string) {
    const res = await apiClient.post(`/admin/purchases/${id}/refund`);
    return res.data;
  },

  async createAffiliateProduct(data: { title: string; description: string; price: number; imageUrl: string; link: string; category: string }) {
    const res = await apiClient.post("/admin/products", data);
    return res.data;
  },

  async getAuditLogs() {
    const res = await apiClient.get("/admin/audit-logs");
    return res.data;
  },
};

export const WalletService = {
  async getBalance() {
    const res = await apiClient.get("/wallets/balance");
    return res.data;
  },
  async getHistory() {
    const res = await apiClient.get("/wallets/history");
    return res.data;
  },
};
