import type { YouTubeSubscription, Category } from '../types/youtube';
import { ChannelItem } from './ChannelItem';
import { Checkbox } from './Checkbox';

interface ChannelListProps {
  subscriptions: YouTubeSubscription[];
  selectedChannels: Set<string>;
  categories: Category[];
  onChannelSelection: (channelId: string, selected: boolean) => void;
  onSelectAll: (selectAll: boolean) => void;
  onCategoryAssignment: (channelId: string, categoryIds: string[]) => void;
}

export function ChannelList({ 
  subscriptions, 
  selectedChannels, 
  categories, 
  onChannelSelection, 
  onSelectAll, 
  onCategoryAssignment 
}: ChannelListProps) {
  const allSelected = subscriptions.length > 0 && subscriptions.every(sub => selectedChannels.has(sub.id));
  const someSelected = subscriptions.some(sub => selectedChannels.has(sub.id));

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
        <p className="text-gray-600">
          {subscriptions.length === 0 ? 
            "You don't have any YouTube subscriptions yet." : 
            "No subscriptions match your current filters."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              onChange={(checked) => onSelectAll(checked)}
              label="Select All"
            />
          </div>
          <div className="text-sm text-gray-500">
            {selectedChannels.size} of {subscriptions.length} selected
          </div>
        </div>
      </div>

      {/* Channel List */}
      <div className="divide-y divide-gray-200">
        {subscriptions.map(subscription => (
          <ChannelItem
            key={subscription.id}
            subscription={subscription}
            isSelected={selectedChannels.has(subscription.id)}
            categories={categories}
            onSelectionChange={(selected) => onChannelSelection(subscription.id, selected)}
            onCategoryAssignment={(categoryIds) => onCategoryAssignment(subscription.id, categoryIds)}
          />
        ))}
      </div>
    </div>
  );
}