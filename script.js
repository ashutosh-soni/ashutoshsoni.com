(function () {
  "use strict";

  var THEME_KEY = "ashutosh-site-theme";
  var doc = document.documentElement;
  var navMobile = document.getElementById("navMobile");
  var navMenuBtn = document.getElementById("navMenuBtn");

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      /* ignore */
    }
  }

  function syncThemeToggleUi(theme) {
    var toggle = document.getElementById("themeToggle");
    if (!toggle) return;
    var dark = theme === "dark";
    toggle.setAttribute("aria-pressed", dark ? "true" : "false");
    toggle.setAttribute("aria-label", dark ? "Use light theme" : "Use dark theme");
  }

  function applyTheme(theme) {
    var t = theme === "light" ? "light" : "dark";
    doc.setAttribute("data-theme", t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", t === "light" ? "#f8f7f4" : "#0c0c0f");
    }
    syncThemeToggleUi(t);
  }

  function initTheme() {
    var stored = getStoredTheme();
    if (stored === "light" || stored === "dark") {
      applyTheme(stored);
    } else {
      applyTheme("light");
    }

    var toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = doc.getAttribute("data-theme") === "light" ? "dark" : "light";
        applyTheme(next);
        setStoredTheme(next);
      });
    }
  }

  function smoothScrollToHash(hash) {
    if (!hash || hash === "#") return;
    var id = hash.slice(1);
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    var el = document.getElementById(id);
    if (!el) return;
    var header = document.querySelector(".site-header");
    var offset = header ? header.offsetHeight : 0;
    var top = el.getBoundingClientRect().top + window.scrollY - offset - 8;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute("href") === "#") return;
      var href = a.getAttribute("href");
      if (href.length > 1 && document.getElementById(href.slice(1))) {
        e.preventDefault();
        smoothScrollToHash(href);
        history.pushState(null, "", href);
        setNavOpen(false);
      }
    });
  }

  function setNavOpen(open) {
    if (!navMobile || !navMenuBtn) return;
    navMobile.hidden = !open;
    navMenuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    navMenuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  function closeMobileNav() {
    setNavOpen(false);
  }

  function initMobileNav() {
    if (!navMobile || !navMenuBtn) return;
    navMenuBtn.addEventListener("click", function () {
      var isOpen = navMenuBtn.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        setNavOpen(false);
        navMenuBtn.focus();
      } else {
        setNavOpen(true);
        var first = navMobile.querySelector("a");
        if (first) {
          requestAnimationFrame(function () {
            first.focus();
          });
        }
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (navMenuBtn.getAttribute("aria-expanded") === "true") {
          setNavOpen(false);
          navMenuBtn.focus();
        }
      }
    });

    navMobile.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (a && navMobile.contains(a)) closeMobileNav();
    });
  }

  function initReveal() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var els = document.querySelectorAll(".reveal");
    if (!els.length || !("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -5% 0px", threshold: 0.06 }
    );

    els.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function initHeroRoleTyping() {
    var el = document.getElementById("heroRoleTyping");
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = "Senior Software Engineer";
      return;
    }

    var phrases = ["Making apps that change lives", "Software Architect", "LLM Engineer"];
    var phraseIdx = 0;
    var charIdx = 0;
    var direction = 1; // 1 typing, -1 deleting
    var timer = null;

    function render(text) {
      // keep a stable line box height even when "empty"
      el.textContent = text && text.length ? text : "\u00A0";
    }

    function setNextTick(ms) {
      timer = window.setTimeout(tick, ms);
    }

    function tick() {
      var phrase = phrases[phraseIdx];

      if (direction === 1) {
        charIdx = Math.min(phrase.length, charIdx + 1);
        render(phrase.slice(0, charIdx));

        if (charIdx >= phrase.length) {
          direction = -1;
          setNextTick(2000);
          return;
        }

        setNextTick(45);
        return;
      }

      // deleting
      charIdx = Math.max(0, charIdx - 1);
      render(phrase.slice(0, charIdx));

      if (charIdx <= 0) {
        direction = 1;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setNextTick(250);
        return;
      }

      setNextTick(24);
    }

    // start
    render("");
    setNextTick(250);

    // best-effort cleanup
    window.addEventListener(
      "beforeunload",
      function () {
        if (timer) window.clearTimeout(timer);
      },
      { once: true }
    );
  }

  function initHeaderShadow() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initSkipLinkFocus() {
    var skip = document.querySelector(".skip-link");
    var main = document.getElementById("main");
    if (!skip || !main) return;
    skip.addEventListener("click", function () {
      window.requestAnimationFrame(function () {
        try {
          main.focus({ preventScroll: true });
        } catch (err) {
          main.focus();
        }
      });
    });
  }

  initTheme();
  initSkipLinkFocus();
  initSmoothScroll();
  initMobileNav();
  initReveal();
  initYear();
  initHeroRoleTyping();
  initHeaderShadow();
})();
