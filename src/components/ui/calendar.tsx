"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-full h-full", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col relative w-full h-full p-2 sm:p-3",
          defaultClassNames.months,
        ),
        month: cn("flex flex-col w-full gap-3", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-2 inset-x-0 justify-between z-10 px-2 sm:px-3 pointer-events-none",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-9 w-9 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all shadow-md text-foreground backdrop-blur-sm pointer-events-auto",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-9 w-9 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all shadow-md text-foreground backdrop-blur-sm pointer-events-auto",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex items-center justify-center font-bold px-10 h-9 mb-1",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-bold justify-center h-9 gap-2",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "relative flex items-center h-9",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn("hidden", defaultClassNames.dropdown),
        caption_label: cn(
          "select-none font-bold text-lg font-heading tracking-tight",
          captionLayout === "label" ? "text-sm" : "hidden",
          defaultClassNames.caption_label,
        ),
        table: "w-full border-collapse",
        weekdays: cn(
          "flex justify-between w-full border-b border-white/5 pb-2 mb-2",
          defaultClassNames.weekdays,
        ),
        weekday: cn(
          "text-muted-foreground/40 rounded-md flex-1 font-bold text-[10px] uppercase tracking-wider select-none text-center",
          defaultClassNames.weekday,
        ),
        week: cn("flex w-full mt-2 justify-between", defaultClassNames.week),
        day: cn(
          "relative flex-1 p-0 text-center group/day aspect-square select-none max-w-[44px] mx-auto",
          defaultClassNames.day,
        ),
        today: cn(
          "bg-primary/5 text-primary rounded-xl ring-2 ring-primary/10 ring-offset-2 ring-offset-background/0",
          defaultClassNames.today,
        ),
        outside: cn(
          "text-muted-foreground/10 opacity-20",
          defaultClassNames.outside,
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled,
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          );
        },
        Dropdown: ({ value, onChange, options, ...props }) => {
          const selected = options?.find((option) => option.value === value);
          const handleValueChange = (newValue: string) => {
            if (onChange) {
              const event = {
                target: {
                  value: newValue,
                },
              } as React.ChangeEvent<HTMLSelectElement>;
              onChange(event);
            }
          };

          return (
            <Select value={value?.toString()} onValueChange={handleValueChange}>
              <SelectTrigger className="h-8 w-fit bg-white/5 border-none shadow-none focus:ring-0 rounded-lg px-2 py-0 text-sm font-bold hover:bg-white/10 transition-colors backdrop-blur-sm">
                <SelectValue>{selected?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="bg-card/95 backdrop-blur-xl border border-white/10 rounded-xl"
              >
                {options?.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                    className="text-xs font-bold rounded-lg"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
