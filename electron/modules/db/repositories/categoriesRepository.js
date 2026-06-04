const mapCategoryRow = (row) => ({
  id: row.id,
  name: row.name,
  type: row.type,
  color: row.color,
  parent: row.parent ?? undefined,
  budget: row.budget ?? undefined,
  createdAt: row.created_at ?? undefined,
  updatedAt: row.updated_at ?? undefined,
  version: row.version ?? undefined,
});

const normalizeCategoryPayload = (category) => ({
  id: category.id,
  name: category.name,
  type: category.type,
  color: category.color,
  parent: category.parent ?? null,
  budget: category.budget ?? null,
  created_at: category.createdAt ?? null,
  updated_at: category.updatedAt ?? Date.now(),
  version: category.version ?? null,
});

// Simple in-memory cache for categories (lazy loading)
let categoriesCache = null;
let categoriesCacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const invalidateCategoriesCache = () => {
  categoriesCache = null;
  categoriesCacheTimestamp = 0;
};

const listCategories = (db) => {
  // Return cached data if valid
  if (categoriesCache && Date.now() - categoriesCacheTimestamp < CACHE_TTL_MS) {
    return categoriesCache;
  }

  const rows = db
    .prepare(
      `
    SELECT id, name, type, color, parent, budget, created_at, updated_at, version
    FROM categories
    ORDER BY type, name
  `,
    )
    .all();

  const categories = rows.map(mapCategoryRow);
  categoriesCache = categories;
  categoriesCacheTimestamp = Date.now();
  return categories;
};

const countCategories = (db) => {
  const row = db.prepare("SELECT COUNT(*) as count FROM categories").get();
  return Number(row?.count ?? 0);
};

const replaceCategories = (db, categories) => {
  const insertStatement = db.prepare(`
    INSERT INTO categories (
      id, name, type, color, parent, budget, created_at, updated_at, version
    ) VALUES (
      @id, @name, @type, @color, @parent, @budget, @created_at, @updated_at, @version
    )
  `);

  const transaction = db.transaction((items) => {
    db.prepare("DELETE FROM categories").run();
    items.forEach((item) =>
      insertStatement.run(normalizeCategoryPayload(item)),
    );
  });

  // Invalidate cache before transaction to ensure fresh data
  invalidateCategoriesCache();
  transaction(categories);
  return listCategories(db);
};

const createCategory = (db, category) => {
  const payload = normalizeCategoryPayload({
    ...category,
    createdAt: category.createdAt ?? Date.now(),
    updatedAt: category.updatedAt ?? Date.now(),
  });

  db.prepare(
    `
    INSERT INTO categories (
      id, name, type, color, parent, budget, created_at, updated_at, version
    ) VALUES (
      @id, @name, @type, @color, @parent, @budget, @created_at, @updated_at, @version
    )
  `,
  ).run(payload);

  // Invalidate cache because categories changed
  invalidateCategoriesCache();

  const row = db
    .prepare(
      `
    SELECT id, name, type, color, parent, budget, created_at, updated_at, version
    FROM categories
    WHERE id = ?
  `,
    )
    .get(category.id);

  return row ? mapCategoryRow(row) : null;
};

const updateCategory = (db, id, updates) => {
  const currentRow = db
    .prepare(
      `
    SELECT id, name, type, color, parent, budget, created_at, updated_at, version
    FROM categories
    WHERE id = ?
  `,
    )
    .get(id);

  if (!currentRow) {
    return null;
  }

  const currentCategory = mapCategoryRow(currentRow);
  const nextCategory = {
    ...currentCategory,
    ...updates,
    name: updates.name?.trim() || currentCategory.name,
    updatedAt: Date.now(),
  };

  const updateDatabase = db.transaction(() => {
    db.prepare(
      `
      UPDATE categories
      SET name = @name,
          type = @type,
          color = @color,
          parent = @parent,
          budget = @budget,
          created_at = @created_at,
          updated_at = @updated_at,
          version = @version
      WHERE id = @id
    `,
    ).run(normalizeCategoryPayload(nextCategory));

    if (nextCategory.name !== currentCategory.name) {
      db.prepare(
        `
        UPDATE transactions
        SET category = ?,
            updated_at = ?
        WHERE category = ?
      `,
      ).run(nextCategory.name, Date.now(), currentCategory.name);
    }
  });

  updateDatabase();

  // Invalidate cache because categories changed
  invalidateCategoriesCache();

  return nextCategory;
};

const deleteCategory = (db, id) => {
  const result = db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  if (result.changes > 0) {
    // Invalidate cache because categories changed
    invalidateCategoriesCache();
  }
  return result.changes > 0;
};

export {
  countCategories,
  createCategory,
  deleteCategory,
  listCategories,
  replaceCategories,
  updateCategory,
};
