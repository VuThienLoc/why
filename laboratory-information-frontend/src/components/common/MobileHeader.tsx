import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import Button from './button';
import type { NavigationItem } from '../../types/Layout.types';
import { Plus } from 'lucide-react';

interface MobileHeaderProps {
  onMenuClick?: () => void;
  navigationItems?: NavigationItem[];
}

export function MobileHeader({ onMenuClick, navigationItems }: MobileHeaderProps) {
  const { t } = useTranslation();
  
  // Collect all dropdown items from navigationItems
  const dropdownItems = navigationItems?.flatMap(item => 
    item.dropdownItems?.map(dropdownItem => ({
      ...dropdownItem,
      parentId: item.id
    })) || []
  ) || [];
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-2 xs:px-3 py-2.5 md:hidden sticky top-0 z-40">
      <div className="flex items-center justify-between gap-1 xs:gap-2">
        {/* Left: Menu Button + App Name */}
        <div className="flex items-center gap-1 xs:gap-2 flex-1 min-w-0">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="h-8 w-8 xs:h-9 xs:w-9 p-0 flex-shrink-0"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4 xs:h-5 xs:w-5 text-gray-700" />
            </Button>
          )}
          <h1 className="text-sm xs:text-base font-bold text-gray-900 truncate">
            {t('topHeader.appName')}
          </h1>
        </div>
        
        {/* Center: Dropdown Items Icons */}
        {dropdownItems.length > 0 && (
          <div className="flex items-center gap-0.5 xs:gap-1 flex-shrink-0 overflow-x-auto scrollbar-hide">
            {dropdownItems.map((dropdownItem) => {
              const IconComponent = dropdownItem.icon || Plus;
              return (
                <Button
                  key={dropdownItem.id}
                  variant="ghost"
                  size="icon"
                  onClick={dropdownItem.onClick}
                  className="h-8 w-8 xs:h-9 xs:w-9 p-0 flex-shrink-0"
                  aria-label={dropdownItem.label}
                  title={dropdownItem.label}
                >
                  <IconComponent className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-gray-700" />
                </Button>
              );
            })}
          </div>
        )}
        
        {/* Right: Language Toggle */}
        <div className="flex-shrink-0">
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}

