'use client';

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateChange?: (startDate: Date, endDate: Date) => void;
}

export default function FilterModal({
  isOpen,
  onClose,
  onDateChange,
}: FilterModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)); // October 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [step, setStep] = useState<"filter" | "calendar">("filter");
  const groups = {
    Produtor: ["Produto 01", "Produto 02", "Produto 03"],
    "Co-Produtor": ["Produto 01", "Produto 02", "Produto 03"]
  } as const;
  const [selection, setSelection] = useState<Record<string, Record<string, boolean>>>(
    () =>
      Object.fromEntries(
        Object.entries(groups).map(([group, items]) => [
          group,
          Object.fromEntries(items.map(item => [item, false]))
        ])
      )
  );

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  const firstDayOfWeek = getDay(monthStart);
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, index) =>
    `placeholder-${currentDate.getFullYear()}-${currentDate.getMonth()}-${index}`
  );

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

  const handleDateSelect = (day: number) => {
    const selected = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(selected);
    if (onDateChange) {
      onDateChange(selected, selected);
    }
    setStep("filter");
  };

  const isGroupFullySelected = (group: string) =>
    Object.values(selection[group]).every(Boolean);

  const handleToggleGroup = (group: string) => {
    const shouldSelectAll = !isGroupFullySelected(group);
    setSelection(prev => ({
      ...prev,
      [group]: Object.fromEntries(
        Object.keys(prev[group]).map(item => [item, shouldSelectAll])
      )
    }));
  };

  const handleToggleItem = (group: string, item: string) => {
    setSelection(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [item]: !prev[group][item]
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50">
      <div className="mt-10 bg-gray-900 rounded-lg border border-gray-800 w-[461px] h-[391px] mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-[24px] font-semibold text-white">Filtrar por...</h2>
          <button
            onClick={onClose}
            aria-label="Fechar filtro"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "filter" ? (
              <div className="space-y-6">
                <div className="space-y-[3px]">
                {Object.entries(groups).map(([group, items]) => (
                  <div key={group} className="space-y-[3px]">
                    <label className="flex items-center gap-[12px] text-[14px] font-semibold text-white">
                      <input
                        type="checkbox"
                        checked={isGroupFullySelected(group)}
                        onChange={() => handleToggleGroup(group)}
                        className="relative h-[26px] w-[26px] appearance-none rounded border border-gray-500 bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 checked:bg-purple-600 checked:border-purple-600 [&::before]:absolute [&::before]:left-[7px] [&::before]:top-[3px] [&::before]:hidden [&::before]:text-[14px] [&::before]:leading-none checked:[&::before]:block checked:[&::before]:content-['✓'] checked:[&::before]:text-white"
                      />
                      <span>{group}</span>
                    </label>
                    <div className="space-y-[3px] pl-9">
                      {items.map(item => (
                        <label
                          key={item}
                          className="flex items-center gap-[12px] text-[12px] text-gray-500"
                        >
                          <input
                            type="checkbox"
                            checked={selection[group][item]}
                            onChange={() => handleToggleItem(group, item)}
                            className="relative h-[26px] w-[26px] appearance-none rounded border border-gray-600 bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 checked:bg-purple-600 checked:border-purple-600 [&::before]:absolute [&::before]:left-[7px] [&::before]:top-[3px] [&::before]:hidden [&::before]:text-[14px] [&::before]:leading-none checked:[&::before]:block checked:[&::before]:content-['✓'] checked:[&::before]:text-white"
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("calendar")}
                  className="rounded-lg border border-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Este mês
                </button>
                <button
                  type="button"
                  onClick={() => setStep("calendar")}
                  className="rounded-lg border border-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Escolher data
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                  </button>
                  <h3 className="text-lg font-semibold text-white">
                    {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                  </h3>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {/* Day Headers */}
                  {weekdays.map(day => (
                    <div
                      key={`weekday-${day}`}
                      className="text-center text-xs font-medium text-gray-500 py-2"
                    >
                      {day}
                    </div>
                  ))}

                  {/* Empty Days */}
                  {emptyDays.map(placeholderKey => (
                    <div key={placeholderKey} />
                  ))}

                  {/* Days */}
                  {daysInMonth.map((date) => {
                    const day = date.getDate();
                    const isSelected =
                      selectedDate &&
                      selectedDate.getDate() === day &&
                      selectedDate.getMonth() === date.getMonth() &&
                      selectedDate.getFullYear() === date.getFullYear();

                    return (
                      <button
                        key={day}
                        onClick={() => handleDateSelect(day)}
                        className={`w-full aspect-square rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-purple-600 text-white"
                            : "text-gray-300 hover:bg-gray-800"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Back Button */}
                <button
                  onClick={() => setStep("filter")}
                  className="w-full px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Voltar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
