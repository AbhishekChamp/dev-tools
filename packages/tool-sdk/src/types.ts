import type { ComponentType } from 'react';

export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  icon?: string;
  tags: string[];
  category: ToolCategory;
}

export type ToolCategory =
  | 'formatter'
  | 'encoder'
  | 'generator'
  | 'tester'
  | 'converter'
  | 'other';

export interface ToolConfig {
  metadata: ToolMetadata;
  component: ComponentType;
}

export interface ToolRegistryEntry {
  name: string;
  route: string;
  remote: string;
  entry: string;
  metadata?: ToolMetadata;
}

export interface RemoteModule {
  default: ComponentType;
  metadata?: ToolMetadata;
}

export interface ToolMountOptions {
  container: HTMLElement;
  props?: Record<string, unknown>;
}
