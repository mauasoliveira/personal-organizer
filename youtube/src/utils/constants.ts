export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
export const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

export const OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube'
];

export const API_ENDPOINTS = {
  SUBSCRIPTIONS: 'https://www.googleapis.com/youtube/v3/subscriptions',
  CHANNELS: 'https://www.googleapis.com/youtube/v3/channels',
  SEARCH: 'https://www.googleapis.com/youtube/v3/search'
} as const;

export const CACHE_KEYS = {
  AUTH_STATE: 'yt_auth_state',
  SUBSCRIPTIONS: 'yt_subscriptions',
  CATEGORIES: 'yt_categories',
  USER_PREFERENCES: 'yt_user_preferences'
} as const;

export const CACHE_DURATION = {
  SUBSCRIPTIONS: 60 * 60 * 1000, // 1 hour
  CHANNEL_DETAILS: 24 * 60 * 60 * 1000, // 24 hours
  AUTH_STATE: 7 * 24 * 60 * 60 * 1000 // 7 days
} as const;

export const API_QUOTA_COSTS = {
  LIST_SUBSCRIPTIONS: 1,
  DELETE_SUBSCRIPTION: 50,
  GET_CHANNEL_DETAILS: 1
} as const;

export const BATCH_SIZE = 20; // Maximum channels to process in one batch
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1 second

export const DEFAULT_CATEGORIES = [
  { id: 'tech', name: 'Technology', color: '#3B82F6' },
  { id: 'gaming', name: 'Gaming', color: '#EF4444' },
  { id: 'education', name: 'Education', color: '#10B981' },
  { id: 'entertainment', name: 'Entertainment', color: '#F59E0B' },
  { id: 'music', name: 'Music', color: '#8B5CF6' },
  { id: 'news', name: 'News', color: '#6B7280' }
];