"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, UserCog, ChevronRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { clearUser } from "@/store/features/userSlice";
import { TbMedicalCrossFilled } from "react-icons/tb";
import { useTheme } from "next-themes";
import { LuMoonStar, LuSunMedium, LuLaptop } from "react-icons/lu";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { logout } from "@/features/auth/actions";
import { showErrorToast } from "@/utils/helperFunctions";
import { ErrorToastType } from "@/types";

const AppHeader = () => {
  // get user from custom hook
  const { user } = useAuth();
  // navigation hook
  const router = useRouter();
  // dispatch for user logout
  const dispatch = useDispatch();
  // control theme hook
  const { theme, setTheme } = useTheme();
  // prevent hydration
  const [mounted, setMounted] = useState(false);
  // page path hook
  const pathname = usePathname();
  // get current path
  const role = pathname.startsWith("/caretaker") ? "caretaker" : "patient";

  useEffect(() => {
    // update component is mount
    setMounted(true);
  }, []);

  // logout handler
  const handleLogout = async () => {
    try {
      // call logout server action
      const result = await logout();
      if (result.success) {
        // clear the current from redux
        dispatch(clearUser());
        // redirect the auth page
        router.replace("/login");
      } else {
        throw new Error("Logout Failed!");
      }
    } catch (err) {
      showErrorToast(err as ErrorToastType);
    }
  };

  // role switch handler
  const handleRoleChange = (newRole: "patient" | "caretaker") => {
    router.push(`/${newRole}`);
  };

  if (!user) return null;

  return (
    <div className="w-full flex flex-col">
      <nav className="w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-8 mx-auto">
          {/* logo */}
          <div className="flex items-center gap-2 font-medium">
            <div className="flex items-center justify-center rounded-md">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                className="size-8 text-primary"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11 2l-.15 .005a2 2 0 0 0 -1.85 1.995v2.803l-2.428 -1.401a2 2 0 0 0 -2.732 .732l-1 1.732l-.073 .138a2 2 0 0 0 .805 2.594l2.427 1.402l-2.427 1.402a2 2 0 0 0 -.732 2.732l1 1.732l.083 .132a2 2 0 0 0 2.649 .6l2.428 -1.402v2.804a2 2 0 0 0 2 2h2l.15 -.005a2 2 0 0 0 1.85 -1.995v-2.804l2.428 1.403a2 2 0 0 0 2.732 -.732l1 -1.732l.073 -.138a2 2 0 0 0 -.805 -2.594l-2.428 -1.403l2.428 -1.402a2 2 0 0 0 .732 -2.732l-1 -1.732l-.083 -.132a2 2 0 0 0 -2.649 -.6l-2.428 1.4v-2.802a2 2 0 0 0 -2 -2h-2z"></path>
              </svg>
            </div>
            <span className="font-semibold font-heading text-xl">
              Medi Care
            </span>
          </div>

          <div className="flex items-center gap-5">
            {/* role switch */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="relative flex bg-muted/20 backdrop-blur-xl rounded-full p-1.5 border border-white/10 dark:border-white/5 shadow-2xl h-11 w-70 items-center">
                {/* highlight the active role */}
                <div
                  className={cn(
                    "absolute h-8.5 w-[calc(50%-6px)] bg-primary rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-500 ease-spring z-0",
                    role === "patient"
                      ? "translate-x-0"
                      : "translate-x-[calc(100%+0px)]",
                  )}
                />

                <button
                  onClick={() => handleRoleChange("patient")}
                  className={cn(
                    "relative z-10 flex-1 h-full flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-500 cursor-pointer",
                    role === "patient"
                      ? "text-primary-foreground scale-100"
                      : "text-muted-foreground hover:text-foreground scale-95 opacity-70",
                  )}
                >
                  <UserIcon
                    className={cn(
                      "h-4 w-4 transition-transform duration-500",
                      role === "patient"
                        ? "rotate-0 scale-110"
                        : "rotate-12 scale-90",
                    )}
                  />
                  <span>Patient</span>
                </button>

                <button
                  onClick={() => handleRoleChange("caretaker")}
                  className={cn(
                    "relative z-10 flex-1 h-full flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-500 cursor-pointer",
                    role === "caretaker"
                      ? "text-primary-foreground scale-100"
                      : "text-muted-foreground hover:text-foreground scale-95 opacity-70",
                  )}
                >
                  <UserCog
                    className={cn(
                      "h-4 w-4 transition-transform duration-500",
                      role === "caretaker"
                        ? "rotate-0 scale-110"
                        : "-rotate-12 scale-90",
                    )}
                  />
                  <span>Caretaker</span>
                </button>
              </div>
            </div>

            {/* role switch fro mobile device */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all active:scale-90"
                onClick={() =>
                  handleRoleChange(role === "patient" ? "caretaker" : "patient")
                }
              >
                {role === "patient" ? (
                  <UserCog className="h-5 w-5 text-primary" />
                ) : (
                  <UserIcon className="h-5 w-5 text-primary" />
                )}
              </Button>
            </div>

            {/* user */}
            <DropdownMenu>
              {/* avatar */}
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="group relative h-10 w-10 cursor-pointer"
                >
                  <Avatar className="h-10 w-10 border-2 border-background bg-primary shadow-xl">
                    <AvatarFallback className="bg-linear-to-tr from-primary to-blue-600 text-white font-bold text-xs">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              {/* pop up content */}
              <DropdownMenuContent
                className="w-72 p-0 overflow-hidden bg-background/80 backdrop-blur-2xl border-white/10 dark:border-white/5 shadow-2xl rounded-2xl"
                align="end"
                forceMount
              >
                <div className="relative p-6 pb-4">
                  <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-blue-500/10 opacity-50" />
                  <div className="relative flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-background shadow-xl">
                      <AvatarFallback className="bg-linear-to-tr from-primary to-blue-600 text-white font-bold text-xl">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold tracking-tight">
                          {user.email?.split("@")[0]}
                        </p>
                        <div className="px-1.5 py-0.5 rounded-full bg-primary/20 text-[9px] font-black uppercase text-primary tracking-tighter">
                          PRO
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium truncate max-w-35">
                        {user.email}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1">
                        {role === "caretaker" ? (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold">
                            <UserCog className="h-3 w-3" />
                            CARETAKER
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-bold">
                            <UserIcon className="h-3 w-3" />
                            PATIENT
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator className="bg-white/5 dark:bg-white/5" />

                <div className="p-2 space-y-1">
                  <div className="px-2 py-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-3 px-1">
                      Interface
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-14 flex-col gap-1.5 rounded-xl border transition-all duration-300",
                          mounted && theme === "light"
                            ? "bg-white dark:bg-white/10 shadow-md border-black/5 dark:border-white/20 text-primary scale-100"
                            : "hover:bg-muted/50 border-transparent text-muted-foreground scale-95 opacity-60",
                        )}
                        onClick={() => setTheme("light")}
                      >
                        <LuSunMedium className="h-4 w-4" />
                        <span className="text-[9px] font-black uppercase tracking-tight">
                          Light
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-14 flex-col gap-1.5 rounded-xl border transition-all duration-300",
                          mounted && theme === "dark"
                            ? "bg-white dark:bg-white/10 shadow-md border-black/5 dark:border-white/20 text-primary scale-100"
                            : "hover:bg-muted/50 border-transparent text-muted-foreground scale-95 opacity-60",
                        )}
                        onClick={() => setTheme("dark")}
                      >
                        <LuMoonStar className="h-4 w-4" />
                        <span className="text-[9px] font-black uppercase tracking-tight">
                          Dark
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-14 flex-col gap-1.5 rounded-xl border transition-all duration-300",
                          mounted && theme === "system"
                            ? "bg-white dark:bg-white/10 shadow-md border-black/5 dark:border-white/20 text-primary scale-100"
                            : "hover:bg-muted/50 border-transparent text-muted-foreground scale-95 opacity-60",
                        )}
                        onClick={() => setTheme("system")}
                      >
                        <LuLaptop className="h-4 w-4" />
                        <span className="text-[9px] font-black uppercase tracking-tight">
                          System
                        </span>
                      </Button>
                    </div>
                  </div>

                  <DropdownMenuSeparator className="bg-white/5 dark:bg-white/5 opacity-50" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl h-11 px-3 m-1 focus:bg-red-500/10 focus:text-red-500 text-red-600/80 cursor-pointer font-bold transition-colors"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-red-500/10">
                          <LogOut className="h-4 w-4" />
                        </div>
                        <span className="text-sm">Log out</span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-30" />
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AppHeader;
