import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AuthService,
  DesignService,
  WalletService,
  ReferralService,
  ConsultantService,
  AffiliateService,
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
  return useQuery({
    queryKey: ["user-me"],
    queryFn: () => AuthService.getMe().then((res) => res.user),
    enabled,
  });
}

// --- Design Hooks ---
export function useDesignsQuery() {
  return useQuery({
    queryKey: ["designs"],
    queryFn: () => DesignService.list().then((res) => res.designs),
  });
}

export function useDesignDetailsQuery(id: string) {
  return useQuery({
    queryKey: ["designs", id],
    queryFn: () => DesignService.getById(id).then((res) => res.design),
    enabled: !!id,
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
  return useQuery({
    queryKey: ["wallet-balance"],
    queryFn: () => WalletService.getBalance().then((res) => res.wallet.balance),
    enabled,
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

export function useWalletHistoryQuery() {
  return useQuery({
    queryKey: ["wallet-history"],
    queryFn: () => WalletService.getHistory().then((res) => res.transactions),
  });
}

// --- Referral Hooks ---
export function useReferralsQuery() {
  return useQuery({
    queryKey: ["referral-stats"],
    queryFn: ReferralService.getStats,
  });
}

// --- Consultant Hooks ---
export function useConsultantsQuery() {
  return useQuery({
    queryKey: ["consultants"],
    queryFn: () => ConsultantService.list().then((res) => res.consultants),
  });
}

export function useConsultantDetailsQuery(id: string) {
  return useQuery({
    queryKey: ["consultants", id],
    queryFn: () => ConsultantService.getById(id).then((res) => res.consultant),
    enabled: !!id,
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
  return useQuery({
    queryKey: ["bookings"],
    queryFn: () => ConsultantService.listBookings().then((res) => res.bookings),
  });
}

// --- Affiliate Hooks ---
export function useAffiliateProductsQuery(category?: string) {
  return useQuery({
    queryKey: ["affiliate-products", category],
    queryFn: () => AffiliateService.listProducts(category).then((res) => res.products),
  });
}

export function useTrackClickMutation() {
  return useMutation({
    mutationFn: AffiliateService.trackClick,
  });
}
