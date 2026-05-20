const { body, param, query, validationResult } = require('express-validator');

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

// Transaction validators
const transactionValidators = {
  create: [
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('category').notEmpty().trim().withMessage('Category is required'),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
    body('description').optional().trim().escape(),
    body('tags').optional().isArray(),
    handleValidationErrors
  ],
  update: [
    param('id').isInt().withMessage('Transaction ID must be an integer'),
    body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('category').optional().notEmpty().trim().withMessage('Category cannot be empty'),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
    body('description').optional().trim().escape(),
    body('tags').optional().isArray(),
    handleValidationErrors
  ],
  delete: [
    param('id').isInt().withMessage('Transaction ID must be an integer'),
    handleValidationErrors
  ]
};

// Category validators
const categoryValidators = {
  create: [
    body('name').notEmpty().trim().escape().withMessage('Category name is required'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color'),
    body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a non-negative number'),
    handleValidationErrors
  ],
  update: [
    param('id').isInt().withMessage('Category ID must be an integer'),
    body('name').optional().notEmpty().trim().escape().withMessage('Category name cannot be empty'),
    body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color'),
    body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a non-negative number'),
    handleValidationErrors
  ],
  delete: [
    param('id').isInt().withMessage('Category ID must be an integer'),
    handleValidationErrors
  ]
};

module.exports = {
  handleValidationErrors,
  transactionValidators,
  categoryValidators
};
