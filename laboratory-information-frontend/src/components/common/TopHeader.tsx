import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './LanguageToggle';

export function TopHeader() {
  const { t } = useTranslation();
  return (
    <header className="bg-transparent px-3 xs:px-4 sm:px-5 md:px-6 py-3 md:py-4 transition-all duration-300"> 
        <div className="flex items-center justify-between">
          <h1 className="text-lg xs:text-xl sm:text-xl md:text-2xl font-bold text-gray-900">{t('topHeader.appName')}</h1>
          <LanguageToggle />
        </div>
    </header>
  );
}
