(function () {
  function initHologram() {
    const holos = document.querySelectorAll(".holo-back");
    const bases = document.querySelectorAll(".base-back");
    const tops = document.querySelectorAll(".godlo-top");

    if (holos.length === 0) {
      return;
    }

    bases.forEach((base) => {
      base.style.display = "block";
      base.style.opacity = "1";
    });

    tops.forEach((top) => {
      top.style.display = "block";
      top.style.opacity = "1";
    });

    holos.forEach((holo) => {
      holo.style.opacity = "0.7";
      holo.style.backgroundPosition = "center 50%";
    });
  }

  initHologram();

  window.addEventListener("pageshow", function (event) {
    initHologram();
  });

  function handleOrientation(e) {
    let beta = e.beta;
    if (beta === null || typeof beta !== "number" || Number.isNaN(beta)) {
      if (typeof e.gamma === "number" && !Number.isNaN(e.gamma)) {
        beta = e.gamma;
      } else {
        return;
      }
    }

    const holos = document.querySelectorAll(".holo-back");

    let t = Math.sin(((beta - 90) * Math.PI) / 180);
    t = Math.abs(t);
    t = Math.pow(t, 0.55);
    t = Math.min(1, t * 1.25);

    let minOpacity = 0.3;
    if (beta >= 60 && beta <= 140) {
      minOpacity = 0.55;
    }
    const opacity = Math.max(minOpacity, t);

    const pos = 100 * t;

    holos.forEach((holo) => {
      holo.style.backgroundPosition = `center ${pos}%`;
      holo.style.opacity = opacity;
    });
  }

  function enableMotionSensor() {
    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener("deviceorientationabsolute", handleOrientation);
  }

  function enableMouseFallback() {
    let active = true;
    const handleMouseMove = function (e) {
      if (!active) return;
      const height = window.innerHeight || 1;
      const ratio = Math.max(0, Math.min(1, e.clientY / height));
      const beta = 180 * (1 - ratio);
      handleOrientation({ beta: beta });
    };

    window.addEventListener("mousemove", handleMouseMove);

    const testOnce = function (e) {
      const hasBeta = e && typeof e.beta === "number" && !Number.isNaN(e.beta);
      const hasGamma =
        e && typeof e.gamma === "number" && !Number.isNaN(e.gamma);

      if (hasBeta || hasGamma) {
        active = false;
        window.removeEventListener("deviceorientation", testOnce);
        window.removeEventListener("deviceorientationabsolute", testOnce);
      } else {
        active = true;
      }
    };
    window.addEventListener("deviceorientation", testOnce, { once: true });
    window.addEventListener("deviceorientationabsolute", testOnce, {
      once: true,
    });
  }

  function enableKeyboardFallback() {
    let active = true;
    let beta = 90;

    const isTypingTarget = function (target) {
      if (!target) return false;
      const tag = (target.tagName || "").toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target.isContentEditable
      );
    };

    const handleKeyDown = function (e) {
      if (!active) return;
      if (isTypingTarget(e.target)) return;

      if (e.key === "ArrowUp") {
        beta = Math.min(180, beta + 8);
        e.preventDefault();
        handleOrientation({ beta: beta });
      } else if (e.key === "ArrowDown") {
        beta = Math.max(0, beta - 8);
        e.preventDefault();
        handleOrientation({ beta: beta });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const testOnce = function (e) {
      const hasBeta = e && typeof e.beta === "number" && !Number.isNaN(e.beta);
      const hasGamma =
        e && typeof e.gamma === "number" && !Number.isNaN(e.gamma);

      if (hasBeta || hasGamma) {
        active = false;
        window.removeEventListener("deviceorientation", testOnce);
        window.removeEventListener("deviceorientationabsolute", testOnce);
      } else {
        active = true;
      }
    };

    window.addEventListener("deviceorientation", testOnce, { once: true });
    window.addEventListener("deviceorientationabsolute", testOnce, {
      once: true,
    });
  }

  enableMotionSensor();
  enableMouseFallback();
  enableKeyboardFallback();
})();
