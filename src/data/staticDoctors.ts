export interface StaticDoctor {
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
  realtimeStatus: "Online" | "In Clinic" | "Off" | "Available Today" | "Available Tomorrow" | "Available Now";
  averageRating: number;
  reviewsCount: number;
  profilePhotoUrl: string;
  location: string;
  gender: "male" | "female" | "other";
  availabilityStatus: string;
}

export const STATIC_DOCTORS: StaticDoctor[] = [
  {
    id: "1",
    name: "Dr. James Griffith",
    specialization: "Cardiology",
    qualifications: ["MD", "FACC"],
    experience: 15,
    hospital: "Main Branch Hospital",
    consultationFee: 150,
    languages: ["English", "Spanish"],
    contactEmail: "j.griffith@hospital.com",
    bio: "Dr. Griffith is a renowned cardiologist with over 15 years of experience. He specializes in interventional cardiology and has performed over 2000 cardiac procedures.",
    availabilitySchedule: {
      monday: "9:00 AM - 5:00 PM",
      tuesday: "9:00 AM - 5:00 PM",
      wednesday: "9:00 AM - 5:00 PM",
      thursday: "9:00 AM - 5:00 PM",
      friday: "9:00 AM - 3:00 PM",
      saturday: "10:00 AM - 2:00 PM",
      sunday: "Closed"
    },
    realtimeStatus: "Available Now",
    averageRating: 4.8,
    reviewsCount: 127,
    profilePhotoUrl: "/images/doctor-placeholder.jpg",
    location: "Main Branch Hospital",
    gender: "male",
    availabilityStatus: "Available Now"
  },
  {
    id: "2",
    name: "Dr. Sofia Khan",
    specialization: "Pediatrics",
    qualifications: ["MD", "FAAP"],
    experience: 12,
    hospital: "Children's Medical Center",
    consultationFee: 120,
    languages: ["English", "Urdu", "Hindi"],
    contactEmail: "s.khan@hospital.com",
    bio: "Dr. Khan is a compassionate pediatrician with a special interest in childhood nutrition and development. She has been serving the community for over a decade.",
    availabilitySchedule: {
      monday: "8:00 AM - 4:00 PM",
      tuesday: "8:00 AM - 4:00 PM",
      wednesday: "8:00 AM - 4:00 PM",
      thursday: "8:00 AM - 4:00 PM",
      friday: "8:00 AM - 2:00 PM",
      saturday: "Closed",
      sunday: "Closed"
    },
    realtimeStatus: "Online",
    averageRating: 4.9,
    reviewsCount: 98,
    profilePhotoUrl: "/images/doctor-placeholder.jpg",
    location: "Children's Medical Center",
    gender: "female",
    availabilityStatus: "Available Today"
  },
  {
    id: "3",
    name: "Dr. David Vaccum",
    specialization: "Neurology",
    qualifications: ["MD", "PhD", "FNCS"],
    experience: 18,
    hospital: "Main Branch Hospital",
    consultationFee: 180,
    languages: ["English", "French"],
    contactEmail: "d.vaccum@hospital.com",
    bio: "Dr. Vaccum is a leading neurologist specializing in movement disorders and neurodegenerative diseases. He has contributed to numerous research publications in his field.",
    availabilitySchedule: {
      monday: "Closed",
      tuesday: "10:00 AM - 6:00 PM",
      wednesday: "10:00 AM - 6:00 PM",
      thursday: "10:00 AM - 6:00 PM",
      friday: "10:00 AM - 4:00 PM",
      saturday: "11:00 AM - 3:00 PM",
      sunday: "Closed"
    },
    realtimeStatus: "In Clinic",
    averageRating: 4.7,
    reviewsCount: 86,
    profilePhotoUrl: "/images/doctor-placeholder.jpg",
    location: "Main Branch Hospital",
    gender: "male",
    availabilityStatus: "Available Tomorrow"
  },
  {
    id: "4",
    name: "Dr. Emily White",
    specialization: "Dermatology",
    qualifications: ["MD", "FAAD"],
    experience: 10,
    hospital: "Downtown Clinic",
    consultationFee: 140,
    languages: ["English", "Spanish"],
    contactEmail: "e.white@hospital.com",
    bio: "Dr. White specializes in both medical and cosmetic dermatology. She is particularly skilled in laser treatments and skin cancer detection.",
    availabilitySchedule: {
      monday: "9:00 AM - 5:00 PM",
      tuesday: "9:00 AM - 5:00 PM",
      wednesday: "9:00 AM - 5:00 PM",
      thursday: "9:00 AM - 5:00 PM",
      friday: "9:00 AM - 3:00 PM",
      saturday: "10:00 AM - 2:00 PM",
      sunday: "Closed"
    },
    realtimeStatus: "Available Now",
    averageRating: 4.9,
    reviewsCount: 112,
    profilePhotoUrl: "/images/doctor-placeholder.jpg",
    location: "Downtown Clinic",
    gender: "female",
    availabilityStatus: "Available Now"
  },
  {
    id: "5",
    name: "Dr. Michael Brown",
    specialization: "Orthopedics",
    qualifications: ["MD", "FAOA"],
    experience: 20,
    hospital: "Joint Care Center",
    consultationFee: 160,
    languages: ["English"],
    contactEmail: "m.brown@hospital.com",
    bio: "Dr. Brown is an orthopedic surgeon with expertise in joint replacement and sports medicine. He has helped hundreds of patients return to active lifestyles.",
    availabilitySchedule: {
      monday: "8:00 AM - 4:00 PM",
      tuesday: "8:00 AM - 4:00 PM",
      wednesday: "8:00 AM - 4:00 PM",
      thursday: "8:00 AM - 4:00 PM",
      friday: "8:00 AM - 2:00 PM",
      saturday: "9:00 AM - 1:00 PM",
      sunday: "Closed"
    },
    realtimeStatus: "In Clinic",
    averageRating: 4.6,
    reviewsCount: 143,
    profilePhotoUrl: "/images/doctor-placeholder.jpg",
    location: "Joint Care Center",
    gender: "male",
    availabilityStatus: "Available Today"
  },
  {
    id: "6",
    name: "Dr. Sarah Chen",
    specialization: "Gynecology",
    qualifications: ["MD", "FACOG"],
    experience: 14,
    hospital: "Women's Health Center",
    consultationFee: 130,
    languages: ["English", "Mandarin"],
    contactEmail: "s.chen@hospital.com",
    bio: "Dr. Chen provides comprehensive women's health care with a focus on minimally invasive procedures and preventive care.",
    availabilitySchedule: {
      monday: "9:00 AM - 5:00 PM",
      tuesday: "9:00 AM - 5:00 PM",
      wednesday: "9:00 AM - 5:00 PM",
      thursday: "9:00 AM - 5:00 PM",
      friday: "9:00 AM - 3:00 PM",
      saturday: "Closed",
      sunday: "Closed"
    },
    realtimeStatus: "Available Today",
    averageRating: 4.8,
    reviewsCount: 105,
    profilePhotoUrl: "/images/doctor-placeholder.jpg",
    location: "Women's Health Center",
    gender: "female",
    availabilityStatus: "Available Today"
  }
];