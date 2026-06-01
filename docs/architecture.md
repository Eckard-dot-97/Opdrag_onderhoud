# Architecture

## Schema and Constraints

The database uses four tables:

**users** stores registered accounts. Email is unique (enforced by `uq_users_email`). Passwords are never stored in plain text — only a bcrypt hash (cost factor 12).

**pokemon** is a local cache of data fetched from PokeAPI. `pokeapi_id` is unique, preventing duplicate entries for the same Pokémon. `types` and `stats` are stored as JSON columns, which avoids over-normalising read-only reference data into separate tables. mysql2 automatically parses these back into JavaScript objects on retrieval.

**backpack** is a join table between a user and their saved Pokémon. A composite unique key on `(user_id, pokemon_id)` prevents duplicate entries at the database level. Cascade deletes ensure backpack entries are removed if the user or Pokémon record is deleted.

**team** mirrors backpack but adds a `slot` column (1–6). Two unique constraints are applied: one on `(user_id, pokemon_id)` to prevent the same Pokémon appearing twice, and one on `(user_id, slot)` to prevent two Pokémon sharing the same slot. A `CHECK` constraint enforces valid slot values.

The rule that a Pokémon can exist in either the backpack or the team, never both, is enforced at the application layer inside database transactions in `collection.service.js`. When moving a Pokémon to the team it is atomically deleted from the backpack and inserted into the team in a single transaction, guaranteeing consistency even under concurrent requests.

## PokeAPI vs MySQL

Pokémon data originates from the public REST API at https://pokeapi.co/api/v2/. The strategy is to fetch from PokeAPI on demand and cache the result locally:

- On a search request, the backend first queries the local `pokemon` table for a name match.
- If no local record exists, it fetches the Pokémon from PokeAPI, normalises the response (extracting id, name, sprite URL, types, and base stats), and upserts it into the `pokemon` table using `ON DUPLICATE KEY UPDATE`.
- Subsequent searches for the same Pokémon are served entirely from MySQL with no external call.

Evolution chain data is fetched live from PokeAPI on every detail page request and is not cached locally. Chains change rarely and caching them would require additional tables for minimal performance benefit.

## Authentication and Protected Routes

Authentication uses JSON Web Tokens (JWT). On register or login, the server issues a signed token containing `sub` (the user's database id) and `email`, with a 7-day expiry.

The token is stored in `localStorage` on the client and sent as an `Authorization: Bearer <token>` header on every protected request. The `auth.middleware.js` verifies the token signature against `JWT_SECRET`, and on success attaches `req.user = { id, email }` to the request for downstream use. All routes except `/health`, `/api/auth/register`, and `/api/auth/login` require a valid token.

## Route / Controller / Service Layout

The backend follows a three-layer architecture:

**Routes** (`src/routes/*.routes.js`) declare HTTP method and path, apply the auth middleware where required, and delegate to a named controller function. They contain no business logic.

**Controllers** (`src/controllers/*.controller.js`) validate the request (checking required fields, returning 400 for missing input), call the appropriate service function, and map the result or error to an HTTP response. They contain no SQL.

**Services** (`src/services/*.service.js`) contain all business logic and database access. `auth.service.js` handles password hashing and token issuance. `pokeapi.service.js` manages the PokeAPI fetch-and-cache flow. `collection.service.js` handles all backpack and team operations, including the transactional move logic and ownership enforcement — every query filters by `user_id` so users can only access their own data.

## SPA Structure

The frontend is a React single-page application built with Vite. React Router handles client-side routing with seven routes defined in `App.jsx`. The `AppLayout` shell component renders a persistent header with navigation and an `<Outlet />` for the active route — the header does not remount on navigation.

**State** is managed locally with `useState` inside each feature component. There is no global state store; the JWT token and email are read from `localStorage` directly via the `useAuth` hook and `apiFetch` utility.

**API calls** all go through `src/api/client.js` (`apiFetch`), which automatically attaches the Bearer token, parses JSON responses, and throws structured errors with a `status` field so components can handle 401s by redirecting to login.

**Loading and error states** are handled inline in each feature component: a loading message is shown while the request is in flight, an error message replaces the content on failure, and 401 responses redirect the user to the login page.

## Deliberate Omissions and Trade-offs

**No global auth context:** a React context provider would centralise login state and allow the nav to reactively update on login/logout without a page refresh. This was omitted to keep the component tree simple; the nav re-reads `localStorage` on each render which is sufficient for the assignment scope.

**No refresh tokens:** the JWT has a 7-day expiry. A production system would use short-lived access tokens and a refresh token rotation strategy. For this assessment, simplicity was prioritised.

**No pagination on search:** search returns all local cache matches plus one PokeAPI result. A real implementation would paginate PokeAPI's full Pokémon list. The current approach satisfies the brief's requirement of searching by name.

**JSON columns for types and stats:** avoids creating `pokemon_types` and `pokemon_stats` relational tables for data that is purely read-only reference material. The trade-off is that filtering or sorting by type requires application-level logic rather than a SQL `WHERE` clause.

**No evolution chain caching:** fetched live from PokeAPI on every detail view. Acceptable given the infrequency of access and the low complexity it avoids.
