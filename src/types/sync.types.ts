export interface UpsertManyOptions {
  table: string;
  rows: Record<string, any>[];
  last_sync: string | null;
  next_id: string | null;
}
