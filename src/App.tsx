import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { getPlugins } from './core/plugins/registry';
import { dashboardPlugin } from './plugins/dashboard';
import { importJsonPlugin } from './plugins/import-json';
import { reviewPlugin } from './plugins/review';
import { AccountProvider, useAccount } from './ui/AccountProvider';
import { HomePage } from './ui/HomePage';
import { AppShell } from './ui/layout/AppShell';
import type { ComponentType } from 'react';

dashboardPlugin();
reviewPlugin();
importJsonPlugin();

function Guarded({ pluginId, Page }: { pluginId: string; Page: ComponentType }) {
  const plugin = getPlugins().find((item) => item.id === pluginId);
  const { account } = useAccount();
  if (plugin?.requiresAccount && !account) {
    return <Navigate to="/" replace />;
  }
  return <Page />;
}

export function App() {
  const pluginRoutes = getPlugins().flatMap((plugin) =>
    plugin.routes.map((route) => (
      <Route
        key={`${plugin.id}:${route.path}`}
        path={route.path}
        element={<Guarded pluginId={plugin.id} Page={route.element} />}
      />
    ))
  );

  return (
    <AccountProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            {pluginRoutes}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AccountProvider>
  );
}
