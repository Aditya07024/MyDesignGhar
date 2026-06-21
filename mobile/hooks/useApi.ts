import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApp } from "../store/app";
import {
  AuthService,
  DesignService,
  WalletService,
  ReferralService,
  ConsultantService,
  AffiliateService,
  NotificationService,
} from "../lib/api/services";

// --- Auth & Clerk Sync Hooks ---
export function useSyncMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AuthService.sync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-me"] });
    },
  });
}

export function useMeQuery(enabled: boolean = true) {
  const isAuthed = useApp((s) => s.isAuthed);
  const sessionToken = useApp((s) => s.sessionToken);
  return useQuery({
    queryKey: ["user-me"],
    queryFn: () => AuthService.getMe().then((res) => res.user),
    enabled: isAuthed && !!sessionToken && enabled,
  });
}

// --- Design Hooks ---
export function useDesignsQuery() {
  const isAuthed = useApp((s) => s.isAuthed);
  const sessionToken = useApp((s) => s.sessionToken);
  return useQuery({
    queryKey: ["designs"],
    queryFn: () => DesignService.list().then((res) => res.designs),
    enabled: isAuthed && !!sessionToken,
  });
}

export function useDesignDetailsQuery(id: string) {
  const isAuthed = useApp((s) => s.isAuthed);
  const sessionToken = useApp((s) => s.sessionToken);
  return useQuery({
    queryKey: ["designs", id],
    queryFn: () => DesignService.getById(id).then((res) => res.design),
    enabled: isAuthed && !!sessionToken && !!id,
  });
}

export function useGenerateDesignMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: DesignService.generate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designs"] });
    },
  });
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: DesignService.toggleFavorite,
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["designs"] });
      queryClient.invalidateQueries({ queryKey: ["designs", id] });
    },
  });
}

// --- Wallet Hooks ---
export function useWalletBalanceQuery(enabled: boolean = true) {
  const isAuthed = useApp((s) => s.isAuthed);
  const sessionToken = useApp((s) => s.sessionToken);
  return useQuery({
    queryKey: ["wallet-balance"],
    queryFn: () => WalletService.getBalance().then((res) => res.wallet.balance),
    enabled: isAuthed && !!sessionToken && enabled,
  });
}

export function useWalletTopUpMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { amount: number; mock?: boolean }) => WalletService.requestTopUp(args.amount, args.mock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-history"] });
    },
  });
}

export function useWalletVerifyTopUpMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: WalletService.verifyTopUp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-history"] });
    },
  });
}

export function usePurchaseImagesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: WalletService.purchaseImages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["designs"] });
    },
  });
}

export function useWalletHistoryQuery() {
  const isAuthed = useApp((s) => s.isAuthed);
  const sessionToken = useApp((s) => s.sessionToken);
  return useQuery({
    queryKey: ["wallet-history"],
    queryFn: () => WalletService.getHistory().then((res) => res.transactions),
    enabled: isAuthed && !!sessionToken,
  });
}

// --- Referral Hooks ---
export function useReferralsQuery() {
  const isAuthed = useApp((s) => s.isAuthed);
  const sessionToken = useApp((s) => s.sessionToken);
  return useQuery({
    queryKey: ["referral-stats"],
    queryFn: ReferralService.getStats,
    enabled: isAuthed && !!sessionToken,
  });
}

// --- Consultant Hooks ---
export function useConsultantsQuery() {
  const isAuthed = useApp((s) => s.isAuthed);
  const sessionToken = useApp((s) => s.sessionToken);
  return useQuery({
    queryKey: ["consultants"],
    queryFn: () => ConsultantService.list().then((res) => res.consultants),
    enabled: isAuthed && !!sessionToken,
  });
}

export function useConsultantDetailsQuery(id: string) {
  const isAuthed = useApp((s) => s.isAuthed);
  const sessionToken = useApp((s) => s.sessionToken);
  return useQuery({
    queryKey: ["consultants", id],
    queryFn: () => ConsultantService.getById(id).then((res) => res.consultant),
    enabled: isAuthed && !!sessionToken && !!id,
  });
}

export function useCreateBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ConsultantService.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
    },
  });
}

export function useBookingsQuery() {
  const isAuthed = useApp((s) => s.isAuthed);
  const sessionToken = useApp((s) => s.sessionToken);
  return useQuery({
    queryKey: ["bookings"],
    queryFn: () => ConsultantService.listBookings().then((res) => res.bookings),
    enabled: isAuthed && !!sessionToken,
  });
}

export function useAddSlotsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ConsultantService.addAvailabilitySlots,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultants"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useAddSessionNotesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, notes }: { bookingId: string; notes: string }) =>
      ConsultantService.addSessionNotes(bookingId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

// --- Affiliate Hooks ---
export function useAffiliateProductsQuery(category?: string) {
  const isAuthed = useApp((s) => s.isAuthed);
  const sessionToken = useApp((s) => s.sessionToken);
  return useQuery({
    queryKey: ["affiliate-products", category],
    queryFn: () => AffiliateService.listProducts(category).then((res) => res.products),
    enabled: isAuthed && !!sessionToken,
  });
}

export function useTrackClickMutation() {
  return useMutation({
    mutationFn: AffiliateService.trackClick,
  });
}

// --- Notification Hooks ---
export function useNotificationsQuery() {
  const isAuthed = useApp((s) => s.isAuthed);
  const sessionToken = useApp((s) => s.sessionToken);
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => NotificationService.list().then((res) => res.notifications),
    enabled: isAuthed && !!sessionToken,
  });
}

export function useMarkNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: NotificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: NotificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
