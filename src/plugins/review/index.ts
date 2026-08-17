import { registerAdvice, registerPlugin } from '../../core/plugins/registry';
import { ReviewPage } from './ReviewPage';
import { generalAdvice } from './groups/general';
import { stampsAdvice } from './groups/stamps';
import { alchemyAdvice } from './groups/alchemy';
import { bubblesAdvice } from './groups/bubbles';

export function reviewPlugin() {
  registerAdvice(generalAdvice);
  registerAdvice(stampsAdvice);
  registerAdvice(alchemyAdvice);
  registerAdvice(bubblesAdvice);
  registerPlugin({
    id: 'review',
    title: 'AutoReview',
    requiresAccount: true,
    nav: { label: 'AutoReview', path: '/review' },
    routes: [{ path: '/review', element: ReviewPage }]
  });
}
