export enum Language {
  AR = 'ar',
  EN = 'en',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum ReportCategory {
  Roads = 'roads',
  Waste = 'waste',
  Lighting = 'lighting',
  Other = 'other',
}

export enum ReportStatus {
  New = 'new',
  Received = 'received',
  InProgress = 'in_progress',
  Resolved = 'resolved',
}

export enum Credibility {
    Pending = 'Pending',
    Pass = 'Pass',
    NeedsReview = 'Needs Review',
}

export interface Report {
  id: string;
  photo_urls: string[];
  lat: number;
  lng: number;
  area: string;
  category: ReportCategory;
  note: string;
  status: ReportStatus;
  confirmations_count: number;
  created_at: string;
  created_by: string; // userId
}

export interface User {
  id: string;
  username: string; // for login, undefined for anonymous
  first_name: string; // undefined for anonymous
  last_name: string; // undefined for anonymous
  display_name: string; // "First Last" or "Anonymous#1234"
  is_anonymous: boolean;
  password_hash?: string;
  salt?: string;
  points: number;
  achievements: string[]; // array of badge ids
  reports_count: number;
  reportsConfirmed: number;
  created_at: string; // ISO
  avatarUrl: string;
}


export enum NotificationType {
  StatusChange = 'status_change',
  Badge = 'badge',
  Confirm = 'confirm',
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  message_ar: string;
  message_en: string;
  report_id: string | null;
  created_at: string;
  read: boolean;
}

export interface Badge {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  icon: string; // The character or identifier for the icon
}