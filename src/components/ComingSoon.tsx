import { LinkButton } from "@/components/ui/Button";

// shortcut: placeholder for routes built in later stages (see Tasks.md), remove as each page lands
export function ComingSoon({ title, stage }: { title: string; stage: number }) {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-muted">Раздел в разработке (этап {stage}).</p>
      <LinkButton href="/" variant="secondary" className="mt-8">На главную</LinkButton>
    </div>
  );
}
