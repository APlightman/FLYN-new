const mapTransactionRow = (row) => ({
  id: row.id,
  type: row.type,
  amount: Number(row.amount),
  category: row.category,
  description: row.description,
  date: row.date,
  tags: row.tags_json ? JSON.parse(row.tags_json) : undefined,
  isRecurring: Boolean(row.is_recurring),
  recurringId: row.recurring_id ?? undefined,
  createdAt: row.created_at ?? undefined,
  updatedAt: row.updated_at ?? undefined,
  version: row.version ?? undefined,
});

const normalizeTransactionPayload = (transaction) => ({
  id: transaction.id,
  type: transaction.type,
  amount: transaction.amount,
  category: transaction.category,
  description: transaction.description,
  date: transaction.date,
  tags_json: transaction.tags && transaction.tags.length > 0 ? JSON.stringify(transaction.tags) : null,
  is_recurring: transaction.isRecurring ? 1 : 0,
  recurring_id: transaction.recurringId ?? null,
  created_at: transaction.createdAt ?? null,
  updated_at: transaction.updatedAt ?? Date.now(),
  version: transaction.version ?? null,
});

const listTransactions = (db) => {
  const rows = db.prepare(`
    SELECT id, type, amount, category, description, date, tags_json, is_recurring, recurring_id, created_at, updated_at, version
    FROM transactions
    ORDER BY date DESC, updated_at DESC
  `).all();

  return rows.map(mapTransactionRow);
};

const countTransactions = (db) => {
  const row = db.prepare('SELECT COUNT(*) as count FROM transactions').get();
  return Number(row?.count ?? 0);
};

const replaceTransactions = (db, transactions) => {
  const insertStatement = db.prepare(`
    INSERT INTO transactions (
      id, type, amount, category, description, date, tags_json, is_recurring, recurring_id, created_at, updated_at, version
    ) VALUES (
      @id, @type, @amount, @category, @description, @date, @tags_json, @is_recurring, @recurring_id, @created_at, @updated_at, @version
    )
  `);

  const transaction = db.transaction((items) => {
    db.prepare('DELETE FROM transactions').run();
    items.forEach((item) => insertStatement.run(normalizeTransactionPayload(item)));
  });

  transaction(transactions);
  return listTransactions(db);
};

const createTransaction = (db, transaction) => {
  const payload = normalizeTransactionPayload({
    ...transaction,
    createdAt: transaction.createdAt ?? Date.now(),
    updatedAt: transaction.updatedAt ?? Date.now(),
  });

  db.prepare(`
    INSERT INTO transactions (
      id, type, amount, category, description, date, tags_json, is_recurring, recurring_id, created_at, updated_at, version
    ) VALUES (
      @id, @type, @amount, @category, @description, @date, @tags_json, @is_recurring, @recurring_id, @created_at, @updated_at, @version
    )
  `).run(payload);

  const row = db.prepare(`
    SELECT id, type, amount, category, description, date, tags_json, is_recurring, recurring_id, created_at, updated_at, version
    FROM transactions
    WHERE id = ?
  `).get(transaction.id);

  return row ? mapTransactionRow(row) : null;
};

const updateTransaction = (db, id, updates) => {
  const currentRow = db.prepare(`
    SELECT id, type, amount, category, description, date, tags_json, is_recurring, recurring_id, created_at, updated_at, version
    FROM transactions
    WHERE id = ?
  `).get(id);

  if (!currentRow) {
    return null;
  }

  const currentTransaction = mapTransactionRow(currentRow);
  const nextTransaction = {
    ...currentTransaction,
    ...updates,
    updatedAt: Date.now(),
  };

  db.prepare(`
    UPDATE transactions
    SET type = @type,
        amount = @amount,
        category = @category,
        description = @description,
        date = @date,
        tags_json = @tags_json,
        is_recurring = @is_recurring,
        recurring_id = @recurring_id,
        created_at = @created_at,
        updated_at = @updated_at,
        version = @version
    WHERE id = @id
  `).run(normalizeTransactionPayload(nextTransaction));

  return nextTransaction;
};

const deleteTransaction = (db, id) => {
  const result = db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
  return result.changes > 0;
};

export {
  countTransactions,
  createTransaction,
  deleteTransaction,
  listTransactions,
  replaceTransactions,
  updateTransaction,
};
