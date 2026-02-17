"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddMedicationForm from "./AddMedicationForm";
import { useState } from "react";

import { Medication } from "@/types/medication";

interface MedicationModalProps {
  initialData?: Partial<Medication>;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const MedicationModal = ({
  trigger,
  initialData,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: MedicationModalProps) => {
  // state of the modal
  const [open, setOpen] = useState(false);
  // state of create | update
  const isEditing = !!initialData;

  const isOpen = controlledOpen !== undefined ? controlledOpen : open;
  const onOpenChange =
    controlledOnOpenChange !== undefined ? controlledOnOpenChange : setOpen;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="sm"
            className="rounded-full gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Medication
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            {isEditing ? "Edit Medication" : `Add Medication for`}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this medication."
              : "Fill in the details below to add a new medication to the schedule."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {/* form of create and update */}
          <AddMedicationForm
            initialData={initialData}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MedicationModal;
