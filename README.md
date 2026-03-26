# Dev Tools Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7.0-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/pnpm-9.0-F69220?logo=pnpm&logoColor=white" alt="pnpm" />
</p>

<p align="center">
  <a href="https://github.com/AbhishekChamp/dev-tools/actions/workflows/ci.yml">
    <img src="https://github.com/AbhishekChamp/dev-tools/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <a href="https://github.com/AbhishekChamp/dev-tools/actions/workflows/build.yml">
    <img src="https://github.com/AbhishekChamp/dev-tools/actions/workflows/build.yml/badge.svg" alt="Build" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT" />
  </a>
</p>

<p align="center">
  A modern, micro-frontend developer tools platform built with React, TypeScript, and Vite.
  <br />
  Features 5 integrated utilities with a shared design system and seamless navigation.
</p>

---

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Developer Tools

| Tool                   | Description                                                | Category  |
| ---------------------- | ---------------------------------------------------------- | --------- |
| **JSON Formatter**     | Validate, format, and minify JSON with syntax highlighting | Formatter |
| **Regex Tester**       | Test and debug regular expressions with real-time matching | Tester    |
| **JWT Decoder**        | Decode and inspect JWT tokens (header, payload, signature) | Encoder   |
| **Base64 Tool**        | Encode and decode Base64 strings with URL-safe support     | Encoder   |
| **Password Generator** | Generate secure passwords with customizable options        | Generator |

### Platform Features

- 🔍 **Global Search** — Quick navigation with `Cmd/Ctrl + K`
- ⭐ **Favorites** — Bookmark frequently used tools with persistence
- 🕒 **Recent Tools** — Quick access to your last 5 used tools
- 🌓 **Dark Mode** — System-aware theme with manual override
- 📱 **Responsive** — Optimized for mobile, tablet, and desktop
- 🧪 **Well Tested** — 100+ unit and integration tests
- ⚡ **Fast** — Sub-2-second tool load times

---

## Demo

<p align="center">
  <em>Live demo coming soon</em>
</p>

---

## Architecture

This project follows a **micro-frontend architecture** where each tool is a standalone Vite application that can run in two modes:

### Embedded Mode

Tools run inside the shell application with shared navigation, breadcrumbs, and consistent styling.

### Standalone Mode

Tools run independently for focused development and testing.

```
dev-tools-platform/
├── apps/
│   ├── shell/                 # Host application (port 3000)
│   ├── json-formatter/        # JSON formatting tool (port 3001)
│   ├── regex-tester/          # Regex testing tool (port 3002)
│   ├── jwt-decoder/           # JWT decoding tool (port 3003)
│   ├── base64-tool/           # Base64 encode/decode tool (port 3004)
│   └── password-generator/    # Password generation tool (port 3005)
├── packages/
│   ├── ui/                    # Shared UI components
│   ├── tool-sdk/              # Tool development SDK
│   └── utils/                 # Shared utilities
└── .github/workflows/         # CI/CD pipelines
```

---

## Tech Stack

- **Framework**: [React 19.2](https://react.dev/) with [TypeScript 5.7](https://www.typescriptlang.org/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4.1](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)
- **Package Manager**: [pnpm](https://pnpm.io/) workspaces
- **CI/CD**: GitHub Actions

> **Note:** This project is currently being upgraded to the latest versions. See [TASKLIST.md](./TASKLIST.md) for upgrade progress.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20.19+ or 22.12+ (required for Vite 7)
- [pnpm](https://pnpm.io/installation) 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/AbhishekChamp/dev-tools.git
cd dev-tools/dev-tools-platform

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The development server will start:

- Shell: http://localhost:3000
- JSON Formatter: http://localhost:3001
- Regex Tester: http://localhost:3002
- JWT Decoder: http://localhost:3003
- Base64 Tool: http://localhost:3004
- Password Generator: http://localhost:3005

---

## Development

### Available Scripts

#### Development

```bash
pnpm dev              # Start shell + all tools in parallel
pnpm dev:all          # Start all packages in parallel
pnpm dev:shell        # Start only the shell app
pnpm dev:kill         # Kill all dev servers (ports 3000-3005)
```

#### Building

```bash
pnpm build            # Build all applications
pnpm build:all        # Build all packages and apps
pnpm build:shell      # Build only the shell
pnpm build:tools      # Build all tool apps (except shell)
```

#### Testing

```bash
pnpm test             # Run all tests in watch mode
pnpm test:all         # Run all tests once (CI mode)
pnpm test:coverage    # Run tests with coverage report
pnpm test:shell       # Run shell app tests
pnpm test:tool-sdk    # Run tool-sdk package tests
pnpm test:ui          # Run ui package tests
pnpm test:utils       # Run utils package tests
```

#### Code Quality

```bash
pnpm lint             # Lint all files
pnpm lint:all         # Lint all packages
pnpm lint:fix         # Fix linting issues in root
pnpm lint:fix:all     # Fix linting issues in all packages
pnpm typecheck        # Run TypeScript checks
pnpm typecheck:all    # Run TypeScript checks in all packages
pnpm format           # Format all files with Prettier
pnpm format:check     # Check formatting without fixing
pnpm ci               # Run full CI pipeline (lint + typecheck + test)
```

#### Maintenance

```bash
pnpm clean            # Clean all build artifacts and node_modules
pnpm clean:all        # Same as `pnpm clean`
```

### Workspace Commands

Run commands in specific packages:

```bash
# Run tests for a specific tool
pnpm --filter json-formatter test

# Build specific package
pnpm --filter @dev-tools/ui build

# Add dependency to a package
pnpm --filter shell add react-router-dom
```

### Adding a New Tool

1. Create a new app in `apps/your-tool/`
2. Follow the existing tool structure
3. Update `apps/shell/src/utils/tools.tsx` to register the tool
4. See `packages/tool-sdk/README.md` for detailed guidelines

---

## Testing

The project uses **Vitest** for unit and integration testing with **React Testing Library** for component tests.

```bash
# Run all tests
pnpm test:all

# Run with coverage
pnpm test:coverage

# Run specific package tests
pnpm test:shell
pnpm test:tool-sdk
```

### Test Coverage

| Package   | Coverage                        |
| --------- | ------------------------------- |
| Shell App | Components, stores, utilities   |
| tool-sdk  | Environment detection, hooks    |
| ui        | Component variants, states      |
| utils     | Validation, formatting, storage |

---

## CI/CD

GitHub Actions workflows are configured for automated testing, building, and deployment:

| Workflow    | Trigger      | Description                  |
| ----------- | ------------ | ---------------------------- |
| **CI**      | PR / Push    | Lint, typecheck, and test    |
| **Build**   | PR / Push    | Verify production builds     |
| **Deploy**  | Push to main | Automated deployments        |
| **Release** | Tag push     | Version bumping and releases |

### Workflow Features

- **pnpm caching** for faster builds
- **Matrix builds** for individual tools
- **Artifact upload** for build verification
- **Automatic changelog** generation
- **Coverage reporting** support

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes
4. **Run** tests: `pnpm ci`
5. **Commit** with conventional commits
6. **Push** and create a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all CI checks pass

### Pre-commit Hooks

Husky hooks run automatically on commit:

- TypeScript type checking
- ESLint validation
- Unit tests
- Console.log detection

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/AbhishekChamp">AbhishekChamp</a>
</p>
