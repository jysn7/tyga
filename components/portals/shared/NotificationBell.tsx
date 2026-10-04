// "use client"

// import { useState } from "react"
// import { useNotifications } from "@/hooks/use-notifications"

// export function NotificationBell() {
//   const { notifications, unreadCount, markRead } = useNotifications()
//   const [isOpen, setIsOpen] = useState(false)

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
//       >
//         <svg
//           className="h-6 w-6"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="2"
//             d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
//           ></path>
//         </svg>

//         {unreadCount > 0 && (
//           <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
//             {unreadCount}
//           </span>
//         )}
//       </button>

//       {isOpen && (
//         <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border bg-white shadow-xl">
//           <div className="flex items-center justify-between border-b bg-gray-50 p-3">
//             <h3 className="text-sm font-bold text-gray-700">Notifications</h3>
//           </div>
//           <div className="max-h-96 divide-y overflow-y-auto">
//             {notifications.length === 0 ? (
//               <div className="p-4 text-center text-sm text-gray-500">
//                 No notifications yet.
//               </div>
//             ) : (
//               notifications.map((notif) => (
//                 <div
//                   key={notif.id}
//                   onClick={() => {
//                     if (!notif.is_read) markRead(notif.id)
//                   }}
//                   className={`cursor-pointer p-3 transition-colors ${notif.is_read ? "bg-white opacity-70" : "bg-blue-50 hover:bg-blue-100"}`}
//                 >
//                   <div className="mb-1 flex items-start justify-between">
//                     <span className="text-xs font-bold text-primary uppercase">
//                       {notif.type}
//                     </span>
//                     <span className="text-[10px] text-gray-400">
//                       {new Date(notif.created_at).toLocaleDateString()}
//                     </span>
//                   </div>
//                   <h4 className="text-sm font-semibold text-gray-800">
//                     {notif.title}
//                   </h4>
//                   <p className="mt-1 text-xs text-gray-600">{notif.body}</p>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
