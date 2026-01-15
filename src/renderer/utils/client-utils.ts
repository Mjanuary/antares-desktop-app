// import {
//   SELECTED_BRANCH_STORAGE_KEY,
//   USER_SETTINGS_STORAGE_KEY,
// } from "@/constants";

export const formatUrl = (str: string) => str.replace(/\//g, "");

export const dateFormat = (date?: string | Date | null) => {
  if (!date) return "----/--/--";
  const dateTime = new Date(date);
  const month = dateTime.getMonth() + 1;
  const day = dateTime.getDate();

  return `${dateTime.getFullYear()}-${month <= 9 ? `0${month}` : month}-${
    day <= 9 ? `0${day}` : day
  }`;
};

export const timeFormat = (date?: string | Date | null) => {
  if (!date) return "--:--:--";
  const dateTime = new Date(date);
  const hours = dateTime.getHours();
  const minutes = dateTime.getMinutes();
  const seconds = dateTime.getSeconds();

  return `${hours}:${minutes}:${seconds}`;
};

export const numberReadFormat = (
  value: number | string | null | undefined,
): string => {
  if (value === 0) return "0";
  if (!value) return "-";
  return Number(value).toLocaleString();
};

export function isNumber(value: string | number): boolean {
  const numberPattern = /^[+-]?\d+(\.\d+)?$/; // Matches valid numeric patterns like integers or decimals
  if (typeof value === "number") {
    return true; // Already a number
  }
  if (typeof value === "string" && numberPattern.test(value.trim())) {
    return true; // Matches the numeric pattern
  }
  return false; // Not a valid number
}

export function getNumber(value: string | number | null): number {
  if (value === null) return 0;
  return isNumber(value) ? +value : 0;
}

export const calculatePercentage = (part: number, total: number) => {
  if (+total === 0 && +part === 0) return 0;
  if (total === 0) return 0;
  return (part / total) * 100;
};

export function getMinutesBetween(startTime: string, endTime: string): number {
  const today = new Date().toISOString().split("T")[0];
  const start = new Date(`${today}T${startTime}:00`);
  const end = new Date(`${today}T${endTime}:00`);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;

  return Math.abs((end.getTime() - start.getTime()) / (1000 * 60));
}

export function getDateWithTime(timeString: string) {
  const today = new Date(); // Get today's date

  // Extract hours and minutes from the time string
  const [hours, minutes] = timeString.split(":").map(Number);

  // Create a new Date object with today's date and the specified time
  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    hours,
    minutes,
    0,
    0,
  );
}

export const formatLabel = (str: string) => {
  if (!str) return "";

  // Replace underscores with spaces
  const withSpaces = str.replace(/_/g, " ");

  // Capitalize the first letter
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

export function truncateText(text: string, maxLength: number = 20) {
  if (text.length <= maxLength) {
    return text;
  } else {
    return text.slice(0, maxLength) + "...";
  }
}

// Search array utility

type SearchOptions<T> = {
  [K in keyof T]?: boolean;
};

export function searchArray<T>(
  data: T[],
  search: string,
  options: SearchOptions<T>,
): T[] {
  const searchLower = search.toLowerCase();

  return data.filter((item) =>
    Object.keys(options).some((key) => {
      if (options[key as keyof T]) {
        const value = item[key as keyof T];
        if (typeof value === "string" || typeof value === "number") {
          return String(value).toLowerCase().includes(searchLower);
        }
      }
      return false;
    }),
  );
}

export function isValidNumber(input: string): boolean {
  const regex = /^(?:\d+|\d*\.\d+)$/;
  return regex.test(input);
}

// SAFELY handle document for SSR/Backend environments
export const focusInput = (inputId?: string) => {
  if (typeof document !== "undefined") {
    document.getElementById(inputId || "scan-input")?.focus();
  }
};
