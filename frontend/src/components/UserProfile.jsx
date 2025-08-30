import React, { useState } from 'react';
import { User, LogOut, Heart, Settings, Clock, MapPin, Star } from 'lucide-react';

const UserProfile = ({ user, onLogout, onShowFavorites }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('busAppUser');
    onLogout();
    setShowDropdown(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 bg-white rounded-lg shadow-md px-3 py-2 hover:shadow-lg transition-shadow"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-gray-800">{user.name}</div>
          <div className="text-xs text-gray-500">
            {user.provider === 'google' ? 'Google Account' : 'Local Account'}
          </div>
        </div>
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[1000]">
          {/* User Info Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="text-xs text-gray-400 flex items-center space-x-1 mt-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    Joined {formatDate(user.registrationTime || user.loginTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {user.favorites?.length || 0}
                </div>
                <div className="text-xs text-gray-500">Favorite Routes</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {Math.floor(Math.random() * 50) + 10}
                </div>
                <div className="text-xs text-gray-500">Trips Planned</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                onShowFavorites();
                setShowDropdown(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
            >
              <Heart className="h-4 w-4 text-red-500" />
              <span>My Favorite Routes</span>
            </button>
            
            <button
              onClick={() => setShowDropdown(false)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
            >
              <MapPin className="h-4 w-4 text-blue-500" />
              <span>Recent Searches</span>
            </button>
            
            <button
              onClick={() => setShowDropdown(false)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
            >
              <Settings className="h-4 w-4 text-gray-500" />
              <span>Settings</span>
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200 py-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center space-x-3 text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default UserProfile;