import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { TopHeader } from '../components/common/TopHeader';
import { MobileHeader } from '../components/common/MobileHeader';
import type { NavigationItem } from '../types/Layout.types';
import type { User } from '../types/User';
import { MessageNotificationProvider, useMessageNotificationContext } from '../context/MessageNotificationContext';
import { useTranslation } from 'react-i18next';
import type { UserProfileData } from './Profile';
import { profileService } from '@/service/profileService';
import ChatBox from '@/pages/home/ChatBox';
interface NormalUserLayoutProps {
  currentUser: User;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  children?: React.ReactNode;
}

interface LayoutContentProps extends NormalUserLayoutProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
}

const NormalUserLayoutContent: React.FC<LayoutContentProps> = ({
  currentUser,
  onLogout,
  currentPage,
  onNavigate,
  children,
  sidebarCollapsed,
  setSidebarCollapsed,
}) => {
  const { unreadCount, markAllAsRead } = useMessageNotificationContext();
  const isChatPage = currentPage?.startsWith('chat');
  const { t } = useTranslation();

  const navigationItems: NavigationItem[] = useMemo(
    () => [
      {
        id: 'dashboard',
        label: t('sidebar.dashboard'),
        icon: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
      },
      {
        id: 'test-results',
        label: t('sidebar.testResults'),
        icon: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
      },
      {
        id: 'chat',
        label: t('sidebar.chat'),
        icon: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
      },
      {
        id: 'profile',
        label: t('sidebar.profile'),
        icon: (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      }
    ],
    [t]
  );

  useEffect(() => {
    if (isChatPage) {
      markAllAsRead();
    }
  }, [isChatPage, markAllAsRead]);

  const navigationItemsWithBadges = useMemo(
    () =>
      navigationItems.map((item) =>
        item.id === 'chat' ? { ...item, badgeCount: unreadCount > 0 ? unreadCount : undefined } : item
      ),
    [unreadCount, navigationItems]
  );

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
        navigationItems={navigationItemsWithBadges}
        currentUserName={currentUser.name}
        currentUserRole={t('role.normalUser')}
        currentUserAvatar={profile?.avatar}
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
      <ChatBox />
    </div>
  );
};

export const NormalUserLayout: React.FC<NormalUserLayoutProps> = ({
  currentUser,
  onLogout,
  currentPage,
  onNavigate,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isChatPage = currentPage?.startsWith('chat');

  return (
    <MessageNotificationProvider
      options={{
        enabled: true,
        suppressToasts: Boolean(isChatPage),
        autoClear: false,
        pollInterval: 15000, // Tăng lên 15 giây để giảm số lượng request
      }}
    >
      <NormalUserLayoutContent
        currentUser={currentUser}
        onLogout={onLogout}
        currentPage={currentPage}
        onNavigate={onNavigate}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      >
        {children}
      </NormalUserLayoutContent>
    </MessageNotificationProvider>
  );
};

export default NormalUserLayout;