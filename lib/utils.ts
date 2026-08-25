import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Semester } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Dynamic Pricing Logic:
 * - 1st Semester: ₹100
 * - 2nd to 8th Semester: ₹250
 */
export function calculateEventFee(semester: Semester | string): {
  amountInINR: number;
  amountInPaise: number;
} {
  const trimmed = semester?.trim();
  if (trimmed === '1st Semester') {
    return {
      amountInINR: 100,
      amountInPaise: 100 * 100, // 10000 paise
    };
  }

  // 2nd through 8th Semester
  return {
    amountInINR: 250,
    amountInPaise: 250 * 100, // 25000 paise
  };
}

/**
 * Generates a random 6-digit numeric ID (100000 to 999999)
 */
export function generateUnique6DigitId(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Formats a number to Indian Rupee (INR) currency format
 */
export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
