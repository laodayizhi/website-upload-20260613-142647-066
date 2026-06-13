(function () {
    function onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var menu = document.querySelector('[data-mobile-nav]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var typeSelect = scope.querySelector('[data-type-filter]');
            var sortSelect = scope.querySelector('[data-sort-select]');
            var list = scope.parentElement.querySelector('[data-card-list]');
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll('.js-movie-card'));
            function apply() {
                var query = normalize(input && input.value);
                var type = normalize(typeSelect && typeSelect.value);
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.year,
                        card.dataset.tags,
                        card.dataset.type,
                        card.dataset.region
                    ].join(' '));
                    var cardType = normalize(card.dataset.type);
                    var matchedQuery = !query || haystack.indexOf(query) !== -1;
                    var matchedType = !type || cardType.indexOf(type) !== -1 || haystack.indexOf(type) !== -1;
                    card.classList.toggle('is-hidden-card', !(matchedQuery && matchedType));
                });
                var mode = sortSelect ? sortSelect.value : '';
                var sorted = cards.slice().sort(function (a, b) {
                    if (mode === 'year-asc') {
                        return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
                    }
                    if (mode === 'title') {
                        return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-CN');
                    }
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                });
                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
            }
            [input, typeSelect, sortSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function initPlayer() {
        var shell = document.querySelector('[data-player]');
        if (!shell) {
            return;
        }
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('[data-play-button]');
        var playControl = shell.querySelector('[data-control-play]');
        var muteControl = shell.querySelector('[data-control-mute]');
        var fullControl = shell.querySelector('[data-control-fullscreen]');
        if (!video) {
            return;
        }
        var videoUrl = video.getAttribute('data-video-url');
        var hls = null;
        var attached = false;
        function attach() {
            if (attached || !videoUrl) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: false,
                    lowLatencyMode: true
                });
                hls.loadSource(videoUrl);
                hls.attachMedia(video);
            } else {
                shell.classList.add('is-error');
            }
        }
        function play() {
            attach();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }
        function togglePlay() {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        }
        function toggleMute() {
            video.muted = !video.muted;
            if (muteControl) {
                muteControl.textContent = video.muted ? '取消静音' : '静音';
            }
        }
        function toggleFullscreen() {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (shell.requestFullscreen) {
                shell.requestFullscreen();
            }
        }
        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('click', togglePlay);
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
            if (playControl) {
                playControl.textContent = '暂停';
            }
        });
        video.addEventListener('pause', function () {
            shell.classList.remove('is-playing');
            if (playControl) {
                playControl.textContent = '播放';
            }
        });
        if (playControl) {
            playControl.addEventListener('click', togglePlay);
        }
        if (muteControl) {
            muteControl.addEventListener('click', toggleMute);
        }
        if (fullControl) {
            fullControl.addEventListener('click', toggleFullscreen);
        }
        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    onReady(function () {
        initNavigation();
        initHero();
        initFilters();
        initPlayer();
    });
})();
