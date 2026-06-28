import type { YouTubeSubscription, Category } from '../types/youtube';
import { Trash2, Users, Calendar, Tag } from 'lucide-react';
import { Checkbox } from './Checkbox';

interface ChannelItemProps {
  subscription: YouTubeSubscription;
  isSelected: boolean;
  categories: Category[];
  onSelectionChange: (selected: boolean) => void;
  onCategoryAssignment: (categoryIds: string[]) => void;
}

export function ChannelItem({ 
  subscription, 
  isSelected, 
  categories, 
  onSelectionChange, 
  onCategoryAssignment 
}: ChannelItemProps) {
  const formatSubscriberCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const assignedCategories = categories.filter(cat => 
    subscription.categoryIds.includes(cat.id)
  );

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = subscription.categoryIds;
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId];
    
    onCategoryAssignment(newCategories);
  };

  return (
    <div className={`p-4 hover:bg-gray-50 ${isSelected ? 'bg-indigo-50' : ''}`}>
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <div className="flex-shrink-0 pt-1">
          <Checkbox
            checked={isSelected}
            onChange={onSelectionChange}
          />
        </div>

        {/* Channel Thumbnail */}
        <div className="flex-shrink-0">
          <img
            src={subscription.thumbnail}
            alt={subscription.title}
            className="w-16 h-16 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMzIiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTIgMTJDMTMuNjUgMTIgMTUgMTAuNjUgMTUgOUMxNSA3LjM1IDEzLjY1IDYgMTIgNkMxMC4zNSA2IDkgNy4zNSA5IDlDOSAxMC42NSAxMC4zNSAxMiAxMiAxMlpNMTIgMTRDOSAyIDE0IDkgMTIgMTRaIiBmaWxsPSIjOUI5QjlCIi8+Cjwvc3ZnPgo=';
            }}
          />
        </div>

        {/* Channel Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {subscription.title}
              </h3>
              {subscription.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {subscription.description}
                </p>
              )}
            </div>
          </div>

          {/* Channel Stats */}
          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {formatSubscriberCount(subscription.subscriberCount)} subscribers
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Subscribed {formatDate(subscription.subscribedAt)}
            </div>
          </div>

          {/* Assigned Categories */}
          {assignedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {assignedCategories.map(category => (
                <span
                  key={category.id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${category.color}20`, 
                    color: category.color 
                  }}
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          {/* Category Assignment */}
          <div className="mt-3">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">Categories:</span>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                    subscription.categoryIds.includes(category.id)
                      ? 'font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={{
                    backgroundColor: subscription.categoryIds.includes(category.id) 
                      ? `${category.color}20` 
                      : 'transparent',
                    color: subscription.categoryIds.includes(category.id) 
                      ? category.color 
                      : undefined
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Unsubscribe Button */}
        <div className="flex-shrink-0">
          <button
            onClick={() => onSelectionChange(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            title="Unsubscribe"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}