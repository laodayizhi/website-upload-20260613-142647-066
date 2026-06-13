(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        var menu = document.querySelector('.mobile-nav');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            menu.hidden = expanded;
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function uniqueSorted(values) {
        return Array.from(new Set(values.filter(Boolean))).sort(function (a, b) {
            return String(b).localeCompare(String(a), 'zh-CN');
        });
    }

    function fillSelect(select, values) {
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function setupFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll('[data-movie-list]'));
        lists.forEach(function (list) {
            var section = list.closest('.listing-section') || document;
            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
            var search = section.querySelector('[data-movie-search]');
            var yearSelect = section.querySelector('[data-year-filter]');
            var typeSelect = section.querySelector('[data-type-filter]');
            var empty = section.querySelector('[data-empty-result]');

            if (yearSelect) {
                fillSelect(yearSelect, uniqueSorted(cards.map(function (card) {
                    return card.getAttribute('data-year') || '';
                })));
            }

            if (typeSelect) {
                fillSelect(typeSelect, uniqueSorted(cards.map(function (card) {
                    return card.getAttribute('data-type') || '';
                })));
            }

            function apply() {
                var query = search ? search.value.trim().toLowerCase() : '';
                var year = yearSelect ? yearSelect.value : '';
                var type = typeSelect ? typeSelect.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || '').toLowerCase();
                    var cardYear = card.getAttribute('data-year') || '';
                    var cardType = card.getAttribute('data-type') || '';
                    var matched = (!query || text.indexOf(query) !== -1) && (!year || cardYear === year) && (!type || cardType === type);
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (search) {
                search.addEventListener('input', apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener('change', apply);
            }
            if (typeSelect) {
                typeSelect.addEventListener('change', apply);
            }
        });
    }

    function attachStream(video, streamUrl) {
        if (!video || !streamUrl || video.getAttribute('data-ready') === '1') {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video.hlsController = hls;
        } else {
            video.src = streamUrl;
        }

        video.setAttribute('data-ready', '1');
    }

    function setupPlayers() {
        var frames = Array.prototype.slice.call(document.querySelectorAll('.player-frame'));
        frames.forEach(function (frame) {
            var video = frame.querySelector('video');
            var button = frame.querySelector('.player-start');
            var streamUrl = frame.getAttribute('data-stream-url') || '';

            function playFromFrame() {
                attachStream(video, streamUrl);
                frame.classList.add('is-ready');
                var playTask = video.play();
                if (playTask && typeof playTask.catch === 'function') {
                    playTask.catch(function () {
                        frame.classList.remove('is-playing');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', playFromFrame);
            }

            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        playFromFrame();
                    }
                });
                video.addEventListener('play', function () {
                    frame.classList.add('is-playing');
                });
                video.addEventListener('pause', function () {
                    frame.classList.remove('is-playing');
                });
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
