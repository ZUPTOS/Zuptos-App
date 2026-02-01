'use client';

import { useMemo, useRef, useState } from "react";
import {
  Button,
  CalendarCell,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarGrid,
  DateField,
  DateInput,
  DateSegment,
  Dialog,
  Heading,
  Popover,
  RangeCalendar
} from "react-aria-components";
import { I18nProvider } from "@react-aria/i18n";
import { CalendarDate } from "@internationalized/date";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
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

const getBrasiliaDate = () => {
  const now = new Date();
  const brasiliaString = now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
  return new Date(brasiliaString);
};

const toCalendarDate = (date: Date) =>
  new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());

const toJsDate = (date: CalendarDate) =>
  new Date(date.year, date.month - 1, date.day);


const getPresetRange = (preset: string) => {
  const today = getBrasiliaDate();
  today.setHours(0, 0, 0, 0);

  switch (preset) {
    case "Hoje":
      return { start: today, end: today };
    case "Ontem": {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return { start: yesterday, end: yesterday };
    }
    case "Esta semana": {
      const day = today.getDay();
      const diff = (day + 6) % 7;
      const start = new Date(today);
      start.setDate(today.getDate() - diff);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start, end };
    }
    case "Última semana": {
      const day = today.getDay();
      const diff = (day + 6) % 7;
      const start = new Date(today);
      start.setDate(today.getDate() - diff - 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start, end };
    }
    case "Este mês": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { start, end };
    }
    default:
      return null;
  }
};

export default function DateFilter({ onDateChange }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const endFieldRef = useRef<HTMLDivElement | null>(null);

  const defaultRange = useMemo(() => {
    const today = getBrasiliaDate();
    today.setHours(0, 0, 0, 0);
    const cal = toCalendarDate(today);
    return { start: cal, end: cal };
  }, []);

  const [rangeValue, setRangeValue] = useState<{ start: CalendarDate; end: CalendarDate }>(
    defaultRange
  );

  const activeRange = rangeValue;
  const isRangeComplete = rangeValue.end.compare(rangeValue.start) > 0;

  const dateRangeLabel = useMemo(() => {
    const startDate = toJsDate(activeRange.start);
    const endDate = toJsDate(activeRange.end);
    return `${format(startDate, "dd/MM/yyyy", { locale: ptBR })} - ${format(endDate, "dd/MM/yyyy", { locale: ptBR })}`;
  }, [activeRange.end, activeRange.start]);

  const handleRangeChange = (range: { start: CalendarDate; end: CalendarDate } | null) => {
    if (!range) return;
    if (range.end.compare(range.start) < 0) {
      const nextValue = { start: range.end, end: range.end };
      setRangeValue(nextValue);
      setSelectedPreset(null);
      onDateChange?.(toJsDate(nextValue.start), toJsDate(nextValue.end));
      return;
    }
    setRangeValue(range);
    setSelectedPreset(null);
    onDateChange?.(toJsDate(range.start), toJsDate(range.end));
  };

  const closePicker = () => {
    setIsOpen(false);
    setShowCalendar(false);
  };

  const handlePresetSelect = (option: string) => {
    const range = getPresetRange(option);
    if (!range) return;
    const nextValue = {
      start: toCalendarDate(range.start),
      end: toCalendarDate(range.end)
    };
    setRangeValue(nextValue);
    setSelectedPreset(option);
    onDateChange?.(range.start, range.end);
    setShowCalendar(false);
    setIsOpen(false);
  };

  const handleStartChange = (date: CalendarDate | null) => {
    if (!date) return;
    const end = rangeValue.end.compare(date) < 0 ? date : rangeValue.end;
    const nextValue = { start: date, end };
    setRangeValue(nextValue);
    setSelectedPreset(null);
    onDateChange?.(toJsDate(nextValue.start), toJsDate(nextValue.end));
  };

  const handleEndChange = (date: CalendarDate | null) => {
    if (!date) return;
    const nextValue = { start: rangeValue.start, end: date };
    setRangeValue(nextValue);
    setSelectedPreset(null);
    onDateChange?.(toJsDate(nextValue.start), toJsDate(nextValue.end));
  };

  const segmentClassName = ({
    type,
    isFocused,
    isPlaceholder
  }: {
    type: string;
    isFocused: boolean;
    isPlaceholder: boolean;
  }) => {
    if (type === "literal") {
      return "mx-0.5 text-muted-foreground";
    }
    const widthClass =
      type === "year" ? "w-[4ch]" : type === "day" || type === "month" ? "w-[2ch]" : "";
    return [
      "inline-flex justify-center rounded-[4px] px-1 py-1 tabular-nums outline-none transition-colors",
      widthClass,
      isPlaceholder ? "text-muted-foreground" : "text-foreground",
      isFocused ? "bg-primary/20 ring-2 ring-primary/60" : ""
    ]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <I18nProvider locale="pt-BR">
      <div className="relative">
        <div
          ref={triggerRef}
          className="flex h-[48px] items-center gap-3 rounded-[7px] border border-border/70 bg-card px-4 text-sm"
          style={{ width: "clamp(240px, 20vw, 320px)" }}
        >
          <button
            type="button"
            aria-label="Abrir filtro de datas"
            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-border/60 bg-background/50"
            onClick={() => setIsOpen(true)}
          >
            <Calendar className="h-4 w-4 text-foreground" />
          </button>
          <div className="flex flex-1 items-center gap-1 text-sm font-medium text-foreground">
            <DateField
              value={rangeValue.start}
              onChange={handleStartChange}
              granularity="day"
              aria-label="Data inicial"
            >
              <DateInput className="flex items-center gap-0 leading-none">
                {(segment) => (
                  <DateSegment segment={segment} className={segmentClassName} />
                )}
              </DateInput>
            </DateField>
            <span className="text-muted-foreground">-</span>
            <div
              onBlurCapture={() => {
                setTimeout(() => {
                  const active = document.activeElement;
                  const container = endFieldRef.current;
                  if (container && active && container.contains(active)) return;
                  if (rangeValue.end.compare(rangeValue.start) < 0) {
                    setRangeValue({ start: rangeValue.start, end: rangeValue.start });
                  }
                }, 0);
              }}
              ref={endFieldRef}
            >
              <DateField
                value={rangeValue.end}
                onChange={handleEndChange}
                granularity="day"
                aria-label="Data final"
              >
                <DateInput className="flex items-center gap-0 leading-none">
                  {(segment) => (
                    <DateSegment segment={segment} className={segmentClassName} />
                  )}
                </DateInput>
              </DateField>
            </div>
          </div>
        </div>

        <Popover
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          triggerRef={triggerRef}
          className="z-40 w-full max-w-[320px] rounded-[16px] border border-border/70 bg-card shadow-none dark:shadow-[0_24px_55px_rgba(0,0,0,0.55)]"
          offset={12}
        >
          <Dialog className="p-5 space-y-4 xl:p-4 xl:space-y-3 2xl:p-4 2xl:space-y-3">
            <div className="space-y-2">
              {filterOptions.map(option => (
                <button
                  key={option}
                  onClick={() => handlePresetSelect(option)}
                  type="button"
                  className={`w-full rounded-[8px] border px-4 py-3 text-left text-sm transition-colors xl:px-3 xl:py-2 xl:text-xs 2xl:text-sm ${
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
              onClick={() => setShowCalendar(prev => !prev)}
              type="button"
              aria-label="Alternar calendário detalhado"
              className="flex w-full items-center justify-between border-t border-border/60 pt-3 text-left text-xs text-muted-foreground xl:pt-2 2xl:pt-2"
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{dateRangeLabel}</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition ${showCalendar ? "rotate-180" : ""}`}
              />
            </button>

            {showCalendar && (
              <div className="border-t border-border/60 pt-4">
                <RangeCalendar
                  className="space-y-3"
                  value={rangeValue}
                  onChange={handleRangeChange}
                >
                  <header className="flex items-center justify-between">
                    <Button
                      slot="previous"
                      className="p-1 hover:bg-muted/40 rounded transition-colors"
                      aria-label="Mês anterior"
                    >
                      <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Heading className="text-sm font-sora text-foreground" />
                    <Button
                      slot="next"
                      className="p-1 hover:bg-muted/40 rounded transition-colors"
                      aria-label="Próximo mês"
                    >
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </header>
                  <CalendarGrid
                    className="w-full border-separate border-spacing-0"
                    weekdayStyle="short"
                  >
                    <CalendarGridHeader className="text-[10px] uppercase text-muted-foreground">
                      {(day) => (
                        <CalendarHeaderCell className="pb-1 text-center font-medium">
                          {day}
                        </CalendarHeaderCell>
                      )}
                    </CalendarGridHeader>
                    <CalendarGridBody>
                      {(date) => (
                        <CalendarCell
                          date={date}
                          className="relative h-9 w-full text-xs font-medium"
                        >
                          {({ formattedDate, isSelected, isSelectionStart, isSelectionEnd, isDisabled, isOutsideVisibleRange }) => {
                            const isUnavailable = isDisabled || isOutsideVisibleRange;
                            const isEdge = isSelectionStart || isSelectionEnd;
                            const showBar = isRangeComplete && (isSelected || isSelectionStart || isSelectionEnd);
                            const barClass = showBar
                              ? `absolute top-1/2 -translate-y-1/2 ${isSelectionStart ? "left-1/2 right-0" : isSelectionEnd ? "left-0 right-1/2" : "left-0 right-0"} h-8 bg-primary/30`
                              : "";
                            const textClass = isUnavailable
                              ? "text-muted-foreground/40"
                              : isEdge
                              ? "text-primary-foreground"
                              : isSelected
                              ? "text-foreground"
                              : "text-muted-foreground";
                            const circleClass = isEdge
                              ? "bg-primary"
                              : "bg-transparent";

                            return (
                              <div className="relative flex h-9 w-full items-center justify-center">
                                {showBar && <span className={barClass} />}
                                <span
                                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${circleClass} ${textClass}`}
                                >
                                  {formattedDate}
                                </span>
                              </div>
                            );
                          }}
                        </CalendarCell>
                      )}
                    </CalendarGridBody>
                  </CalendarGrid>
                </RangeCalendar>
              </div>
            )}
          </Dialog>
        </Popover>
      </div>
    </I18nProvider>
  );
}
