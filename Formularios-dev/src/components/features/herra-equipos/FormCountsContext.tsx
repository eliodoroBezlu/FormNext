"use client";

import { createContext, useContext } from "react";

export interface FormCountsContextType {
  refreshCounts: () => Promise<void>;
}

export const FormCountsContext = createContext<FormCountsContextType | null>(null);

export function useFormCounts() {
  const context = useContext(FormCountsContext);
  return context;
}
