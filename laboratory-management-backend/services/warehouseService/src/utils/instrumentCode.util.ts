import { randomUUID } from "crypto";

export const generateInstrumentCode = (): string => {
  const [segment] = randomUUID().split("-");
  const suffixSource = segment ?? randomUUID();
  const suffix = suffixSource.replace(/-/g, "").slice(0, 6).toUpperCase();
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 12);
  return `INST-${timestamp}-${suffix}`;
};
