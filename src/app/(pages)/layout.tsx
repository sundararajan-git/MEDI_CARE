"use client";

import AppHeader from "@/components/layout/AppHeader";
import { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-screen w-full flex flex-col bg-background">
      <AppHeader />
      {children}
    </div>
  );
};

export default layout;
