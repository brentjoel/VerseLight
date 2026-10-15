import { object, requireValid, SCHEMA_VERSION } from "./storage-schema";

export type Migration = (input: Record<string, unknown>) => Record<string, unknown>;
// Version 1 is the first released local format. Never guess a migration for an unknown schema.
const migrations: Readonly<Record<number, Migration>> = {};
export function migrateVersioned(input: unknown, steps = migrations, target = SCHEMA_VERSION): unknown {
  let value = structuredClone(input);
  let record = object(value, ["schemaVersion"], ["format", "exportedAt", "revision", "updatedAt", "data"]);
  requireValid(Number.isSafeInteger(record.schemaVersion) && Number(record.schemaVersion) >= 0 && Number(record.schemaVersion) <= target, "This data version is not supported. Keep the original for a compatible version.");
  while (Number(record.schemaVersion) < target) {
    const version = Number(record.schemaVersion);
    requireValid(Object.hasOwn(steps, version), "There is no migration for this older format. Your original data is unchanged.");
    value = steps[version](structuredClone(record));
    record = object(value, ["schemaVersion"], ["format", "exportedAt", "revision", "updatedAt", "data"]);
    requireValid(record.schemaVersion === version + 1, "The data migration could not finish safely.");
  }
  return value;
}
