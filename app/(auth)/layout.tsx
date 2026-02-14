"use client";

import AuthLayout from "@/components/app/layout/AuthLayout";
import { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full h-screen flex flex-col items-center">
      <AuthLayout />
      {children}
    </div>
  );
};

export default layout;
