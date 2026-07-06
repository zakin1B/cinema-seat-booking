import {
  Address,
  BASE_FEE,
  Contract,
  nativeToScVal,
  Networks,
  scValToNative,
  TransactionBuilder,
  xdr
} from "@stellar/stellar-sdk";

import { rpc } from "@stellar/stellar-sdk";

import { CONTRACT_ID, NETWORK_PASSPHRASE, RPC_URL } from "../contractConfig";
import { signWithWallet } from "./wallet";

export type TransactionState = {
  status: "idle" | "pending" | "success" | "failed";
  hash?: string;
  message: string;
};

export const CONTRACT_FUNCTIONS = [
  "book_seat",
  "is_booked",
  "get_seat_owner",
  "get_booking",
  "get_total_booked",
  "get_user_bookings",
  "cancel_booking",
  "check_in"
];

const server = new rpc.Server(RPC_URL, {
  allowHttp: RPC_URL.startsWith("http://")
});

const contract = new Contract(CONTRACT_ID);

function toAddressScVal(address: string): xdr.ScVal {
  return new Address(address).toScVal();
}

function toU32ScVal(value: number): xdr.ScVal {
  return nativeToScVal(value, { type: "u32" });
}

async function buildTransaction(sourceAddress: string, operation: xdr.Operation) {
  const account = await server.getAccount(sourceAddress);

  return new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();
}

async function pollTransaction(hash: string): Promise<TransactionState> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const tx = await server.getTransaction(hash);

    if (tx.status === "SUCCESS") {
      return {
        status: "success",
        hash,
        message: "Transaction confirmed on Stellar testnet."
      };
    }

    if (tx.status === "FAILED") {
      return {
        status: "failed",
        hash,
        message: "Transaction failed on Stellar testnet."
      };
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  return {
    status: "pending",
    hash,
    message: "Transaction submitted and still pending."
  };
}

async function submitContractCall(
  sourceAddress: string,
  method: string,
  args: xdr.ScVal[]
): Promise<TransactionState> {
  const operation = contract.call(method, ...args);
  const transaction = await buildTransaction(sourceAddress, operation);
  const prepared = await server.prepareTransaction(transaction);

  const signedXdr = await signWithWallet(prepared.toXDR(), sourceAddress);
  const signedTransaction = TransactionBuilder.fromXDR(
    signedXdr,
    Networks.TESTNET
  );

  const sendResult = await server.sendTransaction(signedTransaction);

  if (sendResult.status === "ERROR") {
    return {
      status: "failed",
      hash: sendResult.hash,
      message: "RPC rejected the signed transaction."
    };
  }

  return pollTransaction(sendResult.hash);
}

async function simulateContractCall<T>(
  sourceAddress: string,
  method: string,
  args: xdr.ScVal[]
): Promise<T> {
  const operation = contract.call(method, ...args);
  const transaction = await buildTransaction(sourceAddress, operation);
  const simulation = await server.simulateTransaction(transaction);

  const result = (simulation as any).result?.retval;

  if (!result) {
    throw new Error(`No simulation result returned for ${method}.`);
  }

  return scValToNative(result) as T;
}

export async function bookSeat(
  sourceAddress: string,
  seatId: number
): Promise<TransactionState> {
  return submitContractCall(sourceAddress, "book_seat", [
    toAddressScVal(sourceAddress),
    toU32ScVal(seatId)
  ]);
}

export async function isBooked(
  sourceAddress: string,
  seatId: number
): Promise<boolean> {
  return simulateContractCall<boolean>(sourceAddress, "is_booked", [
    toU32ScVal(seatId)
  ]);
}

export async function getSeatOwner(
  sourceAddress: string,
  seatId: number
): Promise<string | null> {
  return simulateContractCall<string | null>(sourceAddress, "get_seat_owner", [
    toU32ScVal(seatId)
  ]);
}

export async function getBooking(
  sourceAddress: string,
  seatId: number
): Promise<unknown> {
  return simulateContractCall<unknown>(sourceAddress, "get_booking", [
    toU32ScVal(seatId)
  ]);
}

export async function getTotalBooked(sourceAddress: string): Promise<number> {
  return simulateContractCall<number>(sourceAddress, "get_total_booked", []);
}