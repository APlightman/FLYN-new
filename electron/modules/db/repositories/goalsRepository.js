const mapGoalRow = (row) => ({
  id: row.id,
  name: row.name,
  targetAmount: Number(row.target_amount),
  currentAmount: Number(row.current_amount),
  deadline: row.deadline,
  monthlyContribution: Number(row.monthly_contribution),
  priority: row.priority,
  description: row.description ?? undefined,
  inflationRate: row.inflation_rate ?? undefined,
  adjustForInflation: Boolean(row.adjust_for_inflation),
  expectedReturn: row.expected_return ?? undefined,
  inflationAdjustedTarget: row.inflation_adjusted_target ?? undefined,
  createdAt: row.created_at ?? undefined,
  updatedAt: row.updated_at ?? undefined,
  version: row.version ?? undefined,
});

const normalizeGoalPayload = (goal) => ({
  id: goal.id,
  name: goal.name,
  target_amount: goal.targetAmount,
  current_amount: goal.currentAmount,
  deadline: goal.deadline,
  monthly_contribution: goal.monthlyContribution,
  priority: goal.priority,
  description: goal.description ?? null,
  inflation_rate: goal.inflationRate ?? null,
  adjust_for_inflation: goal.adjustForInflation ? 1 : 0,
  expected_return: goal.expectedReturn ?? null,
  inflation_adjusted_target: goal.inflationAdjustedTarget ?? null,
  created_at: goal.createdAt ?? null,
  updated_at: goal.updatedAt ?? Date.now(),
  version: goal.version ?? null,
});

const listGoals = (db) => {
  const rows = db.prepare(`
    SELECT id, name, target_amount, current_amount, deadline, monthly_contribution, priority, description,
           inflation_rate, adjust_for_inflation, expected_return, inflation_adjusted_target, created_at, updated_at, version
    FROM financial_goals
    ORDER BY deadline ASC, updated_at DESC
  `).all();

  return rows.map(mapGoalRow);
};

const countGoals = (db) => {
  const row = db.prepare('SELECT COUNT(*) as count FROM financial_goals').get();
  return Number(row?.count ?? 0);
};

const replaceGoals = (db, goals) => {
  const insertStatement = db.prepare(`
    INSERT INTO financial_goals (
      id, name, target_amount, current_amount, deadline, monthly_contribution, priority, description,
      inflation_rate, adjust_for_inflation, expected_return, inflation_adjusted_target, created_at, updated_at, version
    ) VALUES (
      @id, @name, @target_amount, @current_amount, @deadline, @monthly_contribution, @priority, @description,
      @inflation_rate, @adjust_for_inflation, @expected_return, @inflation_adjusted_target, @created_at, @updated_at, @version
    )
  `);

  const transaction = db.transaction((items) => {
    db.prepare('DELETE FROM financial_goals').run();
    items.forEach((item) => insertStatement.run(normalizeGoalPayload(item)));
  });

  transaction(goals);
  return listGoals(db);
};

const createGoal = (db, goal) => {
  const payload = normalizeGoalPayload({
    ...goal,
    createdAt: goal.createdAt ?? Date.now(),
    updatedAt: goal.updatedAt ?? Date.now(),
  });

  db.prepare(`
    INSERT INTO financial_goals (
      id, name, target_amount, current_amount, deadline, monthly_contribution, priority, description,
      inflation_rate, adjust_for_inflation, expected_return, inflation_adjusted_target, created_at, updated_at, version
    ) VALUES (
      @id, @name, @target_amount, @current_amount, @deadline, @monthly_contribution, @priority, @description,
      @inflation_rate, @adjust_for_inflation, @expected_return, @inflation_adjusted_target, @created_at, @updated_at, @version
    )
  `).run(payload);

  const row = db.prepare(`
    SELECT id, name, target_amount, current_amount, deadline, monthly_contribution, priority, description,
           inflation_rate, adjust_for_inflation, expected_return, inflation_adjusted_target, created_at, updated_at, version
    FROM financial_goals
    WHERE id = ?
  `).get(goal.id);

  return row ? mapGoalRow(row) : null;
};

const updateGoal = (db, id, updates) => {
  const currentRow = db.prepare(`
    SELECT id, name, target_amount, current_amount, deadline, monthly_contribution, priority, description,
           inflation_rate, adjust_for_inflation, expected_return, inflation_adjusted_target, created_at, updated_at, version
    FROM financial_goals
    WHERE id = ?
  `).get(id);

  if (!currentRow) {
    return null;
  }

  const currentGoal = mapGoalRow(currentRow);
  const nextGoal = {
    ...currentGoal,
    ...updates,
    updatedAt: Date.now(),
  };

  db.prepare(`
    UPDATE financial_goals
    SET name = @name,
        target_amount = @target_amount,
        current_amount = @current_amount,
        deadline = @deadline,
        monthly_contribution = @monthly_contribution,
        priority = @priority,
        description = @description,
        inflation_rate = @inflation_rate,
        adjust_for_inflation = @adjust_for_inflation,
        expected_return = @expected_return,
        inflation_adjusted_target = @inflation_adjusted_target,
        created_at = @created_at,
        updated_at = @updated_at,
        version = @version
    WHERE id = @id
  `).run(normalizeGoalPayload(nextGoal));

  return nextGoal;
};

const deleteGoal = (db, id) => {
  const result = db.prepare('DELETE FROM financial_goals WHERE id = ?').run(id);
  return result.changes > 0;
};

export {
  countGoals,
  createGoal,
  deleteGoal,
  listGoals,
  replaceGoals,
  updateGoal,
};
