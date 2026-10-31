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

| Command             | Purpose                                 |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Dev server with HMR                     |
| `npm run build`     | Type-check and production build         |
| `npm run preview`   | Serve the production build              |
| `npm run lint`      | ESLint (incl. React Compiler hook rules)|
| `npm run format`    | Prettier                                |
| `npm test`          | Vitest + React Testing Library          |

## Environment

| Variable            | Default                     | Notes                                             |
| ------------------- | --------------------------- | ------------------------------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Backend base URL                                  |
| `VITE_USE_MOCKS`    | `true`                      | `false` sends every request to the real backend   |
| `VITE_API_TIMEOUT`  | `30000`                     | Request timeout (ms)                              |

`VITE_*` values are bundled into the client — never put secrets in them.

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
  Storage. Session restore calls `GET /auth/session`, which the backend should back with an
  httpOnly refresh cookie (`withCredentials` is on). A 401 clears the session and the login page
  shows "session expired". Route guards are UX only; the backend must authorise every call.
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

| Menu                              | Route                          | Status                    |
| --------------------------------- | ------------------------------ | ------------------------- |
| CIMapping › CI Type / Master / Relationship | `/ci-mapping/*`      | List + create/edit (+ graph view for relationships) |
| Home                              | `/home`                        | Dashboard (KPIs, charts, recent executions) |
| Agent Repository                  | `/agent-repository`            | Tabs, platform filter, cards, details drawer, create/edit |
| Orchestrator › Runbook / Runbook List | `/orchestrator/*`          | Workflow builder + list   |
| Reports › Execution Report        | `/reports/executions`          | Filters, grid, CSV export |
| Agent Repository › AI Model / AIConfiguration / AI Agents | `/ai/*` | CRUD + agent workspace   |
| Certificate Monitoring, India Cloud, Configurations, ITAssistant | — | Routed placeholder until designs are provided |

## Backend contract

All endpoints are listed in `src/services/api/apiEndpoints.ts` and return
`{ success, data, message? }`; errors return `{ success: false, message, code?, errors? }`.
The mock handlers in `src/mocks/handlers` are the executable reference for request/response
shapes. AI agent runs (`POST /ai-agents/:id/run`) are simulated locally by the mock layer
(extractive summary / regex extraction); the real backend is expected to call the configured model.
# one-engine-poc
