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
  "https://i.pinimg.com/564x/01/11/6e/01116e24131211112111111111111111.jpg", // Female doctor
  "https://i.pinimg.com/564x/02/22/7e/02227e24131211111111111111111111.jpg", // Male doctor
  "https://i.pinimg.com/564x/03/33/8f/03338f24131211111111111111111111.jpg", // Female doctor
  "https://i.pinimg.com/564x/04/44/9e/04449e24131211111111111111111111.jpg", // Male doctor
  "https://i.pinimg.com/564x/05/55/ae/0555ae24131211111111111111111111.jpg", // Female doctor
  "https://i.pinimg.com/564x/06/66/bf/0666bf24131211111111111111111111.jpg", // Male doctor
  "https://i.pinimg.com/564x/07/77/cf/0777cf24131211111111111111111111.jpg", // Female doctor
  "https://i.pinimg.com/564x/08/88/de/0888de24131211111111111111111111.jpg", // Male doctor
  "https://i.pinimg.com/564x/09/99/ef/0999ef24131211111111111111111111.jpg", // Female doctor
  "https://i.pinimg.com/564x/10/00/fa/1000fa24131211111111111111111111.jpg", // Male doctor
  "https://i.pinimg.com/564x/11/11/1b/11111b24131211111111111111111111.jpg", // Female doctor
  "https://i.pinimg.com/564x/12/22/2c/12222c24131211111111111111111111.jpg", // Male doctor
  "https://i.pinimg.com/564x/13/33/3d/13333d24131211111111111111111111.jpg", // Female doctor
  "https://i.pinimg.com/564x/14/44/4e/14444e24131211111111111111111111.jpg", // Male doctor
  "https://i.pinimg.com/564x/15/55/5f/15555f24131211111111111111111111.jpg", // Female doctor
  "https://i.pinimg.com/564x/16/66/6a/16666a24131211111111111111111111.jpg", // Male doctor
  "https://i.pinimg.com/564x/17/77/7b/17777b24131211111111111111111111.jpg", // Female doctor
  "https://i.pinimg.com/564x/18/88/8c/18888c24131211111111111111111111.jpg", // Male doctor
  "https://i.pinimg.com/564x/19/99/9d/19999d24131211111111111111111111.jpg", // Female doctor
  "https://i.pinimg.com/564x/20/00/0e/20000e24131211111111111111111111.jpg", // Male doctor
  "https://i.pinimg.com/564x/21/11/1f/21111f24131211111111111111111111.jpg", // Female doctor
  "https://i.pinimg.com/564x/22/22/2a/22222a24131211111111111111111111.jpg", // Male doctor
  "https://i.pinimg.com/564x/23/33/3b/23333b24131211111111111111111111.jpg", // Female doctor
  "https://i.pinimg.com/564x/24/44/4c/24444c24131211111111111111111111.jpg", // Male doctor
  "https://i.pinimg.com/564x/25/55/5d/25555d24131211111111111111111111.jpg", // Female doctor
  "https://i.pinimg.com/564x/26/66/6e/26666e24131211111111111111111111.jpg", // Male doctor
  "https://i.pinimg.com/564x/27/77/7f/27777f24131211111111111111111111.jpg", // Female doctor
  "https://i.pinimg.com/564x/28/88/8a/28888a24131211111111111111111111.jpg", // Male doctor
  "https://i.pinimg.com/564x/29/99/9b/29999b24131211111111111111111111.jpg", // Female doctor
  "https://i.pinimg.com/564x/30/00/0c/30000c24131211111111111111111111.jpg", // Male doctor
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
  // Determine gender based on name for better consistency with images
  const femaleNames = ["Dr. Sofia Khan", "Dr. Iqra Ahmed", "Dr. Emily White", "Dr. Sarah Chen", "Dr. Jessica Lee", "Dr. Maria Garcia", "Dr. Linda Rodriguez", "Dr. Susan Hernandez", "Dr. Nancy Gonzalez", "Dr. Karen Anderson", "Dr. Betty Thomas", "Dr. Dorothy White", "Dr. Sandra Martin", "Dr. Ashley Moore", "Dr. Laura Lewis"];
  const gender = femaleNames.includes(name) ? "female" : "male";

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