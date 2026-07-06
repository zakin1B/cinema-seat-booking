# Cinema Seat Booking on Stellar

Cinema Seat Booking is a Stellar testnet dApp for transparent cinema seat reservations.

The project demonstrates an end-to-end Soroban application with:

- Smart contract storage
- Wallet authentication
- Contract events
- Frontend contract reads and writes
- Transaction status monitoring
- Mobile responsive UI
- CI workflow for contract and frontend validation

## Problem

Traditional cinema booking systems can suffer from duplicate reservations and limited public verification of seat ownership.

## Solution

Cinema Seat Booking stores seat reservations on Stellar testnet through a Soroban smart contract.

A user connects a wallet, selects a seat, signs a transaction, and can verify whether a seat is already booked.

## Why Stellar

Stellar and Soroban are suitable for this project because they support fast and low-cost smart contract interactions with transparent on-chain state.

## Contract Functions

```text
book_seat(user, seat_id)
is_booked(seat_id)
get_seat_owner(seat_id)
get_booking(seat_id)
get_total_booked()
get_user_bookings(user)
cancel_booking(user, seat_id)
check_in(user, seat_id)
```

## Project Structure

```text
cinema-seat-booking
â”œâ”€â”€ contracts
â”‚   â””â”€â”€ cinema-seat-booking
â”‚       â”œâ”€â”€ Cargo.toml
â”‚       â””â”€â”€ src
â”‚           â”œâ”€â”€ lib.rs
â”‚           â””â”€â”€ test.rs
â”œâ”€â”€ frontend
â”‚   â””â”€â”€ src
â”‚       â”œâ”€â”€ App.tsx
â”‚       â”œâ”€â”€ contractConfig.ts
â”‚       â””â”€â”€ services
â”‚           â”œâ”€â”€ contract.ts
â”‚           â””â”€â”€ wallet.ts
â”œâ”€â”€ scripts
â”‚   â”œâ”€â”€ deploy-and-save.ps1
â”‚   â””â”€â”€ verify-level3.ps1
â”œâ”€â”€ docs
â”‚   â””â”€â”€ ARCHITECTURE.md
â”œâ”€â”€ .github
â”‚   â””â”€â”€ workflows
â”‚       â””â”€â”€ ci.yml
â””â”€â”€ README.md
```

## Current Testnet Contract

Network:

```text
Stellar Testnet
```

Contract ID:

```text
CB67IGMBGF6BEWRS5CZKIVXH7DQC4CYQLH5SRLZMLTMCYK3EOYW2UUAS
```

Sample transaction:

```text
https://stellar.expert/explorer/testnet/tx/459a3818d5470c4180832332d3037998078c8b2e8d15331d5a4384f7c3d5288d
```

## Run Contract Tests

```bash
cargo test --workspace
```

## Build Contract

```bash
rustup target add wasm32v1-none
cargo build --workspace --target wasm32v1-none --release
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## Verify Project Locally

PowerShell:

```powershell
.\scripts\verify-level3.ps1
```

## Deploy Contract

PowerShell:

```powershell
.\scripts\deploy-and-save.ps1 -SourceAccount deployer
```

The deploy script saves the new contract ID to:

```text
CONTRACT_ID.txt
frontend/src/contractConfig.ts
```

## Frontend Flow

1. User connects Freighter wallet.
2. User selects a seat ID.
3. Frontend calls `book_seat`.
4. Freighter signs the prepared transaction.
5. Frontend submits transaction to Stellar RPC.
6. UI shows transaction status and hash.
7. User can check seat status through `is_booked`, `get_seat_owner`, and `get_booking`.

## Tech Stack

- Stellar Testnet
- Soroban SDK
- Rust
- React
- Vite
- TypeScript
- Freighter wallet
- GitHub Actions