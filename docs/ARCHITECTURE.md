# Cinema Seat Booking Architecture

Cinema Seat Booking is a Stellar testnet dApp for transparent cinema seat reservations.

## Components

### Soroban Contract

Location:

```text
contracts/cinema-seat-booking
```

The smart contract stores seat ownership in persistent storage.

Core functions:

```text
book_seat
is_booked
get_seat_owner
get_booking
get_total_booked
get_user_bookings
cancel_booking
check_in
```

### Frontend

Location:

```text
frontend
```

The frontend is a Vite + React dashboard. It supports:

```text
Freighter wallet connection
Contract write transaction
Contract read simulation
Transaction status display
Error and loading states
Mobile responsive layout
```

### Contract Integration

Frontend service file:

```text
frontend/src/services/contract.ts
```

This file uses:

```text
rpc.Server
Contract
TransactionBuilder
prepareTransaction
sendTransaction
nativeToScVal
scValToNative
```

The wallet service signs prepared transactions with Freighter.