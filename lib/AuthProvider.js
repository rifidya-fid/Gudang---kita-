"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "./supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading, null = no session
  const [employee, setEmployee] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function loadEmployee() {
      if (!session?.user) {
        setEmployee(null);
        return;
      }
      const { data } = await supabase
        .from("employees")
        .select("*")
        .eq("auth_user_id", session.user.id)
        .maybeSingle();
      setEmployee(data ?? null);
    }
    loadEmployee();
  }, [session]);

  useEffect(() => {
    if (session === undefined) return; // still loading
    const isLoginPage = pathname === "/login";
    if (!session && !isLoginPage) {
      router.replace("/login");
    }
    if (session && isLoginPage) {
      router.replace("/");
    }
  }, [session, pathname, router]);

  const value = {
    session,
    employee,
    loading: session === undefined,
    signOut: async () => {
      await supabase.auth.signOut();
      router.replace("/login");
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

