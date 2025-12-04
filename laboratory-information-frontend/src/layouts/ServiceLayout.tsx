import { useCallback, useEffect, useState } from 'react';
import {
  Beaker,
  Wrench,
  Activity,
  Settings,
} from 'lucide-react';
import { Sidebar } from '../components/common/Sidebar';
import { TopHeader } from '../components/common/TopHeader';
import { MobileHeader } from '../components/common/MobileHeader';
import type { NavigationItem } from '../types/Layout.types';
import type { User } from '../types/User';
import { useTranslation } from 'react-i18next';
import { profileService } from '@/service/profileService';
import type { UserProfileData } from './Profile';

interface ServiceLayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function ServiceLayout({
  children,
  currentUser,
  onLogout,
  currentPage,
  onNavigate
}: ServiceLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { t } = useTranslation();

  const navigationItems: NavigationItem[] = [
    { id: 'event-logs', label: t('sidebar.eventLogs'), icon: Activity },
    { id: 'reagents', label: t('sidebar.reagents'), icon: Beaker },
    { id: 'instruments', label: t('sidebar.instruments'), icon: Wrench },
    {
      id: 'test-orders',
      label: t('sidebar.testOrders'),
      icon: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10,9 9,9 8,9" /></svg>
    },
    { id: 'profile', label: t('sidebar.profile'), icon: Settings },
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
        navigationItems={navigationItems}
        currentUserName={currentUser.name}
        currentUserAvatar={profile?.avatar}
        currentUserRole={t('manager.service')}
        currentPage={currentPage}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        onNavigate={onNavigate}
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
