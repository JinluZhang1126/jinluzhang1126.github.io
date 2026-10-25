// 只在本浏览器 IndexedDB 保存不可导出的 CryptoKey，永不持久化明文密码或正文。
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const database = 'updates-browser-unlock-v1';
  const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel(database) : null;
  let lastStorageError = false;
  function savedKey(action, value) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(database, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('keys');
      request.onerror = () => reject(new Error('Storage unavailable'));
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('keys', action === 'get' ? 'readonly' : 'readwrite');
        const store = tx.objectStore('keys');
        const op = action === 'get' ? store.get('current') : action === 'put' ? store.put(value, 'current') : store.delete('current');
        tx.oncomplete = () => { db.close(); resolve(op.result); };
        tx.onerror = tx.onabort = () => { db.close(); reject(new Error('Storage unavailable')); };
      };
    });
  }
  async function logout() {
    try { await savedKey('delete'); } catch { /* 浏览器未提供持久化时，刷新仍会清除内存中的正文。 */ }
    channel?.postMessage('logout');
    location.reload();
  }
  if (channel) channel.onmessage = event => { if (event.data === 'logout') location.reload(); };
  $('logout').addEventListener('click', logout);
  function unlocked() {
    document.body.classList.remove('locked');
    $('unlock-screen').hidden = true;
    $('logout').hidden = false;
    $('storage-note').hidden = !lastStorageError;
  }
  async function load() {
    let envelope;
    try {
      if (!crypto.subtle) throw new Error('Secure context required');
      const response = await fetch('./data.json', {cache: 'no-store'});
      if (!response.ok) throw new Error('Archive unavailable');
      envelope = await response.json();
      ArchiveCrypto.validate(envelope);
    } catch {
      $('unlock-status').textContent = '加密内容暂时不可用，请稍后刷新重试。';
      $('unlock-submit').disabled = true;
      throw new Error('Encrypted archive unavailable');
    }
    const keyId = `${envelope.format}:${envelope.salt}:${envelope.iterations}`;
    try {
      const saved = await savedKey('get');
      if (saved && saved.keyId === keyId) {
        try {
          const data = await ArchiveCrypto.decrypt(envelope, saved.key);
          unlocked();
          return data;
        } catch { await savedKey('delete'); }
      }
    } catch { lastStorageError = true; }
    $('unlock-status').textContent = '首次访问请输入密码，此浏览器将记住登录状态。';
    $('unlock-submit').disabled = false;
    $('site-password').focus();
    return new Promise(resolve => {
      $('unlock-form').addEventListener('submit', async event => {
        event.preventDefault();
        const password = $('site-password').value;
        if (!password) return;
        $('unlock-submit').disabled = true;
        $('unlock-status').textContent = '正在解锁…';
        try {
          const key = await ArchiveCrypto.deriveKey(password, envelope.salt);
          const data = await ArchiveCrypto.decrypt(envelope, key);
          try { await savedKey('put', {keyId, key}); } catch { lastStorageError = true; }
          $('site-password').value = '';
          unlocked();
          resolve(data);
        } catch {
          $('site-password').value = '';
          $('unlock-status').textContent = '密码不正确或加密内容校验失败，请重新输入。';
          $('site-password').focus();
        } finally { $('unlock-submit').disabled = false; }
      });
    });
  }
  window.ArchiveAccess = {load, logout};
})();
