import { STATIC_DOCTORS, StaticDoctor as Doctor } from "./staticDoctors";

export type { Doctor };

export async function fetchAllDoctors(): Promise<Doctor[]> {
  // Simulate async operation
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(STATIC_DOCTORS);
    }, 100);
  });
}

export async function fetchDoctorById(id: string): Promise<Doctor | null> {
  // Simulate async operation
  return new Promise(resolve => {
    setTimeout(() => {
      const doctor = STATIC_DOCTORS.find(doc => doc.id === id) || null;
      resolve(doctor);
    }, 100);
  });
}

// Export arrays for backward compatibility
export const ALL_DOCTORS: Doctor[] = STATIC_DOCTORS;
export const TOP_DOCTORS: Doctor[] = [...STATIC_DOCTORS]
  .sort((a, b) => b.averageRating - a.averageRating)
  .slice(0, 3);