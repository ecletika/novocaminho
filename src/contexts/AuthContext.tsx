import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminRole = async (userId: string, email?: string) => {
    // Especial case for owner / developer
    const emailLower = email?.toLowerCase() || "";
    if (
      emailLower === "novocaminho@ecletika.com" ||
      emailLower.endsWith("@ecletika.com") ||
      emailLower.includes("novocaminho") ||
      emailLower === "mauriciojunior.developer@gmail.com"
    ) {
      setIsAdmin(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error("Error checking admin role:", error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const checkInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          await checkAdminRole(initialSession.user.id, initialSession.user.email);
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await checkAdminRole(currentSession.user.id, currentSession.user.email);
        } else {
          setIsAdmin(false);
        }

        if (isMounted) setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    return { error: error as Error | null };
  };

  const signIn = async (identifier: string, password: string) => {
    let email = identifier.trim();
    console.log("Attempting login for:", identifier);

    // Check if identifier is NOT an email (doesn't contain @)
    if (!email.includes("@")) {
      console.log("Identifier look like a name, searching in profiles...");
      // Try to find email in profiles by full_name
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .ilike("full_name", email)
        .maybeSingle();

      if (profileError) {
        console.error("Error searching profile:", profileError);
      }

      if (profile?.email) {
        console.log("Found email for user:", profile.email);
        email = profile.email;
      } else {
        console.warn("No profile found with name:", email);
        // We continue with 'email' as the identifier, Supabase will likely fail if it's not a valid email format
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase login error:", error.message);
    }

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
