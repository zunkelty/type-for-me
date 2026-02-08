import {
  formatShortcutToken,
  tokenizeShortcut,
} from "@repo/keyboard-shortcuts";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

interface ShortcutPillsProps {
  shortcut: string;
  isActive: boolean;
}

export function ShortcutPills({ shortcut, isActive }: ShortcutPillsProps) {
  return (
    <KbdGroup>
      {tokenizeShortcut(shortcut).map((token, index) => (
        <Kbd key={`${token}-${index}`} className={cn(isActive && "bg-border")}>
          {formatShortcutToken(token)}
        </Kbd>
      ))}
    </KbdGroup>
  );
}
