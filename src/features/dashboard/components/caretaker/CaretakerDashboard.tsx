"use client";

import React, { Suspense, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Flame,
  History,
  Bell,
  Settings,
  TrendingUp,
  Mail,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchStats } from "@/store/features/medicationSlice";
import CalendarView from "../patient/CalendarView";
import MedicationTable from "@/features/medications/components/MedicationTable";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { checkMissedDosesAndNotify } from "@/features/notifications/actions";
import { PatientStats } from "@/types/medication";
import { useMedication } from "@/providers/MedicationContext";
import { getPatientStats } from "@/features/dashboard/actions";
import CaretakerSettings from "./CaretakerSettings";
import MedicationModal from "@/features/medications/components/MedicationModal";
import MetricCard from "../shared/MetricCard";
import QuickActionCard from "./QuickActionCard";
import MedicationTimelineSummary from "./MedicationTimelineSummary";
import toast from "react-hot-toast";

interface CaretakerDashboardProps {
  stats?: PatientStats;
  selectedDate?: string;
  patientName?: string;
}

const CaretakerDashboard = ({
  stats: initialStats,
  selectedDate,
  patientName,
}: CaretakerDashboardProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    stats,
    statsLoading: loading,
    error,
  } = useSelector((state: RootState) => state.medication);

  const [activeTab, setActiveTab] = useState("overview");
  const { triggerRefresh } = useMedication();
  const { user: currentUser } = useSelector((state: RootState) => state.user);

  const handleSettingsClick = React.useCallback(
    () => setActiveTab("settings"),
    [],
  );
  const handleActivityClick = React.useCallback(
    () => setActiveTab("activity"),
    [],
  );
  const handleManagementClick = React.useCallback(
    () => setActiveTab("management"),
    [],
  );

  useEffect(() => {
    dispatch(fetchStats(undefined));
  }, [dispatch]);

  if (loading && !stats) {
    return (
      <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-80" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-125" />
          <Skeleton className="h-100 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 text-center">
        {error || "Unable to load patient data. Please try again later."}
      </div>
    );
  }

  const {
    streak = 0,
    todayStatus = 0,
    monthlyRate = 0,
    missedThisMonth = 0,
    history = [],
    email,
  } = stats;

  const deriveDisplayName = (emailAddr?: string) => {
    if (!emailAddr) return "Patient";
    return emailAddr
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const patientDisplayName =
    patientName && patientName !== "Patient"
      ? patientName
      : email
        ? deriveDisplayName(email)
        : deriveDisplayName(currentUser?.email || undefined);

  const effectiveDate = selectedDate || format(new Date(), "yyyy-MM-dd");

  const handleSync = async () => {
    toast.loading("Syncing medication status...", { id: "sync" });
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
      await checkMissedDosesAndNotify(clientInfo);
      triggerRefresh();
      toast.success("Medications synced successfully!", { id: "sync" });
    } catch (error) {
      toast.error("Failed to sync medications", { id: "sync" });
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary font-semibold mb-1">
            <Activity className="h-4 w-4" />
            <span className="uppercase tracking-widest text-[10px] font-bold">
              Caretaker Perspective
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-heading tracking-tight bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent py-2">
            Monitoring
          </h1>
          <p className="text-muted-foreground text-lg">
            Guiding{" "}
            <span className="text-foreground font-medium">
              {patientDisplayName}
            </span>{" "}
            towards recovery.
          </p>
        </div>
        <Button
          onClick={handleSync}
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
                  Consistency over the last 7 days
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
              {history.slice(-7).map((day, idx: number) => {
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
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold py-1 px-2 rounded-md shadow-xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all z-20 whitespace-nowrap pointer-events-none border border-border">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent w-full justify-start h-auto p-0 space-x-2 mb-8 border-b rounded-none  pb-4">
          <TabsTrigger
            value="overview"
            className="rounded-lg border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-6 py-2.5 font-medium text-muted-foreground hover:bg-muted/50 transition-all flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="rounded-lg border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-6 py-2.5 font-medium text-muted-foreground hover:bg-muted/50 transition-all flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            History & Logs
          </TabsTrigger>
          <TabsTrigger
            value="management"
            className="rounded-lg border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-6 py-2.5 font-medium text-muted-foreground hover:bg-muted/50 transition-all flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Manager
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-lg border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-6 py-2.5 font-medium text-muted-foreground hover:bg-muted/50 transition-all flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notification
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="overview"
          className="space-y-6 mt-8 animate-in fade-in duration-500"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl overflow-hidden group/card relative">
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                        <Clock className="h-5 w-5" />
                      </div>
                      Today's Dose Timeline
                    </CardTitle>
                    <span className="text-[10px] uppercase tracking-widest bg-primary/10 text-primary px-3 py-1.5 rounded-full font-black">
                      {format(new Date(), "yyyy-MM-dd")}
                    </span>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                    Real-time medication monitoring for {patientDisplayName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10 px-6 pb-8">
                  <Suspense
                    fallback={
                      <div className="flex flex-col items-center justify-center p-12 gap-3 opacity-20">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                          Building Timeline...
                        </span>
                      </div>
                    }
                  >
                    <MedicationTimelineSummary
                      dateStr={format(new Date(), "yyyy-MM-dd")}
                    />
                  </Suspense>
                </CardContent>
                <div className="absolute -bottom-12 -left-12 size-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              </Card>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <QuickActionCard
                  title="Reminder"
                  desc="Sync meds"
                  icon={<Mail />}
                  color="blue"
                  onClick={handleSync}
                />
                <QuickActionCard
                  title="Notification"
                  desc="Notify config"
                  icon={<Bell />}
                  color="slate"
                  onClick={handleSettingsClick}
                />
                <QuickActionCard
                  title="Logs"
                  desc="History"
                  icon={<Calendar />}
                  color="primary"
                  onClick={handleActivityClick}
                />
                <QuickActionCard
                  title="Schedule"
                  desc="Add/Edit"
                  icon={<Settings />}
                  color="green"
                  onClick={handleManagementClick}
                />
              </div>

              <Card className="border-none shadow-xl bg-linear-to-br from-primary/10 via-blue-600/5 to-transparent p-6 relative overflow-hidden group ring-1 ring-primary/10">
                <div className="absolute -bottom-2 -right-2 opacity-5 scale-150 group-hover:scale-110 transition-transform duration-1000">
                  <Activity className="size-24" />
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-primary to-blue-600 flex items-center justify-center text-primary-foreground text-3xl font-black shadow-lg shadow-primary/30 ring-4 ring-white/10 dark:ring-black/20">
                      {patientDisplayName?.charAt(0).toUpperCase() || "P"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-green-500 border-4 border-card ring-1 ring-green-600/20" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xl font-black font-heading tracking-tight">
                      {patientDisplayName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.15em]">
                        Active Patient
                      </span>
                      <div className="size-1 rounded-full bg-muted-foreground/30" />
                      <span className="text-[10px] text-primary font-black uppercase tracking-widest">
                        {streak} Day Streak
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-primary/10 space-y-4 relative z-10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <Activity className="size-3.5 text-blue-500" />
                      Health Score
                    </span>
                    <span className="font-bold text-primary">
                      {monthlyRate}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-primary/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-1000"
                      style={{ width: `${monthlyRate}%` }}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="activity"
          className="mt-8 animate-in fade-in duration-500"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            <div className="flex flex-col gap-4">
              <MedicationTable
                dateStr={effectiveDate}
                hideActions={true}
                variant="minimal"
              />
            </div>
            <div className="space-y-6">
              <CalendarView history={history} selectedDate={effectiveDate} />
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="management"
          className="mt-0 animate-in fade-in duration-500"
        >
          <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold font-heading">
                  Medication Manager
                </h3>
                <p className="text-sm text-muted-foreground font-heading">
                  Manage schedule and settings
                </p>
              </div>
              <MedicationModal />
            </div>

            <div className="space-y-8">
              <div className="border-t pt-8">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center p-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
                    </div>
                  }
                >
                  <MedicationTable
                    allowDelete={true}
                    allowEdit={true}
                    variant="manager"
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="settings"
          className="mt-8 animate-in fade-in duration-500"
        >
          <CaretakerSettings patientName={patientDisplayName} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaretakerDashboard;
