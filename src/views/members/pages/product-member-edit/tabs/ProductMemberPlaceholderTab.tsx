"use client";

type Props = {
  title: string;
  description?: string;
};

export function ProductMemberPlaceholderTab({ title, description }: Props) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="rounded-[10px] border border-dashed border-foreground/10 bg-card/40 px-6 py-10 text-sm text-muted-foreground">
        {description ?? "Em breve."}
      </div>
    </section>
  );
}

