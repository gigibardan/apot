import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: "admin" | "editor";
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireRole,
  redirectTo = "/auth/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Store the intended destination
        const returnUrl = location.pathname + location.search;
        navigate(`${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`, {
          replace: true,
        });
    } else if (requireRole && userRole !== requireRole && userRole !== "admin") {
      // If specific role required and user doesn't have it (admins bypass all checks)
      navigate("/", { replace: true });
    }
    }
  }, [loading, isAuthenticated, userRole, requireRole, navigate, redirectTo, location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireRole && userRole !== requireRole && userRole !== "admin") {
    return null;
  }

  return <>{children}</>;
}
