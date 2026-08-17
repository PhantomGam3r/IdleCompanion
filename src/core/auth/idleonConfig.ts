/**
 * Legends of Idleon (LavaFlame2) Firebase / Google OAuth client values.
 *
 * These are the game's public web client credentials, already published by
 * community tools such as Idleon Toolbox. IdleCompanion does not own the
 * `idlemmo` Firebase project and cannot add GitHub Pages to its authorized
 * domains — that is why Google login uses OAuth device flow, then Identity
 * Toolkit REST with requestUri pinned to the game's auth domain.
 *
 * Not affiliated with Lava / Legends of Idleon.
 */
export const IDLEON_GOOGLE_OAUTH = {
  clientId: '267901585099-u6fjd75v6k9gefq7bcokcndv99riir5j.apps.googleusercontent.com',
  // Device-flow client id as used by the game / Idleon Toolbox (no .apps suffix in the form body).
  deviceClientId: '267901585099-u6fjd75v6k9gefq7bcokcndv99riir5j',
  clientSecret: 'HzoZF-UKUNfFwBuz4vafwsaR',
  scope: 'email profile',
  deviceCodeUrl: 'https://oauth2.googleapis.com/device/code',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  deviceVerificationUrl: 'https://www.google.com/device',
  deviceGrantType: 'urn:ietf:params:oauth:grant-type:device_code'
} as const;

export const IDLEON_FIREBASE = {
  apiKey: 'AIzaSyAU62kOE6xhSrFqoXQPv6_WHxYilmoUxDk',
  authDomain: 'idlemmo.firebaseapp.com',
  databaseURL: 'https://idlemmo.firebaseio.com',
  storageBucket: 'idlemmo.appspot.com',
  projectId: 'idlemmo'
} as const;

/** Must stay the game's auth domain so GitHub Pages is not rejected as unauthorized. */
export const IDENTITY_TOOLKIT_REQUEST_URI = `https://${IDLEON_FIREBASE.authDomain}`;

export const IDENTITY_TOOLKIT_SIGN_IN_IDP = (apiKey: string) =>
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${apiKey}`;

export const IDENTITY_TOOLKIT_PASSWORD = (apiKey: string) =>
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

export const SECURE_TOKEN_URL = (apiKey: string) =>
  `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;

export const FIRESTORE_DOC_URL = (collection: string, documentId: string) =>
  `https://firestore.googleapis.com/v1/projects/${IDLEON_FIREBASE.projectId}/databases/(default)/documents/${collection}/${documentId}`;

export const RTDB_URL = (path: string) => {
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  return `${IDLEON_FIREBASE.databaseURL}/${trimmed}.json`;
};

export const SESSION_STORAGE_KEY = 'idlecompanion.session';
export const TOKEN_EXPIRY_SKEW_MS = 5 * 60 * 1000;
