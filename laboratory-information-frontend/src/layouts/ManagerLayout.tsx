import { useCallback, useEffect, useState } from 'react';
import { Users, User as UserIcon, Wrench } from 'lucide-react';
import { Sidebar } from '../components/common/Sidebar';
import { TopHeader } from '../components/common/TopHeader';
import { MobileHeader } from '../components/common/MobileHeader';
import type { NavigationItem } from '../types/Layout.types';
import type { User } from '../types/User';
import { useTranslation } from 'react-i18next';
import type { UserProfileData } from './Profile';
import { profileService } from '@/service/profileService';

interface ManagerLayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function ManagerLayout({ 
  children, 
  currentUser, 
  onLogout, 
  currentPage, 
  onNavigate 
}: ManagerLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { t } = useTranslation();
  const navigationItems: NavigationItem[] = [
  { id: 'user-management', label: t('manager.userManagement'), icon: Users },
  { id: 'profile', label: t('manager.profile'), icon: UserIcon },
  { id: 'instruments', label: t('manager.instruments'), icon: Wrench }  
  ];

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const loadProfile = useCallback(async () => {
    try {
      const data = await profileService.getProfile(currentUser.id);
      setProfile(data);
    } catch (e) {
      console.error("Failed to load profile", e);
    }
  }, [currentUser.id]);
    useEffect(() => {
      loadProfile();
    }, [loadProfile]);
  
    
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        currentUserName={currentUser.name}
        currentUserRole={t('manager.role')}
        currentPage={currentPage}
        currentUserAvatar={profile?.avatar}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        onNavigate={onNavigate}
        navigationItems={navigationItems}
        onLogout={onLogout}
      />
      <div className={`flex-1 flex flex-col overflow-hidden ${sidebarCollapsed ? 'ml-0 md:ml-16 lg:ml-16' : 'ml-0 md:ml-64 lg:ml-64'}`}>
        <MobileHeader 
          onMenuClick={() => setSidebarCollapsed(false)} 
          navigationItems={navigationItems}
        />
        <TopHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-3 xs:p-4 sm:p-5 md:p-6">{children}</main>
      </div>
    </div>
  );
}

