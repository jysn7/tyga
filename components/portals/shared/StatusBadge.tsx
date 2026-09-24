export function StatusBadge({ status }: { status: string }) {
  const styles = {
    present: "bg-green-100 text-green-800",
    absent: "bg-red-100 text-red-800",
    late: "bg-yellow-100 text-yellow-800",
    pending: "bg-gray-100 text-gray-800",
  }

  const currentStyle = styles[status as keyof typeof styles] || styles.pending

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium uppercase ${currentStyle}`}
    >
      {status}
    </span>
  )
}
