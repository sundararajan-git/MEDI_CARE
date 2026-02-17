"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MedicationFormData,
  medicationSchema,
} from "@/lib/zod/medicationSchema";
import {
  addMedication,
  updateMedication,
} from "@/features/medications/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import toast from "react-hot-toast";
import { useMedication } from "@/providers/MedicationContext";
import { Medication } from "@/types/medication";
import { showErrorToast } from "@/utils/helperFunctions";
import { ErrorToastType } from "@/types";

interface AddMedicationFormProps {
  initialData?: Partial<Medication>;
  onSuccess?: () => void;
}

const AddMedicationForm = ({
  onSuccess,
  initialData,
}: AddMedicationFormProps) => {
  // refresh fn from context hook
  const { triggerRefresh } = useMedication();
  // state of loading btn
  const [loading, setLoading] = useState(false);
  // state update or create
  const isEditing = !!initialData;
  // form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: initialData?.name || "",
      dosage: initialData?.dosage || "",
      reminder_time: initialData?.reminder_time?.slice(0, 5) || "",
    },
  });

  // submit  handler
  const onSubmit = async (data: MedicationFormData) => {
    try {
      // Validate past time client-side
      const now = new Date();
      const [hours, minutes] = data.reminder_time.split(":").map(Number);
      const selectedTime = new Date();
      selectedTime.setHours(hours, minutes, 0, 0);

      const nowForComparison = new Date(now);
      nowForComparison.setSeconds(0, 0);

      if (selectedTime < nowForComparison) {
        toast.error(`Time (${data.reminder_time}) cannot be in the past.`);
        return;
      }

      // trigger
      setLoading(true);
      // store result
      let result;
      if (isEditing && initialData?.id) {
        result = await updateMedication(initialData.id, data);
      } else {
        result = await addMedication(data);
      }

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isEditing ? "Medication updated!" : "Medication added!");
        triggerRefresh();
        if (!isEditing) reset();
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      showErrorToast(err as ErrorToastType);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            Medication Name
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="e.g. Aspirin"
            className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
          />
          {errors.name && (
            <p className="text-xs text-destructive font-medium">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="dosage"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Dosage
            </Label>
            <Input
              id="dosage"
              {...register("dosage")}
              placeholder="e.g. 500mg"
              className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
            />
            {errors.dosage && (
              <p className="text-xs text-destructive font-medium">
                {errors.dosage.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="reminder_time"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Reminder Time
            </Label>
            <Input
              id="reminder_time"
              type="time"
              min={new Date().toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {...register("reminder_time")}
              className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
            />
            {errors.reminder_time && (
              <p className="text-xs text-destructive font-medium">
                {errors.reminder_time.message}
              </p>
            )}
          </div>
        </div>
        <Button
          type="submit"
          className="w-full shadow-lg shadow-primary/20 font-bold"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {isEditing ? "Updating..." : "Adding..."}
            </span>
          ) : isEditing ? (
            "Update Medication"
          ) : (
            "Add Medication"
          )}
        </Button>
      </form>
    </div>
  );
};

export default AddMedicationForm;
