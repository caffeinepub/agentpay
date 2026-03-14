import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Transaction {
    id: bigint;
    transactionType: {
        __kind__: "withdrawalRequest";
        withdrawalRequest: WithdrawalRequest;
    } | {
        __kind__: "depositRequest";
        depositRequest: DepositRequest;
    };
    createdAt: bigint;
    amount: number;
}
export interface BankAccount {
    id: bigint;
    ifscCode: string;
    createdAt: bigint;
    user: Principal;
    accountName: string;
    accountNumber: string;
}
export interface DepositRequest {
    id: bigint;
    status: DepositStatus;
    screenshotBlobId: string;
    note?: string;
    createdAt: bigint;
    user: Principal;
    amount: number;
}
export type Phone = string;
export interface WithdrawalRequest {
    id: bigint;
    status: WithdrawalStatus;
    bankAccountId: bigint;
    createdAt: bigint;
    user: Principal;
    amount: number;
}
export interface UserProfile {
    principal: Principal;
    name: string;
    phone: Phone;
}
export enum DepositStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBankAccount(accountName: string, accountNumber: string, ifscCode: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    creditCommission(user: Principal, amount: number): Promise<void>;
    deleteBankAccount(accountId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile>;
    getCallerUserRole(): Promise<UserRole>;
    getCommissionBalance(): Promise<number>;
    getTransactionHistory(): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile>;
    isCallerAdmin(): Promise<boolean>;
    listBankAccounts(): Promise<Array<BankAccount>>;
    listDeposits(): Promise<Array<DepositRequest>>;
    listWithdrawals(): Promise<Array<WithdrawalRequest>>;
    register(phone: Phone, name: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitDeposit(amount: number, screenshotBlobId: string, note: string | null): Promise<bigint>;
    submitWithdrawal(amount: number, bankAccountId: bigint): Promise<bigint>;
}
