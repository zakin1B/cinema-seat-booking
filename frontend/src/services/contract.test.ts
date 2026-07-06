import { describe, expect, it } from "vitest";

import { CONTRACT_CONFIG, hasDeployedContract } from "../contractConfig";
import {
  bookSeat,
  cancelBooking,
  checkIn,
  getBooking,
  getContractMethods,
  getRuntimeConfig,
  getStats,
  isBooked
} from "./contract";

describe("Cinema Seat Booking frontend integration", () => {
  it("uses Stellar Testnet configuration", () => {
    expect(CONTRACT_CONFIG.network).toBe("testnet");
    expect(CONTRACT_CONFIG.rpcUrl).toContain("soroban-testnet");
  });

  it("has a deployed contract ID format", () => {
    expect(hasDeployedContract).toBe(true);
    expect(CONTRACT_CONFIG.contractId.startsWith("C")).toBe(true);
  });

  it("exports write functions", () => {
    expect(bookSeat).toBeTypeOf("function");
    expect(cancelBooking).toBeTypeOf("function");
    expect(checkIn).toBeTypeOf("function");
  });

  it("exports read functions", () => {
    expect(isBooked).toBeTypeOf("function");
    expect(getBooking).toBeTypeOf("function");
    expect(getStats).toBeTypeOf("function");
  });

  it("maps frontend methods to contract functions", () => {
    const methods = getContractMethods();

    expect(methods).toContain("book_seat");
    expect(methods).toContain("cancel_booking");
    expect(methods).toContain("check_in");
    expect(methods).toContain("is_booked");
    expect(methods).toContain("get_seat_owner");
    expect(methods).toContain("stats");
  });

  it("returns runtime config", () => {
    const config = getRuntimeConfig();

    expect(config.network).toBe("testnet");
    expect(config.contractId).toBe(CONTRACT_CONFIG.contractId);
    expect(config.contractExplorerUrl).toContain(CONTRACT_CONFIG.contractId);
  });
});