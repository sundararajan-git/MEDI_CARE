"use client";

import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HistoryEntry } from "@/types/medication";

interface CalendarViewProps {
  history: HistoryEntry[];
  selectedDate?: string;
}

const CalendarView = ({ history, selectedDate }: CalendarViewProps) => {
  // navigation
  const router = useRouter();
  // get params
  const searchParams = useSearchParams();
  const selected = selectedDate
    ? new Date(selectedDate + "T00:00:00")
    : undefined;
  //  current selected month
  const [viewMonth, setViewMonth] = useState<Date>(selected || new Date());

  const currentViewYear = viewMonth.getFullYear();
  const fromYear = currentViewYear - 5;
  const toYear = currentViewYear + 5;

  useEffect(() => {
    // update view month
    if (selected) {
      setViewMonth(selected);
    }
  }, [selectedDate]);

  // select handler
  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    const dateStr = format(date, "yyyy-MM-dd");
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", dateStr);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  //  get info
  const getDayInfo = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return history.find((h) => h.date === dateStr);
  };

  return (
    <Card className="overflow-hidden border-none shadow-lg bg-linear-to-br from-card/40 to-muted/20 backdrop-blur-sm rounded-2xl transition-all duration-300 gap-0">
      {/* header */}
      <CardHeader>
        <CardTitle className="text-xl font-heading flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Calendar
        </CardTitle>
      </CardHeader>

      {/* body */}
      <CardContent className="p-0">
        <div className="w-full">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            month={viewMonth}
            onMonthChange={setViewMonth}
            captionLayout="dropdown"
            fromYear={fromYear}
            toYear={toYear}
            className="w-full"
            classNames={{
              day: "relative p-0 text-center group/day aspect-square select-none max-w-[50px] mx-auto ring-0",
            }}
            components={{
              DayButton: ({ className, day, modifiers, ...props }) => {
                const dayInfo = getDayInfo(day.date);
                const isSelected = modifiers.selected;
                const hasTaken = dayInfo?.hasTaken;
                const hasMissed = dayInfo?.hasMissed;

                return (
                  <CalendarDayButton
                    {...props}
                    day={day}
                    modifiers={modifiers}
                    className={cn(
                      "relative aspect-square size-auto w-full font-bold transition-all duration-300 hover:bg-white/10 rounded-md flex flex-col items-center justify-center gap-1 border-none focus:border-none cursor-pointer shadow-none",
                      isSelected &&
                        "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105 z-10 hover:bg-primary rounded-md",
                      modifiers.today &&
                        !isSelected &&
                        "bg-primary/10 text-primary-foreground rounded-md",
                      className,
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm sm:text-base tracking-tight",
                        (hasTaken || hasMissed) && !isSelected && "mb-1",
                      )}
                    >
                      {format(day.date, "d")}
                    </span>
                    <div className="absolute bottom-1.5 flex gap-1">
                      {dayInfo?.status === "complete" && !isSelected && (
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                      )}
                      {dayInfo?.hasMissed && !isSelected && (
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                      )}
                    </div>
                  </CalendarDayButton>
                );
              },
            }}
          />
        </div>

        <div className="flex gap-8 w-full text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 justify-center">
          <div className="flex items-center gap-2 group transition-all cursor-default">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm" />
            <span>Taken</span>
          </div>
          <div className="flex items-center gap-2 group transition-all cursor-default">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm" />
            <span>Missed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarView;
