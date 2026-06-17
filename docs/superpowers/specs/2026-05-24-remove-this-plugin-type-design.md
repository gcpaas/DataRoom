# Remove THIS_PLUGIN_TYPE Build Replacement Design

## Context

The frontend currently uses `dataRoomFront/ReplaceThisPluginType.ts` as a custom Vite transform. During build, it replaces `DrConst.THIS_PLUGIN_TYPE` in component files with the containing component directory name.

This hides each component type behind a build-time transform. The new direction is to remove that custom plugin and write each component type directly as a string.

## Goals

- Remove the custom `ReplaceThisPluginType` Vite plugin.
- Replace every `DrConst.THIS_PLUGIN_TYPE` usage in component code with the concrete component directory name.
- Add a short comment at each directory-name string site explaining that the value must match the component directory name.
- Keep component registration behavior unchanged.
- Verify the migration with frontend type checking.

## Non-Goals

- Do not redesign the component auto-registration system.
- Do not change component directory names or public component type values.
- Do not refactor chart config structures beyond replacing the type placeholder.
- Do not change visual styles or Element Plus usage.

## Scope

The migration applies to frontend component files under:

- `dataRoomFront/src/dataRoom/components/**/install.ts`
- `dataRoomFront/src/dataRoom/components/**/plugin.ts`
- `dataRoomFront/src/dataRoom/components/**/index.vue`
- `dataRoomFront/src/dataRoom/components/**/panel/index.vue`

The migration also updates the Vite config and shared constant definition:

- `dataRoomFront/vite.config.ts`
- `dataRoomFront/src/dataRoom/constant/DrConst.ts`
- `dataRoomFront/ReplaceThisPluginType.ts`

## Design

Each component will use its actual directory name as the component type literal. For example, files under `components/DrBarChart/` will use `'DrBarChart'`.

Where the literal is used as the component type, the code will include a nearby comment such as:

```ts
// 组件类型需与当前组件目录名保持一致
```

Panel component names will be written directly as `<DirectoryName>ControlPanel`, for example `'DrBarChartControlPanel'`, with the same directory-name comment nearby.

The Vite config will no longer import or call `ReplaceThisPluginType()`. The `define.__THIS_PLUGIN_TYPE__` value will also be removed because no runtime or build-time code will depend on it.

`DrConst.THIS_PLUGIN_TYPE` will be removed from `DrConst.ts`. Existing constants unrelated to component type replacement, such as `CANVAS_INST` and `GLOBAL_VARIABLE`, will remain.

## Data Flow

The component type continues to flow through the existing component system:

1. `AutoInstall.ts` discovers component directories from `install.ts` files.
2. `getInstance()` returns a `ChartConfig` whose `type` is the hardcoded component directory name.
3. `ChartPlugin` instances expose the same hardcoded type.
4. Vue component names and control panel component names use the matching hardcoded names.

No runtime data shape changes are expected. Saved page configs that already store component types such as `DrBarChart` continue to match the same values.

## Error Handling

This migration does not add new runtime error handling. The main risk is a typo between a component directory name and the hardcoded string. The required comment documents the constraint at every string site, and verification will scan for remaining placeholders.

## Verification

After implementation:

- Search the frontend for `DrConst.THIS_PLUGIN_TYPE`, `ReplaceThisPluginType`, and `__THIS_PLUGIN_TYPE__`; all should be gone except historical git data.
- Run `npm run type-check` in `dataRoomFront`.
- If type checking cannot run because dependencies are missing or the environment blocks it, report that explicitly.

