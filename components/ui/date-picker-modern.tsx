"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

interface DatePickerModernProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  defaultMonth?: Date;
  className?: string;
}

export function DatePickerModern({
  selected,
  onSelect,
  defaultMonth,
  className,
}: DatePickerModernProps) {
  return (
    <div className={cn("space-y-0", className)}>
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        defaultMonth={defaultMonth}
        showOutsideDays
        className="p-4"
        classNames={{
          months: "flex flex-col",
          month: "space-y-4",
          month_caption: "flex justify-between items-center w-full px-0.5 mb-2",
          caption: "flex justify-between items-center w-full px-0.5 mb-2",
          caption_label: "text-base font-bold text-gray-900",
          nav: "flex items-center gap-0.5",
          nav_button:
            "inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors",
          nav_button_previous: "",
          nav_button_next: "",
          month_grid: "w-full border-collapse mt-2",
          weekdays: "flex",
          weekday: "w-9 rounded-md font-normal text-[0.8rem] text-gray-500",
          week: "flex w-full mt-2",
          day: "relative p-0 text-center",
          day_button:
            "h-9 w-9 p-0 font-normal rounded-md hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors",
          selected:
            "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
          today: "bg-gray-100 text-gray-900 font-medium",
          outside: "text-gray-300 opacity-50",
          disabled: "text-gray-300 opacity-50",
          hidden: "invisible",
        }}
        components={{
          Chevron: (props) => {
            if (props.orientation === "left") {
              return <ChevronLeft className="h-4 w-4 text-blue-600" />;
            }
            return <ChevronRight className="h-4 w-4 text-blue-600" />;
          },
        }}
      />
      <p className="text-sm text-gray-600 pt-3">Pick a day.</p>
    </div>
  );
}
