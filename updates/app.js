const categories = {
  'talks': {title: 'Talk 精选', kicker: '05 / RESEARCH TALKS', description: '科研讲座与回放', empty: '暂无讲座'},
  'daily-research': {title: 'Daily Research', kicker: '01 / DAILY RESEARCH', description: '论文、研究趋势与可执行的科研行动。', empty: '每日科研记录将在这里归档。'},
  'weekly-research': {title: 'Weekly Research', kicker: '02 / WEEKLY RESEARCH', description: '回顾一周科研工作，记录成果、问题与下一步。', empty: '尚未收录可公开的每周科研工作记录。'},
  'daily-ai': {title: 'Daily AI', kicker: '03 / DAILY AI', description: '模型与产品、开源工具、机器人产业与基础设施的新变化。', empty: '尚未收录独立的每日 AI 新闻简报。'},
  'weekly-ai': {title: 'Weekly AI', kicker: '04 / WEEKLY AI', description: '回顾一周产品交付、产业动向与开放生态变化。', empty: '每周 AI 新闻与趋势将在这里归档。'}
};
const $ = id => document.getElementById(id);
let entries = [];
let talks = {items: [], sources: []};
let category = 'daily-research';
let opened = '';
let archivePage = 0;
let calendarMonth = '';
let calendarDate = '';
const workCount = entry => entry.html ? new DOMParser().parseFromString(entry.html, 'text/html').querySelectorAll('h3').length : 1;

const readerId = new URLSearchParams(location.search).get('entry');
let loadError = false;
const text = (tag, value, className = '') => {
  const node = document.createElement(tag);
  node.textContent = value;
  node.className = className;
  return node;
};

function publicLink(label, url) {
  const link = text('a', label);
  if (/^https?:\/\//i.test(url)) link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

// 先筛选，再按条目数量分页；日期间隔不会产生空页。
function archiveWindow(collection) {
  const sorted = [...collection].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
  const maxPage = Math.max(0, Math.ceil(sorted.length / 7) - 1);
  archivePage = Math.max(0, Math.min(archivePage, maxPage));
  return {items: sorted.slice(archivePage * 7, (archivePage + 1) * 7), maxPage, total: sorted.length};
}

function renderArchiveControls(collection, prefix, filtered = collection) {
  const page = archiveWindow(filtered);
  const pager = $(prefix + '-pager');
  pager.replaceChildren();
  const newer = text('button', '← 上一页');
  const older = text('button', '下一页 →');
  newer.disabled = archivePage === 0;
  older.disabled = archivePage === page.maxPage;
  for (const [button, delta] of [[newer, -1], [older, 1]]) button.addEventListener('click', () => {
    archivePage += delta;
    render();
  });
  pager.append(newer, text('span', `第 ${archivePage + 1} / ${page.maxPage + 1} 页 · 每页 7 项 · 共 ${page.total} 项`), older);
  if (!calendarMonth) calendarMonth = (page.items[0]?.date || collection[0]?.date || new Date().toISOString().slice(0, 10)).slice(0, 7);
  const calendar = $(prefix + '-calendar');
  calendar.replaceChildren();
  const header = text('div', '', 'calendar-header');
  const prev = text('button', '←'); prev.setAttribute('aria-label', '上个月');
  const next = text('button', '→'); next.setAttribute('aria-label', '下个月');
  for (const [button, delta] of [[prev, -1], [next, 1]]) button.addEventListener('click', () => {
    const d = new Date(calendarMonth + '-01T00:00:00Z'); d.setUTCMonth(d.getUTCMonth() + delta);
    calendarMonth = d.toISOString().slice(0, 7); render();
  });
  header.append(prev, text('strong', calendarMonth.replace('-', ' 年 ') + ' 月'), next);
  const grid = text('div', '', 'calendar-grid');
  for (const label of ['一','二','三','四','五','六','日']) grid.append(text('span', label, 'calendar-weekday'));
  const first = new Date(calendarMonth + '-01T00:00:00Z');
  for (let i = 0; i < (first.getUTCDay() + 6) % 7; i++) grid.append(text('span', '', 'calendar-blank'));
  const days = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const counts = new Map();
  for (const e of collection) counts.set(e.date, (counts.get(e.date) || 0) + workCount(e));
  for (let i = 1; i <= days; i++) {
    const date = `${calendarMonth}-${String(i).padStart(2, '0')}`;
    const count = counts.get(date) || 0;
    const hasRecord = collection.some(e => e.date === date);
    const level = count === 0 ? 0 : count <= 5 ? 1 : count <= 10 ? 2 : count <= 20 ? 3 : 4;
    const cell = text('button', '', `calendar-day heat-${level}`);
    cell.append(text('span', i), text('small', hasRecord ? `${count} 项` : '—'));
    cell.disabled = !hasRecord;
    cell.setAttribute('aria-label', `${date}，${count} 项${hasRecord ? '，查看记录' : '，无归档'}`);
    cell.setAttribute('aria-pressed', String(calendarDate === date));
    if (page.items.some(e => e.date === date)) cell.classList.add('in-window');
    cell.addEventListener('click', () => {
      calendarDate = calendarDate === date ? '' : date;
      $('date').value = calendarDate;
      archivePage = 0;
      render();
    });
    grid.append(cell);
  }
  const legend = text('div', '', 'calendar-legend');
  for (const [i,label] of ['0','1–5','6–10','11–20','21+'].entries()) {
    const item = text('span', label); item.prepend(text('i', '', `heat-${i}`)); legend.append(item);
  }
  const clear = text('button', calendarDate ? '清除日期筛选 ×' : '点击日期查看记录', 'calendar-clear');
  clear.disabled = !calendarDate;
  clear.addEventListener('click', () => { calendarDate = ''; $('date').value = ''; archivePage = 0; render(); });
  calendar.append(header, grid, legend, text('p', '数量为当前栏目收录条目数；周报按归档日计，同篇跨期可重复收录。', 'calendar-note'), clear);
  return page;
}

function renderTalks() {
  $('talk-note').textContent = talks.note || '暂无已核验的讲座。';
  $('talk-updated').textContent = talks.checked_at ? `最近核验 ${talks.checked_at}` : '';
  const filtered = talks.items.filter(talk => ($('talk-filter').value === 'all' || talk.status === $('talk-filter').value) && (!calendarDate || talk.date === calendarDate));
  const {items} = renderArchiveControls(talks.items, 'talk', filtered);
  $('talk-list').replaceChildren();
  for (const talk of items) {
    const card = text('article', '', 'talk-card');
    card.append(text('p', `${talk.status === 'replay' ? '往期回放' : '可报名'} · ${talk.platform}`, 'eyebrow'), text('h3', talk.title));
    const fields = text('dl', '', 'talk-fields');
    for (const [label, value] of [['时间', talk.time], ['主讲人 / 机构', `${talk.speaker} / ${talk.institution}`], ['主题', talk.topic], ['报名信息', talk.registration], ['截止日期', talk.deadline]]) {
      fields.append(text('dt', label), text('dd', value));
    }
    const actions = text('div', '', 'entry-actions');
    actions.append(publicLink(`${talk.link_label} ↗`, talk.url), publicLink('官方来源 ↗', talk.source_url));
    card.append(fields, text('p', `简介：${talk.introduction}`, 'talk-introduction'), text('p', `推荐原因：${talk.reason}`, 'talk-reason'), actions);
    VideoEmbeds.mount(card, talk.videos || []);
    $('talk-list').append(card);
  }
  if (!items.length) $('talk-list').append(text('p', '本次未确认符合条件的活动；不将往期回放作为可报名活动。', 'empty'));
  $('talk-sources').replaceChildren();
  for (const source of talks.sources) {
    const row = text('p', '');
    row.append(publicLink(source.name, source.url));
    $('talk-sources').append(row);
  }
}

// 内容只允许阅读所需的标签和公开 HTTP 链接，避免导入邮件中的脚本与样式。
function articleFragment(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const allowed = new Set('p h1 h2 h3 h4 strong b em i ul ol li br table thead tbody tr td th a blockquote hr'.split(' '));
  function clean(node) {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
    const fragment = document.createDocumentFragment();
    if (node.nodeType !== Node.ELEMENT_NODE) return fragment;
    if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'SVG'].includes(node.tagName)) return fragment;
    const name = node.tagName.toLowerCase();
    const target = allowed.has(name) ? document.createElement(name) : fragment;
    if (name === 'a') {
      const href = node.getAttribute('href') || '';
      if (/^https?:\/\//i.test(href)) {
        target.setAttribute('href', href);
        target.setAttribute('target', '_blank');
        target.setAttribute('rel', 'noopener noreferrer');
      }
    }
    for (const child of node.childNodes) target.append(clean(child));
    return target;
  }
  const fragment = document.createDocumentFragment();
  for (const child of doc.body.childNodes) fragment.append(clean(child));
  return fragment;
}

function readLocation() {
  const [key, id] = location.hash.slice(1).split('/');
  category = Object.hasOwn(categories, key) ? key : 'daily-research';
  opened = id || '';
}

function renderReader() {
  document.body.classList.add('reader');
  const entry = entries.find(item => item.id === readerId);
  const back = text('a', '← 返回归档', 'reader-back');
  back.href = entry ? `./#${entry.category}` : './';
  $('entries').replaceChildren(back);
  if (!entry) {
    $('entries').append(text('h2', loadError ? '归档加载失败，请刷新重试' : '未找到这期归档'));
    return;
  }
  document.title = `${entry.title} — Updates`;
  $('section-title').textContent = entry.title;
  const article = text('article', '', 'reader-article');
  const body = text('div', '', 'article-body');
  body.append(articleFragment(entry.html));
  VideoEmbeds.mount(body, entry.videos || []);
  article.append(text('p', `${categories[entry.category].title} · ${entry.date}`, 'eyebrow'), text('h2', entry.title, 'reader-title'), text('p', entry.period, 'entry-meta'), body);
  $('entries').append(article);
}

function render() {
  if (readerId) { renderReader(); return; }
  const config = categories[category];
  $('section-title').textContent = config.title;
  $('section-kicker').textContent = config.kicker;
  $('section-description').textContent = config.description;
  document.title = `${config.title} — Updates`;
  for (const link of document.querySelectorAll('[data-category]')) {
    if (link.dataset.category === category) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
    const count = link.dataset.category === 'talks' ? talks.items.length : entries.filter(e => e.category === link.dataset.category).length;
    link.querySelector('.nav-count').textContent = String(count).padStart(2, '0');
  }
  $('journal').hidden = category === 'talks';
  $('talks').hidden = category !== 'talks';
  $('ai-scope').hidden = !['daily-ai', 'weekly-ai'].includes(category);
  $('ai-window').textContent = category === 'weekly-ai' ? 'Weekly AI：过去 7 天的实质进展，比较趋势变化并给出未来一周行动。' : 'Daily AI：当天新增与实质更新，结合过去一周背景去重，避免每天重复周报。';
  if (category === 'talks') { renderTalks(); return; }
  const collection = entries.filter(e => e.category === category);
  const selectedDate = $('date').value;
  $('date').replaceChildren(new Option('全部日期', ''));
  for (const date of [...new Set(collection.map(e => e.date))]) $('date').append(new Option(date, date));
  $('date').value = collection.some(e => e.date === selectedDate) ? selectedDate : '';
  const keywords = $('search').value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = collection.filter(e => (!$('date').value || e.date === $('date').value) && keywords.every(word => e.searchText.includes(word)));
  const {items: filtered} = renderArchiveControls(collection, 'archive', matches);
  $('result-count').textContent = loadError ? '归档加载失败' : `共 ${collection.length} 期 · 当前显示 ${filtered.length} 期`;
  $('entries').replaceChildren();
  if (!filtered.length) {
    const empty = text('div', '', 'empty');
    empty.append(text('span', '✳', 'empty-icon'), text('h3', loadError ? '暂时无法载入' : collection.length ? '没有找到匹配内容' : '暂无归档'), text('p', loadError ? '请刷新页面重试。若仍失败，请检查 data.json 是否已发布。' : collection.length ? '试试其他关键词，或重置筛选条件。' : config.empty));
    $('entries').append(empty);
    return;
  }
  for (const entry of filtered) {
    const card = text('article', '', 'entry');
    card.id = entry.id;
    const stamp = text('div', '', 'date-stamp');
    stamp.append(text('span', entry.date.slice(8), 'day'), text('span', entry.date.slice(0, 7).replace('-', ' / '), 'month'));
    if (entry.id === collection[0].id) stamp.append(text('span', 'LATEST', 'tag'));
    const content = text('div', '', 'entry-content');
    const meta = text('div', '', 'entry-meta');
    const date = text('time', entry.date);
    date.dateTime = entry.date;
    meta.append(date, text('span', entry.source), text('span', entry.period));
    const topics = text('div', '', 'topics');
    for (const topic of entry.tags) topics.append(text('span', topic, 'topic'));
    const actions = text('div', '', 'entry-actions');
    const button = text('a', '阅读全文 ↗', 'read-button');
    button.href = `./?entry=${encodeURIComponent(entry.id)}`;
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
    button.setAttribute('aria-label', `阅读全文：${entry.title}（新标签页）`);
    const permalink = text('a', '本期链接', 'permalink');
    permalink.href = button.href;
    permalink.target = '_blank';
    permalink.rel = 'noopener noreferrer';
    actions.append(button, permalink);
    const headlines = text('ul', '', 'paper-headlines');
    const article = new DOMParser().parseFromString(entry.html, 'text/html');
    const allHeadlines = Array.from(article.querySelectorAll('h3'));
    for (const heading of allHeadlines.slice(0, 10)) {
      const item = text('li', heading.textContent);
      const links = Array.from(heading.querySelectorAll('a[href]'));
      for (let sibling = heading.nextElementSibling; sibling && !/^H[1-3]$/.test(sibling.tagName); sibling = sibling.nextElementSibling) {
        links.push(...sibling.querySelectorAll('a[href]'));
      }
      const video = (entry.videos || []).find(v => links.some(a => a.getAttribute('href') === v.anchor_url));
      if (video) {
        const link = publicLink('视频 ↗', video.url);
        link.className = 'headline-video';
        item.append(document.createTextNode(' '), link);
      }
      headlines.append(item);
    }
    content.append(meta, text('h3', entry.title));
    content.append(headlines.childNodes.length ? headlines : text('p', entry.summary, 'summary'));
    if (allHeadlines.length > 10) content.append(text('p', `摘要显示 10 / ${allHeadlines.length} 项，阅读全文查看全部。`, 'summary'));
    content.append(topics, actions);
    card.append(stamp, content);
    $('entries').append(card);
  }
}

$('filters').addEventListener('submit', event => event.preventDefault());
$('talk-filter').addEventListener('change', () => { archivePage = 0; calendarDate = ''; renderTalks(); });
$('search').addEventListener('input', () => { archivePage = 0; render(); });
$('date').addEventListener('change', () => {
  calendarDate = $('date').value;
  archivePage = 0;
  if (calendarDate) calendarMonth = calendarDate.slice(0, 7);
  render();
});
$('filters').addEventListener('reset', () => { $('search').value = ''; $('date').value = ''; calendarDate = ''; archivePage = 0; calendarMonth = ''; render(); });
window.addEventListener('hashchange', () => {
  if (!Object.hasOwn(categories, location.hash.slice(1).split('/')[0])) return;
  readLocation();
  archivePage = 0; calendarMonth = ''; calendarDate = '';
  $('search').value = '';
  $('date').value = '';
  render();
  if (opened) document.getElementById(opened)?.scrollIntoView({block: 'start'});
});

async function init() {
  try {
    const response = await fetch('./data.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    talks = data.talks || talks;
    entries = data.entries.map(entry => ({...entry, searchText: `${entry.title} ${entry.summary} ${entry.tags.join(' ')} ${new DOMParser().parseFromString(entry.html, 'text/html').body.textContent}`.toLocaleLowerCase()}));
    entries.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
    $('last-update').textContent = entries.length ? `最新收录 ${entries[0].date}` : '等待第一期更新';
  } catch (error) {
    console.error('晨报归档加载失败', error);
    loadError = true;
    $('last-update').textContent = '归档暂时不可用';
  }
  readLocation();
  render();

  if (opened) document.getElementById(opened)?.scrollIntoView({block: 'start'});
}
init();
