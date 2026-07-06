import * as StellarSdk from "@stellar/stellar-sdk";

import {
  CONTRACT_CONFIG,
  getContractExplorerUrl,
  getTransactionExplorerUrl,
  hasDeployedContract
} from "../contractConfig";
import { signWithFreighter } from "./wallet";

const SDK = StellarSdk as any;

export type BookSeatInput = {
  user: string;
  seatId: string;
};

export type BookingActionInput = {
  user: string;
  bookingId: string;
};

export type SubmittedTransaction = {
  hash: string;
  status: string;
  explorerUrl: string;
};

export type RuntimeConfig = {
  network: string;
  rpcUrl: string;
  contractId: string;
  contractExplorerUrl: string;
  hasDeployedContract: boolean;
};

const getServer = () => {
  const ServerClass = SDK.SorobanRpc?.Server || SDK.rpc?.Server;

  if (!ServerClass) {
    throw new Error("Soroban RPC Server class was not found in @stellar/stellar-sdk.");
  }

  return new ServerClass(CONTRACT_CONFIG.rpcUrl, {
    allowHttp: false
  });
};

const getContract = () => {
  return new SDK.Contract(CONTRACT_CONFIG.contractId);
};

const buildAddressScVal = (address: string) => {
  return new SDK.Address(address).toScVal();
};

const buildU32ScVal = (value: string | number) => {
  return SDK.nativeToScVal(Number(value || 0), { type: "u32" });
};

const buildTransaction = async (sourcePublicKey: string, operation: unknown) => {
  const server = getServer();
  const sourceAccount = await server.getAccount(sourcePublicKey);

  const transaction = new SDK.TransactionBuilder(sourceAccount, {
    fee: SDK.BASE_FEE,
    networkPassphrase: CONTRACT_CONFIG.networkPassphrase
  })
    .addOperation(operation)
    .setTimeout(60)
    .build();

  return server.prepareTransaction(transaction);
};

const submitSignedTransaction = async (
  signedXdr: string
): Promise<SubmittedTransaction> => {
  const server = getServer();
  const signedTransaction = new SDK.Transaction(
    signedXdr,
    CONTRACT_CONFIG.networkPassphrase
  );

  const sendResult = await server.sendTransaction(signedTransaction);

  if (!sendResult.hash) {
    throw new Error(
      sendResult.errorResultXdr || "Transaction was rejected by Soroban RPC."
    );
  }

  return {
    hash: sendResult.hash,
    status: sendResult.status || "PENDING",
    explorerUrl: getTransactionExplorerUrl(sendResult.hash)
  };
};

const invokeContract = async (
  sourcePublicKey: string,
  method: string,
  args: unknown[]
): Promise<SubmittedTransaction> => {
  const contract = getContract();
  const operation = contract.call(method, ...args);
  const preparedTransaction = await buildTransaction(sourcePublicKey, operation);
  const signedXdr = await signWithFreighter(
    preparedTransaction.toXDR(),
    sourcePublicKey
  );

  return submitSignedTransaction(signedXdr);
};

const simulateContract = async (
  sourcePublicKey: string,
  method: string,
  args: unknown[]
) => {
  const server = getServer();
  const contract = getContract();
  const operation = contract.call(method, ...args);
  const sourceAccount = await server.getAccount(sourcePublicKey);

  const transaction = new SDK.TransactionBuilder(sourceAccount, {
    fee: SDK.BASE_FEE,
    networkPassphrase: CONTRACT_CONFIG.networkPassphrase
  })
    .addOperation(operation)
    .setTimeout(60)
    .build();

  const simulation = await server.simulateTransaction(transaction);

  if (simulation.error) {
    throw new Error(simulation.error);
  }

  return simulation.result?.retval;
};

export const getRuntimeConfig = (): RuntimeConfig => {
  return {
    network: CONTRACT_CONFIG.network,
    rpcUrl: CONTRACT_CONFIG.rpcUrl,
    contractId: CONTRACT_CONFIG.contractId,
    contractExplorerUrl: getContractExplorerUrl(),
    hasDeployedContract
  };
};

export const shortenAddress = (value: string, prefix = 8, suffix = 8) => {
  if (!value) {
    return "Not available";
  }

  if (value.length <= prefix + suffix + 3) {
    return value;
  }

  return `${value.slice(0, prefix)}...${value.slice(-suffix)}`;
};

export const bookSeat = async (
  input: BookSeatInput
): Promise<SubmittedTransaction> => {
  return invokeContract(input.user, "book_seat", [
    buildAddressScVal(input.user),
    buildU32ScVal(input.seatId)
  ]);
};

export const cancelBooking = async (
  input: BookingActionInput
): Promise<SubmittedTransaction> => {
  return invokeContract(input.user, "cancel_booking", [
    buildAddressScVal(input.user),
    buildU32ScVal(input.bookingId)
  ]);
};

export const checkIn = async (
  input: BookingActionInput
): Promise<SubmittedTransaction> => {
  return invokeContract(input.user, "check_in", [
    buildAddressScVal(input.user),
    buildU32ScVal(input.bookingId)
  ]);
};

export const isBooked = async (
  sourcePublicKey: string,
  seatId: string
): Promise<boolean | null> => {
  const result = await simulateContract(sourcePublicKey, "is_booked", [
    buildU32ScVal(seatId)
  ]);

  return result ? SDK.scValToNative(result) : null;
};

export const getSeatOwner = async (
  sourcePublicKey: string,
  seatId: string
): Promise<string | null> => {
  const result = await simulateContract(sourcePublicKey, "get_seat_owner", [
    buildU32ScVal(seatId)
  ]);

  return result ? SDK.scValToNative(result) : null;
};

export const getBooking = async (
  sourcePublicKey: string,
  bookingId: string
): Promise<unknown> => {
  const result = await simulateContract(sourcePublicKey, "get_booking", [
    buildU32ScVal(bookingId)
  ]);

  return result ? SDK.scValToNative(result) : null;
};

export const getStats = async (sourcePublicKey: string): Promise<unknown> => {
  const result = await simulateContract(sourcePublicKey, "stats", []);

  return result ? SDK.scValToNative(result) : null;
};

export const getContractMethods = () => [
  "initialize",
  "admin",
  "book_seat",
  "cancel_booking",
  "check_in",
  "is_booked",
  "seat_booking_id",
  "get_seat_owner",
  "get_booking",
  "get_total_booked",
  "get_user_bookings",
  "stats"
];