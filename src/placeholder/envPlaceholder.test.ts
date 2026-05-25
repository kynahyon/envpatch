import { fillPlaceholders, formatPlaceholderReport, formatPlaceholderReportText } from './envPlaceholder';
import { EnvMap } from '../parser/types';

function makeMap(obj: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(obj)) {
    map.set(key, { value, comment: undefined });
  }
  return map;
}

describe('fillPlaceholders', () => {
  it('replaces placeholders with source values', () => {
    const template = makeMap({ GREETING: 'Hello, {{NAME}}!' });
    const source = makeMap({ NAME: 'World' });
    const result = fillPlaceholders(template, source);
    expect(result.filled.get('GREETING')).toBe('Hello, World!');
    expect(result.missing).toHaveLength(0);
    expect(result.extra).toHaveLength(0);
  });

  it('tracks missing placeholders', () => {
    const template = makeMap({ URL: 'https://{{HOST}}:{{PORT}}' });
    const source = makeMap({ HOST: 'localhost' });
    const result = fillPlaceholders(template, source);
    expect(result.filled.get('URL')).toBe('https://localhost:{{PORT}}');
    expect(result.missing).toContain('PORT');
  });

  it('tracks extra source keys not used in template', () => {
    const template = makeMap({ MSG: 'hi' });
    const source = makeMap({ UNUSED: 'value' });
    const result = fillPlaceholders(template, source);
    expect(result.extra).toContain('UNUSED');
  });

  it('handles multiple placeholders in one value', () => {
    const template = makeMap({ DSN: '{{SCHEME}}://{{USER}}@{{HOST}}' });
    const source = makeMap({ SCHEME: 'postgres', USER: 'admin', HOST: 'db' });
    const result = fillPlaceholders(template, source);
    expect(result.filled.get('DSN')).toBe('postgres://admin@db');
    expect(result.missing).toHaveLength(0);
  });

  it('handles values with no placeholders', () => {
    const template = makeMap({ STATIC: 'no-placeholder' });
    const source = makeMap({});
    const result = fillPlaceholders(template, source);
    expect(result.filled.get('STATIC')).toBe('no-placeholder');
  });
});

describe('formatPlaceholderReport', () => {
  it('produces correct counts', () => {
    const template = makeMap({ A: '{{X}}', B: '{{Y}}', C: 'static' });
    const source = makeMap({ X: '1' });
    const result = fillPlaceholders(template, source);
    const report = formatPlaceholderReport(result);
    expect(report.missing).toBe(1);
    expect(report.missingKeys).toContain('Y');
  });
});

describe('formatPlaceholderReportText', () => {
  it('returns a non-empty string', () => {
    const template = makeMap({ A: '{{B}}' });
    const source = makeMap({});
    const result = fillPlaceholders(template, source);
    const report = formatPlaceholderReport(result);
    const text = formatPlaceholderReportText(report);
    expect(typeof text).toBe('string');
    expect(text).toContain('Missing keys: B');
  });
});
