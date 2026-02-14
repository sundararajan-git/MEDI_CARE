"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorToastType } from "@/types";
import { showErrorToast, validateForm } from "@/utils/helperFunctions";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupFormData, signupSchema } from "@/lib/zod/authSchema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const Signup = () => {
  const router = useRouter();
  const [btnLoading, setBtnLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
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
              Sign up
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

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Confirm Password</Label>

                {errors.confirmPassword && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-red-500 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{errors.confirmPassword.message}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <Input
                type="password"
                placeholder="confirm password"
                {...register("confirmPassword")}
                className={`transition-all duration-200 ${
                  errors.confirmPassword ? inputErrorStyle : ""
                }`}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-4 py-5 cursor-pointer"
              disabled={btnLoading}
            >
              {btnLoading ? "Signing..." : "Signup"}
            </Button>
          </div>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <span
              className="underline underline-offset-4 cursor-pointer"
              onClick={() => router.replace("/login")}
            >
              Login
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
