export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    present: "bg-green-light text-green",
    absent: "bg-rose/50 text-rose",
    late: "bg-orange-light text-orange",
    excused: "bg-input text-muted-foreground",
    pending: "bg-input text-muted-foreground",
    unmarked: "bg-input text-muted-foreground",
    scheduled: "bg-blue-light text-blue",
    completed: "bg-green-light text-green",
    cancelled: "bg-rose/50 text-rose",
  }

  const normalizedStatus = status.toLowerCase()
  const currentStyle = styles[normalizedStatus] ?? styles.pending
  const label =
    normalizedStatus === "unmarked"
      ? "Not marked"
      : normalizedStatus.replaceAll("_", " ")

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium uppercase ${currentStyle}`}
    >
      {label}
    </span>
  )
}
