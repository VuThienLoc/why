import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import type { ReactNode, ComponentType, ReactElement } from "react";
import { HomeLayout } from "../layouts/HomeLayout";
import { LoginLayout } from "../layouts/LoginLayout";
import { RegisterPage } from "../pages/register/RegisterPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuthContext } from "../hooks/useAuthContext";
import { AdminLayout } from "../layouts/AdminLayout";
import {

  AdminPatientManagementPage,
  AdminAuditReportsPage,
} from "../pages/admin";
import { ManagerUserManagementPage } from "../pages/manager";
import { ManagerLayout } from "../layouts/ManagerLayout";
import NormalUserLayout from "../layouts/NormalUserLayout";
import Dashboard from "@/pages/normaluser/Dashboard";
import TestResults from "@/pages/normaluser/TestResults";
import ChatPage from "@/pages/normaluser/ChatPage";
import ChatRoomPage from "@/pages/normaluser/ChatRoomPage";
import Profile from "../layouts/Profile";

import TestOrdersPage from "@/pages/labuser/components/TestOrderComp/TestOrdersPage";
import CreateTestOrderPage from "@/pages/labuser/components/CreateTestOrder/CreateTestOrderPage";
import SelectReagentsPage from "@/pages/labuser/components/CreateTestOrder/SelectReagentsPage";
import { LabUserLayout } from "../layouts/LabUserLayout";
import TestResultsPage from "@/pages/labuser/TestResultsPage";
import ReagentManagementPage from "@/pages/labuser/components/ReagentComp/ReagentManagementPage";
import { ServiceLayout } from "../layouts/ServiceLayout";

import ServiceInstrumentPage from "@/pages/service/InstrumentManagementPage";
import { GoogleCallbackPage } from "../pages/login/GoogleCallbackPage";
import { ForgotPasswordPage } from "../pages/login/ForgotPasswordPage";
import { ForgotPasswordSuccessPage } from "../pages/login/ForgotPasswordSuccessPage";
import { ResetPasswordPage } from "../pages/login/ResetPasswordPage";
import SelectInstrumentsPage from "@/pages/labuser/components/CreateTestOrder/SelectInstrumentsPage";
import PatientDetailPage from "@/pages/admin/components/PatientComp/PatientDetailPage";
import EventLogDetail from "@/pages/admin/EventLogDetail";
import type { User } from "../types/User";
import LabUserChatPage from "@/pages/labuser/ChatPage";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Props interface cho layout components
 */
interface LayoutProps {
  currentUser: User;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  children?: ReactNode;
}


/**
 * Cấu hình cho một page con trong role routes
 */
interface PageConfig {
  /** Path của page (ví dụ: "dashboard", "test-orders") */
  path: string;
  /** Component của page */
  // Dùng generic component với props tự do (React.FC<any>) vì nhiều page không có props cụ thể
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  /** Wrapper component tùy chọn */
  wrapper?: ComponentType<{ children: ReactNode }>;
  /** Props tùy chọn để truyền vào component */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  componentProps?: Record<string, any>;
}

/**
 * Cấu hình cho một role route
 */
interface RoleRouteConfig {
  /** Base path (ví dụ: "/admin", "/labuser") */
  basePath: string;
  /** Roles được phép truy cập */
  allowedRoles: string[];
  /** Layout component */
  Layout: ComponentType<LayoutProps>;
  /** Default page khi truy cập base path */
  defaultPage: string;
  /** Danh sách các page con */
  pages: PageConfig[];
}

// ============================================================================
// Route Configuration
// ============================================================================

/**
 * Cấu hình routes cho tất cả các roles
 * Mỗi role có base path, layout, và danh sách pages con
 */
const roleRoutes: Record<string, RoleRouteConfig> = {
  USER: {
    basePath: "/user",
    allowedRoles: ["USER"],
    Layout: NormalUserLayout as ComponentType<LayoutProps>,
    defaultPage: "dashboard",
    pages: [
      { path: "dashboard", component: Dashboard },
      { path: "test-results", component: TestResults },
      { path: "chat", component: ChatPage },
      { path: "chat/:roomId", component: ChatRoomPage },
      { path: "profile", component: Profile, componentProps: { currentUser: null } },
    ],
  },
  ADMIN: {
    basePath: "/admin",
    allowedRoles: ["ADMIN"],
    Layout: AdminLayout as ComponentType<LayoutProps>,
    defaultPage: "user-management",
    pages: [
      // { path: "dashboard", component: AdminDashboardPage },
      { path: "user-management", component: ManagerUserManagementPage },
      { path: "patient-management", component: AdminPatientManagementPage },
      {
        path: "test-orders",
        component: TestOrdersPage,
      },
      { path: "test-results", component: TestResultsPage },
      { path: "instruments", component: ServiceInstrumentPage },
      { path: "reagents", component: ReagentManagementPage },
      { path: "audit-reports", component: AdminAuditReportsPage },
      { path: "profile", component: Profile, componentProps: { currentUser: null } },
      { path: "create-test-order", component: CreateTestOrderPage },
      {path: "select-instruments", component: SelectInstrumentsPage},
      {path: "select-reagents", component: SelectReagentsPage},
      {path: "patient-management/:id", component: PatientDetailPage},
      {path: "audit-reports/:id", component: EventLogDetail},
    ],
  },
  MANAGER: {
    basePath: "/manager",
    allowedRoles: ["MANAGER"],
    Layout: ManagerLayout as ComponentType<LayoutProps>,
    defaultPage: "user-management",
    pages: [
      { path: "user-management", component: ManagerUserManagementPage },
      { path: "instruments", component: ServiceInstrumentPage },
      { path: "profile", component: Profile, componentProps: { currentUser: null } },
    ],
  },
  LAB_USER: {
    basePath: "/labuser",
    allowedRoles: ["LAB_USER"],
    Layout: LabUserLayout as ComponentType<LayoutProps>,
    defaultPage: "test-orders",
    pages: [
      { path: "patients", component: AdminPatientManagementPage },
      { path: "test-orders", component: TestOrdersPage },
      { path: "test-results", component: TestResultsPage },
      { path: "instruments", component: ServiceInstrumentPage },
      { path: "reagents", component: ReagentManagementPage },
      { path: "chat", component: LabUserChatPage },
      { path: "profile", component: Profile, componentProps: { currentUser: null } },
      { path: "patients/:id", component: PatientDetailPage },
      {path : "create-test-order", component: CreateTestOrderPage},
      {path: "select-instruments", component: SelectInstrumentsPage},
      {path: "select-reagents", component: SelectReagentsPage},
      {path: "audit-reports/:id", component: EventLogDetail},
    ],
  },
  SERVICE: {
    basePath: "/service",
    allowedRoles: ["SERVICE"],
    Layout: ServiceLayout as ComponentType<LayoutProps>,
    defaultPage: "event-logs",
    pages: [
      { path: "event-logs", component: AdminAuditReportsPage },
      { path: "reagents", component: ReagentManagementPage },
      { path: "instruments", component: ServiceInstrumentPage },
      {
        path: "test-orders",
        component: TestOrdersPage,
      },
      { path: "profile", component: Profile, componentProps: { currentUser: null } },
      { path: "create-test-order", component: CreateTestOrderPage },
      { path: "select-instruments", component: SelectInstrumentsPage },
      { path: "select-reagents", component: SelectReagentsPage },
      {path: "audit-reports/:id", component: EventLogDetail},
    ],
  },
};

// ============================================================================
// Helper Functions for Route Generation
// ============================================================================

/**
 * Render page component với wrapper nếu có
 */
function renderPage(
  pageConfig: PageConfig,
  user: User
): ReactNode {
  const { component: Component, wrapper: Wrapper, componentProps = {} } = pageConfig;
  
  // Nếu có componentProps với currentUser, inject user vào
  const props = { ...componentProps };
  if (props.currentUser === null) {
    props.currentUser = user;
  }

  const pageElement = <Component {...props} />;

  if (Wrapper) {
    return <Wrapper>{pageElement}</Wrapper>;
  }

  return pageElement;
}

/**
 * Tạo routes cho một role config
 * Trả về mảng các Route elements để flatten vào Routes
 */
function createRoleRoutes(
  config: RoleRouteConfig,
  user: User,
  onLogout: () => void,
  currentPage: string,
  setCurrentPage: (page: string) => void,
  navigate: ReturnType<typeof useNavigate>
): ReactElement[] {
  const { basePath, allowedRoles, Layout, defaultPage, pages } = config;

  // Handler để navigate và update state
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    navigate(`${basePath}/${page}`);
  };

  // Base layout props
  const baseLayoutProps = {
    currentUser: user,
    onLogout,
    currentPage,
    onNavigate: handleNavigate,
  };

  const routes: ReactElement[] = [];

  // Base route - redirect đến default page
  const defaultPageConfig = pages.find((p) => p.path === defaultPage) || pages[0];
  routes.push(
    <Route
      key={basePath}
      path={basePath}
      element={
        <ProtectedRoute allowedRoles={allowedRoles}>
          <Layout
            {...baseLayoutProps}
          >
            {renderPage(defaultPageConfig, user)}
          </Layout>
        </ProtectedRoute>
      }
    />
  );

  // Các routes con cho từng page
  pages.forEach((pageConfig) => {
    const fullPath = `${basePath}/${pageConfig.path}`;
    routes.push(
      <Route
        key={fullPath}
        path={fullPath}
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <Layout
              {...baseLayoutProps}
              currentPage={pageConfig.path}
            >
              {renderPage(pageConfig, user)}
            </Layout>
          </ProtectedRoute>
        }
      />
    );
  });

  return routes;
}

// ============================================================================
// Main AppRoutes Component
// ============================================================================

/**
 * Component chính quản lý tất cả routes của ứng dụng
 * - Tự động sinh routes từ cấu hình roleRoutes
 * - Xử lý redirect cho base paths
 * - Quản lý state cho currentPage của mỗi role
 */
export function AppRoutes() {
  const { user, onLogout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  // State để track currentPage cho mỗi role
  const [pageStates, setPageStates] = useState<Record<string, string>>({
    USER: "dashboard",
    ADMIN: "user-management",
    MANAGER: "user-management",
    LAB_USER: "test-orders",
    SERVICE: "event-logs",
  });

  // Helper để get page từ pathname
  const getPageFromPath = (pathname: string, basePath: string): string => {
    const remaining = pathname.replace(basePath, "").replace(/^\//, "");
    return remaining || "dashboard";
  };

  // Sync state với URL khi location thay đổi
  useEffect(() => {
    Object.values(roleRoutes).forEach((config) => {
      const { basePath } = config;
      if (location.pathname.startsWith(basePath)) {
        // Bỏ qua các routes đặc biệt của labuser
        if (
          basePath === "/labuser" &&
          (location.pathname.includes("/create-test-order") ||
            location.pathname.includes("/select-instruments") ||
            location.pathname.includes("/select-reagents") ||
            location.pathname.includes("/patient-medical-records") ||
            location.pathname.includes("/patients/"))
        ) {
          return;
        }

        // Bỏ qua các routes đặc biệt của service
        if (
          basePath === "/service" &&
          (location.pathname.includes("/create-test-order") ||
            location.pathname.includes("/select-instruments") ||
            location.pathname.includes("/select-reagents"))
        ) {
          return;
        }

        // Bỏ qua các routes đặc biệt của admin
        if (
          basePath === "/admin" &&
          (location.pathname.includes("/create-test-order") ||
            location.pathname.includes("/select-instruments") ||
            location.pathname.includes("/select-reagents") ||
            location.pathname.includes("/patient-management") ||
            location.pathname.includes("/audit-reports"))
        ) {
          return;
        }

        const page = getPageFromPath(location.pathname, basePath);
        const roleKey = Object.keys(roleRoutes).find(
          (key) => roleRoutes[key].basePath === basePath
        );

        if (roleKey && pageStates[roleKey] !== page && page !== "") {
          setPageStates((prev) => ({ ...prev, [roleKey]: page }));
        }
      }
    });
  }, [location.pathname, pageStates]);

  // Auto-redirect base paths đến default pages
  useEffect(() => {
    Object.values(roleRoutes).forEach((config) => {
      if (location.pathname === config.basePath) {
        navigate(`${config.basePath}/${config.defaultPage}`, { replace: true });
      }
    });
  }, [location.pathname, navigate]);

  // Helper để set currentPage cho một role
  const setCurrentPage = (role: string, page: string) => {
    setPageStates((prev) => ({ ...prev, [role]: page }));
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <HomeLayout
            onShowLogin={() => navigate("/login")}
            onShowRegister={() => navigate("/register")}
          />
        }
      />
      <Route path="/login" element={<LoginLayout />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/forgot-password/success" element={<ForgotPasswordSuccessPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

      {/* Dynamic Role Routes - Tự động sinh từ cấu hình */}
      {Object.entries(roleRoutes).flatMap(([role, config]) =>
        createRoleRoutes(
          config,
          user!,
          onLogout,
          pageStates[role],
          (page) => setCurrentPage(role, page),
          navigate
        )
      )}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
