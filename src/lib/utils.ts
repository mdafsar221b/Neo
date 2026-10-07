// Helper utilities for UI formatting and styling
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merges class names safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formats ISO date string to a human-readable string
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

// Formats duration between two timestamps or in seconds
export function formatDuration(startStr?: string | null, endStr?: string | null): string {
  if (!startStr || !endStr) return "-";
  try {
    const s = new Date(startStr).getTime();
    const e = new Date(endStr).getTime();
    if (isNaN(s) || isNaN(e) || e < s) return "-";
    const totalSeconds = Math.floor((e - s) / 1000);
    return formatSeconds(totalSeconds);
  } catch {
    return "-";
  }
}

// Formats seconds into MM:SS or HH:MM:SS format
export function formatSeconds(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours > 0) {
    return `${hours}h ${remMins}m ${secs}s`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
