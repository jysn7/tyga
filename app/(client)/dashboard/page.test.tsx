import { render } from "@testing-library/react"
import { useRouter, useSearchParams } from "next/navigation"

import DashboardPage from "./page"
import { toast } from "@/components/ui/toast"

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

jest.mock("@/components/ui/toast", () => ({
  toast: {
    add: jest.fn(),
  },
}))

describe("Dashboard auth redirect", () => {
  it("shows the sign-in success toast when the callback redirect includes the auth flag", () => {
    const replace = jest.fn()

    ;(useRouter as jest.Mock).mockReturnValue({ replace })
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === "toast" ? "auth-success" : null),
    })

    render(<DashboardPage />)

    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Welcome back! 🎉",
        description: "You've been signed in successfully.",
        type: "success",
      })
    )
    expect(replace).toHaveBeenCalledWith("/dashboard")
  })
})
