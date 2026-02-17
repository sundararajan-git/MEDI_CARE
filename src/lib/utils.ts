import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// merge class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// delay for repeated request 
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
