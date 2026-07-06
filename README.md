# Cinema Seat Booking

Cinema Seat Booking is a Stellar Testnet dApp for reserving cinema seats through a Soroban smart contract and a Freighter wallet.

This repository follows the completed Level 3 template style from Stellar-token-dapp: Rust workspace, advanced Soroban contract, React/Vite frontend, Freighter signing, Soroban RPC integration, deployment automation, verification script, frontend tests, and GitHub Actions CI.

## Live Links

### GitHub Repository

https://github.com/zakin1B/cinema-seat-booking

### Live Demo

https://cinema-seat-booking-six.vercel.app

## Stellar Testnet Deployment

### Contract ID

``text
CCNXI62IYT6H2CWOWAOH2DQJ3DOUWM5FRQWB5E6EAS4HNSZ3WOQNUTZ5
``

Contract explorer:

``text
https://stellar.expert/explorer/testnet/contract/CCNXI62IYT6H2CWOWAOH2DQJ3DOUWM5FRQWB5E6EAS4HNSZ3WOQNUTZ5
``

### Successful Contract Interaction

Transaction hash:

``text
4233411cd3ee2e4cb751d8452427bc8ce7c98b5f5250f1c7cff5c1a2625b4100
``

Transaction explorer:

``text
https://stellar.expert/explorer/testnet/tx/4233411cd3ee2e4cb751d8452427bc8ce7c98b5f5250f1c7cff5c1a2625b4100
``

## Problem

Cinema seat booking systems usually depend on centralized databases.

This can make it difficult to independently verify whether a seat has been booked, cancelled, checked in, or double-booked.

## Solution

Cinema Seat Booking stores seat reservation state on Stellar Testnet through a Soroban smart contract.

A user can connect a Freighter wallet, book a seat, check seat ownership, cancel a booking, check in, and view transaction status.

## Why Stellar

Stellar is useful for this project because it supports fast settlement, low transaction cost, transparent transaction history, Soroban smart contracts, and wallet signing through Freighter.

## Smart Contract Architecture

Contract location:

``text
contracts/cinema_booking/src/lib.rs
``

The contract includes:

- custom booking struct
- booking status enum
- persistent storage keys
- custom error enum
- initialization flow
- write functions
- read functions
- contract events
- contract tests

## Contract Functions

Write functions:

``text
initialize
book_seat
cancel_booking
check_in
``

Read functions:

``text
admin
is_booked
seat_booking_id
get_seat_owner
get_booking
get_total_booked
get_user_bookings
stats
``

## Frontend Features

The frontend is built with React, Vite, TypeScript, Freighter API, and Stellar SDK.

It includes:

- Freighter wallet connection
- seat booking form
- cancel booking action
- check-in action
- seat status checker
- booking details reader
- contract deployment links
- transaction monitor
- loading states
- error states
- responsive dashboard layout

## Frontend Contract Integration

Frontend service location:

``text
frontend/src/services/contract.ts
``

The frontend contract service uses:

``text
Soroban RPC
TransactionBuilder
Contract.call
prepareTransaction
Freighter signTransaction
sendTransaction
nativeToScVal
scValToNative
``

Frontend functions map to contract functions:

``text
bookSeat       -> book_seat
cancelBooking  -> cancel_booking
checkIn        -> check_in
isBooked       -> is_booked
getSeatOwner   -> get_seat_owner
getBooking     -> get_booking
getStats       -> stats
``

## Repository Structure

``text
cinema-seat-booking
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ contracts
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ cinema_booking
Ã¢â€â€š       Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Cargo.toml
Ã¢â€â€š       Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ src
Ã¢â€â€š           Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ lib.rs
Ã¢â€â€š           Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ test.rs
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ frontend
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ index.html
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ package.json
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ package-lock.json
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ tsconfig.json
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ vite.config.ts
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ src
Ã¢â€â€š       Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ App.css
Ã¢â€â€š       Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ App.tsx
Ã¢â€â€š       Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ contractConfig.ts
Ã¢â€â€š       Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ main.tsx
Ã¢â€â€š       Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ vite-env.d.ts
Ã¢â€â€š       Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ services
Ã¢â€â€š           Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ contract.test.ts
Ã¢â€â€š           Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ contract.ts
Ã¢â€â€š           Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ wallet.ts
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ scripts
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ deploy-and-save.ps1
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ verify-level3.ps1
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ .github
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ workflows
Ã¢â€â€š       Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ ci.yml
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ CONTRACT_ID.txt
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ SUCCESSFUL_TX.txt
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ DEPLOYMENT.md
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Cargo.toml
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Cargo.lock
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ README.md
Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ .gitignore
``

## Local Setup

``powershell
git clone https://github.com/zakin1B/cinema-seat-booking.git
cd cinema-seat-booking
cd frontend
npm install
npm run dev
``

## Contract Commands

``powershell
cargo fmt --all
cargo test --workspace
stellar contract build
``

## Frontend Commands

``powershell
cd frontend
npm test
npm run build
``

## Full Level 3 Verification

Run from the repository root:

``powershell
powershell -ExecutionPolicy Bypass -File .\scripts\verify-level3.ps1
``

## Deployment

Run from the repository root:

``powershell
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-and-save.ps1
``

Deployment evidence is stored in:

``text
DEPLOYMENT.md
CONTRACT_ID.txt
SUCCESSFUL_TX.txt
frontend/src/contractConfig.ts
``

## Testing

The contract tests validate initialization, seat booking, duplicate booking rejection, owner tracking, user booking index, cancellation, check-in flow, and booking stats.

The frontend tests validate Stellar Testnet configuration, deployed contract ID, contract function mapping, and integration exports.

## CI Workflow

GitHub Actions workflow:

``text
.github/workflows/ci.yml
``

The CI pipeline runs Rust formatting, contract tests, WASM build, frontend dependency install, frontend type-check, frontend tests, and frontend build.

## Current Status

Completed:

- Soroban smart contract
- contract tests
- frontend contract integration
- Freighter wallet service
- responsive frontend dashboard
- frontend tests
- deployment automation
- verification automation
- GitHub Actions CI
- live Vercel deployment
- Stellar Testnet deployment evidence

## Notes

This repository does not include private keys, secret phrases, local build outputs, dependency folders, or local deploy logs.

Generated folders and local logs are ignored by git.