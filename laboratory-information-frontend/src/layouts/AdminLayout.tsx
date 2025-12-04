
import type { AdminLayoutProps } from '../pages/admin/types/AdminTypes';
import { Sidebar } from '../components/common/Sidebar';
import { useEffect, useState,useCallback   } from 'react';
import {  Users, FileText, Settings , UserCheck } from 'lucide-react';
import { TopHeader } from '../components/common/TopHeader';
import { MobileHeader } from '../components/common/MobileHeader';
import type { NavigationItem } from '../types/Layout.types';
import { useTranslation } from 'react-i18next';
import { profileService } from '@/service/profileService';
import type { UserProfileData } from './Profile';

export function AdminLayout({ children, currentUser, onLogout, currentPage, onNavigate }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { t } = useTranslation();
  
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
  
    

  const navigationItems: NavigationItem[] = [
    { id: 'user-management', label: t('sidebar.userManagement'), icon: Users },
    { id: 'patient-management', label: t('sidebar.patientManagement'), icon: UserCheck },
    {
      id: 'test-orders',
      label: t('sidebar.testOrders'),
      icon: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10,9 9,9 8,9" /></svg>
    },
    
    
    {
      id: 'test-results',
      label: t('sidebar.testResults'),
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      id: 'instruments',
      label: t('sidebar.instruments'),
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
    {
      id: 'reagents',
      label: t('sidebar.reagents'),
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    { id: 'audit-reports', label: t('sidebar.auditReports'), icon: FileText },
    { id: 'profile', label: t('sidebar.profile'), icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        currentUserName={currentUser.name}
        currentUserRole={t('admin.role')}
        currentUserAvatar={profile?.avatar}
        currentPage={currentPage}
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
