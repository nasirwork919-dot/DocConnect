export interface Treatment {
  id: string;
  name: string;
  specialization: string;
  description: string;
  commonSymptoms: string[];
  duration: string;
  costRange: string;
}

export const ALL_TREATMENTS: Treatment[] = [
  {
    id: "1",
    name: "Coronary Artery Bypass Graft (CABG)",
    specialization: "Cardiology",
    description: "A surgical procedure to improve blood flow to the heart by bypassing blocked or narrowed coronary arteries with grafts.",
    commonSymptoms: ["Chest pain", "Shortness of breath", "Fatigue"],
    duration: "4-6 hours surgery, 5-7 days hospital stay",
    costRange: "$70,000 - $200,000",
  },
  {
    id: "2",
    name: "Angioplasty and Stenting",
    specialization: "Cardiology",
    description: "A minimally invasive procedure to widen narrowed or obstructed arteries, often followed by placing a stent to keep the artery open.",
    commonSymptoms: ["Chest pain", "Shortness of breath"],
    duration: "1-3 hours procedure, 1-2 days hospital stay",
    costRange: "$20,000 - $50,000",
  },
  {
    id: "3",
    name: "Deep Brain Stimulation (DBS)",
    specialization: "Neurology",
    description: "A neurosurgical procedure involving the implantation of a medical device called a neurostimulator, which sends electrical impulses to specific targets in the brain.",
    commonSymptoms: ["Tremors", "Rigidity", "Difficulty walking (Parkinson's, essential tremor)"],
    duration: "3-5 hours surgery, few days hospital stay",
    costRange: "$30,000 - $100,000",
  },
  {
    id: "4",
    name: "Epilepsy Surgery",
    specialization: "Neurology",
    description: "Surgical removal of the part of the brain that is causing seizures, or other procedures to prevent seizures from spreading.",
    commonSymptoms: ["Recurrent seizures unresponsive to medication"],
    duration: "4-8 hours surgery, 3-7 days hospital stay",
    costRange: "$25,000 - $80,000",
  },
  {
    id: "5",
    name: "Vaccination Programs",
    specialization: "Pediatrics",
    description: "Comprehensive immunization schedules for infants, children, and adolescents to protect against various infectious diseases.",
    commonSymptoms: ["Prevention of infectious diseases"],
    duration: "Regular schedule from birth to adolescence",
    costRange: "$50 - $300 per vaccine dose",
  },
  {
    id: "6",
    name: "Asthma Management for Children",
    specialization: "Pediatrics",
    description: "Personalized treatment plans including medication, trigger avoidance, and education for children with asthma.",
    commonSymptoms: ["Wheezing", "Coughing", "Shortness of breath in children"],
    duration: "Ongoing management",
    costRange: "$100 - $500 per month (medication & visits)",
  },
  {
    id: "7",
    name: "Acne Treatment",
    specialization: "Dermatology",
    description: "Medical and cosmetic treatments for various types of acne, including topical creams, oral medications, and laser therapy.",
    commonSymptoms: ["Pimples", "Blackheads", "Cysts on skin"],
    duration: "Weeks to months, depending on severity",
    costRange: "$50 - $500 per visit/treatment",
  },
  {
    id: "8",
    name: "Skin Cancer Screening & Removal",
    specialization: "Dermatology",
    description: "Regular skin checks for early detection of skin cancer, and surgical or non-surgical removal of cancerous lesions.",
    commonSymptoms: ["New or changing moles", "Unusual skin growths"],
    duration: "Annual screenings, removal procedure 30-60 mins",
    costRange: "$150 - $5,000 (screening to complex removal)",
  },
  {
    id: "9",
    name: "Knee Arthroscopy",
    specialization: "Orthopedics",
    description: "A minimally invasive surgical procedure used to diagnose and treat problems inside the knee joint.",
    commonSymptoms: ["Knee pain", "Swelling", "Locking of the knee"],
    duration: "1-2 hours surgery, few weeks recovery",
    costRange: "$5,000 - $15,000",
  },
  {
    id: "10",
    name: "Hip Replacement Surgery",
    specialization: "Orthopedics",
    description: "A surgical procedure in which the diseased bone and cartilage of the hip joint are removed and replaced with prosthetic components.",
    commonSymptoms: ["Severe hip pain", "Difficulty walking"],
    duration: "2-4 hours surgery, 2-4 days hospital stay, months of rehab",
    costRange: "$15,000 - $50,000",
  },
];