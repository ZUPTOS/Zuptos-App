'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  isValid,
  parse,
  startOfMonth,
  startOfWeek
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface DateFilterProps {
  onDateChange?: (startDate: Date, endDate: Date) => void;
}

type DigitArray = string[];

const MASK_TEMPLATE = "dd/mm/aaaa - dd/mm/aaaa";
const DIGIT_POSITIONS = [0, 1, 3, 4, 6, 7, 8, 9, 13, 14, 16, 17, 19, 20, 21, 22];
const MAX_YEAR = 2999;

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
  const [digits, setDigits] = useState<DigitArray>(() => Array(16).fill(""));
  const [activeSlot, setActiveSlot] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const todayRef = useRef(new Date());
  const defaultRange = useMemo(() => ({ start: todayRef.current, end: todayRef.current }), []);
  const activeRange = selectedRange ?? defaultRange;

  const dateRange = useMemo(
    () =>
      `${format(activeRange.start, "dd/MM/yyyy", { locale: ptBR })} - ${format(activeRange.end, "dd/MM/yyyy", { locale: ptBR })}`,
    [activeRange.end, activeRange.start]
  );

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
      setDigitsFromRange(range);
      onDateChange?.(range.start, range.end);
    }
    setSelectedPreset(option);
    setShowCalendar(false);
    setIsOpen(false);
  };

  const applyMask = (currentDigits: DigitArray) => {
    const chars = MASK_TEMPLATE.split("");
    currentDigits.forEach((digit, idx) => {
      const pos = DIGIT_POSITIONS[idx];
      chars[pos] = digit || MASK_TEMPLATE[pos];
    });
    return chars.join("");
  };

  const digitsFromDate = (date: Date) => format(date, "ddMMyyyy");

  const setDigitsFromRange = useCallback((range: { start: Date; end: Date }) => {
    const combined = `${digitsFromDate(range.start)}${digitsFromDate(range.end)}`;
    const filled = Array.from({ length: 16 }, (_, i) => combined[i] ?? "");
    if (digits.every((val, idx) => val === filled[idx])) return;
    setDigits(filled);
  }, [digits]);

  useEffect(() => {
    setDigitsFromRange(activeRange);
  }, [activeRange, setDigitsFromRange]);

  const commitDigits = (updatedDigits: DigitArray) => {
    const startStr = updatedDigits.slice(0, 8).join("");
    const endStr = updatedDigits.slice(8).join("");
    if (startStr.length === 8 && endStr.length === 8) {
      const parsedStart = parse(startStr, "ddMMyyyy", todayRef.current);
      const parsedEnd = parse(endStr, "ddMMyyyy", todayRef.current);
      if (isValid(parsedStart) && isValid(parsedEnd)) {
        const startDate = parsedStart > parsedEnd ? parsedEnd : parsedStart;
        const endDate = parsedStart > parsedEnd ? parsedStart : parsedEnd;
        if (parsedStart > parsedEnd) {
          setDigitsFromRange({ start: startDate, end: endDate });
        }
        setSelectedRange({ start: startDate, end: endDate });
        setSelectedPreset(null);
        onDateChange?.(startDate, endDate);
      }
    }
  };

  const maskValue = applyMask(digits);
  const isComplete = useMemo(() => digits.every(Boolean), [digits]);

  const findSlotFromPos = (pos: number) => {
    let closest = 0;
    let minDiff = Number.MAX_SAFE_INTEGER;
    DIGIT_POSITIONS.forEach((slotPos, idx) => {
      const diff = Math.abs(slotPos - pos);
      if (diff < minDiff) {
        minDiff = diff;
        closest = idx;
      }
    });
    return closest;
  };

  const focusSlot = (slotIndex: number) => {
    const clamped = Math.max(0, Math.min(slotIndex, DIGIT_POSITIONS.length - 1));
    setActiveSlot(clamped);
    const pos = DIGIT_POSITIONS[clamped];
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(pos, pos + 1);
    });
  };

  useEffect(() => {
    focusSlot(activeSlot);
  }, [maskValue, activeSlot]); // re-sync caret when value changes

  const validateSegment = (next: DigitArray, slot: number) => {
    const getSegment = (offset: number) => next.slice(offset, offset + 8);
    const checkDay = (seg: DigitArray) => {
      const [d1, d2] = seg;
      if (!d1) return true;
      if (Number(d1) > 3) return false;
      if (d1 === "3" && d2 && Number(d2) > 1) return false;
      if (d2) {
        const val = Number(`${d1}${d2}`);
        return val >= 1 && val <= 31;
      }
      return true;
    };
    const checkMonth = (seg: DigitArray) => {
      const [m1, m2] = seg;
      if (!m1) return true;
      if (Number(m1) > 1) return false;
      if (m1 === "1" && m2 && Number(m2) > 2) return false;
      if (m2) {
        const val = Number(`${m1}${m2}`);
        return val >= 1 && val <= 12;
      }
      return true;
    };
    const checkYear = (seg: DigitArray) => {
      const [y1, y2, y3, y4] = seg;
      if (!y1) return true;
      if (Number(y1) > 2) return false;
      const filled = [y1, y2, y3, y4].filter(Boolean).length;
      if (filled === 4) {
        const val = Number(`${y1}${y2}${y3}${y4}`);
        return val <= MAX_YEAR;
      }
      return true;
    };

    const isStart = slot < 8;
    const base = isStart ? 0 : 8;
    const seg = getSegment(base);
    const dayOk = checkDay(seg.slice(0, 2));
    const monthOk = checkMonth(seg.slice(2, 4));
    const yearOk = checkYear(seg.slice(4, 8));
    return dayOk && monthOk && yearOk;
  };

  const handleDigitInput = (digit: string) => {
    const nextDigits = [...digits];
    nextDigits[activeSlot] = digit;
    if (!validateSegment(nextDigits, activeSlot)) return;
    setDigits(nextDigits);
    const nextSlot = Math.min(activeSlot + 1, DIGIT_POSITIONS.length - 1);
    focusSlot(nextSlot);
    commitDigits(nextDigits);
  };

  const handleBackspace = () => {
    const nextDigits = [...digits];
    if (nextDigits[activeSlot]) {
      nextDigits[activeSlot] = "";
      setDigits(nextDigits);
      commitDigits(nextDigits);
      focusSlot(activeSlot);
      return;
    }
    const prevSlot = Math.max(0, activeSlot - 1);
    nextDigits[prevSlot] = "";
    setDigits(nextDigits);
    commitDigits(nextDigits);
    focusSlot(prevSlot);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text") || "";
    const pastedDigits = text.replace(/\D/g, "").slice(0, 16);
    if (!pastedDigits) return;
    const nextDigits = [...digits];
    let slot = activeSlot;
    for (const ch of pastedDigits) {
      nextDigits[slot] = ch;
      if (!validateSegment(nextDigits, slot)) {
        nextDigits[slot] = "";
        break;
      }
      slot = Math.min(slot + 1, DIGIT_POSITIONS.length - 1);
    }
    setDigits(nextDigits);
    commitDigits(nextDigits);
    focusSlot(slot);
  };

  const handleClickPosition = (event: React.MouseEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    const pos = target.selectionStart ?? 0;
    const slot = findSlotFromPos(pos);
    focusSlot(slot);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="flex h-[48px] items-center gap-3 rounded-[7px] border border-border/70 bg-card px-4 text-sm"
        style={{ width: "clamp(240px, 20vw, 320px)" }}
      >
        <Calendar className="h-4 w-4 text-foreground" />
        <input
          ref={inputRef}
          className={`flex-1 bg-transparent ${isComplete ? "text-foreground" : "text-muted-foreground"} focus:outline-none selection:bg-primary selection:text-primary-foreground`}
          value={maskValue}
          onFocus={() => {
            setIsOpen(true);
            const firstEmpty = digits.findIndex(d => !d);
            focusSlot(firstEmpty >= 0 ? firstEmpty : DIGIT_POSITIONS.length - 1);
          }}
          onClick={handleClickPosition}
          onKeyDown={e => {
            if (e.key === "Backspace") {
              e.preventDefault();
              handleBackspace();
              return;
            }
            if (e.key === "ArrowRight") {
              e.preventDefault();
              focusSlot(Math.min(activeSlot + 1, DIGIT_POSITIONS.length - 1));
              return;
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              focusSlot(Math.max(activeSlot - 1, 0));
              return;
            }
            if (/^\d$/.test(e.key)) {
              e.preventDefault();
              handleDigitInput(e.key);
              return;
            }
            if (e.key === "Enter") {
              e.preventDefault();
              setIsOpen(false);
              return;
            }
          }}
          onPaste={handlePaste}
          onChange={() => {
            /* controlled by mask handlers */
          }}
          readOnly={false}
          aria-label="Intervalo de datas"
        />
        <button
          type="button"
          aria-label="Alternar filtro de datas"
          onClick={() => setIsOpen(prev => !prev)}
          className="text-muted-foreground"
        >
          <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute left-0 z-40 w-full max-w-[320px] rounded-[16px] border border-border/70 bg-card shadow-none dark:shadow-[0_24px_55px_rgba(0,0,0,0.55)]"
          style={{ top: "calc(100% + 12px)" }}
        >

          <div className="p-5 space-y-4 xl:p-4 xl:space-y-3 2xl:p-4 2xl:space-y-3">
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
              onClick={handleDateButtonClick}
              type="button"
              aria-label="Alternar calendário detalhado"
              className="flex w-full items-center justify-between border-t border-border/60 pt-3 text-left text-xs text-muted-foreground xl:pt-2 2xl:pt-2"
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{dateRange}</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition ${showCalendar ? "rotate-180" : ""}`}
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
