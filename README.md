# SummariesFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.1.

# Summaries Frontend

Summaries is a standalone Angular 21 application for browsing, managing, and reading book summaries. It uses lazy-loaded feature routes, signal-based state, typed API boundaries, and SSR-ready Angular application builders.

## Requirements

- Node.js compatible with Angular 21
- npm 11 or newer
- Access to the backend API configured through the environment files and `proxy.conf.json`

## Local development

Install dependencies and start the development server:

```bash
npm install
npm start
```

Open `http://localhost:4200/`. The Angular development server watches the workspace and rebuilds after source changes. API calls are routed through `proxy.conf.json` during local development.

## Commands

| Command | Purpose |
| --- | --- |
| `npm start` | Start the local Angular development server. |
| `npm run build` | Produce optimized browser and server bundles in `dist/`. |
| `npm test` | Run the unit test suite with Angular's configured test runner. |
| `npm run watch` | Build continuously using the development configuration. |
| `npm run serve:ssr:Summaries.Frontend` | Serve the most recent SSR build. |

## Project map

The application is organized by responsibility:

- `src/app/core`: cross-cutting capabilities such as auth, admin, payments, configuration, HTTP, and monitoring.
- `src/app/features`: product capabilities such as books, with pages, components, state, models, mappings, and data access.
- `src/app/infrastructure`: API, storage, telemetry, and logging adapters.
- `src/app/layout`: the shared application shell, header, navigation, sidebar, and footer.
- `src/app/shared`: reusable components, directives, pipes, table helpers, and validators.
- `src/styles.scss` and `src/styles/`: the global design system and SCSS layers.

Read [the architecture guide](docs/ARCHITECTURE.md) before adding a new feature or moving code between folders.

## Design system

The UI uses a warm editorial theme built from paper surfaces, ink typography, copper actions, and saffron accents. All reusable visual decisions are represented by CSS custom properties in `src/styles.scss` and consumed by component styles.

Read [the design-system guide](docs/DESIGN-SYSTEM.md) for token usage, responsive layout rules, accessibility requirements, interaction states, and the visual review checklist.

## Engineering conventions

New Angular code should use standalone components, OnPush change detection, signals, `input()`/`output()`, `inject()`, lazy routes, reactive forms, and built-in template control flow. Keep API mapping and error normalization out of page components, and do not use raw colors or one-off global styles in feature SCSS.

## Production verification

Before opening a pull request:

1. Run `npm run build`.
2. Run `npm test` for behavior or shared-component changes.
3. Exercise the changed route at mobile and desktop widths.
4. Check keyboard focus, validation, loading, empty, error, and disabled states.
5. Update the relevant documentation when a reusable pattern or project boundary changes.

## Angular resources

- [Angular CLI documentation](https://angular.dev/tools/cli)
- [Angular best practices](https://angular.dev/style-guide)
- [Angular accessibility guide](https://angular.dev/best-practices/a11y)

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
