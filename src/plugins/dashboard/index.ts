import { registerPlugin } from '../../core/plugins/registry';
import { DashboardPage } from './DashboardPage';

export function dashboardPlugin() {
  registerPlugin({
    id: 'dashboard',
    title: 'Dashboard',
    requiresAccount: true,
    nav: { label: 'Dashboard', path: '/dashboard' },
    routes: [{ path: '/dashboard', element: DashboardPage }]
  });
}
