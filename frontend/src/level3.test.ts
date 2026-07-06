import { describe, expect, it } from "vitest";

import { CONTRACT_ID, NETWORK } from "./contractConfig";
import { CONTRACT_FUNCTIONS } from "./services/contract";

describe("Level 3 frontend integration", () => {
  it("uses a Stellar testnet contract id", () => {
    expect(NETWORK).toBe("testnet");
    expect(CONTRACT_ID.length).toBeGreaterThan(20);
  });

  it("maps frontend calls to contract functions", () => {
    expect(CONTRACT_FUNCTIONS).toContain("book_seat");
    expect(CONTRACT_FUNCTIONS).toContain("is_booked");
    expect(CONTRACT_FUNCTIONS).toContain("get_seat_owner");
    expect(CONTRACT_FUNCTIONS).toContain("get_booking");
  });
});