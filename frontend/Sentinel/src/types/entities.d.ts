// Usuario
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
}

// Obra
export interface Construction {
  id: string;
  name: string;
  description: string;
  location: string;
  budget: number;
  start_date: string;
  end_date: string;
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "SUSPENDED";
  created_at: string;
  updated_at: string;
}

// Catálogo
export interface Catalog {
  id: string;
  name: string;
  description: string;
  construction: string;
  created_at: string;
  updated_at: string;
}

// Partida
export interface WorkItem {
  id: string;
  name: string;
  description: string;
  catalog: string;
  created_at: string;
  updated_at: string;
}

// Concepto
export interface Concept {
  id: string;
  code: string;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  work_item: string;
  created_at: string;
  updated_at: string;
}

// Cronograma
export interface Schedule {
  id: string;
  name: string;
  description: string;
  construction: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Actividad
export interface Activity {
  id: string;
  name: string;
  description: string;
  schedule: string;
  start_date: string;
  end_date: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

// Avance Físico
export interface Physical {
  id: string;
  concept: string;
  date: string;
  quantity: number;
  progress_percentage: number;
  notes: string;
  photos: string[];
  created_at: string;
  updated_at: string;
}

// Estimación
export interface Estimation {
  id: string;
  construction: string;
  number: number;
  date: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  total_amount: number;
  created_at: string;
  updated_at: string;
}

// Detalle de Estimación
export interface EstimationDetail {
  id: string;
  estimation: string;
  concept: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: string;
  updated_at: string;
}
export interface AdvanceRegistration {
  construction_id: string;
  concept_id: string;
  quantity: number;
  is_completed: boolean;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface AdvancePhoto {
  id: string;
  url: string;
  thumbnail_url: string;
  created_at: string;
}

export interface PhysicalAdvance {
  id: string;
  construction_id: string;
  construction_name: string;
  concept_id: string;
  concept_code: string;
  concept_name: string;
  concept_unit: string;
  quantity: number;
  is_completed: boolean;
  notes: string;
  latitude: number | null;
  longitude: number | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approval_date: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  created_by_name: string;
  approved_by: string | null;
  approved_by_name: string | null;
  photos: AdvancePhoto[];
  program_status: "on_schedule" | "ahead" | "delayed";
}

export interface PhysicalAdvanceSummary {
  construction_id: string;
  total_advances: number;
  pending_advances: number;
  approved_advances: number;
  rejected_advances: number;
  total_concepts: number;
  completed_concepts: number;
  physical_progress_percentage: number;
  financial_progress_percentage: number;
  last_advance_date: string | null;
}

// Nueva interfaz que coincide con la respuesta real de la API
export interface PhysicalAdvanceResponse {
  id: number;
  concept: number;
  volume: string;
  date: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  comments: string | null;
}

// Tipos adicionales para la entidad UserConstruction
export interface UserRole {
  id: string;
  name: string;
  description: string;
}

export interface UserDetails {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  outter_id: string | null;
  roles: string[];
  is_active: boolean;
}

export interface UserConstruction {
  id: string;
  user: string;
  construction: string;
  role: string;
  is_active: boolean;
  asignation_date: string;
  user_details: UserDetails;
  role_details: UserRole;
  construction_details: Construction;
}
