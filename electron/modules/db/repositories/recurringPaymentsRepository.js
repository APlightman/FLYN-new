const mapRecurringPaymentRow = (row) => ({
  id: row.id,
  name: row.name,
  amount: Number(row.amount),
  category: row.category,
  frequency: row.frequency,
  cronExpression: row.cron_expression ?? undefined,
  nextDate: row.next_date,
  isActive: Boolean(row.is_active),
  description: row.description ?? undefined,
  createdAt: row.created_at ?? undefined,
  updatedAt: row.updated_at ?? undefined,
  version: row.version ?? undefined,
});

const normalizeRecurringPaymentPayload = (payment) => ({
  id: payment.id,
  name: payment.name,
  amount: payment.amount,
  category: payment.category,
  frequency: payment.frequency,
  cron_expression: payment.cronExpression ?? null,
  next_date: payment.nextDate,
  is_active: payment.isActive ? 1 : 0,
  description: payment.description ?? null,
  created_at: payment.createdAt ?? null,
  updated_at: payment.updatedAt ?? Date.now(),
  version: payment.version ?? null,
});

const listRecurringPayments = (db) => {
  const rows = db.prepare(`
    SELECT id, name, amount, category, frequency, cron_expression, next_date, is_active, description, created_at, updated_at, version
    FROM recurring_payments
    ORDER BY next_date ASC, updated_at DESC
  `).all();

  return rows.map(mapRecurringPaymentRow);
};

const countRecurringPayments = (db) => {
  const row = db.prepare('SELECT COUNT(*) as count FROM recurring_payments').get();
  return Number(row?.count ?? 0);
};

const replaceRecurringPayments = (db, payments) => {
  const insertStatement = db.prepare(`
    INSERT INTO recurring_payments (
      id, name, amount, category, frequency, cron_expression, next_date, is_active, description, created_at, updated_at, version
    ) VALUES (
      @id, @name, @amount, @category, @frequency, @cron_expression, @next_date, @is_active, @description, @created_at, @updated_at, @version
    )
  `);

  const transaction = db.transaction((items) => {
    db.prepare('DELETE FROM recurring_payments').run();
    items.forEach((item) => insertStatement.run(normalizeRecurringPaymentPayload(item)));
  });

  transaction(payments);
  return listRecurringPayments(db);
};

const createRecurringPayment = (db, payment) => {
  const payload = normalizeRecurringPaymentPayload({
    ...payment,
    createdAt: payment.createdAt ?? Date.now(),
    updatedAt: payment.updatedAt ?? Date.now(),
  });

  db.prepare(`
    INSERT INTO recurring_payments (
      id, name, amount, category, frequency, cron_expression, next_date, is_active, description, created_at, updated_at, version
    ) VALUES (
      @id, @name, @amount, @category, @frequency, @cron_expression, @next_date, @is_active, @description, @created_at, @updated_at, @version
    )
  `).run(payload);

  const row = db.prepare(`
    SELECT id, name, amount, category, frequency, cron_expression, next_date, is_active, description, created_at, updated_at, version
    FROM recurring_payments
    WHERE id = ?
  `).get(payment.id);

  return row ? mapRecurringPaymentRow(row) : null;
};

const updateRecurringPayment = (db, id, updates) => {
  const currentRow = db.prepare(`
    SELECT id, name, amount, category, frequency, cron_expression, next_date, is_active, description, created_at, updated_at, version
    FROM recurring_payments
    WHERE id = ?
  `).get(id);

  if (!currentRow) {
    return null;
  }

  const currentPayment = mapRecurringPaymentRow(currentRow);
  const nextPayment = {
    ...currentPayment,
    ...updates,
    updatedAt: Date.now(),
  };

  db.prepare(`
    UPDATE recurring_payments
    SET name = @name,
        amount = @amount,
        category = @category,
        frequency = @frequency,
        cron_expression = @cron_expression,
        next_date = @next_date,
        is_active = @is_active,
        description = @description,
        created_at = @created_at,
        updated_at = @updated_at,
        version = @version
    WHERE id = @id
  `).run(normalizeRecurringPaymentPayload(nextPayment));

  return nextPayment;
};

const deleteRecurringPayment = (db, id) => {
  const result = db.prepare('DELETE FROM recurring_payments WHERE id = ?').run(id);
  return result.changes > 0;
};

export {
  countRecurringPayments,
  createRecurringPayment,
  deleteRecurringPayment,
  listRecurringPayments,
  replaceRecurringPayments,
  updateRecurringPayment,
};
