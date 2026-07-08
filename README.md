# Cinema Seat Booking

Cinema Seat Booking is a Stellar Testnet dApp for reserving cinema seats through a Soroban smart contract and a Freighter wallet dashboard.

The project demonstrates a complete Stellar Level 3 dApp flow with smart contract logic, contract tests, deployment evidence, frontend wallet signing, Soroban RPC integration, CI/CD, and local verification scripts.

## Live Links

GitHub repository:

https://github.com/zakin1B/cinema-seat-booking

Live demo:

https://cinema-seat-booking-six.vercel.app

## Problem

Cinema seat booking systems usually depend on centralized databases.

This can make it difficult to independently verify:

- whether a seat has been booked
- whether a booking has been cancelled
- whether a passenger has checked in
- whether a seat is double-booked
- which wallet owns a booking

## Solution

Cinema Seat Booking stores seat reservation state on Stellar Testnet through a Soroban smart contract.

A user can connect a Freighter wallet, book a seat, check seat ownership, cancel a booking, check in, and view transaction status.

## Why Stellar

Stellar is useful for this project because it supports fast settlement, low transaction cost, transparent transaction history, Soroban smart contracts, and wallet signing through Freighter.

## Stellar Testnet Deployment

Network:

Stellar Testnet

Contract ID:

CAPAJLC2WT435RDYVHB5M6UTM3YTOS3ZZ3RXDM4H7QW5TZ363UEZ5KN7

Contract explorer:

https://stellar.expert/explorer/testnet/contract/CAPAJLC2WT435RDYVHB5M6UTM3YTOS3ZZ3RXDM4H7QW5TZ363UEZ5KN7

## Successful Contract Interaction

Transaction hash:

d82889e5d8677e4c15742829fb115988a8fbfa31c0049de85e46db26e12ff8b6

Transaction explorer:

https://stellar.expert/explorer/testnet/tx/d82889e5d8677e4c15742829fb115988a8fbfa31c0049de85e46db26e12ff8b6

## Features

- Freighter wallet connect
- Freighter wallet disconnect
- connected wallet address display
- seat booking form
- cancel booking action
- check-in action
- seat status checker
- booking details reader
- contract stats
- transaction signing
- transaction hash display
- loading states
- handled error states
- activity feed
- responsive dashboard layout
- CI/CD workflow
- local verification script
- deployment automation

## Smart Contract

Contract location:

contracts/cinema_booking

The contract includes these public functions:

- initialize
- book_seat
- cancel_booking
- check_in
- is_booked
- seat_booking_id
- get_seat_owner
- get_booking
- get_total_booked
- get_user_bookings
- stats

The contract uses:

- custom booking struct
- booking status enum
- persistent storage keys
- custom error enum
- contract events
- authorization checks
- contract tests

## Frontend

Frontend location:

frontend

Important files:

- frontend/src/App.tsx
- frontend/src/App.css
- frontend/src/contractConfig.ts
- frontend/src/services/wallet.ts
- frontend/src/services/contract.ts
- frontend/src/services/contract.test.ts

The frontend contract service uses:

- Soroban RPC
- TransactionBuilder
- Contract.call
- prepareTransaction
- Freighter signTransaction
- sendTransaction
- nativeToScVal
- scValToNative

Frontend functions map to contract functions:

- bookSeat -> book_seat
- cancelBooking -> cancel_booking
- checkIn -> check_in
- isBooked -> is_booked
- getSeatOwner -> get_seat_owner
- getBooking -> get_booking
- getStats -> stats

## Repository Structure

<pre>
cinema-seat-booking
|-- contracts
|   `-- cinema_booking
|       |-- Cargo.toml
|       `-- src
|           |-- lib.rs
|           `-- test.rs
|-- frontend
|   |-- index.html
|   |-- package.json
|   |-- package-lock.json
|   |-- tsconfig.json
|   |-- vite.config.ts
|   `-- src
|       |-- App.css
|       |-- App.tsx
|       |-- contractConfig.ts
|       |-- main.tsx
|       |-- vite-env.d.ts
|       `-- services
|           |-- contract.test.ts
|           |-- contract.ts
|           `-- wallet.ts
|-- scripts
|   |-- deploy-and-save.ps1
|   `-- verify-level3.ps1
|-- .github
|   `-- workflows
|       `-- ci.yml
|-- docs
|   |-- ARCHITECTURE.md
|   `-- QUALITY_AND_DEPLOYMENT.md
|-- CONTRACT_ID.txt
|-- SUCCESSFUL_TX.txt
|-- DEPLOYMENT.md
|-- vercel.json
|-- Cargo.toml
|-- Cargo.lock
|-- README.md
`-- .gitignore
</pre>

## Local Setup

Clone the repository:

<pre>
git clone https://github.com/zakin1B/cinema-seat-booking.git

cd cinema-seat-booking
</pre>

Install frontend dependencies:

<pre>
cd frontend

npm install
</pre>

Run frontend locally:

<pre>
npm run dev
</pre>

## Contract Commands

From the repository root:

<pre>
cargo fmt --all

cargo test --workspace

cargo build --workspace --target wasm32v1-none --release
</pre>

## Frontend Commands

From the frontend folder:

<pre>
npm run type-check

npm test

npm run build
</pre>

## Full Local Verification

From the repository root:

<pre>
powershell -ExecutionPolicy Bypass -File scripts/verify-level3.ps1
</pre>

## Deployment

From the repository root:

<pre>
powershell -ExecutionPolicy Bypass -File scripts/deploy-and-save.ps1
</pre>

Deployment evidence is stored in:

- CONTRACT_ID.txt
- SUCCESSFUL_TX.txt
- DEPLOYMENT.md
- frontend/src/contractConfig.ts

## CI/CD

GitHub Actions workflow:

.github/workflows/ci.yml

The CI pipeline runs:

- Rust formatting
- contract tests
- contract WASM build
- frontend dependency install
- frontend type-check
- frontend tests
- frontend production build
- project structure checks

## Current Status

Completed:

- Soroban smart contract
- contract tests
- Freighter wallet service
- frontend contract integration
- responsive dashboard
- frontend tests
- deployment automation
- deployment evidence
- verification automation
- GitHub Actions CI configuration
- Vercel deployment configuration
- live Vercel deployment

## Notes

This repository does not include private keys, secret phrases, dependency folders, local build outputs, or local deploy logs.

Generated folders and local logs are ignored by git.