'use client';

import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  startOfMonth,
  startOfWeek
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface DateFilterProps {
  onDateChange?: (startDate: Date, endDate: Date) => void;
}

const filterOptions = [
  "Hoje",
  "Ontem",
  "Esta semana",
  "Última semana",
  "Este mês"
];

const getPresetRange = (preset: string) => {
  const today = new Date();
  switch (preset) {
    case "Hoje":
      return { start: today, end: today };
    case "Ontem": {
      const yesterday = addDays(today, -1);
      return { start: yesterday, end: yesterday };
    }
    case "Esta semana": {
      const start = startOfWeek(today, { weekStartsOn: 1 });
      const end = endOfWeek(today, { weekStartsOn: 1 });
      return { start, end };
    }
    case "Última semana": {
      const start = addDays(startOfWeek(today, { weekStartsOn: 1 }), -7);
      const end = addDays(endOfWeek(today, { weekStartsOn: 1 }), -7);
      return { start, end };
    }
    case "Este mês": {
      const start = startOfMonth(today);
      const end = endOfMonth(today);
      return { start, end };
    }
    default:
      return null;
  }
};

export default function DateFilter({ onDateChange }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1));
  const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [rangeAnchor, setRangeAnchor] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const activeRange = selectedRange ?? { start: today, end: today };
  const dateRange = `${format(activeRange.start, "dd/MM/yyyy", { locale: ptBR })} - ${format(activeRange.end, "dd/MM/yyyy", { locale: ptBR })}`;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd
  });

  const firstDayOfWeek = getDay(monthStart);
  const emptyDays = Array(firstDayOfWeek).fill(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowCalendar(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleDateButtonClick = () => {
    setShowCalendar(isVisible => !isVisible);
  };

  const handleDateSelect = (day: number) => {
    const selected = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    if (!rangeAnchor) {
      setRangeAnchor(selected);
      setSelectedRange({ start: selected, end: selected });
      setSelectedPreset(null);
      onDateChange?.(selected, selected);
      return;
    }

    const start = rangeAnchor < selected ? rangeAnchor : selected;
    const end = rangeAnchor < selected ? selected : rangeAnchor;
    setSelectedRange({ start, end });
    setSelectedPreset(null);
    setRangeAnchor(null);
    onDateChange?.(start, end);
  };

  const handlePresetSelect = (option: string) => {
    const range = getPresetRange(option);
    if (range) {
      setSelectedRange(range);
      onDateChange?.(range.start, range.end);
    }
    setSelectedPreset(option);
    setShowCalendar(false);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label="Alternar filtro de datas"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex w-[290px] items-center justify-start gap-4 px-4 py-3 rounded-[7px] border border-border/70 bg-card text-left"
      >
        <Calendar className="w-4 h-5 text-foreground" />
        <span className="text-[14px] text-foreground">{dateRange}</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-15 z-40 w-[358px] rounded-[16px] border border-border/70 bg-card shadow-none dark:shadow-[0_24px_55px_rgba(0,0,0,0.55)]">

          <div className="p-5 space-y-4">
            <div className="space-y-2">
              {filterOptions.map(option => (
                <button
                  key={option}
                  onClick={() => handlePresetSelect(option)}
                  type="button"
                  className={`w-full text-left px-4 py-3 rounded-[8px] transition-colors text-sora text-[15px] border ${
                    selectedPreset === option
                      ? "border-primary/60 bg-muted/40 text-foreground"
                      : "border-border/60 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <button
              onClick={handleDateButtonClick}
              type="button"
              aria-label="Alternar calendário detalhado"
              className="w-full flex items-center justify-between border-t border-border/60 pt-3 text-left text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{dateRange}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition ${showCalendar ? "rotate-180" : ""}`}
              />
            </button>

            {showCalendar && (
              <div className="border-t border-border/60 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-muted/40 rounded transition-colors"
                    type="button"
                    aria-label="Mês anterior"
                  >
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <h4 className="text-sm font-sora text-foreground">
                    {format(currentDate, "MMMM 'de' yyyy", {
                      locale: ptBR
                    })}
                  </h4>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-muted/40 rounded transition-colors"
                    type="button"
                    aria-label="Próximo mês"
                  >
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-y-1 gap-x-0">
                  {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
                    <div
                      key={`${day}-${index}`}
                      className="text-center text-xs font-medium text-muted-foreground py-1"
                    >
                      {day}
                    </div>
                  ))}

                  {emptyDays.map((_, index) => (
                    <div key={`empty-${index}`} />
                  ))}

                  {daysInMonth.map(date => {
                    const day = date.getDate();
                    const isSelected =
                      (selectedRange?.start &&
                        selectedRange.start.getDate() === day &&
                        selectedRange.start.getMonth() === date.getMonth() &&
                        selectedRange.start.getFullYear() === date.getFullYear()) ||
                      (selectedRange?.end &&
                        selectedRange.end.getDate() === day &&
                        selectedRange.end.getMonth() === date.getMonth() &&
                        selectedRange.end.getFullYear() === date.getFullYear());

                    const inRange =
                      selectedRange &&
                      date >= selectedRange.start &&
                      date <= selectedRange.end &&
                      !isSelected;

                    const isStart =
                      selectedRange &&
                      selectedRange.start.getDate() === day &&
                      selectedRange.start.getMonth() === date.getMonth() &&
                      selectedRange.start.getFullYear() === date.getFullYear();

                    const isEnd =
                      selectedRange &&
                      selectedRange.end.getDate() === day &&
                      selectedRange.end.getMonth() === date.getMonth() &&
                      selectedRange.end.getFullYear() === date.getFullYear();

                    const isSingle = isStart && isEnd;

                    let bgClass: string;
                    if (isSelected) {
                      bgClass = "bg-primary text-primary-foreground";
                    } else if (inRange) {
                      bgClass = "bg-primary/15 text-foreground";
                    } else {
                      bgClass = "text-muted-foreground hover:bg-muted/40";
                    }

                    let radiusClass: string;
                    if (isSingle) {
                      radiusClass = "rounded-full";
                    } else if (isStart) {
                      radiusClass = "rounded-l-full";
                    } else if (isEnd) {
                      radiusClass = "rounded-r-full";
                    } else if (inRange) {
                      radiusClass = "rounded-none";
                    } else {
                      radiusClass = "rounded-[12px]";
                    }

                    return (
                      <button
                        key={day}
                        onClick={() => handleDateSelect(day)}
                        type="button"
                        className={`w-full aspect-square text-xs font-medium transition-colors ${bgClass} ${radiusClass}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
