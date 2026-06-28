import type { Category } from '../types/youtube';
import { Filter, SortAsc, SortDesc } from 'lucide-react';

interface SidebarProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryFilter: (categoryIds: string[]) => void;
  sortBy: 'name' | 'subscribers' | 'date';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'name' | 'subscribers' | 'date', sortOrder: 'asc' | 'desc') => void;
  subscriptionCount: number;
  selectedCount: number;
}

export function Sidebar({ 
  categories, 
  selectedCategories, 
  onCategoryFilter, 
  sortBy, 
  sortOrder, 
  onSortChange,
  subscriptionCount,
  selectedCount
}: SidebarProps) {
  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    onCategoryFilter(newSelected);
  };

  const handleSortToggle = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(sortBy, newOrder);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Subscriptions:</span>
            <span className="text-sm font-medium text-gray-900">{subscriptionCount}</span>
          </div>
          {selectedCount > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Selected:</span>
              <span className="text-sm font-medium text-indigo-600">{selectedCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sort Options */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <SortAsc className="w-5 h-5 mr-2" />
          Sort By
        </h3>
        <div className="space-y-2">
          {[
            { value: 'name', label: 'Channel Name' },
            { value: 'subscribers', label: 'Subscriber Count' },
            { value: 'date', label: 'Subscription Date' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value as any, sortOrder)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                sortBy === option.value
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {option.label}
              {sortBy === option.value && (
                <span className="ml-2">
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
          ))}
        </div>
        
        <button
          onClick={handleSortToggle}
          className="mt-3 w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
          {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        </button>
      </div>

      {/* Category Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Categories
        </h3>
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category.id} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryToggle(category.id)}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <span 
                className="ml-2 text-sm text-gray-700 flex items-center"
                style={{ color: category.color }}
              >
                <span 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}