export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  publishedAt: string;
  customUrl?: string;
}

export interface YouTubeSubscription {
  id: string;
  channelId: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: number;
  subscribedAt: string;
  categoryIds: string[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  user: GoogleUser | null;
}

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface CachedData<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
}

export interface AppState {
  subscriptions: YouTubeSubscription[];
  categories: Category[];
  selectedChannels: Set<string>;
  isLoading: boolean;
  error: string | null;
  sortBy: 'name' | 'subscribers' | 'date';
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
  selectedCategories: string[];
}

export interface BatchOperation {
  type: 'unsubscribe';
  channelIds: string[];
  progress: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  errors: string[];
}