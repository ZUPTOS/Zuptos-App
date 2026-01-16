import { useState } from 'react';
import { FilterDrawer } from '@/components/FilterDrawer';
import DateFilter from '@/components/DateFilter';
import { Checkbox } from '@/components/ui/checkbox';

interface TransactionsFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onDateChange: (start: Date, end: Date) => void;
  onFilterChange: (filters: { categories: string[]; types: string[] }) => void;
  initialFilters?: { categories: string[]; types: string[] };
}

export default function TransactionsFilter({
  isOpen,
  onClose,
  onDateChange,
  onFilterChange,
  initialFilters = { categories: [], types: [] },
}: TransactionsFilterProps) {
  const [categories, setCategories] = useState<string[]>(initialFilters.categories);
  const [types, setTypes] = useState<string[]>(initialFilters.types);

  const handleCategoryToggle = (category: string) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleTypeToggle = (type: string) => {
    setTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleApply = () => {
    onFilterChange({ categories, types });
    onClose();
  };

  const categoryOptions = [
    { id: 'SALE', label: 'Venda' },
    { id: 'COMMISSION', label: 'Comissão' },
    { id: 'WITHDRAWAL', label: 'Saque' },
    { id: 'CHARGEBACK', label: 'Chargeback' },
    { id: 'REVERSAL', label: 'Estorno' },
    { id: 'MED', label: 'Mediação' },
  ];

  const typeOptions = [
    { id: 'in', label: 'Entrada' },
    { id: 'out', label: 'Saída' },
  ];

  return (
    <FilterDrawer
      open={isOpen}
      onClose={onClose}
      title="Filtrar"
      widthClassName="w-full max-w-[400px]"
    >
      <div className="flex flex-col gap-8 px-1">
        
        {/* Date Filter Section */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-foreground">Data</p>
          <DateFilter onDateChange={onDateChange} />
        </div>

        {/* Categories Section */}
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold text-foreground">Categoria</p>
          <div className="grid grid-cols-2 gap-4">
            {categoryOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`cat-${option.id}`} 
                  checked={categories.includes(option.id)}
                  onCheckedChange={() => handleCategoryToggle(option.id)}
                  className="rounded-[4px] border-zinc-700 bg-zinc-900/50 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <label
                  htmlFor={`cat-${option.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Types Section */}
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold text-foreground">Tipo de transação</p>
          <div className="flex gap-6">
            {typeOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`type-${option.id}`} 
                  checked={types.includes(option.id)}
                  onCheckedChange={() => handleTypeToggle(option.id)}
                  className="rounded-[4px] border-zinc-700 bg-zinc-900/50 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                 <label
                  htmlFor={`type-${option.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-6">
           <button
             onClick={handleApply}
             className="w-full rounded-[8px] bg-[#6d28d9] hover:bg-[#5b21b6] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors"
           >
             Adicionar filtro
           </button>
        </div>

      </div>
    </FilterDrawer>
  );
}
