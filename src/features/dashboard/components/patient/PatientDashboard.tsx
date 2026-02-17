"use client";

import CalendarView from "./CalendarView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense, useEffect, useState } from "react";
import MedicationTable from "@/features/medications/components/MedicationTable";
import { ListTodo, Calendar, Loader2, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MedicationProvider } from "@/providers/MedicationContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MetricCard from "../shared/MetricCard";
import { Flame, CheckCircle2, AlertCircle } from "lucide-react";
import { fetchStats, setSelectedDate } from "@/store/features/medicationSlice";
import { selectDisplayName } from "@/store/features/userSlice";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { TrendingUp, RefreshCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

const PatientDashboard = ({ selectedDate }: { selectedDate?: string }) => {
  // dis hook
  const dispatch = useDispatch<AppDispatch>();
  const {
    stats,
    statsLoading: loading,
    error,
  } = useSelector((state: RootState) => state.medication);

  // dis selected date
  useEffect(() => {
    dispatch(setSelectedDate(selectedDate || null));
  }, [dispatch, selectedDate]);

  useEffect(() => {
    dispatch(fetchStats(undefined));
  }, [dispatch]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const greeting =
      hour < 12
        ? "Good Morning"
        : hour < 18
          ? "Good Afternoon"
          : "Good Evening";
    return `${greeting}!`;
  };

  const defaultTab = selectedDate ? "activity" : "today";

  // loading stage - check if loading OR if it's the initial state (no stats and no error yet)
  if (loading || (!stats && !error)) {
    return (
      <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-64" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10 w-125" />
          <Skeleton className="h-100 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 text-center">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  const {
    streak = 0,
    todayStatus = 0,
    monthlyRate = 0,
    missedThisMonth = 0,
  } = stats;

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1 cursor-default">
          <div className="flex items-center gap-2 text-primary font-semibold mb-1">
            <Activity className="h-4 w-4" />
            <span className="uppercase tracking-widest text-[10px] font-bold">
              Patient Perspective
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-heading tracking-tight bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent py-2">
            {getGreeting()}
          </h1>
          <p className="text-muted-foreground text-lg font-sans">
            Guiding <span className="text-foreground font-medium">your</span>{" "}
            path towards recovery.
          </p>
        </div>
        <Button
          onClick={() => dispatch(fetchStats(undefined))}
          variant="outline"
          size="sm"
          className="h-10 px-4 gap-2 rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-all font-bold uppercase tracking-wider text-[10px]"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Sync Data
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary/60" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] font-heading py-2">
            Status Trend
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Today's Goal"
            value={`${todayStatus}%`}
            progress={todayStatus}
            icon={<Activity />}
            color="blue"
          />
          <MetricCard
            title="Monthly Adherence"
            value={`${monthlyRate}%`}
            progress={monthlyRate}
            icon={<CheckCircle2 />}
            color="green"
          />
          <MetricCard
            title="Monthly Missed"
            value={missedThisMonth}
            icon={<AlertCircle />}
            color="red"
          />
          <MetricCard
            title="Active Streak"
            value={streak}
            icon={<Flame />}
            color="orange"
          />
        </div>
        <br />
        <br />

        <Card className="border-none shadow-sm bg-card/40 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Weekly Trends
                </CardTitle>
                <CardDescription>
                  Your consistency over the last 7 days
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-tighter text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                  Perfect
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  Partial
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-muted shadow-inner" />
                  Missed
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-6 pb-6">
            <div className="flex items-end justify-between h-30 gap-2 md:gap-4 relative">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.03]">
                <div className="w-full border-t border-foreground" />
                <div className="w-full border-t border-foreground" />
                <div className="w-full border-t border-foreground" />
              </div>
              {(stats.history || []).slice(-7).map((day, idx: number) => {
                const dayName = format(parseISO(day.date), "EEE");
                const height =
                  day.total > 0 ? (day.taken / day.total) * 100 : 0;
                const isPerfect = day.total > 0 && day.taken === day.total;
                const isPartial = day.taken > 0 && day.taken < day.total;

                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end"
                  >
                    <div className="relative w-full max-w-12 h-full flex items-end justify-center">
                      <div
                        className={cn(
                          "w-full rounded-t-lg transition-all duration-1000 ease-out group-hover:opacity-90 relative",
                          isPerfect
                            ? "bg-linear-to-t from-primary/80 to-primary shadow-lg shadow-primary/20"
                            : isPartial
                              ? "bg-linear-to-t from-amber-500/80 to-amber-400 shadow-lg shadow-amber-500/20"
                              : "bg-muted/40",
                        )}
                        style={{
                          height:
                            day.total > 0 ? `${Math.max(height, 8)}%` : "8%",
                        }}
                      >
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold py-1 px-2 rounded-md shadow-xl opacity-0 scale-100 group-hover:opacity-100 group-hover:scale-100 transition-all z-20 whitespace-nowrap pointer-events-none border border-border">
                          {day.taken}/{day.total} taken
                        </div>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-black tracking-tighter uppercase",
                        idx === 6 ? "text-primary" : "text-muted-foreground/60",
                      )}
                    >
                      {idx === 6 ? "Today" : dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="bg-transparent w-full justify-start h-auto p-0 space-x-2 mb-4 border-b rounded-none pb-4">
          <TabsTrigger
            value="today"
            className="rounded-lg border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-6 py-2.5 font-medium text-muted-foreground hover:bg-muted/50 transition-all flex items-center gap-2"
          >
            <ListTodo className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="rounded-lg border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-6 py-2.5 font-medium text-muted-foreground hover:bg-muted/50 transition-all flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            History & Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="today"
          className="space-y-6 mt-8 animate-in fade-in-50 duration-300"
        >
          <div className="flex flex-col gap-4">
            <Suspense
              fallback={
                <div className="p-8 text-center text-muted-foreground border rounded-xl bg-muted/5">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 opacity-50" />
                  Loading schedule...
                </div>
              }
            >
              <MedicationTable />
            </Suspense>
          </div>
        </TabsContent>

        <TabsContent
          value="activity"
          className="mt-8 animate-in fade-in-50 duration-300"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            <div className="flex flex-col gap-6">
              <Suspense
                fallback={
                  <div className="p-8 text-center text-muted-foreground border rounded-lg bg-muted/5">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 opacity-50" />
                    Loading details...
                  </div>
                }
                key={selectedDate || "today"}
              >
                <MedicationTable
                  dateStr={selectedDate || format(new Date(), "yyyy-MM-dd")}
                  hideActions={true}
                />
              </Suspense>
            </div>
            <CalendarView
              history={stats.history || []}
              selectedDate={selectedDate || format(new Date(), "yyyy-MM-dd")}
            />
          </div>
          <br />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDashboard;
