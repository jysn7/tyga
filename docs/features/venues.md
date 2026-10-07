# Venues — README

Venue management with map-based address entry.

---

## Features

### Admin

- **Create, edit venues** — name, type (course, practice ground, driving range, school facility), address
- **Map-based address entry** — Google Places autocomplete as you type; drag the pin to fine-tune the exact location, with reverse geocoding keeping the address text in sync
- **Delete protection** — blocked while the venue is still referenced by any programme, session, appointment, booking, or event

---

## Data model

| Table | What it holds |
|---|---|
| `venues` | Name, address, type, latitude, longitude |

---

## RPCs

| Function | Summary |
|---|---|
| `admin_get_venues` | List/search venues, with programme count per venue |
| `admin_get_venue` | Single venue |
| `admin_create_venue` | Create, with address + lat/lng |
| `admin_update_venue` | Update |
| `admin_delete_venue` | Delete, blocked if referenced by programmes/sessions/appointments/bookings/events |
| `get_venues` | Plain venue list, any authenticated user (used for dropdowns) |

---

## Hooks

| File | Exports |
|---|---|
| `hooks/admin/venues/use-venues.ts` | `useVenues` (admin list, with counts) |
| `hooks/admin/venues/use-venue-mutations.ts` | Create, update and delete mutations |
| `hooks/admin/programmes/use-venues.ts` | Admin venue lookups used by programme forms |
| `hooks/lookups/use-lookups.ts` | Authenticated plain venue and level lookups for shared forms |

---

## Pages

| Route | Role | Purpose |
|---|---|---|
| `/admin/venues` | Admin | Table view — name, address, type, edit |
| (panel, not a route) | Admin | Create/edit venue side panel, with the map picker |

---

## Key behaviours

| Rule | Where enforced |
|---|---|
| A venue can't be deleted while referenced anywhere | `admin_delete_venue` — five explicit existence checks |
| Address autocomplete restricted to South Africa | `AddressMapPicker`, `componentRestrictions: { country: 'za' }` |
| Dragging the pin keeps the address text accurate | Reverse geocoding on `onDragEnd` |
| Venue edits reflect immediately in the list | Optimistic update in `useUpdateVenue`, rolled back on failure |

---

## Setup

Use the Supabase migration history for the current venue schema and admin RPC order, then reload PostgREST after function changes. The map picker requires Google Maps JavaScript API and Places API access and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

---

## Not implemented

- Venue photos/gallery
- Multi-venue programme support (a programme spanning more than one venue)
- Venue-level operating hours / blackout dates