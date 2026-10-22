export const TICKET_CATEGORIES = [
  { value: "payment", label: "Payments and invoices" },
  { value: "enrolment", label: "Enrolment and programmes" },
  { value: "schedule", label: "Schedule and sessions" },
  { value: "account", label: "My account" },
  { value: "technical", label: "Something isn't working" },
  { value: "safeguarding", label: "A safety or conduct concern" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Something else" },
] as const

export type TicketCategory = (typeof TICKET_CATEGORIES)[number]["value"]
export const categoryLabel = (v: string | null) =>
  TICKET_CATEGORIES.find((c) => c.value === v)?.label ?? v ?? "—"

export const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  open: { label: "Open", cls: "bg-yellow-light" },
  waiting: { label: "Waiting for you", cls: "bg-blue-light" },
  resolved: { label: "Resolved", cls: "bg-green-light" },
  closed: { label: "Closed", cls: "bg-muted" },
}

export const PRIORITY_STYLE: Record<string, { label: string; cls: string }> = {
  low: { label: "Low", cls: "bg-muted" },
  normal: { label: "Normal", cls: "bg-blue-light" },
  high: { label: "High", cls: "bg-orange-light" },
  urgent: { label: "Urgent", cls: "bg-red-light" },
}

// Edit these to match how TYGA actually speaks and what it actually does
export const CANNED_REPLIES = [
  {
    title: "Payment received",
    body: "Thank you, we can see your payment and your child's place is confirmed. You will find the invoice under Billing in your portal.",
  },
  {
    title: "Need more detail",
    body: "Thank you for getting in touch. Could you tell us which child and programme this is about, and what you were trying to do when it went wrong?",
  },
  {
    title: "Withdrawal and refunds",
    body: "We have withdrawn your child from the programme. Because the invoice was already paid, we will review whether a refund applies and come back to you within a few working days.",
  },
  {
    title: "Resolved",
    body: "We believe this is sorted now. Please reply if anything still looks wrong, otherwise we will close this request.",
  },
]

export const PRICE_UNIT_NOTE = "Prices are in rand (ZAR)."
