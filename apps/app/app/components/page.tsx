import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function Page({ title, children, className }: PageProps) {
  return (
    <div className={cn("p-6", className)}>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{title}</h1>
      </header>
      {children}
    </div>
  );
}
