import { registerPlugin } from '../../core/plugins/registry';
import { CharactersPage } from './CharactersPage';

export function charactersPlugin() {
  registerPlugin({
    id: 'characters',
    title: 'Characters',
    requiresAccount: true,
    nav: { label: 'Characters', path: '/characters' },
    routes: [{ path: '/characters', element: CharactersPage }]
  });
}
