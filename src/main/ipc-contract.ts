export type BatchOp<K extends keyof IpcDB = keyof IpcDB> = {
  op: K;
  args: IpcDB[K]["args"];
};

export interface IpcDB {
  "db:getActiveDeviceContext": {
    args: [];
    result: { deviceId: string; branchId: string | null } | null;
  };

  "db:countUnsyncedRows": {
    args: [table: string];
    result: number;
  };

  "db:getUnsyncedRows": {
    args: [table: string, limit: number, offset: number];
    result: any[];
  };

  "db:upsertMany": {
    args: [table: string, rows: any[]];
    result: number;
  };

  "db:markTableSynced": {
    args: [table: string];
    result: number;
  };

  // 🚀 BATCH
  "db:batch": {
    args: [BatchOp[]]; // ✅ ARRAY wrapped correctly
    result: any[];
  };

  "db:addRetry": {
    args: [table: string, payload: any, error: string];
    result: void;
  };

  "db:getRetries": {
    args: [table: string];
    result: { id: number; payload: string }[];
  };

  "db:removeRetry": {
    args: [id: number];
    result: void;
  };

  "db:incrementRetry": {
    args: [id: number];
    result: void;
  };

  "db:upsert": {
    args: [table: string, row: any];
    result: void;
  };

  // addRetry: (t, p, e) => invoke("db:addRetry", t, p, e),

  // getRetries: (t) => invoke("db:getRetries", t),

  // removeRetry: (id) => invoke("db:removeRetry", id),

  // incrementRetry: (id) => invoke("db:incrementRetry", id),

  // upsert: (t, r) => invoke("db:upsert", t, r),
}
