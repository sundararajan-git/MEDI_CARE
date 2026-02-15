"use client";

import LogoutButton from "@/components/app/auth/LogoutButton";
import { useAuth } from "@/lib/hooks/useAuth";

const HomePage = () => {
  const { user, loading } = useAuth();

  console.log(user);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold font-heading">
            Welcome to MediCare
          </h1>
          <p className="text-muted-foreground">
            You are successfully authenticated!
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Logged in as (Redux):
            </p>
            <p className="font-medium">{user?.email}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">User ID:</p>
            <p className="font-mono text-xs break-all">{user?.id}</p>
          </div>
        </div>

        <LogoutButton />
      </div>
    </div>
  );
};

export default HomePage;
