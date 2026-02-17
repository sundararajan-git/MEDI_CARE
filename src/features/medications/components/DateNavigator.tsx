"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const DateNavigator = () => {
  // navigation
  const router = useRouter();
  // page params
  const searchParams = useSearchParams();
  // get date
  const dateStr = searchParams.get("date");

  const currentDate = dateStr ? new Date(dateStr) : new Date();

  // format
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // prev month handler
  const handlePrev = () => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(currentDate.getDate() - 1);
    // update on page url
    router.push(`/?date=${formatDate(prevDate)}`);
  };

  // next month handler
  const handleNext = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);
    // update on page url
    router.push(`/?date=${formatDate(nextDate)}`);
  };

  // today date
  const todayStr = formatDate(new Date());
  // current clicked date
  const currentStr = formatDate(currentDate);

  const isToday = currentStr === todayStr;

  return (
    <div className="flex items-center justify-between bg-card border rounded-lg p-2 mb-4 w-full text-card-foreground">
      <Button variant="ghost" size="icon" onClick={handlePrev}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="font-semibold font-heading">
        {isToday ? "Today, " : ""}
        {currentDate.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        disabled={isToday}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DateNavigator;
