# Contributing to NutriScanVN

First off, thank you for considering contributing to NutriScanVN! It's people like you that make NutriScanVN such a great tool.

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🚀 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples**
* **Describe the behavior you observed and what you expected**
* **Include screenshots if possible**
* **Include your environment details** (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested enhancement**
* **Explain why this enhancement would be useful**
* **List some examples of how it would be used**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible
* Follow the TypeScript/JavaScript styleguides
* Include thoughtfully-worded, well-structured tests
* Document new code
* End all files with a newline

## 💻 Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Git
- Expo CLI

### Setup Steps

1. Fork the repository
2. Clone your fork
   ```bash
   git clone https://github.com/YOUR_USERNAME/nutriscanvn.git
   cd nutriscanvn
   ```

3. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

4. Install mobile dependencies
   ```bash
   cd mobile
   npm install
   ```

5. Setup environment variables
   ```bash
   cp backend/.env.example backend/.env
   # Edit .env with your configuration
   ```

6. Setup database
   ```bash
   createdb nutriscanvn
   psql -d nutriscanvn -f database/schema.sql
   psql -d nutriscanvn -f database/seeds.sql
   ```

7. Start development servers
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Mobile
   cd mobile && npm start
   ```

## 📝 Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

Example:
```
Add food scanner animation

- Implement animated water glass component
- Add shimmer loading states
- Improve scan result UI

Fixes #123
```

### TypeScript Styleguide

* Use TypeScript for all new code
* Define interfaces for all data structures
* Use meaningful variable names
* Add JSDoc comments for functions
* Use arrow functions for callbacks
* Prefer const over let

Example:
```typescript
/**
 * Calculate BMI from weight and height
 * @param weight - Weight in kilograms
 * @param height - Height in centimeters
 * @returns BMI value rounded to 1 decimal
 */
export const calculateBMI = (weight: number, height: number): number => {
  const heightM = height / 100;
  return Math.round((weight / (heightM * heightM)) * 10) / 10;
};
```

### React/React Native Styleguide

* Use functional components with hooks
* Use TypeScript for props
* Destructure props
* Use meaningful component names
* Separate styles into StyleSheet
* Add PropTypes or TypeScript interfaces

Example:
```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
}) => {
  // Component logic
};
```

## 🧪 Testing

* Write tests for new features
* Ensure existing tests pass
* Aim for 80% code coverage
* Test edge cases

Run tests:
```bash
# Backend
cd backend && npm test

# Mobile
cd mobile && npm test
```

## 📦 Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the documentation
3. The PR will be merged once you have the sign-off of maintainers
4. Ensure all tests pass
5. Update CHANGELOG.md

## 🏷️ Issue Labels

* `bug` - Something isn't working
* `enhancement` - New feature or request
* `documentation` - Documentation improvements
* `good first issue` - Good for newcomers
* `help wanted` - Extra attention needed
* `priority: high` - High priority issue
* `priority: low` - Low priority issue

## 📞 Getting Help

* Create an issue
* Join our Discord server
* Email: dev@nutriscanvn.com

## 🎯 Areas Needing Contributions

### High Priority
- Unit tests for utilities
- Integration tests for API
- E2E tests for critical flows
- Accessibility improvements
- Performance optimizations

### Medium Priority
- Additional Vietnamese foods
- More recipe content
- UI/UX improvements
- Documentation improvements
- Translation support

### Low Priority
- Additional themes
- More animations
- Social features enhancements
- Advanced statistics

## 🌍 Translation

Help us translate NutriScanVN to more languages!

Currently supported:
- Vietnamese (Tiếng Việt) - 100%
- English - 80%

Want to contribute a new language? Contact us!

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Your contributions make NutriScanVN better for everyone. We appreciate your time and effort!

---

**Happy Coding! 🚀**
