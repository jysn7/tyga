import Link from "next/link"
import type { ReactNode } from "react"

export function EventLink({
  href,
  className,
  title,
  ariaLabel,
  children,
}: {
  href: string | null
  className: string
  title?: string
  ariaLabel?: string
  children: ReactNode
}) {
  if (href) {
    return (
      <Link
        href={href}
        title={title}
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </Link>
    )
  }
  return (
    <div title={title} className={className}>
      {children}
    </div>
  )
}
