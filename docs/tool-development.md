# Tool Development Guide

## Creating a New Tool

1. Copy an existing tool template
2. Update package.json with new name and port
3. Update vite.config.ts with new federation name
4. Implement your tool in src/Tool.tsx
5. Export the Tool component as default

## Tool SDK

Use @dev-tools/tool-sdk for:
- Tool metadata
- State management hooks
- Error boundaries

