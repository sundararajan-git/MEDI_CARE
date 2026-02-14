"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorToastType } from "@/types";
import { showErrorToast } from "@/utils/helperFunctions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginSchema } from "@/lib/zod/authSchema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const Login = () => {
  const router = useRouter();
  const [btnLoading, setBtnLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setBtnLoading(true);
      console.log(data);
    } catch (err) {
      showErrorToast(err as ErrorToastType);
    } finally {
      setBtnLoading(false);
    }
  };

  const inputErrorStyle =
    "border-red-500 dark:border-red-500 focus-visible:ring-red-500 focus-visible:ring-1";

  return (
    <div className="flex flex-1 items-center justify-center w-full">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-xl tracking-wide font-bold font-heading">
              Log in
            </h1>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Email</Label>

                {errors.email && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-red-500 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{errors.email.message}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <Input
                type="email"
                placeholder="email"
                {...register("email")}
                className={`transition-all duration-200 ${
                  errors.email ? inputErrorStyle : ""
                }`}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Password</Label>

                {errors.password && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-red-500 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{errors.password.message}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <Input
                type="password"
                placeholder="password"
                {...register("password")}
                className={`transition-all duration-200 ${
                  errors.password ? inputErrorStyle : ""
                }`}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-4 py-5 cursor-pointer"
              disabled={btnLoading}
            >
              {btnLoading ? "Logging..." : "Login"}
            </Button>
          </div>

          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <span
              className="underline underline-offset-4 cursor-pointer"
              onClick={() => router.replace("/signup")}
            >
              Sign up
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
