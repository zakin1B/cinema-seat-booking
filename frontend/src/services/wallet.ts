import * as FreighterApi from "@stellar/freighter-api";

import { CONTRACT_CONFIG } from "../contractConfig";

const Freighter = FreighterApi as any;

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

const normalizeAddress = (result: FreighterAddressResult): string => {
  if (typeof result === "string") {
    return result;
  }

  if (result?.address) {
    return result.address;
  }

  throw new Error(result?.error || "Unable to read Freighter address.");
};

const normalizeSignedXdr = (result: FreighterSignResult): string => {
  if (typeof result === "string") {
    return result;
  }

  if (result?.signedTxXdr) {
    return result.signedTxXdr;
  }

  throw new Error(result?.error || "Freighter did not return a signed transaction.");
};

export const connectFreighter = async (): Promise<string> => {
  const accessResult = await Freighter.requestAccess();

  if (accessResult) {
    return normalizeAddress(accessResult);
  }

  const addressResult = await Freighter.getAddress();

  return normalizeAddress(addressResult);
};

export const getConnectedAddress = async (): Promise<string> => {
  const addressResult = await Freighter.getAddress();

  return normalizeAddress(addressResult);
};

export const signWithFreighter = async (
  transactionXdr: string,
  address: string
): Promise<string> => {
  const result = await Freighter.signTransaction(transactionXdr, {
    networkPassphrase: CONTRACT_CONFIG.networkPassphrase,
    address
  });

  return normalizeSignedXdr(result);
};