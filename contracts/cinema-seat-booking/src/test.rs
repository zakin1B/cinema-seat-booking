#![cfg(test)]

extern crate std;

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::Env;

#[test]
fn books_seat_and_tracks_owner() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(CinemaSeatBooking, ());
    let client = CinemaSeatBookingClient::new(&env, &contract_id);

    let user = Address::generate(&env);

    let booked = client.book_seat(&user, &12);

    assert_eq!(booked, true);
    assert_eq!(client.is_booked(&12), true);
    assert_eq!(client.get_seat_owner(&12), Some(user.clone()));
    assert_eq!(client.get_total_booked(), 1);
}

#[test]
fn rejects_duplicate_booking() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(CinemaSeatBooking, ());
    let client = CinemaSeatBookingClient::new(&env, &contract_id);

    let first_user = Address::generate(&env);
    let second_user = Address::generate(&env);

    assert_eq!(client.book_seat(&first_user, &7), true);
    assert_eq!(client.book_seat(&second_user, &7), false);
    assert_eq!(client.get_seat_owner(&7), Some(first_user));
}

#[test]
fn stores_user_booking_index() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(CinemaSeatBooking, ());
    let client = CinemaSeatBookingClient::new(&env, &contract_id);

    let user = Address::generate(&env);

    assert_eq!(client.book_seat(&user, &3), true);
    assert_eq!(client.book_seat(&user, &4), true);

    let seats = client.get_user_bookings(&user);

    assert_eq!(seats.len(), 2);
    assert_eq!(seats.get(0).unwrap(), 3);
    assert_eq!(seats.get(1).unwrap(), 4);
}

#[test]
fn cancels_booking_and_makes_seat_available() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(CinemaSeatBooking, ());
    let client = CinemaSeatBookingClient::new(&env, &contract_id);

    let user = Address::generate(&env);

    assert_eq!(client.book_seat(&user, &21), true);
    assert_eq!(client.is_booked(&21), true);

    let cancelled = client.cancel_booking(&user, &21);

    assert_eq!(cancelled, true);
    assert_eq!(client.is_booked(&21), false);
    assert_eq!(client.get_total_booked(), 0);
}

#[test]
fn checks_in_booked_user() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(CinemaSeatBooking, ());
    let client = CinemaSeatBookingClient::new(&env, &contract_id);

    let user = Address::generate(&env);

    assert_eq!(client.book_seat(&user, &31), true);

    let booking = client.check_in(&user, &31);

    assert_eq!(booking.seat_id, 31);
    assert_eq!(booking.owner, user);
    assert_eq!(booking.status, BookingStatus::CheckedIn);
}
