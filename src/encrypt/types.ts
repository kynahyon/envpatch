export interface EncryptOptions {
  algorithm?: 'aes-256-cbc' | 'aes-128-cbc';
  keyPattern?: RegExp;
  sensitiveKeys?: string[];
}

export interface EncryptedEntry {
  key: string;
  encrypted: boolean;
  originalLength?: number;
}

export interface EncryptResult {
  encryptedMap: Map<string, string>;
  entries: EncryptedEntry[];
  encryptedCount: number;
  skippedCount: number;
}

export interface DecryptResult {
  decryptedMap: Map<string, string>;
  decryptedCount: number;
  failedKeys: string[];
}
