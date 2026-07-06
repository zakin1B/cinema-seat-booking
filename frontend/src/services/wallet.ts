import {
  getAddress,
  isConnected,
  requestAccess,
  setAllowed,
  signTransaction
} from "@stellar/freighter-api";

import { NETWORK_PASSPHRASE } from "../contractConfig";

type FreighterAddressResult =
  | string
  | {
      address?: string;
      error?: string;
    };

type FreighterSignResult =
  | string
  | {
      signedTxXdr?: string;
      error?: string;
    };

function normalizeAddress(result: FreighterAddressResult): string {
  if (typeof result === "string") {
    return result;
  }

  if (result?.address) {
    return result.address;
  }

  throw new Error(result?.error || "Unable to read Freighter address.");
}

function normalizeSignedXdr(result: FreighterSignResult): string {
  if (typeof result === "string") {
    return result;
  }

  if (result?.signedTxXdr) {
    return result.signedTxXdr;
  }

  throw new Error(result?.error || "Freighter did not return a signed transaction.");
}

export async function connectWallet(): Promise<string> {
  const connected = await (isConnected as unknown as () => Promise<
    boolean | { isConnected?: boolean }
  >)();

  if (typeof connected === "object" && connected.isConnected === false) {
    throw new Error("Freighter wallet is not connected.");
  }

  await (setAllowed as unknown as () => Promise<void>)();

  const accessResult = await (requestAccess as unknown as () => Promise<
    FreighterAddressResult
  >)();

  if (accessResult) {
    return normalizeAddress(accessResult);
  }

  const addressResult = await (getAddress as unknown as () => Promise<
    FreighterAddressResult
  >)();

  return normalizeAddress(addressResult);
}

export async function getConnectedAddress(): Promise<string> {
  const addressResult = await (getAddress as unknown as () => Promise<
    FreighterAddressResult
  >)();

  return normalizeAddress(addressResult);
}

export async function signWithWallet(
  transactionXdr: string,
  address: string
): Promise<string> {
  const result = await (signTransaction as unknown as (
    xdr: string,
    opts: {
      networkPassphrase: string;
      address: string;
    }
  ) => Promise<FreighterSignResult>)(transactionXdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
    address
  });

  return normalizeSignedXdr(result);
}