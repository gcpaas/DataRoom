# DataRoom Front Source Directory Rename Design

## Goal

Rename the frontend source package directory from `dataRoomFront/src/dataroom-packages` to `dataRoomFront/src/dataRoom` and update all repository references to the new path.

## Scope

This change is a path migration only. It does not change frontend routes, component names, runtime behavior, backend code, or design system rules.

The migration covers the full repository:

- Move `dataRoomFront/src/dataroom-packages` to `dataRoomFront/src/dataRoom`.
- Replace current runtime/config textual `dataroom-packages` references with `dataRoom`, while preserving historical old-path wording in migration documentation where needed for accuracy.
- Update current frontend source imports, dynamic imports, SCSS `@use` paths, Vite config, TypeScript config, ESLint ignore config, `AGENTS.md`, and historical docs under `docs/`.

## Architecture

The existing `@` alias continues to point to `dataRoomFront/src`. Imports that currently use `@/dataroom-packages/...` will become `@/dataRoom/...`.

No additional compatibility alias will be introduced. After migration, `dataroom-packages` should not exist as a source directory or supported import prefix.

## Data Flow And Behavior

Runtime data flow remains unchanged:

1. Router entries still lazy-load the same page and designer components through the new import path.
2. Component auto-discovery still uses the same relative glob patterns from the moved directory.
3. Dataset, datasource, page, resource, designer, and component APIs keep the same exports and call sites.
4. Vite continues injecting the Element Plus SCSS entry globally, but from `@/dataRoom/assets/element.scss`.

## Error Handling

The likely failure modes are unresolved imports, stale config paths, or missed documentation references. The implementation should fail fast by checking for old path remnants and running frontend type checking.

## Testing

Run these checks after implementation:

```bash
rg "dataroom-packages"
cd dataRoomFront && npm run type-check
```

The old path should remain only in historical migration documentation. If type checking reports path-related errors, fix the stale runtime/config references and rerun the check.

## Out Of Scope

- Do not change route paths such as `/dataRoom/pageDesigner/:pageCode`.
- Do not rename business concepts, component names, or exported symbols.
- Do not alter visual styles or component behavior.
- Do not add a temporary compatibility layer for the old directory name.
