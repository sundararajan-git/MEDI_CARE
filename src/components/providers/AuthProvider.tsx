"use client";

import { useLayoutEffect } from "react";
import { useDispatch } from "react-redux";
import { supabase } from "@/lib/supabase/client";
import { setUser, setLoading, clearUser } from "@/store/features/userSlice";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // update user hook
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    // get user session
    const checkSession = async () => {
      try {
        // get session
        const { data } = await supabase.auth.getSession();
        // update
        if (data.session) {
          dispatch(setUser({ user: data.session.user, session: data.session }));
        } else {
          dispatch(setLoading(false));
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkSession();

    // listen any change on token related ex: expire , invalid
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
