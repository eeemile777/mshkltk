/**
 * Real API Service
 * This file replaces mockApi.ts and connects to the actual backend server
 * 
 * REFACTOR NOTE: This file is now a barrel file that re-exports from modular services.
 * Please import directly from the specific service files in the future.
 */

export * from './core.service';
export * from './auth.service';
export * from './reports.service';
export * from './users.service';
export * from './comments.service';
export * from './notifications.service';
export * from './media.service';
export * from './config.service';
export * from './ai.service';
export * from './legacy.service';
