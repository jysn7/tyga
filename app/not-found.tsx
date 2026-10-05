// app/not-found.tsx

import Image from "next/image"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-12">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <Image
          src="/404.svg"
          alt="Page not found"
          width={400}
          height={300}
          priority
        />

        <p className="mt-6 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          404
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Oops... looks like you took a wrong turn!
        </h1>

        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          We searched everywhere, but this page seems to have vanished into thin
          air.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-md border border-foreground/80 bg-foreground/80 px-6 text-sm font-medium text-secondary transition-colors duration-300 hover:bg-background hover:text-foreground"
          >
            Take me back home
          </Link>
        </div>
      </div>
    </div>
  )
}
