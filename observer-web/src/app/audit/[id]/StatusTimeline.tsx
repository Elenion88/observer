import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { TIMELINE_STEPS, type Status, timelinePosition } from "@/lib/status";

export function StatusTimeline({ status }: { status: Status }) {
  const active = timelinePosition(status);
  return (
    <ol className="flex items-center gap-1 mt-4">
      {TIMELINE_STEPS.map((step, idx) => {
        const isPast = idx < active;
        const isCurrent = idx === active;
        const Icon = isPast ? CheckCircle2 : isCurrent ? CircleDot : Circle;
        const color = isPast
          ? "text-status-done"
          : isCurrent
            ? "text-navy"
            : "text-ink-faint";
        const labelColor = isCurrent
          ? "text-ink"
          : isPast
            ? "text-ink-mute"
            : "text-ink-faint";
        return (
          <li key={step.key} className="flex items-center gap-1">
            <span className="inline-flex items-center gap-1.5">
              <Icon size={14} className={color} />
              <span className={`text-[12px] font-medium ${labelColor}`}>
                {step.label}
              </span>
            </span>
            {idx < TIMELINE_STEPS.length - 1 && (
              <span
                className={`mx-2 h-px w-10 ${
                  isPast ? "bg-status-done/50" : "bg-line"
                }`}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
