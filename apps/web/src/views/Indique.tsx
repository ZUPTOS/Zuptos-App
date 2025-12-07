'use client';

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DateFilter from "@/components/DateFilter";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { format } from "date-fns";

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "link", label: "Link de indicação" },
  { id: "indicados", label: "Meus indicados" }
] as const;

const rawData = [
  { hour: "00:00", value: 22 },
  { hour: "02:00", value: 4 },
  { hour: "04:00", value: 2 },
  { hour: "06:00", value: 14 },
  { hour: "08:00", value: 7 },
  { hour: "10:00", value: 25 },
  { hour: "12:00", value: 18 },
  { hour: "14:00", value: 31 },
  { hour: "16:00", value: 24 },
  { hour: "18:00", value: 29 },
  { hour: "20:00", value: 32 },
  { hour: "22:00", value: 12 }
];

const metrics = [
  { id: "cadastros", label: "Cadastros realizados", value: "00" },
  { id: "comissoes", label: "Quantidade de comissões", value: "335" },
  { id: "total", label: "Total recebido", value: "R$ 00,00" }
] as const;

const referralLinks = [
  {
    id: "link-1",
    description: "sdfbsuy79",
    registrations: "00",
    commission: "R$ 679,97"
  }
] as const;

const referredPartners = [
  {
    id: "#KAJFB68",
    name: "Nome",
    commission: "R$ 568,99",
    date: "12/12/2024",
    source: "INSTAGRAM 02",
    status: "Ativo"
  }
] as const;

export default function Indique() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("dashboard");
  const [commissionPeriod, setCommissionPeriod] = useState<string>("");

  const chartData = useMemo(() => rawData, []);

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="Indique">
      <div className="flex flex-col gap-8 pb-8">
        <section
          className="relative w-full overflow-hidden border-y border-muted"
          style={{
            backgroundImage: "url(/images/indique.svg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-[#6c20d1]/50 to-black/80" />
          <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-4 py-8 text-white sm:px-12 sm:py-12">
            <div>
              <h2 className="text-[35px] font-semibold leading-tight">
                Convide amigos.
                <br />
                Ganhe Renda Passiva.
              </h2>
              <p className="mt-2 text-[15px] text-white/80">
                *O período de comissão tem duração de 1 ano por convidado.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-6 text-[19px] font-semibold">
              {tabs.map(tab => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative pb-1 transition-colors focus-visible:outline-none ${
                      isActive ? "text-white" : "text-white/50 hover:text-white"
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-[1480px] space-y-4 px-4">
          {activeTab === "dashboard" && (
            <div className="grid gap-4 lg:grid-cols-[763px_700px]">
              <div className="rounded-[8px] border border-muted bg-card/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-foreground">Comissão recebida</p>
              </div>
              <div className="w-full max-w-[320px]">
                <DateFilter
                  onDateChange={(start, end) =>
                    setCommissionPeriod(`${format(start, "dd/MM/yyyy")} - ${format(end, "dd/MM/yyyy")}`)
                  }
                />
              </div>
            </div>
            <div className="mt-6 h-[401px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: -30, right: 10, top: 10, bottom: 0 }}>
                  <XAxis
                    dataKey="hour"
                    stroke="#6b7280"
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "#27272a" }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "#27272a" }}
                  />
                  <Tooltip
                    cursor={{ stroke: "#9333ea", strokeWidth: 1, strokeDasharray: 4 }}
                    contentStyle={{
                      borderRadius: 12,
                      backgroundColor: "#0f0f0f",
                      border: "1px solid rgba(255,255,255,0.08)"
                    }}
                    labelStyle={{ color: "#fff" }}
                    itemStyle={{ color: "#a855f7" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
              </div>
              <div className="flex flex-col items-start justify-center gap-8 rounded-[8px] border border-muted bg-card/80 px-6">
                {metrics.map(metric => (
                  <div key={metric.id} className="space-y-2">
                    <p className="text-[18px] text-muted-foreground">{metric.label}</p>
                    <p className="text-[46px] font-semibold leading-tight text-foreground">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "link" && (
            <section className="mt-6 flex justify-center">
              <div className="flex w-full max-w-[1116px] flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-baseline gap-3">
                    <p className="text-2xl font-semibold text-foreground">Links de indicação</p>
                    <span className="text-sm text-muted-foreground">{referralLinks.length} registro</span>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-[8px] bg-gradient-to-r from-[#9b59ff] to-[#6c20d1] px-5 py-2 font-semibold text-white transition-transform hover:scale-[1.01]"
                  >
                    + Criar link
                  </button>
                </div>
                <div className="h-[175px] overflow-hidden rounded-[8px] border border-muted bg-card/80">
                  <table className="h-full w-full min-w-[320px] table-fixed text-left text-sm">
                    <colgroup>
                      <col className="w-[25%]" />
                      <col className="w-[120px]" />
                      <col className="w-[20%]" />
                    </colgroup>
                    <thead className="bg-card/60 text-muted-foreground">
                      <tr className="align-middle">
                        <th className="px-6 py-3 text-left font-semibold align-middle">Descrição</th>
                        <th className="px-6 py-3 text-left font-semibold align-middle">Registros</th>
                        <th className="px-6 py-3 text-left font-semibold align-middle">Comissão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralLinks.map(link => (
                        <tr
                          key={link.id}
                          className="border-t border-muted/50 bg-card/90 align-middle"
                        >
                          <td className="px-6 py-4 align-middle">
                            <div className="flex items-center gap-3">
                              <span className="h-10 w-10 rounded-[4px] bg-foreground/80" aria-hidden />
                              <span className="text-base text-foreground">{link.description}</span>
                            </div>
                          </td>
                          <td className="px-8 py-4 text-left text-base text-foreground align-middle">
                            <span className="block">{link.registrations}</span>
                          </td>
                          <td className="px-16 py-4 text-left text-base text-foreground align-middle">
                            <span className="block">{link.commission}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === "indicados" && (
            <section className="mt-6 flex justify-center">
              <div className="flex w-full max-w-[1116px] flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-baseline gap-3">
                    <p className="text-2xl font-semibold text-foreground">Meus afiliados</p>
                    <span className="text-sm text-muted-foreground">
                      {referredPartners.length} indicação
                    </span>
                  </div>
                </div>

                <div className="h-[175px] overflow-hidden rounded-[8px] border border-muted bg-card/80">
                  <table className="h-full w-full text-left text-sm">
                    <thead className="bg-card/60 text-muted-foreground">
                      <tr className="align-middle">
                        <th className="px-6 py-3 font-semibold">Id</th>
                        <th className="px-6 py-3 font-semibold">Nome</th>
                        <th className="px-6 py-3 font-semibold">Comissões</th>
                        <th className="px-6 py-3 font-semibold">Data de indicação</th>
                        <th className="px-6 py-3 font-semibold">Origem</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referredPartners.map(partner => (
                        <tr key={partner.id} className="border-t border-muted/50 bg-card/90 align-middle">
                          <td className="px-6 py-4 text-base text-foreground">{partner.id}</td>
                          <td className="px-6 py-4 text-base text-foreground">{partner.name}</td>
                          <td className="px-6 py-4 text-base text-foreground">{partner.commission}</td>
                          <td className="px-6 py-4 text-base text-foreground">{partner.date}</td>
                          <td className="px-6 py-4 text-base text-foreground">{partner.source}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex w-[90px] items-center justify-center rounded-[8px] bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
                              {partner.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
