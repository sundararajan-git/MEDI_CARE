"use client";

import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import MetricCard from "./MetricCard";
import { Flame, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { PatientStats } from "@/types/medication";

interface DashboardLayoutProps {
  stats?: PatientStats;
  loading: boolean;
  error?: string | null;
  children: ReactNode;
  userName?: string;
  greeting?: string;
}

const DashboardLayout = ({
  stats,
  loading,
  error,
  children,
  userName = "User",
  greeting = "Welcome back",
}: DashboardLayoutProps) => {
  // loading stage
  if (loading) {
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

  //   error stage
  if (error || !stats) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 text-center">
        {error || "Unable to load dashboard data. Please try again later."}
      </div>
    );
  }

  const {
    streak = 0,
    todayStatus = 0,
    monthlyRate = 0,
    missedThisMonth = 0,
  } = stats;

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">{greeting}</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {userName}
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Flame />}
          title="Current Streak"
          value={streak}
          color="orange"
        />
        <MetricCard
          icon={<CheckCircle2 />}
          title="Today's Status"
          value={`${todayStatus}%`}
          progress={todayStatus}
          color="green"
        />
        <MetricCard
          icon={<TrendingUp />}
          title="Monthly Rate"
          value={Math.round(monthlyRate)}
          color="blue"
        />
        <MetricCard
          icon={<AlertCircle />}
          title="Missed This Month"
          value={missedThisMonth}
          color="red"
        />
      </div>

      {/* Tabs Content */}
      {children}
    </div>
  );
};

export default DashboardLayout;
