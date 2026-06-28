import type { GoogleUser, AuthState } from '../types/youtube';
import { GOOGLE_CLIENT_ID, OAUTH_SCOPES, CACHE_KEYS } from '../utils/constants';

export class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    user: null
  };

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.loadAuthState();
  }

  async initializeGoogleAuth(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.google && window.google.accounts) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: this.handleCredentialResponse.bind(this),
            scope: OAUTH_SCOPES.join(' ')
          });
          resolve();
        } else {
          reject(new Error('Google Identity Services not loaded'));
        }
      };
      
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  private async handleCredentialResponse(response: any): Promise<void> {
    try {
      // Parse the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const user: GoogleUser = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture
      };

      // For now, we'll use the credential as a mock access token
      // In a real implementation, you'd exchange this for actual YouTube API tokens
      this.authState = {
        isAuthenticated: true,
        accessToken: response.credential,
        refreshToken: null,
        expiresAt: Date.now() + 3600000, // 1 hour
        user
      };

      this.saveAuthState();
      
      // Dispatch custom event for React components
      window.dispatchEvent(new CustomEvent('auth-state-changed', { 
        detail: { isAuthenticated: true, user } 
      }));
    } catch (error) {
      console.error('Error handling credential response:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }

  async signIn(): Promise<void> {
    if (!window.google || !window.google.accounts) {
      await this.initializeGoogleAuth();
    }

    return new Promise((resolve, reject) => {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error('Google sign-in prompt was not displayed or skipped'));
          } else {
            resolve();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  signOut(): void {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }

    this.authState = {
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      user: null
    };

    this.clearAuthState();
    
    window.dispatchEvent(new CustomEvent('auth-state-changed', { 
      detail: { isAuthenticated: false, user: null } 
    }));
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }

  getAccessToken(): string | null {
    if (this.authState.expiresAt && Date.now() > this.authState.expiresAt) {
      // Token expired, clear it
      this.authState.accessToken = null;
      this.authState.isAuthenticated = false;
      this.saveAuthState();
      return null;
    }
    return this.authState.accessToken;
  }

  isTokenExpired(): boolean {
    return !this.authState.expiresAt || Date.now() > this.authState.expiresAt;
  }

  private saveAuthState(): void {
    try {
      const dataToSave = {
        isAuthenticated: this.authState.isAuthenticated,
        refreshToken: this.authState.refreshToken,
        expiresAt: this.authState.expiresAt,
        user: this.authState.user
      };
      localStorage.setItem(CACHE_KEYS.AUTH_STATE, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  }

  private loadAuthState(): void {
    try {
      const saved = localStorage.getItem(CACHE_KEYS.AUTH_STATE);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Check if the saved state is still valid
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          this.authState = {
            ...parsed,
            accessToken: null // Don't store access token in localStorage for security
          };
        } else {
          this.clearAuthState();
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      this.clearAuthState();
    }
  }

  private clearAuthState(): void {
    try {
      localStorage.removeItem(CACHE_KEYS.AUTH_STATE);
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  }

  // Mock method for development - replace with actual OAuth2 flow
  async getValidToken(): Promise<string> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('No valid access token available');
    }
    return token;
  }
}

// Extend window interface for Google Identity Services
declare global {
  interface Window {
    google: any;
  }
}