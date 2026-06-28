import { Trash2 } from 'lucide-react';

interface BatchActionsProps {
  selectedCount: number;
  onUnsubscribe: () => void;
  onClearSelection: () => void;
  isLoading: boolean;
}

export function BatchActions({ 
  selectedCount, 
  onUnsubscribe, 
  onClearSelection, 
  isLoading 
}: BatchActionsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedCount} channel{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onClearSelection}
              className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:underline"
            >
              Clear selection
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onUnsubscribe}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Unsubscribe Selected ({selectedCount})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}