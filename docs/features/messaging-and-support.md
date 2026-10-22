# Messaging & Support

TYGA provides two distinct communication workflows: direct messages between
connected parents and coaches, and support tickets handled by academy staff.
Both are available to signed-in parents and coaches; administrators have a
separate shared inbox for tickets and direct-message oversight.

## Routes and access

| Surface | Route | Purpose |
|---|---|---|
| Parent messages | `/messages` | Direct conversations with programme-connected contacts |
| Coach messages | `/coach/messages` | Direct conversations with programme-connected contacts |
| Parent support | `/support` | Create and follow up on support tickets |
| Coach support | `/coach/support` | Create and follow up on support tickets |
| Admin support | `/admin/tickets` | Triage support tickets and review direct conversations |

The `Messages` and `Support` entries are separate in parent and coach navigation.
Direct conversations should not be treated as tickets: tickets have category,
status, priority, assignment and resolution workflows; direct messages are
participant-to-participant chats.

## Direct messages

The parent and coach inboxes show the other participant, latest message and
timestamp, with an unread indicator. Select a conversation to load its thread;
the inbox polls conversation lists and open threads periodically. A message can
be composed to contacts returned by `get_my_message_contacts`, which are limited
to people connected to the user's own or children's programmes. New messages
are sent with `start_direct_conversation`; replies use
`reply_to_conversation`.

Messages are limited to 2,000 characters in the compose dialog and in the
thread composer. A conversation can be opened from the inbox with the `id`
query parameter (for example, `/messages?id=123`). Administrators can read
direct conversations for safeguarding review and add private notes, but the
admin view does not allow staff to send participant-visible messages; only the
participants can reply.

## Support tickets

Parents and coaches can create a request from their Support page. The form
collects a category, subject, message and optional related child. Categories
are:

- Payments and invoices
- Enrolment and programmes
- Schedule and sessions
- My account
- Something isn't working
- A safety or conduct concern
- Feedback
- Something else

Subjects must contain at least three characters and messages at least five;
the subject limit is 150 characters and the initial message/reply limit is
4,000. The UI advises users not to include ID numbers or medical details and
states that staff aim to reply within one working day (emergencies should be
handled by phone).

The support list can be searched by subject or ticket number and filtered by
status or category. An unread marker indicates activity. From a ticket thread,
the requester can reply while replies are allowed, mark an active ticket
resolved, and rate the support experience. Ticket statuses are `open`,
`waiting`, `resolved` and `closed`; the UI labels `waiting` as “Waiting for
you”. Reply availability is supplied by the thread response and can be blocked
for a closed/resolved ticket.

The public contact form component also supports unauthenticated ticket
submission with name, email, optional phone, category, subject and message.
It displays a reference number and confirmation after successful submission.
The current Help page presents contact details and help content; the component
is not currently wired into a route in the app tree, so do not assume that the
public form is reachable from `/help`.

## Administrator ticket queue

The admin surface combines a support-ticket queue with a direct-message review
view. Summary indicators include tickets needing a reply, unassigned and
overdue (24+ hours), tickets resolved in the last seven days, average first
response time and average rating. The queue supports text search, status,
category, assignment (`me` or unassigned) and needs-reply filters, with
25-record pages and periodic refresh.

Opening a ticket shows requester contact details, linked member/programme,
message history, response/rating details, and controls for status, priority
(`low`, `normal`, `high`, `urgent`) and staff assignment. Staff can send a
reply, use a canned response, add an internal note, or resolve while replying.
Internal notes are distinguished from requester-visible messages. Direct
conversation review shows participants and context and allows private notes or
closing the conversation; the interface explicitly identifies this as a
safeguarding view.

## Data and implementation map

| Source | Responsibility |
|---|---|
| `hooks/shared/use-support.ts` | Parent/coach ticket and direct-message reads/mutations, admin list/detail/summary and cache invalidation |
| `lib/constants/support.ts` | Ticket categories, status/priority labels and canned replies |
| `lib/functions/support.ts` | Admin replies and public-form submission |
| `components/portals/shared/support/new-message-dialog.tsx` | New direct-message flow |
| `components/portals/shared/support/new-ticket-dialog.tsx` | New signed-in support-ticket flow |
| `components/portals/admin/support/admin-support-page.tsx` | Admin queue and ticket/conversation detail |
| `app/(client)/messages/page.tsx`, `app/coach/messages/page.tsx` | Parent and coach inbox/thread |
| `app/(client)/support/page.tsx`, `app/coach/support/page.tsx` | Parent and coach ticket lists/details |
| `app/admin/tickets/page.tsx` | Admin support route |

The hooks call Supabase RPCs including `get_my_tickets`,
`create_my_ticket`, `open_my_conversation`, `reply_to_conversation`,
`resolve_my_ticket`, `rate_my_ticket`, `get_my_direct_conversations`,
`get_my_message_contacts`, `start_direct_conversation`,
`admin_get_ticket_summary`, `admin_get_tickets`, `admin_get_conversation` and
`admin_update_ticket`. Admin replies and public form submission go through
functions in `lib/functions/support.ts`. The application repository's
migration list does not currently contain a support-specific migration; treat
the deployed database functions and policies as the authority for backend
constraints and access control.

## Boundaries

- The public ticket form exists as a component but has no current route usage
  in the app tree.
- Message/ticket notification delivery beyond the unread indicators is not
  described as a guaranteed email or push workflow here.
- Category, reply, assignment, rating and role-based access are backed by
  database functions; a client-side page or filter is not itself an
  authorization boundary.
