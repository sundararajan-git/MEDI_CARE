"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export function useAuth() {
  const { user, loading } = useSelector((state: RootState) => state.user);
  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}
