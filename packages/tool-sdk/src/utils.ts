import type { ToolMetadata, ToolConfig } from './types';

export function defineTool(config: ToolConfig): ToolConfig {
  return config;
}

export function createToolMetadata(
  metadata: Omit<ToolMetadata, 'version'> & { version?: string }
): ToolMetadata {
  return {
    version: '1.0.0',
    ...metadata,
  };
}

export function validateToolMetadata(
  metadata: unknown
): metadata is ToolMetadata {
  if (typeof metadata !== 'object' || metadata === null) {
    return false;
  }

  const m = metadata as Record<string, unknown>;

  return (
    typeof m.id === 'string' &&
    typeof m.name === 'string' &&
    typeof m.description === 'string' &&
    typeof m.version === 'string' &&
    Array.isArray(m.tags) &&
    typeof m.category === 'string'
  );
}

export function formatToolName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function generateToolId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
