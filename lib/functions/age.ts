export function ageInYears(dob: Date, now: Date = new Date()): number {
  return (
    now.getFullYear() -
    dob.getFullYear() -
    (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0)
  )
}
