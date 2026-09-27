// app/terms/page.tsx
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

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-xs text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <Section title="1. Acceptance of these terms">
          <p>
            By creating an account or using the TYGA member portal (&quot;the
            Portal&quot;), you agree to these Terms of Service and our{" "}
            <Link
              href="/privacy"
              className="font-medium text-foreground underline"
            >
              Privacy Policy
            </Link>
            . If you are enrolling a child under 18, you confirm you are their
            parent or legal guardian and are agreeing on their behalf.
          </p>
        </Section>

        <Section title="2. Account responsibilities">
          <p>
            You are responsible for keeping your login credentials secure and
            for all activity under your account. Notify us immediately if you
            believe your account has been accessed without authorization.
            Account roles (parent, coach, admin) are assigned or changed only by
            TYGA administrators — you may not represent yourself as holding a
            role you have not been granted.
          </p>
        </Section>

        <Section title="3. Enrollment, terms & payment">
          <p>
            Enrollment in a programme is confirmed once the associated invoice
            is paid or an agreed payment arrangement is in place. Fees are
            billed per term, not on a rolling subscription. TYGA reserves the
            right to remove access to future sessions for accounts with
            significantly overdue invoices, though enrollment and attendance
            history are retained regardless.
          </p>
          <p>
            Refund and cancellation requests are handled on a case-by-case basis
            — contact us via the details on the{" "}
            <Link
              href="/help"
              className="font-medium text-foreground underline"
            >
              Help page
            </Link>{" "}
            before a term begins wherever possible.
          </p>
        </Section>

        <Section title="4. Medical & safety information">
          <p>
            You agree to provide accurate and current medical, emergency
            contact, and safety-relevant information for any child enrolled
            through your account, and to update it promptly if it changes. TYGA
            and its coaches rely on this information to respond appropriately in
            the event of an injury or medical incident during a session.
          </p>
        </Section>

        <Section title="5. Coach & instructor conduct">
          <p>
            Coaches operating on the Portal are expected to follow TYGA&apos;s
            coaching standards, including maintaining stated coach-to-student
            ratios and only accessing student medical information for students
            they are directly assigned to teach. Any concern about coach conduct
            should be reported to an administrator.
          </p>
        </Section>

        <Section title="6. Acceptable use">
          <p>
            You agree not to misuse the Portal — including attempting to access
            accounts, data, or administrative functions you are not authorized
            to use, or interfering with the platform&apos;s normal operation.
            TYGA may suspend or terminate accounts that violate these terms.
          </p>
        </Section>

        <Section title="7. Limitation of liability">
          <p>
            The Portal is provided to support the administration of TYGA&apos;s
            golf academy programmes. While we take reasonable care to keep
            information accurate and the platform available, TYGA is not liable
            for indirect or consequential losses arising from use of the Portal,
            to the fullest extent permitted by law.
          </p>
        </Section>

        <Section title="8. Changes to these terms">
          <p>
            We may update these Terms from time to time. Continued use of the
            Portal after an update constitutes acceptance of the revised terms.
            Material changes will be communicated via email or an in-app notice.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Questions about these Terms can be sent to{" "}
            <a
              href="mailto:legal@tyga.co.za"
              className="font-medium text-foreground underline"
            >
              legal@tyga.co.za
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  )
}
