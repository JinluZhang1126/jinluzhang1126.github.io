// 只根据公开视频 ID 构造平台播放器，不接受任意 iframe 地址或鉴权参数。
const VideoEmbeds = (() => {
  function source(value) {
    let url;
    try { url = new URL(value); } catch { return null; }
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    if (/token|secret|auth|key|signature|unsubscribe/i.test(url.search)) return null;
    if (/\.mp4$/i.test(url.pathname)) return {url: url.href, key: url.href, kind: 'video'};
    const host = url.hostname.toLowerCase();
    let id;
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(host)) {
      id = host === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.match(/^\/(?:live|shorts|embed)\/([^/]+)/)?.[1];
      if (/^[\w-]{11}$/.test(id || '')) return {url: `https://www.youtube-nocookie.com/embed/${id}?autoplay=0`, key: `youtube:${id}`};
    }
    if (['bilibili.com', 'www.bilibili.com', 'm.bilibili.com'].includes(host)) {
      id = url.pathname.match(/^\/video\/(BV[0-9A-Za-z]{10})(?:\/|$)/)?.[1];
      if (id) return {url: `https://player.bilibili.com/player.html?bvid=${id}&autoplay=0`, key: `bilibili:${id}`};
    }
    return null;
  }

  function mount(container, videos = []) {
    const seen = new Set();
    const candidates = [...videos, ...Array.from(container.querySelectorAll('a[href]'), a => ({url: a.href, title: a.textContent, anchor: a}))];
    for (const video of candidates) {
      const parsed = source(video.url);
      if (!parsed || seen.has(parsed.key)) continue;
      seen.add(parsed.key);
      const figure = document.createElement('figure');
      figure.className = 'video-embed';
      const frame = document.createElement(parsed.kind === 'video' ? 'video' : 'iframe');
      frame.src = parsed.url;
      frame.title = video.title || '公开视频';
      if (parsed.kind === 'video') {
        frame.controls = true;
        frame.preload = 'none';
        frame.playsInline = true;
      } else {
        frame.loading = 'lazy';
        frame.allow = 'encrypted-media; fullscreen; picture-in-picture';
        frame.allowFullscreen = true;
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
      }
      const caption = document.createElement('figcaption');
      const link = document.createElement('a');
      link.textContent = `${video.title || '视频'} · 原站观看 ↗`;
      link.href = video.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      caption.append(link, document.createTextNode(' · 若无法播放，请在原站打开。'));
      figure.append(frame, caption);
      let anchor = video.anchor;
      if (video.anchor_url) anchor = Array.from(container.querySelectorAll('a[href]')).find(a => a.getAttribute('href') === video.anchor_url);
      const cell = anchor?.closest('td');
      if (cell) cell.append(figure);
      else if (anchor) (anchor.closest('p') || anchor).after(figure);
      else container.append(figure);
    }
  }
  return {source, mount};
})();
if (typeof module !== 'undefined') module.exports = VideoEmbeds;
