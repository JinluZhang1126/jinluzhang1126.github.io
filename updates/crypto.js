// 浏览器与构建端共用协议；所有加解密调用平台原生 Web Crypto。
(function (root) {
  'use strict';
  const format = 'updates-encrypted-v1';
  const iterations = 600000;
  const encoder = new TextEncoder();
  const from64 = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));
  const to64 = bytes => {
    let result = '';
    for (let i = 0; i < bytes.length; i += 8192) result += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return btoa(result);
  };
  function validate(envelope) {
    if (!envelope || envelope.format !== format || envelope.kdf !== 'PBKDF2-SHA256' || envelope.iterations !== iterations || envelope.entries || envelope.talks) throw new Error('Invalid encrypted archive');
    if (from64(envelope.salt).length !== 16 || from64(envelope.iv).length !== 12 || from64(envelope.ciphertext).length < 16) throw new Error('Invalid encrypted archive');
  }
  async function deriveKey(password, salt, usages = ['decrypt']) {
    const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({name: 'PBKDF2', salt: from64(salt), iterations, hash: 'SHA-256'}, material, {name: 'AES-GCM', length: 256}, false, usages);
  }
  async function encrypt(data, password, salt) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt, ['encrypt']);
    const ciphertext = await crypto.subtle.encrypt({name: 'AES-GCM', iv, additionalData: encoder.encode(format), tagLength: 128}, key, encoder.encode(JSON.stringify(data)));
    return {format, kdf: 'PBKDF2-SHA256', iterations, salt, iv: to64(iv), ciphertext: to64(new Uint8Array(ciphertext))};
  }
  async function decrypt(envelope, key) {
    validate(envelope);
    const plaintext = await crypto.subtle.decrypt({name: 'AES-GCM', iv: from64(envelope.iv), additionalData: encoder.encode(format), tagLength: 128}, key, from64(envelope.ciphertext));
    const data = JSON.parse(new TextDecoder().decode(plaintext));
    if (!Array.isArray(data.entries) || !data.talks || !Array.isArray(data.talks.items)) throw new Error('Invalid archive data');
    return data;
  }
  const api = {format, iterations, deriveKey, encrypt, decrypt, validate};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ArchiveCrypto = api;
})(globalThis);
