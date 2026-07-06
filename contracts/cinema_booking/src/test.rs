#![cfg(test)]

extern crate std;

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::Env;

fn create_client<'a>(env: &'a Env) -> (CinemaBookingContractClient<'a>, Address) {
    env.mock_all_auths();

    let contract_id = env.register(CinemaBookingContract, ());
    let client = CinemaBookingContractClient::new(env, &contract_id);
    let admin = Address::generate(env);

    client.initialize(&admin);

    (client, admin)
}

#[test]
fn initializes_contract_admin() {
    let env = Env::default();
    let (client, admin) = create_client(&env);

    assert_eq!(client.admin(), admin);

    let stats = client.stats();

    assert_eq!(stats.total_bookings, 0);
    assert_eq!(stats.active_bookings, 0);
    assert_eq!(stats.checked_in, 0);
}

#[test]
fn books_seat_and_tracks_owner() {
    let env = Env::default();
    let (client, _) = create_client(&env);

    let user = Address::generate(&env);
    let booking_id = client.book_seat(&user, &12);

    assert_eq!(booking_id, 1);
    assert_eq!(client.is_booked(&12), true);
    assert_eq!(client.seat_booking_id(&12), Some(1));
    assert_eq!(client.get_seat_owner(&12), Some(user.clone()));

    let booking = client.get_booking(&booking_id);

    assert_eq!(booking.owner, user);
    assert_eq!(booking.seat_id, 12);
    assert_eq!(booking.status, BookingStatus::Booked);
}

#[test]
#[should_panic]
fn rejects_duplicate_seat_booking() {
    let env = Env::default();
    let (client, _) = create_client(&env);

    let first_user = Address::generate(&env);
    let second_user = Address::generate(&env);

    client.book_seat(&first_user, &7);
    client.book_seat(&second_user, &7);
}

#[test]
fn tracks_owner_booking_index() {
    let env = Env::default();
    let (client, _) = create_client(&env);

    let user = Address::generate(&env);

    let first = client.book_seat(&user, &3);
    let second = client.book_seat(&user, &4);

    let bookings = client.get_user_bookings(&user);

    assert_eq!(bookings.len(), 2);
    assert_eq!(bookings.get(0).unwrap(), first);
    assert_eq!(bookings.get(1).unwrap(), second);
}

#[test]
fn cancels_booking_and_releases_seat() {
    let env = Env::default();
    let (client, _) = create_client(&env);

    let user = Address::generate(&env);

    let booking_id = client.book_seat(&user, &21);

    assert_eq!(client.is_booked(&21), true);

    let cancelled = client.cancel_booking(&user, &booking_id);

    assert_eq!(cancelled, true);
    assert_eq!(client.is_booked(&21), false);

    let booking = client.get_booking(&booking_id);

    assert_eq!(booking.status, BookingStatus::Cancelled);

    let stats = client.stats();

    assert_eq!(stats.total_bookings, 1);
    assert_eq!(stats.active_bookings, 0);
}

#[test]
fn checks_in_booked_user() {
    let env = Env::default();
    let (client, _) = create_client(&env);

    let user = Address::generate(&env);

    let booking_id = client.book_seat(&user, &31);
    let booking = client.check_in(&user, &booking_id);

    assert_eq!(booking.id, booking_id);
    assert_eq!(booking.seat_id, 31);
    assert_eq!(booking.owner, user);
    assert_eq!(booking.status, BookingStatus::CheckedIn);

    let stats = client.stats();

    assert_eq!(stats.checked_in, 1);
}
