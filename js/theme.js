(function () {
  var STORAGE_KEY = "theme-preference";

  function getStoredMode() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return null;
    }
  }

  function saveMode(mode) {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (_) {}
  }

  function systemPrefersDark() {
    try {
      return (
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    } catch (_) {
      return false;
    }
  }

  function resolveMode(mode) {
    if (mode === "dark" || mode === "light") return mode;
    return systemPrefersDark() ? "dark" : "light";
  }

  function ensureMeta(name, initialContent) {
    var el = document.querySelector('meta[name="' + name + '"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", name);
      if (initialContent) el.setAttribute("content", initialContent);
      document.head.appendChild(el);
    }
    return el;
  }

  function applyTheme(mode) {
    var resolved = resolveMode(mode);
    var html = document.documentElement;
    try {
      html.setAttribute("data-theme", resolved);
    } catch (_) {}

    try {
      var colorSchemeMeta = ensureMeta("color-scheme", "light dark");
      colorSchemeMeta.setAttribute("content", "light dark");
      html.style.colorScheme = resolved === "dark" ? "dark" : "light";
    } catch (_) {}

    try {
      var themeMeta = document.querySelector('meta[name="theme-color"]');
      if (!themeMeta)
        themeMeta = ensureMeta(
          "theme-color",
          resolved === "dark" ? "#121212" : "#ffffff"
        );
      themeMeta.setAttribute(
        "content",
        resolved === "dark" ? "#121212" : "#ffffff"
      );
    } catch (_) {}

    try {
      var isDark = resolved === "dark";

      var imgsWithDarkSrc = document.querySelectorAll('img[data-dark-src]');
      Array.prototype.forEach.call(imgsWithDarkSrc, function (img) {
        try {
          if (!img.dataset.srcLight) {
            img.dataset.srcLight = img.getAttribute("src");
          }
          var darkSrc = img.dataset.darkSrc || img.getAttribute("data-dark-src");
          if (!darkSrc) return;
          var target = isDark ? darkSrc : img.dataset.srcLight;
          var current = img.getAttribute("src") || "";
          if (target && target.indexOf('?') === -1) {
            target = target + '';
          }
          if (current !== target && target) {
            img.setAttribute("src", target);
          }
        } catch (_) {}
      });

      try {
        var isIndex = !!document.querySelector(".login");
        if (isIndex) {
          var targets = [document.documentElement, document.body];
          var darkBg =
            "url('assets/icons/coi_common_ui_mobywatel_background_dark.webp')";
          targets.forEach(function (el) {
            if (!el || !el.style || !el.style.setProperty) return;
            if (isDark) {
              try {
                el.style.setProperty("background-image", darkBg, "important");
                el.style.setProperty(
                  "background-position",
                  "center",
                  "important"
                );
                el.style.setProperty("background-size", "cover", "important");
                el.style.setProperty(
                  "background-repeat",
                  "no-repeat",
                  "important"
                );
              } catch (_) {}
            } else {
              try {
                el.style.removeProperty("background-image");
                el.style.removeProperty("background-position");
                el.style.removeProperty("background-size");
                el.style.removeProperty("background-repeat");
              } catch (_) {}
            }
          });
        }
      } catch (_) {}
    } catch (_) {}
  }

  function currentMode() {
    return getStoredMode() || "auto";
  }

  function setMode(mode) {
    saveMode(mode);
    applyTheme(mode);
  }

  try {
    var mql =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    if (mql) {
      var handler = function () {
        if (currentMode() === "auto") applyTheme("auto");
      };
      if (typeof mql.addEventListener === "function")
        mql.addEventListener("change", handler);
      else if (typeof mql.addListener === "function") mql.addListener(handler);
    }
  } catch (_) {}

  try {
    window.addEventListener("storage", function (event) {
      if (event && event.key === STORAGE_KEY) {
        applyTheme(currentMode());
      }
    });
  } catch (_) {}

  try {
    applyTheme(currentMode());
  } catch (_) {}

  try {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function() {
        setTimeout(function() {
          applyTheme(currentMode());
        }, 50);
      }, { once: true });
    } else {
      setTimeout(function() {
        applyTheme(currentMode());
      }, 50);
    }
  } catch (_) {}

  try {
    window.addEventListener("load", function() {
      setTimeout(function() {
        applyTheme(currentMode());
      }, 100);
    }, { once: true });
  } catch (_) {}

  try {
    var markLoaded = function () {
      if (document && document.body && document.body.classList) {
        document.body.classList.add("loaded");
      }
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", markLoaded, { once: true });
    } else {
      markLoaded();
    }
  } catch (_) {}

  try {
    window.Theme = {
      setMode: setMode,
      getMode: currentMode,
      apply: applyTheme,
      KEY: STORAGE_KEY,
    };
  } catch (_) {}
})();
