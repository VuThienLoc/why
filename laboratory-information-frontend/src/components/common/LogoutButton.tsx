import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { logoutUser } from "../../service/authService/logoutApi";
import { useAuthContext } from "../../hooks/useAuthContext";
import { LogoutConfirmDialog } from "./LogoutConfirmDialog";
import { useTranslation } from 'react-i18next';
interface LogoutButtonProps {
  collapsed?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ collapsed = false }) => {
  const navigate = useNavigate();
  const { onLogout } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { t } = useTranslation();
  const handleLogout = async () => {
    try {
      setLoading(true);
      
      // Clear local state first to prevent any redirect issues
      onLogout();
      
      // Then call logout API
      const success = await logoutUser();

      if (success) {
        toast.success(t('logout.success'));
      } else {
        toast.error(t('logout.error'));
      }
      
      // Force navigate to login page
      // Use replace to prevent going back
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state and redirect
      onLogout();
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
      setShowDialog(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        disabled={loading}
        className={` rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition disabled:opacity-60 ${
          collapsed 
            ? 'p-2 w-full flex items-center justify-center' 
            : 'px-4 py-2'
        }`}
        title={collapsed ? (loading ? "Đang đăng xuất..." : "Đăng xuất") : undefined}
      >
        {collapsed ? (
          <LogOut className="h-4 w-4" />
        ) : (
          loading ? t('logout.loading') : t('logout.logout')
        )}
      </button>

      <LogoutConfirmDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onConfirm={handleLogout}
        loading={loading}
      />
    </>
  );
};
