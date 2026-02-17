"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  ReactNode,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchMedications, fetchStats } from "@/store/features/medicationSlice";
import { checkMissedDosesAndNotify } from "@/features/notifications/actions";
import { debounce } from "@/lib/utils";
import { useEffect } from "react";

interface MedicationContextType {
  triggerRefresh: () => void;
}

const MedicationContext = createContext<MedicationContextType | undefined>(
  undefined,
);

export const MedicationProvider = ({ children }: { children: ReactNode }) => {
  // dispatch for med update
  const dispatch = useDispatch<AppDispatch>();
  // get date
  const selectedDate = useSelector(
    (state: RootState) => state.medication.selectedDate,
  );

  useEffect(() => {
    // if missed med sent alert email
    checkMissedDosesAndNotify();
  }, []);

  // refresh handler
  const triggerRefresh = useCallback(
    debounce(() => {
      dispatch(fetchMedications(selectedDate || undefined));
      dispatch(fetchStats(undefined));
    }, 300),
    [dispatch, selectedDate],
  );

  return (
    <MedicationContext.Provider value={{ triggerRefresh }}>
      {children}
    </MedicationContext.Provider>
  );
};

// custom hooks for context
export function useMedication() {
  const context = useContext(MedicationContext);
  if (context === undefined) {
    throw new Error("useMedication must be used within a MedicationProvider");
  }
  return context;
}
