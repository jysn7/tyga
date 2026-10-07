# Overlays and portals

Portals let overlay content render outside its trigger's DOM subtree while remaining part of the same React tree. TYGA's shared overlay primitives use the primitives provided by the UI library rather than hand-written `ReactDOM.createPortal` calls.

## Existing portal-backed primitives

- `components/ui/dialog.tsx` wraps the dialog portal, overlay and content.
- `components/ui/select.tsx` renders select content through the library's portal and positioning primitives.

Use these existing wrappers for dialogs and selects so focus behavior, keyboard interaction, accessibility and styling stay consistent.

## Guidance for new overlays

- Prefer a matching component from `components/ui/` before adding a new portal implementation.
- Keep overlay state with the component or page that owns the interaction.
- Ensure dialogs have accessible names and controls; preserve the library's focus management and dismissal behavior.
- Avoid unnecessary fixed positioning or custom stacking contexts; use the primitive's positioning behavior and existing class patterns.
- Consider clipping, scroll behavior and stacking when placing an overlay inside nested portal layouts.

If the project adds a new overlay primitive, follow the installed library's current API and add the wrapper to `components/ui/` only when it is intended for reuse.
