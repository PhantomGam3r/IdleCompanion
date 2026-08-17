import { describe, expect, it } from 'vitest';
import { fromFirestoreFields } from './firestore';

describe('Firestore REST decoder', () => {
  it('flattens typed fields into a plain save object', () => {
    const data = fromFirestoreFields({
      TimeAway: { stringValue: '{"GlobalTime":123}' },
      StampLv: {
        arrayValue: {
          values: [
            {
              arrayValue: {
                values: [{ integerValue: '10' }, { integerValue: '3' }]
              }
            }
          ]
        }
      }
    });
    expect(data.TimeAway).toBe('{"GlobalTime":123}');
    expect(data.StampLv).toEqual([[10, 3]]);
  });
});
