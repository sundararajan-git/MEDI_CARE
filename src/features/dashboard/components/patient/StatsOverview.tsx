"use client";

import { Card } from "@/components/ui/card";
import { Flame, TrendingUp } from "lucide-react";

interface StatsOverviewProps {
  streak: number;
  todayStatus: number;
  monthlyRate: number;
}

const StatsOverview = ({
  streak,
  todayStatus,
  monthlyRate,
}: StatsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      <Card className="relative overflow-hidden p-6 flex flex-col items-center justify-center gap-4 border-none shadow-lg bg-linear-to-br from-orange-100/50 to-amber-100/50 dark:from-orange-950/30 dark:to-amber-950/30 backdrop-blur-sm transition-all hover:scale-105 duration-300">
        <div className="p-3 bg-white dark:bg-orange-900/50 rounded-full shadow-sm ring-1 ring-orange-200 dark:ring-orange-800">
          <Flame className="h-8 w-8 text-orange-500" />
        </div>
        <div className="text-center z-10">
          <h3 className="text-4xl font-extrabold text-orange-600 dark:text-orange-400 font-heading">
            {streak}
          </h3>
          <p className="text-xs text-orange-600/70 dark:text-orange-300/70 uppercase tracking-widest font-semibold mt-1">
            Day Streak
          </p>
        </div>
      </Card>

      <Card className="relative overflow-hidden p-6 flex flex-col items-center justify-center gap-4 border-none shadow-lg bg-linear-to-br from-blue-100/50 to-cyan-100/50 dark:from-blue-950/30 dark:to-cyan-950/30 backdrop-blur-sm transition-all hover:scale-105 duration-300">
        <div className="relative flex items-center justify-center">
          <svg className="h-20 w-20 transform -rotate-90 drop-shadow-md">
            <circle
              className="text-blue-200 dark:text-blue-900/50"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
              r="32"
              cx="40"
              cy="40"
            />
            <circle
              className="text-blue-500 transition-all duration-1000 ease-out"
              strokeWidth="6"
              strokeDasharray={201}
              strokeDashoffset={201 - (201 * todayStatus) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="32"
              cx="40"
              cy="40"
            />
          </svg>
          <div className="absolute text-lg font-bold text-blue-700 dark:text-blue-300">
            %
          </div>
        </div>
        <h3 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 font-heading">
          {todayStatus}%
        </h3>
        <div className="text-center z-10">
          <p className="text-xs text-blue-600/70 dark:text-blue-300/70 uppercase tracking-widest font-semibold">
            Today's Goal
          </p>
        </div>
      </Card>

      <Card className="relative overflow-hidden p-6 flex flex-col items-center justify-center gap-4 border-none shadow-lg bg-linear-to-br from-emerald-100/50 to-green-100/50 dark:from-emerald-950/30 dark:to-green-950/30 backdrop-blur-sm transition-all hover:scale-105 duration-300">
        <div className="p-3 bg-white dark:bg-emerald-900/50 rounded-full shadow-sm ring-1 ring-emerald-200 dark:ring-emerald-800">
          <TrendingUp className="h-8 w-8 text-emerald-500" />
        </div>
        <div className="text-center z-10">
          <h3 className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-heading">
            {monthlyRate}%
          </h3>
          <p className="text-xs text-emerald-600/70 dark:text-emerald-300/70 uppercase tracking-widest font-semibold mt-1">
            Weekly Adherence
          </p>
        </div>
      </Card>
    </div>
  );
};

export default StatsOverview;
