# Contributing to NurseryTrack

Thank you for your interest in contributing to NurseryTrack! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow
- Report unacceptable behavior to maintainers

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/your-username/NurseryTrack.git
cd NurseryTrack

# Add upstream remote
git remote add upstream https://github.com/Lumeo-sd/NurseryTrack.git
```

### 2. Create a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/bug-description
```

### 3. Set Up Development Environment

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Create .env files
cp .env.example .env
cp backend/.env.example backend/.env

# Configure for local development
# Update backend/.env with your local PostgreSQL settings

# Start Docker services (optional)
docker-compose up -d

# Run migrations
cd backend && npm run migrate && cd ..

# Start development servers
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm start
```

## Development Workflow

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Run migrations
npm run migrate

# Start development server
npm run dev

# Run tests (when available)
npm test

# Check for linting issues
npm run lint

# Fix linting issues
npm run lint:fix
```

### Frontend Development

```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# or with specific platform
npm run android    # Android
npm run ios        # iOS
npm run web        # Web

# Run tests (when available)
npm test
```

### Database Development

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U nurserytrack -d nurserytrack

# Run migrations
docker-compose exec api npm run migrate

# Reset database (caution!)
docker-compose down -v
docker-compose up -d
npm run migrate
```

## Making Changes

### Code Style

#### JavaScript/Node.js
- Use `const` by default, `let` when needed
- Use arrow functions `=>` where appropriate
- Use async/await for promises
- Add JSDoc comments for functions
- Use meaningful variable names
- Line length: 100 characters max
- Indentation: 2 spaces

Example:
```javascript
/**
 * Create a new batch
 * @param {Object} batchData - Batch information
 * @param {string} batchData.variety_id - Variety ID
 * @param {number} batchData.quantity - Number of plants
 * @returns {Promise<Object>} Created batch
 */
async function createBatch(batchData) {
  if (!batchData.variety_id) {
    throw new Error('variety_id is required');
  }

  const result = await pool.query(
    'INSERT INTO batches (variety_id, quantity) VALUES ($1, $2) RETURNING *',
    [batchData.variety_id, batchData.quantity]
  );

  return result.rows[0];
}
```

#### React/React Native
- Use functional components with hooks
- Use meaningful component names
- Extract repeated UI into components
- Use PropTypes or TypeScript
- Organize styles logically

Example:
```jsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';

/**
 * Display batch details
 * @param {Object} props
 * @param {string} props.batchId - ID of batch to display
 * @param {Function} props.onDelete - Callback when deleted
 */
export default function BatchDetail({ batchId, onDelete }) {
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBatch();
  }, [batchId]);

  const loadBatch = async () => {
    try {
      const response = await batchesAPI.getById(batchId);
      setBatch(response.data);
    } catch (error) {
      console.error('Error loading batch:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Text>Loading...</Text>;
  if (!batch) return <Text>Batch not found</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{batch.variety_name}</Text>
      <Text>Quantity: {batch.quantity}</Text>
      <Button onPress={onDelete}>Delete</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
});
```

### Commit Messages

Follow conventional commits format:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Build/dependency updates

Examples:
```
feat(batches): add batch filtering by status
fix(auth): prevent token expiration during long operations
docs(README): update installation instructions
refactor(api): simplify batch creation logic
```

### Pull Request Process

1. **Before Creating PR:**
   - Update your branch with latest upstream
   - Run tests/linting
   - Check your code works locally
   - Update documentation if needed

```bash
git fetch upstream
git rebase upstream/main
npm run lint:fix
npm test
```

2. **Create PR on GitHub:**
   - Use descriptive title
   - Fill out PR template completely
   - Reference related issues: `Closes #123`
   - Add appropriate labels

3. **PR Description Template:**

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #(issue number)

## Testing
Describe how to test these changes:
1. ...
2. ...

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No new warnings generated
- [ ] Change is backwards compatible
```

## Feature Implementation Guidelines

### Adding a New API Endpoint

1. **Create route handler** in `backend/src/routes/`
2. **Add database query** in route handler
3. **Add error handling** with proper HTTP status codes
4. **Add request validation** with express-validator
5. **Document endpoint** with comments
6. **Add client method** in `api/client.js`
7. **Add tests** if available

Example:
```javascript
// backend/src/routes/batches.js
router.post(
  '/',
  authMiddleware,
  [
    body('variety_id').isUUID(),
    body('quantity').isInt({ min: 1 }),
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Create batch
      const result = await pool.query(
        'INSERT INTO batches (variety_id, quantity) VALUES ($1, $2) RETURNING *',
        [req.body.variety_id, req.body.quantity]
      );

      // Log action
      await logAction(req.userId, 'CREATE', { batchId: result.rows[0].id });

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create batch error:', error);
      res.status(500).json({ error: 'Failed to create batch' });
    }
  }
);
```

### Adding a New Screen

1. **Create screen component** in `screens/`
2. **Add to navigation** in `navigation/AppNavigator.js`
3. **Use API client** for data fetching
4. **Handle loading/error states**
5. **Add navigation params** if needed
6. **Follow UI patterns** from existing screens

### Adding a Database Migration

1. **Create SQL migration** in logical order
2. **Test migration** locally
3. **Document schema changes** in comments
4. **Add rollback** if applicable

```javascript
// backend/src/db/migrate.js
const migrationSQL = `
-- Add new column with default value
ALTER TABLE batches
ADD COLUMN IF NOT EXISTS fertilizer_type VARCHAR(100) DEFAULT 'standard';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_batches_fertilizer_type 
ON batches(fertilizer_type);
`;
```

## Testing

### Unit Tests

When applicable, add unit tests:

```javascript
// Example test
describe('batchesAPI', () => {
  it('should create a batch', async () => {
    const batchData = {
      variety_id: 'test-id',
      quantity: 100,
    };

    const response = await batchesAPI.create(batchData);

    expect(response.data).toHaveProperty('id');
    expect(response.data.quantity).toBe(100);
  });
});
```

### Manual Testing

Before submitting PR, test:
- Normal happy path
- Edge cases (empty inputs, large numbers, etc.)
- Error scenarios
- Multiple user roles (if applicable)
- Mobile and web versions (if applicable)

## Documentation

### Code Comments

- Explain WHY, not WHAT
- Add JSDoc for functions
- Explain complex logic
- Mark TODO/FIXME items

```javascript
// Good: Explains reasoning
// We use pagination to prevent loading all batches at once
// which would cause memory issues with large datasets
const batches = await fetchBatches({ limit: 50, offset });

// Bad: Just repeats the code
// Fetch batches from database
const batches = await fetchBatches();
```

### Update Documentation

- Update README if behavior changes
- Update API docs for endpoint changes
- Update DEPLOYMENT.md for deployment changes
- Add CHANGELOG entries for significant changes

## Reporting Bugs

### Bug Report Template

```markdown
## Description
Brief description of the bug

## Steps to Reproduce
1. ...
2. ...
3. ...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: (Windows/Linux/macOS)
- Browser: (Chrome/Safari/etc)
- Node version: (run `node --version`)
- Docker version: (run `docker --version`)

## Screenshots
Add screenshots if applicable

## Logs
Add relevant error logs or console output
```

## Feature Requests

### Feature Request Template

```markdown
## Description
Clear description of the desired feature

## Use Case
Why is this feature needed?

## Example
How would users use this feature?

## Alternatives
Any alternative solutions?

## Additional Context
Any other relevant information
```

## Code Review Process

1. **Maintainers will review** your PR within a few days
2. **Address feedback** by pushing new commits
3. **Request re-review** after changes
4. **PR will be merged** once approved

## Getting Help

- Check existing [issues](https://github.com/your-username/NurseryTrack/issues)
- Read [documentation](./DEPLOYMENT.md)
- Ask in [discussions](https://github.com/your-username/NurseryTrack/discussions)
- Contact maintainers

## Additional Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Docker Docs](https://docs.docker.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to NurseryTrack! 🌱