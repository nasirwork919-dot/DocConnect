import { supabase } from "@/integrations/supabase/client";
import { StaticDoctor as Doctor } from "./staticDoctors";

export type { Doctor };

function mapDoctor(d: any): Doctor {
  return {
    id: d.id,
    name: d.name,
    specialization: d.specialization,
    qualifications: d.qualifications || [],
    experience: d.experience,
    hospital: d.hospital,
    consultationFee: d.consultation_fee,
    languages: d.languages || [],
    contactEmail: d.contact_email,
    bio: d.bio,
    availabilitySchedule: d.availability_schedule || {},
    realtimeStatus: d.realtime_status,
    averageRating: d.average_rating,
    reviewsCount: d.reviews_count,
    profilePhotoUrl: d.profile_photo_url || '/images/doctor-placeholder.jpg',
    location: d.location,
    gender: d.gender,
    availabilityStatus: d.availability_status,
  };
}

export async function fetchAllDoctors(): Promise<Doctor[]> {
  const { data, error } = await supabase.from('doctors').select('*');
  if (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }
  return data.map(mapDoctor);
}

export async function fetchDoctorById(id: string): Promise<Doctor | null> {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return mapDoctor(data);
}

export const ALL_DOCTORS: Doctor[] = [];
export const TOP_DOCTORS: Doctor[] = [];
