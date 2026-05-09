// Module-scoped registry of EvidenceItems with unsaved label edits. The Confirm
// Evidence button calls flushAllPendingLabels() before approving so the
// section never locks with typed-but-not-saved text in flight.

const flushers = new Map<string, () => Promise<void>>();

export function registerLabelFlush(
  id: string,
  fn: () => Promise<void>
): () => void {
  flushers.set(id, fn);
  return () => {
    flushers.delete(id);
  };
}

export async function flushAllPendingLabels(): Promise<void> {
  const fns = Array.from(flushers.values());
  await Promise.all(fns.map((f) => f().catch(() => {})));
}
