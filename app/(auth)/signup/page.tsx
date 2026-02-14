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

const Signup = () => {
  const router = useRouter();
  const [btnLoading, setBtnLoading] = useState(false);

  const signUpBtnHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      const formData = new FormData(e.currentTarget);
      const formJson: any = Object.fromEntries(formData);

      if (!validateForm(e.currentTarget)) {
        return toast.error("Invalid inputs");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formJson.email.trim())) {
        return toast.error("Invalid Email");
      }

      if (formJson.password !== formJson.confirmPassword) {
        return toast.error("Passwords do not match");
      }

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      if (!passwordRegex.test(formJson.password)) {
        return toast.error(
          "Password must be 8+ chars, include upper & lower case, number & symbol",
        );
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
          onSubmit={signUpBtnHandler}
          noValidate
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-lg tracking-wide font-bold font-heading">
              Sign up
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

            <div className="grid gap-3">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="confirm password"
                required
              />
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full py-3 hover:cursor-pointer"
              disabled={btnLoading}
            >
              {btnLoading ? "Signing..." : "Signup"}
            </Button>
          </div>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <span
              className="underline underline-offset-4 hover:cursor-pointer"
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
