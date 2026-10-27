import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC_ROOT = join(ROOT, 'public');
const PORT = Number(process.env.PORT || 4173);
const AO3_ORIGIN = 'https://archiveofourown.org';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml'
};

export const decodeEntities = (value = '') => value
  .replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'")
  .replaceAll('&#x27;', "'")
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>')
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));

export const stripTags = (value = '') => decodeEntities(value)
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]*>/g, '')
  .replace(/[ \t]+/g, ' ')
  .replace(/\n\s+/g, '\n')
  .trim();

const absoluteAO3URL = (value = '') => new URL(decodeEntities(value), AO3_ORIGIN).toString();

export const extractWorks = (html, exactQuery) => {
  const chunks = html.split(/(?=<li\b[^>]*\bid="work_\d+")/i).slice(1);
  const needle = exactQuery.normalize('NFC').toLocaleLowerCase();
  const works = [];

  for (const chunk of chunks) {
    const heading = chunk.match(/<h4\b[^>]*class="[^"]*heading[^"]*"[^>]*>([\s\S]*?)<\/h4>/i)?.[1] || '';
    const titleLink = [...heading.matchAll(/<a\b[^>]*href="([^"]*\/works\/\d+[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)][0];
    if (!titleLink) continue;

    const title = stripTags(titleLink[2]);
    if (!title.normalize('NFC').toLocaleLowerCase().includes(needle)) continue;

    const authorLinks = [...heading.matchAll(/<a\b[^>]*rel="author"[^>]*>([\s\S]*?)<\/a>/gi)];
    const fandomBlock = chunk.match(/<h5\b[^>]*class="[^"]*fandoms[^"]*"[^>]*>([\s\S]*?)<\/h5>/i)?.[1] || '';
    const fandoms = [...fandomBlock.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map((match) => stripTags(match[1]));
    const summary = stripTags(chunk.match(/<blockquote\b[^>]*class="[^"]*summary[^"]*"[^>]*>([\s\S]*?)<\/blockquote>/i)?.[1] || '');
    const words = stripTags(chunk.match(/<dd\b[^>]*class="[^"]*words[^"]*"[^>]*>([\s\S]*?)<\/dd>/i)?.[1] || '');
    const language = stripTags(chunk.match(/<dd\b[^>]*class="[^"]*language[^"]*"[^>]*>([\s\S]*?)<\/dd>/i)?.[1] || '');

    works.push({
      title,
      url: absoluteAO3URL(titleLink[1]),
      authors: authorLinks.map((match) => stripTags(match[1])),
      fandoms,
      summary,
      words,
      language
    });
  }

  return works;
};

const sendJSON = (response, status, value) => {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(value));
};

const handleSearch = async (requestURL, response) => {
  const query = (requestURL.searchParams.get('q') || '').trim();
  const page = Math.max(1, Math.min(100, Number(requestURL.searchParams.get('page') || 1)));
  if (!query) return sendJSON(response, 400, { error: '请输入要搜索的完整标题文字。' });
  if (query.length > 200) return sendJSON(response, 400, { error: '搜索文字不能超过 200 个字符。' });

  const ao3URL = new URL('/works/search', AO3_ORIGIN);
  ao3URL.searchParams.set('work_search[title]', `"${query}"`);
  ao3URL.searchParams.set('page', String(page));

  try {
    const upstream = await fetch(ao3URL, {
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': 'AO3ExactTitleSearch/1.0 (local personal search tool)'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000)
    });
    if (!upstream.ok) throw new Error(`AO3 returned ${upstream.status}`);
    const html = await upstream.text();
    const works = extractWorks(html, query);
    sendJSON(response, 200, { query, page, works, source: ao3URL.toString() });
  } catch (error) {
    sendJSON(response, 502, {
      error: '暂时无法读取 AO3。可能是网络、AO3 限流或服务不可用，请稍后再试。',
      detail: error.message
    });
  }
};

const serveStatic = async (pathname, response) => {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const safePath = normalize(requested).replace(/^(\.\.(\/|\\|$))+/, '');
  const filePath = join(PUBLIC_ROOT, safePath);
  if (!filePath.startsWith(PUBLIC_ROOT)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const body = await readFile(filePath);
    response.writeHead(200, { 'content-type': MIME_TYPES[extname(filePath)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
};

const server = http.createServer(async (request, response) => {
  const requestURL = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  if (requestURL.pathname === '/api/search') return handleSearch(requestURL, response);
  return serveStatic(requestURL.pathname, response);
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`AO3 Exact Title Search: http://127.0.0.1:${PORT}`);
  });
}
