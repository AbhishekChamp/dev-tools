# Micro-Frontend Strategy

## Module Federation

We use @originjs/vite-plugin-federation for module federation.

## Shared Dependencies

React, ReactDOM, and Framer Motion are shared across all micro-frontends.

## Communication

Tools communicate via:

- URL routing
- Shared state (Zustand stores)
- Props passed to tool components
