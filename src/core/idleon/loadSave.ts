import { getFirestoreDocument } from './firestore';
import { getRtdbValue } from './rtdb';

export type GuildBundle = {
  id: string | null;
  members: unknown[];
  points?: number;
  stats?: unknown;
};

export type RawSaveBundle = {
  data: Record<string, unknown>;
  charNames: string[];
  companion: unknown;
  guildData: GuildBundle;
  serverVars: Record<string, unknown> | null;
  lastUpdated: number;
  source: 'cloud' | 'json';
};

function asCharNames(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((name) => String(name)).filter(Boolean);
  }
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).map((name) => String(name)).filter(Boolean);
  }
  return [];
}

export async function loadCloudSave(uid: string, idToken: string): Promise<RawSaveBundle> {
  const [charNamesRaw, cloudsave, companion, guildId, serverVars] = await Promise.all([
    getRtdbValue<unknown>(`_uid/${uid}`, idToken),
    getFirestoreDocument('_data', uid, idToken),
    getRtdbValue<unknown>(`_comp/${uid}`, idToken),
    getRtdbValue<string>(`_usgu/${uid}/g`, idToken),
    getFirestoreDocument('_vars', '_vars', idToken)
  ]);

  const charNames = asCharNames(charNamesRaw);
  if (!cloudsave) {
    throw new Error('No cloudsave found for this account.');
  }
  if (charNames.length === 0) {
    throw new Error('No characters found for this account.');
  }

  let guild: Record<string, unknown> | null = null;
  if (guildId) {
    guild = (await getRtdbValue<Record<string, unknown>>(`_guild/${guildId}`, idToken)) ?? null;
  }

  const members = guild && typeof guild.m === 'object' && guild.m
    ? Object.values(guild.m as Record<string, unknown>)
    : [];

  return {
    data: cloudsave,
    charNames,
    companion,
    guildData: {
      id: guildId ?? null,
      members,
      points: typeof guild?.p === 'number' ? guild.p : undefined,
      stats: cloudsave.Guild
    },
    serverVars,
    lastUpdated: Date.now(),
    source: 'cloud'
  };
}

export function fromImportedJson(input: unknown): RawSaveBundle {
  if (!input || typeof input !== 'object') {
    throw new Error('Submitted data is not valid JSON.');
  }
  const root = input as Record<string, unknown>;

  if ('data' in root && root.data && typeof root.data === 'object') {
    const data = root.data as Record<string, unknown>;
    const charNames = asCharNames(root.charNames ?? data.charNames ?? data.playerNames ?? data.PlayerNames);
    return {
      data,
      charNames,
      companion: root.companion ?? data.companion ?? null,
      guildData: (root.guildData as GuildBundle) ?? { id: null, members: [] },
      serverVars: (root.serverVars as Record<string, unknown>) ?? null,
      lastUpdated: Date.now(),
      source: 'json'
    };
  }

  if (!('OptLacc' in root) && !Object.keys(root).some((key) => /^Lv0_\d+$/.test(key))) {
    throw new Error('This does not look like Idleon save data. Paste Toolbox JSON or raw game JSON.');
  }

  return {
    data: root,
    charNames: asCharNames(root.charNames ?? root.playerNames ?? root.PlayerNames),
    companion: root.companion ?? null,
    guildData: { id: null, members: [] },
    serverVars: (root.serverVars as Record<string, unknown>) ?? null,
    lastUpdated: Date.now(),
    source: 'json'
  };
}
