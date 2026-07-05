#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype,
    symbol_short, Address, Env
};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Seat(u32),
}

#[contract]
pub struct CinemaBooking;

#[contractimpl]
impl CinemaBooking {

    pub fn book_seat(
        env: Env,
        user: Address,
        seat_id: u32
    ) -> bool {

        user.require_auth();

        let key = DataKey::Seat(seat_id);

        // ghế đã đặt -> trả false
        if env.storage().persistent().has(&key) {
            return false;
        }

        // lưu người đặt
        env.storage()
            .persistent()
            .set(&key, &user);

        // emit event
        env.events().publish(
            (symbol_short!("BOOKED"), seat_id),
            &user
        );

        true
    }

    pub fn is_booked(
        env: Env,
        seat_id: u32
    ) -> bool {

        env.storage()
            .persistent()
            .has(&DataKey::Seat(seat_id))
    }

    pub fn get_seat_owner(
        env: Env,
        seat_id: u32
    ) -> Option<Address> {

        env.storage()
            .persistent()
            .get(&DataKey::Seat(seat_id))
    }
}