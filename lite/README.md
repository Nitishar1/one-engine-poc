# OneEngine Lite

Login, a sidebar menu that comes from the backend, and a Configurations page.
React + TypeScript + Vite + Ant Design.

In the OneEngine repo this app lives in `lite/`; run the commands below inside that folder.
It is self-contained and can be copied out as its own project.

## Run

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev              # http://localhost:5174
```

With `VITE_USE_MOCKS=true` the app uses the fake backend in `src/mocks` (sign in with any
user name and password; the password `invalid` shows a failed login).

To use the real backend, set in `.env` and restart `npm run dev`:

```
VITE_USE_MOCKS=false
API_PROXY_TARGET=http://localhost:5000
```

The dev server forwards `/api/*` to that address.

## Folders

```
src/
  main.tsx          starts the app (and the mock backend when enabled)
  App.tsx           routes: /login, everything else needs a signed-in user
  config.ts         settings from .env
  styles.css        page layout only; Ant Design styles its own components
  api/              everything that talks to the backend
    client.ts         axios setup: token, refresh on 401, CSRF, safe error messages
    endpoints.ts      backend URLs
    types.ts          request / response shapes
    authApi.ts, menuApi.ts, configurationApi.ts
  mocks/            fake backend (same URLs and responses as the real one)
  auth/             who is signed in (AuthContext) and the route guard
  hooks/useApi.ts   load data with loading / error / reload
  layout/           sidebar + header; menu.tsx turns backend menus into antd items
  pages/            LoginPage, MenuPage (picks the page for the URL), configurations/
```

## How the menu works

1. After login, `GET /menus` returns the user's menu (see `src/mocks/data.ts` for the shape).
2. The sidebar is built from it, so the backend decides what each user sees.
3. `MenuPage` only opens URLs that are in that menu. `src/pages/index.ts` maps each path to a
   component; a path with no component shows "coming soon".

To add a page: create the component, add its path to `src/pages/index.ts`, and add the menu
item on the backend (and in `src/mocks/data.ts` for mock mode).

## Backend contract

Every response is `{ "success": true, "data": ... }` with `Content-Type: application/json`.
Errors are `{ "success": false, "message": "..." }` with a 4xx/5xx status.

| Method | URL                       | Body / result                                       |
| ------ | ------------------------- | --------------------------------------------------- |
| GET    | `/auth/domains`           | `["LOCAL", ...]`                                    |
| POST   | `/auth/login`             | `{ domain, username, password }` -> `{ user, accessToken }`, sets session cookie |
| GET    | `/auth/session`           | from the session cookie -> `{ user, accessToken }`  |
| POST   | `/auth/logout`            | ends the session                                    |
| GET    | `/menus`                  | `MenuItem[]` for the signed-in user                 |
| GET    | `/configurations`         | `Configuration[]`                                   |
| POST   | `/configurations`         | `{ key, value, description }` -> `Configuration`    |
| PUT    | `/configurations/:id`     | `{ key, value, description }` -> `Configuration`    |
| DELETE | `/configurations/:id`     | `null`                                              |

## Security

The client:

- keeps the access token in memory only; the session lives in an httpOnly cookie
- on a 401, renews the token once from `/auth/session` and retries, otherwise shows login
- sends the `XSRF-TOKEN` cookie back as the `X-XSRF-TOKEN` header (CSRF protection)
- URL-encodes ids, rejects non-JSON responses, never shows server error details
- only opens pages that are in the user's menu, and only redirects to in-app paths

The backend must:

- check the token and the user's permissions on **every** request (the client checks are
  only for the user experience), including that the user may use each menu page's APIs
- set the session cookie `HttpOnly; Secure; SameSite=Strict` and a readable `XSRF-TOKEN`
  cookie, and reject POST/PUT/DELETE whose `X-XSRF-TOKEN` header doesn't match it
- validate every request body and rate-limit `/auth/login`
