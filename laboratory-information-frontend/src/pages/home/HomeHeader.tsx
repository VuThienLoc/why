import { Microscope, ArrowRight, LogOut, ChevronDown } from "lucide-react";
import Button from "../../components/common/button";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../service/authService/logoutApi";
import { LanguageToggle } from "../../components/common/LanguageToggle";
import { profileService } from "../../service/profileService";

interface HomeHeaderProps {
  onShowLogin: () => void;
  onShowRegister: () => void; 
}

export function HomeHeader({ onShowLogin, onShowRegister }: HomeHeaderProps) {
  const { t } = useTranslation();
  const { user, onLogout } = useAuthContext();
  const navigate = useNavigate();
  const [, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | undefined>(user?.avatar);
  const lastYRef = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getRolePath = () => {
    if (!user || !user.role || user.role.length === 0) return "/";
    
    for (const role of user.role) {
      if (user.role.includes(role)) {
        switch (role) {
          case "ADMIN":
            return "/admin/user-management";
          case "MANAGER":
            return "/manager/user-management";
          case "LAB_USER":
            return "/labuser/test-orders";
          case "SERVICE":
            return "/service/event-logs";
          case "USER":
            return "/user/dashboard";
          default:
            return "/";
        }
      }
    }
    return "/";
  };

  const handleGoToDashboard = () => {
    const path = getRolePath();
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      onLogout();
      await logoutUser();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      onLogout();
      navigate("/", { replace: true });
    } finally {
      setLogoutLoading(false);
    }
  };

  useEffect(() => {
    let ticking = false;
    const threshold = 8; // px before we react to direction

    const onScroll = () => {
      const currentY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(currentY > 20);
          const delta = currentY - lastYRef.current;
          if (Math.abs(delta) > threshold) {
            if (delta > 0 && currentY > 60) {
              setHidden(true); 
            } else {
              setHidden(false); // scrolling up
            }
          }
          lastYRef.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch user avatar when user is logged in
  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (user) {
        // Set initial avatar from context immediately
        setUserAvatar(user.avatar);
        
        try {
          // Fetch latest avatar from API
          const profile = await profileService.getCurrentUserProfile();
          if (profile && profile.avatar) {
            setUserAvatar(profile.avatar);
          } else if (profile && !profile.avatar && user.avatar) {
            // Keep user.avatar if API doesn't return one
            setUserAvatar(user.avatar);
          }
        } catch (error) {
          console.error("Failed to fetch user avatar:", error);
          // Keep user.avatar from context if API fails
          setUserAvatar(user.avatar);
        }
      } else {
        setUserAvatar(undefined);
      }
    };

    fetchUserAvatar();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header
      className={`px-3 sm:px-6 py-3 transition-transform duration-300 will-change-transform ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between rounded-xl transition-all duration-300 bg-transparent">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg">
            <Microscope className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg sm:text-xl text-gray-900 font-semibold">{t("header.appName")}</h1>
            <p className="text-xs sm:text-sm text-gray-600">
              {t("header.appDescription")}
            </p>
          </div>
          <div className="block sm:hidden">
            <h1 className="text-base text-gray-900 font-semibold">{t("header.appName")}</h1>
          </div>
        </div>

        {/* Language Switcher + Login/Register or User Info + Logout */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Language Toggle Switch */}
          <LanguageToggle />

          {user ? (
            /* User is logged in - Show avatar with dropdown menu */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full transition-all duration-200 hover:opacity-80"
                aria-label="User menu"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-blue-200 shadow-md hover:border-blue-400 transition-colors">
                  <img
                    src={userAvatar || "https://github.com/shadcn.png"}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://github.com/shadcn.png";
                    }}
                  />
                </div>
                <ChevronDown 
                  className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${
                    isDropdownOpen ? 'transform rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in transform transition-all duration-200">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                        <img
                          src={userAvatar || "https://github.com/shadcn.png"}
                          alt={user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://github.com/shadcn.png";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleGoToDashboard();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span>{t("header.goToDashboard")}</span>
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsDropdownOpen(false);
                      }}
                      disabled={logoutLoading}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>
                        {logoutLoading ? t("header.loggingOut") : t("header.logout")}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* User is not logged in - Show register and login buttons */
            <>
              <Button
                onClick={onShowRegister}
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-xs sm:text-sm px-2 sm:px-4"
              >
                {t("header.register")}
              </Button>

              <Button
                onClick={onShowLogin}
                className="bg-gradient-to-r from-gray-900 to-gray-700 hover:from-black hover:to-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-xs sm:text-sm px-2 sm:px-4"
              >
                <span className="hidden sm:inline">{t("header.login")}</span>
                <span className="sm:hidden">Login</span>
                <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
