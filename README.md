# IdleCompanion

Live site: https://phantomgam3r.github.io/IdleCompanion/

Sign in with the **same Google account** you use in [Legends of Idleon](https://www.legendsofidleon.com). The app reads your cloudsave from Lava's `idlemmo` Firebase project and never stores that save on a server of its own.

Not affiliated with Lava / Legends of Idleon.

## Features

- **Google game login** via OAuth device flow (works on `*.github.io`)
- **Email / password** login with the same Idleon credentials
- **Live cloudsave** from Firestore `_data/{uid}` plus character names from Realtime DB
- **Dashboard** — characters, alerts, stamps, bubbles, bribes, statues, cards
- **Characters** — skill matrix across the roster
- **AutoReview** — Pinchy-style “do this first” plus General / W1–W7 groups (stamps, bribes, statues, forge, alchemy, bubbles, vials, later-world skills)
- **JSON import** for Toolbox / Efficiency / raw game saves
- **Plugin registry** so new pages and advice groups can be added without touching the shell

## Google login on GitHub Pages

Popup Google Sign-In cannot be used here: companion tools do not own the `idlemmo` Firebase project, so `phantomgam3r.github.io` cannot be added as an authorized domain.

IdleCompanion uses the same approach as Idleon Toolbox:

1. Request a Google **device code** with the game's public OAuth client.
2. You open [google.com/device](https://www.google.com/device), enter the code, and approve.
3. The app polls until Google returns an ID token.
4. That token is exchanged through Identity Toolkit REST with `requestUri` pinned to `https://idlemmo.firebaseapp.com` (this is what avoids `auth/unauthorized-domain` on GitHub Pages).
5. The Firebase ID token loads your cloudsave.

### How to verify after deploy

1. Open `https://phantomgam3r.github.io/IdleCompanion/`.
2. Click **Sign in with Google**.
3. Copy the code and approve it at google.com/device with your **Idleon** Google account.
4. You should land on the dashboard with your character names.
5. Open **AutoReview** and confirm advice groups render.
6. Reload the tab — the session should restore from `localStorage` without signing in again.

If login fails with "No characters found", the Google account is not the one linked to the Idleon save.

## GitHub Pages setup

This repository is configured for **project Pages**:

`https://<user>.github.io/IdleCompanion/`

1. Repo **Settings → Pages → Source: GitHub Actions**.
2. Free GitHub Pages only serves **public** repositories. Make the repo public, or use GitHub Pro for private Pages.
3. Push to `main` (or run the **Deploy to GitHub Pages** workflow).
4. The workflow runs tests, builds with `VITE_BASE_PATH=/IdleCompanion/`, copies `index.html` to `404.html` for SPA routing, and deploys.

Local production preview:

```bash
npm install
npm test
npm run build
npm run preview
```

Dev server (base path `/`):

```bash
npm run dev
```

## Extending

### New page / tool

Create a folder under `src/plugins/`, export a `registerPlugin({...})` call, and invoke it from `src/App.tsx`.

```ts
registerPlugin({
  id: 'my-tool',
  title: 'My tool',
  requiresAccount: true,
  nav: { label: 'My tool', path: '/my-tool' },
  routes: [{ path: '/my-tool', element: MyPage }]
});
```

### New AutoReview advice group

Add a file in `src/plugins/review/groups/` that exports an `AdvicePlugin` and register it in `src/plugins/review/index.ts`.

```ts
export const myAdvice: AdvicePlugin = {
  id: 'my-advice',
  world: 'World 3',
  title: 'Construction',
  evaluate(account) {
    return { id: 'my-advice', world: 'World 3', title: 'Construction', summary: '', items: [] };
  }
};
```

## Credits

- Save layout and Google device-flow login protocol: [Morta1/IdleonToolbox](https://github.com/Morta1/IdleonToolbox) (GPL-3.0)
- Advice style and progression ideas: [TwoSpookyBoos/IdleOnAutoReviewBot](https://github.com/TwoSpookyBoos/IdleOnAutoReviewBot)

IdleCompanion is original TypeScript; it does not vendor those repositories.

## License

[GPL-3.0-or-later](LICENSE)
