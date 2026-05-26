import { lockEnvKeys, formatImmutableReport } from './envImmutable';
import { EnvMap } from '../parser/types';

function makeMap(obj: Record<string, string>): EnvMap {
  return new Map(Object.entries(obj));
}

describe('lockEnvKeys', () => {
  const base = makeMap({ DB_HOST: 'localhost', DB_PORT: '5432', APP_NAME: 'myapp' });

  it('preserves locked key values from base when incoming differs', () => {
    const incoming = makeMap({ DB_HOST: 'remotehost', DB_PORT: '5432', APP_NAME: 'newapp' });
    const { result, locked, blocked } = lockEnvKeys(base, incoming, { keys: ['DB_HOST'] });

    expect(result.get('DB_HOST')).toBe('localhost');
    expect(result.get('APP_NAME')).toBe('newapp');
    expect(locked).toHaveLength(1);
    expect(locked[0].key).toBe('DB_HOST');
    expect(blocked).toContain('DB_HOST');
  });

  it('does not block if locked key value is unchanged', () => {
    const incoming = makeMap({ DB_HOST: 'localhost', DB_PORT: '9999' });
    const { attempted, blocked } = lockEnvKeys(base, incoming, { keys: ['DB_HOST'] });

    expect(attempted).toHaveLength(0);
    expect(blocked).toHaveLength(0);
  });

  it('skips keys not present in base', () => {
    const incoming = makeMap({ UNKNOWN: 'value' });
    const { locked } = lockEnvKeys(base, incoming, { keys: ['UNKNOWN'] });

    expect(locked).toHaveLength(0);
  });

  it('throws in strict mode when locked key is mutated', () => {
    const incoming = makeMap({ DB_HOST: 'remotehost' });

    expect(() =>
      lockEnvKeys(base, incoming, { keys: ['DB_HOST'], strict: true })
    ).toThrow(/Immutable key "DB_HOST"/);
  });

  it('locks multiple keys and reports all blocked', () => {
    const incoming = makeMap({ DB_HOST: 'other', DB_PORT: '9999', APP_NAME: 'myapp' });
    const { locked, blocked } = lockEnvKeys(base, incoming, { keys: ['DB_HOST', 'DB_PORT', 'APP_NAME'] });

    expect(locked).toHaveLength(3);
    expect(blocked).toContain('DB_HOST');
    expect(blocked).toContain('DB_PORT');
    expect(blocked).not.toContain('APP_NAME');
  });
});

describe('formatImmutableReport', () => {
  it('formats a report with locked and blocked entries', () => {
    const base = makeMap({ KEY: 'original' });
    const incoming = makeMap({ KEY: 'changed' });
    const result = lockEnvKeys(base, incoming, { keys: ['KEY'] });
    const report = formatImmutableReport(result);

    expect(report).toContain('[Immutable Report]');
    expect(report).toContain('Locked keys');
    expect(report).toContain('KEY = original');
    expect(report).toContain('Blocked mutations');
  });

  it('omits blocked section when nothing was blocked', () => {
    const base = makeMap({ KEY: 'value' });
    const incoming = makeMap({ KEY: 'value' });
    const result = lockEnvKeys(base, incoming, { keys: ['KEY'] });
    const report = formatImmutableReport(result);

    expect(report).not.toContain('Blocked mutations');
  });
});
