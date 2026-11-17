# Admin marketing site

The admin marketing area manages the content records used by TYGA's public-facing website. It is a content-management surface, separate from operational programme and event administration where noted below. The route at `/admin/marketing` links to five sections: Events, Programmes, Team, Gallery and Site Content.

## Admin capabilities

| Section | Route | Content managed |
|---|---|---|
| Events | `/admin/marketing/events` | Event name, type, venue, date/time, description, image, fee, capacity, display order and visibility. Events reference a venue and use the events admin RPCs. |
| Programmes | `/admin/marketing/programmes` | Public-facing programme cards: display title, eyebrow, summary, description, bullet points, image, call-to-action, optional price override, display order and visibility. A card may optionally link to an operational programme. |
| Team | `/admin/marketing/team` | Staff profiles with display name, role title, bio, portrait, optional coach link, display order and visibility. |
| Gallery | `/admin/marketing/gallery` | Categorised images with alt text, caption, display order and visibility. Categories are On Course, Coaching, Tournaments and Academy Life. |
| Site Content | `/admin/marketing/site-content` | Homepage hero copy and CTA, homepage introduction and statements, location, parent portal URL, social links and SEO title/description. |

The event, programme, team and gallery lists can be filtered by `all`, `draft`, `published` or `archived`. Their forms set visibility on create/edit. The events list also has a publish/unpublish action that changes between `published` and `draft`; use the form to select `archived`. Gallery uploads accept JPG, PNG, WebP and AVIF images up to 5 MiB. New uploads are created as drafts, and a non-empty alt text is required before an image can be published.

## Data access and mutations

All five feature hooks use the browser Supabase client and React Query. Read and write operations use the following RPCs; hook errors are thrown rather than converted into success-shaped results. Mutations invalidate the associated query key on success.

| Hook | Reads | Writes |
|---|---|---|
| `hooks/admin/marketing/use-marketing-events.ts` | `admin_get_events` | `admin_upsert_event`, `admin_delete_event` |
| `hooks/admin/marketing/use-marketing-programmes.ts` | `admin_get_marketing_programmes` | `admin_upsert_marketing_programme`, `admin_delete_marketing_programme` |
| `hooks/admin/marketing/use-team-members.ts` | `admin_get_team_members` | `admin_upsert_team_member`, `admin_delete_team_member` |
| `hooks/admin/marketing/use-gallery.ts` | `admin_get_gallery_images` | `admin_upsert_gallery_image`, `admin_delete_gallery_image` |
| `hooks/admin/marketing/use-site-content.ts` | `admin_get_site_content` | `admin_update_site_content` |

Gallery binaries are uploaded separately to the Supabase Storage bucket `gallery-images`; the hook then obtains a public URL, which is saved on the gallery record through `admin_upsert_gallery_image`. The gallery hook validates file type and size before upload. Team portraits can also be uploaded as JPEG, PNG or WebP files to the `gallery-images` bucket, and the resulting public URL is saved with the team profile. Other image fields accept URLs through their form validation.

The hooks validate form data with schemas in `lib/validations/marketing/` before calling the RPCs. Notable limits include up to six marketing statements, eight programme bullets, and a 160-character SEO description. See those schemas for the complete constraints; the database migrations and RPC definitions remain authoritative for server-side validation and authorization.

## Hook and route map

| Route | Page responsibility | Hook |
|---|---|---|
| `/admin/marketing` | Entry point linking to all five marketing sections | — |
| `/admin/marketing/events` | Event list, visibility filters, create/edit panel, delete confirmation and publish toggle | `useMarketingEvents`, `useDeleteMarketingEvent`, `useToggleEventPublished`; the panel uses `useUpsertMarketingEvent` |
| `/admin/marketing/programmes` | Programme-card list, visibility filters, create/edit panel and delete confirmation | `useMarketingProgrammes`, `useDeleteMarketingProgramme`; the panel uses `useUpsertMarketingProgramme` |
| `/admin/marketing/team` | Team list, visibility filters, create/edit panel and delete confirmation | `useTeamMembers`, `useDeleteTeamMember`; the panel uses `useUpsertTeamMember` |
| `/admin/marketing/gallery` | Image list, category filter, upload, edit and delete | `useGalleryImages`, `useUploadGalleryImage`, `useUpsertGalleryImage`, `useDeleteGalleryImage` |
| `/admin/marketing/site-content` | Edit and save homepage, contact, social and SEO fields | `useSiteContent`, `useUpdateSiteContent` |

## Boundaries

- This document describes the admin management UI and its hook-level backend calls. It does not assert how or when each record is rendered or cached by the public website.
- Marketing programme cards are distinct from operational programmes, with an optional `programme_id` link. Marketing events use venue references and event RPCs; do not assume they are separate from the operational event records.
- Visibility options in the forms do not, by themselves, establish a public preview or publication workflow beyond the status fields and the event list's explicit publish/unpublish action.
- The hooks are not an authorization boundary. Confirm admin access enforcement in the Supabase RPC definitions and policies.
