export type ConsentKey =
  | "membership"
  | "medicalEmergency"
  | "indemnity"
  | "codeOfConduct"
  | "photoVideo"
  | "transport"

export interface ConsentDocument {
  key: ConsentKey
  label: string
  summary: string
  required: boolean
  sections: { heading: string; body: string }[]
}

export const CONSENT_DOCUMENTS: Record<ConsentKey, ConsentDocument> = {
  membership: {
    key: "membership",
    label: "Membership agreement",
    summary:
      "Confirms the information you've given is accurate and that you agree to TYGA's membership terms.",
    required: true,
    sections: [
      {
        heading: "1. Application",
        body: "By ticking this consent, you apply for membership of TYGA (The Youth Golf Academy) on behalf of the child named in this form. You confirm that you are the child's parent or legal guardian and that you have the authority to enter into this agreement on their behalf.",
      },
      {
        heading: "2. Accuracy of information",
        body: "You confirm that all information supplied in this registration — including the child's name, date of birth, gender, school details, medical information, and any other details — is accurate and complete to the best of your knowledge. You agree to notify TYGA promptly if any of this information changes.",
      },
      {
        heading: "3. Membership fee",
        body: "You understand that TYGA membership is a recurring monthly fee of R100, charged to the payment method on file. The fee is required to maintain active membership and to enrol in any TYGA programme. It is not a subscription to optional benefits and cannot be paused while the child remains enrolled.",
      },
      {
        heading: "4. Term and cancellation",
        body: "Membership continues on a month-to-month basis until cancelled. You may cancel at any time from your account settings. Cancellation takes effect at the end of the current billing period. No refunds are issued for partial months. Cancelling membership ends the family's ability to enrol in new programmes until the fee is reinstated.",
      },
      {
        heading: "5. Acceptance",
        body: "By ticking this box, you accept these terms and confirm your application for membership of TYGA.",
      },
    ],
  },

  medicalEmergency: {
    key: "medicalEmergency",
    label: "Medical emergency consent",
    summary:
      "Allows TYGA staff to seek emergency medical treatment if you can't be reached.",
    required: true,
    sections: [
      {
        heading: "1. Authorisation",
        body: "You authorise TYGA staff, coaches, and representatives to seek and consent to emergency medical treatment for the child named in this form if you (the parent or guardian) cannot be reached in a timely manner, and if TYGA staff reasonably believe such treatment is necessary.",
      },
      {
        heading: "2. Scope",
        body: "This authorisation covers emergency medical assessment, ambulance transport, hospital admission, and any treatment a qualified medical practitioner deems necessary to preserve the child's health or safety.",
      },
      {
        heading: "3. Your responsibility",
        body: "You are responsible for keeping your contact details and emergency contact details up to date in your account. You are also responsible for informing TYGA of any medical conditions, allergies, or medications the child takes that may affect treatment.",
      },
      {
        heading: "4. Costs",
        body: "You acknowledge that any medical costs incurred as a result of emergency treatment are your responsibility, and that TYGA does not provide medical insurance for participants. You are encouraged to ensure your child has adequate medical cover.",
      },
    ],
  },

  indemnity: {
    key: "indemnity",
    label: "Indemnity agreement",
    summary:
      "Acknowledges the inherent risks of golf and releases TYGA from liability for ordinary risks.",
    required: true,
    sections: [
      {
        heading: "1. Acknowledgement of risk",
        body: "You acknowledge that participation in golf coaching, practice sessions, tournaments, and related events involves inherent risks. These include, but are not limited to, physical injury from swinging clubs, being struck by golf balls or clubs, slips and falls on wet or uneven ground, sun exposure, and travel to and from venues.",
      },
      {
        heading: "2. Assumption of risk",
        body: "You accept these risks on behalf of the child named in this form, and you accept that TYGA cannot eliminate all risks of injury or harm. You agree that the child participates voluntarily and at your own election.",
      },
      {
        heading: "3. Release of liability",
        body: "To the fullest extent permitted by South African law, you release TYGA, its directors, employees, coaches, and volunteers from any liability for injury, loss, or damage arising from the child's participation in TYGA activities, except where such injury, loss, or damage is caused by TYGA's gross negligence or wilful misconduct.",
      },
      {
        heading: "4. What this does not cover",
        body: "This release does not apply to claims arising from TYGA's gross negligence, intentional harm, or any matter that cannot be legally waived under South African law. It also does not affect any statutory rights you may have under the Consumer Protection Act.",
      },
      {
        heading: "5. Property",
        body: "You acknowledge that TYGA is not responsible for loss, theft, or damage to personal property — including golf equipment, clothing, or electronics — brought onto TYGA premises or venues.",
      },
    ],
  },

  codeOfConduct: {
    key: "codeOfConduct",
    label: "Code of conduct",
    summary:
      "Agreement to TYGA's standards of behaviour for players, parents, and guardians.",
    required: true,
    sections: [
      {
        heading: "1. Purpose",
        body: "TYGA exists to help young golfers develop their skills, their character, and their love of the game. The code of conduct sets out the standards of behaviour expected from every member — players, parents, and guardians — so that all participants can learn and play in a safe, respectful, and positive environment.",
      },
      {
        heading: "2. Player conduct",
        body: "Players agree to: attend sessions on time and prepared; treat coaches, fellow players, and opponents with respect; follow coaching instructions; care for equipment and facilities; accept decisions from coaches and tournament officials gracefully; encourage teammates and opponents; and represent TYGA positively on and off the course.",
      },
      {
        heading: "3. Parent and guardian conduct",
        body: "Parents and guardians agree to: support their child's participation without pressuring them to perform; allow coaches to coach during sessions; refrain from coaching from the sidelines; communicate with coaches through the appropriate channels; respect other families and TYGA staff; and model good sportsmanship at all events.",
      },
      {
        heading: "4. Prohibited behaviour",
        body: "The following will not be tolerated: bullying, harassment, or discrimination of any kind; physical or verbal aggression; deliberate damage to property; cheating or dishonesty in competition; use of performance-enhancing substances; and any behaviour that endangers the safety or wellbeing of others.",
      },
      {
        heading: "5. Consequences",
        body: "Breaches of the code of conduct may result in: a verbal warning; a written warning; suspension from sessions or events; removal from a specific programme without refund; or termination of membership. TYGA will investigate reports fairly and give the parties involved an opportunity to respond before deciding on consequences.",
      },
      {
        heading: "6. Reporting",
        body: "If you witness or experience behaviour that breaches this code, please report it to a TYGA coach or to the academy office. Reports will be handled confidentially and with sensitivity.",
      },
    ],
  },

  photoVideo: {
    key: "photoVideo",
    label: "Photo / video consent",
    summary:
      "Permission for TYGA to use photos and videos of your child for promotional purposes. Optional.",
    required: false,
    sections: [
      {
        heading: "1. What you're consenting to",
        body: "If you tick this consent, you give TYGA permission to photograph and film the child named in this form during coaching sessions, tournaments, and TYGA events, and to use those images and videos for TYGA's promotional purposes.",
      },
      {
        heading: "2. Where images may appear",
        body: "This includes TYGA's website, social media accounts (Instagram, Facebook, and similar), printed materials, newsletters, and event displays. Images will never be sold or licensed to third parties.",
      },
      {
        heading: "3. Child safety",
        body: "TYGA never publishes identifying details alongside images — no full names, addresses, schools, or contact information. Images focus on activity and development, not on identifying the child.",
      },
      {
        heading: "4. Optional",
        body: "This consent is entirely optional. If you leave the box unticked, it will not affect your child's enrolment, participation, or standing in any way. You may also withdraw this consent later by contacting the academy office, at which point TYGA will stop using new images of your child.",
      },
      {
        heading: "5. Existing images",
        body: "Withdrawing consent cannot recall images already published in printed materials, but TYGA will remove images from its own website and social accounts where reasonably practicable.",
      },
    ],
  },

  transport: {
    key: "transport",
    label: "Transport consent",
    summary:
      "Permission for TYGA staff to transport your child to and from approved events. Optional.",
    required: false,
    sections: [
      {
        heading: "1. When this applies",
        body: "If you tick this consent, you give TYGA permission to transport the child named in this form to and from approved TYGA events — such as away tournaments, inter-academy matches, or coaching sessions held at a venue other than the child's regular venue.",
      },
      {
        heading: "2. Who drives",
        body: "Transport is provided by TYGA coaches or staff, in vehicles that are roadworthy and covered by appropriate insurance. Drivers hold valid South African driver's licences and are known to TYGA.",
      },
      {
        heading: "3. Notification",
        body: "You will always be notified in advance of any event that involves transport, and you'll be told who the driver is, what time the child will be collected, and when they're expected back.",
      },
      {
        heading: "4. Optional",
        body: "This consent is optional. If you leave the box unticked, your child can still participate in all TYGA activities — you'll simply be responsible for arranging transport to and from events yourself.",
      },
      {
        heading: "5. Withdrawal",
        body: "You may withdraw this consent at any time by contacting the academy office. Withdrawal applies to future events and does not affect events already in progress.",
      },
    ],
  },
}
