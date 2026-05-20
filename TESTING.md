# Testing Guide

## Overview

This document describes the testing setup and guidelines for FinanceTracker.

## Test Stack

- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: Vitest built-in mocking
- **Environment**: jsdom

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --run --coverage

# Run specific test file
npm test -- src/__tests__/components/ui/Button.test.tsx

# Run tests matching a pattern
npm test -- --run --grep "Button"
```

## Test Structure

Tests are organized by type and location:

```
src/__tests__/
├── components/          # Component tests
│   ├── ui/             # UI component tests
│   │   ├── Button.test.tsx
│   │   └── Input.test.tsx
│   └── ...
├── utils/              # Utility function tests
│   └── dateUtils.test.ts
├── hooks/              # Custom hook tests
├── contexts/           # Context tests
└── integration/        # Integration tests
```

## Writing Tests

### Component Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../../components/ui/Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Utility Tests

```typescript
import { describe, it, expect } from 'vitest';
import { formatDateKey } from '../../utils/dateUtils';

describe('formatDateKey', () => {
  it('formats date as YYYY-MM-DD', () => {
    const date = new Date(2024, 5, 15);
    expect(formatDateKey(date)).toBe('2024-06-15');
  });
});
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Use Testing Library Queries**: Prefer `getByRole`, `getByText`, etc.
3. **Keep Tests Independent**: Each test should be isolated and not depend on others
4. **Mock External Dependencies**: Mock API calls, Firebase, etc.
5. **Test Edge Cases**: Include error states, empty states, and boundary conditions
6. **Use Descriptive Test Names**: Test names should describe the expected behavior

## Coverage Goals

Aim for:
- **80%** overall code coverage
- **90%** coverage for critical business logic
- **100%** coverage for utility functions

## CI/CD Integration

Tests run automatically on:
- Every push to `main` and `develop` branches
- Every pull request

See `.github/workflows/ci.yml` for configuration.

## Future Improvements

- [ ] Add E2E tests with Playwright
- [ ] Add visual regression tests
- [ ] Increase test coverage for complex components
- [ ] Add integration tests for API endpoints
- [ ] Implement snapshot testing for UI components
