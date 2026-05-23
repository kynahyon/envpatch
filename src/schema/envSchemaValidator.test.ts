import { EnvMap } from '../parser/types';
import { EnvSchema } from './types';
import { validateEnvSchema, formatSchemaReport } from './envSchemaValidator';

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { key, value, comment: undefined, quoted: false });
  }
  return map;
}

const schema: EnvSchema = {
  fields: {
    PORT: { type: 'number', required: true },
    DEBUG: { type: 'boolean', required: false, default: 'false' },
    API_URL: { type: 'url', required: true },
    ADMIN_EMAIL: { type: 'email', required: false },
    APP_NAME: { type: 'string', required: true },
  },
};

describe('validateEnvSchema', () => {
  it('passes with all valid fields', () => {
    const map = makeMap({
      PORT: '3000',
      DEBUG: 'true',
      API_URL: 'https://api.example.com',
      ADMIN_EMAIL: 'admin@example.com',
      APP_NAME: 'myapp',
    });
    const result = validateEnvSchema(map, schema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.missing).toHaveLength(0);
  });

  it('reports missing required fields', () => {
    const map = makeMap({ APP_NAME: 'myapp' });
    const result = validateEnvSchema(map, schema);
    expect(result.missing).toContain('PORT');
    expect(result.missing).toContain('API_URL');
    expect(result.valid).toBe(false);
  });

  it('reports type errors', () => {
    const map = makeMap({
      PORT: 'not-a-number',
      API_URL: 'not-a-url',
      APP_NAME: 'myapp',
    });
    const result = validateEnvSchema(map, schema);
    expect(result.errors.map(e => e.key)).toContain('PORT');
    expect(result.errors.map(e => e.key)).toContain('API_URL');
  });

  it('reports extra keys not in schema', () => {
    const map = makeMap({
      PORT: '8080',
      API_URL: 'https://x.com',
      APP_NAME: 'app',
      UNKNOWN_KEY: 'foo',
    });
    const result = validateEnvSchema(map, schema);
    expect(result.extra).toContain('UNKNOWN_KEY');
  });

  it('does not flag optional fields with defaults as missing', () => {
    const map = makeMap({ PORT: '3000', API_URL: 'https://x.com', APP_NAME: 'app' });
    const result = validateEnvSchema(map, schema);
    expect(result.missing).not.toContain('DEBUG');
  });
});

describe('formatSchemaReport', () => {
  it('returns passed message on success', () => {
    const report = formatSchemaReport({ valid: true, errors: [], missing: [], extra: [] });
    expect(report).toContain('passed');
  });

  it('includes error and missing details on failure', () => {
    const report = formatSchemaReport({
      valid: false,
      errors: [{ key: 'PORT', message: "Expected type 'number'" }],
      missing: ['API_URL'],
      extra: ['ROGUE'],
    });
    expect(report).toContain('PORT');
    expect(report).toContain('API_URL');
    expect(report).toContain('ROGUE');
  });
});
