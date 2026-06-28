import type { GoogleUser } from '../types/youtube';
import { LogOut, User } from 'lucide-react';

interface UserMenuProps {
  user: GoogleUser;
  onSignOut: () => void;
}

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        {user.picture ? (
          <img 
            src={user.picture} 
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
        )}
        <span className="text-sm font-medium text-gray-700">
          {user.name}
        </span>
      </div>
      
      <button
        onClick={onSignOut}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        title="Sign Out"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </button>
    </div>
  );
}