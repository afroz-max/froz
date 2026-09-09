import React, { useState } from 'react';
import { User } from '../types';
import { Search, Briefcase, FileText, User as UserIcon, LogOut, HelpCircle, Menu, X } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4 sm:space-x-8">
          <button
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center space-x-2 text-left focus:outline-none"
          >
            <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 bg-stone-900 text-white px-2.5 py-1 rounded-lg">
              FROZ
            </span>
            <span className="text-xs font-medium text-stone-500 hidden sm:inline-block">
              Nearby Services & Skills
            </span>
          </button>

          {user && (
            <nav className="hidden md:flex space-x-1">
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavClick('search')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                  activeTab === 'search' || activeTab === 'profile-detail'
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Find Help</span>
              </button>
              <button
                onClick={() => handleNavClick('my-requests')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                  activeTab === 'my-requests'
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>My Requests</span>
              </button>
              <button
                onClick={() => handleNavClick('manage-profile')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                  activeTab === 'manage-profile'
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Offer Your Skills</span>
              </button>
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-stone-200">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-semibold text-stone-900 truncate max-w-[120px]">{user.name}</div>
                <div className="text-xs text-stone-500 truncate max-w-[120px]">{user.email}</div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
              
              {/* Mobile hamburger toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleNavClick('login')}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-stone-700 hover:text-stone-900"
              >
                Login
              </button>
              <button
                onClick={() => handleNavClick('register')}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {user && mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <div className="px-3 py-2 border-b border-stone-100 mb-2">
            <div className="text-sm font-bold text-stone-900">{user.name}</div>
            <div className="text-xs text-stone-500">{user.email}</div>
          </div>
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-2 ${
              activeTab === 'dashboard' ? 'bg-stone-100 text-stone-900 font-bold' : 'text-stone-700'
            }`}
          >
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => handleNavClick('search')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-2 ${
              activeTab === 'search' || activeTab === 'profile-detail' ? 'bg-stone-100 text-stone-900 font-bold' : 'text-stone-700'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Find Help</span>
          </button>
          <button
            onClick={() => handleNavClick('my-requests')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-2 ${
              activeTab === 'my-requests' ? 'bg-stone-100 text-stone-900 font-bold' : 'text-stone-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Requests</span>
          </button>
          <button
            onClick={() => handleNavClick('manage-profile')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-2 ${
              activeTab === 'manage-profile' ? 'bg-stone-100 text-stone-900 font-bold' : 'text-stone-700'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Offer Your Skills</span>
          </button>
        </div>
      )}
    </header>
  );
};
