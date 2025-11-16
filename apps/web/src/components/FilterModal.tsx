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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-4xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Filtrar por...</h2>
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
            <div className="grid grid-cols-3 gap-4">
              {/* Filter Options */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                  Filtro de Data 1
                </h3>
                <div className="space-y-2">
                  {["Hoje", "Ontem", "Esta semana", "Última semana", "Este mês"].map(
                    (option) => (
                      <button
                        key={option}
                        className="w-full text-left px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors text-sm"
                      >
                        {option}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                  Filtro de Data 2
                </h3>
                <div className="space-y-2">
                  {["Hoje", "Ontem", "Esta semana", "Última semana", "Este mês"].map(
                    (option) => (
                      <button
                        key={option}
                        className="w-full text-left px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors text-sm"
                      >
                        {option}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                  Filtro de Data 3
                </h3>
                <div className="space-y-2">
                  {["Hoje", "Ontem", "Esta semana", "Última semana", "Este mês"].map(
                    (option) => (
                      <button
                        key={option}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                          option === "Este mês"
                            ? "bg-purple-600 text-white"
                            : "text-gray-300 hover:bg-gray-800"
                        }`}
                        onClick={() => {
                          if (option === "Este mês") {
                            setStep("calendar");
                          }
                        }}
                      >
                        {option}
                      </button>
                    )
                  )}
                </div>
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
