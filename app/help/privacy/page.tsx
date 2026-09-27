// app/privacy/page.tsx
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const LAST_UPDATED = "27 September 2026"

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        {children}
      </div>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-16 sm:py-20">
      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          TYGA Portal
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Privacy Policy
        </h1>
        <p className="text-xs text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <Section title="1. Information we collect">
          <p>We collect the following categories of information:</p>
          <ul className="flex flex-col gap-1 pl-4">
            <li>
              · Account details: name, email address, phone number, address
            </li>
            <li>
              · Member (child) details: full name, date of birth, gender, school
              information, and skill/level history
            </li>
            <li>
              · Medical and safety information: medical notes, medical aid
              details, doctor contact, and emergency contact information
            </li>
            <li>· Attendance, session, and coaching progress records</li>
            <li>
              · Payment and invoice records (processed via our payment provider
              — TYGA does not store full card numbers)
            </li>
          </ul>
        </Section>

        <Section title="2. Why we collect it">
          <p>
            We use this information to operate the Portal: managing enrollments
            and scheduling, enabling coaches to teach and assess students
            safely, processing payments, and responding appropriately to medical
            or safety incidents during sessions.
          </p>
        </Section>

        <Section title="3. Children's information">
          <p>
            Where a member is a minor, their information is provided and managed
            by their parent or legal guardian&apos;s account. We collect only
            what is necessary to safely deliver golf coaching programmes, and
            this data is not used for any purpose beyond that — including no
            marketing directed at minors.
          </p>
        </Section>

        <Section title="4. Who can see your information">
          <p>
            Access to sensitive information is restricted by role and, for
            medical/emergency-contact data, by direct coaching assignment:
          </p>
          <ul className="flex flex-col gap-1 pl-4">
            <li>
              · A member&apos;s medical notes, medical aid details, and
              emergency contact are visible only to the coach(es) actively
              assigned to that member, and to platform administrators
            </li>
            <li>
              · Every access to this sensitive information is logged, recording
              who viewed it and when
            </li>
            <li>
              · Parents can view and update their own children&apos;s
              information at any time
            </li>
            <li>· We do not sell personal information to third parties</li>
          </ul>
        </Section>

        <Section title="5. How we protect your information">
          <p>
            Data is stored with role-based access controls enforced at the
            database level, not just in the application interface — meaning
            access restrictions apply even to direct data queries, not only
            what&apos;s shown on screen. Sensitive-data access is independently
            logged for accountability. All account access requires
            authentication, and passwords are never stored in plain text.
          </p>
        </Section>

        <Section title="6. Data retention">
          <p>
            Member records are retained even after a programme ends or an
            account is deactivated, since attendance history, medical history,
            and audit logs may need to remain available for safety, legal, or
            record-keeping reasons. Accounts and members are never permanently
            deleted through normal deactivation — contact us directly if you
            wish to request deletion of your data, and we will advise what can
            be removed consistent with our legal obligations.
          </p>
        </Section>

        <Section title="7. Your rights">
          <p>
            Under South Africa&apos;s Protection of Personal Information Act
            (POPIA), you have the right to access, correct, or request deletion
            of your personal information, and to object to certain uses of it.
            To exercise these rights, contact us using the details below.
          </p>
        </Section>

        <Section title="8. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. Material
            changes — particularly any affecting how medical or children&apos;s
            information is handled — will be communicated via email or an in-app
            notice before they take effect.
          </p>
        </Section>

        <Section title="9. Contact & Information Officer">
          <p>
            For privacy questions, access requests, or complaints, contact our
            Information Officer at{" "}
            <a
              href="mailto:privacy@tyga.co.za"
              className="font-medium text-foreground underline"
            >
              privacy@tyga.co.za
            </a>
            . If you&apos;re unsatisfied with our response, you may lodge a
            complaint with the Information Regulator of South Africa.
          </p>
        </Section>
      </div>
    </div>
  )
}
