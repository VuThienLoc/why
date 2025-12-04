
import { useState } from 'react';
import Button from './button';
import { ChevronLeft, Menu, Shield, Plus, ChevronDown } from 'lucide-react';
import type { SidebarProps } from '../../types/Layout.types';
import { LogoutButton } from './LogoutButton';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
export function Sidebar({
  currentUserName,
  currentUserRole,
  currentPage,
  sidebarCollapsed,
  currentUserAvatar,
  setSidebarCollapsed,
  onNavigate,
  navigationItems,
}: SidebarProps) {
  const navigate = useNavigate();
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const { t } = useTranslation();

  return (
    <>


      {/* Backdrop overlay for mobile */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarCollapsed(true)}
          aria-hidden="true"
        />
      )}

      <div className={`bg-white shadow-lg transition-all duration-300 ${
        // Mobile (< 768px): overlay drawer, hidden when collapsed
        // Tablet (768px-1023px): visible sidebar, can be collapsed to 64px
        // Desktop (1024px+): visible sidebar, can be collapsed to 64px
        sidebarCollapsed 
          ? 'w-0 -translate-x-full overflow-hidden pointer-events-none opacity-0 md:opacity-100 md:pointer-events-auto md:translate-x-0 md:w-16 md:overflow-visible lg:w-16' 
          : 'w-64 md:w-64 lg:w-64 opacity-100'
      } flex flex-col h-screen fixed left-0 top-0 z-40 md:z-40 lg:z-40`}>
            
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
          {!sidebarCollapsed && (
            <div
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80"
              onClick={() => navigate('/')}
            >
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <span className="font-bold text-sm sm:text-base text-gray-900">{t('sidebar.title')}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 sm:p-2"
          >
            {sidebarCollapsed ? (
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>
        </div>


        {/* Navigation */}
        <nav className="flex-1 px-2 sm:px-4 py-4 sm:py-6 space-y-1 overflow-y-auto">
          {navigationItems && navigationItems.map((item) => {
            const isActive = currentPage === item.id ||
              (item.id === 'user-management' && currentPage === 'add-user');
            const hasDropdown = item.dropdownItems && item.dropdownItems.length > 0;
            const isDropdownOpen = openDropdowns.has(item.id);

            return (
              <div
                key={item.id}
                className="space-y-1"
                onMouseEnter={() => {
                  if (hasDropdown && !sidebarCollapsed) {
                    setOpenDropdowns(prev => {
                      const newSet = new Set(prev);
                      newSet.add(item.id);
                      return newSet;
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (hasDropdown && !sidebarCollapsed) {
                    setOpenDropdowns(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(item.id);
                      return newSet;
                    });
                  }
                }}
              >
                <div className="flex items-stretch gap-1">
                  <div className="relative flex-1">
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`flex w-full items-center justify-start px-2 sm:px-3 py-1.5 sm:py-2 ${sidebarCollapsed ? 'px-1.5 sm:px-2' : ''
                        } ${isActive
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                        } rounded-md text-sm sm:text-base`}
                      onClick={() => {
                        onNavigate(item.id);
                        // Close sidebar on mobile (< 768px) after navigation
                        if (window.innerWidth < 768) {
                          setSidebarCollapsed(true);
                        }
                      }}
                    >
                      <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${sidebarCollapsed ? '' : 'mr-2 sm:mr-3'} ${isActive ? 'text-white' : 'text-gray-500'
                        }`} />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left text-sm sm:text-base">{item.label}</span>
                          {item.badgeCount !== undefined && item.badgeCount !== null && item.badgeCount > 0 && (
                            <span className="ml-auto inline-flex min-w-[18px] sm:min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-white">
                              {item.badgeCount > 9 ? '9+' : item.badgeCount}
                            </span>
                          )}
                        </>
                      )}
                    </Button>
                    {sidebarCollapsed && item.badgeCount !== undefined && item.badgeCount !== null && item.badgeCount > 0 && (
                      <span className="pointer-events-none absolute -top-1 -right-1 inline-flex h-3.5 sm:h-4 min-w-[14px] sm:min-w-[16px] items-center justify-center rounded-full bg-red-500 px-0.5 sm:px-1 text-[9px] sm:text-[10px] font-semibold text-white">
                        {item.badgeCount > 9 ? '9+' : item.badgeCount}
                      </span>
                    )}
                  </div>
                  {hasDropdown && !sidebarCollapsed && (
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`px-2 sm:px-2.5 py-1.5 sm:py-2 min-w-[36px] sm:min-w-[40px] flex items-center justify-center transition-all pointer-events-none ${isActive
                          ? 'bg-blue-700 text-white rounded-md'
                          : 'text-gray-500 rounded-md'
                        }`}
                    >
                      <ChevronDown className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                        }`} />
                    </Button>
                  )}
                </div>

                {/* Dropdown Items */}
                {hasDropdown && !sidebarCollapsed && isDropdownOpen && (
                  <div className="ml-3 sm:ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                    {item.dropdownItems?.map((dropdownItem) => (
                      <Button
                        key={dropdownItem.id}
                        variant="ghost"
                        className="w-full justify-start px-2 sm:px-3 py-1.5 sm:py-2 h-auto text-xs sm:text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        onClick={() => {
                          dropdownItem.onClick();
                          setOpenDropdowns(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(item.id);
                            return newSet;
                          });
                          // Close sidebar on mobile (< 768px) after navigation
                          if (window.innerWidth < 768) {
                            setSidebarCollapsed(true);
                          }
                        }}
                      >
                        {dropdownItem.icon && (
                          <dropdownItem.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500" />
                        )}
                        {!dropdownItem.icon && <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500" />}
                        <span className="flex-1 text-left">{dropdownItem.label}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-3 sm:p-4 border-t border-gray-200 space-y-2 sm:space-y-3 flex-shrink-0">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 overflow-hidden bg-gray-100">
                <img
                  src={currentUserAvatar || "https://github.com/shadcn.png"}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://github.com/shadcn.png";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{currentUserName}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">{currentUserRole}</p>
              </div>
            </div>
          )}
          <LogoutButton collapsed={sidebarCollapsed} />
        </div>

      </div>
    </>
  );
}
