/**
 * Edil Costruzioni Lagioia — main script
 */
(function () {
  "use strict";

  var THEME_KEY = "ecl-theme";
  var COOKIE_KEY = "ecl-cookie-consent";

  function safe(fn) {
    try {
      return fn();
    } catch (e) {
      return null;
    }
  }

  function initLucide() {
    safe(function () {
      if (typeof lucide !== "undefined" && lucide.createIcons) {
        lucide.createIcons();
      }
    });
  }

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(value) {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch (e) {
      /* ignore */
    }
  }

  function applyTheme(theme) {
    var root = document.documentElement;
    if (theme === "light" || theme === "dark") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
    var toggle = document.querySelector("[data-theme-toggle]");
    if (toggle) {
      var isDark =
        theme === "dark" ||
        (!theme && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
      toggle.setAttribute("aria-pressed", isDark ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        isDark ? "Attiva tema chiaro" : "Attiva tema scuro"
      );
    }
  }

  function resolveTheme() {
    var stored = getStoredTheme();
    if (stored === "light" || stored === "dark") {
      return stored;
    }
    return null;
  }

  function initTheme() {
    applyTheme(resolveTheme());
    var toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      var root = document.documentElement;
      var current = root.getAttribute("data-theme");
      var prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      var isDark =
        current === "dark" ||
        (!current && prefersDark);
      var next = isDark ? "light" : "dark";
      setStoredTheme(next);
      applyTheme(next);
      initLucide();
    });
    if (window.matchMedia) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", function () {
          if (!getStoredTheme()) {
            applyTheme(null);
            initLucide();
          }
        });
    }
  }

  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var threshold = 60;
    function onScroll() {
      if (window.scrollY > threshold) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-burger-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    var closeBtn = document.querySelector("[data-mobile-close]");
    if (!toggle || !menu) return;

    function openMenu() {
      menu.classList.remove("is-closing");
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
    }

    function closeMenu() {
      if (!menu.classList.contains("is-open")) return;
      menu.classList.add("is-closing");
      var finished = false;
      function finish() {
        if (finished) return;
        finished = true;
        clearTimeout(fallback);
        menu.removeEventListener("transitionend", onEnd);
        menu.classList.remove("is-open", "is-closing");
        menu.setAttribute("aria-hidden", "true");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
      }
      function onEnd(e) {
        if (e.propertyName !== "transform") return;
        finish();
      }
      var fallback = window.setTimeout(finish, 600);
      menu.addEventListener("transitionend", onEnd);
    }

    toggle.addEventListener("click", function () {
      if (menu.classList.contains("is-open") && !menu.classList.contains("is-closing")) {
        closeMenu();
      } else if (!menu.classList.contains("is-open")) {
        openMenu();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", closeMenu);
    }

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMenu();
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        closeMenu();
      }
    });
  }

  /** GitHub Pages: progetto servito sotto /NomeRepo/ */
  var SITE_BASE = "/LagioiaCostruzioni";

  function comparablePath(p) {
    if (!p) return SITE_BASE;
    p = p.replace(/\/$/, "");
    if (p === "") p = "/";
    if (p === "/" || p === "/index.html") return SITE_BASE;
    if (p === SITE_BASE || p === SITE_BASE + "/index.html") return SITE_BASE;
    if (p.indexOf(SITE_BASE + "/") === 0) return p;
    if (p.charAt(0) === "/" && p.indexOf(SITE_BASE) !== 0) {
      return SITE_BASE + p;
    }
    return p;
  }

  function initNavActive() {
    var path = comparablePath(window.location.pathname);
    document.querySelectorAll("[data-nav-root] .nav-link").forEach(function (link) {
      link.removeAttribute("aria-current");
      link.classList.remove("is-active");
    });
    document.querySelectorAll("[data-nav-root] .nav-link").forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href) return;
      if (href.indexOf("#") === 0) return;
      try {
        var u = new URL(href, window.location.href);
        var p = comparablePath(u.pathname);
        if (p === path) {
          link.setAttribute("aria-current", "page");
        }
      } catch (e) {
        /* ignore */
      }
    });
  }

  function initScrollSpy() {
    var navRoot = document.querySelector("[data-scroll-spy]");
    if (!navRoot || !window.IntersectionObserver) return;
    var sections = document.querySelectorAll("[data-section-id]");
    if (!sections.length) return;
    var navLinks = navRoot.querySelectorAll("[data-scroll-for]");
    function highlight(id) {
      if (!id) return;
      navLinks.forEach(function (lnk) {
        lnk.classList.remove("is-active");
        lnk.removeAttribute("aria-current");
        if (lnk.getAttribute("data-scroll-for") === id) {
          lnk.classList.add("is-active");
          lnk.setAttribute("aria-current", "page");
        }
      });
    }
    var obs = new IntersectionObserver(
      function (entries) {
        var hit = Array.prototype.slice
          .call(entries)
          .filter(function (e) {
            return e.isIntersecting;
          })
          .sort(function (a, b) {
            return (b.intersectionRatio || 0) - (a.intersectionRatio || 0);
          });
        if (!hit.length) return;
        var id = hit[0].target.getAttribute("data-section-id");
        highlight(id);
      },
      { rootMargin: "-10% 0px -52% 0px", threshold: [0, 0.12, 0.28, 0.45] }
    );
    sections.forEach(function (sec) {
      obs.observe(sec);
    });
    window.requestAnimationFrame(function () {
      if (window.scrollY < 120) highlight("home");
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (!id || id === "#") return;
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  function animateCounter(el, end, duration, suffix) {
    suffix = suffix || "";
    var start = performance.now();
    function update(time) {
      var progress = Math.min((time - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * end) + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = end + suffix;
      }
    }
    requestAnimationFrame(update);
  }

  function initHeroCounters() {
    var stats = document.querySelector("[data-hero-stats]");
    if (!stats) return;
    var done = false;
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || done) return;
          done = true;
          var c35 = document.querySelector("[data-count='35']");
          var c500 = document.querySelector("[data-count='500']");
          var c4 = document.querySelector("[data-count='4']");
          if (c35) animateCounter(c35, 35, 2000, "+");
          if (c500) animateCounter(c500, 500, 2000, "+");
          if (c4) animateCounter(c4, 4, 1500, "");
          obs.disconnect();
        });
      },
      { threshold: 0.2 }
    );
    obs.observe(stats);
  }

  function initScrollIndicator() {
    var el = document.querySelector(".hero__scroll");
    if (!el) return;
    function onScroll() {
      if (window.scrollY > 40) {
        el.classList.add("is-hidden");
      } else {
        el.classList.remove("is-hidden");
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initProjectFilters() {
    var root = document.querySelector("[data-project-filters]");
    if (!root) return;
    var tabs = root.querySelectorAll("[data-filter-tab]");
    var cards = root.querySelectorAll("[data-project-card]");

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var cat = tab.getAttribute("data-filter") || "all";
        tabs.forEach(function (t) {
          var active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", active ? "true" : "false");
        });

        cards.forEach(function (card, i) {
          var c = card.getAttribute("data-category") || "";
          var show = cat === "all" || c === cat;
          card.style.transition = "opacity 0.3s ease, transform 0.3s ease";
          if (!show) {
            card.style.opacity = "0";
            card.style.transform = "scale(0.95)";
            window.setTimeout(function () {
              card.classList.add("is-hidden");
            }, 280);
          } else {
            card.classList.remove("is-hidden");
            card.style.opacity = "0";
            card.style.transform = "scale(0.95)";
            window.requestAnimationFrame(function () {
              window.setTimeout(function () {
                card.style.opacity = "1";
                card.style.transform = "scale(1)";
              }, 30 + i * 45);
            });
          }
        });
      });
    });
  }

  function initContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;
    var loader = document.querySelector("[data-form-loader]");
    var success = document.querySelector("[data-form-success]");

    function showError(input, msg) {
      var desc = input.getAttribute("aria-describedby");
      var errId = desc ? desc.trim().split(/\s+/)[0] : null;
      var err = errId ? document.getElementById(errId) : null;
      if (err) {
        err.textContent = msg || "";
      }
      input.setAttribute("aria-invalid", msg ? "true" : "false");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      var name = form.querySelector("#contact-name");
      var email = form.querySelector("#contact-email");
      var phone = form.querySelector("#contact-phone");
      var tipo = form.querySelector("#contact-tipo");
      var msg = form.querySelector("#contact-message");
      var privacy = form.querySelector("#contact-privacy");

      if (name && !name.value.trim()) {
        showError(name, "Inserisci nome e cognome.");
        valid = false;
      } else if (name) showError(name, "");

      if (email) {
        var em = email.value.trim();
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!em) {
          showError(email, "Inserisci un indirizzo email.");
          valid = false;
        } else if (!re.test(em)) {
          showError(email, "Inserisci un indirizzo email valido.");
          valid = false;
        } else {
          showError(email, "");
        }
      }

      if (tipo && !tipo.value) {
        showError(tipo, "Seleziona il tipo di lavoro.");
        valid = false;
      } else if (tipo) showError(tipo, "");

      if (msg && !msg.value.trim()) {
        showError(msg, "Scrivi un messaggio.");
        valid = false;
      } else if (msg) showError(msg, "");

      if (privacy && !privacy.checked) {
        var privacyErr = document.getElementById("error-privacy");
        if (privacyErr) privacyErr.textContent = "Devi accettare l'informativa privacy.";
        privacy.setAttribute("aria-invalid", "true");
        valid = false;
      } else if (privacy) {
        var privacyErr2 = document.getElementById("error-privacy");
        if (privacyErr2) privacyErr2.textContent = "";
        privacy.setAttribute("aria-invalid", "false");
      }

      if (!valid) return;

      if (loader) loader.classList.add("is-visible");
      form.querySelectorAll("button[type='submit']").forEach(function (b) {
        b.disabled = true;
      });

      var subject =
        "Richiesta dal sito — " +
        (name ? name.value.trim() : "") +
        " — " +
        (tipo ? tipo.value : "");
      var body =
        "Nome: " +
        (name ? name.value.trim() : "") +
        "\nEmail: " +
        (email ? email.value.trim() : "") +
        "\nTelefono: " +
        (phone && phone.value ? phone.value.trim() : "—") +
        "\nTipo lavoro: " +
        (tipo ? tipo.value : "") +
        "\n\nMessaggio:\n" +
        (msg ? msg.value.trim() : "");

      var mailto =
        "mailto:edilcostruzioni.srl1@tiscali.it?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);

      window.setTimeout(function () {
        safe(function () {
          window.location.href = mailto;
        });
        if (loader) loader.classList.remove("is-visible");
        form.style.display = "none";
        if (success) {
          success.classList.add("is-visible");
          success.setAttribute("tabindex", "-1");
          success.focus();
        }
      }, 900);
    });
  }

  function initCookieBanner() {
    var banner = document.querySelector("[data-cookie-banner]");
    if (!banner) return;
    try {
      if (sessionStorage.getItem(COOKIE_KEY)) {
        banner.classList.add("is-hidden");
        return;
      }
    } catch (e) {
      /* show banner */
    }

    function hide() {
      banner.classList.add("is-hidden");
      try {
        sessionStorage.setItem(COOKIE_KEY, "1");
      } catch (e) {
        /* ignore */
      }
    }

    var accept = banner.querySelector("[data-cookie-accept]");
    var dismiss = banner.querySelector("[data-cookie-dismiss]");
    if (accept) accept.addEventListener("click", hide);
    if (dismiss) dismiss.addEventListener("click", hide);
  }

  function initModals() {
    document.querySelectorAll("[data-modal-open]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var id = btn.getAttribute("data-modal-open");
        var modal = id ? document.getElementById(id) : null;
        if (!modal) return;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        var prev = document.activeElement;
        var closeBtn = modal.querySelector("[data-modal-close]");
        if (closeBtn) closeBtn.focus();

        function close() {
          modal.classList.remove("is-open");
          modal.setAttribute("aria-hidden", "true");
          document.body.style.overflow = "";
          document.removeEventListener("keydown", onKeyDoc);
          modal.removeEventListener("click", onBackdrop);
          closeBtns.forEach(function (c) {
            c.removeEventListener("click", onCloseClick);
          });
          if (prev && prev.focus) prev.focus();
        }

        function onKeyDoc(ev) {
          if (ev.key === "Escape") close();
        }

        function onBackdrop(ev) {
          if (ev.target === modal) close();
        }

        function onCloseClick(ev) {
          ev.preventDefault();
          close();
        }

        var closeBtns = modal.querySelectorAll("[data-modal-close]");
        document.addEventListener("keydown", onKeyDoc);
        modal.addEventListener("click", onBackdrop);
        closeBtns.forEach(function (c) {
          c.addEventListener("click", onCloseClick);
        });
      });
    });
  }

  function boot() {
    initLucide();
    initTheme();
    initHeaderScroll();
    initMobileMenu();
    initNavActive();
    initScrollSpy();
    initSmoothScroll();
    initHeroCounters();
    initScrollIndicator();
    initProjectFilters();
    initContactForm();
    initCookieBanner();
    initModals();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
