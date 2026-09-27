"use client"

import { useState, useEffect } from "react"
import { useTeam, TeamMember } from "@/hooks/use-team"
import { createClient } from "@supabase/supabase-js"

export function TeamTab() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const { getTeam, addTeamMember, deleteTeamMember } = useTeam()
  const [isLoading, setIsLoading] = useState(true) // Already true on mount

  // Form State
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [bio, setBio] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Initial load on mount (no synchronous state setters)
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const data = await getTeam()
        setTeam(data)
      } catch (error) {
        console.error("Failed to load team", error)
      }
      setIsLoading(false)
    }

    fetchInitial()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Manual refresh for when you add or remove someone
  const refreshTeam = async () => {
    setIsLoading(true)
    try {
      const data = await getTeam()
      setTeam(data)
    } catch (error) {
      console.error("Failed to refresh team", error)
    }
    setIsLoading(false)
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !role) return alert("Name and role are required.")

    setIsSubmitting(true)
    try {
      let imageUrl = ""

      // Handle Image Upload with 4MB limit
      if (file) {
        if (file.size > 4 * 1024 * 1024) {
          setIsSubmitting(false)
          return alert("Image exceeds the 4MB limit.")
        }

        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from("marketing")
          .upload(`team/${fileName}`, file)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from("marketing")
          .getPublicUrl(`team/${fileName}`)

        imageUrl = publicUrlData.publicUrl
      }

      await addTeamMember(name, role, bio, imageUrl, 0)
      alert("Team member added!")

      // Reset form and refresh table
      setName("")
      setRole("")
      setBio("")
      setFile(null)
      refreshTeam()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred"
      alert(errorMessage)
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this team member?")) return
    try {
      await deleteTeamMember(id)
      refreshTeam()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred"
      alert("Failed to delete: " + errorMessage)
    }
  }

  return (
    <div className="space-y-8 p-4">
      {/* Add New Member Form */}
      <div className="rounded-md border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold">Add Team Member</h3>
        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border p-2 text-sm"
              required
            />
            <input
              type="text"
              placeholder="Role (e.g. Head Coach)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-md border p-2 text-sm"
              required
            />
          </div>
          <textarea
            placeholder="Short Bio / Description"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-md border p-2 text-sm"
            rows={3}
          />
          <div>
            <label className="mb-1 block text-sm text-gray-600">
              Profile Image (Max 4MB)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            {isSubmitting ? "Adding..." : "Add Member"}
          </button>
        </form>
      </div>

      {/* Team Roster Display */}
      <div className="rounded-md border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold">Current Team</h3>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading team members...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <div
                key={member.id}
                className="flex flex-col items-center rounded-md border p-4 text-center"
              >
                {member.image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className="mb-3 h-24 w-24 rounded-full bg-gray-100 object-cover"
                  />
                ) : (
                  <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-400">
                    No Image
                  </div>
                )}
                <h4 className="font-bold text-gray-800">{member.name}</h4>
                <p className="mb-2 text-xs font-medium text-primary">
                  {member.role}
                </p>
                <p className="mb-4 line-clamp-3 text-xs text-gray-500">
                  {member.bio}
                </p>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="mt-auto text-xs text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
