import type { Venue } from "@/lib/types"

export const sampleVenues: Venue[] = [
  {
    id: 1,
    name: "Soweto Country Club",
    address: "Nicholas St, Soweto, 1804",
    type: "course",
    latitude: -26.2578,
    longitude: 27.8618,
    archivedAt: null,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Zodwa Khoza Foundation",
    address: "Vilakazi St, Soweto, 1804",
    type: "practice_ground",
    latitude: null,
    longitude: null,
    archivedAt: null,
    createdAt: "2026-01-02T00:00:00Z",
  },
  {
    id: 3,
    name: "School Facility",
    address: "Klipspruit, Soweto, 1809",
    type: "school",
    latitude: null,
    longitude: null,
    archivedAt: null,
    createdAt: "2026-01-03T00:00:00Z",
  },
]
