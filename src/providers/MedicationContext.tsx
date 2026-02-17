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
    const runCheck = async () => {
      const now = new Date();
      const clientInfo = JSON.stringify({
        now: now.toISOString(),
        localDate: new Date(now.getTime() - now.getTimezoneOffset() * 60000)
          .toISOString()
          .split("T")[0],
        localTime:
          now.getHours().toString().padStart(2, "0") +
          ":" +
          now.getMinutes().toString().padStart(2, "0"),
      });
      await checkMissedDosesAndNotify(clientInfo);
    };

    // Run on mount
    runCheck();

    // Set up polling every 15 minutes (900,000 ms) while the tab is open
    const interval = setInterval(runCheck, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // refresh handler
  const triggerRefresh = useCallback(
    debounce(() => {
      dispatch(fetchMedications(selectedDate || undefined));
      dispatch(fetchStats(undefined));

      // Also trigger a notification check on manual refresh
      const now = new Date();
      const clientInfo = JSON.stringify({
        now: now.toISOString(),
        localDate: new Date(now.getTime() - now.getTimezoneOffset() * 60000)
          .toISOString()
          .split("T")[0],
        localTime:
          now.getHours().toString().padStart(2, "0") +
          ":" +
          now.getMinutes().toString().padStart(2, "0"),
      });
      checkMissedDosesAndNotify(clientInfo);
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
