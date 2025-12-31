import { supabase } from "@/integrations/supabase/client";

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
  realtimeStatus: "Online" | "In Clinic" | "Off" | "Available Today" | "Available Tomorrow" | "Available Now";
  averageRating: number;
  reviewsCount: number;
  profilePhotoUrl: string;
  location: string;
  gender: "male" | "female" | "other";
  availabilityStatus: string;
}

export async function fetchAllDoctors(): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .order('name');

  if (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }

  return data.map((doc: any) => ({
    id: doc.id,
    name: doc.name,
    specialization: doc.specialization,
    qualifications: doc.qualifications || [],
    experience: doc.experience || 0,
    hospital: doc.hospital || "",
    consultationFee: doc.consultation_fee || 0,
    languages: doc.languages || [],
    contactEmail: doc.contact_email || "",
    bio: doc.bio || "No bio available",
    availabilitySchedule: doc.availability_schedule || {},
    realtimeStatus: doc.realtime_status || "Off",
    averageRating: doc.average_rating || 0,
    reviewsCount: doc.reviews_count || 0,
    profilePhotoUrl: doc.profile_photo_url || "/images/doctor-placeholder.jpg",
    location: doc.location || "Not specified",
    gender: doc.gender || "other",
    availabilityStatus: doc.availability_status || "Not available"
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
    qualifications: data.qualifications || [],
    experience: data.experience || 0,
    hospital: data.hospital || "",
    consultationFee: data.consultation_fee || 0,
    languages: data.languages || [],
    contactEmail: data.contact_email || "",
    bio: data.bio || "No bio available",
    availabilitySchedule: data.availability_schedule || {},
    realtimeStatus: data.realtime_status || "Off",
    averageRating: data.average_rating || 0,
    reviewsCount: data.reviews_count || 0,
    profilePhotoUrl: data.profile_photo_url || "/images/doctor-placeholder.jpg",
    location: data.location || "Not specified",
    gender: data.gender || "other",
    availabilityStatus: data.availability_status || "Not available"
  };
}

// Export empty arrays for backward compatibility
export const ALL_DOCTORS: Doctor[] = [];
export const TOP_DOCTORS: Doctor[] = [];