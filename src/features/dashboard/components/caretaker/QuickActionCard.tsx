import React, { memo } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuickActionCardProps {
  title: string;
  desc: string;
  icon: React.ReactElement;
  color: "blue" | "slate" | "primary" | "green";
  onClick: () => void;
}

function QuickActionCard({
  title,
  desc,
  icon,
  color,
  onClick,
}: QuickActionCardProps) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white",
    slate:
      "bg-slate-500/10 text-slate-600 group-hover:bg-slate-500 group-hover:text-white",
    primary:
      "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white",
    green:
      "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white",
  };

  return (
    <button
      onClick={onClick}
      className="group flex flex-col p-5 bg-card/40 backdrop-blur-md rounded-2xl border border-muted/20 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all text-left relative overflow-hidden"
    >
      <div
        className={cn(
          "size-10 rounded-xl mb-4 flex items-center justify-center transition-all duration-300",
          colorMap[color],
        )}
      >
        {React.cloneElement(icon as any, {
          className: "size-5",
        })}
      </div>
      <span className="font-black text-xs uppercase tracking-widest mb-1">
        {title}
      </span>
      <span className="text-[10px] text-muted-foreground font-medium">
        {desc}
      </span>

      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-10 transition-opacity">
        <ChevronRight className="size-8" />
      </div>
    </button>
  );
}

export default memo(QuickActionCard);
