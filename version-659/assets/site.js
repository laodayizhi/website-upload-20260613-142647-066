(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(text) {
        return String(text || "").trim().toLowerCase();
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                var open = mobileNav.classList.toggle("open");
                menuButton.setAttribute("aria-expanded", String(open));
            });
        }

        var carousel = document.querySelector("[data-hero-carousel]");

        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var prev = carousel.querySelector("[data-hero-prev]");
            var next = carousel.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === current);
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

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }

            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var list = document.querySelector("[data-filter-list]");
            var cards = list ? Array.prototype.slice.call(list.children) : [];
            var input = panel.querySelector("[data-filter-search]");
            var yearSelect = panel.querySelector("[data-filter-year]");
            var typeSelect = panel.querySelector("[data-filter-type]");
            var reset = panel.querySelector("[data-filter-reset]");

            function fillSelect(select, values) {
                if (!select) {
                    return;
                }
                values.forEach(function (value) {
                    var option = document.createElement("option");
                    option.value = value;
                    option.textContent = value;
                    select.appendChild(option);
                });
            }

            var years = Array.from(new Set(cards.map(function (card) {
                return card.getAttribute("data-year") || "";
            }).filter(Boolean))).sort(function (a, b) {
                return Number(b) - Number(a);
            });

            var types = Array.from(new Set(cards.map(function (card) {
                return card.getAttribute("data-type") || "";
            }).filter(Boolean))).sort();

            fillSelect(yearSelect, years);
            fillSelect(typeSelect, types);

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var year = yearSelect ? yearSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-genre"),
                        card.textContent
                    ].join(" "));
                    var matched = true;

                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }

                    if (year && card.getAttribute("data-year") !== year) {
                        matched = false;
                    }

                    if (type && card.getAttribute("data-type") !== type) {
                        matched = false;
                    }

                    card.classList.toggle("is-filter-hidden", !matched);
                });
            }

            [input, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            if (reset) {
                reset.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    if (yearSelect) {
                        yearSelect.value = "";
                    }
                    if (typeSelect) {
                        typeSelect.value = "";
                    }
                    apply();
                });
            }
        });

        var searchPage = document.querySelector("[data-search-page]");

        if (searchPage && window.MOVIE_CATALOG) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            var input = document.querySelector("[data-search-input]");
            var title = document.querySelector("[data-search-title]");
            var results = document.querySelector("[data-search-results]");

            if (input) {
                input.value = query;
            }

            function card(movie) {
                return [
                    '<article class="movie-card">',
                    '<a class="poster-link" href="' + movie.url + '">',
                    '<img src="./' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                    '<span class="play-dot">▶</span>',
                    '</a>',
                    '<div class="movie-card-body">',
                    '<div class="movie-meta-line"><span>' + movie.year + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
                    '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
                    '<p>' + escapeHtml(movie.oneLine) + '</p>',
                    '<div class="tag-row"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
                    '</div>',
                    '</article>'
                ].join("");
            }

            function escapeHtml(text) {
                return String(text || "").replace(/[&<>"']/g, function (char) {
                    return {
                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        '"': "&quot;",
                        "'": "&#39;"
                    }[char];
                });
            }

            if (query) {
                var key = normalize(query);
                var matched = window.MOVIE_CATALOG.filter(function (movie) {
                    var haystack = normalize([
                        movie.title,
                        movie.year,
                        movie.region,
                        movie.type,
                        movie.genre,
                        movie.category,
                        (movie.tags || []).join(" "),
                        movie.oneLine
                    ].join(" "));
                    return haystack.indexOf(key) !== -1;
                }).slice(0, 120);

                if (title) {
                    title.textContent = "搜索结果";
                }

                if (results) {
                    if (matched.length) {
                        results.innerHTML = matched.map(card).join("");
                    } else {
                        results.innerHTML = '<div class="search-empty">没有找到匹配内容，可尝试更换关键词。</div>';
                    }
                }
            }
        }
    });
})();
