"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import { notify } from "@/shared/ui/notification-toast";

import type { MembersSettings } from "../settings.types";

type SettingsTabProps = {
  settings: MembersSettings;
  onChange: React.Dispatch<React.SetStateAction<MembersSettings>>;
};

function SettingsRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr] lg:gap-8">
      <div>
        <h3 className="text-lg font-semibold leading-tight text-foreground sm:text-xl">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function PlanCard({
  title,
  bullets,
  selected,
  onSelect,
}: {
  title: string;
  bullets: string[];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "rounded-[10px] border bg-card p-5 text-left transition",
        selected
          ? "border-primary shadow-[0_0_0_1px_rgba(95,23,255,0.55)]"
          : "border-foreground/10 hover:border-foreground/20"
      )}
    >
      <p className="text-base font-semibold text-foreground">{title}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

export function SettingsTab({ settings, onChange }: SettingsTabProps) {
  return (
    <div className="mt-6 space-y-8">
      <SettingsRow
        title="Tipo de área de membros"
        description="Aprenda mais sobre os tipos de área de membros"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <PlanCard
            title="Lite"
            selected={settings.areaType === "lite"}
            onSelect={() =>
              onChange((prev) => ({
                ...prev,
                areaType: "lite",
              }))
            }
            bullets={[
              "Apenas um curso",
              "Fácil configuração",
              "Personalização básica",
              "Recomendado para iniciantes",
            ]}
          />
          <PlanCard
            title="Completo"
            selected={settings.areaType === "completo"}
            onSelect={() =>
              onChange((prev) => ({
                ...prev,
                areaType: "completo",
              }))
            }
            bullets={[
              "Múltiplos cursos",
              "Domínio próprio",
              "Personalização completa",
              "Recomendado para infoprodutores avançados",
            ]}
          />
        </div>
      </SettingsRow>

      <SettingsRow
        title="Comentários"
        description="Aprenda mais sobre os comentários"
      >
        <div className="rounded-[10px] border border-foreground/10 bg-card px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-base text-muted-foreground">Ativar comentários</p>
            <Switch
              aria-label="Ativar comentários"
              checked={settings.commentsEnabled}
              onCheckedChange={(checked) =>
                onChange((prev) => ({
                  ...prev,
                  commentsEnabled: checked,
                }))
              }
            />
          </div>
        </div>
      </SettingsRow>

      <SettingsRow
        title="Idioma"
        description="Escolha o idioma da sua área de membros"
      >
        <div className="max-w-[240px] rounded-[10px] border border-foreground/10 bg-card px-5 py-4">
          <Select
            value={settings.language}
            onValueChange={(value) =>
              onChange((prev) => ({
                ...prev,
                language: value === "en" ? "en" : "pt",
              }))
            }
          >
            <SelectTrigger
              aria-label="Idioma da área de membros"
              className="h-11 w-full rounded-[6px] border border-foreground/10 bg-background px-4 text-base text-muted-foreground shadow-none"
            >
              <SelectValue placeholder="Português" />
            </SelectTrigger>
            <SelectContent className="border-foreground/10 bg-card text-foreground">
              <SelectItem value="pt">Português</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingsRow>

      <SettingsRow
        title="Proteção anti pirataria para e-books"
        description="Aprenda mais sobre o sistema anti pirataria"
      >
        <div className="rounded-[10px] border border-foreground/10 bg-card px-5 py-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                aria-label="Colocar marca d'água"
                checked={settings.antiPiracy.watermark}
                onCheckedChange={(checked) =>
                  onChange((prev) => ({
                    ...prev,
                    antiPiracy: { ...prev.antiPiracy, watermark: checked },
                  }))
                }
              />
              <p className="text-base text-muted-foreground">
                Colocar marca d&apos;água com os dados do comprador em todas as páginas
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                aria-label="Bloquear Ctrl + C"
                checked={settings.antiPiracy.blockCopy}
                onCheckedChange={(checked) =>
                  onChange((prev) => ({
                    ...prev,
                    antiPiracy: { ...prev.antiPiracy, blockCopy: checked },
                  }))
                }
              />
              <p className="text-base text-muted-foreground">Bloquear Ctrl + C</p>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                aria-label="Bloquear opção de imprimir"
                checked={settings.antiPiracy.blockPrint}
                onCheckedChange={(checked) =>
                  onChange((prev) => ({
                    ...prev,
                    antiPiracy: { ...prev.antiPiracy, blockPrint: checked },
                  }))
                }
              />
              <p className="text-base text-muted-foreground">Bloquear opção de imprimir</p>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                aria-label="Proteger com senha"
                checked={settings.antiPiracy.passwordByEmail}
                onCheckedChange={(checked) =>
                  onChange((prev) => ({
                    ...prev,
                    antiPiracy: { ...prev.antiPiracy, passwordByEmail: checked },
                  }))
                }
              />
              <p className="text-base text-muted-foreground">
                Proteger com senha? A senha será o e-mail do comprador.
              </p>
            </div>
          </div>
        </div>
      </SettingsRow>

      <SettingsRow
        title="E-mail"
        description="Esse e-mail será exibido nos e-mails de acesso enviados ao cliente, e também na Área de membros. Se deixar vazio, será usado o e-mail da sua conta Zuptos."
      >
        <div className="rounded-[10px] border border-foreground/10 bg-card px-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="members-support-email" className="text-sm text-muted-foreground">
              E-mail de suporte
            </Label>
            <Input
              id="members-support-email"
              type="email"
              placeholder="Insira o e-mail"
              className="h-11 rounded-[6px] border border-foreground/10 bg-background px-4 text-base"
              value={settings.supportEmail}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  supportEmail: event.target.value,
                }))
              }
            />
          </div>
        </div>
      </SettingsRow>

      <div className="flex flex-col gap-3 border-t border-foreground/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="h-10 rounded-[8px] border border-foreground/10 bg-card px-4 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          onClick={() => notify.warning("Em breve", "Excluir área de membros será implementado.")}
        >
          Excluir área de membros
        </button>

        <button
          type="button"
          className="h-10 rounded-[8px] bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-105"
          onClick={() =>
            notify.success(
              "Alterações salvas",
              "As configurações da área de membros foram atualizadas."
            )
          }
        >
          Salvar alterações
        </button>
      </div>
    </div>
  );
}
