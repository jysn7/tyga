export type AccountRole = "parent" | "coach" | "admin"
export type Gender = "male" | "female" | "any"
export type CoachType = "head_coach" | "assistant_coach" | "volunteer"
export type SensitiveField = "medical_notes" | "dob" | "emergency_contact"

export type ProgrammeType =
  | "development"
  | "weekly_community"
  | "holiday_camp"
  | "clinic"
  | "corporate"
  | "league"

export type RoleInProgramme = "lead" | "assistant" | "volunteer"
export type RoleInSession = "lead" | "assistant" | "volunteer"
export type SessionStatus = "scheduled" | "cancelled" | "completed"

export type CurriculumCategory =
  "technical" | "physical" | "mental_character" | "format"

export type AppointmentType = "assessment" | "parent_consultation"
export type AppointmentStatus =
  "requested" | "scheduled" | "completed" | "cancelled" | "no_show"

export type EnrollmentStatus =
  "pending" | "active" | "paused" | "withdrawn" | "completed"

export type AttendanceStatus = "present" | "absent" | "late" | "excused"

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled"

export type EventType =
  | "tournament"
  | "clinic"
  | "assessment"
  | "corporate"
  | "fun_tournament"
  | "parent_workshop"

export type EventRegistrationStatus = "registered" | "waitlisted" | "withdrawn"

export type GearCategory =
  "clubs" | "bag" | "gloves" | "shoes" | "balls" | "other"
export type GearCondition = "new" | "good" | "fair" | "needs_repair" | "retired"
export type GearUnitStatus = "available" | "rented" | "maintenance" | "retired"
export type GearRentalStatus = "requested" | "issued" | "returned" | "overdue"

export type InvoiceStatus =
  "pending" | "paid" | "partially_paid" | "overdue" | "cancelled"

export type InvoiceLineItemType =
  "programme_fee" | "gear_rental" | "private_lesson" | "event_fee" | "other"

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"
export type PaymentChannel = "card" | "eft" | "ussd" | "mobile_money" | "qr"

export type NotificationChannel = "email" | "sms" | "push" | "in_app"
export type NotificationStatus = "pending" | "sent" | "failed" | "read"
export type NotificationType =
  | "session_reminder"
  | "gear_due"
  | "payment_due"
  | "level_upgrade"
  | "parent_consultation_reminder"
  | "announcement"

export type VenueType = "course" | "practice_ground" | "range" | "school"

// Auth & Identity
export interface Account {
  id: string // uuid, same as auth.users.id
  role: AccountRole
  full_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  active: boolean
  created_at: string
}

export interface Coach {
  id: number
  account_id: string | null // uuid, nullable until login is provisioned
  coach_type: CoachType | null
  linked_member_id: number | null
  max_student_ratio: number | null
}

export interface SensitiveDataAccessLog {
  id: number
  user_id: string // uuid
  member_id: number
  field_accessed: SensitiveField
  accessed_at: string
  reason: string | null
}

// People & Progression
// People & Progression
export type Member = {
  id: number
  account_id: string

  full_name: string
  dob: string
  gender: "male" | "female" | "any"

  current_level_id: number | null

  school_name: string | null
  school_grade: string | null

  kit_size_top: string | null
  kit_size_bottom: string | null
  shoe_size: string | null

  previous_club: string | null

  medical_notes: string | null
  medical_aid_details: string | null
  doctor_contact: string | null

  emergency_contact_name: string | null
  emergency_contact_relationship: string | null
  emergency_contact_phone: string | null

  created_at: string
  archived_at: string | null
}

export interface MemberQuestionnaire {
  id: number
  member_id: number
  availability: Record<string, string | undefined> | null
  self_reported_skill_level: string | null
  interests: Record<string, string | undefined> | null
  gear_owned: Record<string, string | undefined> | null
  submitted_at: string | null
}

export interface Level {
  id: number
  name: string
  sort_order: number
  default_age_min: number | null
  default_age_max: number | null
  goal: string | null
  focus_summary: string | null
  upgrade_criteria: string | null
}

export interface LevelProgression {
  id: number
  member_id: number
  from_level_id: number
  to_level_id: number
  assessed_by: number // coach id
  date: string
  badge_complete: boolean
  notes: string | null
}

// Curriculum
export interface CurriculumModule {
  id: number
  level_id: number
  category: CurriculumCategory | null
  name: string
  description: string | null
  is_milestone: boolean
}

export interface SessionCurriculumModule {
  id: number
  session_id: number
  curriculum_module_id: number
}

export interface MemberMilestone {
  id: number
  member_id: number
  curriculum_module_id: number
  completed_at: string | null
  verified_by: number | null // coach id
  notes: string | null
}

// Structure & Scheduling
export type Venue = {
  id: number
  name: string
  type: VenueType
  address: string
  latitude: number | null
  longitude: number | null
  archivedAt: string | null
  createdAt: string
}

export interface Programme {
  id: number
  name: string
  type: ProgrammeType | null
  level_id: number | null
  min_age: number | null
  max_age: number | null
  gender_restriction: Gender | null
  venue_id: number
  recurrence_rule: string | null
  term_start: string | null
  term_end: string | null
  capacity: number | null
  price: number | null
  max_ratio: number | null
}

export interface ProgrammeCoach {
  id: number
  programme_id: number
  coach_id: number
  role_in_programme: RoleInProgramme | null
}

export interface ProgrammeSession {
  id: number
  programme_id: number
  session_date: string
  start_time: string | null
  end_time: string | null
  venue_id: number | null
  status: SessionStatus
  coach_notes: string | null
}

export interface SessionCoach {
  id: number
  session_id: number
  coach_id: number
  role_in_session: RoleInSession | null
}

export interface Appointment {
  id: number
  member_id: number
  coach_id: number | null
  venue_id: number
  type: AppointmentType
  requested_at: string
  scheduled_at: string | null
  status: AppointmentStatus
  assessed_level_id: number | null
  notes: string | null
}

// lib/types.ts additio

// lib/types.ts
export type ProgrammeCoachDetail = {
  id: number
  name: string
  role: string
  avatar_url: string | null
}

export type ProgrammeListItem = {
  id: number
  name: string
  type: string
  levelId: number | null
  levelName: string | null
  venueId: number | null
  venueName: string | null
  recurrenceRule: string | null
  price: number
  capacity: number
  enrolledCount: number
  maxRatio: number | null
  minAge: number
  maxAge: number
  genderRestriction: string | null
  description: string | null
  imageUrl: string | null
  alreadyEnrolled: boolean
}

export type ProgrammeDetail = ProgrammeListItem & {
  id: number
  name: string
  type: string
  levelId: number | null
  levelName: string | null
  levelGoal: string | null
  levelFocusSummary: string | null
  venueId: number | null
  venueName: string | null
  venueAddress: string | null
  minAge: number
  maxAge: number
  genderRestriction: string | null
  recurrenceRule: string | null
  price: number
  capacity: number
  enrolledCount: number
  maxRatio: number | null
  description: string | null
  imageUrl: string | null
  coaches: ProgrammeCoachDetail[]
  curriculumModules: { id: number; name: string; category: string }[]
  upcomingSessions: ProgrammeSession[]
  sessions: {
    id: number
    sessionDate: string
    startTime: string
    endTime: string
  }[]
  isEligible: boolean | null
  alreadyEnrolled: boolean
}

export type EnrollableMember = {
  id: number
  fullName: string
  isEligible: boolean
  reason: string | null
}

export interface Enrollment {
  id: number
  member_id: number
  programme_id: number
  status: EnrollmentStatus
  joined_at: string
  subsidised: boolean
}

export interface Attendance {
  id: number
  session_id: number
  member_id: number
  status: AttendanceStatus
  marked_by: number // coach id
  marked_at: string
}

// One-off Bookings & Events (secondary)
export interface Booking {
  id: number
  member_id: number
  coach_id: number
  venue_id: number
  session_date: string
  start_time: string | null
  duration_minutes: number | null
  rate: number | null
  status: BookingStatus
}

export type Event = {
  id: number
  name: string
  type: string
  description: string | null
  imageUrl: string | null
  venueId: number
  venueName: string
  eventDate: string
  startTime: string | null
  entryFee: number
  capacity: number | null
  minAge: number | null
  maxAge: number | null
  status: "draft" | "active" | "cancelled" | "completed"
  registeredCount: number
}

export interface EventRegistration {
  id: number
  member_id: number
  event_id: number
  status: EventRegistrationStatus
  paid: boolean
}

// Money
export interface Sponsorship {
  id: number
  donor_name: string
  amount: number | null
  date: string | null
  notes: string | null
}

export interface SponsorshipAllocation {
  id: number
  sponsorship_id: number
  programme_id: number | null
  enrollment_id: number | null
  amount: number | null
}

export interface GearType {
  id: number
  name: string
  category: GearCategory | null
  description: string | null
  standard_rental_fee: number | null
  active: boolean
}

export interface GearUnit {
  id: number
  gear_type_id: number
  tag_number: string
  size: string | null
  condition: GearCondition
  status: GearUnitStatus
  acquired_date: string | null
}

export interface GearRental {
  id: number
  member_id: number
  booking_id: number
  fee: number | null
  status: GearRentalStatus
  issued_at: string | null
  due_at: string | null
  returned_at: string | null
  issued_by: number | null // coach id
  notes: string | null
}

export interface GearRentalUnit {
  id: number
  gear_rental_id: number
  gear_unit_id: number
  condition_out: string | null
  condition_in: string | null
}

// export type InvoiceStatus = 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled'

export type Invoice = {
  id: number
  issuedAt: string
  dueAt: string
  totalAmount: number
  status: InvoiceStatus
  itemCount: number
  paidAmount: number
  outstandingAmount: number
}

export type InvoiceLineItem = {
  id: number
  itemType: string
  description: string
  amount: number
}

export type InvoicePayment = {
  id: number
  amount: number
  method: string
  status: string
  paidAt: string | null
  gatewayReference: string | null
}

export type InvoiceDetail = {
  id: number
  issuedAt: string
  dueAt: string
  totalAmount: number
  status: InvoiceStatus
  paidAmount: number
  outstandingAmount: number
  lineItems: InvoiceLineItem[]
  payments: InvoicePayment[]
}

export interface Payment {
  id: number
  invoice_id: number
  amount: number
  method: string | null
  gateway_reference: string | null // Paystack transaction reference
  paystack_transaction_id: number | null
  channel: PaymentChannel | null
  status: PaymentStatus
  paid_at: string | null
}

// Notifications & Audit
export interface Notification {
  id: number
  account_id: string // uuid
  related_type: string | null
  related_id: number | null // polymorphic, not a real FK
  channel: NotificationChannel | null
  title: string | null
  body: string | null
  status: NotificationStatus
  created_at: string
  sent_at: string | null
  read_at: string | null
}

export interface NotificationPreference {
  id: number
  account_id: string // uuid
  notification_type: NotificationType | null
  channel: NotificationChannel | null
  enabled: boolean
}

// Composite / view-model types
// (not real tables — shapes your components actually consume,
// usually built from a join or an RPC result)
export interface MemberWithLevel extends Member {
  level: Level | null
}

export interface ProgrammeWithVenueAndLevel extends Programme {
  venue: Venue
  level: Level | null
}

export interface EnrollmentWithProgramme extends Enrollment {
  programme: Programme
}

export interface InvoiceWithLineItems extends Invoice {
  line_items: InvoiceLineItem[]
}
