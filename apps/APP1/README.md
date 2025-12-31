# APP1

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Compile and Minify for Production

```sh
pnpm build
```

## Internationalization (i18n)

This application uses the shared `@trs/i18n` package for internationalization.

- **Locale Files**: Located in `packages/i18n/locales/`.
- **Usage**:
  - The application is wrapped with the i18n provider in `main.js`.
  - Use `useI18n` composable in components to access `t` function and `locale` property.
  - A demo of language switching is available in `App.vue`.
