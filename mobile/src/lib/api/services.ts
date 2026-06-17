import { apiClient } from "./client";

export const AuthService = {
  async sync(data?: { referralCode?: string; role?: "USER" | "CONSULTANT" }) {
    const res = await apiClient.post("/auth/sync", data);
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get("/auth/me");
    return res.data;
  },

  async updateProfile(data: any) {
    const res = await apiClient.put("/auth/profile", data);
    return res.data;
  },

  async deleteAccount() {
    const res = await apiClient.delete("/auth/delete");
    return res.data;
  },
};

export const DesignService = {
  async generate(formData: FormData) {
    // Need multipart form content header for uploads
    const res = await apiClient.post("/designs/generate", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async list() {
    const res = await apiClient.get("/designs");
    return res.data;
  },

  async getById(id: string) {
    const res = await apiClient.get(`/designs/${id}`);
    return res.data;
  },

  async getDownloadUrl(imageId: string) {
    const res = await apiClient.get(`/designs/image/${imageId}/download`);
    return res.data;
  },

  async toggleFavorite(id: string) {
    const res = await apiClient.post(`/designs/${id}/favorite`);
    return res.data;
  },

  async submitChallenge(id: string) {
    const res = await apiClient.post(`/designs/${id}/challenge`);
    return res.data;
  },

  async likeChallengeEntry(entryId: string) {
    const res = await apiClient.post(`/designs/challenge/entry/${entryId}/like`);
    return res.data;
  },
};

export const WalletService = {
  async getBalance() {
    const res = await apiClient.get("/wallets/balance");
    return res.data;
  },

  async requestTopUp(amount: number, mock: boolean = false) {
    const res = await apiClient.post("/wallets/topup", { amount, mock });
    return res.data;
  },

  async verifyTopUp(data: { orderId: string; paymentId: string; signature: string; amount: number }) {
    const res = await apiClient.post("/payments/verify", {
      orderId: data.orderId,
      paymentId: data.paymentId,
      signature: data.signature,
      amount: data.amount,
      isWalletTopUp: true,
    });
    return res.data;
  },

  async getHistory() {
    const res = await apiClient.get("/wallets/history");
    return res.data;
  },
};

export const ReferralService = {
  async getStats() {
    const res = await apiClient.get("/referrals/stats");
    return res.data;
  },
};

export const ConsultantService = {
  async register(data: any) {
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

export const AffiliateService = {
  async listProducts(category?: string) {
    const res = await apiClient.get("/affiliates/products", {
      params: { category },
    });
    return res.data;
  },

  async trackClick(productId: string) {
    const res = await apiClient.post("/affiliates/click", { productId });
    return res.data;
  },
};

export const NotificationService = {
  async list() {
    const res = await apiClient.get("/notifications");
    return res.data;
  },

  async markAllAsRead() {
    const res = await apiClient.post("/notifications/read-all");
    return res.data;
  },

  async markAsRead(id: string) {
    const res = await apiClient.post(`/notifications/${id}/read`);
    return res.data;
  },
};
