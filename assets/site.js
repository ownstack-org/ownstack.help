// OwnStack docs — sidebar toggle, copy buttons, search.
// No framework. Plain JS. Loaded with `defer` from every page.

(function () {
	// ----- Mobile sidebar toggle -----
	const sidebar = document.querySelector('.sidebar');
	const toggle = document.querySelector('.menu-toggle');
	if (toggle && sidebar) {
		toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
		document.addEventListener('click', (e) => {
			if (window.innerWidth > 800) return;
			if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
				sidebar.classList.remove('open');
			}
		});
	}

	// ----- Copy buttons on code blocks -----
	document.querySelectorAll('pre').forEach((pre) => {
		if (pre.querySelector('.copy-btn')) return;
		const btn = document.createElement('button');
		btn.className = 'copy-btn';
		btn.textContent = 'Copy';
		btn.addEventListener('click', async () => {
			const code = pre.querySelector('code') || pre;
			// Strip leading "$ " from terminal lines for a cleaner paste.
			const text = code.innerText
				.split('\n')
				.map((l) => l.replace(/^\$\s+/, ''))
				.join('\n');
			try {
				await navigator.clipboard.writeText(text);
				btn.textContent = 'Copied';
				btn.classList.add('copied');
				setTimeout(() => {
					btn.textContent = 'Copy';
					btn.classList.remove('copied');
				}, 1500);
			} catch (e) {
				btn.textContent = 'Error';
				setTimeout(() => (btn.textContent = 'Copy'), 1500);
			}
		});
		pre.appendChild(btn);
	});

	// ----- TOC scroll-spy -----
	const tocLinks = Array.from(document.querySelectorAll('.toc a[href^="#"]'));
	if (tocLinks.length > 0) {
		const headings = tocLinks
			.map((a) => document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))))
			.filter(Boolean);
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const id = entry.target.id;
						tocLinks.forEach((a) => {
							a.classList.toggle('active', a.getAttribute('href') === '#' + id);
						});
					}
				});
			},
			{ rootMargin: '-72px 0px -70% 0px' }
		);
		headings.forEach((h) => observer.observe(h));
	}

	// ----- Search -----
	const searchInput = document.querySelector('.search-box input');
	const searchResults = document.querySelector('.search-results');
	if (searchInput && searchResults) {
		let index = null;
		let selected = -1;

		const loadIndex = () => {
			if (index !== null) return Promise.resolve(index);
			return fetch('/search-index.json')
				.then((r) => r.json())
				.then((data) => (index = data))
				.catch(() => (index = []));
		};

		const escapeHtml = (s) =>
			s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

		const highlight = (text, terms) => {
			let out = escapeHtml(text);
			terms.forEach((t) => {
				if (!t) return;
				const re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
				out = out.replace(re, '<mark>$1</mark>');
			});
			return out;
		};

		const score = (entry, terms) => {
			let s = 0;
			const title = entry.title.toLowerCase();
			const body = entry.body.toLowerCase();
			terms.forEach((t) => {
				if (title.includes(t)) s += 10;
				const hits = (body.match(new RegExp(t, 'g')) || []).length;
				s += hits;
			});
			return s;
		};

		const snippet = (body, terms) => {
			const lc = body.toLowerCase();
			let pos = -1;
			for (const t of terms) {
				const i = lc.indexOf(t);
				if (i !== -1 && (pos === -1 || i < pos)) pos = i;
			}
			if (pos === -1) return body.slice(0, 140);
			const start = Math.max(0, pos - 40);
			const end = Math.min(body.length, pos + 100);
			return (start > 0 ? '… ' : '') + body.slice(start, end) + (end < body.length ? ' …' : '');
		};

		const render = (results, terms) => {
			if (results.length === 0) {
				searchResults.innerHTML = '<div class="search-empty">No matches.</div>';
			} else {
				searchResults.innerHTML = results
					.map(
						(r, i) => `
							<a class="search-result${i === selected ? ' selected' : ''}" href="${r.url}" data-i="${i}">
								<div class="title">${highlight(r.title, terms)}</div>
								<div class="breadcrumb">${escapeHtml(r.section)}</div>
								<div class="snippet">${highlight(snippet(r.body, terms), terms)}</div>
							</a>
						`
					)
					.join('');
			}
			searchResults.classList.add('open');
		};

		const search = async (q) => {
			if (!q.trim()) {
				searchResults.classList.remove('open');
				return;
			}
			await loadIndex();
			const terms = q
				.toLowerCase()
				.split(/\s+/)
				.filter((t) => t.length >= 2);
			if (terms.length === 0) {
				searchResults.classList.remove('open');
				return;
			}
			const matches = index
				.map((e) => ({ ...e, _s: score(e, terms) }))
				.filter((e) => e._s > 0)
				.sort((a, b) => b._s - a._s)
				.slice(0, 8);
			selected = -1;
			render(matches, terms);
		};

		let timer;
		searchInput.addEventListener('input', (e) => {
			clearTimeout(timer);
			timer = setTimeout(() => search(e.target.value), 80);
		});
		searchInput.addEventListener('focus', (e) => {
			if (e.target.value) search(e.target.value);
		});
		document.addEventListener('click', (e) => {
			if (!searchResults.contains(e.target) && e.target !== searchInput) {
				searchResults.classList.remove('open');
			}
		});
		searchInput.addEventListener('keydown', (e) => {
			const items = searchResults.querySelectorAll('.search-result');
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				selected = Math.min(items.length - 1, selected + 1);
				items.forEach((it, i) => it.classList.toggle('selected', i === selected));
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				selected = Math.max(-1, selected - 1);
				items.forEach((it, i) => it.classList.toggle('selected', i === selected));
			} else if (e.key === 'Enter' && selected >= 0) {
				e.preventDefault();
				items[selected].click();
			} else if (e.key === 'Escape') {
				searchResults.classList.remove('open');
				searchInput.blur();
			}
		});

		// Cmd/Ctrl+K shortcut
		document.addEventListener('keydown', (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				searchInput.focus();
				searchInput.select();
			}
		});
	}
})();
