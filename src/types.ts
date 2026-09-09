export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface ProfessionalProfile {
  id: number;
  user_id: number;
  profile_picture?: string;
  professional_name: string;
  city: string;
  area: string;
  skills: string;
  service_category: string;
  short_description: string;
  experience: string;
  portfolio?: string;
  expected_price?: number;
  is_hidden: boolean;
  created_at?: string;
  user_email?: string;
}

export interface CollaborationRequest {
  id: number;
  sender_id: number;
  professional_id: number;
  service: string;
  message: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  created_at: string;
  sender_name?: string;
  sender_email?: string;
  professional_name?: string;
  city?: string;
  area?: string;
}

export interface SearchFilters {
  service_category?: string;
  skill?: string;
  city?: string;
  area?: string;
}
