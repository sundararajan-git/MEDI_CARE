"use client";

import { useLayoutEffect } from "react";
import { useDispatch } from "react-redux";
import { supabase } from "@/lib/supabase/client";
import { setUser, setLoading, clearUser } from "@/store/features/userSlice";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    // Check active session on mount
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      console.log(data);
      if (data.session) {
        dispatch(setUser({ user: data.session.user, session: data.session }));
      } else {
        dispatch(setLoading(false));
      }
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        dispatch(setUser({ user: session.user, session }));
      } else {
        dispatch(clearUser());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;
