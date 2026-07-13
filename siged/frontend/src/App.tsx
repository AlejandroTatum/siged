import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./features/auth/hooks/useAuth";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { HomePage } from "./features/home/pages/HomePage";
import { AuthenticatedLayout } from "./features/layout/pages/AuthenticatedLayout";
import { InstitutionListPage } from "./features/instituciones/pages/InstitutionListPage";
import { MyInstitutionsPage } from "./features/instituciones/pages/MyInstitutionsPage";
import { PlanningPage } from "./features/planificacion/PlanningPage";
import { InstitutionDashboardPage } from "./features/planificacion/pages/InstitutionDashboardPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, token } = useAuth();
  if (isLoading) {
    return <p role="status">Validating session...</p>;
  }
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, token } = useAuth();
  if (isLoading) {
    return <p role="status">Validating session...</p>;
  }
  if (token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="instituciones" element={<InstitutionListPage />} />
        <Route path="mis-instituciones" element={<MyInstitutionsPage />} />
        <Route path="instituciones/:institutionId" element={<InstitutionDashboardPage />} />
        <Route path="instituciones/:institutionId/planificacion/:section" element={<PlanningPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
