// import { Separator } from "@/components/ui/separator"
// import { ProgrammeHero } from "@/components/portals/client/programmes/hero"
// import { FocusBreakdown } from "@/components/portals/client/programmes/focus"
// import { SessionsList } from "@/components/portals/client/programmes/sessions"
// import { CoachList } from "@/components/portals/client/programmes/coaches"
// import { CurriculumList } from "@/components/portals/client/programmes/curriculum"
// import { Progression } from "@/components/portals/client/programmes/progression"
// import { ProgrammeSidebar } from "@/components/portals/client/programmes/programme-sidebar"
// import type { ProgrammeDetail as ProgrammeDetailType } from "@/lib/types"

// export function ProgrammeDetail({ programme }: { programme: ProgrammeDetailType }) {
//   return (
//     <div className="mx-auto space-y-8 py-8">
//       <ProgrammeHero programme={programme} />

//       <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
//         <div className="space-y-6 lg:col-span-2">
//           {programme.focusSplit && (
//             <>
//               <Separator className="bg-border" />
//               <FocusBreakdown focusSplit={programme.focusSplit} />
//             </>
//           )}

//           {programme.sessions && programme.sessions.length > 0 && (
//             <>
//               <Separator className="bg-border" />
//               <SessionsList sessions={programme.sessions} />
//             </>
//           )}

//           {programme.coaches && programme.coaches.length > 0 && (
//             <>
//               <Separator className="bg-border" />
//               <CoachList coaches={programme.coaches} />
//             </>
//           )}

//           {programme.curriculumModules &&
//             programme.curriculumModules.length > 0 && (
//               <>
//                 <Separator className="bg-border" />
//                 <CurriculumList modules={programme.curriculumModules} />
//               </>
//             )}

//           {programme.progressionCriteria && (
//             <>
//               <Separator className="bg-border" />
//               <Progression
//                 criteria={programme.progressionCriteria}
//                 badges={programme.badges}
//               />
//             </>
//           )}
//         </div>

//         <div className="lg:col-span-1">
//           <ProgrammeSidebar programme={programme} />
//         </div>
//       </div>
//     </div>
//   )
// }
