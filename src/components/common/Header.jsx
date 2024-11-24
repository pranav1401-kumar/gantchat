import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { auth } from '../../services/firebase';

const Header = () => {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Gantt Chart</h1>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-gray-700">{user.displayName}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;