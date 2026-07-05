# Cinema Seat Booking on Stellar

## Problem

Traditional seat reservation systems can suffer from duplicate bookings and lack transparent verification of seat ownership.

## Solution

Cinema Seat Booking is a Soroban smart contract on Stellar that allows users to reserve cinema seats securely with on-chain storage and wallet authentication.

## Why Stellar

Stellar with Soroban enables fast, low-cost smart contracts with wallet authentication and event tracking for transparent seat booking.

## Target User

* Cinema customers who want secure seat reservations
* Movie theaters managing booking records
* Developers learning Soroban smart contracts on Stellar

## Live Demo

* Network: Stellar Testnet

* Contract ID:
  `CB67IGMBGF6BEWRS5CZKIVXH7DQC4CYQLH5SRLZMLTMCYK3EOYW2UUAS`

* Sample Transaction:
  https://stellar.expert/explorer/testnet/tx/459a3818d5470c4180832332d3037998078c8b2e8d15331d5a4384f7c3d5288d

## Features

* Book a cinema seat
* Prevent duplicate seat booking
* Wallet authentication using Soroban
* Multi-wallet support
* Persistent on-chain storage
* Contract events for booking tracking

## Smart Contract Flow

1. User connects wallet
2. User selects a seat ID
3. Contract checks if seat already exists
4. If available:

   * Store wallet address
   * Emit BOOKED event
5. Return booking result

## How to Run

1. Clone repository

```bash
git clone https://github.com/yourname/cinema-seat-booking.git
```

2. Enter project

```bash
cd cinema-seat-booking
```

3. Build contract

```bash
cargo build --target wasm32-unknown-unknown --release
```

4. Deploy contract

```bash
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/cinema_booking.wasm --source alice --network testnet
```

5. Invoke booking

```bash
stellar contract invoke \
--id CB67IGMBGF6BEWRS5CZKIVXH7DQC4CYQLH5SRLZMLTMCYK3EOYW2UUAS \
--source alice \
--network testnet \
--send=yes \
-- book_seat \
--user "$(stellar keys address alice)" \
--seat_id 1
```

## Tech Stack

* Smart Contract: Rust
* Framework: Soroban SDK v22
* Blockchain: Stellar Testnet
* Wallet: Stellar CLI identities (Alice / Bob)
* Storage: Soroban persistent storage
* Events: Soroban event system

## Team

* zakin
* Email: [zakinsuong@gmail.com](mailto:your@email.com)
