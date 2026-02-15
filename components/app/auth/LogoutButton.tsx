"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const result = await logout();

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success("Logged out!");
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
