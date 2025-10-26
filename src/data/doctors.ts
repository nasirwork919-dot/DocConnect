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

// List of names that are considered female for image assignment
const FEMALE_NAMES_LIST = [
  "Dr. Sofia Khan", "Dr. Iqra Ahmed", "Dr. Emily White", "Dr. Sarah Chen", "Dr. Jessica Lee", "Dr. Maria Garcia",
  "Dr. Linda Rodriguez", "Dr. Susan Hernandez", "Dr. Nancy Gonzalez", "Dr. Karen Anderson", "Dr. Betty Thomas",
  "Dr. Dorothy White", "Dr. Sandra Martin", "Dr. Ashley Moore", "Dr. Laura Lewis"
];

const MALE_DOCTOR_IMAGES = [
  "https://i.pinimg.com/736x/79/f0/6c/79f06c1462a362cb5189edbd9818979f.jpg", // Dr. James Griffith
  "https://i.pinimg.com/1200x/28/90/51/28905133f922c06fd8a2c8a72ea3266a.jpg", // Dr. David Vaccum
  "https://i.pinimg.com/736x/b5/e9/d6/b5e9d6a4a3966294793ea168f87195c5.jpg", // Male
  "https://i.pinimg.com/736x/51/54/45/515445832654442910e127dda1259207.jpg", // Male
  "https://i.pinimg.com/736x/b8/35/57/b835576acca81f0fdf069a70b0a69977.jpg", // Male
  "https://i.pinimg.com/736x/a6/4c/61/a64c6182aed5ff10f869ff8d220f7ccf.jpg", // Male
  "https://i.pinimg.com/736x/ae/5d/9d/ae5d9d990004da2d73443e46963faa3f.jpg", // Male
  "https://i.pinimg.com/736x/a6/6f/df/a66fdfc5b159ceaa415a9329fea4f09a.jpg", // Male
  "https://i.pinimg.com/736x/ad/6c/b0/ad6cb07e44a5e63ffc89d7723b181052.jpg", // Male
  "https://i.pinimg.com/736x/03/aa/35/03aa3596a9d33cd5fb3c63c320f7d6df.jpg", // Male
  "https://i.pinimg.com/1200x/44/ce/39/44ce3959dea347f1e6c59e9066a8031c.jpg", // Male
  // Need 4 more male images
];

const FEMALE_DOCTOR_IMAGES = [
  "https://i.pinimg.com/736x/87/45/53/874553cbe71582d0e4288dfb1cbf048f.jpg", // Dr. Sofia Khan
  "https://i.pinimg.com/736x/c9/e0/b5/c9e0b5e45aad1de8e27b25ec6ce3cd27.jpg", // Dr. Iqra Ahmed
  "https://i.pinimg.com/736x/38/be/96/38be96d04d6aae282eb212337dd734e2.jpg", // Female
  "https://i.pinimg.com/736x/d7/68/23/d768232056cc54b7b9e9500ef231aadc.jpg", // Female
  "https://i.pinimg.com/736x/59/8c/80/598c809632f9de89259c069ef1d9bee8.jpg", // Female
  "https://i.pinimg.com/736x/4c/a6/e2/4ca6e2625541c9901c9d3dff74fac12e.jpg", // Female
  "https://i.pinimg.com/1200x/6c/0d/88/6c0d884d00a9a3ee52662ca5ab0d719b.jpg", // Female
  "https://i.pinimg.com/1200x/be/71/07/be71078a6a677f568b50333db8b673c9.jpg", // Female
  "https://i.pinimg.com/736x/e0/39/12/e039120e975b54c2b93485bd96a1b646.jpg", // Female
  "https://i.pinimg.com/736x/ea/a6/3e/eaa63e596382c84c3fdb128716e98ed5.jpg", // Female
  "https://i.pinimg.com/736x/52/a6/3d/52a63dab2ce268aea29aec113e731d0d.jpg", // Female
  "https://i.pinimg.com/1200x/34/4d/30/344d303af9d066d63bf050bb647f8d7e.jpg", // Female
  "https://i.pinimg.com/736x/2b/67/ea/2b67eab2f47654a38614999133170c4c.jpg", // Female
  "https://i.pinimg.com/736x/bf/0c/76/bf0c7651ee5d65b983eed068bbbba1c8.jpg", // Female
  "https://i.pinimg.com/1200x/14/7a/6f/147a6fcf596fc1893122612389611202.jpg", // Female
  "https://i.pinimg.com/736x/3b/59/88/3b59880120a5ce3405403916a302a430.jpg", // Female
  "https://i.pinimg.com/1200x/dc/6e/1f/dc6e1f9b8091e33c4ae22b0e4fdb00bf.jpg", // Female
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

const generateDoctor = (id: number): Doctor => {
  const name = DOCTOR_NAMES[id - 1];
  const gender: "male" | "female" = FEMALE_NAMES_LIST.includes(name) ? "female" : "male";

  const specialization = SPECIALIZATIONS[(id - 1) % SPECIALIZATIONS.length];
  const experience = 5 + ((id - 1) % 15); // 5 to 19 years
  const fees = 80 + ((id - 1) % 10) * 10; // 80 to 170
  const location = LOCATIONS[(id - 1) % LOCATIONS.length];

  let profilePhotoUrl: string;
  if (gender === "male") {
    profilePhotoUrl = MALE_DOCTOR_IMAGES[(id - 1) % MALE_DOCTOR_IMAGES.length];
  } else {
    profilePhotoUrl = FEMALE_DOCTOR_IMAGES[(id - 1) % FEMALE_DOCTOR_IMAGES.length];
  }

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