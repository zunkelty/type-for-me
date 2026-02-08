import { Item, ItemContent, ItemTitle } from "@/components/ui/item";

export function ListeningOverlay() {
  return (
    <div className="flex items-end pb-4 justify-center h-screen w-screen p-1">
      <Item
        variant="outline"
        size="sm"
        role="status"
        aria-live="polite"
        className="w-32 justify-center rounded-full border-border/70 bg-background/95 px-5 py-2 shadow-lg"
      >
        <ItemContent className="flex-none items-center gap-0">
          <ItemTitle className="text-sm">Listening</ItemTitle>
        </ItemContent>
      </Item>
    </div>
  );
}
