"use client"

import { Suspense } from "react"
import { SearchPage } from "@/components/portals/shared/search-page"
import { Loader } from "@/components/portals/shared/loader"

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader />
        </div>
      }
    >
      <SearchPage role="admin" />
    </Suspense>
  )
}
