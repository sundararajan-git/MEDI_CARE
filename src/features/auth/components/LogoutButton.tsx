"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";
import { logout } from "@/features/auth/actions";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  // navigation hook
  const router = useRouter();
  // state of btn loading
  const [isLoading, setIsLoading] = useState(false);

  // logout handler
  const handleLogout = async () => {
    try {
      // trigger loading
      setIsLoading(true);
      // call server action
      const result = await logout();
      if (result?.error) {
        throw new Error(result.error);
      }
      toast.success("Logged out!");
      // redirect auth pages
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="destructive"
      className="w-full"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
};

export default LogoutButton;
