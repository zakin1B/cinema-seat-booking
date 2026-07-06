import { useMemo, useState } from "react";

import {
  bookSeat,
  cancelBooking,
  checkIn,
  getBooking,
  getRuntimeConfig,
  getSeatOwner,
  getStats,
  isBooked,
  shortenAddress,
  SubmittedTransaction
} from "./services/contract";
import { connectFreighter } from "./services/wallet";

import "./App.css";

type SeatStatus = {
  seatId: string;
  isBooked: boolean | null;
  owner: string | null;
};

const runtimeConfig = getRuntimeConfig();

export default function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [seatId, setSeatId] = useState("12");
  const [bookingId, setBookingId] = useState("1");
  const [seatStatus, setSeatStatus] = useState<SeatStatus>({
    seatId: "12",
    isBooked: null,
    owner: null
  });
  const [bookingDetails, setBookingDetails] = useState<unknown>(null);
  const [stats, setStats] = useState<unknown>(null);
  const [transaction, setTransaction] = useState<SubmittedTransaction | null>(
    null
  );
  const [message, setMessage] = useState("Ready to connect wallet.");
  const [loading, setLoading] = useState(false);

  const walletLabel = useMemo(() => {
    if (!walletAddress) {
      return "Connect Freighter";
    }

    return shortenAddress(walletAddress);
  }, [walletAddress]);

  const requireWallet = () => {
    if (!walletAddress) {
      throw new Error("Connect Freighter wallet first.");
    }

    return walletAddress;
  };

  const runAction = async (
    actionName: string,
    action: () => Promise<SubmittedTransaction | void>
  ) => {
    setLoading(true);
    setMessage(`${actionName} is running...`);

    try {
      const result = await action();

      if (result) {
        setTransaction(result);
        setMessage(`${actionName} submitted successfully.`);
      } else {
        setMessage(`${actionName} completed.`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `${actionName} failed.`);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    await runAction("Wallet connection", async () => {
      const address = await connectFreighter();
      setWalletAddress(address);
    });
  };

  const handleBookSeat = async () => {
    await runAction("Seat booking", async () => {
      const user = requireWallet();
      return bookSeat({ user, seatId });
    });
  };

  const handleCancelBooking = async () => {
    await runAction("Booking cancellation", async () => {
      const user = requireWallet();
      return cancelBooking({ user, bookingId });
    });
  };

  const handleCheckIn = async () => {
    await runAction("Check-in", async () => {
      const user = requireWallet();
      return checkIn({ user, bookingId });
    });
  };

  const handleReadSeat = async () => {
    await runAction("Seat status check", async () => {
      const user = requireWallet();
      const booked = await isBooked(user, seatId);
      const owner = await getSeatOwner(user, seatId).catch(() => null);

      setSeatStatus({
        seatId,
        isBooked: booked,
        owner
      });
    });
  };

  const handleReadBooking = async () => {
    await runAction("Booking read", async () => {
      const user = requireWallet();
      const booking = await getBooking(user, bookingId);
      setBookingDetails(booking);
    });
  };

  const handleReadStats = async () => {
    await runAction("Stats read", async () => {
      const user = requireWallet();
      const nextStats = await getStats(user);
      setStats(nextStats);
    });
  };

  return (
    <main className="page-shell">
      <nav className="topbar">
        <div>
          <p className="eyebrow">Stellar Testnet Level 3 dApp</p>
          <h1>Cinema Seat Booking</h1>
        </div>

        <button onClick={handleConnect} disabled={loading}>
          {walletLabel}
        </button>
      </nav>

      <section className="hero">
        <div>
          <p className="eyebrow">Transparent on-chain reservations</p>
          <h2>Book cinema seats through Soroban and Freighter.</h2>
          <p>
            This dashboard connects a Stellar wallet, writes booking transactions,
            reads contract state, and displays transaction links for verification.
          </p>
        </div>

        <div className="contract-card">
          <span>Network</span>
          <strong>{runtimeConfig.network}</strong>

          <span>Contract</span>
          <a href={runtimeConfig.contractExplorerUrl} target="_blank" rel="noreferrer">
            {shortenAddress(runtimeConfig.contractId)}
          </a>
        </div>
      </section>

      <section className="grid">
        <div className="panel">
          <h3>Booking Actions</h3>

          <label htmlFor="seat">Seat ID</label>
          <input
            id="seat"
            value={seatId}
            onChange={(event) => setSeatId(event.target.value)}
          />

          <label htmlFor="booking">Booking ID</label>
          <input
            id="booking"
            value={bookingId}
            onChange={(event) => setBookingId(event.target.value)}
          />

          <div className="button-grid">
            <button onClick={handleBookSeat} disabled={loading}>
              Book seat
            </button>

            <button onClick={handleCancelBooking} disabled={loading}>
              Cancel booking
            </button>

            <button onClick={handleCheckIn} disabled={loading}>
              Check in
            </button>
          </div>
        </div>

        <div className="panel">
          <h3>Read Contract State</h3>

          <div className="button-grid">
            <button onClick={handleReadSeat} disabled={loading}>
              Check seat
            </button>

            <button onClick={handleReadBooking} disabled={loading}>
              Load booking
            </button>

            <button onClick={handleReadStats} disabled={loading}>
              Load stats
            </button>
          </div>

          <div className="metric">
            <span>Seat</span>
            <strong>{seatStatus.seatId}</strong>
          </div>

          <div className="metric">
            <span>Booked</span>
            <strong>
              {seatStatus.isBooked === null
                ? "Not checked"
                : seatStatus.isBooked
                  ? "Yes"
                  : "No"}
            </strong>
          </div>

          <div className="metric">
            <span>Owner</span>
            <strong>{seatStatus.owner ? shortenAddress(seatStatus.owner) : "None"}</strong>
          </div>
        </div>

        <div className="panel">
          <h3>Transaction Monitor</h3>

          <p>{message}</p>

          {transaction ? (
            <div className="transaction-box">
              <span>{transaction.status}</span>
              <a href={transaction.explorerUrl} target="_blank" rel="noreferrer">
                View transaction
              </a>
              <code>{transaction.hash}</code>
            </div>
          ) : (
            <p className="muted">No transaction submitted in this session yet.</p>
          )}
        </div>

        <div className="panel">
          <h3>Runtime Data</h3>

          <p className="muted">Booking details</p>
          <pre>{JSON.stringify(bookingDetails, null, 2)}</pre>

          <p className="muted">Stats</p>
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        </div>
      </section>
    </main>
  );
}