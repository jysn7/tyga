// "use client"
// import { useState } from "react"
// import { useSessionMutations } from "@/hooks/use-sessions-mutations"
// import { StatusBadge } from "@/components/portals/shared/StatusBadge"

// // Mock type based on your DFD/EERD requirements
// type RosterMember = {
//   id: number
//   full_name: string
//   attendance_status: string | null
// }

// export function SessionRosterTab({
//   sessionId,
//   initialRoster,
// }: {
//   sessionId: number
//   initialRoster: RosterMember[]
// }) {
//   const [roster, setRoster] = useState(initialRoster)
//   const { markAttendance, bulkMarkPresent } = useSessionMutations()
//   const [isUpdating, setIsUpdating] = useState(false)

//   const handleMark = async (memberId: number, status: "present" | "absent") => {
//     try {
//       await markAttendance(sessionId, memberId, status)
//       setRoster((prev) =>
//         prev.map((m) =>
//           m.id === memberId ? { ...m, attendance_status: status } : m
//         )
//       )
//     } catch (error) {
//       console.error("Failed to mark attendance", error)
//     }
//   }

//   const handleBulkPresent = async () => {
//     setIsUpdating(true)
//     try {
//       await bulkMarkPresent(sessionId)
//       setRoster((prev) =>
//         prev.map((m) => ({ ...m, attendance_status: "present" }))
//       )
//     } catch (error) {
//       console.error("Failed bulk update", error)
//     }
//     setIsUpdating(false)
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-bold">Session Roster</h3>
//         <button
//           onClick={handleBulkPresent}
//           disabled={isUpdating}
//           className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
//         >
//           {isUpdating ? "Updating..." : "Mark All Present"}
//         </button>
//       </div>

//       <div className="divide-y rounded-md border">
//         {roster.map((member) => (
//           <div
//             key={member.id}
//             className="flex items-center justify-between p-4"
//           >
//             <div className="flex items-center gap-3">
//               <span className="font-medium">{member.full_name}</span>
//               <StatusBadge status={member.attendance_status || "pending"} />
//             </div>

//             <div className="flex gap-2">
//               <button
//                 onClick={() => handleMark(member.id, "present")}
//                 className="rounded border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-700 hover:bg-green-100"
//               >
//                 Present
//               </button>
//               <button
//                 onClick={() => handleMark(member.id, "absent")}
//                 className="rounded border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 hover:bg-red-100"
//               >
//                 Absent
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }
