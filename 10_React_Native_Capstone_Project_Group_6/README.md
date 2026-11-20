# Marketplace App (Lazada / Shopee style)

> WMAD 302 · 10 React Native Capstone Project · **Team ORDORA** (BSIT – B1)

A mobile marketplace built with **React Native + Expo Router + React Native Paper**. Products, carts and
accounts come from the free [DummyJSON](https://dummyjson.com) API.

## Group

| | |
|---|---|
| Group number | **Group 6** |
| Members | **Agustin, Jecressa** ·  **Liwanag, Denie** ·  **Laoeng Vera** |
| GitHub | [Member 1](https://github.com/REPLACE) · [Member 2](https://github.com/REPLACE) · [Member 3](https://github.com/REPLACE) · [Member 4](https://github.com/REPLACE) |
| Demo video (2-3 min) | **[LINK]** |

## Features

- **Auth**: login, register (with auto-login), token refresh on 401, protected routes, session kept after a refresh
- **Home**: product discovery with categories and deals
- **Search & filters**: debounced search, category / brand / price range, sorting
- **Product detail** and **Categories**
- **Cart**: add / change quantity / remove / undo, stock limits, tab badge, saved on the device (one cart per account)
- **Checkout**: shipping form with validation, payment method, order confirmation
- **Order history** and order details
- **Profile**: edit profile (`PUT /users/{id}`), address book, settings (notifications, default payment), order stats, logout

## Run it

```bash
# with Docker (web at http://localhost:8081)
docker-compose up --build

# or without Docker
npm install
npx expo start          # press "w" for web, or scan the QR code with Expo Go
```

If the web app acts strangely after big changes, restart with `npx expo start -c` (clears the cache).

> Only one capstone (09 or 10) can run at a time because both use port 8081.
> Fix: `docker compose down -v && docker compose up -d`.

## Scripts

| Command | What it does |
|---|---|
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (strict, no `any`) |
| `npm test` | Unit tests |
| `npm test -- --coverage` | Unit tests + coverage table |

## Project structure

```
app/                    Expo Router screens
  (auth)/               login, register (public)
  (app)/                protected screens
    (tabs)/             home, search, categories, cart, profile
    checkout.tsx  orders.tsx  order/[id].tsx  product/[id].tsx
    edit-profile.tsx  addresses.tsx  settings.tsx
components/             ErrorBoundary, ScreenHeader, shared UI
context/                AuthContext, CartContext (Context + useReducer)
services/               authApi, productApi (axios, service layer)
hooks/                  custom hooks
utils/                  pure logic: hash, orders, productFilters, profile, storage
types/                  TypeScript types
__tests__/              unit tests
```

## How it works

- **State**: `AuthContext` and `CartContext` use `useReducer`; reducers are pure functions and are unit tested.
- **Service layer**: screens never call axios directly; they use `authApi` / `productApi`.
- **Tokens**: kept in AsyncStorage (works on phone and web) with an in-memory copy for the axios interceptor.
  A 401 triggers one refresh and a replay of the request; if the refresh fails the user is logged out.
- **Error handling**: network errors show readable messages; an `ErrorBoundary` around the whole app shows a
  "Something went wrong / Try again" screen instead of a blank page.

## DummyJSON limitations (and how the app handles them)

DummyJSON is a fake API: it answers "success" to writes but does not store them.

| Feature | What DummyJSON does | What this app does |
|---|---|---|
| Register | no `/auth/register`; `POST /users/add` only simulates | also saves the account on the device (password stored as a SHA-256 hash) so the person can log in again |
| Registered account session | new users get no tokens | borrows a DummyJSON test user's tokens; the profile shown is the registered person's |
| Checkout | `POST /carts/add` only simulates | order is also saved on the device so it appears in Order History |
| Edit profile | `PUT /users/{id}` only simulates | edit is also saved on the device and re-applied at login |
| Addresses, settings, cart | no endpoints | saved per account in AsyncStorage |

> The device-only accounts are a **demo stand-in** for a real server. A real app would send the password to a
> server over HTTPS and never keep it on the phone.

## Testing

Jest + jest-expo. Tests cover the logic layers: reducers, validation, filters/sorting, order and address
rules, storage, the auth and product services (with a fake axios client) and the error boundary.
Run `npm test -- --coverage` for the coverage table.

## Known limitations

- Wishlist, coupons and dark mode are not part of the core build (bonus features).
- Payment is a choice only (no real payment processing).