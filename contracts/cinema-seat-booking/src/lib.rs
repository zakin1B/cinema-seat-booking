#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, Vec,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum BookingStatus {
    Booked,
    Cancelled,
    CheckedIn,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SeatBooking {
    pub owner: Address,
    pub seat_id: u32,
    pub status: BookingStatus,
    pub booked_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Seat(u32),
    Booking(u32),
    TotalBooked,
    UserBookings(Address),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum BookingError {
    SeatNotFound = 1,
    NotSeatOwner = 2,
    AlreadyCancelled = 3,
    InvalidSeat = 4,
}

#[contract]
pub struct CinemaSeatBooking;

#[contractimpl]
impl CinemaSeatBooking {
    pub fn book_seat(env: Env, user: Address, seat_id: u32) -> bool {
        user.require_auth();

        if seat_id == 0 {
            return false;
        }

        let seat_key = DataKey::Seat(seat_id);

        if env.storage().persistent().has(&seat_key) {
            return false;
        }

        let booking = SeatBooking {
            owner: user.clone(),
            seat_id,
            status: BookingStatus::Booked,
            booked_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&seat_key, &user);
        env.storage()
            .persistent()
            .set(&DataKey::Booking(seat_id), &booking);

        let total = Self::get_total_booked(env.clone());
        env.storage()
            .persistent()
            .set(&DataKey::TotalBooked, &(total + 1));

        let user_key = DataKey::UserBookings(user.clone());
        let mut user_seats: Vec<u32> = env
            .storage()
            .persistent()
            .get(&user_key)
            .unwrap_or(Vec::new(&env));

        user_seats.push_back(seat_id);
        env.storage().persistent().set(&user_key, &user_seats);

        env.events()
            .publish((symbol_short!("BOOKED"), seat_id), booking);

        true
    }

    pub fn is_booked(env: Env, seat_id: u32) -> bool {
        env.storage().persistent().has(&DataKey::Seat(seat_id))
    }

    pub fn get_seat_owner(env: Env, seat_id: u32) -> Option<Address> {
        env.storage().persistent().get(&DataKey::Seat(seat_id))
    }

    pub fn get_booking(env: Env, seat_id: u32) -> Option<SeatBooking> {
        env.storage().persistent().get(&DataKey::Booking(seat_id))
    }

    pub fn get_total_booked(env: Env) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::TotalBooked)
            .unwrap_or(0)
    }

    pub fn get_user_bookings(env: Env, user: Address) -> Vec<u32> {
        env.storage()
            .persistent()
            .get(&DataKey::UserBookings(user))
            .unwrap_or(Vec::new(&env))
    }

    pub fn cancel_booking(env: Env, user: Address, seat_id: u32) -> Result<bool, BookingError> {
        user.require_auth();

        let mut booking =
            Self::get_booking(env.clone(), seat_id).ok_or(BookingError::SeatNotFound)?;

        if booking.owner != user {
            return Err(BookingError::NotSeatOwner);
        }

        if booking.status == BookingStatus::Cancelled {
            return Err(BookingError::AlreadyCancelled);
        }

        booking.status = BookingStatus::Cancelled;

        env.storage().persistent().remove(&DataKey::Seat(seat_id));

        env.storage()
            .persistent()
            .set(&DataKey::Booking(seat_id), &booking);

        let total = Self::get_total_booked(env.clone());

        if total > 0 {
            env.storage()
                .persistent()
                .set(&DataKey::TotalBooked, &(total - 1));
        }

        env.events()
            .publish((symbol_short!("CANCELLED"), seat_id), booking);

        Ok(true)
    }

    pub fn check_in(env: Env, user: Address, seat_id: u32) -> Result<SeatBooking, BookingError> {
        user.require_auth();

        let mut booking =
            Self::get_booking(env.clone(), seat_id).ok_or(BookingError::SeatNotFound)?;

        if booking.owner != user {
            return Err(BookingError::NotSeatOwner);
        }

        booking.status = BookingStatus::CheckedIn;

        env.storage()
            .persistent()
            .set(&DataKey::Booking(seat_id), &booking);

        env.events()
            .publish((symbol_short!("CHECKIN"), seat_id), booking.clone());

        Ok(booking)
    }
}

#[cfg(test)]
mod test;
