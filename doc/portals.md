# Portals

Portals enable overlay components to render outside the normal DOM hierarchy while preserving React context and event handling.

This project uses portal wrappers inside ShadCN-style primitives, not manual `ReactDOM.createPortal` calls.

## Current portal usage

### Dialogs

`components/ui/dialog.tsx` includes:

- `DialogPortal` — wraps `DialogPrimitive.Portal`
- `DialogOverlay` — backdrop overlay
- `DialogContent` — dialog content rendered inside the portal

The portal ensures the dialog renders into a top-level layer and does not get clipped by page layout styles.

### Select menus

`components/ui/select.tsx` includes:

- `SelectContent` — uses `SelectPrimitive.Portal`
- `SelectPrimitive.Positioner` and `SelectPrimitive.Popup` to position the content relative to the trigger

The select popup renders in a portal so it can appear above other elements and avoid overflow/stacking issues.

## Best practices for portal-based UI

- Keep the portal wrapper close to the component that owns the overlay.
- Use `fixed` or `absolute` positioning inside portal content to control the overlay position.
- Keep portal content self-contained and accessible.
- Prefer the existing primitive wrappers when creating new overlays to stay consistent.

## When to use portals

Use portals for UI elements that must appear above the page content and be visually independent of DOM nesting:

- dialogs / modal windows
- dropdown menus
- select option lists
- tooltip containers
- context menus

## How to add a new portal wrapper

Example pattern:

```tsx
function MyPopoverContent({ children, ...props }: PopoverPrimitive.Popup.Props) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Popup {...props}>{children}</PopoverPrimitive.Popup>
    </PopoverPrimitive.Portal>
  )
}
```

Use `data-slot` or class names to keep markup consistent with existing UI primitives.

## Notes

- Portal content is rendered at a different location in the DOM, but it still shares React state and context.
- Avoid storing layout-specific state only inside portal children if the parent cannot provide it.
- If a portal overlay needs to be closed from outside, lift the open/close state into the parent component.
