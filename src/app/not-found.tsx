"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const NotFound = () => {
  // navigation hook
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground gap-4">
      {/* info */}
      <h1 className="text-6xl font-heading font-bold">404</h1>
      <h2 className="text-2xl font-sans">Page Not Found</h2>
      <p className="text-muted-foreground text-center max-w-md">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>

      {/* redirect */}
      <div className="flex gap-4 mt-4">
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    </div>
  );
};

export default NotFound;
