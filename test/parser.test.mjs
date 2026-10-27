import test from 'node:test';
import assert from 'node:assert/strict';
import { extractWorks } from '../server.mjs';

const fixture = `
<ol class="work index group">
  <li id="work_1" class="work blurb group">
    <h4 class="heading"><a href="/works/1">前缀羡爆后缀</a> by <a rel="author">作者甲</a></h4>
    <h5 class="fandoms"><a>测试作品</a></h5>
    <blockquote class="userstuff summary"><p>摘要一</p></blockquote>
    <dl class="stats"><dd class="language">中文</dd><dd class="words">1,234</dd></dl>
  </li>
  <li id="work_2" class="work blurb group">
    <h4 class="heading"><a href="/works/2">前缀爆羡后缀</a></h4>
  </li>
  <li id="work_3" class="work blurb group">
    <h4 class="heading"><a href="/works/3">前缀羡/爆后缀</a></h4>
  </li>
</ol>`;

test('keeps only the exact contiguous title text in the requested order', () => {
  const works = extractWorks(fixture, '羡爆');
  assert.equal(works.length, 1);
  assert.equal(works[0].title, '前缀羡爆后缀');
  assert.equal(works[0].url, 'https://archiveofourown.org/works/1');
  assert.deepEqual(works[0].authors, ['作者甲']);
});
