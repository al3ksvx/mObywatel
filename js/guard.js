(function () {
  /** Ustaw na true tylko tymczasowo (dev) — wylacza ekran „Zainstaluj jako PWA”. */
  var PWA_GUARD_TEMPORARILY_DISABLED = false;
  var PWA_GUARD_BYPASS_KEY = "pwa-guard-bypass";

  function initGuard() {
    var blocker = document.getElementById("jsGuard");
    if (!blocker) return;
    var card = blocker.querySelector(".guard-card") || blocker;
    var themeToggle = null;
    var THEME_KEY = "theme-preference";

    function getCurrentTheme() {
      var attr = "";
      try {
        attr = document.documentElement.getAttribute("data-theme") || "";
      } catch (_) {}
      if (attr === "dark" || attr === "light") return attr;
      try {
        var stored = localStorage.getItem(THEME_KEY);
        if (stored === "dark" || stored === "light") return stored;
      } catch (_) {}
      return "light";
    }

    function applyTheme(mode) {
      var resolved = mode === "dark" ? "dark" : "light";
      try {
        document.documentElement.setAttribute("data-theme", resolved);
      } catch (_) {}
      try {
        localStorage.setItem(THEME_KEY, resolved);
      } catch (_) {}
      if (window.Theme && typeof window.Theme.setMode === "function") {
        window.Theme.setMode(resolved);
      }
      updateThemeToggle();
    }

    function syncTheme(mode) {
      var resolved = mode === "dark" ? "dark" : "light";
      if (window.Theme && typeof window.Theme.apply === "function") {
        window.Theme.apply(resolved);
      } else {
        try {
          document.documentElement.setAttribute("data-theme", resolved);
        } catch (_) {}
      }
      updateThemeToggle();
    }

    function updateThemeToggle() {
      if (!themeToggle) return;
      var mode = getCurrentTheme();
      themeToggle.textContent =
        mode === "dark" ? "Tryb: Ciemny" : "Tryb: Jasny";
      themeToggle.setAttribute("aria-pressed", mode === "dark");
    }

    function ensureThemeToggle() {
      if (themeToggle) return;
      themeToggle = document.createElement("button");
      themeToggle.type = "button";
      themeToggle.className = "guard-theme-toggle";
      themeToggle.addEventListener("click", function () {
        var next = getCurrentTheme() === "dark" ? "light" : "dark";
        applyTheme(next);
      });
      blocker.appendChild(themeToggle);
      updateThemeToggle();
    }

    var deferredInstallPrompt = null;
    var originalDocumentTitle = document.title;

    window.addEventListener("beforeinstallprompt", function (event) {
      event.preventDefault();
      deferredInstallPrompt = event;
      updateInstallUiState();
    });

    window.addEventListener("appinstalled", function () {
      deferredInstallPrompt = null;
      cachedStandaloneResult = null;
      setInstallStatus(
        "Aplikacja zostala zainstalowana. Otworz ja z ekranu glownego.",
        false,
      );
      updateInstallUiState();
      updateBlocker();
    });

    function isDesktopDevice() {
      try {
        if (
          window.matchMedia &&
          window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches
        ) {
          return true;
        }
      } catch (_) {}
      return (
        window.innerWidth > 1024 ||
        (!("ontouchstart" in window) && navigator.maxTouchPoints === 0) ||
        screen.width > 1200
      );
    }

    function isMobileDevice() {
      return !isDesktopDevice();
    }

    var guardLogoMarkup =
      '<img class="guard-icon-logo" src="/assets/logo.jpeg" alt="" width="72" height="72" decoding="async" />';

    function ensureCfBlockStyles() {
      if (document.getElementById("cf-errors-css")) {
        return;
      }
      var link = document.createElement("link");
      link.id = "cf-errors-css";
      link.rel = "stylesheet";
      link.href = "/assets/cf.errors.css";
      document.head.appendChild(link);
    }

    function generateRayId() {
      var chars = "0123456789abcdef";
      var id = "";
      for (var i = 0; i < 16; i += 1) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return id;
    }

    function generateBlockedIp() {
      var hex = "0123456789abcdef";
      function part(len) {
        var out = "";
        for (var i = 0; i < len; i += 1) {
          out += hex.charAt(Math.floor(Math.random() * hex.length));
        }
        return out;
      }
      return (
        "2001:" +
        part(3) +
        ":" +
        part(4) +
        ":" +
        part(4) +
        ":" +
        part(1) +
        ":" +
        part(4) +
        ":0:" +
        part(2)
      );
    }

    function buildDesktopBlockedTemplate() {
      var hostname = window.location.hostname || "sobywatel.cc";
      var rayId = generateRayId();
      var blockedIp = generateBlockedIp();

      return (
        '<div id="cf-wrapper">' +
        '<div class="cf-alert cf-alert-error cf-cookie-error" id="cookie-alert">Please enable cookies.</div>' +
        '<div id="cf-error-details" class="cf-error-details-wrapper">' +
        '<div class="cf-wrapper cf-header cf-error-overview">' +
        '<h1>Sorry, you have been blocked</h1>' +
        '<h2 class="cf-subheadline"><span>You are unable to access</span> ' +
        hostname +
        "</h2>" +
        "</div>" +
        '<div class="cf-section cf-highlight">' +
        '<div class="cf-wrapper">' +
        '<div class="cf-screenshot-container cf-screenshot-full">' +
        '<span class="cf-no-screenshot error"></span>' +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="cf-section cf-wrapper">' +
        '<div class="cf-columns two">' +
        '<div class="cf-column">' +
        "<h2>Why have I been blocked?</h2>" +
        "<p>This website is using a security service to protect itself from online attacks. The action you just performed triggered the security solution. There are several actions that could trigger this block including submitting a certain word or phrase, a SQL command or malformed data.</p>" +
        "</div>" +
        '<div class="cf-column">' +
        "<h2>What can I do to resolve this?</h2>" +
        "<p>You can email the site owner to let them know you were blocked. Please include what you were doing when this page came up and the Cloudflare Ray ID found at the bottom of this page.</p>" +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="cf-error-footer cf-wrapper w-240 lg:w-full py-10 sm:py-4 sm:px-8 mx-auto text-center sm:text-left border-solid border-0 border-t border-gray-300">' +
        '<p class="text-13">' +
        '<span class="cf-footer-item sm:block sm:mb-1">Cloudflare Ray ID: <strong class="font-semibold">' +
        rayId +
        "</strong></span>" +
        '<span class="cf-footer-separator sm:hidden">&bull;</span>' +
        '<span id="cf-footer-item-ip" class="cf-footer-item hidden sm:block sm:mb-1">' +
        "Your IP: " +
        '<button type="button" id="cf-footer-ip-reveal" class="cf-footer-ip-reveal-btn">Click to reveal</button>' +
        '<span class="hidden" id="cf-footer-ip">' +
        blockedIp +
        "</span>" +
        '<span class="cf-footer-separator sm:hidden">&bull;</span>' +
        "</span>" +
        '<span class="cf-footer-item sm:block sm:mb-1"><span>Performance &amp; security by</span> <a rel="noopener noreferrer" href="https://www.cloudflare.com/5xx-error-landing" id="brand_link" target="_blank">Cloudflare</a></span>' +
        "</p>" +
        "</div>" +
        "</div>" +
        "</div>"
      );
    }

    function bindCfFooterActions() {
      var ipWrap = blocker.querySelector("#cf-footer-item-ip");
      var revealBtn = blocker.querySelector("#cf-footer-ip-reveal");
      var ipValue = blocker.querySelector("#cf-footer-ip");
      if (!ipWrap || !revealBtn || !ipValue) {
        return;
      }

      ipWrap.classList.remove("hidden");

      revealBtn.addEventListener("click", function () {
        revealBtn.classList.add("hidden");
        ipValue.classList.remove("hidden");
      });
    }

    var templates = {
      pwa:
        '<div class="guard-content">' +
        '<div class="guard-hero">' +
        '<div class="guard-icon" aria-hidden="true">' +
        guardLogoMarkup +
        "</div>" +
        '<span class="guard-badge">Wymagana instalacja</span>' +
        "</div>" +
        '<h1 class="guard-title">Zainstaluj aplikacje jako PWA</h1>' +
        '<p class="guard-text">Aplikacja dziala tylko w trybie standalone. Dodaj ja do ekranu glownego, aby kontynuowac.</p>' +
        '<div class="guard-actions">' +
        '<button type="button" class="guard-install-btn" id="guardInstallBtn">' +
        '<span class="guard-install-btn-label">Zainstaluj aplikacje</span>' +
        "</button>" +
        '<p class="guard-install-message" id="guardInstallMessage" role="status" aria-live="polite"></p>' +
        "</div>" +
        '<details class="guard-help" id="guardInstallHelp">' +
        "<summary><span class=\"guard-help-summary-label\"><span>Instrukcja awaryjna</span> <span class=\"guard-help-expand\">rozwiń</span></span></summary>" +
        '<p class="guard-help-lead">Gdy przycisk instalacji nie zadziala, wykonaj ponizsze kroki recznie.</p>' +
        '<div class="guard-columns">' +
        '<section class="guard-section">' +
        '<span class="guard-platform">iOS</span>' +
        "<h2>Safari</h2>" +
        "<ol>" +
        "<li>Otworz strone w Safari.</li>" +
        "<li>Wcisnij przycisk Udostepnij.</li>" +
        '<li>Wybierz "Dodaj do ekranu poczatkowego".</li>' +
        "<li>Potwierdz dodanie.</li>" +
        "</ol>" +
        "</section>" +
        '<section class="guard-section">' +
        '<span class="guard-platform">Android</span>' +
        "<h2>Chrome</h2>" +
        "<ol>" +
        "<li>Otworz strone w Chrome.</li>" +
        "<li>Otworz menu (trzy kropki).</li>" +
        '<li>Wybierz "Dodaj do ekranu glownego".</li>' +
        "<li>Potwierdz instalacje.</li>" +
        "</ol>" +
        "</section>" +
        "</div>" +
        "</details>" +
        "</div>",
    };

    function setInstallStatus(text, isError) {
      var msg = blocker.querySelector("#guardInstallMessage");
      if (!msg) return;
      msg.textContent = text || "";
      msg.classList.toggle("is-error", !!isError);
    }

    function updateInstallUiState() {
      var installBtn = blocker.querySelector("#guardInstallBtn");
      if (!installBtn) return;
      var disabled = !deferredInstallPrompt;
      installBtn.disabled = disabled;
      installBtn.setAttribute("aria-disabled", disabled ? "true" : "false");
    }

    function expandFallbackHelp() {
      var help = blocker.querySelector("#guardInstallHelp");
      if (!help) return;
      help.open = true;
    }

    function bindInstallActions() {
      var installBtn = blocker.querySelector("#guardInstallBtn");
      if (!installBtn) return;

      installBtn.addEventListener("click", function () {
        if (!deferredInstallPrompt) {
          setInstallStatus(
            "Nie udalo sie uruchomic instalacji. Uzyj instrukcji awaryjnej.",
            true,
          );
          expandFallbackHelp();
          return;
        }

        setInstallStatus(
          "Uruchomiono instalacje. Potwierdz w oknie przegladarki.",
          false,
        );
        var pendingPrompt = deferredInstallPrompt;
        deferredInstallPrompt = null;
        updateInstallUiState();

        pendingPrompt.prompt();
        pendingPrompt.userChoice
          .then(function (choiceResult) {
            if (choiceResult && choiceResult.outcome === "accepted") {
              setInstallStatus("Aplikacja zostala zainstalowana.", false);
              return;
            }
            setInstallStatus(
              "Instalacja anulowana. Mozesz sprobowac ponownie.",
              true,
            );
            expandFallbackHelp();
          })
          .catch(function () {
            setInstallStatus(
              "Nie udalo sie pokazac instalacji. Uzyj instrukcji awaryjnej.",
              true,
            );
            expandFallbackHelp();
          });
      });

      updateInstallUiState();
    }

    function setMode(mode) {
      if (!card) return;
      blocker.classList.add("guard-fullscreen");
      blocker.classList.remove("guard-desktop-blocked");

      if (mode === "desktop-blocked") {
        ensureCfBlockStyles();
        blocker.classList.add("guard-desktop-blocked");
        document.title = "Attention Required! | Cloudflare";
        card.innerHTML = buildDesktopBlockedTemplate();
        bindCfFooterActions();
        return;
      }

      document.title = originalDocumentTitle;

      card.innerHTML = templates.pwa;
      bindInstallActions();
    }

    function show(mode) {
      ensureThemeToggle();
      setMode(mode);
      if (themeToggle) {
        themeToggle.style.display =
          mode === "desktop-blocked" ? "none" : "";
      }
      blocker.hidden = false;
      blocker.style.display = "flex";
      if (document.body && document.body.classList) {
        document.body.classList.add("guard-active");
      }
    }

    function hide() {
      blocker.hidden = true;
      blocker.style.display = "none";
      if (themeToggle) {
        themeToggle.style.display = "";
      }
      if (document.body && document.body.classList) {
        document.body.classList.remove("guard-active");
      }
    }

    var cachedStandaloneResult = null;

    function isStandalone() {
      if (cachedStandaloneResult !== null) {
        return cachedStandaloneResult;
      }

      try {
        if (window.navigator && window.navigator.standalone === true) {
          cachedStandaloneResult = true;
          return true;
        }

        if (window.matchMedia) {
          var mq = window.matchMedia("(display-mode: standalone)");
          if (mq && mq.matches) {
            cachedStandaloneResult = true;
            return true;
          }
        }

        cachedStandaloneResult = false;
        return false;
      } catch (_) {
        cachedStandaloneResult = true;
        return true;
      }
    }

    function isPwaBypassed() {
      try {
        return sessionStorage.getItem(PWA_GUARD_BYPASS_KEY) === "1";
      } catch (_) {
        return false;
      }
    }

    function setPwaBypass(enabled) {
      try {
        if (enabled) {
          sessionStorage.setItem(PWA_GUARD_BYPASS_KEY, "1");
          document.documentElement.setAttribute("data-allow-browser", "");
        } else {
          sessionStorage.removeItem(PWA_GUARD_BYPASS_KEY);
          document.documentElement.removeAttribute("data-allow-browser");
        }
      } catch (_) {}
      updateBlocker();
    }

    function allowBrowser() {
      if (isPwaBypassed()) {
        return true;
      }

      if (document.documentElement.hasAttribute("data-allow-browser")) {
        return true;
      }

      try {
        var urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("allowbrowser") === "true") {
          return true;
        }
      } catch (_) {}

      return false;
    }

    if (isPwaBypassed()) {
      try {
        document.documentElement.setAttribute("data-allow-browser", "");
      } catch (_) {}
    }

    var updateBlockerInProgress = false;
    var lastUpdateBlockerTime = 0;
    var updateBlockerTimeout = null;
    var guardWasBlocking = null;
    var accessGrantedCallbacks = [];

    function isGuardBlocking() {
      if (PWA_GUARD_TEMPORARILY_DISABLED) {
        return false;
      }
      if (allowBrowser()) {
        return false;
      }
      if (isDesktopDevice()) {
        return true;
      }
      return !isStandalone();
    }

    function flushAccessGrantedCallbacks() {
      var callbacks = accessGrantedCallbacks.slice();
      accessGrantedCallbacks = [];
      callbacks.forEach(function (callback) {
        try {
          callback();
        } catch (_) {}
      });
    }

    function notifyAccessGrantedIfNeeded() {
      var blocking = isGuardBlocking();
      if (guardWasBlocking === null) {
        guardWasBlocking = blocking;
        if (!blocking) {
          flushAccessGrantedCallbacks();
        }
        return;
      }
      if (guardWasBlocking && !blocking) {
        flushAccessGrantedCallbacks();
      }
      guardWasBlocking = blocking;
    }

    function onAccessGranted(callback) {
      if (typeof callback !== "function") {
        return;
      }
      if (!isGuardBlocking()) {
        callback();
        return;
      }
      accessGrantedCallbacks.push(callback);
    }

    function updateBlocker() {
      if (updateBlockerInProgress) {
        return;
      }

      var now = Date.now();
      if (now - lastUpdateBlockerTime < 500) {
        if (updateBlockerTimeout) {
          clearTimeout(updateBlockerTimeout);
        }
        updateBlockerTimeout = setTimeout(updateBlocker, 500);
        return;
      }
      lastUpdateBlockerTime = now;

      updateBlockerInProgress = true;

      try {
        if (PWA_GUARD_TEMPORARILY_DISABLED) {
          hide();
          return;
        }
        if (isDesktopDevice() && !allowBrowser()) {
          show("desktop-blocked");
          return;
        }
        if (!allowBrowser() && !isStandalone()) {
          show("pwa");
          return;
        }
        hide();
      } finally {
        updateBlockerInProgress = false;
        notifyAccessGrantedIfNeeded();
      }
    }

    window.GuardApi = {
      setPwaBypass: setPwaBypass,
      isPwaBypassed: isPwaBypassed,
      isGuardBlocking: isGuardBlocking,
      isStandalone: isStandalone,
      isDesktopDevice: isDesktopDevice,
      isMobileDevice: isMobileDevice,
      onAccessGranted: onAccessGranted,
      refresh: updateBlocker,
    };

    window.addEventListener("load", function () {
      updateBlocker();
    });

    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        function () {
          setTimeout(updateBlocker, 100);
        },
        { once: true },
      );
    } else {
      setTimeout(updateBlocker, 100);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGuard, { once: true });
  } else {
    initGuard();
  }
})();

(function () {
  document.addEventListener(
    "contextmenu",
    function (e) {
      if (e.target.tagName === "IMG") {
        e.preventDefault();
        return false;
      }
    },
    { passive: false },
  );

  var style = document.createElement("style");
  style.textContent =
    "* { " +
    "-webkit-touch-callout: none !important; " +
    "-webkit-user-select: none !important; " +
    "-moz-user-select: none !important; " +
    "-ms-user-select: none !important; " +
    "user-select: none !important; " +
    "} " +
    "img { " +
    "-webkit-user-drag: none !important; " +
    "} " +
    "input, textarea { " +
    "-webkit-user-select: text !important; " +
    "-moz-user-select: text !important; " +
    "-ms-user-select: text !important; " +
    "user-select: text !important; " +
    "}";
  document.head.appendChild(style);
})();
