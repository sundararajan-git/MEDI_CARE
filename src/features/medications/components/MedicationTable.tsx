"use client";

import { FaTablets } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import MedicationTableRow from "./MedicationTableRow";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchMedications,
  setSelectedDate,
} from "@/store/features/medicationSlice";

interface MedicationTableProps {
  dateStr?: string;
  hideActions?: boolean;
  allowDelete?: boolean;
  allowEdit?: boolean;
  variant?: "default" | "minimal" | "manager";
}

const MedicationTable = ({
  dateStr,
  hideActions = false,
  variant = "default",
  allowDelete = false,
  allowEdit = false,
}: MedicationTableProps) => {
  // dispatch
  const dispatch = useDispatch<AppDispatch>();
  const { medications, loading, error } = useSelector(
    (state: RootState) => state.medication,
  );

  useEffect(() => {
    // fetch
    dispatch(fetchMedications(dateStr));
    dispatch(setSelectedDate(dateStr || null));
  }, [dateStr, dispatch]);

  // loading stage - check if loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground bg-muted/5 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
        <span className="text-sm font-medium">Loading schedule...</span>
      </div>
    );
  }

  // error stage
  if (error) {
    return (
      <div className="text-red-500 p-6 border rounded-xl border-red-200 bg-red-50 flex items-center gap-3">
        <div className="p-2 bg-red-100 rounded-lg">
          <Loader2 className="h-5 w-5 animate-spin text-red-600" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Error loading medications</span>
          <span className="text-sm opacity-80">{error}</span>
        </div>
      </div>
    );
  }

  // zero med stage
  if (medications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/5">
        <div className="p-4 bg-muted/10 rounded-full mb-4">
          <FaTablets className="h-8 w-8 opacity-20" />
        </div>
        <h4 className="text-lg font-bold">No Medications Found</h4>
        <p className="text-sm text-muted-foreground max-w-62.5 mt-1">
          {dateStr
            ? `No schedule recorded for ${dateStr}.`
            : "There are no medications scheduled for today."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {(variant === "default" || variant === "minimal") && (
        <div className="px-1">
          <h3 className="text-lg font-heading font-semibold text-foreground/90">
            {dateStr ? `Medications for ${dateStr}` : `Today Medications`}
          </h3>
          <p className="text-sm text-muted-foreground font-sans opacity-70">
            {dateStr
              ? "Historical adherence data"
              : "Manage daily adherence and monitoring"}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-muted-foreground/10 bg-card/30 backdrop-blur-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent border-b border-muted-foreground/10">
                <TableHead className="w-45 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                  Medication
                </TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                  Time
                </TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                  Dosage
                </TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                  Status
                </TableHead>
                <TableHead className="text-center text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                  File
                </TableHead>
                {variant === "manager" ? (
                  <>
                    <TableHead className="text-right text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                      Edit
                    </TableHead>
                    <TableHead className="text-right text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                      Delete
                    </TableHead>
                  </>
                ) : (
                  !hideActions && (
                    <TableHead className="text-right text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                      Action
                    </TableHead>
                  )
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {medications
                .filter((med) => {
                  if (variant === "manager") return !med.deleted_at;
                  return true;
                })
                .map((med) => {
                  const [h, m] = med.reminder_time?.split(":") || ["08", "00"];
                  const hour = parseInt(h);
                  const ampm = hour >= 12 ? "PM" : "AM";
                  const formattedTime = `${hour % 12 || 12}:${m || "00"} ${ampm}`;

                  return (
                    <MedicationTableRow
                      key={`${med.id}-${dateStr || "today"}`}
                      id={med.id}
                      name={med.name}
                      time={formattedTime}
                      dosage={med.dosage}
                      initialIsTaken={med.status === "taken"}
                      isReadOnly={med.isReadOnly}
                      hideActions={hideActions}
                      status={med.status}
                      allowDelete={allowDelete}
                      allowEdit={allowEdit}
                      fullMedicationData={med}
                      isManagerView={variant === "manager"}
                    />
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default MedicationTable;
