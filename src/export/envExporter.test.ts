import { exportEnvMap, formatExportReport } from './envExporter';
import { EnvMap } from '../parser/types';

function makeMap(entries: Record<string, string>): EnvMap {
  return new Map(Object.entries(entries));
}

describe('exportEnvMap', () => {
  const map = makeMap({ DB_HOST: 'localhost', APP_NAME: 'my app', PORT: '3000' });

  it('exports as dotenv format', () => {
    const result = exportEnvMap(map, { format: 'dotenv' });
    expect(result.format).toBe('dotenv');
    expect(result.content).toContain('DB_HOST=localhost');
    expect(result.content).toContain('APP_NAME="my app"');
    expect(result.keyCount).toBe(3);
  });

  it('exports as json format', () => {
    const result = exportEnvMap(map, { format: 'json' });
    const parsed = JSON.parse(result.content);
    expect(parsed.DB_HOST).toBe('localhost');
    expect(parsed.PORT).toBe('3000');
  });

  it('exports as yaml format', () => {
    const result = exportEnvMap(map, { format: 'yaml' });
    expect(result.content).toContain('DB_HOST: localhost');
    expect(result.content).toContain('APP_NAME: "my app"');
  });

  it('exports as shell format', () => {
    const result = exportEnvMap(map, { format: 'shell' });
    expect(result.content).toContain('export DB_HOST="localhost"');
    expect(result.content).toContain('export PORT="3000"');
  });

  it('sorts keys when sortKeys is true', () => {
    const result = exportEnvMap(map, { format: 'dotenv', sortKeys: true });
    const lines = result.content.split('\n').filter(l => l && !l.startsWith('#'));
    const keys = lines.map(l => l.split('=')[0]);
    expect(keys).toEqual([...keys].sort());
  });

  it('includes header when provided', () => {
    const result = exportEnvMap(map, { format: 'dotenv', header: 'Auto-generated' });
    expect(result.content).toContain('# Auto-generated');
  });

  it('returns exportedAt timestamp', () => {
    const result = exportEnvMap(map, { format: 'json' });
    expect(new Date(result.exportedAt).getTime()).not.toBeNaN();
  });
});

describe('formatExportReport', () => {
  it('formats a readable export report', () => {
    const result = exportEnvMap(makeMap({ A: '1' }), { format: 'shell' });
    const report = formatExportReport(result);
    expect(report).toContain('Export Report');
    expect(report).toContain('shell');
    expect(report).toContain('1');
  });
});
