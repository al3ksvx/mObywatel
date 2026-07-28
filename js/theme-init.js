(function () {
  var STORAGE_KEY = "theme-preference";

  function systemPrefersDark() {
    try {
      return (
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

  function applyEarlyTheme() {
    var stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (_) {}

    var resolved = resolveMode(stored || "auto");
    try {
      document.documentElement.setAttribute("data-theme", resolved);
      document.documentElement.style.colorScheme = resolved;
    } catch (_) {}
  }

  applyEarlyTheme();
})();
