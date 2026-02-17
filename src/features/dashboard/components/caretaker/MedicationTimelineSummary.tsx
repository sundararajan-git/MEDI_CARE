import { useState, useEffect, memo } from "react";
import { Loader2, Clock, CheckCircle, X } from "lucide-react";
import { Medication } from "@/types/medication";
import { getMedications } from "@/features/medications/actions";
import { cn } from "@/lib/utils";

function MedicationTimelineSummary({ dateStr }: { dateStr: string }) {
  // meds data
  const [meds, setMeds] = useState<Medication[]>([]);
  // state of loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeds() {
      try {
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
        const res = await getMedications(dateStr, clientInfo);
        if (res.success && Array.isArray(res.data)) {
          setMeds(res.data as Medication[]);
        }
      } catch (error) {
        console.error("Failed to fetch medications for summary:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMeds();
  }, [dateStr]);

  // loading stage
  if (loading)
    return (
      <div className="flex justify-center p-8 opacity-20">
        <Loader2 className="animate-spin" />
      </div>
    );

  // empty
  if (meds.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-40 italic">
        <div className="size-12 rounded-full border-2 border-dashed border-muted flex items-center justify-center">
          <Clock className="size-5" />
        </div>
        <span className="text-sm font-medium">No schedule today</span>
      </div>
    );

  const takenCount = meds.filter((m) => m.status === "taken").length;
  const progress = (takenCount / meds.length) * 100;

  return (
    <div className="space-y-6">
      <div className="bg-muted/10 p-4 rounded-2xl border border-muted/5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Completion Rate
          </span>
          <span className="text-[10px] font-black text-primary">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-primary to-blue-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="relative pl-6 ml-2 space-y-8">
        <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-linear-to-b from-primary/30 via-muted/20 to-transparent" />

        {meds.slice(0, 5).map((med, idx) => {
          return (
            <div key={med.id} className="relative group/item">
              <div
                className={cn(
                  "absolute -left-6 top-1.5 size-2 rounded-full ring-4 ring-card z-10 transition-all",
                  med.status === "taken"
                    ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                    : med.status === "missed"
                      ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                      : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] animate-pulse",
                )}
              />

              <div className="flex items-center justify-between group-hover/item:translate-x-1 transition-transform">
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "text-sm font-bold tracking-tight",
                      med.status === "taken"
                        ? "text-muted-foreground line-through"
                        : "text-foreground",
                    )}
                  >
                    {med.name}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      {med.reminder_time}
                    </span>
                    <div className="size-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-[10px] font-bold text-muted-foreground/40">
                      {med.dosage}
                    </span>
                  </div>
                </div>

                <div
                  className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm",
                    med.status === "taken"
                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                      : med.status === "missed"
                        ? "bg-red-500/10 text-red-600 border-red-500/20"
                        : med.status === "pending"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20",
                  )}
                >
                  {med.status === "taken" ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1.5" />
                      Taken
                    </>
                  ) : med.status === "missed" ? (
                    <>
                      <X className="h-3 w-3 mr-1.5" />
                      Missed
                    </>
                  ) : med.status === "pending" ? (
                    <>
                      <Clock className="h-3 w-3 mr-1.5" />
                      Pending
                    </>
                  ) : (
                    "Upcoming"
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {meds.length > 5 && (
          <div className="pt-2 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
              + {meds.length - 5} more doses
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(MedicationTimelineSummary);
