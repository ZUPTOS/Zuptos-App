'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown, X, Eye, EyeOff } from "lucide-react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import DateFilter from "@/shared/components/DateFilter";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "./hooks/useDashboardData";

// Components
import { GreetingCard } from "./components/GreetingCard";
import { BalanceCard } from "./components/BalanceCard";
import { HealthCard } from "./components/HealthCard";
import { JourneyCard } from "./components/JourneyCard";
import { PaymentMethodsGrid } from "./components/PaymentMethodsGrid";
import { RevenueChartCard } from "./components/RevenueChartCard";

const filterModalGroups = [
  {
    id: "produtor",
    label: "Produtor",
    children: [
      { id: "produto_01", label: "Produto 01" },
      { id: "produto_02", label: "Produto 02" },
      { id: "produto_03", label: "Produto 03" }
    ]
  },
  {
    id: "co_produtor",
    label: "Co-Produtor",
    children: [
      { id: "co_produtor_01", label: "Produto 01" },
      { id: "co_produtor_02", label: "Produto 02" },
      { id: "co_produtor_03", label: "Produto 03" }
    ]
  }
] as const;

export default function Dashboard() {
  const { salesData, financeData, healthData, journeyData } = useDashboardData();
  
  const [isFilterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, boolean>>({});
  const [hideValues, setHideValues] = useState(false);

  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  // const isLightMode = theme === "light"; // Not used directly here anymore

  const toggleParentFilter = (groupId: string) => {
    const group = filterModalGroups.find(item => item.id === groupId);
    if (!group) return;
    setSelectedFilters(prev => {
      const childrenIds = group.children.map(child => child.id);
      const allChildrenSelected = childrenIds.every(id => prev[id]);
      const shouldSelect = !allChildrenSelected;
      const next = { ...prev, [groupId]: shouldSelect };
      childrenIds.forEach(id => {
        next[id] = shouldSelect;
      });
      return next;
    });
  };

  const toggleChildFilter = (groupId: string, childId: string) => {
    const group = filterModalGroups.find(item => item.id === groupId);
    if (!group) return;
    setSelectedFilters(prev => {
      const next = { ...prev, [childId]: !prev[childId] };
      const childrenIds = group.children.map(child => child.id);
      const allSelected = childrenIds.every(id => next[id]);
      next[groupId] = allSelected;
      return next;
    });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(target)
      ) {
        setFilterDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const balanceCards = [
    {
      label: "Saldo disponível",
      value: financeData?.availableBalance ?? 0,
      iconSrc: "/images/moeda.svg"
    },
    {
      label: "Saldo pendente",
      value: financeData?.pendingBalance ?? 0,
      iconSrc: "/images/saldo.svg"
    }
  ];

  const selectedFiltersCount = useMemo(
    () => Object.values(selectedFilters).filter(Boolean).length,
    [selectedFilters]
  );

  const greetingName = useMemo(() => {
    const username = user?.username?.trim();
    if (username) return username.slice(0, 6);
    const name = user?.fullName?.trim();
    if (name) return name.slice(0, 6);
    const email = user?.email ?? "";
    return email.split("@")[0].slice(0, 6) || "Usuário";
  }, [user]);

  return (
    <DashboardLayout
      userName={journeyData?.user?.name ?? "Usuário"}
      userLocation={journeyData?.user?.location ?? ""}
      pageTitle="Dashboard"
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4">
        
        {/* Mobile / Tablet / Laptop Layout (< 1280px) */}
        <div className="flex flex-col gap-6 xl:hidden">
            <div className="w-full">
              <DateFilter />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <GreetingCard greetingName={greetingName} className="min-h-[140px]" />

              {balanceCards.map(card => (
                 <BalanceCard 
                    key={card.label}
                    label={card.label}
                    value={card.value}
                    iconSrc={card.iconSrc}
                    hideValues={hideValues}
                 />
              ))}
            </div>
            
            <div className="flex flex-col gap-6">
                {/* Chart Area */}
                <RevenueChartCard 
                    salesData={salesData} 
                    hideValues={hideValues} 
                    style={{ minHeight: "350px" }}
                >
                    {/* Children not needed, content is internal */}
                </RevenueChartCard>

                <div className="flex flex-col gap-6">
                    {/* Filter + Toggle */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end min-h-[49px]">
                        <div className="relative flex w-full items-center gap-3 sm:flex-1 sm:w-auto" ref={filterDropdownRef}>
                            <button
                            type="button"
                            onClick={() => setFilterDropdownOpen(prev => !prev)}
                            className="flex w-full items-center gap-3 rounded-[10px] border border-muted bg-card px-5 py-3 text-left text-sm text-muted-foreground shadow-none"
                            >
                            <Search className="h-[16px] w-[16px] color-muted-foreground text-sora" />
                            <span className="flex-1 text-muted-foreground text-sora">
                                {selectedFiltersCount > 0
                                ? `${selectedFiltersCount} filtro${selectedFiltersCount > 1 ? "s" : ""} aplicado${selectedFiltersCount > 1 ? "s" : ""}`
                                : "Filtrar por..."}
                            </span>
                            <ChevronDown className="h-[16px] w-[16px] text-muted-foreground" />
                            </button>
                            {isFilterDropdownOpen && (
                                <div className="absolute left-0 top-[calc(100%+10px)] z-40 w-full rounded-[16px] border border-muted/70 bg-card shadow-none p-4">
                                     {filterModalGroups.map(group => (
                                      <div key={group.id} className="space-y-3 px-1 mb-4">
                                         <label className="flex items-center gap-2 font-semibold text-foreground text-sm cursor-pointer">
                                             <input type="checkbox" onChange={() => toggleParentFilter(group.id)} checked={!!selectedFilters[group.id]} className="ui-checkbox" />
                                             {group.label}
                                         </label>
                                         <div className="pl-6 space-y-2">
                                             {group.children.map(c => (
                                                 <label key={c.id} className="block text-xs text-muted-foreground cursor-pointer">
                                                     <input type="checkbox" onChange={() => toggleChildFilter(group.id, c.id)} checked={!!selectedFilters[c.id]} className="ui-checkbox mr-2" />
                                                     {c.label}
                                                 </label>
                                             ))}
                                         </div>
                                      </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[10px] border border-border/70 bg-card text-muted-foreground transition hover:text-foreground dark:bg-card/90"
                            type="button"
                            onClick={() => setHideValues(prev => !prev)}
                        >
                            {hideValues ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                        </button>
                    </div>

                    <HealthCard healthData={healthData} hideValues={hideValues} />
                    <JourneyCard journeyData={journeyData} hideValues={hideValues} />
                </div>
            </div>
            
            <section className="w-full">
                 <PaymentMethodsGrid 
                    paymentMethods={financeData?.paymentMethods} 
                    hideValues={hideValues} 
                 />
            </section>
        </div>


        {/* Custom XL/2XL Grid Layout (>= 1280px) */}
        <div
            className="hidden xl:grid"
            style={{
                display: "grid",
                gridTemplateColumns: "0.85fr 0.85fr 0.85fr 1.41fr 1.41fr 0.5fr 1.2fr 1.2fr 0.4fr",
                gridTemplateRows: "max-content minmax(140px, auto) minmax(280px, auto) minmax(220px, auto)",
                gap: "12px",
                alignItems: "stretch",
                gridTemplateAreas: `
                  "datefilter datefilter datefilter . . filtrar filtrar filtrar toggle"
                  "saudacao saudacao saudacao disponivel pendente saude saude saude saude"
                  "faturamento faturamento faturamento faturamento faturamento jornada jornada jornada jornada"
                  "pagamentos pagamentos pagamentos pagamentos pagamentos pagamentos pagamentos pagamentos pagamentos"
                `
            }}
        >
            {/* 1. DateFilter */}
            <div style={{ gridArea: "datefilter" }} className="h-[48px]">
                <DateFilter />
            </div>

            {/* 2. Filter Dropdown */}
            <div style={{ gridArea: "filtrar" }} className="relative h-[48px]" ref={filterDropdownRef}>
                <button
                    type="button"
                    onClick={() => setFilterDropdownOpen(prev => !prev)}
                    className="flex w-full items-center gap-3 rounded-[10px] border border-muted bg-card px-4 text-left text-sm text-muted-foreground shadow-none h-full transition hover:border-muted-foreground/50"
                >
                    <Search className="h-4 w-4 shrink-0 color-muted-foreground text-sora" />
                    <span className="flex-1 text-muted-foreground text-sora truncate text-[13px]">
                        {selectedFiltersCount > 0
                        ? `${selectedFiltersCount} filtro(s)`
                        : "Filtrar por..."}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
                {isFilterDropdownOpen && (
                  <div className="absolute left-0 top-[calc(100%+10px)] z-40 w-full rounded-[16px] border border-muted/70 bg-card shadow-[0_24px_55px_rgba(0,0,0,0.55)] p-4">
                     <div className="flex items-center justify-between border-b border-muted/60 pb-3 mb-3">
                       <p className="font-semibold text-foreground text-sm">Filtrar por...</p>
                       <button onClick={() => setFilterDropdownOpen(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
                     </div>
                     <div className="max-h-[340px] overflow-y-auto space-y-4">
                        {filterModalGroups.map(group => (
                          <div key={group.id} className="space-y-2">
                             <label className="flex items-center gap-2 font-semibold text-foreground text-sm cursor-pointer">
                                 <input type="checkbox" onChange={() => toggleParentFilter(group.id)} checked={!!selectedFilters[group.id]} className="ui-checkbox" />
                                 {group.label}
                             </label>
                             <div className="pl-6 space-y-1">
                                 {group.children.map(c => (
                                     <label key={c.id} className="block text-xs text-muted-foreground cursor-pointer">
                                         <input type="checkbox" onChange={() => toggleChildFilter(group.id, c.id)} checked={!!selectedFilters[c.id]} className="ui-checkbox mr-2" />
                                         {c.label}
                                     </label>
                                 ))}
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                )}
            </div>

            {/* 3. Toggle View */}
            <div style={{ gridArea: "toggle" }} className="h-[48px]">
                <button
                    className="flex h-full w-full items-center justify-center rounded-[10px] border border-border/70 bg-card text-muted-foreground transition hover:text-foreground hover:border-muted-foreground/50 dark:bg-card/90"
                    type="button"
                    onClick={() => setHideValues(prev => !prev)}
                >
                    {hideValues ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>

            {/* 4. Saudacao */}
            <GreetingCard greetingName={greetingName} />

            {/* 5. Disponivel */}
            {balanceCards[0] && (
                <BalanceCard 
                    label={balanceCards[0].label}
                    value={balanceCards[0].value}
                    iconSrc={balanceCards[0].iconSrc}
                    hideValues={hideValues}
                    style={{ gridArea: "disponivel" }}
                />
            )}

            {/* 6. Pendente */}
            {balanceCards[1] && (
                <BalanceCard 
                    label={balanceCards[1].label}
                    value={balanceCards[1].value}
                    iconSrc={balanceCards[1].iconSrc}
                    hideValues={hideValues}
                    style={{ gridArea: "pendente" }}
                />
            )}

            {/* 7. Saude */}
            <HealthCard healthData={healthData} hideValues={hideValues} />

            {/* 8. Faturamento (Chart) */}
            <RevenueChartCard salesData={salesData} hideValues={hideValues} />

            {/* 9. Jornada */}
            <JourneyCard journeyData={journeyData} hideValues={hideValues} />

            {/* 10. Pagamentos */}
            <PaymentMethodsGrid paymentMethods={financeData?.paymentMethods} hideValues={hideValues} />
        </div>
      </div>
    </DashboardLayout>
  );
}
