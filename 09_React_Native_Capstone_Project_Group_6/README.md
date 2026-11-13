# Cookbook – React Native Capstone (Group 6)

A recipe-discovery mobile app built with **Expo (SDK 51)**, **expo-router** and **React Native Paper**.
Recipes and sign-in come from the [DummyJSON](https://dummyjson.com) Recipes and Auth APIs.

> WMAD 302 – 09 React Native Capstone Project · BSIT – B1 · Group 6

## Team

| Member | GitHub | Role |
| ------ | ------ | ---- |
| Jecressa Agustin | J-Llama | `<role>` |
| Vera Faith Laoeng | LeoneGreek | `<role>` |
| Denie Kirstine Liwanag | denieliwanag17-rave | `<role>` |

Demo video: `<paste link here>`

## Features

- **Auth** – register, log in, persistent session, automatic token refresh, session-expired handling, logout.
- **Home** – recipes load 10 at a time (infinite scroll), pull to refresh, category chips.
- **Search** – debounced text search, filters (cuisine, difficulty, meal type, tag), sorting.
- **Categories** – browse by meal type or tag, with recipe counts.
- **Recipe detail** – ingredients, steps, time, servings, calories, rating, favorite button.
- **Favorites** – saved on the device, undo after removing.
- **Profile** – stats from your favorites, edit profile, settings, logout.
- Loading, empty and error states with retry on every screen; error boundaries for crashes.

## Getting started

Requirements: Node 18+, npm, and the Expo Go app (phone) or a browser/emulator.

```bash
cd 09_React_Native_Capstone_Project_Group_6
npm install
npx expo start          # press w for web, a for Android, or scan the QR in Expo Go
```

### Scripts

| Command | What it does |
| ------- | ------------ |
| `npm start` | Start the Expo dev server |
| `npm test` | Run unit tests |
| `npm test -- --coverage` | Run tests with a coverage report |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

## Project structure

```
app/                  expo-router screens
  (auth)/             login, register
  (app)/              auth-guarded area
    (tabs)/           home, search, categories, favorites, profile
    recipe/[id].tsx   recipe detail
components/           shared UI (cards, loading/empty/error states)
context/              AuthContext, FavoritesContext (useReducer)
hooks/                useDebounce, useAsyncStorage, useRecipeCatalog
services/             authApi, recipeApi (axios)
utils/                storage (AsyncStorage helpers), recipeFilters
types/                TypeScript types
test-utils/           sample data for tests
```

## Architecture

- **State:** React Context + `useReducer` for auth and favorites. Reducers are exported and unit-tested.
- **Service layer:** screens never call axios directly; they use `authApi` and `recipeApi`.
- **Routing:** the `(app)` layout redirects to login when there is no session.
- **Catalog:** the whole recipe list (about 50) is downloaded once, cached, and filtered on the device.

## API endpoints used

| Endpoint | Used for |
| -------- | -------- |
| `POST /auth/login` | Log in (demo/real DummyJSON users) |
| `POST /auth/refresh` | Refresh the access token |
| `PUT /users/{id}` | Edit profile (simulated by DummyJSON) |
| `GET /recipes?limit&skip` | Home paging and full catalog (`limit=0`) |
| `GET /recipes/{id}` | Recipe detail, favorites |
| `GET /recipes/search?q=` | Search |
| `GET /recipes/tags`, `/recipes/tag/{tag}`, `/recipes/meal-type/{type}` | Categories |

## Authentication

1. Log in with a DummyJSON user, or with an account created on the Register screen.
2. The session (user + tokens) is saved in AsyncStorage and restored when the app starts.
3. A `401` response triggers one shared token refresh and a retry; if the refresh fails the user is logged out and sent to Login.

### Things to know (DummyJSON limits)

- DummyJSON has **no register endpoint that saves users**. Accounts made on the Register screen are stored **on the device** (AsyncStorage) and checked at login. Their passwords are kept as plain text, which is acceptable for a class project but **must not be done in a real app**.
- DummyJSON has **no category or random-recipe endpoint**, so "categories" are meal types and tags.
- DummyJSON has **no review text**, only `rating` and `reviewCount`, and only `caloriesPerServing` for nutrition.
- Profile edits for real DummyJSON users are only simulated by the server, so they are also saved on the device.

## Testing

```bash
npm test -- --coverage
```

Tests cover: recipe filters/sorting, storage helpers, `recipeApi` (mocked axios), local `authApi` flows,
`AuthContext` and `FavoritesContext` (reducers and providers), the hooks, and shared UI components.

## Build an installable Android app (EAS)

```bash
npm install -g eas-cli
eas login
eas init                                  # creates a valid project ID in app.json
eas build -p android --profile preview    # produces an .apk you can install
```

## Screenshots

| Home | Search | Categories |
| ---- | ------ | ---------- |
| `<img>` | `<img>` | `<img>` |

| Detail | Favorites | Profile |
| ------ | --------- | ------- |
| `<img>` | `<img>` | `<img>` |

## Git workflow

Feature branches, conventional commits (`feat:`, `fix:`, `test:`, `docs:`), merged through pull requests.
