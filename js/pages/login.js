// --- SYSTEM WŁASNEGO MODALA (Zastępuje domyślne alerty) ---
function showCustomModal(message, title = "Informacja", reloadOnClose = false) {
  const overlay = document.getElementById("customAlertOverlay");
  const titleEl = document.getElementById("customAlertTitle");
  const messageEl = document.getElementById("customAlertMessage");
  const closeBtn = document.getElementById("customAlertCloseBtn");

  if (!overlay) {
    alert(message); // Awaryjny fallback
    return;
  }

  titleEl.textContent = title;
  messageEl.textContent = message;
  overlay.style.display = "flex";

  // Usuwamy stare eventy zapobiegając duplikacji
  const newCloseBtn = closeBtn.cloneNode(true);
  closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

  newCloseBtn.addEventListener("click", function() {
    overlay.style.display = "none";
    if (reloadOnClose) {
      window.location.reload();
    }
  });
}

(function () {
  var lastUpdateTime = 0;
  var updatePending = false;

  function updateVh() {
    try {
      var h =
        (window.visualViewport && window.visualViewport.height) ||
        window.innerHeight ||
        document.documentElement.clientHeight ||
        0;
      if (h > 0) {
        var vh = h * 0.01;
        document.documentElement.style.setProperty("--vh", vh + "px");
      }
    } catch (_) {}
    updatePending = false;
  }

  function rafFix() {
    var now = Date.now();
    if (now - lastUpdateTime < 100) {
      if (!updatePending) {
        updatePending = true;
        setTimeout(function () {
          requestAnimationFrame(function () {
            requestAnimationFrame(updateVh);
          });
          lastUpdateTime = Date.now();
        }, 100);
      }
      return;
    }

    lastUpdateTime = now;
    requestAnimationFrame(function () {
      requestAnimationFrame(updateVh);
    });
  }

  document.addEventListener("DOMContentLoaded", rafFix, { once: true });
  window.addEventListener("pageshow", rafFix);
  window.addEventListener("resize", rafFix);
  window.addEventListener("orientationchange", rafFix);
  try {
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", rafFix);
    }
  } catch (_) {}
  setTimeout(rafFix, 300);
  setTimeout(rafFix, 1000);
})();

try {
  var pi = document.getElementById("passwordInput");
  if (pi) {
    pi.addEventListener("input", function () {
      if ((this.value || "").length > 0) {
        try {
          showPwdError("");
        } catch (_) {
          try {
            var pe = document.getElementById("passwordError");
            if (pe) {
              pe.textContent = "";
              pe.style.display = "none";
              if (pe.classList) pe.classList.remove("warn");
            }
          } catch (_) {}
          if (this.classList) this.classList.remove("input-error");
        }
      }
    });
  }
} catch (_) {}

function resetLocalPassword() {
  try {
    try {
      localStorage.removeItem("userPasswordHash");
    } catch (_) {}
    try {
      sessionStorage.removeItem("userUnlocked");
    } catch (_) {}
    try {
      localStorage.removeItem("biometricCredentialId");
    } catch (_) {}
    try {
      var pi = document.getElementById("passwordInput");
      if (pi) {
        pi.value = "";
        pi.focus();
      }
    } catch (_) {}
    try {
      showPwdError("");
    } catch (_) {}
    try {
      showCustomModal("Hasło zostało zresetowane. Ustaw nowe przy następnym logowaniu.", "Sukces", true);
    } catch (_) {}
  } catch (_) {}
}

function redirectToDashboard() {
  try {
    sessionStorage.setItem("from-login", "true");
  } catch (e) {}
  window.location.href = "documents.html";
}

function showPwdError(msg) {
  try {
    var el = document.getElementById("passwordError");
    if (!el) {
      var f = document.querySelector(".login__forgot");
      if (!f) {
        if (msg) showCustomModal(msg, "Błąd");
        return;
      }
      el = document.createElement("div");
      el.id = "passwordError";
      el.className = "login__error";
      el.style.color = "#b91c1c";
      el.style.margin = "1px 0";
      el.style.display = "none";
      f.parentNode.insertBefore(el, f);
    }
    if (msg) {
      el.textContent = msg;
      try {
        if (msg === "Wpisz hasło." || msg === "Wpisz poprawne hasło.") {
          el.classList.add("warn");
        } else {
          el.classList.remove("warn");
        }
      } catch (_) {}
      el.style.display = "";
    } else {
      el.textContent = "";
      try {
        el.classList.remove("warn");
      } catch (_) {}
      el.style.display = "none";
    }
  } catch (_) {
    if (msg) showCustomModal(msg, "Błąd");
  }
}

function handleLoginSubmit(e) {
  try {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    var input = document.getElementById("passwordInput");
    var pwd = input && input.value ? String(input.value) : "";
    if (!pwd) {
      showPwdError("Wpisz hasło.");
      return;
    }

    var stored = null;
    try {
      stored = localStorage.getItem("userPasswordHash");
    } catch (_) {
      stored = null;
    }

    sha256Hex(pwd)
      .then(async function (h) {
        if (!stored) {
          try {
            localStorage.setItem("userPasswordHash", h);
          } catch (_) {}
          try {
            sessionStorage.setItem("userUnlocked", "1");
          } catch (_) {}
          showPwdError("");
          
          if (window.PublicKeyCredential && !localStorage.getItem("biometricCredentialId")) {
            await registerBiometrics();
          }

          redirectToDashboard();
          return;
        }

        if (stored && stored === h) {
          try {
            sessionStorage.setItem("userUnlocked", "1");
          } catch (_) {}
          showPwdError("");

          if (window.PublicKeyCredential && !localStorage.getItem("biometricCredentialId")) {
            await registerBiometrics();
          }

          redirectToDashboard();
          return;
        }

        showPwdError("Wpisz poprawne hasło.");
      })
      .catch(function (err) {
        showPwdError("Błąd");
      });
  } catch (err) {
    showPwdError("Błąd");
  }
}

window.togglePasswordVisibility = function () {
  const input = document.getElementById("passwordInput");
  const btn = document.querySelector(".login__eye");
  if (!input || !btn) return;
  const icon = btn.querySelector("img");

  if (input.type === "password") {
    input.type = "text";
    input.setAttribute("type", "text");
    input.removeAttribute("autocomplete");
    input.style.setProperty("-webkit-text-security", "none", "important");
    input.style.setProperty("text-security", "none", "important");

    if (icon) {
      icon.src = "assets/icons/hide_password.svg";
      icon.alt = "Ukryj hasło";
    } else {
      btn.innerHTML =
        "<img src='assets/icons/hide_password.svg' alt='Ukryj hasło'>";
    }
    btn.setAttribute("aria-label", "Ukryj hasło");
  } else {
    input.type = "password";
    input.setAttribute("type", "password");
    input.setAttribute("autocomplete", "current-password");
    if (icon) {
      icon.src = "assets/icons/show_password.svg";
      icon.alt = "Pokaż hasło";
    } else {
      btn.innerHTML =
        "<img src='assets/icons/show_password.svg' alt='Pokaż hasło'>";
    }
    btn.setAttribute("aria-label", "Pokaż hasło");
  }
};

window.addEventListener("load", function () {
  try {
    if (typeof checkInstallation === "function") checkInstallation();
  } catch (e) {}
});

document.addEventListener("DOMContentLoaded", function () {
  try {
    var eyeBtn = document.querySelector(".login__eye");
    if (eyeBtn) {
      eyeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (typeof window.togglePasswordVisibility === "function") {
          window.togglePasswordVisibility();
        }
      });
    }
  } catch (err) {}

  try {
    var forgot = document.querySelector(".login__forgot");
    if (forgot) {
      forgot.addEventListener("click", function (e) {
        try {
          if (e && typeof e.preventDefault === "function") e.preventDefault();
        } catch (_) {}
        var doReset = true;
        try {
          doReset = confirm("Zresetować zapisane hasło na tym urządzeniu?");
        } catch (_) {}
        if (doReset) resetLocalPassword();
      });
    }
  } catch (_) {}
});

async function sha256Hex(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const buf = await (window.crypto && crypto.subtle && crypto.subtle.digest
    ? crypto.subtle.digest("SHA-256", data)
    : Promise.resolve(new Uint8Array()));
  const arr = Array.from(new Uint8Array(buf));
  return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

(function () {
  var scheduleId = null;
  var tickId = null;

  function setGreeting() {
    var title = document.querySelector(".login__title");
    if (!title) return;
    var now = new Date();
    var hour = now.getHours();
    var isEvening = hour >= 18 || hour < 6;
    title.textContent = isEvening ? "Dobry wieczór!" : "Dzień dobry!";
  }

  function msUntilNextChange() {
    var now = new Date();
    var next = new Date(now.getTime());
    var h = now.getHours();
    if (h < 6) {
      next.setHours(6, 0, 0, 0);
    } else if (h < 18) {
      next.setHours(18, 0, 0, 0);
    } else {
      next.setDate(next.getDate() + 1);
      next.setHours(6, 0, 0, 0);
    }
    var diff = next.getTime() - now.getTime();
    return Math.max(0, diff) + 500;
  }

  function scheduleNext() {
    if (scheduleId) {
      clearTimeout(scheduleId);
      scheduleId = null;
    }
    scheduleId = setTimeout(function () {
      setGreeting();
      scheduleNext();
    }, msUntilNextChange());
  }

  document.addEventListener("DOMContentLoaded", function () {
    try {
      setGreeting();
      scheduleNext();
      if (tickId) {
        clearInterval(tickId);
      }
      tickId = setInterval(function () {
        try {
          setGreeting();
          scheduleNext();
        } catch (_) {}
      }, 60000);
    } catch (e) {}
  });

  try {
    window.addEventListener("focus", function () {
      try {
        setGreeting();
        scheduleNext();
      } catch (_) {}
    });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
        try {
          setGreeting();
          scheduleNext();
        } catch (_) {}
      }
    });
  } catch (_) {}
})();

(function () {
  function requestMotionPermissionUntilGranted() {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      const form = document.getElementById("loginForm");
      const passwordInput = document.getElementById("passwordInput");

      let granted = false;
      const handleFirstInteraction = function () {
        if (granted) return;

        DeviceOrientationEvent.requestPermission()
          .then((state) => {
            granted = state === "granted";
          })
          .catch(() => undefined);
      };

      if (form) {
        form.addEventListener("click", handleFirstInteraction);
      }
      if (passwordInput) {
        passwordInput.addEventListener("focus", handleFirstInteraction);
      }
    }
  }

  document.addEventListener(
    "DOMContentLoaded",
    requestMotionPermissionUntilGranted,
  );
  window.addEventListener("pageshow", requestMotionPermissionUntilGranted);
})();

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", handleLoginSubmit);
  }
});

// ========================================================
// --- MODUŁ LOGOWANIA BIOMETRYCZNEGO (WebAuthn) ---
// ========================================================

function generateRandomBuffer(length) {
  return window.crypto.getRandomValues(new Uint8Array(length));
}

function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let charCode of bytes) {
    str += String.fromCharCode(charCode);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlToBuffer(base64url) {
  const padding = '='.repeat((4 - base64url.length % 4) % 4);
  const base64 = (base64url + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

async function registerBiometrics() {
  if (!window.PublicKeyCredential) return;

  try {
    const publicKeyCredentialCreationOptions = {
      challenge: generateRandomBuffer(32),
      rp: {
        name: "sObywatel PWA",
      },
      user: {
        id: generateRandomBuffer(16),
        name: "uzytkownik@aplikacja",
        displayName: "Użytkownik Aplikacji"
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" }, 
        { alg: -257, type: "public-key" } 
      ],
      authenticatorSelection: {
        userVerification: "required", 
        authenticatorAttachment: "platform" 
      },
      timeout: 60000,
      attestation: "none"
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    });

    localStorage.setItem("biometricCredentialId", bufferToBase64url(credential.rawId));
    console.log("Biometria pomyślnie zarejestrowana!");
    
  } catch (error) {
    console.error("Błąd podczas rejestracji biometrii:", error);
  }
}

async function loginWithBiometrics() {
  const savedCredentialIdBase64 = localStorage.getItem("biometricCredentialId");
  
  if (!savedCredentialIdBase64) {
    showCustomModal("Brak zapisanego odcisku palca/Face ID na tym urządzeniu. Zaloguj się wpisując hasło, aby powiązać biometrię z Twoim kontem.", "Brak biometrii");
    return;
  }

  try {
    const publicKeyCredentialRequestOptions = {
      challenge: generateRandomBuffer(32),
      allowCredentials: [{
        id: base64urlToBuffer(savedCredentialIdBase64),
        type: "public-key",
        transports: ["internal"]
      }],
      userVerification: "required",
      timeout: 60000
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    });

    if (assertion) {
      sessionStorage.setItem("userUnlocked", "1");
      redirectToDashboard();
    }
  } catch (error) {
    console.error("Błąd logowania:", error);
    showCustomModal("Logowanie biometryczne zostało anulowane lub jest niedostępne na tym urządzeniu.", "Błąd");
  }
}

// ========================================================
// --- LOGIKA PRZEŁĄCZANIA WIDOKÓW (Hasło / Biometria) ---
// ========================================================
document.addEventListener("DOMContentLoaded", function () {
  const passwordView = document.getElementById("passwordView");
  const biometricView = document.getElementById("biometricView");
  
  const submitPasswordBtn = document.getElementById("submitPasswordBtn");
  const switchToPasswordBtn = document.getElementById("switchToPasswordBtn");
  const switchToBiometricBtn = document.getElementById("switchToBiometricBtn");
  
  const logoToPasswordBtn = document.getElementById("logoToPasswordBtn");
  const biometricTapArea = document.getElementById("biometricTapArea");

  const hasBiometricRegistered = localStorage.getItem("biometricCredentialId");

  function showPasswordView() {
    biometricView.style.display = "none";
    switchToPasswordBtn.style.display = "none";
    
    passwordView.style.display = "block";
    submitPasswordBtn.style.display = "block";
    
    // Przycisk powrotu do biometrii jest dostępny tylko, jeśli biometria jest zdefiniowana na urządzeniu
    if (window.PublicKeyCredential && hasBiometricRegistered) {
      switchToBiometricBtn.style.display = "block";
    }
  }

  function showBiometricView() {
    passwordView.style.display = "none";
    submitPasswordBtn.style.display = "none";
    switchToBiometricBtn.style.display = "none";
    
    biometricView.style.display = "flex";
    switchToPasswordBtn.style.display = "block";
  }

  // Zawsze wymuszaj biometrię jako pierwszy ekran aplikacji
  showBiometricView();

  if (biometricTapArea) {
    biometricTapArea.addEventListener("click", loginWithBiometrics);
  }

  if (switchToPasswordBtn) {
    switchToPasswordBtn.addEventListener("click", showPasswordView);
  }

  if (switchToBiometricBtn) {
    switchToBiometricBtn.addEventListener("click", showBiometricView);
  }

  if (logoToPasswordBtn) {
    logoToPasswordBtn.addEventListener("click", function() {
      // Toggle widoków
      if (passwordView.style.display === "block") {
        showBiometricView();
      } else {
        showPasswordView();
      }
    });
  }
});