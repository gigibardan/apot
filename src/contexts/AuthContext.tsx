import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type UserRole = "admin" | "editor" | "contributor" | "user" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  canEdit: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user role from database
  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      return data?.role || null;
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id).then(setUserRole);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch role after auth state changes
        setTimeout(() => {
          fetchUserRole(session.user.id).then(setUserRole);
        }, 0);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user role after successful login
      if (data.user) {
        const role = await fetchUserRole(data.user.id);
        setUserRole(role);
      }

      return { error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserRole(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Request password reset
  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error("Reset password error:", error);
      return { error: error as Error };
    }
  };

  // Update password (after reset)
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error("Update password error:", error);
      return { error: error as Error };
    }
  };

  // Helper computed properties
  const isAuthenticated = !!user;
  const isAdmin = userRole === "admin";
  const isEditor = userRole === "editor";
  const canEdit = isAdmin || isEditor;

  const value: AuthContextType = {
    user,
    session,
    userRole,
    loading,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated,
    isAdmin,
    isEditor,
    canEdit,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
