'use client';

import { useMemo, useRef, useState } from "react";
import {
  Button,
  CalendarCell,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarGrid,
  DateInput,
  DateRangePicker,
  DateSegment,
  Dialog,
  Group,
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
  const allowOpenRef = useRef(false);
  const endInputRef = useRef<HTMLDivElement | null>(null);
  const endYearDigitsRef = useRef(0);

  const defaultRange = useMemo(() => {
    const today = getBrasiliaDate();
    today.setHours(0, 0, 0, 0);
    const cal = toCalendarDate(today);
    return { start: cal, end: cal };
  }, []);

  const [value, setValue] = useState<{ start: CalendarDate; end: CalendarDate }>(
    defaultRange
  );

  const activeRange = value ?? defaultRange;
  const isRangeComplete = activeRange.start.compare(activeRange.end) !== 0;

  const dateRangeLabel = useMemo(() => {
    const startDate = toJsDate(activeRange.start);
    const endDate = toJsDate(activeRange.end);
    return `${format(startDate, "dd/MM/yyyy", { locale: ptBR })} - ${format(endDate, "dd/MM/yyyy", { locale: ptBR })}`;
  }, [activeRange.end, activeRange.start]);

  const handleChange = (range: { start: CalendarDate; end: CalendarDate } | null) => {
    if (!range) return;
    const nextStart = range.start;
    const nextEnd = range.end ?? range.start;

    if (nextEnd.compare(nextStart) < 0) {
      const nextValue = { start: nextEnd, end: nextEnd };
      setValue(nextValue);
      setSelectedPreset(null);
      onDateChange?.(toJsDate(nextValue.start), toJsDate(nextValue.end));
      return;
    }

    const nextValue = { start: nextStart, end: nextEnd };
    setValue(nextValue);
    setSelectedPreset(null);
    onDateChange?.(toJsDate(nextValue.start), toJsDate(nextValue.end));
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
    setValue(nextValue);
    setSelectedPreset(option);
    onDateChange?.(range.start, range.end);
    setShowCalendar(false);
    setIsOpen(false);
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
      return "px-0.5 text-muted-foreground";
    }
    return [
      "rounded-[6px] px-0.5 py-0.5 tabular-nums outline-none transition-colors",
      isPlaceholder ? "text-muted-foreground" : "text-foreground",
      isFocused ? "bg-purple-500/20 ring-1 ring-purple-500/50" : ""
    ]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <I18nProvider locale="pt-BR">
      <DateRangePicker
        value={activeRange}
        onChange={handleChange}
        isOpen={isOpen}
        shouldCloseOnSelect={false}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setIsOpen(false);
            return;
          }
          if (allowOpenRef.current) {
            setIsOpen(true);
            allowOpenRef.current = false;
          }
        }}
        className="relative"
      >
        <Group
          className="flex h-[48px] items-center gap-3 rounded-[7px] border border-border/70 bg-card px-4 text-sm"
          style={{ width: "clamp(240px, 20vw, 320px)" }}
        >
          <Calendar className="h-4 w-4 text-foreground" />
          <div className="flex flex-1 items-center gap-1">
            <DateInput
              slot="start"
              className="flex items-center"
              aria-label="Data inicial"
            >
              {(segment) => (
                <DateSegment segment={segment} className={segmentClassName} />
              )}
            </DateInput>
            <span className="text-muted-foreground">-</span>
            <div
              className="flex items-center"
              onFocusCapture={(event) => {
                const target = event.target as HTMLElement | null;
                const type = target?.getAttribute("data-type");
                if (type === "year") {
                  endYearDigitsRef.current = 0;
                }
              }}
              onBlurCapture={() => {
                endYearDigitsRef.current = 0;
              }}
              onKeyDownCapture={(event) => {
                const target = event.target as HTMLElement | null;
                const type = target?.getAttribute("data-type");
                if (type !== "year") return;
                if (event.key >= "0" && event.key <= "9") {
                  endYearDigitsRef.current += 1;
                  if (endYearDigitsRef.current >= 4) {
                    requestAnimationFrame(() => {
                      (target as HTMLElement).blur?.();
                      closePicker();
                      endYearDigitsRef.current = 0;
                    });
                  }
                } else if (event.key === "Backspace") {
                  endYearDigitsRef.current = Math.max(0, endYearDigitsRef.current - 1);
                }
              }}
            >
              <DateInput
                slot="end"
                className="flex items-center"
                aria-label="Data final"
                ref={endInputRef}
              >
                {(segment) => (
                  <DateSegment segment={segment} className={segmentClassName} />
                )}
              </DateInput>
            </div>
          </div>
          <Button
            slot="trigger"
            type="button"
            aria-label="Alternar filtro de datas"
            className="text-muted-foreground"
            onPress={() => {
              allowOpenRef.current = true;
              setIsOpen(true);
            }}
          >
            <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} />
          </Button>
        </Group>

        <Popover
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
                <RangeCalendar className="space-y-3">
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
      </DateRangePicker>
    </I18nProvider>
  );
}
