import { lazy } from 'react';
import type { Tool, ToolRegistryEntry } from '@/types';
import {
  FileJson,
  Regex,
  KeyRound,
  ArrowLeftRight,
  Lock,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  FileJson,
  Regex,
  KeyRound,
  ArrowLeftRight,
  Lock,
};

export const builtInTools: Tool[] = [
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and beautify JSON data',
    icon: 'FileJson',
    route: '/json',
    category: 'formatter',
    tags: ['json', 'format', 'validate', 'beautify'],
    remote: 'jsonFormatterApp',
    component: lazy(() => import('jsonFormatterApp/Tool')),
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions',
    icon: 'Regex',
    route: '/regex',
    category: 'tester',
    tags: ['regex', 'test', 'pattern', 'match'],
    remote: 'regexTesterApp',
    component: lazy(() => import('regexTesterApp/Tool')),
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Decode and inspect JWT tokens',
    icon: 'KeyRound',
    route: '/jwt',
    category: 'encoder',
    tags: ['jwt', 'decode', 'token', 'auth'],
    remote: 'jwtDecoderApp',
    component: lazy(() => import('jwtDecoderApp/Tool')),
  },
  {
    id: 'base64-tool',
    name: 'Base64 Tool',
    description: 'Encode and decode Base64 strings',
    icon: 'ArrowLeftRight',
    route: '/base64',
    category: 'encoder',
    tags: ['base64', 'encode', 'decode', 'convert'],
    remote: 'base64ToolApp',
    component: lazy(() => import('base64ToolApp/Tool')),
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate secure random passwords',
    icon: 'Lock',
    route: '/password',
    category: 'generator',
    tags: ['password', 'generator', 'security', 'random'],
    remote: 'passwordGeneratorApp',
    component: lazy(() => import('passwordGeneratorApp/Tool')),
  },
];

export function getIconComponent(iconName: string): LucideIcon {
  return iconMap[iconName] || FileJson;
}

export function getToolByRoute(route: string): Tool | undefined {
  return builtInTools.find((tool) => tool.route === route);
}

export function getToolById(id: string): Tool | undefined {
  return builtInTools.find((tool) => tool.id === id);
}

export function filterTools(
  tools: Tool[],
  query: string,
  category?: string
): Tool[] {
  return tools.filter((tool) => {
    const matchesQuery =
      !query ||
      tool.name.toLowerCase().includes(query.toLowerCase()) ||
      tool.description.toLowerCase().includes(query.toLowerCase()) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));

    const matchesCategory =
      !category || category === 'all' || tool.category === category;

    return matchesQuery && matchesCategory;
  });
}

export async function loadRemoteTool(entry: string): Promise<Tool | null> {
  try {
    // @ts-expect-error - Module Federation runtime
    const module = await import(entry);
    if (module.default) {
      return {
        ...module.metadata,
        component: module.default,
      } as Tool;
    }
    return null;
  } catch (error) {
    console.error('Failed to load remote tool:', error);
    return null;
  }
}
