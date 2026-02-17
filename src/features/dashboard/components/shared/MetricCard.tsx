import React, { memo } from "react";
import { Card } from "@/components/ui/card";

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: "blue" | "orange" | "red" | "green";
  progress?: number;
}

function MetricCard({ title, value, icon, color, progress }: MetricCardProps) {
  const colorMap: Record<string, string> = {
    blue: "bg-gradient-to-br from-blue-100/50 to-cyan-100/50 dark:from-blue-950/30 dark:to-cyan-950/30",
    orange:
      "bg-gradient-to-br from-orange-100/50 to-amber-100/50 dark:from-orange-950/30 dark:to-amber-950/30",
    red: "bg-gradient-to-br from-red-100/50 to-rose-100/50 dark:from-red-950/30 dark:to-rose-950/30",
    green:
      "bg-gradient-to-br from-emerald-100/50 to-green-100/50 dark:from-emerald-950/30 dark:to-green-950/30",
  };

  const textColorMap: Record<string, string> = {
    blue: "text-blue-700 dark:text-blue-300",
    orange: "text-orange-700 dark:text-orange-400",
    red: "text-red-700 dark:text-rose-400",
    green: "text-emerald-700 dark:text-emerald-400",
  };

  return (
    <Card
      className={`relative overflow-hidden p-6 flex flex-col items-center justify-center gap-4 border-none shadow-lg ${colorMap[color]} backdrop-blur-sm transition-all hover:scale-105 duration-300 min-h-40`}
    >
      {progress !== undefined ? (
        <>
          <div className="relative flex items-center justify-center z-10">
            <svg className="h-20 w-20 transform -rotate-90 drop-shadow-md">
              <circle
                className="text-muted/20"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
                r="32"
                cx="40"
                cy="40"
              />
              <circle
                className={`${textColorMap[color]} transition-all duration-1000 ease-out`}
                strokeWidth="6"
                strokeDasharray={201}
                strokeDashoffset={201 - (201 * progress) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="32"
                cx="40"
                cy="40"
              />
            </svg>
            <div
              className={`absolute text-lg font-bold ${textColorMap[color]}`}
            >
              %
            </div>
          </div>
          <div className="text-center z-10">
            <h3
              className={`text-4xl font-extrabold ${textColorMap[color]} font-heading`}
            >
              {value}
            </h3>
          </div>
        </>
      ) : (
        <>
          <div className="p-3 bg-white dark:bg-muted/50 rounded-full shadow-sm ring-1 ring-black/5 dark:ring-white/10 z-10">
            {React.cloneElement(icon as any, {
              className: `h-8 w-8 ${textColorMap[color]}`,
            })}
          </div>
          <div className="text-center z-10">
            <h3
              className={`text-4xl font-extrabold ${textColorMap[color]} font-heading`}
            >
              {value}
            </h3>
          </div>
        </>
      )}

      <div className="text-center z-10">
        <p
          className={`text-[10px] uppercase tracking-widest font-bold opacity-70 ${textColorMap[color]}`}
        >
          {title}
        </p>
      </div>
    </Card>
  );
}

export default memo(MetricCard);
