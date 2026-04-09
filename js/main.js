(function () {
  "use strict";

  var SCROLL_THRESHOLD = 80;
  var IO_THRESHOLD = 0.15;

  /* 1. Navbar scroll */
  var nav = document.querySelector("nav.main-nav");
  function updateNavScroll() {
    if (!nav) return;
    if (window.scrollY > SCROLL_THRESHOLD) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", updateNavScroll, { passive: true });
  updateNavScroll();

  /* 2. Hamburger + mobile overlay */
  var hamburger = document.querySelector(".hamburger");
  var mobileOverlay = document.getElementById("mobile-menu-overlay");
  var mobileClose = document.querySelector(".mobile-overlay__close");

  function setMenuOpen(open) {
    if (!mobileOverlay || !hamburger) return;
    mobileOverlay.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    mobileOverlay.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (hamburger && mobileOverlay) {
    hamburger.addEventListener("click", function () {
      var expanded = hamburger.getAttribute("aria-expanded") === "true";
      setMenuOpen(!expanded);
    });
  }

  if (mobileClose && mobileOverlay) {
    mobileClose.addEventListener("click", function () {
      setMenuOpen(false);
    });
  }

  if (mobileOverlay) {
    mobileOverlay.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileOverlay.classList.contains("open")) {
        setMenuOpen(false);
      }
    });
  }

  /* 3. IntersectionObserver reveal */
  if ("IntersectionObserver" in window) {
    var revealEls = document.querySelectorAll(".reveal, .stagger-children");
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: IO_THRESHOLD, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal, .stagger-children").forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* 4. Cookie banner */
  var cookieBanner = document.querySelector(".cookie-banner");
  var cookieAccept = document.querySelector('[data-cookie="accept"]');
  var cookieRefuse = document.querySelector('[data-cookie="refuse"]');

  function initCookieBanner() {
    if (!cookieBanner) return;
    var consent = localStorage.getItem("cookieConsent");
    if (consent) {
      cookieBanner.classList.add("hidden");
      return;
    }
    cookieBanner.classList.remove("hidden");
  }

  if (cookieAccept) {
    cookieAccept.addEventListener("click", function () {
      localStorage.setItem("cookieConsent", "accepted");
      if (cookieBanner) cookieBanner.classList.add("hidden");
    });
  }
  if (cookieRefuse) {
    cookieRefuse.addEventListener("click", function () {
      localStorage.setItem("cookieConsent", "refused");
      if (cookieBanner) cookieBanner.classList.add("hidden");
    });
  }
  initCookieBanner();

  /* 5. Project filters */
  var filterBar = document.querySelector(".filter-bar");
  if (filterBar) {
    var filterBtns = filterBar.querySelectorAll(".filter-btn");
    var projectCards = document.querySelectorAll(".project-card[data-category]");

    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var filter = btn.getAttribute("data-filter");
        filterBtns.forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
        projectCards.forEach(function (card) {
          var cat = card.getAttribute("data-category");
          var show = filter === "all" || cat === filter;
          card.style.transition = "opacity 0.35s ease, transform 0.35s ease";
          if (show) {
            card.classList.remove("is-hidden");
            card.style.opacity = "0";
            card.style.transform = "translateY(10px)";
            window.requestAnimationFrame(function () {
              window.requestAnimationFrame(function () {
                card.style.opacity = "1";
                card.style.transform = "translateY(0)";
              });
            });
          } else {
            card.style.opacity = "0";
            card.style.transform = "translateY(10px)";
            window.setTimeout(function () {
              card.classList.add("is-hidden");
            }, 320);
          }
        });
      });
    });
  }

  /* 6. Smooth scroll for same-page anchors */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* 7. Contact form — validation + Formspree fetch */
  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    var successBox = document.querySelector(".success-message");

    function showFieldError(fieldId, message) {
      var field = document.getElementById(fieldId);
      if (!field) return;
      var group = field.closest(".form-group");
      if (!group) return;
      var el = group.querySelector(".field-error");
      if (el) {
        el.textContent = message;
        el.classList.add("is-visible");
      }
    }

    function clearErrors() {
      contactForm.querySelectorAll(".field-error").forEach(function (el) {
        el.classList.remove("is-visible");
        el.textContent = "";
      });
    }

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors();
      var valid = true;
      var nome = document.getElementById("nome");
      var email = document.getElementById("email");
      var tipo = document.getElementById("tipo-lavoro");
      var messaggio = document.getElementById("messaggio");
      var privacy = document.getElementById("privacy");

      if (nome && !nome.value.trim()) {
        showFieldError("nome", "Inserisci nome e cognome.");
        valid = false;
      }
      if (email && !email.value.trim()) {
        showFieldError("email", "Inserisci un indirizzo email.");
        valid = false;
      } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        showFieldError("email", "Inserisci un indirizzo email valido.");
        valid = false;
      }
      if (tipo && !tipo.value) {
        showFieldError("tipo-lavoro", "Seleziona il tipo di lavoro.");
        valid = false;
      }
      if (messaggio && messaggio.value.trim().length < 10) {
        showFieldError("messaggio", "Il messaggio deve contenere almeno 10 caratteri.");
        valid = false;
      }
      if (privacy && !privacy.checked) {
        showFieldError("privacy", "Devi accettare l'informativa privacy.");
        valid = false;
      }
      if (!valid) return;

      var action = contactForm.getAttribute("action");
      var formData = new FormData(contactForm);

      fetch(action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          if (res.ok) {
            contactForm.style.display = "none";
            if (successBox) {
              successBox.classList.add("is-visible");
            }
          } else {
            return res.json().then(function (data) {
              throw new Error(data.error || "Invio non riuscito");
            });
          }
        })
        .catch(function () {
          showFieldError("messaggio", "Impossibile inviare il messaggio. Riprova più tardi o contattaci telefonicamente.");
        });
    });
  }

  /* 8. Active nav link */
  var path = window.location.pathname;
  var fileName = path.split("/").pop() || "index.html";
  if (fileName === "" || path.endsWith("/")) {
    fileName = "index.html";
  }
  document.querySelectorAll(".nav-links a, .mobile-overlay__nav a").forEach(function (link) {
    var href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#") return;
    var linkFile = href.split("/").pop().split("#")[0];
    if (
      linkFile === fileName ||
      (fileName === "index.html" && (!linkFile || linkFile === "index.html"))
    ) {
      link.classList.add("nav-link--active");
    }
  });

  /* 9. Hero parallax (desktop only; combines with centered vertical align) */
  var heroImg = document.querySelector(".hero-img-float");
  if (heroImg) {
    var ticking = false;
    function parallax() {
      ticking = false;
      if (window.innerWidth < 1024) {
        heroImg.style.transform = "";
        return;
      }
      var y = window.scrollY * 0.15;
      heroImg.style.transform = "translateY(calc(-50% + " + y + "px))";
    }
    function onScrollParallax() {
      if (window.innerWidth < 1024) {
        heroImg.style.transform = "";
        return;
      }
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(parallax);
      }
    }
    window.addEventListener("scroll", onScrollParallax, { passive: true });
    window.addEventListener(
      "resize",
      function () {
        if (window.innerWidth < 1024) heroImg.style.transform = "";
      },
      { passive: true }
    );
    heroImg.classList.add("is-parallax");
  }

  /* Select floating label helper */
  var tipoSelect = document.getElementById("tipo-lavoro");
  if (tipoSelect) {
    function updateSelectLabel() {
      var fg = tipoSelect.closest(".form-group--select");
      var lab = fg && fg.querySelector("label");
      if (lab) {
        lab.classList.toggle("is-float", tipoSelect.value !== "");
      }
    }
    tipoSelect.addEventListener("change", updateSelectLabel);
    updateSelectLabel();
  }
})();
