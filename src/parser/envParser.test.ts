import { parseEnvContent } from './envParser';

describe('parseEnvContent', () => {
  it('parses simple key=value pairs', () => {
    const content = 'FOO=bar\nBAZ=qux';
    const result = parseEnvContent(content, 'test.env');
    expect(result.errors).toHaveLength(0);
    expect(result.entries).toHaveLength(2);
    expect(result.entries[0]).toMatchObject({ key: 'FOO', value: 'bar', source: 'test.env' });
    expect(result.entries[1]).toMatchObject({ key: 'BAZ', value: 'qux' });
  });

  it('ignores comments and blank lines', () => {
    const content = '# comment\n\nFOO=bar';
    const result = parseEnvContent(content, 'test.env');
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].key).toBe('FOO');
  });

  it('strips surrounding quotes from values', () => {
    const content = 'FOO="hello world"\nBAR=\'single\'';
    const result = parseEnvContent(content, 'test.env');
    expect(result.entries[0].value).toBe('hello world');
    expect(result.entries[1].value).toBe('single');
  });

  it('records an error for lines missing "="', () => {
    const content = 'INVALID_LINE';
    const result = parseEnvContent(content, 'test.env');
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('missing');
  });

  it('records an error for lines with empty keys', () => {
    const content = '=value';
    const result = parseEnvContent(content, 'test.env');
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Empty key');
  });

  it('tracks correct line numbers', () => {
    const content = '# skip\nFOO=bar';
    const result = parseEnvContent(content, 'test.env');
    expect(result.entries[0].lineNumber).toBe(2);
  });

  it('handles values containing "=" characters', () => {
    const content = 'FOO=bar=baz\nURL=https://example.com?a=1&b=2';
    const result = parseEnvContent(content, 'test.env');
    expect(result.errors).toHaveLength(0);
    expect(result.entries[0].value).toBe('bar=baz');
    expect(result.entries[1].value).toBe('https://example.com?a=1&b=2');
  });
});
