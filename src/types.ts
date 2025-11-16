import React from 'react';
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
  Week = 'week',
  Month = 'month',
  Day = 'day',
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
  // FIX: Changed category type to be more specific, fixing multiple type errors.
  category: ReportCategory; // Now an ID
  sub_category?: string; // Now an ID
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
  role: 'citizen' | 'municipality' | 'super_admin' | 'utility' | 'union_of_municipalities';
  portal_access_level?: 'read_write' | 'read_only';
  municipality_id?: string; // e.g., 'beirut'
  scoped_categories?: ReportCategory[]; // For 'utility' role
  scoped_municipalities?: string[]; // For 'utility' or 'union_of_municipalities' role
  scoped_sub_categories?: string[]; // For 'utility' role
  is_active?: boolean; // Added for user suspension/banning
  portal_title?: string;
  portal_subtitle?: string;
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
  updated_by_id?: string; // User ID of who made the change
  updated_by_name?: string; // Display name for quick access
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

export interface AIssue {
    title: string;
    description: string;
    category: ReportCategory | null;
    sub_category: string | null;
    severity: ReportSeverity | null;
}

export interface ReportData {
    // FIX: Changed category type to be more specific, fixing multiple type errors.
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
    // New fields for multi-report flow
    detectedIssues: AIssue[];
    multiReportSelection: Record<number, boolean>;
}

// --- Dynamic Configuration Types ---

export interface DynamicSubCategory {
  id: string;
  name_en: string;
  name_ar: string;
}

export interface DynamicCategory {
  id: ReportCategory; // 'infrastructure', etc.
  icon: string; // Icon name key, e.g., 'FaRoadBridge'
  color_light: string;
  color_dark: string;
  name_en: string;
  name_ar: string;
  is_active: boolean;
  subCategories: DynamicSubCategory[];
}

export type BadgeCriteriaType = 'report_count' | 'confirmation_count' | 'point_threshold';

export interface DynamicBadge {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  icon: string; // Icon name key, e.g., 'FaStar'
  is_active: boolean;
  criteria: {
    type: BadgeCriteriaType;
    value: number;
    category_filter?: string; // Optional category ID for criteria like report_count
  };
}

export type PointsRuleAction = 'submit_report' | 'confirm_report' | 'earn_badge';

export interface PointsRule {
    id: PointsRuleAction;
    points: number;
    description: string;
}

export interface GamificationSettings {
    id: 'default'; // Only one settings object
    pointsRules: PointsRule[];
}

// --- Audit Log ---
export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: User['role'];
  message: string;
}