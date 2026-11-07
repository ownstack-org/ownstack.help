#!/usr/bin/env node
// Hand-rolled build for ownstack.help. No framework.
// Reads content/**/*.html fragments, wraps each in shared chrome (_layout/page.html),
// writes the full pages to the repo root, and produces search-index.json.
// Each content file starts with a JSON frontmatter block in a comment:
//   <!-- meta {"title":"...","desc":"...","section":"...","slug":"..."} -->

const fs = require('fs');
const path = require('path');

const META_RE = /^\s*<!--\s*meta\s+(\{[\s\S]*?\})\s*-->/;
const H_RE = /<h([23])\b[^>]*?(?:\sid="([^"]+)")?[^>]*>([\s\S]*?)<\/h\1>/g;

function slugify(s) {
	return s.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function buildToc(html) {
	const items = [];
	const out = html.replace(H_RE, (_, level, id, text) => {
		const slug = id || slugify(text);
		items.push({ level: Number(level), id: slug, text: text.replace(/<[^>]+>/g, '') });
		return `<h${level} id="${slug}">${text}</h${level}>`;
	});
	if (items.length === 0) return { html: out, toc: '' };
	const toc =
		'<h4>On this page</h4><ul>' +
		items
			.map((it) => `<li class="h${it.level}"><a href="#${it.id}">${it.text}</a></li>`)
			.join('') +
		'</ul>';
	return { html: out, toc };
}

function buildBreadcrumb(meta, slug) {
	const parts = slug.split('/').filter(Boolean);
	if (parts.length === 0) return '';
	const sep = '<span class="sep">›</span>';
	let crumbs = `<a href="/">Docs</a>`;
	let url = '/';
	for (let i = 0; i < parts.length - 1; i++) {
		url += parts[i] + '/';
		crumbs += sep + `<a href="${url}">${parts[i].replace(/-/g, ' ')}</a>`;
	}
	crumbs += sep + `<span>${meta.title}</span>`;
	return `<nav class="breadcrumb">${crumbs}</nav>`;
}

function applySidebarActive(side, slug) {
	const want = '/' + slug.replace(/^\/+/, '');
	const wantNorm = want.endsWith('/') ? want : want + '/';
	return side.replace(/<a\s+href="([^"]+)"/g, (m, href) => {
		const norm = href.endsWith('/') ? href : href + '/';
		return norm === wantNorm ? `<a class="active" href="${href}"` : m;
	});
}

function walk(dir, base = '') {
	const out = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		const rel = path.posix.join(base, entry.name);
		if (entry.isDirectory()) {
			out.push(...walk(full, rel));
		} else if (entry.name.endsWith('.html')) {
			out.push({ full, rel });
		}
	}
	return out;
}

function stripHtmlForSearch(html) {
	return html
		.replace(/<style[\s\S]*?<\/style>/g, ' ')
		.replace(/<script[\s\S]*?<\/script>/g, ' ')
		.replace(/<pre[\s\S]*?<\/pre>/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

// Builds every page under <root>/content into <root> and writes
// <root>/search-index.json. Returns the search index. `log` takes the
// progress lines (console by default).
function build(root = __dirname, log = console) {
	const read = (...p) => fs.readFileSync(path.join(root, ...p), 'utf8');
	const layout = read('_layout', 'page.html');
	const sidebar = read('_layout', 'sidebar.html');
	const header = read('_layout', 'header.html');
	const footer = read('_layout', 'footer.html');

	const searchIndex = [];

	for (const file of walk(path.join(root, 'content'))) {
		const raw = fs.readFileSync(file.full, 'utf8');
		const m = META_RE.exec(raw);
		if (!m) {
			log.warn(`[build] skip ${file.rel}: missing meta header`);
			continue;
		}
		const meta = JSON.parse(m[1]);
		const body = raw.slice(m[0].length).trim();
		const slug = (meta.slug || file.rel.replace(/\.html$/, '').replace(/\/index$/, '')).replace(/^\/+/, '');

		const { html: bodyWithIds, toc } = buildToc(body);
		const breadcrumb = buildBreadcrumb(meta, slug);
		const sidebarActive = applySidebarActive(sidebar, slug);

		// Function replacements: a string replacement would treat "$&" or "$'"
		// in a page (shell snippets) as a replace pattern.
		const page = layout
			.replace(/{{TITLE}}/g, () => meta.title)
			.replace(/{{DESC}}/g, () => meta.desc || '')
			.replace(/{{HEADER}}/g, () => header)
			.replace(/{{FOOTER}}/g, () => footer)
			.replace(/{{SIDEBAR}}/g, () => sidebarActive)
			.replace(/{{BREADCRUMB}}/g, () => breadcrumb)
			.replace(/{{CONTENT}}/g, () => bodyWithIds)
			.replace(/{{TOC}}/g, () => toc);

		const outPath = slug === '' ? path.join(root, 'index.html') : path.join(root, slug, 'index.html');
		fs.mkdirSync(path.dirname(outPath), { recursive: true });
		fs.writeFileSync(outPath, page);
		log.log(`[build] ${slug || 'index'} → ${path.relative(root, outPath)}`);

		searchIndex.push({
			title: meta.title,
			section: meta.section || '',
			url: '/' + (slug ? slug + '/' : ''),
			body: stripHtmlForSearch(body).slice(0, 4000),
		});
	}

	fs.writeFileSync(path.join(root, 'search-index.json'), JSON.stringify(searchIndex));
	log.log(`[build] search-index.json (${searchIndex.length} entries)`);
	return searchIndex;
}

module.exports = { build, slugify, buildToc, buildBreadcrumb, applySidebarActive, walk, stripHtmlForSearch };

if (require.main === module) build();
