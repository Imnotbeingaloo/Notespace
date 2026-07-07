import { Loader2, CheckCircle2, AlertCircle, RotateCw, X } from "lucide-react";

interface UploadProgressToastProps {
  active: boolean;
  current: number;
  total: number;
  currentName?: string;
  failedNames?: string[];
  finished?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  onCancel?: () => void;
}

/**
 * Sticky bottom-right progress card shown during a batch upload. Renders
 * inline (not in the toast queue) so it can stay pinned while individual
 * success/failure toasts stack above it.
 */
export function UploadProgressToast({ active, current, total, currentName, failedNames = [], finished, onRetry, onDismiss, onCancel }: UploadProgressToastProps) {
  if (!active) return null;
  const pct = total === 0 ? 0 : Math.round((current / total) * 100);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[70] w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl bg-primary/10 backdrop-blur-md p-4 shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {finished ? (
            failedNames.length ? (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            )
          ) : (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">
              {finished
                ? failedNames.length
                  ? `${current - failedNames.length} of ${total} uploaded`
                  : `All ${total} files uploaded`
                : `Uploading ${current} of ${total}`}
            </p>
            {finished && onDismiss && (
              <button
                onClick={onDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {!finished && currentName && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate" title={currentName}>{currentName}</p>
          )}
          <div className="mt-2 h-1.5 w-full rounded-full bg-primary/10 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          {!finished && onCancel && (
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" /> Cancel upload
              </button>
            </div>
          )}
          {finished && failedNames.length > 0 && (
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs text-amber-600 dark:text-amber-400">
                {failedNames.length} failed
              </span>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <RotateCw className="h-3 w-3" /> Retry failed ({failedNames.length})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
