// app/help/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ChevronDown,
  Users,
  UserCog,
  Shield,
  Mail,
} from "lucide-react"

type Role = "parent" | "coach" | "admin"

const ROLES: { key: Role; label: string; icon: typeof Users }[] = [
  { key: "parent", label: "For parents", icon: Users },
  { key: "coach", label: "For coaches", icon: UserCog },
  { key: "admin", label: "For admins", icon: Shield },
]

type FaqItem = { q: string; a: string }
type FaqSection = { heading: string; items: FaqItem[] }

const FAQS: Record<Role, FaqSection[]> = {
  parent: [
    {
      heading: "Account & access",
      items: [
        {
          q: "I forgot my password. How do I get back in?",
          a: "Go to the sign-in page and select 'Forgot password?' below the password field. Enter the email you signed up with and we'll send a reset link. The link is valid for a limited time — if it's expired, just request a new one.",
        },
        {
          q: "I never received my verification email.",
          a: "Check your spam/junk folder first — verification emails occasionally land there. If it's genuinely missing after a few minutes, return to the sign-up page and re-enter your email; this resends the verification link. If the problem continues, contact us using the details at the bottom of this page.",
        },
        {
          q: "Can I manage more than one child from a single account?",
          a: "Yes. Once signed in, add each child from the Members section. All of your children appear together, and you can switch between them or view combined information (like your total upcoming sessions) from your dashboard.",
        },
      ],
    },
    {
      heading: "Enrollment & scheduling",
      items: [
        {
          q: "How do I enroll my child in a programme?",
          a: "Browse available programmes from the Programmes section, open the one you're interested in, and select 'Enrol now'. If your child hasn't had a skills assessment yet, you'll be prompted to book one first — this confirms which level they should be placed at before joining a group.",
        },
        {
          q: "How do I book a skills assessment?",
          a: "From your child's profile, select 'Book an assessment'. Choose a venue and preferred date, and a coach will confirm the exact time once it's reviewed. Assessments are free and required before your child's first enrollment.",
        },
        {
          q: "Where do I see my child's upcoming sessions?",
          a: "Your dashboard shows the next few upcoming sessions at a glance. For the full calendar — including month, week, or list view — go to the Schedule section from the sidebar.",
        },
        {
          q: "Can I change my child's level manually?",
          a: "No — level placement and progression are always confirmed by a coach based on an assessment, never self-selected. If you believe your child is ready to move up, speak to their coach or request a re-assessment.",
        },
      ],
    },
    {
      heading: "Invoices & payments",
      items: [
        {
          q: "Where do I find my invoices?",
          a: "The Invoices section lists every invoice for your account, with its status (pending, paid, overdue). Select 'Pay now' on any outstanding invoice to complete payment.",
        },
        {
          q: "What happens if I miss a payment deadline?",
          a: "An overdue invoice remains visible in your account and can still be paid at any time. Extended non-payment may affect your child's enrollment status — if you're facing a payment difficulty, contact us before the due date so we can work out an arrangement.",
        },
        {
          q: "Do you offer payment plans?",
          a: "Monthly instalments are available for most programmes — request this before the term starts via the contact details below, since it needs to be set up ahead of the first invoice.",
        },
      ],
    },
    {
      heading: "Medical & safety information",
      items: [
        {
          q: "Who can see my child's medical notes?",
          a: "Only the coach(es) directly assigned to your child's sessions can view medical notes, emergency contact details, and medical aid information — never other parents, and never coaches unrelated to your child. Every time this information is viewed, it's logged for accountability.",
        },
        {
          q: "How do I update my child's emergency contact or medical information?",
          a: "Open your child's profile and select 'Edit'. Medical notes, medical aid details, and emergency contact information can all be updated at any time — please keep this current, especially before school holidays or camps.",
        },
      ],
    },
  ],
  coach: [
    {
      heading: "Sessions & attendance",
      items: [
        {
          q: "How do I mark attendance for a session?",
          a: "Open the session from your schedule and mark each enrolled student as present, absent, late, or excused. Attendance should be recorded during or immediately after the session while it's fresh.",
        },
        {
          q: "How do I log what was covered in a session?",
          a: "From the session detail view, add the curriculum modules covered and any coach notes. This feeds into each member's progress history, which parents and other coaches can see.",
        },
      ],
    },
    {
      heading: "Assessments & progression",
      items: [
        {
          q: "How do I complete a member's skills assessment?",
          a: "Pending assessments appear on your dashboard. Open one, evaluate the member against the relevant level's criteria, and record the outcome — either confirming their current level or recommending a level change.",
        },
        {
          q: "Can I move a member up a level myself?",
          a: "Level changes require head-coach sign-off. Record your assessment and recommendation; a head coach reviews and confirms the change.",
        },
      ],
    },
    {
      heading: "Access & privacy",
      items: [
        {
          q: "Why can't I see a student's medical information?",
          a: "Medical notes and emergency contacts are only visible to coaches directly assigned to that specific member's programme or sessions — this is enforced automatically, not a manual permission you can grant yourself. If you're newly assigned to a student and still can't see their details, contact an admin.",
        },
        {
          q: "Is my access to student data logged?",
          a: "Yes. Every time a coach views a student's medical notes or emergency contact information, that access is recorded for accountability, as required for handling sensitive information about minors.",
        },
      ],
    },
  ],
  admin: [
    {
      heading: "Accounts & roles",
      items: [
        {
          q: "How do I promote a parent account to coach?",
          a: "From the Accounts page, use the role dropdown next to the account to change it to 'Coach', or use 'Add coach' from the Coaches page to promote an existing account and set their coach type in one step.",
        },
        {
          q: "How do I invite someone who doesn't have an account yet?",
          a: "Use 'Invite coach' from the Coaches page and enter their email. They'll receive an email to set up their account, and will be automatically assigned the coach role (and any coach type/ratio you specified) once they accept.",
        },
        {
          q: "How do I deactivate an account without deleting it?",
          a: "Toggle the Active switch next to any account or coach. Deactivating preserves all historical data (enrollments, sessions, invoices) — accounts are never hard-deleted, since other records depend on them.",
        },
      ],
    },
    {
      heading: "Levels, curriculum & programmes",
      items: [
        {
          q: "How do I add a new skill level or curriculum module?",
          a: "From the Levels page, select 'New level' to define its name, age range, goal, and upgrade criteria. Curriculum modules are managed from the Curriculum page and are always attached to a specific level.",
        },
        {
          q: "Can I delete a level that's currently in use?",
          a: "No — a level can't be deleted while members are placed at it, or while programmes, curriculum modules, or progression history reference it. Archive it instead, which hides it from new placements without breaking existing records. The system will tell you exactly what's still referencing it if a delete is blocked.",
        },
      ],
    },
    {
      heading: "Auditing & oversight",
      items: [
        {
          q: "Where can I see a history of changes made across the platform?",
          a: "The Audit Log page records every create, update, and delete across key tables (accounts, members, coaches, programmes, enrollments, invoices, payments, level changes) — including who made the change and when.",
        },
        {
          q: "Can I see who viewed a specific member's medical information?",
          a: "Yes, this is tracked separately as a sensitive-data access log whenever a coach or admin views medical notes, medical aid details, or emergency contact information for a member.",
        },
      ],
    },
  ],
}

function AccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border/40 py-3 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-sm font-medium text-foreground">{item.q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={1.75}
        />
      </button>
      {open && (
        <p className="pt-2 text-sm leading-relaxed text-muted-foreground">
          {item.a}
        </p>
      )}
    </div>
  )
}

export default function HelpPage() {
  const [role, setRole] = useState<Role>("parent")

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16 sm:py-20">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/"
          className="flex w-fit items-center gap-1 text-xs text-information transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          TYGA Portal
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Help &amp; support
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Answers to common questions about using the TYGA portal. Looking for
            information about levels, programmes, or pricing instead? See{" "}
            <a
              href="https://www.tyga.co.za/how-it-works"
              className="font-medium text-information underline underline-offset-2"
            >
              how TYGA works
            </a>
            .
          </p>
        </div>
      </div>

      {/* Role switcher */}
      <div className="flex w-fit gap-1 rounded-full bg-muted/60 p-1 text-xs">
        {ROLES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRole(r.key)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors ${
              role === r.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <r.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            {r.label}
          </button>
        ))}
      </div>

      {/* FAQ sections */}
      <div className="flex flex-col gap-8">
        {FAQS[role].map((section) => (
          <div key={section.heading} className="flex flex-col gap-2">
            <h2 className="px-1 text-sm font-medium text-foreground">
              {section.heading}
            </h2>
            <div className="rounded-2xl bg-muted/40 px-5">
              {section.items.map((item) => (
                <AccordionItem key={item.q} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact fallback */}
      <div className="flex items-center gap-4 rounded-2xl bg-muted/40 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background">
          <Mail className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">
            Still need help?
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Email us at{" "}
            <a
              href="mailto:support@tyga.co.za"
              className="font-medium text-information underline underline-offset-2"
            >
              support@tyga.co.za
            </a>{" "}
            and we&apos;ll get back to you within one business day.
          </p>
        </div>
      </div>
    </div>
  )
}
