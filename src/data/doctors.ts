import { supabase } from "@/integrations/supabase/client";

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualifications: string[];
  experience: number;
  hospital: string;
  consultation_fee: number; // Changed to match DB column name
  languages: string[];
  contact_email: string; // Changed to match DB column name
  bio: string;
  availability_schedule: { [key: string]: string }; // JSONB in DB
  realtime_status: "Online" | "In Clinic" | "Off"; // Changed to match DB column name
  average_rating: number;
  reviews_count: number; // Changed to match DB column name
  profile_photo_url: string; // Changed to match DB column name
  location: string;
  gender: "male" | "female" | "other";
  availability_status: string; // Simplified status for listing page
}

export async function fetchAllDoctors(): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('doctors')
    .select('*');

  if (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }

  // Map DB column names to frontend interface names if necessary
  return data.map(doc => ({
    id: doc.id,
    name: doc.name,
    specialization: doc.specialization,
    qualifications: doc.qualifications,
    experience: doc.experience,
    hospital: doc.hospital,
    consultation_fee: doc.consultation_fee, // Corrected to snake_case
    languages: doc.languages,
    contact_email: doc.contact_email, // Corrected to snake_case
    bio: doc.bio,
    availability_schedule: doc.availability_schedule,
    realtime_status: doc.realtime_status,
    average_rating: doc.average_rating,
    reviews_count: doc.reviews_count,
    profile_photo_url: doc.profile_photo_url,
    location: doc.location,
    gender: doc.gender,
    availability_status: doc.availability_status,
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
    consultation_fee: data.consultation_fee, // Corrected to snake_case
    languages: data.languages,
    contact_email: data.contact_email, // Corrected to snake_case
    bio: data.bio,
    availability_schedule: data.availability_schedule,
    realtime_status: data.realtime_status,
    average_rating: data.average_rating,
    reviews_count: data.reviews_count,
    profile_photo_url: data.profile_photo_url,
    location: data.location,
    gender: data.gender,
    availability_status: data.availability_status,
  };
}

// Export empty arrays for now, components will use the async fetch functions
export const ALL_DOCTORS: Doctor[] = [];
export const TOP_DOCTORS: Doctor[] = [];