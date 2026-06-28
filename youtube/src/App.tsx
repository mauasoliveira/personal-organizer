import { useState, useEffect } from 'react';
import { AuthService } from './services/auth';
import { YouTubeService } from './services/youtube';
import { StorageService } from './services/storage';
import type { AuthState, YouTubeSubscription, Category, AppState } from './types/youtube';
import { DEFAULT_CATEGORIES, CACHE_KEYS } from './utils/constants';
import { UserMenu } from './components/UserMenu';
import { ChannelList } from './components/ChannelList';
import { BatchActions } from './components/BatchActions';
import { Sidebar } from './components/Sidebar';
import { SearchBar } from './components/SearchBar';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import './App.css';

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    user: null
  });

  const [appState, setAppState] = useState<AppState>({
    subscriptions: [],
    categories: [],
    selectedChannels: new Set(),
    isLoading: false,
    error: null,
    sortBy: 'name',
    sortOrder: 'asc',
    searchQuery: '',
    selectedCategories: []
  });

  const authService = AuthService.getInstance();
  const youtubeService = YouTubeService.getInstance();
  const storageService = StorageService.getInstance();

  // Initialize auth and load data on mount
  useEffect(() => {
    initializeApp();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthChange = (event: CustomEvent) => {
      setAuthState({
        ...authState,
        isAuthenticated: event.detail.isAuthenticated,
        user: event.detail.user
      });
      
      if (event.detail.isAuthenticated) {
        loadSubscriptions();
      }
    };

    window.addEventListener('auth-state-changed', handleAuthChange as EventListener);
    return () => window.removeEventListener('auth-state-changed', handleAuthChange as EventListener);
  }, [authState]);

  const initializeApp = async () => {
    try {
      // Initialize Google Auth
      await authService.initializeGoogleAuth();
      
      // Load auth state
      const currentAuthState = authService.getAuthState();
      setAuthState(currentAuthState);

      // Load categories from storage
      const savedCategories = storageService.getItem<Category[]>(CACHE_KEYS.CATEGORIES);
      if (savedCategories) {
        setAppState(prev => ({ ...prev, categories: savedCategories }));
      } else {
        // Initialize with default categories (add createdAt field)
        const defaultCategoriesWithDates = DEFAULT_CATEGORIES.map(cat => ({
          ...cat,
          createdAt: new Date().toISOString()
        }));
        setAppState(prev => ({ ...prev, categories: defaultCategoriesWithDates }));
        storageService.setItem(CACHE_KEYS.CATEGORIES, defaultCategoriesWithDates);
      }

      // Load subscriptions if already authenticated
      if (currentAuthState.isAuthenticated) {
        await loadSubscriptions();
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      setAppState(prev => ({ 
        ...prev, 
        error: 'Failed to initialize application. Please refresh the page.' 
      }));
    }
  };

  const handleSignIn = async () => {
    try {
      await authService.signIn();
    } catch (error) {
      console.error('Sign in error:', error);
      setAppState(prev => ({ 
        ...prev, 
        error: 'Failed to sign in. Please try again.' 
      }));
    }
  };

  const handleSignOut = () => {
    authService.signOut();
    setAppState(prev => ({
      ...prev,
      subscriptions: [],
      selectedChannels: new Set(),
      error: null
    }));
  };

  const loadSubscriptions = async () => {
    setAppState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const subscriptions = await youtubeService.getAllSubscriptions();
      setAppState(prev => ({ 
        ...prev, 
        subscriptions: subscriptions,
        isLoading: false 
      }));
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      setAppState(prev => ({ 
        ...prev, 
        error: 'Failed to load subscriptions. Please try again.',
        isLoading: false 
      }));
    }
  };

  const handleChannelSelection = (channelId: string, selected: boolean) => {
    setAppState(prev => {
      const newSelected = new Set(prev.selectedChannels);
      if (selected) {
        newSelected.add(channelId);
      } else {
        newSelected.delete(channelId);
      }
      return { ...prev, selectedChannels: newSelected };
    });
  };

  const handleSelectAll = (selectAll: boolean) => {
    setAppState(prev => {
      if (selectAll) {
        const filteredSubscriptions = getFilteredSubscriptions();
        return { 
          ...prev, 
          selectedChannels: new Set(filteredSubscriptions.map(sub => sub.id)) 
        };
      } else {
        return { ...prev, selectedChannels: new Set() };
      }
    });
  };

  const handleBatchUnsubscribe = async () => {
    if (appState.selectedChannels.size === 0) return;

    const selectedIds = Array.from(appState.selectedChannels);
    const selectedSubscriptions = appState.subscriptions.filter(sub => 
      selectedIds.includes(sub.id)
    );

    if (selectedSubscriptions.length === 0) return;

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to unsubscribe from ${selectedSubscriptions.length} channels?\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmed) return;

    setAppState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const results = await youtubeService.batchUnsubscribe(selectedIds);
      
      // Remove successful unsubscribes from state
      setAppState(prev => ({
        ...prev,
        subscriptions: prev.subscriptions.filter(sub => 
          !results.success.includes(sub.id)
        ),
        selectedChannels: new Set(),
        isLoading: false
      }));

      // Show results
      if (results.failed.length > 0) {
        setAppState(prev => ({ 
          ...prev, 
          error: `Failed to unsubscribe from ${results.failed.length} channels. Please try again.` 
        }));
      }
    } catch (error) {
      console.error('Batch unsubscribe error:', error);
      setAppState(prev => ({ 
        ...prev, 
        error: 'Failed to unsubscribe from channels. Please try again.',
        isLoading: false 
      }));
    }
  };

  const handleSearchChange = (query: string) => {
    setAppState(prev => ({ ...prev, searchQuery: query }));
  };

  const handleSortChange = (sortBy: 'name' | 'subscribers' | 'date', sortOrder: 'asc' | 'desc') => {
    setAppState(prev => ({ ...prev, sortBy, sortOrder }));
  };

  const handleCategoryFilter = (categoryIds: string[]) => {
    setAppState(prev => ({ ...prev, selectedCategories: categoryIds }));
  };

  const getFilteredSubscriptions = (): YouTubeSubscription[] => {
    let filtered = [...appState.subscriptions];

    // Apply search filter
    if (appState.searchQuery) {
      const query = appState.searchQuery.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.title.toLowerCase().includes(query) ||
        sub.description.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (appState.selectedCategories.length > 0) {
      filtered = filtered.filter(sub =>
        sub.categoryIds.some(catId => appState.selectedCategories.includes(catId))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (appState.sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'subscribers':
          comparison = a.subscriberCount - b.subscriberCount;
          break;
        case 'date':
          comparison = new Date(a.subscribedAt).getTime() - new Date(b.subscribedAt).getTime();
          break;
      }
      
      return appState.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const handleCategoryAssignment = (channelId: string, categoryIds: string[]) => {
    setAppState(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(sub =>
        sub.id === channelId ? { ...sub, categoryIds } : sub
      )
    }));
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">YouTube Subscription Manager</h1>
            <p className="mt-2 text-gray-600">
              Manage your YouTube subscriptions with ease
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="space-y-4">
              <button
                onClick={handleSignIn}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign in with Google
              </button>
              
              <div className="text-sm text-gray-500 text-center">
                <p>You'll need to sign in with your Google account to manage your YouTube subscriptions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">YouTube Subscription Manager</h1>
              <SearchBar 
                value={appState.searchQuery}
                onChange={handleSearchChange}
                placeholder="Search subscriptions..."
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={loadSubscriptions}
                disabled={appState.isLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {appState.isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
              
              <UserMenu 
                user={authState.user!}
                onSignOut={handleSignOut}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <Sidebar
              categories={appState.categories}
              selectedCategories={appState.selectedCategories}
              onCategoryFilter={handleCategoryFilter}
              sortBy={appState.sortBy}
              sortOrder={appState.sortOrder}
              onSortChange={handleSortChange}
              subscriptionCount={appState.subscriptions.length}
              selectedCount={appState.selectedChannels.size}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {appState.error && (
              <ErrorMessage 
                message={appState.error}
                onDismiss={() => setAppState(prev => ({ ...prev, error: null }))}
              />
            )}

            {appState.isLoading && appState.subscriptions.length === 0 ? (
              <LoadingSpinner message="Loading your subscriptions..." />
            ) : (
              <>
                <ChannelList
                  subscriptions={getFilteredSubscriptions()}
                  selectedChannels={appState.selectedChannels}
                  categories={appState.categories}
                  onChannelSelection={handleChannelSelection}
                  onSelectAll={handleSelectAll}
                  onCategoryAssignment={handleCategoryAssignment}
                />

                {appState.selectedChannels.size > 0 && (
                  <BatchActions
                    selectedCount={appState.selectedChannels.size}
                    onUnsubscribe={handleBatchUnsubscribe}
                    onClearSelection={() => setAppState(prev => ({ ...prev, selectedChannels: new Set() }))}
                    isLoading={appState.isLoading}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;