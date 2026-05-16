export type UserRole = "customer" | "provider" | "admin";

export type JobStatus = "open" | "in_progress" | "closed";
export type JobTimeframe = "asap" | "specific_date" | "flexible";

export interface Job {
  id: string;
  client_id: string;
  title: string;
  category: string;
  description: string;
  city: string;
  budget: number | null;
  timeframe: JobTimeframe;
  scheduled_date: string | null;
  photo_urls: string[];
  status: JobStatus;
  created_at: string;
  updated_at: string;
  profiles: { full_name: string; avatar_url: string | null } | null;
}

export type BookingStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed";

export type VerificationStatus = "unverified" | "pending" | "verified";

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  phone?: string;
  location?: string;
  created_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  gradient: string;
  count: number;
  description: string;
  photoUrl?: string;
}

export interface Provider {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string;
  cover_url?: string;
  bio: string;
  tagline: string;
  categories: string[];
  skills: string[];
  hourly_rate: number;
  location: string;
  city: string;
  rating: number;
  review_count: number;
  job_count: number;
  response_time: string;
  verification_status: VerificationStatus;
  badges: string[];
  is_available: boolean;
  is_featured: boolean;
  portfolio: PortfolioItem[];
  availability: string[];
  joined_at: string;
  languages: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  image_url: string;
  description?: string;
}

export interface Service {
  id: string;
  provider_id: string;
  category: string;
  title: string;
  description: string;
  price: number;
  price_type: "fixed" | "hourly" | "quote";
  duration_estimate: string;
  includes: string[];
  image_url?: string;
  is_active: boolean;
  booking_count: number;
}

export interface Review {
  id: string;
  booking_id: string;
  provider_id: string;
  customer_id: string;
  customer_name: string;
  customer_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count: number;
  service_category: string;
}

export interface Booking {
  id: string;
  service_id: string;
  provider_id: string;
  customer_id: string;
  provider: Pick<Provider, "full_name" | "avatar_url" | "rating">;
  service_title: string;
  service_category: string;
  status: BookingStatus;
  scheduled_at: string;
  address: string;
  notes?: string;
  price: number;
  platform_fee: number;
  total: number;
  created_at: string;
  completed_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  last_message: string;
  last_message_at: string;
  unread_count: number;
  other_user: {
    id: string;
    name: string;
    avatar_url?: string;
    is_online?: boolean;
  };
}

export interface EarningsSummary {
  total_earned: number;
  this_month: number;
  last_month: number;
  pending_payout: number;
  completed_jobs: number;
  avg_job_value: number;
  growth_rate: number;
}

export interface AnalyticsData {
  date: string;
  earnings: number;
  bookings: number;
  views: number;
}

export interface PlatformStats {
  total_providers: number;
  total_customers: number;
  total_bookings: number;
  total_revenue: number;
  active_bookings: number;
  avg_rating: number;
}
