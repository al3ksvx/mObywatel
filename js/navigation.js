document.addEventListener("DOMContentLoaded", () => {
  try {
    if (window.Theme && typeof window.Theme.apply === "function") {
      window.Theme.apply(window.Theme.getMode());
    }
  } catch (_) {}

  if (!("serviceWorker" in navigator)) {
    return;
  }

  if (window.location.protocol === "file:") {
    return;
  }

  var hadControllerOnLoad = !!navigator.serviceWorker.controller;
  var isReloadingForUpdate = false;

  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/sw.js?v=100")
      .then(function (registration) {
        registration.update();
        if (registration.waiting && hadControllerOnLoad) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      })
      .catch(() => undefined);

    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (!hadControllerOnLoad || isReloadingForUpdate) return;
      isReloadingForUpdate = true;
      window.location.reload();
    });
  });
});
