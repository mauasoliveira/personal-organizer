import type { YouTubeSubscription, YouTubeChannel, CachedData } from '../types/youtube';
import { AuthService } from './auth';
import { API_ENDPOINTS, BATCH_SIZE } from '../utils/constants';

export class YouTubeService {
  private static instance: YouTubeService;
  private authService: AuthService;
  private subscriptionsCache: Map<string, CachedData<YouTubeSubscription[]>> = new Map();

  static getInstance(): YouTubeService {
    if (!YouTubeService.instance) {
      YouTubeService.instance = new YouTubeService();
    }
    return YouTubeService.instance;
  }

  constructor() {
    this.authService = AuthService.getInstance();
  }

  async getSubscriptions(maxResults: number = 50, pageToken?: string): Promise<{
    subscriptions: YouTubeSubscription[];
    nextPageToken?: string;
    totalResults: number;
  }> {
    try {
      const token = await this.authService.getValidToken();
      
      const params = new URLSearchParams({
        part: 'snippet,contentDetails',
        mine: 'true',
        maxResults: maxResults.toString(),
        order: 'alphabetical'
      });

      if (pageToken) {
        params.append('pageToken', pageToken);
      }

      const response = await fetch(`${API_ENDPOINTS.SUBSCRIPTIONS}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform YouTube API response to our format
      const subscriptions: YouTubeSubscription[] = await Promise.all(
        data.items.map(async (item: any) => {
          const channelData = await this.getChannelDetails(item.snippet.resourceId.channelId);
          
          return {
            id: item.id,
            channelId: item.snippet.resourceId.channelId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
            subscriberCount: channelData?.subscriberCount || 0,
            subscribedAt: item.contentDetails.newItemCount ? new Date().toISOString() : item.snippet.publishedAt,
            categoryIds: []
          };
        })
      );

      return {
        subscriptions,
        nextPageToken: data.nextPageToken,
        totalResults: data.pageInfo.totalResults
      };
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  async getAllSubscriptions(): Promise<YouTubeSubscription[]> {
    const cacheKey = 'all_subscriptions';
    const cached = this.subscriptionsCache.get(cacheKey);
    
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    const allSubscriptions: YouTubeSubscription[] = [];
    let nextPageToken: string | undefined;
    let hasMore = true;

    while (hasMore) {
      try {
        const result = await this.getSubscriptions(50, nextPageToken);
        allSubscriptions.push(...result.subscriptions);
        
        if (result.nextPageToken) {
          nextPageToken = result.nextPageToken;
          // Add small delay to respect rate limits
          await this.delay(500);
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error('Error fetching page of subscriptions:', error);
        throw error;
      }
    }

    // Cache the results
    this.subscriptionsCache.set(cacheKey, {
      data: allSubscriptions,
      cachedAt: Date.now(),
      expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour
    });

    return allSubscriptions;
  }

  async unsubscribeFromChannel(subscriptionId: string): Promise<boolean> {
    try {
      const token = await this.authService.getValidToken();
      
      const response = await fetch(`${API_ENDPOINTS.SUBSCRIPTIONS}?id=${subscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Remove from cache
        this.invalidateCache();
        return true;
      } else if (response.status === 404) {
        // Subscription already removed or doesn't exist
        return true;
      } else {
        throw new Error(`Failed to unsubscribe: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error unsubscribing from channel:', error);
      throw error;
    }
  }

  async batchUnsubscribe(subscriptionIds: string[]): Promise<{
    success: string[];
    failed: { id: string; error: string }[];
  }> {
    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[]
    };

    // Process in batches to avoid rate limits
    for (let i = 0; i < subscriptionIds.length; i += BATCH_SIZE) {
      const batch = subscriptionIds.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (subscriptionId) => {
        try {
          const success = await this.unsubscribeFromChannel(subscriptionId);
          if (success) {
            results.success.push(subscriptionId);
          }
        } catch (error) {
          results.failed.push({
            id: subscriptionId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });

      await Promise.allSettled(batchPromises);
      
      // Add delay between batches to respect quota
      if (i + BATCH_SIZE < subscriptionIds.length) {
        await this.delay(2000);
      }
    }

    return results;
  }

  async getChannelDetails(channelId: string): Promise<YouTubeChannel | null> {
    try {
      const token = await this.authService.getValidToken();
      
      const params = new URLSearchParams({
        part: 'snippet,statistics',
        id: channelId
      });

      const response = await fetch(`${API_ENDPOINTS.CHANNELS}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const channel = data.items[0];
        return {
          id: channel.id,
          title: channel.snippet.title,
          description: channel.snippet.description,
          thumbnail: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url || '',
          subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
          videoCount: parseInt(channel.statistics.videoCount) || 0,
          viewCount: parseInt(channel.statistics.viewCount) || 0,
          publishedAt: channel.snippet.publishedAt,
          customUrl: channel.snippet.customUrl
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching channel details:', error);
      return null;
    }
  }

  private invalidateCache(): void {
    this.subscriptionsCache.clear();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


}