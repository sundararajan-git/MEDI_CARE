"use client";

import AuthHeader from "@/components/layout/AuthHeader";
import { ReactNode } from "react";

// layouts of auth pages
const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full h-screen flex flex-col items-center">
      {/* logo with theme toggle header */}
      <AuthHeader />
      {/* pages */}
      {children}
    </div>
  );
};

export default layout;
