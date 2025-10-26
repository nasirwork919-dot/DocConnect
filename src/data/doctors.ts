import { format } from "date-fns";

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualifications: string[];
  experience: number;
  hospital: string;
  consultationFee: number;
  languages: string[];
  contactEmail: string;
  bio: string;
  availabilitySchedule: { [key: string]: string };
  realtimeStatus: "Online" | "In Clinic" | "Off";
  averageRating: number;
  reviewsCount: number;
  profilePhotoUrl: string;
  location: string;
  gender: "male" | "female" | "other";
  availabilityStatus: string; // Simplified status for listing page
}

const DOCTOR_NAMES = [
  "Dr. James Griffith", "Dr. David Vaccum", "Dr. Sofia Khan", "Dr. Iqra Ahmed", "Dr. Nasir Ali",
  "Dr. Emily White", "Dr. John Smith", "Dr. Sarah Chen", "Dr. Michael Brown", "Dr. Jessica Lee",
  "Dr. Robert Johnson", "Dr. Maria Garcia", "Dr. William Davis", "Dr. Linda Rodriguez", "Dr. Richard Martinez",
  "Dr. Susan Hernandez", "Dr. Charles Lopez", "Dr. Nancy Gonzalez", "Dr. Joseph Wilson", "Dr. Karen Anderson",
  "Dr. Thomas Taylor", "Dr. Betty Thomas", "Dr. Paul Jackson", "Dr. Dorothy White", "Dr. Mark Harris",
  "Dr. Sandra Martin", "Dr. Steven Thompson", "Dr. Ashley Moore", "Dr. Kevin Clark", "Dr. Laura Lewis"
];

const DOCTOR_IMAGES = [
  "https://images.unsplash.com/photo-1559839734-2b716b17f7ce?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Female doctor
  "https://images.unsplash.com/photo-1612349317035-efcd554845ed?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Male doctor
  "https://images.unsplash.com/photo-1537368910025-7dcd2817d04e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Female doctor
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Male doctor
  "https://images.unsplash.com/photo-1582759710003-c75390b87992?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Female doctor
  "https://images.unsplash.com/photo-1579154204601-f159c8f419bc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Male doctor
  "https://images.unsplash.com/photo-1594824478529-e68776d1517f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Female doctor
  "https://images.unsplash.com/photo-1576091160550-2173dba99932?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Male doctor
  "https://images.unsplash.com/photo-1584516150904-a7597251f776?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Female doctor
  "https://images.unsplash.com/photo-1576091160399-c5050769670f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Male doctor
];

const SPECIALIZATIONS = [
  "Cardiology", "Neurology", "Pediatrics", "Dermatology", "Orthopedics",
  "Oncology", "Gastroenterology", "Endocrinology", "Pulmonology", "Nephrology",
  "Ophthalmology", "ENT", "Psychiatry", "General Practice"
];

const LOCATIONS = [
  "Main Branch Hospital", "Downtown Clinic", "Uptown Medical Center",
  "Community Health Center", "Eastside Clinic", "Westwood Hospital"
];

const GENDERS = ["male", "female"];

const generateDoctor = (id: number): Doctor => {
  const name = DOCTOR_NAMES[id - 1]; // Use specific names
  const gender = name.includes("Dr. Sarah") || name.includes("Dr. Emily") || name.includes("Dr. Sofia") || name.includes("Dr. Iqra") || name.includes("Dr. Jessica") || name.includes("Dr. Maria") || name.includes("Dr. Linda") || name.includes("Dr. Nancy") || name.includes("Dr. Karen") || name.includes("Dr. Dorothy") || name.includes("Dr. Sandra") || name.includes("Dr. Ashley") || name.includes("Dr. Laura") ? "female" : "male";
  const specialization = SPECIALIZATIONS[(id - 1) % SPECIALIZATIONS.length];
  const experience = 5 + ((id - 1) % 15); // 5 to 19 years
  const fees = 80 + ((id - 1) % 10) * 10; // 80 to 170
  const location = LOCATIONS[(id - 1) % LOCATIONS.length];
  const profilePhotoUrl = DOCTOR_IMAGES[(id - 1) % DOCTOR_IMAGES.length];
  const averageRating = (3.5 + ((id - 1) % 10) * 0.1).toFixed(1); // 3.5 to 4.4
  const reviewsCount = 50 + ((id - 1) % 100);

  const availabilitySchedule: { [key: string]: string } = {
    monday: "9:00 AM - 5:00 PM",
    tuesday: "9:00 AM - 5:00 PM",
    wednesday: "9:00 AM - 1:00 PM",
    thursday: "9:00 AM - 5:00 PM",
    friday: "9:00 AM - 5:00 PM",
    saturday: "Closed",
    sunday: "Closed",
  };

  const realtimeStatusOptions: ("Online" | "In Clinic" | "Off")[] = ["Online", "In Clinic", "Off"];
  const realtimeStatus = realtimeStatusOptions[(id - 1) % realtimeStatusOptions.length];

  const availabilityStatus = realtimeStatus === "Online" ? "Now Available" :
                             realtimeStatus === "In Clinic" ? "In Clinic" :
                             "Next Available Slot: Tomorrow, 9 AM"; // Simplified for listing

  return {
    id: id.toString(),
    name,
    specialization,
    qualifications: ["MBBS", `MD ${specialization}`, "FCPS"],
    experience,
    hospital: location,
    consultationFee: fees,
    languages: ["English", ((id - 1) % 2 === 0 ? "Spanish" : "French")],
    contactEmail: `${name.toLowerCase().replace(/dr\.\s/g, "").replace(/\s/g, ".")}@hospital.com`,
    bio: `${name} is a dedicated ${specialization.toLowerCase()} with ${experience} years of experience. They are committed to providing patient-centered care with a focus on long-term health.`,
    availabilitySchedule,
    realtimeStatus,
    averageRating: parseFloat(averageRating),
    reviewsCount,
    profilePhotoUrl,
    location,
    gender,
    availabilityStatus,
  };
};

export const ALL_DOCTORS: Doctor[] = Array.from({ length: 30 }, (_, i) => generateDoctor(i + 1));

// For the Home page, we might want a smaller, curated list
export const TOP_DOCTORS: Doctor[] = ALL_DOCTORS.slice(0, 6);