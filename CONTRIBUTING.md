# Contributing to Quant Academy

Thank you for your interest in contributing to Quant Academy! This guide will help you get started.

## Ways to Contribute

- **Add or improve lessons** — fix typos, clarify explanations, add new sections, or write entirely new lessons
- **Add interview problems** — contribute new problems with hints and solutions
- **Improve simulations** — enhance the existing sandboxes or build new interactive tools
- **Fix bugs** — check the [issues](https://github.com/kushalsrinivas/quant-academy/issues) page for open bugs
- **Improve UI/UX** — accessibility improvements, animations, layout fixes
- **Add tests** — help improve reliability with unit and integration tests
- **Documentation** — improve the README, add inline docs, or write guides

## Getting Started

### 1. Fork and Clone

```bash
git clone https://github.com/<your-username>/quant-academy.git
cd quant-academy
npm install
```

### 2. Create a Branch

```bash
git checkout -b feat/your-feature-name
```

Use a descriptive branch name with a prefix:

- `feat/` — new feature or content
- `fix/` — bug fix
- `docs/` — documentation only
- `refactor/` — code restructuring without behavior change

### 3. Run the App

```bash
npx expo start
```

Test your changes on at least one platform (iOS Simulator, Android Emulator, or Expo Go).

### 4. Make Your Changes

#### Adding a New Lesson

1. Create a new file in `src/data/modules/` or add to an existing module file
2. Follow the existing lesson structure — each lesson needs an `id`, `moduleId`, `title`, `order`, `estimatedMinutes`, `xpReward`, and `sections` array
3. Section types: `text`, `math` (LaTeX), `code` (Python), `quiz` (multiple choice)
4. Register your lesson in `src/data/register.ts`
5. If adding a new module, also update `src/lib/content/modules.ts`

#### Adding Interview Problems

1. Add problems to `src/data/problems/registry.ts`
2. Follow the existing format with `id`, `title`, `category`, `difficulty`, `description`, `hints`, `solution`, and `xpReward`

#### Modifying the Backtest Engine

1. Engine code lives in `src/lib/engine/`
2. Indicator implementations are in `src/constants/indicators.ts` and `src/lib/engine/indicators.ts`
3. Test your changes with the strategy builder (Sandbox tab → Build Strategy)

### 5. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add lesson on Kelly criterion to probability module"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat:` — new feature or content
- `fix:` — bug fix
- `docs:` — documentation
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `style:` — formatting, whitespace (no code logic change)
- `chore:` — build process, dependency updates

### 6. Push and Open a Pull Request

```bash
git push origin feat/your-feature-name
```

Then open a pull request on GitHub. In the PR description:

- Describe what you changed and why
- Include screenshots or screen recordings for UI changes
- List the platforms you tested on (iOS / Android / Web)

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Make sure the app builds and runs without errors
- Update documentation if your change affects the public API or project structure
- Be responsive to review feedback

## Content Guidelines

When writing lessons or problems:

- **Accuracy matters** — double-check formulas, code examples, and financial concepts
- **Keep it accessible** — explain jargon, build complexity gradually, assume a smart but non-expert reader
- **Use LaTeX for math** — wrap formulas in the `math` section type
- **Code examples should be Python** — this is the industry standard for quant work
- **Include quiz questions** — add 1-2 quiz sections per lesson to reinforce concepts
- **Cite sources** — reference well-known textbooks or papers where appropriate

## Code Style

- TypeScript with strict mode
- Functional React components with hooks
- Use the project's existing theme constants (`src/constants/theme.ts`) for colors and spacing
- Follow the existing file and folder naming conventions

## Reporting Bugs

Open an [issue](https://github.com/kushalsrinivas/quant-academy/issues/new) with:

- A clear title describing the bug
- Steps to reproduce
- Expected vs actual behavior
- Platform and device info (iOS/Android, simulator/device, OS version)
- Screenshots if applicable

## Suggesting Features

Open an [issue](https://github.com/kushalsrinivas/quant-academy/issues/new) with:

- A clear description of the feature
- The problem it solves or the value it adds
- Any relevant examples or references

## License

By contributing, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).
