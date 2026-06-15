# Klaro Fork Notes

Always prefix shell, build, and test commands with `rtk`.

## Package Manager

- Use `pnpm` for package management. Do not add `package-lock.json`.
- Prefer `rtk /usr/bin/env CI=true pnpm ...` for verification commands.
- Keep `pnpm-lock.yaml` and checked-in `dist/*` artifacts in sync after dependency or build changes.

## Source Style

- React/Preact UI code lives in `.tsx` function components.
- Keep `tsconfig.json` strict and run `pnpm run typecheck` after TypeScript or TSX changes.
- Avoid class-style React components and legacy `react-dom/render`; use the renderer adapter in `src/utils/render.js`.
- Preserve public UMD/browser entry points and bundle names in `dist`.

## Verification

Run the smallest relevant checks during development, and for broad changes run:

```bash
rtk /usr/bin/env CI=true pnpm run typecheck
rtk /usr/bin/env CI=true pnpm run lint
rtk /usr/bin/env CI=true pnpm run lint-scss
rtk /usr/bin/env CI=true pnpm test
rtk /usr/bin/env CI=true pnpm run make
rtk /usr/bin/env CI=true SEPARATE_CSS=1 pnpm run make
rtk /usr/bin/env CI=true SEPARATE_CSS=1 NO_MINIFY_CSS=1 pnpm run make
rtk npx --cache /private/tmp/klaro-npm-cache fallow dead-code --format json --quiet --explain
rtk npx --cache /private/tmp/klaro-npm-cache react-doctor . --json --no-score -y --blocking error
```

## Runtime Compatibility

- Keep script-tag users working through `klaro.show`, `klaro.setup`, `klaro.getManager`, and the existing `dist` bundle names.
- Treat `htmlTexts` / `dangerouslySetInnerHTML` as security-sensitive. Prefer sanitizer-aware or plain-text rendering when changing that path.
- Do not reintroduce string handler execution with `eval` or `new Function`; function handlers are the supported path.
