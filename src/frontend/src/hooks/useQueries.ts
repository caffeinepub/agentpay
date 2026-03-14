import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BankAccount,
  DepositRequest,
  Transaction,
  UserProfile,
} from "../backend";
import { useActor } from "./useActor";

export function useUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useCommissionBalance() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["commissionBalance"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getCommissionBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBankAccounts() {
  const { actor, isFetching } = useActor();
  return useQuery<BankAccount[]>({
    queryKey: ["bankAccounts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listBankAccounts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTransactionHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactionHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDeposits() {
  const { actor, isFetching } = useActor();
  return useQuery<DepositRequest[]>({
    queryKey: ["deposits"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDeposits();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBankAccount() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      number,
      ifsc,
    }: { name: string; number: string; ifsc: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addBankAccount(name, number, ifsc);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bankAccounts"] }),
  });
}

export function useDeleteBankAccount() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteBankAccount(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bankAccounts"] }),
  });
}

export function useSubmitDeposit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      blobId,
      note,
    }: { amount: number; blobId: string; note: string | null }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitDeposit(amount, blobId, note);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deposits"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useSubmitWithdrawal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      bankId,
    }: { amount: number; bankId: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitWithdrawal(amount, bankId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useRegister() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ phone, name }: { phone: string; name: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.register(phone, name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userProfile"] }),
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userProfile"] }),
  });
}
