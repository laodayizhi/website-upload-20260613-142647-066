(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");

    if (header && toggle) {
      toggle.addEventListener("click", function () {
        var opened = header.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", opened ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));

    if (slides.length > 1) {
      var active = 0;
      var show = function (index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      };

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });

      setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    var filterWrap = document.querySelector("[data-filter-wrap]");
    if (filterWrap) {
      var searchInput = document.querySelector("[data-filter-search]");
      var yearSelect = document.querySelector("[data-filter-year]");
      var genreSelect = document.querySelector("[data-filter-genre]");
      var cards = Array.prototype.slice.call(filterWrap.querySelectorAll(".movie-card"));

      var filterCards = function () {
        var keyword = normalize(searchInput && searchInput.value);
        var year = normalize(yearSelect && yearSelect.value);
        var genre = normalize(genreSelect && genreSelect.value);

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
          ].join(" "));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardGenre = normalize(card.getAttribute("data-genre"));
          var matched = (!keyword || haystack.indexOf(keyword) !== -1) &&
            (!year || cardYear === year) &&
            (!genre || cardGenre.indexOf(genre) !== -1);
          card.classList.toggle("hidden-card", !matched);
        });
      };

      [searchInput, yearSelect, genreSelect].forEach(function (node) {
        if (node) {
          node.addEventListener("input", filterCards);
          node.addEventListener("change", filterCards);
        }
      });
    }

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage && window.SEARCH_INDEX) {
      var params = new URLSearchParams(window.location.search);
      var queryInput = document.querySelector("[data-search-input]");
      var categorySelect = document.querySelector("[data-search-category]");
      var resultBox = document.querySelector("[data-search-results]");
      var initial = params.get("q") || "";

      if (queryInput) {
        queryInput.value = initial;
      }

      var render = function () {
        var keyword = normalize(queryInput && queryInput.value);
        var category = normalize(categorySelect && categorySelect.value);
        var results = window.SEARCH_INDEX.filter(function (item) {
          var text = normalize([item.title, item.year, item.region, item.genre, item.tags, item.oneLine].join(" "));
          return (!keyword || text.indexOf(keyword) !== -1) && (!category || normalize(item.category) === category);
        }).slice(0, 120);

        if (!resultBox) {
          return;
        }

        if (!results.length) {
          resultBox.innerHTML = '<div class="search-results-empty">没有找到匹配影片，请换一个关键词。</div>';
          return;
        }

        resultBox.innerHTML = results.map(function (item) {
          return '<article class="movie-card">' +
            '<a class="poster-link" href="' + item.url + '" aria-label="观看' + item.title + '">' +
            '<img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">' +
            '<span class="play-hover">▶</span>' +
            '</a>' +
            '<div class="movie-card-body">' +
            '<div class="movie-meta"><span>' + item.year + '</span><span>' + item.region + '</span></div>' +
            '<h3><a href="' + item.url + '">' + item.title + '</a></h3>' +
            '<p>' + item.oneLine + '</p>' +
            '<div class="tag-row"><span>' + item.category + '</span></div>' +
            '</div>' +
            '</article>';
        }).join("");
      };

      [queryInput, categorySelect].forEach(function (node) {
        if (node) {
          node.addEventListener("input", render);
          node.addEventListener("change", render);
        }
      });

      render();
    }
  });
})();
