# Frontend architecture

## Purpose

The Summaries frontend is a standalone Angular 21 application for browsing, managing, and reading book summaries. The codebase is organized around route-level features, reusable layout components, and infrastructure services that isolate browser and API concerns.

## Runtime shape

The application boots through `src/main.ts` and renders the root application component. The server entrypoint is `src/main.server.ts`, with SSR integration in `src/server.ts`. Angular configuration lives in `angular.json`, and the development API proxy is configured in `proxy.conf.json`.

The root route composition is intentionally small:

- `src/app/app.ts` owns the root component.
- `src/app/app.routes.ts` owns browser route configuration.
- `src/app/app.routes.server.ts` owns server-side route behavior.
- `src/app/layout/shell` provides the application frame.
- `src/app/layout/header`, `navigation`, `sidebar`, and `footer` provide shared chrome.
- `src/app/shared` contains reusable presentation components, directives, pipes, validators, and table helpers.

## Folder responsibilities

### `core`

Cross-cutting product capabilities that should have one application-wide owner live here:

- `auth`: authentication flows, guards, interceptors, user state, and account pages.
- `admin`: administration routes, models, data access, and pages.
- `payments`: payment-related pages and data access.
- `config`: environment-backed application and API configuration.
- `http`, `interceptors`, `logging`, and `services`: infrastructure boundaries used by multiple features.

Core code should not import feature-specific UI code. Keep API mapping and authorization decisions close to the owning capability.

### `features`

A feature folder contains a user-facing product capability. The books feature is the primary example:

- `pages` compose route-level experiences.
- `components` provide focused UI pieces.
- `data-access` talks to the API.
- `mappings` translates API contracts into UI models.
- `models` holds feature types.
- `state` owns feature state and request status.
- `validators` owns feature-specific validation.

Pages should orchestrate. Data-access services should fetch and persist. Components should render and emit user intent. Keep those responsibilities separate so each layer can be tested independently.

### `infrastructure`

Infrastructure adapters provide technical services without leaking browser or transport details into pages:

- `api` contains the API client, response types, and API error normalization.
- `logging` provides structured logging.
- `monitoring` provides telemetry.
- `storage` wraps local and session storage.

Use these adapters instead of calling browser globals or `fetch` directly from feature components.

### `layout`

Layout components are shared presentation boundaries. They should contain navigation, frame, and responsive layout behavior, not feature business rules.

### `shared`

Shared code must be genuinely reusable. Do not place a single-feature component here merely because it is small. A shared component should have a stable API, a focused responsibility, and tests for its important states.

## Angular conventions

This project uses Angular 21 standalone components. Follow these conventions for new code:

- Use `ChangeDetectionStrategy.OnPush` for components.
- Use signals for local and derived state.
- Use `input()` and `output()` rather than decorator-based inputs and outputs.
- Use `inject()` for dependency injection.
- Use `@if`, `@for`, and `@switch` in templates.
- Use lazy route loading for feature pages.
- Keep templates declarative; move transformations into computed state, mappings, or services.
- Avoid `any`; model uncertain data as `unknown` and narrow it.
- Prefer reactive forms for multi-field and validated forms.

## State and request handling

Feature stores own feature state and expose read-only computed state to templates. Async operations should expose a request status so the UI can represent idle, loading, success, and failure states explicitly. Do not mutate signal contents in place; use `set` or `update`.

Use the shared request-status feature where an operation follows the same lifecycle as other application requests. Keep API errors normalized at the infrastructure boundary so pages do not need to know transport-specific error shapes.

## API and security boundaries

- Use the configured API client and existing interceptors for HTTP calls.
- Keep access tokens and session concerns inside auth/storage services.
- Enforce authorization at the route guard and server boundary; UI visibility is not authorization.
- Treat API responses as untrusted input and map them into typed domain models.
- Do not log credentials, tokens, or sensitive profile data.

## Styling architecture

Global styles are loaded through `src/styles.scss`. That file owns design tokens and imports the shared SCSS layers documented in `docs/DESIGN-SYSTEM.md`. Component styles should use those tokens and remain scoped to their component. Avoid adding global selectors in feature styles.

The current theme uses warm paper, ink, copper, and saffron to give the product a recognizable editorial identity. Keep the palette semantic so a future brand refresh changes tokens rather than requiring a repository-wide search and replace.

## Testing strategy

- Unit-test stores, mappers, validators, guards, interceptors, and services with deterministic inputs.
- Test shared components for their public inputs, outputs, accessibility attributes, and empty/loading/error states.
- Test route-level pages through their important user flows rather than asserting implementation details.
- Run the production build for every change that touches routing, global styles, SSR, or shared infrastructure.
- Add browser-level coverage for high-value authentication, payment, and destructive administration workflows when an e2e runner is introduced.

## Delivery checklist

1. Confirm the change belongs in `core`, `features`, `infrastructure`, `layout`, or `shared`.
2. Keep the public surface typed and narrow.
3. Cover loading, empty, error, disabled, and success states where relevant.
4. Follow the design-system token rules for all visual work.
5. Run `npm run build` and the relevant unit tests.
6. Update documentation when a boundary, reusable pattern, or operational command changes.
