# HSK Mind Figma / Design Source

## Source-of-truth rules

- Figma is the Source of Truth for UX/UI: layout, visual language, interaction presentation, typography, colors, assets, and responsive behavior when a current design exists.
- Business Logic must follow `IMPLEMENTATION_PLAN.md` and the Product Specification in `HSK_Mind_Codex_Package/HSK_Mind_Codex_Spec.md`.
- If a design conflicts with a Business Rule, the Business Rule wins. The conflict must be reported and documented before changing behavior.
- Completed designs must not be redesigned without a documented technical reason.

## Current design status

- Figma link: https://www.figma.com/design/qcYVqNcTaan382LTzucKx0/%E0%B9%87%E0%B9%87HSK_Mind?node-id=2-2&t=35x4s2za4cTKFoIU-1
- `docs/design-reference/` is the single current source for exported design references.
- Exported references are organized by feature category: `auth/`, `main/`, `games/`, `learning/`, `account/`, and `ranking/`.
- Mascot, avatar, some character artwork, and production audio are not final.
- Replaceable placeholders and stable asset keys may be used until final assets arrive.
- Unfinished artwork must not block backend, database, authentication, or progression work.

## Asset and handoff notes

- Add the approved Figma URL here when it is available.
- Record the export name/version and the destination asset key when importing a design asset.
- Do not couple authentication or player progression to a specific image filename.

## Exported reference source

All current exported design references must be kept under `docs/design-reference/`. The legacy package-level design-reference directory has been retired; new exports must be placed in the relevant category directory above.

## Design Reference Priority

1. Figma `Hideframe Prototype`
   - Primary visual source of truth for UI implementation
   - Use for layout, spacing, typography, colors, component placement, and interaction presentation

2. `design system`
   - Use for shared colors, typography, spacing, reusable components, and component states

3. Exported screen references in `docs/design-reference/`
   - Use as supporting visual references when a frame in `Hideframe Prototype` is unclear, incomplete, or difficult to inspect

4. Figma `Wireframe`
   - Use only for user flow or structural reference when the flow is not clear from `Hideframe Prototype`

Do not use the full Figma canvas/board screenshot as a layout reference.

If `Hideframe Prototype` contains multiple similar frames or an unclear state, report the ambiguity and ask before choosing a layout or behavior yourself.
