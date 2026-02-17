import { ErrorToastType } from "@/types";
import toast from "react-hot-toast";

export const showErrorToast = (err: ErrorToastType) => {
  toast.error(err.message || "An unexpected error occurred.");
};
