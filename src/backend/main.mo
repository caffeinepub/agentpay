import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Float "mo:core/Float";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type Phone = Text;

  public type UserProfile = {
    phone : Phone;
    name : Text;
    principal : Principal;
  };

  public type BankAccount = {
    id : Nat;
    user : Principal;
    accountName : Text;
    accountNumber : Text;
    ifscCode : Text;
    createdAt : Int;
  };

  public type DepositStatus = { #pending; #approved; #rejected };
  public type DepositRequest = {
    id : Nat;
    user : Principal;
    amount : Float;
    screenshotBlobId : Text;
    note : ?Text;
    status : DepositStatus;
    createdAt : Int;
  };

  public type WithdrawalStatus = { #pending; #approved; #rejected };
  public type WithdrawalRequest = {
    id : Nat;
    user : Principal;
    amount : Float;
    bankAccountId : Nat;
    status : WithdrawalStatus;
    createdAt : Int;
  };

  public type Transaction = {
    id : Nat;
    amount : Float;
    createdAt : Int;
    transactionType : { #depositRequest : DepositRequest; #withdrawalRequest : WithdrawalRequest };
  };

  module Transaction {
    public func compareByCreatedAt(t1 : Transaction, t2 : Transaction) : Order.Order {
      Int.compare(t1.createdAt, t2.createdAt);
    };
  };

  let profiles = Map.empty<Principal, UserProfile>();
  let depositRequests = Map.empty<Principal, List.List<DepositRequest>>();
  let withdrawalRequests = Map.empty<Principal, List.List<WithdrawalRequest>>();
  let bankAccounts = Map.empty<Principal, List.List<BankAccount>>();
  let commissionBalances = Map.empty<Principal, Float>();
  var transactionId = 1;
  var bankAccountId = 1;

  public shared ({ caller }) func register(phone : Phone, name : Text) : async () {
    if (profiles.containsKey(caller)) {
      Runtime.trap("This user is already registered.");
    };

    let profile : UserProfile = {
      phone;
      name;
      principal = caller;
    };

    profiles.add(caller, profile);
    commissionBalances.add(caller, 0.0);
  };

  public query ({ caller }) func getCallerUserProfile() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (profiles.get(user)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  public shared ({ caller }) func addBankAccount(accountName : Text, accountNumber : Text, ifscCode : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add bank accounts");
    };

    let account : BankAccount = {
      id = bankAccountId;
      user = caller;
      accountName;
      accountNumber;
      ifscCode;
      createdAt = Time.now();
    };

    let accounts = switch (bankAccounts.get(caller)) {
      case (null) {
        let list = List.empty<BankAccount>();
        list.add(account);
        list;
      };
      case (?existingAccounts) {
        existingAccounts.add(account);
        existingAccounts;
      };
    };

    bankAccounts.add(caller, accounts);
    bankAccountId += 1;
    account.id;
  };

  public query ({ caller }) func listBankAccounts() : async [BankAccount] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list bank accounts");
    };
    switch (bankAccounts.get(caller)) {
      case (null) { [] };
      case (?accounts) { accounts.toArray() };
    };
  };

  public shared ({ caller }) func deleteBankAccount(accountId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete bank accounts");
    };
    switch (bankAccounts.get(caller)) {
      case (null) { Runtime.trap("No accounts found for user") };
      case (?accounts) {
        let filteredAccounts = accounts.filter(func(account) { account.id != accountId });
        bankAccounts.add(caller, filteredAccounts);
      };
    };
  };

  public shared ({ caller }) func submitDeposit(amount : Float, screenshotBlobId : Text, note : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit deposits");
    };

    let deposit : DepositRequest = {
      id = transactionId;
      user = caller;
      amount;
      screenshotBlobId;
      note;
      status = #pending;
      createdAt = Time.now();
    };

    let deposits = switch (depositRequests.get(caller)) {
      case (null) {
        let list = List.empty<DepositRequest>();
        list.add(deposit);
        list;
      };
      case (?existingDeposits) {
        existingDeposits.add(deposit);
        existingDeposits;
      };
    };

    depositRequests.add(caller, deposits);
    transactionId += 1;
    deposit.id;
  };

  public query ({ caller }) func listDeposits() : async [DepositRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list deposits");
    };
    switch (depositRequests.get(caller)) {
      case (null) { [] };
      case (?deposits) { deposits.toArray() };
    };
  };

  public shared ({ caller }) func submitWithdrawal(amount : Float, bankAccountId : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit withdrawals");
    };

    // Verify the bank account belongs to the caller
    switch (bankAccounts.get(caller)) {
      case (null) { Runtime.trap("No bank accounts found for user") };
      case (?accounts) {
        let accountExists = accounts.toArray().filter(func(account) { account.id == bankAccountId }).size() > 0;
        if (not accountExists) {
          Runtime.trap("Bank account does not belong to user");
        };
      };
    };

    let withdrawal : WithdrawalRequest = {
      id = transactionId;
      user = caller;
      amount;
      bankAccountId;
      status = #pending;
      createdAt = Time.now();
    };

    let withdrawals = switch (withdrawalRequests.get(caller)) {
      case (null) {
        let list = List.empty<WithdrawalRequest>();
        list.add(withdrawal);
        list;
      };
      case (?existingWithdrawals) {
        existingWithdrawals.add(withdrawal);
        existingWithdrawals;
      };
    };

    withdrawalRequests.add(caller, withdrawals);
    transactionId += 1;
    withdrawal.id;
  };

  public query ({ caller }) func listWithdrawals() : async [WithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list withdrawals");
    };
    switch (withdrawalRequests.get(caller)) {
      case (null) { [] };
      case (?withdrawals) { withdrawals.toArray() };
    };
  };

  public query ({ caller }) func getCommissionBalance() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view commission balance");
    };
    switch (commissionBalances.get(caller)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?balance) { balance };
    };
  };

  public shared ({ caller }) func creditCommission(user : Principal, amount : Float) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can credit commission");
    };

    let currentBalance = switch (commissionBalances.get(user)) {
      case (null) { 0.0 };
      case (?balance) { balance };
    };

    commissionBalances.add(user, currentBalance + amount);
  };

  public query ({ caller }) func getTransactionHistory() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transaction history");
    };

    var transactions = List.empty<Transaction>();

    switch (depositRequests.get(caller)) {
      case (null) {};
      case (?deposits) {
        deposits.forEach(func(deposit) {
          transactions.add({
            id = deposit.id;
            amount = deposit.amount;
            createdAt = deposit.createdAt;
            transactionType = #depositRequest(deposit);
          });
        });
      };
    };

    switch (withdrawalRequests.get(caller)) {
      case (null) {};
      case (?withdrawals) {
        withdrawals.forEach(func(withdrawal) {
          transactions.add({
            id = withdrawal.id;
            amount = withdrawal.amount;
            createdAt = withdrawal.createdAt;
            transactionType = #withdrawalRequest(withdrawal);
          });
        });
      };
    };

    transactions.toArray().sort(Transaction.compareByCreatedAt);
  };
};
