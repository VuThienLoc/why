export function computeChanges<T extends object>(
  before: Partial<T> | null | undefined,
  after: Partial<T> | null | undefined,
  keys?: (keyof T)[],
  extra?: Record<string, unknown>
): { oldValues?: Record<string, unknown>; newValues?: Record<string, unknown> } {
  const oldValues: Record<string, unknown> = {};
  const newValues: Record<string, unknown> = {};

  const candidateKeys = keys
    ? keys
    : ([...new Set([...Object.keys(before || {}), ...Object.keys(after || {})])] as (keyof T)[]);

  for (const key of candidateKeys) {
    // Skip metadata fields
    if (['updated_at', 'updated_by', '__v', 'createdAt', 'updatedAt'].includes(key as string)) continue;

    const oldVal = before?.[key];
    const newVal = after?.[key];

    // Deep comparison using JSON.stringify
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      if (before) oldValues[key as string] = oldVal;
      if (after) newValues[key as string] = newVal;
    }
  }

  if (extra && Object.keys(extra).length) {
    for (const [k, v] of Object.entries(extra)) {
      newValues[k] = v;
    }
  }

  const result: { oldValues?: Record<string, unknown>; newValues?: Record<string, unknown> } = {};
  
  // Only attach if not empty
  if (Object.keys(oldValues).length > 0) result.oldValues = oldValues;
  if (Object.keys(newValues).length > 0) result.newValues = newValues;
  
  return result;
}