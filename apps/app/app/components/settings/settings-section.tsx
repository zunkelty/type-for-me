import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  subtitle,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
        className
      )}
    >
      <header className="space-y-1 p-5 sm:p-6">
        <h2 className="font-sans text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </header>
      <Separator />
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
