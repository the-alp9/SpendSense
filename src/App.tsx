import React, { useState, useEffect } from 'react';
import { FinancialProfile } from './types/finance';
import { 
  loadFinancialProfile, 
  saveFinancialProfile, 
  resetToDemoProfile 
} from './utils/storage';
import { Navigation, TabKey } from './components/Navigation';
import { Header } from './components/Header';
import { EditProfileModal } from './components/EditProfileModal';
import { DashboardView } from './components/views/DashboardView';
import { SmartAllocationView } from './components/views/SmartAllocationView';
import { EmergencyFundView } from './components/views/EmergencyFundView';
import { FinancialGoalsView } from './components/views/FinancialGoalsView';
import { TravelFundView } from './components/views/TravelFundView';
import { AIAgentView } from './components/views/AIAgentView';
import { WhatIfView } from './components/views/WhatIfView';
import { SettingsView } from './components/views/SettingsView';

export function App() {
  const [profile, setProfile] = useState<FinancialProfile>(() => loadFinancialProfile());
  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    saveFinancialProfile(profile);
  }, [profile]);

  const handleUpdateProfile = (updated: FinancialProfile) => {
    setProfile(updated);
  };

  const handleResetDemo = () => {
    const demo = resetToDemoProfile();
    setProfile(demo);
  };

  const handleConsultAI = (promptText: string) => {
    setAiInitialPrompt(promptText);
    setCurrentTab('ai-agent');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#14213D] flex flex-col lg:flex-row antialiased selection:bg-[#18A878]/20 selection:text-[#14213D]">
      {/* Navigation (Desktop Sidebar & Mobile Drawer) */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        isDemo={profile.isDemo}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          profile={profile}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenEditModal={() => setEditModalOpen(true)}
          onNavigateToAI={() => setCurrentTab('ai-agent')}
          onResetDemo={handleResetDemo}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardView
              profile={profile}
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenEditModal={() => setEditModalOpen(true)}
            />
          )}

          {currentTab === 'allocation' && (
            <SmartAllocationView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onOpenEditModal={() => setEditModalOpen(true)}
            />
          )}

          {currentTab === 'emergency' && (
            <EmergencyFundView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {currentTab === 'goals' && (
            <FinancialGoalsView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onConsultAI={handleConsultAI}
            />
          )}

          {currentTab === 'travel' && (
            <TravelFundView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onConsultAI={handleConsultAI}
            />
          )}

          {currentTab === 'ai-agent' && (
            <AIAgentView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              initialPrompt={aiInitialPrompt}
            />
          )}

          {currentTab === 'what-if' && (
            <WhatIfView
              profile={profile}
              onConsultAI={handleConsultAI}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onResetDemo={handleResetDemo}
              onOpenEditModal={() => setEditModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Edit Profile & Income Modal */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        currentProfile={profile}
        onSaveProfile={handleUpdateProfile}
      />
    </div>
  );
}

export default App;
