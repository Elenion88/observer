export type Status =
  | "awaiting_qms"
  | "extracting"
  | "stage1_in_progress"
  | "stage1_done"
  | "stage2_in_progress"
  | "stage2_done"
  | "cert_issued"
  | "surveillance_1_in_progress"
  | "surveillance_1_done"
  | "surveillance_2_in_progress"
  | "surveillance_2_done"
  | "recert_due";

export const STATUS_LABEL: Record<Status, string> = {
  awaiting_qms: "Awaiting QMS",
  extracting: "Extracting…",
  stage1_in_progress: "Stage 1 · in progress",
  stage1_done: "Stage 1 · ready",
  stage2_in_progress: "Stage 2 · in progress",
  stage2_done: "Stage 2 · ready",
  cert_issued: "Certified",
  surveillance_1_in_progress: "Surveillance 1 · in progress",
  surveillance_1_done: "Surveillance 1 · complete",
  surveillance_2_in_progress: "Surveillance 2 · in progress",
  surveillance_2_done: "Surveillance 2 · complete",
  recert_due: "Recertification due",
};

export const STATUS_DOT: Record<Status, string> = {
  awaiting_qms: "bg-status-grey",
  extracting: "bg-status-active",
  stage1_in_progress: "bg-status-blue",
  stage1_done: "bg-status-done",
  stage2_in_progress: "bg-status-active",
  stage2_done: "bg-status-done",
  cert_issued: "bg-status-cert",
  surveillance_1_in_progress: "bg-status-blue",
  surveillance_1_done: "bg-status-done",
  surveillance_2_in_progress: "bg-status-blue",
  surveillance_2_done: "bg-status-done",
  recert_due: "bg-status-active",
};

export const STATUS_TEXT: Record<Status, string> = {
  awaiting_qms: "text-ink-mute",
  extracting: "text-status-active",
  stage1_in_progress: "text-status-blue",
  stage1_done: "text-status-done",
  stage2_in_progress: "text-status-active",
  stage2_done: "text-status-done",
  cert_issued: "text-status-cert",
  surveillance_1_in_progress: "text-status-blue",
  surveillance_1_done: "text-status-done",
  surveillance_2_in_progress: "text-status-blue",
  surveillance_2_done: "text-status-done",
  recert_due: "text-status-active",
};

export const TIMELINE_STEPS = [
  {
    key: "intake",
    label: "Intake",
    matches: ["awaiting_qms", "extracting"] as Status[],
  },
  {
    key: "stage1",
    label: "Stage 1",
    matches: ["stage1_in_progress", "stage1_done"] as Status[],
  },
  {
    key: "stage2",
    label: "Stage 2",
    matches: ["stage2_in_progress", "stage2_done"] as Status[],
  },
  {
    key: "cert",
    label: "Certified",
    matches: ["cert_issued"] as Status[],
  },
  {
    key: "surveillance1",
    label: "Surveillance 1",
    matches: ["surveillance_1_in_progress", "surveillance_1_done"] as Status[],
  },
  {
    key: "surveillance2",
    label: "Surveillance 2",
    matches: ["surveillance_2_in_progress", "surveillance_2_done"] as Status[],
  },
  {
    key: "recert",
    label: "Recert",
    matches: ["recert_due"] as Status[],
  },
];

export function timelinePosition(status: Status): number {
  return TIMELINE_STEPS.findIndex((s) => s.matches.includes(status));
}
