import { useMemo, useState } from "react";

import {
  bookSeat,
  getBooking,
  getSeatOwner,
  getTotalBooked,
  isBooked,
  TransactionState
} from "./services/contract";

import { connectWallet } from "./services/wallet";

import {
  CONTRACT_ID,
  EXPLORER_CONTRACT_URL,
  explorerTxUrl,
  NETWORK
} from "./contractConfig";

import "./styles.css";

type SeatView = {
  seatId: number;
  booked: boolean | null;
  owner: string | null;
  booking: unknown;
};

const DEFAULT_TX: TransactionState = {
  status: "idle",
  message: "No transaction submitted yet."
};

function shortAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export default function App() {
  const [address, setAddress] = useState("");
  const [seatId, setSeatId] = useState(12);
  const [txState, setTxState] = useState<TransactionState>(DEFAULT_TX);
  const [seatView, setSeatView] = useState<SeatView>({
    seatId: 12,
    booked: null,
    owner: null,
    booking: null
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const walletLabel = useMemo(() => {
    return address ? shortAddress(address) : "Wallet not connected";
  }, [address]);

  async function handleConnect() {
    setErrorMessage("");
    setLoading(true);

    try {
      const walletAddress = await connectWallet();
      setAddress(walletAddress);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to connect wallet."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleBookSeat() {
    if (!address) {
      setErrorMessage("Connect Freighter wallet before booking a seat.");
      return;
    }

    setErrorMessage("");
    setLoading(true);
    setTxState({
      status: "pending",
      message: "Waiting for wallet signature and Stellar confirmation."
    });

    try {
      const result = await bookSeat(address, seatId);
      setTxState(result);
      await handleCheckSeat();
    } catch (error) {
      setTxState({
        status: "failed",
        message:
          error instanceof Error ? error.message : "Seat booking transaction failed."
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckSeat() {
    if (!address) {
      setErrorMessage("Connect wallet first so the app can simulate contract reads.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const booked = await isBooked(address, seatId);
      const owner = await getSeatOwner(address, seatId).catch(() => null);
      const booking = await getBooking(address, seatId).catch(() => null);

      setSeatView({
        seatId,
        booked,
        owner,
        booking
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to read seat status."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadStats() {
    if (!address) {
      setErrorMessage("Connect wallet first to load contract stats.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const total = await getTotalBooked(address);
      setTxState({
        status: "success",
        message: `Contract currently reports ${total} active booked seat(s).`
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load contract stats."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <nav className="topbar">
        <div>
          <p className="eyebrow">Stellar Testnet dApp</p>
          <h1>Cinema Seat Booking</h1>
        </div>

        <button className="wallet-button" onClick={handleConnect} disabled={loading}>
          {address ? walletLabel : "Connect Freighter"}
        </button>
      </nav>

      <section className="hero">
        <div>
          <p className="eyebrow">Transparent on-chain reservations</p>
          <h2>Book cinema seats through a Soroban smart contract.</h2>
          <p>
            Users connect a Stellar wallet, choose a seat, sign a transaction,
            and verify booking ownership directly from contract storage.
          </p>
        </div>

        <div className="contract-card">
          <span>Network</span>
          <strong>{NETWORK}</strong>

          <span>Contract ID</span>
          <a href={EXPLORER_CONTRACT_URL} target="_blank" rel="noreferrer">
            {shortAddress(CONTRACT_ID)}
          </a>
        </div>
      </section>

      <section className="grid">
        <div className="panel">
          <h3>Seat action workspace</h3>
          <p className="muted">
            The frontend calls the exact contract functions: book_seat, is_booked,
            get_seat_owner, and get_booking.
          </p>

          <label htmlFor="seatId">Seat ID</label>
          <input
            id="seatId"
            type="number"
            min="1"
            value={seatId}
            onChange={(event) => setSeatId(Number(event.target.value))}
          />

          <div className="button-row">
            <button onClick={handleBookSeat} disabled={loading}>
              Book seat
            </button>

            <button className="secondary" onClick={handleCheckSeat} disabled={loading}>
              Check seat
            </button>

            <button className="secondary" onClick={handleLoadStats} disabled={loading}>
              Load stats
            </button>
          </div>
        </div>

        <div className="panel">
          <h3>Seat status</h3>

          <div className="metric">
            <span>Selected seat</span>
            <strong>{seatView.seatId}</strong>
          </div>

          <div className="metric">
            <span>Booked</span>
            <strong>
              {seatView.booked === null ? "Not checked" : seatView.booked ? "Yes" : "No"}
            </strong>
          </div>

          <div className="metric">
            <span>Owner</span>
            <strong>{seatView.owner ? shortAddress(seatView.owner) : "None"}</strong>
          </div>
        </div>

        <div className="panel">
          <h3>Transaction monitor</h3>

          <div className={`status ${txState.status}`}>
            <strong>{txState.status.toUpperCase()}</strong>
            <p>{txState.message}</p>

            {txState.hash ? (
              <a href={explorerTxUrl(txState.hash)} target="_blank" rel="noreferrer">
                View transaction
              </a>
            ) : null}
          </div>
        </div>

        <div className="panel">
          <h3>Error and loading states</h3>

          {loading ? <p className="loading">Processing request...</p> : null}

          {errorMessage ? (
            <div className="error-box">{errorMessage}</div>
          ) : (
            <p className="muted">
              Wallet errors, rejected signatures, failed RPC calls, and contract
              read failures are surfaced here.
            </p>
          )}
        </div>
      </section>

      <section className="activity">
        <h3>Contract read preview</h3>
        <pre>{JSON.stringify(seatView.booking, null, 2)}</pre>
      </section>
    </main>
  );
}