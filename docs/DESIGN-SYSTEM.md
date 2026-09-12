# Summaries design system

This document is the visual contract for the Summaries frontend. It exists to keep new screens consistent with the product rather than allowing every feature to invent its own palette, spacing, and interaction states.

## Visual direction

Summaries uses an editorial reading-room aesthetic: warm paper surfaces, dark ink typography, copper actions, and a restrained saffron accent. The palette is deliberately distinct from the previous indigo/slate treatment while keeping enough contrast for daily operational use.

The theme supports both system preference and explicit selection. The default follows `prefers-color-scheme`; setting `data-theme="dark"` or `data-theme="light"` on the root `html` element overrides the system preference. A future theme switcher should persist that attribute rather than duplicate palette rules in components.

- **Ink** is used for primary text, header chrome, and high-emphasis controls.
- **Paper** is used for the application canvas and cards.
- **Copper** is the primary interactive color.
- **Saffron** is reserved for emphasis and reading-progress states.
- **Green, amber, and red** communicate success, attention, and destructive/error states only.

## Source of truth

The global entrypoint is `src/styles.scss`. It defines the CSS custom properties and loads the shared SCSS layers:

- `src/styles/base/_reset.scss`: box sizing, native element normalization, and image behavior.
- `src/styles/base/_typography.scss`: type families, hierarchy, links, and focus visibility.
- `src/styles/base/_global.scss`: document-level behavior and reduced-motion rules.
- `src/styles/components/_buttons.scss`: button dimensions, hover, active, disabled, and primary states.
- `src/styles/components/_forms.scss`: shared form control defaults.
- `src/styles/layout/_container.scss`: responsive content widths.
- `src/styles/themes/_default.scss`: reusable surface helpers.

Component SCSS should express layout and component-specific behavior. It should consume the global tokens instead of introducing new raw colors or competing radius and shadow values.

## Token usage

Use semantic aliases in feature code:

```scss
.book-card {
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-lg);
  background: var(--surface-card);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}
```

Use the raw scale only when defining or extending the theme itself. Prefer semantic aliases such as `--surface-page`, `--surface-card`, `--surface-hover`, `--text-primary`, and `--text-secondary` in components.

### Core tokens

| Role | Token |
| --- | --- |
| Page background | `--surface-page` |
| Card background | `--surface-card` |
| Border | `--surface-border` |
| Hover surface | `--surface-hover` |
| Primary text | `--text-primary` |
| Secondary text | `--text-secondary` |
| Primary action | `--color-primary-600` |
| Primary action hover | `--color-primary-700` |
| Focus ring | `--shadow-focus` |
| Small, medium, large radius | `--radius-sm`, `--radius-md`, `--radius-lg` |
| Small and medium elevation | `--shadow-sm`, `--shadow-md` |

## Layout rules

- Use `.page-container` or `.content-container` for page-level alignment.
- Keep content within `--content-max-width` (`1200px`, matching the books list page) unless a table or media surface genuinely needs more width.
- Routed page hosts are constrained to the same `--content-max-width`; page internals may use narrower layouts for focused tasks such as authentication.
- Use CSS Grid for repeated content such as book cards and Flexbox for action rows and toolbars.
- Keep touch targets at least `2.75rem` high for buttons and links that behave like controls.
- Let layouts collapse at content-driven breakpoints; do not rely on fixed desktop widths.
- Keep page sections unframed. Use cards for repeated items, dialogs, and focused tools only.

## Interaction states

Every interactive element must have a visible state for:

- default
- hover
- keyboard focus via `:focus-visible`
- active/pressed
- disabled
- loading, when the operation is asynchronous
- error or validation failure, when applicable

Do not remove the global focus ring. A component may change its color or offset, but it must preserve a visible WCAG AA-compliant indicator.

## Accessibility requirements

- Every meaningful image needs useful alternative text. Decorative images use an empty `alt`.
- Use native buttons and links for actions and navigation.
- Pair inputs with visible labels and connect validation messages with `aria-describedby` when needed.
- Never communicate status by color alone. Include text or an accessible name.
- Preserve heading order and landmark elements such as `header`, `main`, `nav`, and `footer`.
- Respect `prefers-reduced-motion`; the global stylesheet reduces transitions and animations automatically.
- Test keyboard navigation at every route and verify that focus remains visible against both paper and ink surfaces.

## Component guidance

Feature components own their layout. Shared components own reusable behavior and should expose simple, typed inputs and outputs. Prefer existing shared primitives before adding another variation of a button, card, form field, toast, or loading state.

When a new visual pattern is needed:

1. Check whether an existing token or shared component already expresses it.
2. Add a semantic token only if the role is used across multiple features.
3. Add the smallest component-level rule needed for layout.
4. Verify desktop, mobile, keyboard, disabled, loading, empty, and error states.
5. Update this document when the pattern becomes reusable.

## Review checklist

Before merging a visual change:

- `npm run build` succeeds.
- `npm test -- --watch=false` succeeds when the change affects behavior or shared components.
- No new raw hex colors appear in feature SCSS without a clear theme-level reason.
- The route remains usable at narrow and wide viewport sizes.
- Keyboard focus and validation states are visible.
- Loading, empty, error, and disabled states remain legible.
- The relevant component or architecture documentation is updated.
