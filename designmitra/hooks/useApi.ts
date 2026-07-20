import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tokenRef } from "../lib/api/client";
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
  const hasToken = !!tokenRef.sessionToken;
  return useQuery({
    queryKey: ["user-me"],
    queryFn: () => AuthService.getMe().then((res) => res.user),
    enabled: hasToken && enabled,
  });
}

// --- Design Hooks ---
export function useDesignsQuery() {
  const hasToken = !!tokenRef.sessionToken;
  return useQuery({
    queryKey: ["designs"],
    queryFn: () => DesignService.list().then((res) => res.designs),
    enabled: hasToken,
  });
}

export function useDesignDetailsQuery(id: string) {
  const hasToken = !!tokenRef.sessionToken;
  return useQuery({
    queryKey: ["designs", id],
    queryFn: () => DesignService.getById(id).then((res) => res.design),
    enabled: hasToken && !!id,
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

export function useDeleteDesignMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: DesignService.delete,
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["designs"] });
      queryClient.removeQueries({ queryKey: ["designs", id] });
    },
  });
}

// --- Challenge & Community Hooks ---
export function useChallengeEntriesQuery() {
  const hasToken = !!tokenRef.sessionToken;
  return useQuery({
    queryKey: ["challenge-entries"],
    queryFn: () => DesignService.listChallengeEntries().then((res) => res.entries),
    enabled: hasToken,
  });
}

export function useLikeChallengeEntryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: DesignService.likeChallengeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge-entries"] });
    },
  });
}

export function useSubmitChallengeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, style }: { id: string; style?: string }) => DesignService.submitChallenge(id, style),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge-entries"] });
    },
  });
}

// --- Wallet Hooks ---
export function useWalletBalanceQuery(enabled: boolean = true) {
  const hasToken = !!tokenRef.sessionToken;
  return useQuery({
    queryKey: ["wallet-balance"],
    queryFn: () => WalletService.getBalance().then((res) => res.wallet.balance),
    enabled: hasToken && enabled,
  });
}

export function useWalletTopUpMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, mock }: { amount: number; mock?: boolean }) => WalletService.requestTopUp(amount, mock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
    },
  });
}
