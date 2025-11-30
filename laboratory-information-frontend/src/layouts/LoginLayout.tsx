import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TestTube } from "lucide-react";
import { LoginForm } from "../pages/login/LoginForm";
import { BubbleBackground } from "@/components/common/bubble-background";
import { useAuthContext } from "../hooks/useAuthContext";
import React, { useEffect } from "react";
import type { User } from "../types/User";
import { useTranslation } from "react-i18next";


export const LoginLayout = () => {
  const navigate = useNavigate();
  const { user, onLogin, loading } = useAuthContext(); // ✅ lấy onLogin từ context
  const [hasRedirected, setHasRedirected] = React.useState(false);
  const { t } = useTranslation();
  // ✅ định nghĩa hàm login
  const handleLogin = (userData: User) => {
    onLogin(userData); // lưu vào context và localStorage
    toast.success(t("login.success"));
  };

  useEffect(() => {
    // Chỉ redirect khi đã load xong và có user hợp lệ
    // Tránh redirect nhiều lần
    if (!loading && user && user.role?.length > 0 && !hasRedirected) {
      const firstRole = user.role[0];
      let redirectPath = "";
      
      switch (firstRole) {
        case "ADMIN":
          redirectPath = "/admin";
          break;
        case "MANAGER":
          redirectPath = "/manager";
          break;
        case "SERVICE":
          redirectPath = "/service";
          break;
        case "LAB_USER":
          redirectPath = "/labuser";
          break;
        case "USER":
          redirectPath = "/user";
          break;
        default:
          redirectPath = "/home";
          break;
      }
      
      // Only navigate if we have a valid redirect path
      if (redirectPath) {
        setHasRedirected(true);
        navigate(redirectPath, { replace: true });
      }
    }
    
    // Reset redirect flag if user is cleared (logout)
    if (!user && hasRedirected) {
      setHasRedirected(false);
    }
  }, [user, loading, navigate, hasRedirected]);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Bubble Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <BubbleBackground className="absolute inset-0" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-6 xs:p-12">
          {/* Medical Icons and Content */}
          <div className="text-center space-y-6 xs:space-y-8">
            {/* Test Tube Icon */}
            <div className="w-16 h-16 xs:w-24 xs:h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <TestTube className="w-8 h-8 xs:w-12 xs:h-12 text-white" />
            </div>
            
            {/* Title */}
            <div>
              <h1 className="text-2xl xs:text-4xl font-bold mb-2 xs:mb-4">{t("login.title1")}</h1>
              <h2 className="text-xl xs:text-2xl font-semibold text-blue-100">{t("login.subtitle")}</h2>
            </div>
            
            {/* Features */}
            <div className="space-y-3 xs:space-y-4 text-left max-w-md">
              <div className="flex items-center space-x-2 xs:space-x-3">
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full"></div>
                <span className="text-sm xs:text-base text-blue-100">{t("login.patientManagement")}</span>
              </div>
              <div className="flex items-center space-x-2 xs:space-x-3">
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full"></div>
                <span className="text-sm xs:text-base text-blue-100">{t("login.reportAnalysis")}</span>
              </div>
              <div className="flex items-center space-x-2 xs:space-x-3">
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full"></div>
                <span className="text-sm xs:text-base text-blue-100">{t("login.patientHistory")}</span>
              </div>
              <div className="flex items-center space-x-2 xs:space-x-3">
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full"></div>
                <span className="text-sm xs:text-base text-blue-100">{t("login.highSecurity")}</span>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements - removed, handled by BubbleBackground */}
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md mx-auto px-4 xs:px-8 py-6 xs:py-12">
          <LoginForm
            onLogin={handleLogin}
            onShowRegister={() => {
              navigate("/register"); 
            }}
            onBackToHome={() => navigate("/")}
          />
        </div>
      </div>
    </div>
  );
}
