(function () {
    window.MoviePlayer = {
        init: function (src) {
            var video = document.querySelector('[data-player]');
            var overlay = document.querySelector('[data-player-overlay]');
            var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-player-start]'));
            var attached = false;
            var hls = null;

            if (!video || !src) {
                return;
            }

            var attach = function () {
                if (attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new Hls({ enableWorker: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
            };

            var hide = function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            };

            var start = function () {
                attach();
                hide();
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            };

            buttons.forEach(function (button) {
                button.addEventListener('click', start);
            });
            if (overlay) {
                overlay.addEventListener('click', start);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', hide);
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        }
    };
})();
