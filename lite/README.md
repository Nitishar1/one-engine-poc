# OneEngine Lite

The OneEngine design (same theme, layout and components as the main app) with a simple sign-in,
the Home dashboard and the Configurations pages. The sidebar comes from the backend
(`GET /navigation`), so the backend decides which pages each user can open.

React 19 + TypeScript + Vite + Ant Design 6 + Tailwind 4 + TanStack Query + React Hook Form + Zod.

## Run

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev              # http://localhost:5174
```

With `VITE_USE_MOCKS=true` a mock backend in `src/mocks` answers every call. Sign in with any
user name and password; the password `invalid` shows a failed login. Users in the mock data:

| User name     | Roles             | Sees                                     |
| ------------- | ----------------- | ---------------------------------------- |
| `ramakrishna` | Admin, Developer  | everything (Admin roles see every page)  |
| `oeUser`      | Test User         | only what Authorization gives Test User  |
| any other     | Admin             | everything                               |

Mock data is kept in the browser (localStorage); clear the site data to start fresh.

| Command             | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Dev server on port 5174                   |
| `npm run typecheck` | TypeScript check (shows typos with lines) |
| `npm run format`    | Prettier: fixes spacing and indentation   |
| `npm run build`     | Type-check and production build           |

### Real backend

```
# .env
VITE_USE_MOCKS=false
API_PROXY_TARGET=http://localhost:5000
```

The dev server forwards `/api/*` to `API_PROXY_TARGET`, so the browser only talks to one origin
(no CORS, first-party cookies). Production builds never use the mock backend.

## Folders

```
src/
  main.tsx              start-up (mock backend when enabled)
  app/                  App, providers, router, DynamicRoutes (pages from the backend menu)
  config/               env, ROUTES (paths), pageRegistry (path -> page component)
  components/
    common/             reusable UI: AppTable, CrudListPage, FormCard, AppInput, AppSelect,
                        AppCheckbox(Group), IconSelect, DetailsDrawer, RowActions, states...
    layout/             AppLayout, Sidebar, SidebarMenu, Header, Breadcrumb, MainContent, AppFooter
    theme/              themeTokens (colours), antdTheme, ThemeProvider, ThemeToggle
    feedback/           Toaster + toast()
  features/
    auth/               LoginPage, sign-in / session hooks
    navigation/         useNavigation (menu from GET /navigation), menu tree helpers
    home/               Home dashboard
    configurations/     one folder per page: <name>.schema.ts (types + validation),
                        <name>.api.ts (API + hooks), <Name>ListPage.tsx, <Name>FormPage.tsx
    errors/             Not found, Coming soon, crash page
  hooks/                useCrudQueries (list/get/save/delete hooks), useEntityFormPage, ...
  services/api/         axios client (tokens, refresh, CSRF, errors), endpoints, CRUD service
  stores/               Zustand: auth (memory only), theme, sidebar
  utils/                sanitize (input cleaning), validators (field rules), helpers, formatters
  mocks/                mock backend: handlers + seed data
  styles/               Tailwind entry, CSS variables, theme CSS, toaster CSS
```

### How a page gets on screen

1. After sign-in, `GET /navigation` returns the user's menu tree.
2. The sidebar is built from it, and `DynamicRoutes` creates a route for each menu path.
3. `config/pageRegistry.ts` maps a path to its page (plus `/new` and `/:id/edit` for forms).
   A menu path with no page shows "coming soon"; any other URL shows "Page not found".

To add a page: build it, add its path to `config/routes.ts`, register it in
`config/pageRegistry.ts`, and add the menu (Configurations > Menu) and its Authorization.

## Backend contract

Every response is `{ "success": true, "data": ... }` with `Content-Type: application/json`.
Errors are `{ "success": false, "message": "...", "errors": { "field": ["message"] } }`.
All endpoints are in `src/services/api/apiEndpoints.ts`; `src/mocks/handlers/index.ts` is a
working example of each.

| Endpoint                                        | Notes                                             |
| ----------------------------------------------- | ------------------------------------------------- |
| `GET /auth/domains`, `POST /auth/login`         | public                                            |
| `GET /auth/session`, `POST /auth/logout`        | session cookie -> new access token                |
| `GET /navigation`                               | menu tree for the signed-in user                  |
| `GET /dashboard/summary`, `GET /lookups/time-zones` |                                               |
| `/configurations/agent-parameters`              | CRUD                                              |
| `/configurations/app-settings`                  | CRUD; secret values returned as `null`            |
| `/configurations/roles`, `/users`, `/domains`   | CRUD                                              |
| `/configurations/menus`, `/reports`             | CRUD                                              |
| `/configurations/data-sources` (+ `/validate`)  | CRUD; connection strings never returned           |
| `GET/PUT /configurations/authorization/:roleId` | `{ menuIds: [...] }`                              |
| `GET /configurations/locked-accounts`, `POST /:id/unlock` |                                         |

CRUD = `GET /x`, `GET /x/:id`, `POST /x`, `PUT /x/:id`, `DELETE /x/:id`.

## Security

What the client does:

- Access token in memory only; the session lives in an httpOnly cookie. On a 401 the token is
  renewed once (shared by all calls) and the call retried; otherwise the user signs in again.
- CSRF: the `XSRF-TOKEN` cookie is sent back as the `X-XSRF-TOKEN` header on every call.
- Inputs are cleaned (`utils/sanitize.ts`: Unicode normalised, control characters removed,
  trimmed) and validated (`utils/validators.ts`): lengths, allowed characters, no HTML or
  script, menu URLs must be in-app paths, report queries must be one read-only SELECT,
  connection strings must be `key=value;` pairs. Every create / update body is cleaned again
  before it is sent.
- Secrets (app setting values marked secret, connection strings) are write-only: never shown,
  typed in password fields, and an empty value on edit keeps the stored one.
- IDs are URL-encoded, only JSON responses are accepted, server error details are never shown,
  the post-login redirect only accepts in-app paths, and data is cleared on sign-out (other
  tabs sign out too).
- Only pages in the user's menu can be opened; Home hides actions for other pages.

What the backend must do (the client checks are only for the user experience):

- Check the token and the user's role on **every** endpoint, including that the role may use
  the page the endpoint belongs to.
- Repeat every validation above server-side; store secrets encrypted and never return them.
- Run report queries with a read-only database account; test connections with a timeout.
- Set the session cookie `HttpOnly; Secure; SameSite=Strict` and a readable `XSRF-TOKEN`
  cookie, and reject POST / PUT / DELETE without a matching `X-XSRF-TOKEN` header.
- Rate-limit `/auth/login` and lock accounts after repeated failures (Locked Accounts page).
