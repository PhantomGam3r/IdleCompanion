import type { ParsedAccount } from '../parse/types';
import type { ComponentType } from 'react';

export type PluginNav = {
  label: string;
  path: string;
};

export type PluginRoute = {
  path: string;
  element: ComponentType;
};

export type Plugin = {
  id: string;
  title: string;
  nav?: PluginNav;
  routes: PluginRoute[];
  requiresAccount?: boolean;
};

export type AdvicePlugin = {
  id: string;
  world: string;
  title: string;
  evaluate: (account: ParsedAccount) => import('../parse/types').AdviceGroup | null;
};

const plugins: Plugin[] = [];
const advicePlugins: AdvicePlugin[] = [];

export function registerPlugin(plugin: Plugin): void {
  const index = plugins.findIndex((existing) => existing.id === plugin.id);
  if (index >= 0) {
    plugins[index] = plugin;
    return;
  }
  plugins.push(plugin);
}

export function registerAdvice(plugin: AdvicePlugin): void {
  const index = advicePlugins.findIndex((existing) => existing.id === plugin.id);
  if (index >= 0) {
    advicePlugins[index] = plugin;
    return;
  }
  advicePlugins.push(plugin);
}

export function getPlugins(): Plugin[] {
  return plugins;
}

export function getAdvicePlugins(): AdvicePlugin[] {
  return advicePlugins;
}

export function resetPluginsForTests(): void {
  plugins.length = 0;
  advicePlugins.length = 0;
}
