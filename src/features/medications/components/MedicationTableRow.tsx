"use client";

import {
  deleteMedication,
  logMedication,
} from "@/features/medications/actions";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { CheckCircle, Trash2, Edit2, Clock } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import LogEvidenceModal from "./LogEvidenceModal";
import MedicationModal from "./MedicationModal";
import { useMedication } from "@/providers/MedicationContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, X } from "lucide-react";

import { Medication } from "@/types/medication";
import { showErrorToast } from "@/utils/helperFunctions";
import { ErrorToastType } from "@/types";

interface MedicationTableRowProps {
  id: string;
  name: string;
  time?: string;
  dosage: string;
  initialIsTaken: boolean;
  isReadOnly?: boolean;
  hideActions?: boolean;
  isHistorical?: boolean;
  status?: "taken" | "missed" | "pending" | "upcoming";
  allowDelete?: boolean;
  allowEdit?: boolean;
  fullMedicationData?: Medication;
  isManagerView?: boolean;
}

const MedicationTableRow = ({
  id,
  name,
  time,
  dosage,
  initialIsTaken,
  hideActions,
  status,
  fullMedicationData,
  isManagerView = false,
}: MedicationTableRowProps) => {
  //  refresh from custom
  const { triggerRefresh } = useMedication();
  // state of marked
  const [isTaken, setIsTaken] = useState(initialIsTaken);
  // state of loading
  const [loading, setLoading] = useState(false);
  // mark modal
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  // file preview modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  // file url
  const evidenceUrl = fullMedicationData?.evidenceUrl;

  // handle delete
  const handleDelete = async () => {
    try {
      if (!confirm("Are you sure you want to delete this medication?")) return;
      setLoading(true);
      // call server action
      const result = await deleteMedication(id);

      if (result.error) {
        toast.error(result.error);
      } else {
        triggerRefresh();
        toast.success("Medication deleted");
      }
    } catch (err) {
      showErrorToast(err as ErrorToastType);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{name}</TableCell>
      <TableCell>{time}</TableCell>
      <TableCell>{dosage}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {isTaken || status === "taken" ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-600 border border-green-500/20 shadow-sm">
              <CheckCircle className="h-3 w-3 mr-1.5" />
              Taken
            </span>
          ) : status === "missed" ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-600 border border-red-500/20 shadow-sm">
              <X className="h-3 w-3 mr-1.5" />
              Missed
            </span>
          ) : status === "pending" ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm">
              <Clock className="h-3 w-3 mr-1.5" />
              Pending
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-sm">
              Upcoming
            </span>
          )}
        </div>
      </TableCell>

      <TableCell className="text-center">
        {evidenceUrl ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 gap-2 text-blue-600 bg-blue-50/50 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100/50 mx-auto flex items-center justify-center"
            onClick={() => setIsPreviewOpen(true)}
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              View
            </span>
          </Button>
        ) : (
          <span className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-wider">
            None
          </span>
        )}
      </TableCell>

      {isManagerView ? (
        <>
          <TableCell className="text-right">
            <MedicationModal
              initialData={fullMedicationData}
              trigger={
                <Button
                  disabled={loading || isTaken || status === "missed"}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 px-2.5 gap-2 transition-all rounded-lg border-blue-100 bg-blue-50/30 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 cursor-pointer",
                    (isTaken || status === "missed") &&
                      "opacity-30 border-muted bg-muted/10 text-muted-foreground grayscale cursor-not-allowed",
                  )}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Edit
                  </span>
                </Button>
              }
            />
          </TableCell>
          <TableCell className="text-right">
            <Button
              onClick={handleDelete}
              disabled={loading}
              variant="outline"
              size="sm"
              className="h-8 px-2.5 gap-2 text-red-500 border-red-100 bg-red-50/30 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all rounded-lg cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Delete
              </span>
            </Button>
          </TableCell>
        </>
      ) : (
        !hideActions && (
          <TableCell className="text-right">
            {!isTaken && status !== "missed" && (
              <Button
                onClick={() => setIsEvidenceModalOpen(true)}
                disabled={
                  loading ||
                  (() => {
                    const [h, m] = time?.split(":") || ["08", "00"];
                    let hour = parseInt(h);
                    const isPM = time?.includes("PM");
                    if (isPM && hour < 12) hour += 12;
                    if (!isPM && hour === 12) hour = 0;
                    const now = new Date();
                    const remTime = new Date();
                    remTime.setHours(hour, parseInt(m), 0, 0);
                    return now < remTime;
                  })()
                }
                variant="default"
                size="sm"
                className="h-8 text-[11px] font-bold uppercase tracking-wider px-4 shadow-sm active:scale-95"
              >
                {(() => {
                  const [h, m] = time?.split(":") || ["08", "00"];
                  let hour = parseInt(h);
                  const isPM = time?.includes("PM");
                  if (isPM && hour < 12) hour += 12;
                  if (!isPM && hour === 12) hour = 0;
                  const now = new Date();
                  const remTime = new Date();
                  remTime.setHours(hour, parseInt(m), 0, 0);
                  return now < remTime;
                })()
                  ? "Wait for Time"
                  : "Mark Taken"}
              </Button>
            )}
            {(isTaken || status === "taken" || status === "missed") && (
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mr-2">
                Locked
              </span>
            )}
          </TableCell>
        )
      )}

      <LogEvidenceModal
        medicationId={id}
        medicationName={name}
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        onSuccess={() => {
          setIsTaken(true);
          triggerRefresh();
        }}
      />

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl border-none bg-card/95 backdrop-blur-xl p-0 overflow-hidden rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
          <DialogHeader className="p-6 flex flex-row items-center justify-between bg-white dark:bg-muted/80 border-b">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-xl font-heading font-bold">
                Verification Evidence
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Photo confirmation for {name}
              </p>
            </div>
          </DialogHeader>

          <div className="p-2 bg-muted/20">
            <div className="relative w-full overflow-hidden rounded-2xl border shadow-inner bg-black flex items-center justify-center">
              <img
                src={evidenceUrl}
                alt="Medication Evidence"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          </div>

          <div className="p-4 flex justify-end bg-muted/10 border-t">
            <Button
              onClick={() => setIsPreviewOpen(false)}
              variant="outline"
              className="rounded-full px-6"
            >
              Close Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TableRow>
  );
};

export default MedicationTableRow;
