"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorToastType } from "@/types";
import { showErrorToast, validateForm } from "@/utils/helperFunctions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const Login = () => {
  const router = useRouter();
  const [btnLoading, setBtnLoading] = useState(false);

  const logInBtnHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      const formData = new FormData(e.currentTarget);
      const formJson: any = Object.fromEntries(formData);

      if (!validateForm(e.currentTarget)) {
        return toast.error("Invalid inputs");
      }
      setBtnLoading(true);
      console.log(formJson);
    } catch (err) {
      showErrorToast(err as ErrorToastType);
    } finally {
      setBtnLoading(false);
    }
  };
  return (
    <div className="flex flex-1 items-center justify-center w-full">
      <div className="w-full max-w-xs">
        <form
          className="flex flex-col gap-6"
          onSubmit={logInBtnHandler}
          noValidate
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-lg tracking-wide font-heading font-bold">
              Log in
            </h1>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="email"
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full hover:cursor-pointer"
              disabled={btnLoading}
            >
              {btnLoading ? "Logging..." : "Login"}
            </Button>
          </div>

          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <span
              className="underline underline-offset-4 hover:cursor-pointer"
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
