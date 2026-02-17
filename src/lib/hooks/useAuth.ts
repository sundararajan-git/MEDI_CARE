"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

// custom hook for get user
export function useAuth() {
  const { user, loading } = useSelector((state: RootState) => state.user);
  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}
