import React from 'react';
import { LoaderCircle } from 'lucide-react';

interface AiLoadingCardProps {
  title?: string;
  messages?: string[];
  subtitle?: string;
  steps?: string[];
  className?: string;
}

export const AiLoadingCard: React.FC<AiLoadingCardProps> = ({
  title = 'Working on your request',
  messages = [],
  subtitle = 'This may take a moment. You can stay on this page while the result is prepared.',
  steps = ['Analyze input', 'Prepare a plan', 'Generate result'],
  className = ''
}) => {
  const statusMessage = messages[0] ?? 'Preparing your result…';

  return (
    <section
      className={`py-5 sm:py-7 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(260px,0.95fr)] lg:items-center">
        <div className="min-w-0">
          <p className="eyebrow-text">IN PROGRESS</p>
          <div className="mt-3 flex items-center gap-3">
            <LoaderCircle className="h-5 w-5 shrink-0 animate-spin text-[var(--brand-primary)]" aria-hidden="true" />
            <h4 className="text-base font-semibold leading-snug text-[var(--text-primary)] font-display sm:text-lg">
              {title}
            </h4>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{subtitle}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{statusMessage}</p>

          <div
            className="mt-5 h-1 overflow-hidden rounded-full bg-[var(--surface)]"
            role="progressbar"
            aria-label="Generation in progress"
            aria-valuetext="Waiting for the result"
          >
            <span className="ai-loading-sweep block h-full w-[38%] rounded-full bg-[var(--brand-primary)]" />
          </div>

          <ol className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            {steps.map((step, index) => (
              <li key={`${index}-${step}`} className="flex min-w-0 items-center gap-2 text-xs text-[var(--text-secondary)]">
                <span className="font-mono text-[11px] text-[var(--brand-primary)]">{String(index + 1).padStart(2, '0')}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-5" aria-hidden="true">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Preparing output</p>
          <div className="space-y-5">
            {['w-4/5', 'w-3/5', 'w-4/5'].map((width, row) => (
              <div key={row} className="flex items-center gap-3">
                <span className="h-7 w-7 shrink-0 animate-pulse rounded-md bg-[var(--surface)]" />
                <span className="min-w-0 flex-1 space-y-2">
                  <span className="block h-2.5 w-2/5 animate-pulse rounded bg-[var(--surface)]" />
                  <span className={`block h-2 ${width} animate-pulse rounded bg-[var(--surface)]`} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};