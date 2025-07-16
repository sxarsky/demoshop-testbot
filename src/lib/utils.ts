import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSessionIdFromCookie() {
  const match = document.cookie.match(/(?:^|; )demoshop_session_id=([^;]*)/);
  return match ? match[1] : "";
}
