function resolveConflict(local: any, server: any) {
  // Prefer newer updated_date
  if (local.updated_date > server.updated_date) {
    return { ...server, ...local };
  }

  // Prefer higher row_version
  if (local.row_version > server.row_version) {
    return { ...server, ...local };
  }

  return server; // server wins
}

export default resolveConflict;
