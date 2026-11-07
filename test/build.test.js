'use strict';
// build.js: the static site generator. Unit tests for each helper, then a
// whole build into a temp dir, then the real content tree.
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const {
	build,
	slugify,
	buildToc,
	buildBreadcrumb,
	applySidebarActive,
	walk,
	stripHtmlForSearch,
} = require('../build');

test('slugify lowercases, strips tags and collapses punctuation', () => {
	assert.strictEqual(slugify('Deploy <code>git push</code> Now!'), 'deploy-git-push-now');
	assert.strictEqual(slugify('  --Edge Case--  '), 'edge-case');
});

test('buildToc ids every h2/h3, keeps existing ids, and lists them', () => {
	const { html, toc } = buildToc('<h2>First Step</h2><p>x</p><h3 id="custom">Sub <em>part</em></h3><h4>skip</h4>');
	assert.match(html, /<h2 id="first-step">First Step<\/h2>/);
	assert.match(html, /<h3 id="custom">Sub <em>part<\/em><\/h3>/);
	assert.match(html, /<h4>skip<\/h4>/);
	assert.strictEqual(
		toc,
		'<h4>On this page</h4><ul><li class="h2"><a href="#first-step">First Step</a></li>' +
			'<li class="h3"><a href="#custom">Sub part</a></li></ul>'
	);
});

test('buildToc returns no toc for a page without headings', () => {
	assert.deepStrictEqual(buildToc('<p>just text</p>'), { html: '<p>just text</p>', toc: '' });
});

test('buildBreadcrumb links each parent and ends on the title', () => {
	assert.strictEqual(buildBreadcrumb({ title: 'Home' }, ''), '');
	assert.strictEqual(
		buildBreadcrumb({ title: 'Restore' }, 'databases/postgres/restore'),
		'<nav class="breadcrumb"><a href="/">Docs</a><span class="sep">›</span>' +
			'<a href="/databases/">databases</a><span class="sep">›</span>' +
			'<a href="/databases/postgres/">postgres</a><span class="sep">›</span><span>Restore</span></nav>'
	);
	assert.match(buildBreadcrumb({ title: 'T' }, 'domains-ssl/x'), /<a href="\/domains-ssl\/">domains ssl<\/a>/);
});

test('applySidebarActive marks only the current page, with or without a trailing slash', () => {
	const side = '<a href="/apps/">Apps</a><a href="/apps/domains">Domains</a><a href="/cli/">CLI</a>';
	assert.strictEqual(
		applySidebarActive(side, 'apps/domains'),
		'<a href="/apps/">Apps</a><a class="active" href="/apps/domains">Domains</a><a href="/cli/">CLI</a>'
	);
	assert.strictEqual(applySidebarActive(side, '/cli/'), side.replace('<a href="/cli/"', '<a class="active" href="/cli/"'));
	assert.strictEqual(applySidebarActive(side, 'nowhere'), side);
});

test('stripHtmlForSearch drops markup, code blocks, styles and scripts', () => {
	const text = stripHtmlForSearch('<style>a{}</style><p>Hello <b>there</b></p><pre>$ secret</pre><script>x()</script>\n\n end');
	assert.strictEqual(text, 'Hello there end');
});

function fixtureSite() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ownstack-help-'));
	const write = (rel, body) => {
		fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
		fs.writeFileSync(path.join(root, rel), body);
	};
	write('_layout/page.html', '<title>{{TITLE}}</title><meta content="{{DESC}}">{{HEADER}}{{SIDEBAR}}{{BREADCRUMB}}<main>{{CONTENT}}</main><aside>{{TOC}}</aside>{{FOOTER}}');
	write('_layout/sidebar.html', '<a href="/guide/start/">Start</a>');
	write('_layout/header.html', '<header>H</header>');
	write('_layout/footer.html', '<footer>F</footer>');
	write('content/home.html', '<!-- meta {"title":"Home","desc":"The docs","slug":"/"} -->\n<p>Welcome</p>');
	write('content/guide/index.html', '<!-- meta {"title":"Guide"} -->\n<p>Overview</p>');
	write('content/guide/start.html', '<!-- meta {"title":"Start","section":"Guide"} -->\n<h2>Install</h2><pre>echo $\'quoted\' $& done</pre><p>Run it.</p>');
	write('content/guide/custom.html', '<!-- meta {"title":"Custom","slug":"/elsewhere/page"} -->\n<p>Moved</p>');
	write('content/guide/broken.html', '<p>no meta header</p>');
	write('content/guide/notes.txt', 'not html');
	return root;
}

test('walk finds every .html file under a directory, recursively', () => {
	const root = fixtureSite();
	const rels = walk(path.join(root, 'content')).map((f) => f.rel).sort();
	assert.deepStrictEqual(rels, ['guide/broken.html', 'guide/custom.html', 'guide/index.html', 'guide/start.html', 'home.html']);
});

test('build writes each page into its slug directory and a search index', () => {
	const root = fixtureSite();
	const lines = [];
	const warnings = [];
	const index = build(root, { log: (l) => lines.push(l), warn: (l) => warnings.push(l) });

	const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
	assert.match(home, /<title>Home<\/title><meta content="The docs"><header>H<\/header>/);
	assert.match(home, /<main><p>Welcome<\/p><\/main><aside><\/aside><footer>F<\/footer>/);

	const start = fs.readFileSync(path.join(root, 'guide/start/index.html'), 'utf8');
	assert.match(start, /<a class="active" href="\/guide\/start\/">Start<\/a>/);
	assert.match(start, /<span>Start<\/span><\/nav>/);
	assert.match(start, /<h2 id="install">Install<\/h2>/);
	assert.match(start, /<meta content="">/);
	assert.match(start, /<li class="h2"><a href="#install">Install<\/a><\/li>/);
	// Shell snippets carry "$'" and "$&": they must land in the page verbatim,
	// not be read as String.replace patterns.
	assert.ok(start.includes("<pre>echo $'quoted' $& done</pre>"), 'page body was mangled by replace patterns');

	assert.ok(fs.existsSync(path.join(root, 'elsewhere/page/index.html')), 'meta.slug overrides the path');
	assert.deepStrictEqual(warnings, ['[build] skip guide/broken.html: missing meta header']);
	assert.ok(lines.includes('[build] search-index.json (4 entries)'));

	const onDisk = JSON.parse(fs.readFileSync(path.join(root, 'search-index.json'), 'utf8'));
	assert.deepStrictEqual(onDisk, index);
	const byUrl = Object.fromEntries(index.map((e) => [e.url, e]));
	assert.deepStrictEqual(byUrl['/'], { title: 'Home', section: '', url: '/', body: 'Welcome' });
	assert.deepStrictEqual(byUrl['/guide/start/'], { title: 'Start', section: 'Guide', url: '/guide/start/', body: 'Install Run it.' });
	assert.ok(byUrl['/elsewhere/page/']);
	// content/<dir>/index.html is the section page at /<dir>/.
	assert.deepStrictEqual(byUrl['/guide/'], { title: 'Guide', section: '', url: '/guide/', body: 'Overview' });
	assert.match(fs.readFileSync(path.join(root, 'guide/index.html'), 'utf8'), /<p>Overview<\/p>/);
});

test('the real site builds and the committed pages match the build', () => {
	// Build a copy of the repo's real content, so the test never rewrites the
	// working tree, then compare with the committed output.
	const repo = path.join(__dirname, '..');
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ownstack-help-real-'));
	fs.cpSync(path.join(repo, '_layout'), path.join(root, '_layout'), { recursive: true });
	fs.cpSync(path.join(repo, 'content'), path.join(root, 'content'), { recursive: true });
	const warnings = [];
	const index = build(root, { log() {}, warn: (l) => warnings.push(l) });

	assert.deepStrictEqual(warnings, [], 'every content page has a meta header');
	assert.ok(index.length >= 40, `expected the full docs set, got ${index.length} pages`);
	for (const entry of index) {
		const rel = entry.url === '/' ? 'index.html' : path.join(entry.url.slice(1), 'index.html');
		const built = fs.readFileSync(path.join(root, rel), 'utf8');
		const committed = fs.readFileSync(path.join(repo, rel), 'utf8');
		assert.strictEqual(built, committed, `${rel} is stale: run npm run build and commit`);
	}
});

test('running build.js as a script builds the site in place', () => {
	const root = fixtureSite();
	fs.copyFileSync(path.join(__dirname, '..', 'build.js'), path.join(root, 'build.js'));
	const out = execFileSync(process.execPath, [path.join(root, 'build.js')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
	assert.match(out, /\[build\] search-index\.json \(4 entries\)/);
	assert.ok(fs.existsSync(path.join(root, 'guide/start/index.html')));
});
