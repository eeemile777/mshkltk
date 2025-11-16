# Contributing to Mshkltk

Thank you for your interest in contributing to **Mshkltk**! This guide will help you get started.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Requirements](#testing-requirements)
6. [Commit Guidelines](#commit-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Security Guidelines](#security-guidelines)

---

## Code of Conduct

**Be respectful, inclusive, and collaborative.** We're building a civic tool to help communities—let's model good citizenship in our development process too.

- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community and project

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm 9+
- **PostgreSQL** 15+ (or use Docker setup)
- **Git** for version control
- **macOS/Linux** (Windows via WSL)

### Initial Setup

1. **Fork and Clone:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/mshkltk.git
   cd mshkltk
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

3. **Database Setup:**
   ```bash
   # Option 1: Docker (recommended)
   ./scripts/setup/setup-database-docker.sh
   
   # Option 2: Local PostgreSQL
   ./scripts/setup/setup-database.sh
   ```

4. **Environment Configuration:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and secrets
   ```

5. **Verify Setup:**
   ```bash
   npm run dev  # Should start frontend + backend
   # Visit http://localhost:3000
   ```

**Full instructions:** [Quick Start Guide](docs/getting-started/QUICKSTART.md)

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# OR
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code improvements
- `docs/` - Documentation changes
- `test/` - Test additions/fixes

### 2. Make Your Changes

**Before coding:**
- Read the [Development Guide](docs/development/DEVELOPMENT.md)
- Check [TODO.md](docs/project-management/TODO.md) for open tasks
- Review [Style Guide](docs/STYLE_GUIDE.md) for conventions

**While coding:**
- Write tests for new features
- Update documentation as needed
- Follow existing patterns and architecture
- Keep commits focused and atomic

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:citizen   # Citizen portal tests
npm run test:portal    # Municipality portal tests
npm run test:admin     # Super admin tests

# Interactive testing
npm run test:headed    # Visible browser
npm run test:ui        # Test UI mode
```

**All tests must pass before submitting PR.**

### 4. Commit Your Changes

See [Commit Guidelines](#commit-guidelines) below.

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then open a PR on GitHub. See [Pull Request Process](#pull-request-process) below.

---

## Coding Standards

### General Principles

1. **Clarity over cleverness** - Code should be readable and maintainable
2. **Consistent patterns** - Follow existing conventions in the codebase
3. **Type safety** - Use TypeScript types, avoid `any`
4. **Error handling** - Always handle errors gracefully
5. **Security first** - Never expose secrets, validate all inputs

### Frontend (React + TypeScript)

**File Structure:**
- Components in `src/components/` (shared) or `src/pages/` (route-specific)
- Use functional components with hooks
- Context API for state management (no Redux)

**Naming Conventions:**
- **Components:** PascalCase (`ReportCard.tsx`)
- **Hooks:** camelCase with `use` prefix (`useAuth.ts`)
- **Utils:** camelCase (`formatDate.ts`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`)

**TypeScript:**
- Define interfaces in `src/types.ts` or component files
- Use proper types, avoid `any`
- Frontend uses `camelCase` (backend uses `snake_case`)

**Example:**
```typescript
// Good
interface Report {
  id: string;
  title: string;
  createdAt: Date;
}

// Bad
const data: any = { ... };  // No 'any'!
```

### Backend (Node.js + Express)

**File Structure:**
- Routes in `server/routes/`
- Database queries in `server/db/queries/`
- Middleware in `server/middleware/`
- Utilities in `server/utils/`

**Naming Conventions:**
- **Files:** kebab-case (`auth-routes.js`, `user-queries.js`)
- **Variables:** snake_case (matches database columns)
- **Functions:** camelCase (`getUserById`, `validateToken`)

**Error Handling:**
```javascript
// Use custom error classes
const { NotFoundError, ValidationError } = require('../utils/errors');

// Wrap async functions
const asyncHandler = require('../utils/errors').asyncHandler;

router.get('/reports/:id', asyncHandler(async (req, res) => {
  const report = await getReportById(req.params.id);
  if (!report) throw new NotFoundError('Report not found');
  res.json(report);
}));
```

**Database Queries:**
- Use parameterized queries (prevent SQL injection)
- Use transactions for multi-step operations
- Export pool connection for external use

### Style Guidelines

**See full details in:** [Style Guide](docs/STYLE_GUIDE.md)

**Key Points:**
- **Indentation:** 2 spaces (no tabs)
- **Line length:** 100 characters max
- **Quotes:** Single quotes for JS, double for JSX attributes
- **Semicolons:** Use consistently
- **Comments:** Explain *why*, not *what*

---

## Testing Requirements

### Test Coverage Expectations

- **New features:** Must include E2E tests
- **Bug fixes:** Add regression test
- **API changes:** Update Swagger docs + tests
- **UI changes:** Screenshot tests (if available)

### Writing E2E Tests (Playwright)

**Location:** `tests/e2e/`

**Structure:**
```typescript
import { test, expect } from '@playwright/test';
import { login, navigateToReports } from './helpers';

test.describe('Report Submission', () => {
  test('should submit a new report successfully', async ({ page }) => {
    await login(page, 'citizen_user', 'password');
    await navigateToReports(page);
    
    // Test steps...
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

**Best Practices:**
- Use helper functions from `tests/e2e/helpers.ts`
- Clean up test data after each test
- Use descriptive test names
- Test both success and error cases

**Running Tests:**
```bash
npm test                  # All tests
npm run test:headed       # Watch browser
npm run test:ui           # Interactive mode
npm run test:report       # View last report
```

### Manual Testing Checklist

Before submitting PR, test:
- [ ] Feature works in both English and Arabic
- [ ] Offline functionality (disable network in DevTools)
- [ ] Mobile responsive design
- [ ] All three portals (Citizen, Municipality, Super Admin)
- [ ] Error states and edge cases

---

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code formatting (no logic change)
- `refactor` - Code restructure (no behavior change)
- `test` - Test additions/fixes
- `chore` - Build, dependencies, tooling

**Examples:**

```
feat(reports): add AI-powered categorization

Integrate Gemini 2.5-flash for automatic report category detection
based on description and uploaded media.

Closes #42
```

```
fix(auth): prevent JWT token expiration race condition

Add token refresh logic in api.ts to renew tokens 1 minute before
expiration, preventing logout during active sessions.
```

```
docs(api): update authentication endpoint examples

Add curl examples for login/register endpoints with proper headers
and response formats.
```

### Commit Best Practices

1. **One logical change per commit** - Don't mix refactoring with features
2. **Write descriptive messages** - Future you will thank present you
3. **Reference issues** - Use `Closes #123` or `Fixes #456`
4. **Sign your commits** - Use `git commit -s` (optional but encouraged)

---

## Pull Request Process

### Before Submitting

**Checklist:**
- [ ] All tests pass (`npm test`)
- [ ] Code follows style guidelines
- [ ] Documentation updated (if needed)
- [ ] No console.log or debug code left
- [ ] Environment variables documented in `.env.example`
- [ ] No secrets or API keys in code

### PR Title and Description

**Title Format:**
```
[Type] Brief description (under 60 chars)
```

**Examples:**
- `[Feature] Add report export to CSV`
- `[Fix] Resolve map marker clustering bug`
- `[Docs] Update API authentication guide`

**Description Template:**
```markdown
## Changes
- Brief bullet point summary of changes

## Motivation
Why is this change needed?

## Testing
How was this tested? (manual + automated)

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated checks** will run (tests, linting)
2. **Maintainer review** - May request changes
3. **Address feedback** - Make requested changes
4. **Approval + Merge** - Once approved, will be merged

**Tips for faster review:**
- Keep PRs focused and small
- Respond to feedback promptly
- Be open to suggestions

---

## Security Guidelines

### Secure Coding Practices

**DO:**
✅ Validate all user inputs (use `express-validator`)  
✅ Use parameterized queries (prevent SQL injection)  
✅ Store secrets in environment variables  
✅ Use JWT for authentication, hash passwords with bcrypt  
✅ Implement rate limiting on authentication endpoints  
✅ Sanitize logs (don't log passwords/tokens)  

**DON'T:**
❌ Hardcode API keys or secrets  
❌ Use `eval()` or dynamic code execution  
❌ Trust user input without validation  
❌ Log sensitive data (passwords, tokens)  
❌ Commit `.env` files to Git  

### Reporting Security Vulnerabilities

**DO NOT open public issues for security vulnerabilities.**

Instead:
1. Email the maintainers privately (check README for contact)
2. Provide detailed description and reproduction steps
3. Wait for acknowledgment before public disclosure

We follow **responsible disclosure** practices and will credit security researchers.

---

## Questions or Need Help?

- **Documentation:** Check [docs/](docs/) first
- **Development:** See [Development Guide](docs/development/DEVELOPMENT.md)
- **API Reference:** See [API Documentation](docs/api/README.md)
- **Quick Reference:** See [Quick Reference](docs/getting-started/QUICK_REFERENCE.md)
- **Issues:** Open a GitHub issue for questions

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see [LICENSE](LICENSE) file).

---

**Thank you for contributing to Mshkltk!** 🚀

Your work helps build better tools for civic engagement and community improvement.
