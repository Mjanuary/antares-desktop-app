import React, { useEffect, useState } from "react";

type Status =
  | { type: "start" }
  | { type: "push:table"; table: string }
  | { type: "pull:table"; table: string }
  | { type: "progress"; percent: number; table?: string }
  | { type: "error"; table: string; message: string }
  | { type: "done" };

export const SyncManager: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [table, setTable] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const unsub = window.syncAPI.onStatus(handleStatus);

    // auto start on mount
    window.syncAPI.start();

    return () => unsub();
  }, []);

  function handleStatus(status: Status) {
    switch (status.type) {
      case "start":
        setRunning(true);
        log("Sync started");
        break;

      case "push:table":
        setTable(status.table);
        log(`Pushing ${status.table}`);
        break;

      case "pull:table":
        setTable(status.table);
        log(`Pulling ${status.table}`);
        break;

      case "progress":
        setProgress(status.percent);
        break;

      case "error":
        log(`Error on ${status.table}: ${status.message}`);
        alert(`Sync error on ${status.table}`);
        break;

      case "done":
        setRunning(false);
        setTable(null);
        setProgress(100);
        log("Sync completed");
        break;
    }
  }

  function log(msg: string) {
    setLogs((l) =>
      [`${new Date().toLocaleTimeString()} — ${msg}`, ...l].slice(0, 200)
    );
  }

  return (
    <div style={{ padding: 12 }}>
      <h3>Synchronization</h3>

      <div>
        <progress value={progress} max={100} />
        <span>{progress}%</span>
      </div>

      <p>
        <strong>Status:</strong> {running ? `Syncing ${table ?? ""}` : "Idle"}
      </p>

      <button onClick={() => window.syncAPI.start()} disabled={running}>
        Start
      </button>

      <button onClick={() => window.syncAPI.cancel()} disabled={!running}>
        Cancel
      </button>

      <div style={{ marginTop: 12, maxHeight: 200, overflow: "auto" }}>
        {logs.map((l, i) => (
          <div key={i} style={{ fontSize: 12, fontFamily: "monospace" }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
};
