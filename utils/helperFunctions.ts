import { ErrorToastType } from "@/types";
import toast from "react-hot-toast";

export const validateForm = (form: HTMLFormElement): boolean => {
  try {
    let isValid = true;

    Array.from(form.elements).forEach((element: Element) => {
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement
      ) {
        const htmlElement = element as
          | HTMLInputElement
          | HTMLSelectElement
          | HTMLTextAreaElement;

        if (htmlElement?.required && !htmlElement.value) {
          isValid = false;
          if (htmlElement.type === "file") {
            const fileInput = document.getElementById(
              `${htmlElement.id}`
            ) as HTMLElement;
            fileInput.classList.add("border-red-600");
          } else {
            htmlElement.classList.add("border-red-600");
          }
        } else {
          if (htmlElement.type === "file") {
            const fileInput = document.getElementById(
              `${htmlElement.id}`
            ) as HTMLElement;
            fileInput.classList.remove("border-red-600");
          } else {
            htmlElement.classList.remove("border-red-600");
          }
        }
      }
    });

    return isValid;
  } catch (err) {
    return false;
  }
};

export const showErrorToast = (err: ErrorToastType) => {
  console.error(err);
  if (typeof err === "object" && err !== null && "response" in err) {
    const errorWithResponse = err as {
      response?: { data?: { message?: string } };
    };
    if (errorWithResponse.response?.data?.message) {
      toast.error(err?.response?.data?.message || "Something went wrong !");
    } else {
      toast.error("An unexpected error occurred.");
    }
  } else if (err instanceof Error) {
    toast.error(err.message);
  } else {
    toast.error(String(err));
  }
};
