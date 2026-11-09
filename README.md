# OneEngine — Client Application

React 19 + TypeScript + Vite front end for OneEngine, the AI-infused automation platform.

## Getting started

```bash
cp .env.example .env      # adjust if needed
npm install
npm run dev               # http://localhost:5173
```

With `VITE_USE_MOCKS=true` (the default) the app runs fully in the browser against the mock API.
Sign in with any domain, user name and password (the password `invalid` simulates a failed login).

| Command           | Purpose                                  |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Dev server with HMR                      |
| `npm run build`   | Type-check and production build          |
| `npm run preview` | Serve the production build               |
| `npm run lint`    | ESLint (incl. React Compiler hook rules) |
| `npm run format`  | Prettier                                 |
| `npm test`        | Vitest + React Testing Library           |

## Environment

| Variable                         | Default                        | Notes                                                  |
| -------------------------------- | ------------------------------ | ------------------------------------------------------ |
| `VITE_API_BASE_URL`              | `/api`                         | Backend base URL; prefer a same-origin path            |
| `VITE_USE_MOCKS`                 | `true` (dev) / `false` (build) | `false` sends every request to the real backend        |
| `VITE_ALLOW_MOCKS_IN_PRODUCTION` | `false`                        | Only for static demo builds; mocks accept any password |
| `VITE_API_TIMEOUT`               | `30000`                        | Request timeout (ms)                                   |
| `API_PROXY_TARGET`               | —                              | Dev server only: backend that `/api` is proxied to     |

`VITE_*` values are bundled into the client — never put secrets in them.

### Running against the real backend

```bash
# .env
VITE_USE_MOCKS=false
VITE_API_BASE_URL=/api
API_PROXY_TARGET=http://localhost:5000   # the dev server forwards /api/* here
```

The browser then talks to a single origin (`localhost:5173`), so cookies are first-party and no
CORS setup is needed. In production, serve the app and the API from the same origin the same way
(reverse proxy `/api` to the backend). Production builds ignore `VITE_USE_MOCKS=true` unless
`VITE_ALLOW_MOCKS_IN_PRODUCTION=true`.

## OneEngine Lite (`lite/`)

`lite/` is a separate, minimal app (login, a backend-driven menu, header, footer, light / dark
theme and a Configurations page) with
its own `package.json`; it does not share code with OneEngine. Run it with
`cd lite && npm install && npm run dev` (http://localhost:5174); see `lite/README.md`.
`/ref2` in this app shows its files in typing order for recreating it by hand.

## Architecture

```
src/
  app/          App, providers, router, query client, route guard
  components/   common/ (design-system wrappers), layout/ (shell), theme/ (tokens + providers)
  config/       env, route paths, navigation tree (drives sidebar + breadcrumbs)
  features/     one folder per domain: pages, components, hooks, services, types, schemas
    auth  dashboard  ciMapping  agentRepository  aiAgents  workflows  reports  modules  errors
  hooks/        cross-feature hooks (CRUD query factory, pagination, debounce, fullscreen…)
  mocks/        mock API (axios adapter + handlers + seed data) — never imported by features
  services/api  axios instance, interceptors, endpoints, CRUD service factory
  stores/       Zustand: theme, app shell, auth
  styles/       Tailwind entry, CSS variables, theme-specific CSS
```

### Key decisions

- **Mocks as an Axios adapter.** Feature services always call real REST endpoints. When
  `VITE_USE_MOCKS=true`, `src/mocks` swaps the Axios adapter, so switching to the backend is a
  config change, and the mock code is a separate lazy chunk. Mock data persists to
  `localStorage` (`oneengine-mock:*`) so demo edits survive reloads.
- **Auth tokens are memory-only.** The access token lives in the Zustand store, not Web
  Storage. `GET /auth/session` exchanges the backend's httpOnly session cookie for a new access
  token; it runs on startup and whenever a call returns 401 (concurrent 401s share one refresh,
  and the failed calls are retried once). If the refresh fails the session ends and the login
  page shows "session expired". Route guards are UX only; the backend must authorise every call.
- **Design tokens have one source.** `components/theme/themeTokens.ts` feeds both the Ant Design
  theme (dark/default algorithms) and `--oe-*` CSS variables, which Tailwind exposes as
  utilities (`bg-surface`, `text-fg`, `border-line`…). antd styles sit in `@layer antd`, below
  Tailwind utilities, and Tailwind's preflight is disabled so it does not fight antd's reset.
- **Navigation is data.** `config/navigation.ts` defines the sidebar tree; active item,
  expanded groups and breadcrumbs are derived from it.
- **CRUD is generated.** `createCrudService` + `createCrudHooks` give each resource typed
  list/detail/save/delete with cache invalidation and toasts; `useEntityFormPage` handles the
  create/edit page lifecycle.

### Runbook builder (`features/workflows`)

- `types/workflow.types.ts` — typed data contract per node type (`WorkflowNodeDataMap`).
- `config/nodeRegistry.ts` — node component, properties form, factory and limits per type.
  **To add a node type:** extend `WorkflowNodeDataMap`, add a node component and a properties
  form, register it, and list it in a palette section.
- `stores/workflowStore.ts` — nodes/edges state, connect/add/duplicate/delete, load/reset.
- `utils/connectionRules.ts` — blocks self-links, edges into Start or out of End, loops,
  duplicate edges, and multiple outputs per handle (branching goes through Condition).
- `utils/validateWorkflow.ts` — pre-save checks (single Start, reachability, required agent
  parameters, condition expressions/branches). Errors block saving and are highlighted on the
  canvas; clicking an issue focuses the step.
- Interactions: drag from the palette (or click to add), connect handles, double-click or
  right-click to configure, Delete/Backspace, minimap, zoom controls, fit view, full screen,
  JSON import/export and an unsaved-changes guard.

## Screens

| Menu                                                             | Route                 | Status                                                    |
| ---------------------------------------------------------------- | --------------------- | --------------------------------------------------------- |
| CIMapping › CI Type / Master / Relationship                      | `/ci-mapping/*`       | List + create/edit (+ graph view for relationships)       |
| Home                                                             | `/home`               | Dashboard (KPIs, charts, recent executions)               |
| Agent Repository                                                 | `/agent-repository`   | Tabs, platform filter, cards, details drawer, create/edit |
| Orchestrator › Runbook / Runbook List                            | `/orchestrator/*`     | Workflow builder + list                                   |
| Reports › Execution Report                                       | `/reports/executions` | Filters, grid, CSV export                                 |
| Agent Repository › AI Model / AIConfiguration / AI Agents        | `/ai/*`               | CRUD + agent workspace                                    |
| Certificate Monitoring, India Cloud, Configurations, ITAssistant | —                     | Routed placeholder until designs are provided             |

## Backend contract

All endpoints are listed in `src/services/api/apiEndpoints.ts` and return
`{ success, data, message? }` with `Content-Type: application/json`; errors return
`{ success: false, message, code?, errors? }`, where `errors` maps field names to messages that
the UI shows on validation failures. Responses that are not a JSON envelope (e.g. an SSO login
page) are rejected as "unexpected response".
The mock handlers in `src/mocks/handlers` are the executable reference for request/response
shapes. AI agent runs (`POST /ai-agents/:id/run`) are simulated locally by the mock layer
(extractive summary / regex extraction); the real backend is expected to call the configured model.

## Security

What the client does (`src/services/api/axiosInstance.ts`):

| Measure             | Detail                                                                             |
| ------------------- | ---------------------------------------------------------------------------------- |
| Token storage       | Access token in memory only; session in an httpOnly cookie (`withCredentials`)     |
| Token refresh       | Single-flight `GET /auth/session` on 401, one retry per request, then sign-out     |
| CSRF                | Echoes the `XSRF-TOKEN` cookie as `X-XSRF-TOKEN`; sends `X-Requested-With`         |
| Path safety         | Ids are URL-encoded via `resourcePath()`; `.`/`..`/empty ids are rejected          |
| Response validation | Only JSON `{ success, data }` envelopes are accepted                               |
| Error messages      | 5xx bodies are never shown; users get a generic message plus the request id        |
| Tracing             | Every request carries a random `X-Request-Id`                                      |
| Cancellation        | Queries pass TanStack Query's `AbortSignal`, so leaving a page aborts its requests |
| Session end         | Query cache is cleared; sign-out in one tab signs out every open tab               |
| Redirects           | Post-login redirect only accepts in-app paths (blocks `//host`, `/\host`)          |
| CSV export          | Formula-injection characters (`= + - @`) are neutralised                           |
| Mocks               | Never enabled in production builds unless explicitly allowed                       |

What the backend must do:

- Authenticate and authorise **every** endpoint; the client's route guards are UX only.
- Set the session cookie `HttpOnly; Secure; SameSite=Strict` (or `Lax`), and a readable
  `XSRF-TOKEN` cookie (`Secure; SameSite=Strict`), and reject state-changing requests whose
  `X-XSRF-TOKEN` header doesn't match it.
- Keep access tokens short-lived; `/auth/session` must only renew from a valid session cookie.
- Validate every request body server-side (client zod schemas are for UX), and rate-limit
  `/auth/login` and `/ai-agents/:id/run` (the client shows `Retry-After` on 429).
- Never put secrets (AI provider keys) in responses; AI model endpoints are called server-side
  and should be restricted to an allow-list to prevent SSRF.
- If the API is on another origin: CORS with an explicit origin (no `*`) and
  `Access-Control-Allow-Credentials: true`.

Headers to set where the built app is hosted (e.g. nginx):

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'sha256-<hash of the theme script in index.html>'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

`style-src 'unsafe-inline'` is needed because Ant Design injects runtime styles.
