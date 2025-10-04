import * as React from 'react';
import L from 'leaflet';

export enum Language {
  AR = 'ar',
  EN = 'en',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

// FIX: Broke a circular dependency by defining ReportCategory as a static union type
// instead of deriving it from the CATEGORIES constant. This was causing a white screen on load.
export type ReportCategory =
  | 'infrastructure'
  | 'electricity_energy'
  | 'water_sanitation'
  | 'waste_environment'
  | 'public_safety'
  | 'public_spaces'
  | 'public_health'
  | 'urban_planning'
  | 'transportation'
  | 'emergencies'
  | 'transparency_services'
  | 'other_unknown';


export enum ReportStatus {
  New = 'new',
  Received = 'received',
  InProgress = 'in_progress',
  Resolved = 'resolved',
}

export enum ReportSeverity {
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

export enum TimeFilter {
  All = 'all',
  Day = 'day',
  Week = 'week',
  Month = 'month',
}

export enum LeaderboardFilter {
  All = 'all',
  Month = 'month',
  Week = 'week',
}

export enum Credibility {
    Pending = 'Pending',
    Pass = 'Pass',
    NeedsReview = 'Needs Review',
}

export interface Report {
  id: string;
  title_en: string;
  title_ar: string;
  photo_urls: string[];
  lat: number;
  lng: number;
  area: string;
  municipality: string; // AI-detected municipality
  category: ReportCategory;
  sub_category?: string; // e.g. 'damaged_roads'
  note_en: string;
  note_ar: string;
  status: ReportStatus;
  severity: ReportSeverity;
  confirmations_count: number;
  created_at: string;
  created_by: string; // userId
  isPending?: boolean; // For offline submissions
  timestamp?: number; // For IDB key
  subscribedUserIds?: string[]; // array of userIds
}

export type PendingReportData = Omit<Report, 'id' | 'created_at' | 'status' | 'confirmations_count'> & { timestamp: number };

export interface User {
  id: string;
  username: string; // for login, undefined for anonymous
  first_name: string; // undefined for anonymous
  last_name: string; // undefined for anonymous
  display_name: string; // "First Last" or "Anonymous#1234"
  is_anonymous: boolean;
  password_hash?: string;
  password_plain?: string;
  salt?: string;
  points: number;
  achievements: string[]; // array of badge ids
  reports_count: number;
  reportsConfirmed: number;
  confirmedReportIds?: string[]; // array of report ids
  subscribedReportIds?: string[]; // array of report ids
  created_at: string; // ISO
  avatarUrl: string;
  onboarding_complete?: boolean;
  role: 'citizen' | 'municipality' | 'super_admin';
  municipality_id?: string; // e.g., 'beirut'
}


export enum NotificationType {
  StatusChange = 'status_change',
  Badge = 'badge',
  Confirm = 'confirm',
  NewFollower = 'new_follower',
  NewComment = 'new_comment',
  ProofRequest = 'proof_request',
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  report_id: string | null;
  created_at: string;
  read: boolean;
  metadata: { [key: string]: string }; // E.g., { reportTitle: '...', newStatus: 'in_progress' }
}

export interface Badge {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  // FIX: Changed icon type to React.ReactNode to allow JSX elements.
  icon: React.ReactNode; // The character or identifier for the icon
}

export interface SearchSuggestion {
  type: 'area' | 'report';
  text: string; // The text to display in the suggestion item (e.g., Area name or Report title)
  query: string; // The text to put into the search bar when clicked
  id?: string; // Report ID if type is 'report'
}

export interface Comment {
  id: string;
  report_id: string;
  user_id: string;
  text: string;
  created_at: string;
}

export interface ReportHistory {
  id: string;
  report_id: string;
  status: ReportStatus;
  updated_at: string;
}

// FIX: Added Preview interface to be globally available.
export interface Preview {
    file: File;
    url: string;
    type: 'image' | 'video';
    status: 'pending' | 'valid' | 'rejected';
    rejectionReason?: string;
}

// --- Report Wizard Types ---
// FIX: Moved from ReportWizardPage.tsx to break circular dependency
export type AiVerificationStatus = 'pending' | 'pass' | 'fail' | 'images_removed' | 'idle';

export interface ReportData {
    category: ReportCategory | null;
    sub_category: string | null;
    previews: Preview[];
    location: L.LatLngTuple | null;
    address: string;
    title: string;
    description: string;
    municipality: string;
    withMedia: boolean | null;
    severity: ReportSeverity | null;
}