import { Injectable } from '@angular/core';

export interface EncryptedPayload {
  c: string; // base64 ciphertext
  iv: string; // base64 iv
  t?: string; // optional base64 tag (for future use)
}

@Injectable({ providedIn: 'root' })
export class CryptoService {
  private keyPromise: Promise<CryptoKey> | null = null;

  private async getKey(): Promise<CryptoKey> {
    if (this.keyPromise) return this.keyPromise;

    const existingRawKeyB64 = localStorage.getItem('enc_raw_key');
    if (existingRawKeyB64) {
      const rawKey = this.base64ToBytes(existingRawKeyB64);
      this.keyPromise = crypto.subtle.importKey(
        'raw',
        rawKey,
        'AES-GCM',
        true,
        ['encrypt', 'decrypt']
      );
      return this.keyPromise;
    }

    const raw = crypto.getRandomValues(new Uint8Array(32));
    const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', true, ['encrypt', 'decrypt']);
    try { localStorage.setItem('enc_raw_key', this.bytesToBase64(raw)); } catch {}
    this.keyPromise = Promise.resolve(key);
    return key;
  }

  isEncryptedPayload(value: unknown): value is EncryptedPayload {
    return !!value && typeof value === 'object' && 'c' in (value as any) && 'iv' in (value as any);
  }

  async encryptString(plainText: string): Promise<EncryptedPayload> {
    const key = await this.getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plainText);
    const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
    return {
      c: this.bytesToBase64(new Uint8Array(cipherBuf)),
      iv: this.bytesToBase64(iv)
    };
  }

  async decryptToString(payload: EncryptedPayload | string): Promise<string> {
    if (!this.isEncryptedPayload(payload)) {
      return String(payload ?? '');
    }
    try {
      const key = await this.getKey();
      const iv = this.base64ToBytes(payload.iv);
      const cipher = this.base64ToBytes(payload.c);
      const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
      return new TextDecoder().decode(new Uint8Array(plainBuf));
    } catch {
      // Fallback to raw string if decryption fails
      return typeof payload === 'string' ? payload : '';
    }
  }

  private bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  private base64ToBytes(b64: string): Uint8Array {
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
}


