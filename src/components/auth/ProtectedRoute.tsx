import { ReactNode, useEffect, useState } from "react";
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
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    // Don't do anything while initial auth is loading
    if (loading) {
      return;
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      const returnUrl = location.pathname + location.search;
      navigate(`${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`, {
        replace: true,
      });
      return;
    }

    // If we need a specific role, wait for it to load
    if (requireRole) {
      // If userRole is null but user is authenticated, wait a bit for role to load
      if (userRole === null) {
        // Set a small timeout to allow fetchUserRole to complete
        const roleCheckTimeout = setTimeout(() => {
          setIsCheckingRole(false);
          
          // After timeout, if still no role, redirect to home
          if (userRole === null) {
            console.warn("User authenticated but no role found after timeout");
            navigate("/", { replace: true });
          }
        }, 1000); // 1 second grace period for role to load

        return () => clearTimeout(roleCheckTimeout);
      }

      // Check if user has the required role
      const hasAccess = userRole === "admin" || userRole === requireRole;
      
      if (!hasAccess) {
        console.warn(`Access denied. Required: ${requireRole}, Current: ${userRole}`);
        navigate("/", { replace: true });
      }
      
      setIsCheckingRole(false);
    } else {
      // No specific role required, just need authentication
      setIsCheckingRole(false);
    }
  }, [loading, isAuthenticated, userRole, requireRole, navigate, redirectTo, location]);

  // Show loading spinner while checking
  if (loading || (requireRole && isCheckingRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Se încarcă...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Need specific role but don't have it
  if (requireRole && userRole !== requireRole && userRole !== "admin") {
    return null;
  }

  return <>{children}</>;
}