// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { formatDistanceToNow, parseISO } from "date-fns"
// import {
//   ArrowLeft,
//   MessageCircle,
//   Plus,
//   Star,
//   CircleDot,
//   CheckCircle2,
//   Clock,
//   XCircle,
//   Send,
// } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Loader } from "@/components/portals/shared/loader"
// import { EmptyState } from "@/components/portals/shared/empty-state"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import {
//   useCreateTicket,
//   useMessageContacts,
//   useMyDirectConversations,
//   useMyTickets,
//   useOpenConversation,
//   useRateTicket,
//   useReplyToConversation,
//   useResolveMyTicket,
//   useStartDirect,
// } from "@/hooks/shared/use-support"
// import {
//   STATUS_STYLE,
//   TICKET_CATEGORIES,
//   categoryLabel,
// } from "@/lib/constants/support"
// import { useMembers } from "@/hooks/use-members"

// /* ── helpers ─────────────────────────────────────────────────── */

// const ago = (iso: string) =>
//   formatDistanceToNow(parseISO(iso), { addSuffix: true })

// const stamp = (iso: string) =>
//   new Intl.DateTimeFormat("en-ZA", {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(parseISO(iso))

// const shortDate = (iso: string) =>
//   new Intl.DateTimeFormat("en-ZA", {
//     day: "numeric",
//     month: "short",
//   }).format(parseISO(iso))

// const initials = (name: string) =>
//   name
//     .split(" ")
//     .map((n) => n[0])
//     .slice(0, 2)
//     .join("")
//     .toUpperCase() || "?"

// const statusIcon = (status: string) => {
//   if (status === "open") return CircleDot
//   if (status === "waiting") return Clock
//   if (status === "resolved") return CheckCircle2
//   if (status === "closed") return XCircle
//   return CircleDot
// }

// function StatusBadge({ status }: { status: string }) {
//   const style = STATUS_STYLE[status] ?? { label: status, cls: "bg-muted" }
//   const Icon = statusIcon(status)
//   return (
//     <span
//       className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${style.cls}`}
//     >
//       <Icon className="h-2.5 w-2.5" strokeWidth={2.5} />
//       {style.label}
//     </span>
//   )
// }

// function Dot() {
//   return (
//     <span
//       aria-label="Unread"
//       className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
//     />
//   )
// }

// /* ── Activity entry ──────────────────────────────────────────── */

// type Message = {
//   id: number
//   kind: string
//   body: string
//   createdAt: string
//   senderName?: string | null
//   isMine: boolean
// }

// function ActivityEntry({ m }: { m: Message }) {
//   if (m.kind === "system") {
//     return (
//       <li className="flex items-start gap-2.5 py-2 text-xs text-muted-foreground">
//         <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
//         <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
//           <span>{m.body}</span>
//           <span className="tabular-nums">{stamp(m.createdAt)}</span>
//         </div>
//       </li>
//     )
//   }

//   const isInternal = m.kind === "internal"
//   const name = m.isMine ? "You" : (m.senderName ?? "Someone")

//   return (
//     <li
//       className={`flex gap-3 border-b border-border/40 py-3 last:border-b-0 ${
//         isInternal ? "-mx-4 bg-muted/40 px-4 sm:-mx-6 sm:px-6" : ""
//       }`}
//     >
//       <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground">
//         {initials(name)}
//       </div>
//       <div className="flex min-w-0 flex-1 flex-col gap-1">
//         <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
//           <span className="text-sm font-medium text-foreground">{name}</span>
//           <span className="text-[11px] tabular-nums text-muted-foreground">
//             {stamp(m.createdAt)}
//           </span>
//           {isInternal && (
//             <span className="inline-flex items-center gap-1 rounded bg-background px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
//               Internal
//             </span>
//           )}
//         </div>
//         <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
//           {m.body}
//         </p>
//       </div>
//     </li>
//   )
// }

// /* ── Conversation pane ───────────────────────────────────────── */

// function Pane({ id, onBack }: { id: number; onBack: () => void }) {
//   const { data, isLoading, error } = useOpenConversation(id)
//   const reply = useReplyToConversation()
//   const resolve = useResolveMyTicket()
//   const rate = useRateTicket()
//   const [body, setBody] = useState("")
//   const [stars, setStars] = useState(0)

//   if (isLoading) {
//     return (
//       <div className="flex h-full w-full items-center justify-center">
//         <Loader />
//       </div>
//     )
//   }
//   if (error || !data) {
//     return (
//       <div className="m-3 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
//         {error?.message ?? "Could not load this conversation"}
//       </div>
//     )
//   }

//   const isTicket = data.kind === "ticket"
//   const finished = data.status === "resolved" || data.status === "closed"

//   const firstReplyIndex = data.messages.findIndex(
//     (m) => m.kind !== "system" && !m.isMine
//   )
//   const original =
//     firstReplyIndex >= 0 ? data.messages[firstReplyIndex] : undefined
//   const afterOriginal =
//     firstReplyIndex >= 0 ? data.messages.slice(firstReplyIndex + 1) : []

//   async function send() {
//     const text = body.trim()
//     if (!text || reply.isPending) return
//     try {
//       await reply.mutateAsync({ id, body: text })
//       setBody("")
//     } catch {
//       /* caller keeps the text */
//     }
//   }

//   return (
//     <div className="flex h-full w-full min-h-0 flex-col">
//       {/* Header (fixed) */}
//       <div className="shrink-0 border-b border-border/60 px-3 py-3 sm:px-5">
//         <div className="flex items-start gap-2">
//           <Button
//             variant="ghost"
//             size="sm"
//             className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-foreground md:hidden"
//             aria-label="Back"
//             onClick={onBack}
//           >
//             <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
//           </Button>

//           <div className="min-w-0 flex-1">
//             <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
//               {isTicket && (
//                 <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
//                   Ticket #{data.id}
//                 </span>
//               )}
//               {isTicket && <StatusBadge status={data.status} />}
//             </div>
//             <h2 className="mt-0.5 truncate text-base font-semibold tracking-tight text-foreground">
//               {isTicket ? data.subject : (data.other?.name ?? "Message")}
//             </h2>
//             <p className="mt-0.5 text-xs text-muted-foreground">
//               {isTicket
//                 ? categoryLabel(data.category)
//                 : data.other?.role === "coach"
//                   ? "Coach"
//                   : "Parent"}
//             </p>
//           </div>

//           {isTicket && !finished && (
//             <Button
//               size="sm"
//               variant="outline"
//               className="h-8 shrink-0 gap-1.5 text-xs"
//               disabled={resolve.isPending}
//               onClick={() => resolve.mutate(id)}
//             >
//               <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
//               <span className="hidden sm:inline">Mark resolved</span>
//               <span className="sm:hidden">Resolve</span>
//             </Button>
//           )}
//         </div>

//         {!isTicket && (
//           <p className="mt-3 rounded-md bg-muted/60 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
//             Messages are text only and cannot be deleted. Academy administrators
//             can read them to keep children safe. Please do not share medical or
//             ID details here.
//           </p>
//         )}
//       </div>

//       {/* Scrollable body */}
//       <div className="min-h-0 flex-1 overflow-y-auto">
//         {original && (
//           <div className="border-b border-border/60 bg-muted/20 px-3 py-3 sm:px-5 sm:py-4">
//             <div className="flex items-start gap-3">
//               <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-[10px] font-semibold text-foreground">
//                 {initials(original.senderName ?? "?")}
//               </div>
//               <div className="min-w-0 flex-1">
//                 <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
//                   <span className="text-sm font-semibold text-foreground">
//                     {original.senderName ?? "Requester"}
//                   </span>
//                   <span className="text-xs tabular-nums text-muted-foreground">
//                     {stamp(original.createdAt)}
//                   </span>
//                 </div>
//                 <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
//                   {original.body}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="px-3 py-3 sm:px-5 sm:py-4">
//           <div className="mb-2 flex items-center gap-2">
//             <h3 className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
//               Activity
//             </h3>
//             <span className="text-[11px] tabular-nums text-muted-foreground">
//               {afterOriginal.filter((m) => m.kind !== "system").length} replies
//             </span>
//           </div>

//           {afterOriginal.length === 0 ? (
//             <p className="text-sm text-muted-foreground">No replies yet.</p>
//           ) : (
//             <ol className="flex flex-col">
//               {afterOriginal.map((m) => (
//                 <ActivityEntry key={m.id} m={m as Message} />
//               ))}
//             </ol>
//           )}
//         </div>
//       </div>

//       {/* Composer (fixed at bottom) */}
//       {data.canReply ? (
//         <div className="shrink-0 border-t border-border/60 bg-card px-3 py-3 sm:px-5">
//           <div className="flex flex-col gap-2">
//             <Textarea
//               value={body}
//               onChange={(e) => setBody(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
//                   e.preventDefault()
//                   send()
//                 }
//               }}
//               rows={2}
//               maxLength={isTicket ? 4000 : 2000}
//               placeholder={
//                 isTicket ? "Write a reply…" : "Write a message…"
//               }
//               aria-label="Reply"
//               className="resize-none"
//             />
//             {reply.error && (
//               <p className="text-xs text-destructive">{reply.error.message}</p>
//             )}
//             <div className="flex items-center justify-between gap-3">
//               <span className="text-xs tabular-nums text-muted-foreground">
//                 {body.length}/{isTicket ? 4000 : 2000}
//               </span>
//               <Button
//                 size="sm"
//                 className="h-8 gap-1.5 text-xs"
//                 disabled={!body.trim() || reply.isPending}
//                 onClick={send}
//               >
//                 <Send className="h-3 w-3" strokeWidth={2} />
//                 {reply.isPending
//                   ? "Sending…"
//                   : isTicket
//                     ? "Send reply"
//                     : "Send"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="shrink-0 border-t border-border/60 bg-card px-3 py-3 sm:px-5">
//           <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
//             {data.replyBlockedReason ??
//               "This conversation is no longer accepting replies."}
//           </p>
//         </div>
//       )}

//       {/* Rating (ticket-only) */}
//       {isTicket && finished && data.rating === null && (
//         <div className="shrink-0 border-t border-border/60 bg-card px-3 py-3 sm:px-5">
//           <div className="flex flex-wrap items-center justify-between gap-3">
//             <div className="flex flex-col gap-0.5">
//               <p className="text-sm font-medium text-foreground">
//                 How did we do?
//               </p>
//               <p className="text-xs text-muted-foreground">
//                 Rate the resolution of this ticket.
//               </p>
//             </div>
//             <div className="flex items-center gap-3">
//               <div
//                 className="flex gap-1"
//                 role="radiogroup"
//                 aria-label="Rating"
//               >
//                 {[1, 2, 3, 4, 5].map((n) => (
//                   <button
//                     key={n}
//                     type="button"
//                     role="radio"
//                     aria-checked={stars === n}
//                     aria-label={`${n} star${n > 1 ? "s" : ""}`}
//                     onClick={() => setStars(n)}
//                     className="rounded p-0.5 transition-colors hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none"
//                   >
//                     <Star
//                       className={`h-4 w-4 ${
//                         n <= stars
//                           ? "fill-foreground text-foreground"
//                           : "text-muted-foreground"
//                       }`}
//                       strokeWidth={1.5}
//                     />
//                   </button>
//                 ))}
//               </div>
//               <Button
//                 size="sm"
//                 className="h-8 text-xs"
//                 disabled={!stars || rate.isPending}
//                 onClick={() => rate.mutate({ id, rating: stars })}
//               >
//                 {rate.isPending ? "Sending…" : "Submit"}
//               </Button>
//             </div>
//           </div>
//           {rate.error && (
//             <p className="mt-2 text-xs text-destructive">
//               {rate.error.message}
//             </p>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

// /* ── New ticket dialog ───────────────────────────────────────── */

// export function NewTicketDialog({
//   open,
//   onClose,
//   onCreated,
// }: {
//   open: boolean
//   onClose: () => void
//   onCreated: (id: number) => void
// }) {
//   const create = useCreateTicket()
//   const { data: members } = useMembers()
//   const [category, setCategory] = useState("other")
//   const [subject, setSubject] = useState("")
//   const [body, setBody] = useState("")
//   const [memberId, setMemberId] = useState("none")

//   function submit() {
//     create.mutate(
//       {
//         subject,
//         category,
//         body,
//         memberId: memberId === "none" ? null : Number(memberId),
//       },
//       {
//         onSuccess: (id) => {
//           setSubject("")
//           setBody("")
//           setMemberId("none")
//           onCreated(id)
//           onClose()
//         },
//       }
//     )
//   }

//   const canSubmit =
//     !create.isPending && subject.trim().length >= 3 && body.trim().length >= 5

//   return (
//     <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>New support request</DialogTitle>
//           <DialogDescription>
//             We reply within one working day. For emergencies, please phone us.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="flex flex-col gap-3">
//           <div className="flex flex-col gap-1.5">
//             <label
//               htmlFor="ticket-category"
//               className="text-xs font-medium text-foreground"
//             >
//               What is it about?
//             </label>
//             <Select
//               value={category}
//               onValueChange={(v) => setCategory(v ?? "other")}
//             >
//               <SelectTrigger id="ticket-category" className="h-9 w-full text-sm">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 {TICKET_CATEGORIES.map((c) => (
//                   <SelectItem key={c.value} value={c.value}>
//                     {c.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {members && members.length > 0 && (
//             <div className="flex flex-col gap-1.5">
//               <label
//                 htmlFor="ticket-member"
//                 className="text-xs font-medium text-foreground"
//               >
//                 Which child? (optional)
//               </label>
//               <Select
//                 value={memberId}
//                 onValueChange={(v) => setMemberId(v ?? "none")}
//               >
//                 <SelectTrigger id="ticket-member" className="h-9 w-full text-sm">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="none">
//                     Not about a specific child
//                   </SelectItem>
//                   {members.map((m) => (
//                     <SelectItem key={m.id} value={String(m.id)}>
//                       {m.fullName}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           )}

//           <div className="flex flex-col gap-1.5">
//             <label
//               htmlFor="ticket-subject"
//               className="text-xs font-medium text-foreground"
//             >
//               Subject
//             </label>
//             <Input
//               id="ticket-subject"
//               value={subject}
//               onChange={(e) => setSubject(e.target.value)}
//               maxLength={150}
//             />
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label
//               htmlFor="ticket-body"
//               className="text-xs font-medium text-foreground"
//             >
//               Message
//             </label>
//             <Textarea
//               id="ticket-body"
//               value={body}
//               onChange={(e) => setBody(e.target.value)}
//               rows={5}
//               maxLength={4000}
//               className="resize-none"
//             />
//           </div>

//           <p className="text-xs text-muted-foreground">
//             Please do not include ID numbers or medical details.
//           </p>
//         </div>

//         {create.error && (
//           <p role="alert" className="text-xs text-destructive">
//             {create.error.message}
//           </p>
//         )}

//         <DialogFooter>
//           <Button variant="outline" size="sm" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button size="sm" disabled={!canSubmit} onClick={submit}>
//             {create.isPending ? "Sending…" : "Send request"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }

// /* ── New message dialog ──────────────────────────────────────── */

// export function NewMessageDialog({
//   open,
//   onClose,
//   onCreated,
// }: {
//   open: boolean
//   onClose: () => void
//   onCreated: (id: number) => void
// }) {
//   const { data: contacts, isLoading } = useMessageContacts()
//   const start = useStartDirect()
//   const [to, setTo] = useState("")
//   const [body, setBody] = useState("")

//   return (
//     <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>New message</DialogTitle>
//           <DialogDescription>
//             You can message people connected to your children&apos;s or your
//             own programmes.
//           </DialogDescription>
//         </DialogHeader>

//         {isLoading ? (
//           <Loader />
//         ) : !contacts?.length ? (
//           <p className="text-sm text-muted-foreground">
//             There is nobody to message yet. This opens once a child is enrolled
//             in a programme.
//           </p>
//         ) : (
//           <div className="flex flex-col gap-3">
//             <div
//               className="flex max-h-48 flex-col gap-1.5 overflow-y-auto"
//               role="radiogroup"
//               aria-label="Who to message"
//             >
//               {contacts.map((c) => (
//                 <button
//                   key={c.accountId}
//                   type="button"
//                   role="radio"
//                   aria-checked={to === c.accountId}
//                   onClick={() => setTo(c.accountId)}
//                   className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
//                     to === c.accountId
//                       ? "border-primary bg-primary/5"
//                       : "border-border hover:bg-accent/40"
//                   }`}
//                 >
//                   <span className="block text-foreground">{c.fullName}</span>
//                   <span className="block text-xs text-muted-foreground">
//                     {[c.programmes, c.children].filter(Boolean).join(" · ")}
//                   </span>
//                 </button>
//               ))}
//             </div>
//             <Textarea
//               value={body}
//               onChange={(e) => setBody(e.target.value)}
//               rows={4}
//               maxLength={2000}
//               placeholder="Write a message…"
//               aria-label="Message"
//               className="resize-none"
//             />
//             <p className="text-xs text-muted-foreground">
//               Messages can be read by academy administrators.
//             </p>
//           </div>
//         )}

//         {start.error && (
//           <p role="alert" className="text-xs text-destructive">
//             {start.error.message}
//           </p>
//         )}

//         <DialogFooter>
//           <Button variant="outline" size="sm" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button
//             size="sm"
//             disabled={start.isPending || !to || !body.trim()}
//             onClick={() =>
//               start.mutate(
//                 { otherAccountId: to, body },
//                 {
//                   onSuccess: (id) => {
//                     setBody("")
//                     setTo("")
//                     onCreated(id)
//                     onClose()
//                   },
//                 }
//               )
//             }
//           >
//             {start.isPending ? "Sending…" : "Send"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }

// /* ── Help center ─────────────────────────────────────────────── */

// export function HelpCenter() {
//   const tickets = useMyTickets()
//   const directs = useMyDirectConversations()
//   const [selected, setSelected] = useState<number | null>(null)
//   const [tab, setTab] = useState<"tickets" | "messages">("tickets")
//   const [newTicket, setNewTicket] = useState(false)
//   const [newMessage, setNewMessage] = useState(false)

//   return (
//     <div className="flex h-full w-full min-h-0 flex-col gap-4">
//       <Tabs
//         value={tab}
//         onValueChange={(v) => {
//           setTab(v as "tickets" | "messages")
//           setSelected(null)
//         }}
//         className="flex h-full min-h-0 flex-col gap-3"
//       >
//         <TabsList className="w-fit shrink-0">
//           <TabsTrigger value="tickets">Support requests</TabsTrigger>
//           <TabsTrigger value="messages">Messages</TabsTrigger>
//         </TabsList>

//         <TabsContent
//           value="tickets"
//           className="mt-0 flex min-h-0 flex-1 flex-col gap-3"
//         >
//           <Button
//             size="sm"
//             variant="secondary"
//             className="h-9 w-fit shrink-0 gap-1.5 text-xs"
//             onClick={() => setNewTicket(true)}
//           >
//             <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
//             New request
//           </Button>

//           <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[20rem_1fr]">
//             <div className="min-h-0 w-full overflow-y-auto border-border/60 md:border-r">
//               {tickets.isLoading ? (
//                 <div className="flex h-48 items-center justify-center">
//                   <Loader />
//                 </div>
//               ) : !tickets.data?.length ? (
//                 <div className="p-3">
//                   <EmptyState
//                     icon={MessageCircle}
//                     title="No requests yet"
//                     description="Ask us anything. We reply within one working day."
//                   />
//                 </div>
//               ) : (
//                 <div className="flex flex-col">
//                   {tickets.data.map((t) => {
//                     const isActive = selected === t.id
//                     return (
//                       <button
//                         key={t.id}
//                         type="button"
//                         onClick={() => setSelected(t.id)}
//                         aria-current={isActive ? "true" : undefined}
//                         className={`flex w-full flex-col gap-1.5 border-b border-border/40 px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-accent/40 ${
//                           isActive ? "bg-accent/40" : ""
//                         }`}
//                       >
//                         <div className="flex items-start justify-between gap-2">
//                           <div className="flex min-w-0 items-center gap-1.5">
//                             {t.unread && <Dot />}
//                             <span className="truncate text-sm font-medium text-foreground">
//                               {t.subject}
//                             </span>
//                           </div>
//                           <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
//                             #{t.id}
//                           </span>
//                         </div>
//                         <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
//                           <StatusBadge status={t.status} />
//                           <span className="text-[11px] text-muted-foreground">
//                             {categoryLabel(t.category)}
//                           </span>
//                           <span className="ml-auto text-[11px] tabular-nums text-muted-foreground">
//                             {shortDate(t.lastMessageAt)}
//                           </span>
//                         </div>
//                       </button>
//                     )
//                   })}
//                 </div>
//               )}
//             </div>

//             <div
//               className={`flex min-h-0 w-full ${
//                 selected === null ? "hidden md:flex" : "flex"
//               }`}
//             >
//               {selected !== null ? (
//                 <div className="flex h-full w-full min-h-0 flex-col">
//                   <Pane id={selected} onBack={() => setSelected(null)} />
//                 </div>
//               ) : (
//                 <div className="flex h-full w-full items-center justify-center">
//                   <EmptyState
//                     icon={MessageCircle}
//                     title="Select a request"
//                     description="Choose a request on the left, or open a new one."
//                   />
//                 </div>
//               )}
//             </div>
//           </div>
//         </TabsContent>

//         <TabsContent
//           value="messages"
//           className="mt-0 flex min-h-0 flex-1 flex-col gap-3"
//         >
//           <Button
//             size="sm"
//             variant="secondary"
//             className="h-9 w-fit shrink-0 gap-1.5 text-xs"
//             onClick={() => setNewMessage(true)}
//           >
//             <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
//             New message
//           </Button>

//           <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[20rem_1fr]">
//             <div className="min-h-0 w-full overflow-y-auto border-border/60 md:border-r">
//               {directs.isLoading ? (
//                 <div className="flex h-48 items-center justify-center">
//                   <Loader />
//                 </div>
//               ) : !directs.data?.length ? (
//                 <div className="p-3">
//                   <EmptyState
//                     icon={MessageCircle}
//                     title="No messages yet"
//                     description="Message your child's coach about sessions and progress."
//                   />
//                 </div>
//               ) : (
//                 <div className="flex flex-col">
//                   {directs.data.map((c) => {
//                     const isActive = selected === c.id
//                     return (
//                       <button
//                         key={c.id}
//                         type="button"
//                         onClick={() => setSelected(c.id)}
//                         aria-current={isActive ? "true" : undefined}
//                         className={`flex w-full items-start gap-2.5 border-b border-border/40 px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-accent/40 ${
//                           isActive ? "bg-accent/40" : ""
//                         }`}
//                       >
//                         <Avatar className="h-7 w-7 shrink-0 rounded-full">
//                           <AvatarFallback className="text-[10px] font-semibold">
//                             {initials(c.otherName)}
//                           </AvatarFallback>
//                         </Avatar>
//                         <div className="min-w-0 flex-1">
//                           <div className="flex items-baseline justify-between gap-2">
//                             <span className="truncate text-sm font-medium text-foreground">
//                               {c.otherName}
//                             </span>
//                             <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
//                               {ago(c.lastMessageAt)}
//                             </span>
//                           </div>
//                           <p className="mt-0.5 truncate text-xs text-muted-foreground">
//                             {c.lastMessage ?? "No messages yet"}
//                           </p>
//                         </div>
//                         {c.unread && <Dot />}
//                       </button>
//                     )
//                   })}
//                 </div>
//               )}
//             </div>

//             <div
//               className={`flex min-h-0 w-full ${
//                 selected === null ? "hidden md:flex" : "flex"
//               }`}
//             >
//               {selected !== null ? (
//                 <div className="flex h-full w-full min-h-0 flex-col">
//                   <Pane id={selected} onBack={() => setSelected(null)} />
//                 </div>
//               ) : (
//                 <div className="flex h-full w-full items-center justify-center">
//                   <EmptyState
//                     icon={MessageCircle}
//                     title="Select a conversation"
//                     description="Choose one on the left, or start a new one."
//                   />
//                 </div>
//               )}
//             </div>
//           </div>
//         </TabsContent>
//       </Tabs>

//       <NewTicketDialog
//         open={newTicket}
//         onClose={() => setNewTicket(false)}
//         onCreated={(id) => {
//           setTab("tickets")
//           setSelected(id)
//         }}
//       />
//       <NewMessageDialog
//         open={newMessage}
//         onClose={() => setNewMessage(false)}
//         onCreated={(id) => {
//           setTab("messages")
//           setSelected(id)
//         }}
//       />
//     </div>
//   )
// }
