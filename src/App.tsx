import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { SearchProfessionals } from './components/SearchProfessionals';
import { ProfileDetail } from './components/ProfileDetail';
import { MyRequests } from './components/MyRequests';
import { ManageProfile } from './components/ManageProfile';
import { User } from './types';
import { apiFetch } from './lib/api';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [searchCategory, setSearchCategory] = useState<string>('All');

  // Check current session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await apiFetch('/api/auth/me');
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };
    checkSession();
  }, []);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setUser(null);
    setActiveTab('login');
  };

  const handleSelectProfile = (profileId: number) => {
    setSelectedProfileId(profileId);
    setActiveTab('profile-detail');
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-stone-900 border-t-transparent mb-4"></div>
          <p className="text-sm font-medium text-stone-600">Loading FROZ...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, enforce authentication requirement per user prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
        <Navbar
          user={null}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'login' || tab === 'register') {
              setActiveTab(tab);
            } else {
              setActiveTab('login');
            }
          }}
          onLogout={() => {}}
        />
        <main className="flex-1">
          <AuthScreen
            onLoginSuccess={handleLoginSuccess}
            initialMode={activeTab === 'register' ? 'register' : 'login'}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900">
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <Dashboard
            user={user}
            setActiveTab={setActiveTab}
            onSelectCategory={(cat) => {
              setSearchCategory(cat);
              setActiveTab('search');
            }}
          />
        )}
        {activeTab === 'search' && (
          <SearchProfessionals
            onSelectProfile={handleSelectProfile}
            initialCategory={searchCategory}
          />
        )}
        {activeTab === 'profile-detail' && selectedProfileId && (
          <ProfileDetail
            profileId={selectedProfileId}
            onBack={() => setActiveTab('search')}
            onGoToRequests={() => setActiveTab('my-requests')}
          />
        )}
        {activeTab === 'my-requests' && (
          <MyRequests onGoToSearch={() => setActiveTab('search')} />
        )}
        {activeTab === 'manage-profile' && (
          <ManageProfile user={user} />
        )}
      </main>
    </div>
  );
}
