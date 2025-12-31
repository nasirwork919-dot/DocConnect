import { supabase } from "@/integrations/supabase/client";

export interface Treatment {
  id: string;
  name: string;
  specialization: string;
  description: string;
  commonSymptoms: string[]; // Changed to match DB column name
  duration: string;
  costRange: string; // Changed to match DB column name
}

export async function fetchAllTreatments(): Promise<Treatment[]> {
  const { data, error } = await supabase
    .from('treatments')
    .select('*');

  if (error) {
    console.error("Error fetching treatments:", error);
    return [];
  }

  return data.map(treatment => ({
    id: treatment.id,
    name: treatment.name,
    specialization: treatment.specialization,
    description: treatment.description,
    commonSymptoms: treatment.common_symptoms,
    duration: treatment.duration,
    costRange: treatment.cost_range,
  }));
}

export async function fetchTreatmentById(id: string): Promise<Treatment | null> {
  const { data, error } = await supabase
    .from('treatments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching treatment with ID ${id}:`, error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    specialization: data.specialization,
    description: data.description,
    commonSymptoms: data.common_symptoms,
    duration: data.duration,
    costRange: data.cost_range,
  };
}

// Export empty array for now, components will use the async fetch function
export const ALL_TREATMENTS: Treatment[] = [];