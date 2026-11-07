'use strict';
// assets/site.js: the browser script on every page (sidebar toggle, copy
// buttons, TOC scroll-spy, search). Each test runs it against a jsdom page.
const { test } = require('node:test');
const assert = require('node:assert');
const { JSDOM } = require('jsdom');
const init = require('../assets/site.js');

const INDEX = [
	{ title: 'Custom domains', section: 'Domains & SSL', url: '/domains-ssl/custom-domain/', body: 'Point a domain at your app. Then add the domain with the CLI.' },
	{ title: 'Deploy with git', section: 'Deployments', url: '/deployments/git-deploys/', body: 'git push deploys your app. The domain stays the same.' },
	{ title: 'Rollback', section: 'Deployments', url: '/deployments/rollback/', body: 'Roll back a bad release. ' + 'x'.repeat(200) },
];

const PAGE = `
<button class="menu-toggle">menu</button>
<nav class="sidebar"><a href="/">Docs</a></nav>
<main id="main">
	<pre><code>$ ownstack deploy
$ ownstack logs</code></pre>
	<pre class="has">plain<button class="copy-btn">Copy</button></pre>
	<h2 id="one">One</h2><h2 id="two words">Two</h2>
</main>
<aside class="toc"><a href="#one">One</a><a href="#two%20words">Two</a><a href="#missing">Gone</a></aside>
<div class="search-box"><input></div>
<div class="search-results"></div>`;

function setup({ html = PAGE, width = 1200, clipboard, index = INDEX, fetchFails = false } = {}) {
	const dom = new JSDOM(`<!doctype html><body>${html}</body>`, { url: 'https://ownstack.help/', pretendToBeVisual: true });
	const { window } = dom;
	Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
	const observed = [];
	let observerCallback;
	window.IntersectionObserver = class {
		constructor(cb, opts) { observerCallback = cb; this.opts = opts; }
		observe(el) { observed.push(el); }
	};
	const fetches = [];
	window.fetch = (url) => {
		fetches.push(url);
		if (fetchFails) return Promise.reject(new Error('offline'));
		return Promise.resolve({ json: () => Promise.resolve(index) });
	};
	const copied = [];
	Object.defineProperty(window.navigator, 'clipboard', {
		value: clipboard || { writeText: (t) => { copied.push(t); return Promise.resolve(); } },
		configurable: true,
	});
	// jsdom has no layout, so innerText is missing: textContent is what the
	// browser's innerText gives for a <pre>.
	Object.defineProperty(window.HTMLElement.prototype, 'innerText', {
		get() { return this.textContent; }, configurable: true,
	});
	init(window);
	const $ = (s) => window.document.querySelector(s);
	return { window, document: window.document, $, observed, fire: (e) => observerCallback(e), fetches, copied };
}

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));
const click = (w, el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
const key = (w, el, k, extra = {}) => el.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...extra }));

async function type(ctx, value) {
	const input = ctx.$('.search-box input');
	input.value = value;
	input.dispatchEvent(new ctx.window.Event('input'));
	await tick(120); // the input handler debounces by 80ms
	await tick();
}

test('the menu button toggles the sidebar, and a click outside closes it on a phone', () => {
	const ctx = setup({ width: 600 });
	const sidebar = ctx.$('.sidebar');
	click(ctx.window, ctx.$('.menu-toggle'));
	assert.ok(sidebar.classList.contains('open'));
	click(ctx.window, sidebar.querySelector('a'));
	assert.ok(sidebar.classList.contains('open'), 'a click inside the sidebar keeps it open');
	click(ctx.window, ctx.$('#main'));
	assert.ok(!sidebar.classList.contains('open'));
});

test('a click outside leaves the sidebar alone on a wide screen', () => {
	const ctx = setup({ width: 1200 });
	click(ctx.window, ctx.$('.menu-toggle'));
	click(ctx.window, ctx.$('#main'));
	assert.ok(ctx.$('.sidebar').classList.contains('open'));
});

test('copy buttons copy code without the shell prompt, once per block', async () => {
	const ctx = setup();
	const pres = ctx.document.querySelectorAll('pre');
	assert.strictEqual(pres[0].querySelectorAll('.copy-btn').length, 1);
	assert.strictEqual(pres[1].querySelectorAll('.copy-btn').length, 1, 'a block that already has a button gets no second one');

	const btn = pres[0].querySelector('.copy-btn');
	click(ctx.window, btn);
	await tick();
	assert.deepStrictEqual(ctx.copied, ['ownstack deploy\nownstack logs']);
	assert.strictEqual(btn.textContent, 'Copied');
	assert.ok(btn.classList.contains('copied'));
	await tick(1600);
	assert.strictEqual(btn.textContent, 'Copy');
	assert.ok(!btn.classList.contains('copied'));
});

test('a copy button says Error when the clipboard refuses, then resets', async () => {
	const ctx = setup({ html: '<pre>text</pre>', clipboard: { writeText: () => Promise.reject(new Error('denied')) } });
	const btn = ctx.$('.copy-btn');
	click(ctx.window, btn);
	await tick();
	assert.strictEqual(btn.textContent, 'Error');
	await tick(1600);
	assert.strictEqual(btn.textContent, 'Copy');
});

test('a block without <code> copies its own text', async () => {
	const ctx = setup({ html: '<pre>$ echo hi</pre>' });
	click(ctx.window, ctx.$('.copy-btn'));
	await tick();
	assert.deepStrictEqual(ctx.copied, ['echo hiCopy']);
});

test('the TOC highlights the heading in view', () => {
	const ctx = setup();
	assert.deepStrictEqual(ctx.observed.map((h) => h.id), ['one', 'two words'], 'observes the headings that exist');
	const [one, two] = ctx.document.querySelectorAll('.toc a');
	ctx.fire([{ isIntersecting: true, target: ctx.$('#one') }]);
	assert.ok(one.classList.contains('active'));
	assert.ok(!two.classList.contains('active'));
	ctx.fire([{ isIntersecting: false, target: ctx.$('#one') }]);
	assert.ok(one.classList.contains('active'), 'leaving view does not clear the highlight');
});

test('search finds, ranks by title then body hits, and highlights matches', async () => {
	const ctx = setup();
	await type(ctx, 'domain');
	assert.deepStrictEqual(ctx.fetches, ['/search-index.json']);
	const results = ctx.document.querySelectorAll('.search-result');
	assert.deepStrictEqual([...results].map((r) => r.getAttribute('href')), ['/domains-ssl/custom-domain/', '/deployments/git-deploys/']);
	assert.ok(ctx.$('.search-results').classList.contains('open'));
	assert.strictEqual(results[0].querySelector('.title').innerHTML, 'Custom <mark>domain</mark>s');
	assert.strictEqual(results[0].querySelector('.breadcrumb').innerHTML, 'Domains &amp; SSL');
	assert.match(results[1].querySelector('.snippet').innerHTML, /The <mark>domain<\/mark> stays/);

	await type(ctx, 'git push');
	assert.strictEqual(ctx.fetches.length, 1, 'the index is fetched once');
	assert.strictEqual(ctx.$('.search-result').getAttribute('href'), '/deployments/git-deploys/');
});

test('search snippets are trimmed around the first hit', async () => {
	const index = [{ title: 'Long', section: 'S', url: '/long/', body: 'a'.repeat(100) + ' needle ' + 'b'.repeat(200) }];
	const ctx = setup({ index });
	await type(ctx, 'needle');
	const snip = ctx.$('.snippet').textContent;
	assert.ok(snip.startsWith('… '), snip);
	assert.ok(snip.endsWith(' …'), snip);
	assert.match(snip, /needle/);
});

test('a title-only hit shows the start of the body', async () => {
	const index = [{ title: 'Needle', section: 'S', url: '/n/', body: 'Short body.' }];
	const ctx = setup({ index });
	await type(ctx, 'needle');
	assert.strictEqual(ctx.$('.snippet').textContent, 'Short body.');
});

test('search treats regex characters in the query as text', async () => {
	const index = [{ title: 'Pipes', section: 'S', url: '/p/', body: 'use a|b here' }];
	const ctx = setup({ index });
	await type(ctx, 'a|b');
	assert.strictEqual(ctx.$('.title').innerHTML, 'Pipes');
	assert.match(ctx.$('.snippet').innerHTML, /<mark>a\|b<\/mark>/);
});

test('search says No matches, and closes on an empty or too short query', async () => {
	const ctx = setup();
	const box = ctx.$('.search-results');
	await type(ctx, 'zzzz');
	assert.match(box.innerHTML, /No matches\./);
	assert.ok(box.classList.contains('open'));
	await type(ctx, '   ');
	assert.ok(!box.classList.contains('open'));
	await type(ctx, 'q');
	assert.ok(!box.classList.contains('open'), 'single letters are not searched');
});

test('search survives an index that will not load', async () => {
	const ctx = setup({ fetchFails: true });
	await type(ctx, 'domain');
	assert.match(ctx.$('.search-results').innerHTML, /No matches\./);
});

test('arrow keys move the selection, Enter follows it, Escape closes', async () => {
	const ctx = setup();
	await type(ctx, 'domain');
	const input = ctx.$('.search-box input');
	const items = () => [...ctx.document.querySelectorAll('.search-result')];
	const selected = () => items().findIndex((i) => i.classList.contains('selected'));

	key(ctx.window, input, 'ArrowDown');
	assert.strictEqual(selected(), 0);
	key(ctx.window, input, 'ArrowDown');
	key(ctx.window, input, 'ArrowDown');
	assert.strictEqual(selected(), 1, 'stops at the last result');
	key(ctx.window, input, 'ArrowUp');
	assert.strictEqual(selected(), 0);
	key(ctx.window, input, 'ArrowUp');
	assert.strictEqual(selected(), -1, 'up from the first clears the selection');

	key(ctx.window, input, 'Enter');
	key(ctx.window, input, 'ArrowDown');
	let followed = null;
	items()[0].addEventListener('click', (e) => { e.preventDefault(); followed = e.currentTarget.getAttribute('href'); });
	const enter = new ctx.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
	input.dispatchEvent(enter);
	assert.strictEqual(followed, '/domains-ssl/custom-domain/');
	assert.ok(enter.defaultPrevented);

	key(ctx.window, input, 'Escape');
	assert.ok(!ctx.$('.search-results').classList.contains('open'));
	key(ctx.window, input, 'Tab');
});

test('focusing the box reruns a typed query, and a click elsewhere closes results', async () => {
	const ctx = setup();
	const input = ctx.$('.search-box input');
	input.dispatchEvent(new ctx.window.Event('focus'));
	assert.deepStrictEqual(ctx.fetches, [], 'an empty box does not search');
	await type(ctx, 'domain');
	click(ctx.window, ctx.$('.search-result .title'));
	assert.ok(ctx.$('.search-results').classList.contains('open'), 'a click on a result keeps the list');
	click(ctx.window, input);
	assert.ok(ctx.$('.search-results').classList.contains('open'), 'a click on the box keeps the list');
	click(ctx.window, ctx.$('#main'));
	assert.ok(!ctx.$('.search-results').classList.contains('open'));
	input.dispatchEvent(new ctx.window.Event('focus'));
	await tick();
	assert.ok(ctx.$('.search-results').classList.contains('open'));
});

test('Cmd+K and Ctrl+K focus the search box; plain K does not', () => {
	const ctx = setup();
	const input = ctx.$('.search-box input');
	key(ctx.window, ctx.document.body, 'k');
	assert.notStrictEqual(ctx.document.activeElement, input);
	key(ctx.window, ctx.document.body, 'K', { metaKey: true });
	assert.strictEqual(ctx.document.activeElement, input);
	input.blur();
	key(ctx.window, ctx.document.body, 'k', { ctrlKey: true });
	assert.strictEqual(ctx.document.activeElement, input);
});

test('a page without a sidebar, TOC or search box loads without errors', () => {
	const ctx = setup({ html: '<p>bare</p>' });
	assert.strictEqual(ctx.document.querySelectorAll('.copy-btn').length, 0);
	assert.strictEqual(ctx.observed.length, 0);
});

test('in a browser the script runs against window at once', () => {
	const fs = require('fs');
	const path = require('path');
	const src = fs.readFileSync(path.join(__dirname, '..', 'assets', 'site.js'), 'utf8');
	const dom = new JSDOM('<!doctype html><body><pre>x</pre></body>', { runScripts: 'outside-only' });
	dom.window.eval(src);
	assert.strictEqual(dom.window.document.querySelectorAll('.copy-btn').length, 1);
});
