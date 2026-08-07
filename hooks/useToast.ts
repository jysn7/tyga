// // lib/toast.ts
// "use client"

// import { toast } from "@/components/ui/toast"
// import { type ToastData } from "@base-ui/react/toast"

// type ToastType = "success" | "error" | "info" | "warning" | "loading"

// export const useToast = () => {
//   const showToast = (
//     title: string,
//     description?: string,
//     type: ToastType = "info",
//     duration?: number
//   ) => {
//     toast.add({
//       title,
//       description,
//       type,
//       duration: duration || 3000,
//     })
//   }

//   const success = (title: string, description?: string) => {
//     toast.add({
//       title,
//       description,
//       type: "success",
//       duration: 3000,
//     })
//   }

//   const error = (title: string, description?: string) => {
//     toast.add({
//       title,
//       description,
//       type: "error",
//       duration: 5000,
//     })
//   }

//   const info = (title: string, description?: string) => {
//     toast.add({
//       title,
//       description,
//       type: "info",
//       duration: 3000,
//     })
//   }

//   const warning = (title: string, description?: string) => {
//     toast.add({
//       title,
//       description,
//       type: "warning",
//       duration: 4000,
//     })
//   }

//   const loading = (title: string, description?: string) => {
//     return toast.add({
//       title,
//       description,
//       type: "loading",
//       duration: Infinity,
//     })
//   }

//   const dismiss = (id: string) => {
//     toast.remove(id)
//   }

//   return {
//     showToast,
//     success,
//     error,
//     info,
//     warning,
//     loading,
//     dismiss,
//   }
// }
