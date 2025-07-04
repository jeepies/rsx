import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function toJsonValue<T>(data: T): unknown {
  return JSON.parse(JSON.stringify(data));
}

export function sanitizeBigInts(obj: any): any {
  if (typeof obj === 'bigint') {
    return obj.toString();
  } else if (Array.isArray(obj)) {
    return obj.map(sanitizeBigInts);
  } else if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeBigInts(obj[key]);
    }
    return sanitized;
  }
  return obj;
}

export function bigintReplacer(key: string, value: any) {
  return typeof value === 'bigint' ? value.toString() : value;
}

export function formatBigInt(number: number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}