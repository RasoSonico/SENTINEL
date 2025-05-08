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
