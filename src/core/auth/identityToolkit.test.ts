import { describe, expect, it } from 'vitest';
import { buildSignInWithIdpBody } from './identityToolkit';
import { IDENTITY_TOOLKIT_REQUEST_URI } from './idleonConfig';

describe('Identity Toolkit Google exchange', () => {
  it('pins requestUri to the game auth domain so GitHub Pages is not unauthorized', () => {
    const body = buildSignInWithIdpBody('google-id-token-value');
    expect(body.requestUri).toBe('https://idlemmo.firebaseapp.com');
    expect(body.requestUri).toBe(IDENTITY_TOOLKIT_REQUEST_URI);
    expect(body.postBody).toBe('id_token=google-id-token-value&providerId=google.com');
    expect(body.returnSecureToken).toBe(true);
    expect(body.returnIdpCredential).toBe(true);
  });
});
