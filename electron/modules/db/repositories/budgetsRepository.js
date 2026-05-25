const mapBudgetRow = (row) => ({
  id: row.id,
  categoryId: row.category_id,
  amount: Number(row.amount),
  period: row.period,
  spent: Number(row.spent ?? 0),
  remaining: Number(row.remaining ?? 0),
  group: row.budget_group ?? undefined,
  percentage: row.percentage ?? undefined,
  createdAt: row.created_at ?? undefined,
  updatedAt: row.updated_at ?? undefined,
  version: row.version ?? undefined,
});

const normalizeBudgetPayload = (budget) => ({
  id: budget.id,
  category_id: budget.categoryId,
  amount: budget.amount,
  period: budget.period,
  spent: budget.spent ?? 0,
  remaining: budget.remaining ?? budget.amount - (budget.spent ?? 0),
  budget_group: budget.group ?? null,
  percentage: budget.percentage ?? null,
  created_at: budget.createdAt ?? null,
  updated_at: budget.updatedAt ?? Date.now(),
  version: budget.version ?? null,
});

const listBudgets = (db) => {
  const rows = db.prepare(`
    SELECT id, category_id, amount, period, spent, remaining, budget_group, percentage, created_at, updated_at, version
    FROM budgets
    ORDER BY updated_at DESC, id ASC
  `).all();

  return rows.map(mapBudgetRow);
};

const countBudgets = (db) => {
  const row = db.prepare('SELECT COUNT(*) as count FROM budgets').get();
  return Number(row?.count ?? 0);
};

const replaceBudgets = (db, budgets) => {
  const insertStatement = db.prepare(`
    INSERT INTO budgets (
      id, category_id, amount, period, spent, remaining, budget_group, percentage, created_at, updated_at, version
    ) VALUES (
      @id, @category_id, @amount, @period, @spent, @remaining, @budget_group, @percentage, @created_at, @updated_at, @version
    )
  `);

  const transaction = db.transaction((items) => {
    db.prepare('DELETE FROM budgets').run();
    items.forEach((item) => insertStatement.run(normalizeBudgetPayload(item)));
  });

  transaction(budgets);
  return listBudgets(db);
};

const createBudget = (db, budget) => {
  const payload = normalizeBudgetPayload({
    ...budget,
    createdAt: budget.createdAt ?? Date.now(),
    updatedAt: budget.updatedAt ?? Date.now(),
  });

  db.prepare(`
    INSERT INTO budgets (
      id, category_id, amount, period, spent, remaining, budget_group, percentage, created_at, updated_at, version
    ) VALUES (
      @id, @category_id, @amount, @period, @spent, @remaining, @budget_group, @percentage, @created_at, @updated_at, @version
    )
  `).run(payload);

  const row = db.prepare(`
    SELECT id, category_id, amount, period, spent, remaining, budget_group, percentage, created_at, updated_at, version
    FROM budgets
    WHERE id = ?
  `).get(budget.id);

  return row ? mapBudgetRow(row) : null;
};

const updateBudget = (db, id, updates) => {
  const currentRow = db.prepare(`
    SELECT id, category_id, amount, period, spent, remaining, budget_group, percentage, created_at, updated_at, version
    FROM budgets
    WHERE id = ?
  `).get(id);

  if (!currentRow) {
    return null;
  }

  const currentBudget = mapBudgetRow(currentRow);
  const nextBudget = {
    ...currentBudget,
    ...updates,
    updatedAt: Date.now(),
  };

  if (updates.remaining === undefined && (updates.amount !== undefined || updates.spent !== undefined)) {
    nextBudget.remaining = nextBudget.amount - nextBudget.spent;
  }

  db.prepare(`
    UPDATE budgets
    SET category_id = @category_id,
        amount = @amount,
        period = @period,
        spent = @spent,
        remaining = @remaining,
        budget_group = @budget_group,
        percentage = @percentage,
        created_at = @created_at,
        updated_at = @updated_at,
        version = @version
    WHERE id = @id
  `).run(normalizeBudgetPayload(nextBudget));

  return mapBudgetRow(normalizeBudgetPayload(nextBudget));
};

const deleteBudget = (db, id) => {
  const result = db.prepare('DELETE FROM budgets WHERE id = ?').run(id);
  return result.changes > 0;
};

export {
  countBudgets,
  createBudget,
  deleteBudget,
  listBudgets,
  replaceBudgets,
  updateBudget,
};
