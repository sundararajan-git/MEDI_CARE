import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { LuMoonStar, LuSunMedium } from "react-icons/lu";
import { TbMedicalCrossFilled } from "react-icons/tb";

const AuthLayout = () => {
  const { theme, setTheme } = useTheme();
  const [clientOnly, setClientOnly] = useState(false);

  useEffect(() => {
    setClientOnly(true);
  }, []);

  return (
    <div className="flex w-full gap-2 justify-between p-8">
      <a href="#" className="flex items-center gap-2 font-medium">
        <div className="flex items-center justify-center rounded-md">
          <TbMedicalCrossFilled className="size-8 text-primary" />
        </div>
        <span className="font-semibold font-heading text-xl">Medi Care</span>
      </a>
      <Button
        variant="ghost"
        className="cursor-pointer rounded-full hover:bg-transparent dark:hover:bg-transparent"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {clientOnly && (
          <>
            {theme === "dark" ? (
              <LuSunMedium className="size-5" />
            ) : (
              <LuMoonStar className="size-4" />
            )}
          </>
        )}
      </Button>
    </div>
  );
};
export default AuthLayout;
