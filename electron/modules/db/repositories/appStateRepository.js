const APP_STATE_ROW_ID = 1;

const loadAppStateRecord = (db) => {
  const row = db.prepare(
    'SELECT payload, updated_at FROM app_state WHERE id = ?'
  ).get(APP_STATE_ROW_ID);

  if (!row) {
    return {
      state: null,
      updatedAt: null,
    };
  }

  return {
    state: JSON.parse(row.payload),
    updatedAt: row.updated_at,
  };
};

const saveAppStateRecord = (db, state) => {
  const updatedAt = new Date().toISOString();
  const payload = JSON.stringify(state);

  db.prepare(`
    INSERT INTO app_state (id, payload, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      payload = excluded.payload,
      updated_at = excluded.updated_at
  `).run(APP_STATE_ROW_ID, payload, updatedAt);

  return { updatedAt };
};

export { loadAppStateRecord, saveAppStateRecord };
