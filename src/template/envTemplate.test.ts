import { createTemplate, validateAgainstTemplate, formatTemplateReport } from './envTemplate';
import { EnvMap } from '../parser/types';

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [k, v] of Object.entries(entries)) {
    map.set(k, { value: v });
  }
  return map;
}

describe('createTemplate', () => {
  it('creates a template with all keys marked required', () => {
    const map = makeMap({ HOST: 'localhost', PORT: '3000' });
    const template = createTemplate(map);
    expect(template.fields['HOST'].required).toBe(true);
    expect(template.fields['PORT'].required).toBe(true);
    expect(template.fields['HOST'].example).toBe('localhost');
  });

  it('applies field overrides', () => {
    const map = makeMap({ HOST: 'localhost' });
    const template = createTemplate(map, { HOST: { required: false, defaultValue: '127.0.0.1' } });
    expect(template.fields['HOST'].required).toBe(false);
    expect(template.fields['HOST'].defaultValue).toBe('127.0.0.1');
  });
});

describe('validateAgainstTemplate', () => {
  it('passes when all required keys are present', () => {
    const map = makeMap({ HOST: 'localhost', PORT: '3000' });
    const template = createTemplate(map);
    const result = validateAgainstTemplate(map, template);
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it('reports missing required keys', () => {
    const templateMap = makeMap({ HOST: 'localhost', PORT: '3000', SECRET: 'abc' });
    const template = createTemplate(templateMap);
    const incompleteMap = makeMap({ HOST: 'localhost' });
    const result = validateAgainstTemplate(incompleteMap, template);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('PORT');
    expect(result.missing).toContain('SECRET');
  });

  it('applies defaults for optional missing keys', () => {
    const templateMap = makeMap({ HOST: 'localhost', PORT: '3000' });
    const template = createTemplate(templateMap, { PORT: { required: false, defaultValue: '8080' } });
    const map = makeMap({ HOST: 'localhost' });
    const result = validateAgainstTemplate(map, template);
    expect(result.valid).toBe(true);
    expect(result.defaultsApplied['PORT']).toBe('8080');
    expect(result.resolved.get('PORT')?.value).toBe('8080');
  });
});

describe('formatTemplateReport', () => {
  it('shows PASSED for valid result', () => {
    const result = { valid: true, missing: [], defaultsApplied: {}, resolved: new Map() };
    expect(formatTemplateReport(result)).toContain('PASSED');
  });

  it('shows FAILED and missing keys', () => {
    const result = { valid: false, missing: ['SECRET'], defaultsApplied: {}, resolved: new Map() };
    const report = formatTemplateReport(result);
    expect(report).toContain('FAILED');
    expect(report).toContain('SECRET');
  });
});
