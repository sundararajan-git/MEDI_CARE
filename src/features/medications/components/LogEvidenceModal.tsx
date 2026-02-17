"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, CheckCircle2, Loader2 } from "lucide-react";
import { logMedication, uploadEvidence } from "@/features/medications/actions";
import { useMedication } from "@/providers/MedicationContext";
import toast from "react-hot-toast";

interface LogEvidenceModalProps {
  medicationId: string;
  medicationName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LogEvidenceModal = ({
  medicationId,
  medicationName,
  isOpen,
  onClose,
  onSuccess,
}: LogEvidenceModalProps) => {
  // refresh fn from context handler
  const { triggerRefresh } = useMedication();
  // file state
  const [file, setFile] = useState<File | null>(null);
  // preview state
  const [preview, setPreview] = useState<string | null>(null);
  // loading state
  const [loading, setLoading] = useState(false);
  // file ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // file handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // remove handler
  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // handle submit
  const handleSubmit = async () => {
    try {
      // trigger
      setLoading(true);

      let finalUrl = undefined;

      // if file upload and get file url
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadResult = await uploadEvidence(formData);

        if (uploadResult.error) {
          toast.error(`Upload failed: ${uploadResult.error}`);
          setLoading(false);
          return;
        }
        finalUrl = uploadResult.url;
      }

      // log
      const result = await logMedication(medicationId, finalUrl);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Medication verified and logged!");
        triggerRefresh();
        onSuccess();
        onClose();
        removeFile();
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-none shadow-2xl bg-card/95 backdrop-blur-xl animate-in zoom-in-95 duration-300">
        {/* header */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-heading">
            Verify Dosage
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-sans">
            Please upload a photo of{" "}
            <span className="text-foreground font-semibold">
              {medicationName}
            </span>{" "}
            to confirm it's been taken.
          </DialogDescription>
        </DialogHeader>

        {/* body */}
        <div className="py-6 flex flex-col items-center justify-center gap-4">
          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/10 hover:border-primary/30 transition-all group"
            >
              <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                <Camera className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">
                  Click to take or upload a photo
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or GIF (max. 5MB)
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border shadow-lg animate-in fade-in duration-500">
              <img
                src={preview}
                alt="Evidence preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
              <Button
                onClick={removeFile}
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* footer */}
        <DialogFooter className="sm:justify-between gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="font-semibold rounded-xl"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="gap-2 font-bold px-8 shadow-lg shadow-primary/20 rounded-xl"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {loading ? "Verifying..." : "Confirm & Mark Taken"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogEvidenceModal;
