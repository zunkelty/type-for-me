import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ErrorFallbackProps {
  title?: string;
  message?: string;
  error?: Error;
  onRetry?: () => void;
  showDetails?: boolean;
}

export function ErrorFallback({
  title = "Something went wrong",
  message = "An unexpected error occurred.",
  error,
  onRetry,
  showDetails = import.meta.env.DEV,
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {showDetails && error && (
        <pre className="max-w-full overflow-x-auto rounded-md bg-muted p-3 text-left text-xs">
          <code>{error.message}</code>
        </pre>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
