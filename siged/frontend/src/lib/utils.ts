/**
 * Utilidades compartidas del frontend.
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ClassValue } from "clsx";

/**
 * Combina clases CSS condicionalmente.
 * Usa clsx para condicionales y tailwind-merge para resolver
 * conflictos entre clases de Tailwind.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
