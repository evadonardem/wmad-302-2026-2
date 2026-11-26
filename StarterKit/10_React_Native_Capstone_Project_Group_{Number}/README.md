# Marketplace App - React Native Capstone (WMAD 302)

A Lazada/Shopee-style marketplace built with **React Native, Expo Router, React Native Paper and TypeScript**, using the [DummyJSON](https://dummyjson.com) Products, Carts, Users and Auth APIs.

## Group Information

| | |
|---|---|
| Group number | _TODO: fill in_ |
| Member(s) | _TODO: full name(s)_ |
| GitHub profile(s) | _TODO: links_ |
| Repository | _TODO: link_ |
| Demo video (2-3 min) | _TODO: link to shared drive_ |
| APK / IPA | _TODO: EAS build link_ |

## Features

| Area | What it does |
|---|---|
| **Home** | Infinite-scroll product list (skip/limit), category chips, flash deals (sorted by discount), skeleton loading, pull-to-refresh, error + retry, add-to-cart |
| **Search & filters** | Debounced search, category / brand / price-range filters, sort (price, rating, discount), infinite scroll |
| **Product detail** | Swipeable image gallery, price + discount, rating stars, specs, reviews, share, quantity picker, add-to-cart |
| **Categories** | Grid with product counts, tap to open filtered results |
| **Cart** | Context + `useReducer`, persisted to AsyncStorage, stock limits, undo remove, tab badge count, empty state |
| **Checkout** | Shipping form with validation, payment method, `POST /carts/add`, confirmation screen |
| **Order history** | Orders placed on the device plus `GET /carts/user/{id}`, order cards and order detail screen |
| **Profile** | Edit profile (`PUT /users/{id}`), saved addresses (add / edit / delete / default), settings, logout |
| **Auth** | Login, register with auto-login, token refresh on 401, protected routes, session restored on launch |

## Getting Started

### Docker (recommended)

```bash
docker-compose up --build        # first run
docker-compose down -v && docker-compose up -d --build   # after adding dependencies
```

Open http://localhost:8081 for the web build. To use Expo Go on a phone, set `REACT_NATIVE_PACKAGER_HOSTNAME` in `docker-compose.yml` to your computer's LAN IP, then recreate the container.

### Without Docker

```bash
npm install
npm start      # press "w" for web, or scan the QR code with Expo Go
```

**Demo account:** `emilys` / `emilyspass` (button on the login screen).

## Scripts

```bash
npm run typecheck      # tsc --noEmit (strict mode)
npm run lint           # expo lint
npm test               # unit + integration tests
npm run test:coverage  # coverage report (thresholds in package.json)
```

## Project Structure

```
app/
  _layout.tsx, providers.tsx      Root layout + providers (Paper, Auth, Cart)
  (auth)/                         login, register
  (app)/                          protected routes (auth guard in _layout.tsx)
    (tabs)/                       home, search, categories, cart, profile
    product/[id].tsx              product detail
    checkout.tsx, orders.tsx, order/[id].tsx
    edit-profile.tsx, addresses.tsx, settings.tsx
context/    AuthContext, CartContext (useReducer)
services/   authApi, productApi, userApi (axios service layer)
utils/      cart, orders, addresses, validation (pure, unit tested), storage (AsyncStorage)
hooks/      useDebounce, useInfiniteScroll, useAsyncStorage, ...
components/ shared UI (EmptyState, Skeleton, ConfirmDialog, ...)
types/      product, order, address, auth interfaces
__tests__/  Jest tests
```

## Architecture Notes

- **State:** `AuthContext` and `CartContext` use `useReducer`. Reducers and calculations live in pure functions (`utils/cart.ts`) so they are easy to test.
- **Service layer:** screens never call axios directly; they use `authApi`, `productApi` and `userApi`.
- **Auth session:** kept in memory (for axios interceptors) and mirrored to AsyncStorage. A 401 triggers one token refresh and a retry; if refresh fails the user is logged out and sent to the login screen.
- **Confirmations:** `Alert.alert` does nothing on web, so confirmations use the Paper-based `ConfirmDialog` and messages use `Snackbar`.

## Known DummyJSON Limitations

DummyJSON is a mock API, so some writes are only simulated:

- **Register:** there is no real `/auth/register`. The app calls `POST /users/add`, tries to sign in with the new credentials, and if that fails (the new user is never saved) it signs in with the demo account and shows the registered name/email on top.
- **Orders:** carts created with `POST /carts/add` are not stored by the API, so each placed order is also saved on the device and shown with the server's carts in Order History.
- **Profile edits:** `PUT /users/{id}` returns the updated user but does not save it, so the change is also applied locally.
- **Search + category:** the API cannot combine them, so with a search term the category filter is applied on the device. Brand and price filters are also applied on the device.
- **Addresses:** DummyJSON has no address endpoint, so addresses are stored on the device.

## API Reference

- Products: `GET /products?limit&skip&sortBy&order`, `/products/{id}`, `/products/search?q=`, `/products/categories`, `/products/category/{slug}`
- Carts: `GET /carts/user/{id}`, `GET /carts/{id}`, `POST /carts/add`
- Users: `PUT /users/{id}`, `POST /users/add`
- Auth: `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`

## Screenshots

_TODO: add screenshots of Home, Search, Product, Cart, Checkout, Orders and Profile._

## License

Educational use only - WMAD 302 Capstone Project
