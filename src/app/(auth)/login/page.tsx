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
import toast from "react-hot-toast";
import { login } from "@/features/auth/actions";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/features/userSlice";

const Login = () => {
  // set router hook
  const router = useRouter();
  // dispatch for user logged
  const dispatch = useDispatch();
  // state of login btn loading
  const [btnLoading, setBtnLoading] = useState(false);
  // form of login
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // form submit handler
  const onSubmit = async (formData: LoginFormData) => {
    try {
      // trigger btn loading
      setBtnLoading(true);
      // call server action
      const result = await login(formData);
      if (result?.error) {
        throw new Error(result.error);
      }

      // if user & session update in user slice
      if (result.user && result.session) {
        dispatch(setUser({ user: result.user, session: result.session }));
        // toast msg
        toast.success(result?.message || "Logged in!");
        // redirect root page
        router.replace("/");
      } else {
        throw new Error("Log in failed!");
      }
    } catch (err) {
      // show error toast
      showErrorToast(err as ErrorToastType);
    } finally {
      // off btn loading
      setBtnLoading(false);
    }
  };

  // common input style
  const inputErrorStyle =
    "border-red-500 dark:border-red-500 focus-visible:ring-red-500 focus-visible:ring-1";

  return (
    <div className="flex flex-1 items-center justify-center w-full">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* header */}
          <div className="text-center">
            <h1 className="text-xl tracking-wide font-bold font-heading">
              Log in
            </h1>
          </div>

          {/* form inputs */}
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
                className={`transition-all duration-200 py-5 ${
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
                className={`transition-all duration-200 py-5 ${
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

          {/* footer */}
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
