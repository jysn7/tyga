// import Link from "next/link"
// import { ChevronRight } from "lucide-react"
// import { EnrollmentSheet } from "@/components/portals/client/programmes/enrollment-sheet"
// import { TYPE_LABELS } from "@/lib/constants/programmes"
// import type { ProgrammeDetail } from "@/lib/types"

// export function ProgrammeHero({ programme }: { programme: ProgrammeDetail }) {
//   const isFull = programme.enrolledCount >= programme.capacity
//   const spotsLeft = programme.capacity - programme.enrolledCount

//   const stats = [
//     {
//       label: "Status",
//       value: isFull ? "Full" : `${spotsLeft} spots available`,
//       accent: isFull,
//     },
//     {
//       label: "Enrolled",
//       value: `${programme.enrolledCount} / ${programme.capacity}`,
//     },
//     {
//       label: "Coach ratio",
//       value: `1:${programme.maxRatio}`,
//     },
//     {
//       label: "Sessions",
//       value: `${programme.upcomingSessions ?? 0} upcoming`,
//     },
//   ]

//   return (
//     <div className="flex flex-col gap-6">
//       <nav
//         aria-label="Breadcrumb"
//         className="flex items-center gap-1.5 text-xs text-muted-foreground"
//       >
//         <Link
//           href="/programmes"
//           className="transition-colors hover:text-foreground"
//         >
//           Programmes
//         </Link>
//         <ChevronRight className="h-3.5 w-3.5 shrink-0" />
//         <span className="truncate">{programme.levelName}</span>
//         <ChevronRight className="h-3.5 w-3.5 shrink-0" />
//         <span className="truncate text-foreground">{programme.name}</span>
//       </nav>

//       <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
//         <div className="flex flex-col gap-2">
//           <div className="flex flex-wrap items-center gap-1.5">
//             <span className="rounded-full bg-input px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
//               {TYPE_LABELS[programme.type]}
//             </span>
//             <span className="rounded-full bg-input px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
//               {programme.levelName}
//             </span>
//             <span className="rounded-full bg-input px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
//               Ages {programme.minAge}–{programme.maxAge}
//             </span>
//           </div>
//           <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
//             {programme.name}
//           </h1>
//         </div>
//         <div className="flex shrink-0 items-center gap-4">
//           <div className="text-right">
//             <span className="text-xl font-semibold text-foreground">
//               R{programme.price}
//             </span>
//             <span className="text-xs text-muted-foreground"> /term</span>
//           </div>
//           <EnrollmentSheet programme={programme} />
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
//         {stats.map((stat) => (
//           <div
//             key={stat.label}
//             className="flex flex-col gap-1 rounded-xl bg-card p-3.5 shadow"
//           >
//             <span className="text-[11px] text-muted-foreground">
//               {stat.label}
//             </span>
//             <p
//               className={`text-sm font-medium ${
//                 stat.accent ? "text-destructive" : "text-foreground"
//               }`}
//             >
//               {stat.value}
//             </p>
//           </div>
//         ))}
//       </div>

//       <div className="flex flex-col gap-4">
//         <p className="text-sm leading-relaxed text-muted-foreground">
//           {programme.description}
//         </p>

//         {programme.stageGoal && (
//           <div className="relative overflow-hidden rounded-lg bg-secondary p-4 shadow">
//             <div
//               aria-hidden="true"
//               className="pointer-events-none absolute right-9 -bottom-6 h-12 w-12 rotate-45 rounded-lg bg-card"
//             />
//             <p className="text-xs font-medium tracking-wider text-primary uppercase">
//               Goal
//             </p>
//             <p className="mt-0.5 text-sm text-foreground">
//               {programme.stageGoal}
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
