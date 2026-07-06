#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, Vec,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum CinemaBookingError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InvalidSeat = 3,
    SeatAlreadyBooked = 4,
    SeatNotFound = 5,
    NotSeatOwner = 6,
    AlreadyCancelled = 7,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum BookingStatus {
    Booked,
    Cancelled,
    CheckedIn,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Booking {
    pub id: u32,
    pub owner: Address,
    pub seat_id: u32,
    pub status: BookingStatus,
    pub created_ledger: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BookingStats {
    pub total_bookings: u32,
    pub active_bookings: u32,
    pub checked_in: u32,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    BookingCount,
    ActiveCount,
    CheckInCount,
    Seat(u32),
    Booking(u32),
    OwnerBookings(Address),
}

#[contract]
pub struct CinemaBookingContract;

#[contractimpl]
impl CinemaBookingContract {
    pub fn initialize(env: Env, admin: Address) -> bool {
        admin.require_auth();

        if env.storage().persistent().has(&DataKey::Admin) {
            env.panic_with_error(CinemaBookingError::AlreadyInitialized);
        }

        env.storage().persistent().set(&DataKey::Admin, &admin);
        env.storage()
            .persistent()
            .set(&DataKey::BookingCount, &0u32);
        env.storage().persistent().set(&DataKey::ActiveCount, &0u32);
        env.storage()
            .persistent()
            .set(&DataKey::CheckInCount, &0u32);

        true
    }

    pub fn admin(env: Env) -> Address {
        Self::read_admin(&env)
    }

    pub fn book_seat(env: Env, user: Address, seat_id: u32) -> u32 {
        user.require_auth();
        Self::require_initialized(&env);

        if seat_id == 0 {
            env.panic_with_error(CinemaBookingError::InvalidSeat);
        }

        if env.storage().persistent().has(&DataKey::Seat(seat_id)) {
            env.panic_with_error(CinemaBookingError::SeatAlreadyBooked);
        }

        let booking_id = Self::get_total_booked(env.clone()) + 1;

        let booking = Booking {
            id: booking_id,
            owner: user.clone(),
            seat_id,
            status: BookingStatus::Booked,
            created_ledger: env.ledger().sequence(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Booking(booking_id), &booking);
        env.storage()
            .persistent()
            .set(&DataKey::Seat(seat_id), &booking_id);
        env.storage()
            .persistent()
            .set(&DataKey::BookingCount, &booking_id);

        let active_count = Self::read_u32(&env, DataKey::ActiveCount);
        env.storage()
            .persistent()
            .set(&DataKey::ActiveCount, &(active_count + 1));

        let owner_key = DataKey::OwnerBookings(user.clone());
        let mut owner_bookings: Vec<u32> = env
            .storage()
            .persistent()
            .get(&owner_key)
            .unwrap_or(Vec::new(&env));

        owner_bookings.push_back(booking_id);
        env.storage().persistent().set(&owner_key, &owner_bookings);

        env.events()
            .publish((symbol_short!("BOOKED"), seat_id), booking_id);

        booking_id
    }

    pub fn cancel_booking(env: Env, user: Address, booking_id: u32) -> bool {
        user.require_auth();
        Self::require_initialized(&env);

        let mut booking = Self::read_booking(&env, booking_id);

        if booking.owner != user {
            env.panic_with_error(CinemaBookingError::NotSeatOwner);
        }

        if booking.status == BookingStatus::Cancelled {
            env.panic_with_error(CinemaBookingError::AlreadyCancelled);
        }

        if booking.status == BookingStatus::Booked {
            let active_count = Self::read_u32(&env, DataKey::ActiveCount);
            if active_count > 0 {
                env.storage()
                    .persistent()
                    .set(&DataKey::ActiveCount, &(active_count - 1));
            }
        }

        booking.status = BookingStatus::Cancelled;

        env.storage()
            .persistent()
            .remove(&DataKey::Seat(booking.seat_id));
        env.storage()
            .persistent()
            .set(&DataKey::Booking(booking_id), &booking);

        env.events()
            .publish((symbol_short!("CANCEL"), booking.seat_id), booking_id);

        true
    }

    pub fn check_in(env: Env, user: Address, booking_id: u32) -> Booking {
        user.require_auth();
        Self::require_initialized(&env);

        let mut booking = Self::read_booking(&env, booking_id);

        if booking.owner != user {
            env.panic_with_error(CinemaBookingError::NotSeatOwner);
        }

        if booking.status == BookingStatus::Cancelled {
            env.panic_with_error(CinemaBookingError::AlreadyCancelled);
        }

        if booking.status == BookingStatus::Booked {
            let active_count = Self::read_u32(&env, DataKey::ActiveCount);
            if active_count > 0 {
                env.storage()
                    .persistent()
                    .set(&DataKey::ActiveCount, &(active_count - 1));
            }

            let check_in_count = Self::read_u32(&env, DataKey::CheckInCount);
            env.storage()
                .persistent()
                .set(&DataKey::CheckInCount, &(check_in_count + 1));
        }

        booking.status = BookingStatus::CheckedIn;

        env.storage()
            .persistent()
            .set(&DataKey::Booking(booking_id), &booking);

        env.events()
            .publish((symbol_short!("CHECKIN"), booking.seat_id), booking_id);

        booking
    }

    pub fn is_booked(env: Env, seat_id: u32) -> bool {
        env.storage().persistent().has(&DataKey::Seat(seat_id))
    }

    pub fn seat_booking_id(env: Env, seat_id: u32) -> Option<u32> {
        env.storage().persistent().get(&DataKey::Seat(seat_id))
    }

    pub fn get_seat_owner(env: Env, seat_id: u32) -> Option<Address> {
        let booking_id: Option<u32> = env.storage().persistent().get(&DataKey::Seat(seat_id));

        match booking_id {
            Some(id) => Some(Self::read_booking(&env, id).owner),
            None => None,
        }
    }

    pub fn get_booking(env: Env, booking_id: u32) -> Booking {
        Self::read_booking(&env, booking_id)
    }

    pub fn get_total_booked(env: Env) -> u32 {
        Self::read_u32(&env, DataKey::BookingCount)
    }

    pub fn get_user_bookings(env: Env, user: Address) -> Vec<u32> {
        env.storage()
            .persistent()
            .get(&DataKey::OwnerBookings(user))
            .unwrap_or(Vec::new(&env))
    }

    pub fn stats(env: Env) -> BookingStats {
        BookingStats {
            total_bookings: Self::read_u32(&env, DataKey::BookingCount),
            active_bookings: Self::read_u32(&env, DataKey::ActiveCount),
            checked_in: Self::read_u32(&env, DataKey::CheckInCount),
        }
    }

    fn require_initialized(env: &Env) {
        if !env.storage().persistent().has(&DataKey::Admin) {
            env.panic_with_error(CinemaBookingError::NotInitialized);
        }
    }

    fn read_admin(env: &Env) -> Address {
        let value: Option<Address> = env.storage().persistent().get(&DataKey::Admin);

        match value {
            Some(admin) => admin,
            None => env.panic_with_error(CinemaBookingError::NotInitialized),
        }
    }

    fn read_booking(env: &Env, booking_id: u32) -> Booking {
        let value: Option<Booking> = env
            .storage()
            .persistent()
            .get(&DataKey::Booking(booking_id));

        match value {
            Some(booking) => booking,
            None => env.panic_with_error(CinemaBookingError::SeatNotFound),
        }
    }

    fn read_u32(env: &Env, key: DataKey) -> u32 {
        let value: Option<u32> = env.storage().persistent().get(&key);
        value.unwrap_or(0)
    }
}

#[cfg(test)]
mod test;
