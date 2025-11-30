import { useTranslation } from "react-i18next";

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || "vi";

  const toggleLanguage = () => {
    const newLang = currentLanguage === "vi" ? "en" : "vi";
    i18n.changeLanguage(newLang);
  };

  return (
    <div
      onClick={toggleLanguage}
      className="relative flex items-center bg-gray-100 rounded-full px-1.5 py-1 cursor-pointer transition-all duration-300 hover:bg-gray-200 shadow-sm"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleLanguage();
        }
      }}
      title={currentLanguage === "en" ? "Switch to Vietnamese" : "Chuyển sang Tiếng Anh"}
    >
      {/* Toggle Track */}
      <div className="relative flex items-center w-16 h-9">
        {/* Toggle Button with Flag */}
        <div
          className={`absolute top-0.5 bottom-0.5 w-8 h-8 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center overflow-hidden ${
            currentLanguage === "vi" ? "translate-x-[2rem]" : "translate-x-0"
          }`}
        >
          {currentLanguage === "vi" ? (
            <svg width="18" height="18" viewBox="0 0 20 20" className="rounded-full">
              <rect width="20" height="20" fill="#DA020E" />
              <path
                d="M10 5L11.18 8.09L14.5 8.64L12 11.18L12.64 14.5L10 12.82L7.36 14.5L8 11.18L5.5 8.64L8.82 8.09L10 5Z"
                fill="#FFD700"
              />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 20 20" className="rounded-full">
              <rect width="20" height="20" fill="#012169" />
              <path d="M0 0L20 20M20 0L0 20" stroke="#FFF" strokeWidth="2.5" />
              <path d="M0 10L20 10M10 0L10 20" stroke="#FFF" strokeWidth="3.5" />
              <path d="M0 0L20 20M20 0L0 20" stroke="#C8102E" strokeWidth="1.2" />
              <path d="M0 10L20 10M10 0L10 20" stroke="#C8102E" strokeWidth="2" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

