import { registerPlugin } from '../../core/plugins/registry';
import { ImportPage } from './ImportPage';

export function importJsonPlugin() {
  registerPlugin({
    id: 'import-json',
    title: 'Import JSON',
    nav: { label: 'Import JSON', path: '/import' },
    routes: [{ path: '/import', element: ImportPage }]
  });
}
