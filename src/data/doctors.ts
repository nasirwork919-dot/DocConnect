import { supabase } from "@/integrations/supabase/client";

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualifications: string[];
  experience: number;
  hospital: string;
  consultationFee: number; // Changed to camelCase
  languages: string[];
  contactEmail: string; // Changed to camelCase
  bio: string;
  availabilitySchedule: { [key: string]: string }; // Changed to camelCase
  realtimeStatus: "Online" | "In Clinic" | "Off"; // Changed to camelCase
  averageRating: number; // Changed to camelCase
  reviewsCount: number; // Changed to camelCase
  profilePhotoUrl: string; // Changed to camelCase
  location: string;
  gender: "male" | "female" | "other";
  availabilityStatus: string; // Changed to camelCase
}

export async function fetchAllDoctors(): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('doctors')
    .select('*');

  if (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }

  return data.map(doc => ({
    id: doc.id,
    name: doc.name,
    specialization: doc.specialization,
    qualifications: doc.qualifications,
    experience: doc.experience,
    hospital: doc.hospital,
    consultationFee: doc.consultation_fee, // Map from snake_case DB to camelCase interface
    languages: doc.languages,
    contactEmail: doc.contact_email, // Map from snake_case DB to camelCase interface
    bio: doc.bio,
    availabilitySchedule: doc.availability_schedule, // Map from snake_case DB to camelCase interface
    realtimeStatus: doc.realtime_status, // Map from snake_case DB to camelCase interface
    averageRating: doc.average_rating, // Map from snake_case DB to camelCase interface
    reviewsCount: doc.reviews_count, // Map from snake_case DB to camelCase interface
    profilePhotoUrl: doc.profile_photo_url, // Map from snake_case DB to camelCase interface
    location: doc.location,
    gender: doc.gender,
    availabilityStatus: doc.availability_status, // Map from snake_case DB to camelCase interface
  }));
}

export async function fetchDoctorById(id: string): Promise<Doctor | null> {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching doctor with ID ${id}:`, error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    specialization: data.specialization,
    qualifications: data.qualifications,
    experience: data.experience,
    hospital: data.hospital,
    consultationFee: data.consultation_fee, // Map from snake_case DB to camelCase interface
    languages: data.languages,
    contactEmail: data.contact_email, // Map from snake_case DB to camelCase interface
    bio: data.bio,
    availabilitySchedule: data.availability_schedule, // Map from snake_case DB to camelCase interface
    realtimeStatus: data.realtime_status, // Map from snake_case DB to camelCase interface
    averageRating: data.average_rating, // Map from snake_case DB to camelCase interface
    reviewsCount: data.reviews_count, // Map from snake_case DB to camelCase interface
    profilePhotoUrl: data.profile_photo_url, // Map from snake_case DB to camelCase interface
    location: data.location,
    gender: data.gender,
    availabilityStatus: data.availability_status, // Map from snake_case DB to camelCase interface
  };
}

// Export empty arrays for now, components will use the async fetch functions
export const ALL_DOCTORS: Doctor[] = [];
export const TOP_DOCTORS: Doctor[] = [];