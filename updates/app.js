const categories = {
  'daily-research': {title: 'Daily Research', kicker: '01 / DAILY RESEARCH', description: '论文、研究趋势与可执行的科研行动。', empty: '每日科研记录将在这里归档。'},
  'weekly-research': {title: 'Weekly Research', kicker: '02 / WEEKLY RESEARCH', description: '回顾一周科研工作，记录成果、问题与下一步。', empty: '尚未收录可公开的每周科研工作记录。'},
  'daily-ai': {title: 'Daily AI', kicker: '03 / DAILY AI', description: '每日 AI 新闻、模型发布与开源动态。', empty: '尚未收录独立的每日 AI 新闻简报。'},
  'weekly-ai': {title: 'Weekly AI', kicker: '04 / WEEKLY AI', description: '从一周的 AI 进展中，梳理值得持续关注的方向。', empty: '每周 AI 新闻与趋势将在这里归档。'}
};
const $ = id => document.getElementById(id);
let entries = [];
let category = 'daily-research';
let opened = '';
let loadError = false;
const text = (tag, value, className = '') => {
  const node = document.createElement(tag);
  node.textContent = value;
  node.className = className;
  return node;
};

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

function render() {
  const config = categories[category];
  $('section-title').textContent = config.title;
  $('section-kicker').textContent = config.kicker;
  $('section-description').textContent = config.description;
  document.title = `${config.title} — Updates`;
  for (const link of document.querySelectorAll('[data-category]')) {
    if (link.dataset.category === category) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
    link.querySelector('.nav-count').textContent = String(entries.filter(e => e.category === link.dataset.category).length).padStart(2, '0');
  }
  const collection = entries.filter(e => e.category === category);
  const selectedDate = $('date').value;
  $('date').replaceChildren(new Option('全部日期', ''));
  for (const date of [...new Set(collection.map(e => e.date))]) $('date').append(new Option(date, date));
  $('date').value = collection.some(e => e.date === selectedDate) ? selectedDate : '';
  const keywords = $('search').value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const filtered = collection.filter(e => (!$('date').value || e.date === $('date').value) && keywords.every(word => e.searchText.includes(word)));
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
    const button = text('button', '阅读全文 ↗', 'read-button');
    button.type = 'button';
    const body = text('div', '', 'article-body');
    body.id = `${entry.id}-body`;
    body.hidden = opened !== entry.id;
    button.setAttribute('aria-controls', body.id);
    const updateButton = () => {
      button.textContent = body.hidden ? '阅读全文 ↗' : '收起全文 ↑';
      button.setAttribute('aria-expanded', String(!body.hidden));
    };
    button.addEventListener('click', () => {
      body.hidden = !body.hidden;
      if (!body.hidden && !body.childNodes.length) body.append(articleFragment(entry.html));
      updateButton();
    });
    if (!body.hidden) body.append(articleFragment(entry.html));
    updateButton();
    const permalink = text('a', '本期链接', 'permalink');
    permalink.href = `#${category}/${entry.id}`;
    actions.append(button, permalink);
    content.append(meta, text('h3', entry.title), text('p', entry.summary, 'summary'), topics, actions, body);
    card.append(stamp, content);
    $('entries').append(card);
  }
}

$('filters').addEventListener('submit', event => event.preventDefault());
$('search').addEventListener('input', render);
$('date').addEventListener('change', render);
$('filters').addEventListener('reset', () => { $('search').value = ''; $('date').value = ''; render(); });
window.addEventListener('hashchange', () => {
  if (!Object.hasOwn(categories, location.hash.slice(1).split('/')[0])) return;
  readLocation();
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
