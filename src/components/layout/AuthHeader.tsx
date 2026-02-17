"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { LuMoonStar, LuSunMedium } from "react-icons/lu";
import { TbMedicalCrossFilled } from "react-icons/tb";

const AuthHeader = () => {
  // theme hook
  const { theme, setTheme } = useTheme();
  // state mounted of the component for prevent the hydration error
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex w-full gap-2 justify-between p-8">
      {/* logo */}
      <a href="/" className="flex items-center gap-2 font-medium">
        <div className="flex items-center justify-center rounded-md">
          <TbMedicalCrossFilled className="size-8 text-primary" />
        </div>
        <span className="font-semibold font-heading text-xl">Medi Care</span>
      </a>

      {/*theme */}
      {mounted ? (
        <Button
          variant="ghost"
          className="cursor-pointer rounded-full hover:bg-transparent dark:hover:bg-transparent"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          suppressHydrationWarning
        >
          {theme === "dark" ? (
            <LuSunMedium className="size-5" />
          ) : (
            <LuMoonStar className="size-4" />
          )}
        </Button>
      ) : null}
    </div>
  );
};
export default AuthHeader;
