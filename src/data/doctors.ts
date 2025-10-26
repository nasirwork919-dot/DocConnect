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

const generateAvailability = (doctorId: string) => {
  const availability: { [key: string]: string[] } = {};
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const formattedDate = format(date, "yyyy-MM-dd");
    const dayOfWeek = format(date, "EEEE").toLowerCase();

    let slots: string[] = [];
    if (dayOfWeek === "saturday" || dayOfWeek === "sunday") {
      slots = []; // Closed on weekends for most
    } else {
      // Vary slots based on doctor ID for some diversity
      if (parseInt(doctorId) % 3 === 0) {
        slots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"];
      } else if (parseInt(doctorId) % 3 === 1) {
        slots = ["08:00 AM", "09:00 AM", "12:00 PM", "01:00 PM", "04:00 PM"];
      } else {
        slots = ["10:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"];
      }
    }
    availability[formattedDate] = slots;
  }
  return availability;
};

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
  const gender = GENDERS[id % GENDERS.length] as "male" | "female";
  const namePrefix = gender === "male" ? "Dr. John" : "Dr. Sarah";
  const nameSuffix = ["Smith", "Doe", "Chen", "Brown", "Lee", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"][id % 10];
  const name = `${namePrefix} ${nameSuffix} ${id}`;
  const specialization = SPECIALIZATIONS[id % SPECIALIZATIONS.length];
  const experience = 5 + (id % 15); // 5 to 19 years
  const fees = 80 + (id % 10) * 10; // 80 to 170
  const location = LOCATIONS[id % LOCATIONS.length];
  const profilePhotoUrl = DOCTOR_IMAGES[id % DOCTOR_IMAGES.length];
  const averageRating = (3.5 + (id % 10) * 0.1).toFixed(1); // 3.5 to 4.4
  const reviewsCount = 50 + (id % 100);

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
  const realtimeStatus = realtimeStatusOptions[id % realtimeStatusOptions.length];

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
    languages: ["English", (id % 2 === 0 ? "Spanish" : "French")],
    contactEmail: `${name.toLowerCase().replace(/\s/g, ".")}@hospital.com`,
    bio: `Dr. ${nameSuffix} is a dedicated ${specialization.toLowerCase()} with ${experience} years of experience. They are committed to providing patient-centered care with a focus on long-term health.`,
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

export const ALL_DOCTORS: Doctor[] = Array.from({ length: 50 }, (_, i) => generateDoctor(i + 1));

// For the Home page, we might want a smaller, curated list
export const TOP_DOCTORS: Doctor[] = ALL_DOCTORS.slice(0, 6);