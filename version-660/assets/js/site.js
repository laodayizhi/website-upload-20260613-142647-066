(function () {
    const ready = function (callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    };

    ready(function () {
        const toggle = document.querySelector('[data-mobile-toggle]');
        const panel = document.querySelector('[data-mobile-menu]');
        if (toggle && panel) {
            toggle.addEventListener('click', function () {
                panel.classList.toggle('open');
            });
        }

        const carousel = document.querySelector('[data-hero-carousel]');
        if (carousel) {
            const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
            const dots = Array.from(carousel.querySelectorAll('[data-slide-dot]'));
            let index = 0;
            const show = function (next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('active', slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === index);
                });
            };
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    show(dotIndex);
                });
            });
            if (slides.length > 1) {
                window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }
        }

        const grid = document.querySelector('[data-card-grid]');
        if (grid) {
            const input = document.querySelector('[data-card-search]');
            const sort = document.querySelector('[data-sort-select]');
            const viewButtons = Array.from(document.querySelectorAll('[data-view]'));
            const apply = function () {
                const keyword = input ? input.value.trim().toLowerCase() : '';
                const cards = Array.from(grid.querySelectorAll('.movie-card'));
                cards.forEach(function (card) {
                    const haystack = ((card.dataset.title || '') + ' ' + (card.dataset.tags || '')).toLowerCase();
                    card.hidden = keyword && haystack.indexOf(keyword) === -1;
                });
                const visible = cards.filter(function (card) {
                    return !card.hidden;
                });
                const mode = sort ? sort.value : 'year-desc';
                visible.sort(function (a, b) {
                    if (mode === 'year-asc') {
                        return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
                    }
                    if (mode === 'title') {
                        return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
                    }
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                });
                visible.forEach(function (card) {
                    grid.appendChild(card);
                });
            };
            if (input) {
                input.addEventListener('input', apply);
            }
            if (sort) {
                sort.addEventListener('change', apply);
            }
            viewButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    grid.classList.toggle('list-mode', button.dataset.view === 'list');
                });
            });
            apply();
        }

        const searchPage = document.querySelector('[data-search-page]');
        if (searchPage && Array.isArray(window.SITE_SEARCH_INDEX)) {
            const params = new URLSearchParams(window.location.search);
            const input = document.querySelector('[data-search-input]');
            const results = document.querySelector('[data-search-results]');
            const empty = document.querySelector('[data-search-empty]');
            const initial = params.get('q') || '';
            if (input) {
                input.value = initial;
            }
            const render = function () {
                const keyword = input ? input.value.trim().toLowerCase() : '';
                const matched = window.SITE_SEARCH_INDEX.filter(function (item) {
                    const haystack = (item.title + ' ' + item.year + ' ' + item.region + ' ' + item.type + ' ' + item.genre + ' ' + item.tags + ' ' + item.summary).toLowerCase();
                    return !keyword || haystack.indexOf(keyword) !== -1;
                }).slice(0, 120);
                if (results) {
                    results.innerHTML = matched.map(function (item) {
                        return '<article class="movie-card">' +
                            '<a class="poster-link" href="' + item.url + '">' +
                                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                                '<span class="year-badge">' + escapeHtml(item.year) + '</span>' +
                            '</a>' +
                            '<div class="movie-card-body">' +
                                '<div class="movie-meta-line"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
                                '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>' +
                                '<p>' + escapeHtml(item.summary) + '</p>' +
                                '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>' +
                            '</div>' +
                        '</article>';
                    }).join('');
                }
                if (empty) {
                    empty.style.display = matched.length ? 'none' : 'block';
                }
            };
            const escapeHtml = function (value) {
                return String(value || '').replace(/[&<>"]/g, function (char) {
                    return {
                        '&': '&amp;',
                        '<': '&lt;',
                        '>': '&gt;',
                        '"': '&quot;'
                    }[char];
                });
            };
            if (input) {
                input.addEventListener('input', render);
            }
            render();
        }
    });
})();
