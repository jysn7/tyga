import type { Member } from "@/components/portals/client/members/member-card"

export const sampleMembers: Member[] = [
  {
    id: "1",
    fullName: "Jayden Mokoena",
    dob: "2016-03-14",
    gender: "male",
    currentLevelName: "Skill Building",
    nextSessionLabel: "Tue, 4:00 PM — Zodwa Khoza Foundation",
    activeEnrollmentCount: 1,
    onboardingComplete: true,
  },
  {
    id: "2",
    fullName: "Lerato Mokoena",
    dob: "2019-08-02",
    gender: "female",
    currentLevelName: null,
    nextSessionLabel: null,
    activeEnrollmentCount: 0,
    onboardingComplete: false,
  },
]
