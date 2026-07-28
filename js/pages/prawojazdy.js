(async function preloadBackgroundImage() {
  try {
    if (!('caches' in window)) {
      return;
    }
    
    const bgUrl = "/assets/dowod/mid_background_main.webp";
    const cache = await caches.open("mobywatel-v3");

    const cached = await cache.match(bgUrl);
    if (cached) {
      return;
    }


    const img = new Image();
    img.decoding = "async";
    img.fetchPriority = "high";

    img.onload = async function () {
      try {
        const response = await fetch(bgUrl);
        if (response.ok) {
          await cache.put(bgUrl, response);
        }
      } catch (_) {}
    };

    img.onerror = function() {
    };

    img.src = bgUrl;
  } catch (err) {
  }
})();

async function applyProfileImage() {
  try {
    var profileImage = document.getElementById("profileImage");
    if (!profileImage) return;

    if ('caches' in window) {
      try {
        const cache = await caches.open("profile-images-v1");
        const cachedResponse = await cache.match("profile-image");
        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          const objectURL = URL.createObjectURL(blob);
          profileImage.src = objectURL;
          profileImage.style.opacity = "1";
          return;
        }
      } catch (cacheErr) {
      }
    }


    var stored =
      localStorage.getItem("profileImage") || localStorage.getItem("photo");
    if (stored) {
      profileImage.src = stored;
      profileImage.style.opacity = "1";

      if ('caches' in window) {
        try {
          const cache = await caches.open("profile-images-v1");
          const blob = await fetch(stored).then((r) => r.blob());
          await cache.put(
            "profile-image",
            new Response(blob, {
              headers: { "Content-Type": "image/jpeg" },
            })
          );
        } catch (_) {}
      }
    }
  } catch (_) {}
}

async function updateProfileImage(imageData) {
  try {
    localStorage.setItem("profileImage", imageData);

    if ('caches' in window) {
      try {
        const cache = await caches.open("profile-images-v1");
        const blob = await fetch(imageData).then((r) => r.blob());
        await cache.put(
          "profile-image",
          new Response(blob, {
            headers: { "Content-Type": "image/jpeg" },
          })
        );
      } catch (_) {}
    }

    await applyProfileImage();
  } catch (err) {
  }
}

let cameraStream = null;
let cameraContainerEl = null;
let cameraVideoEl = null;

function closeCamera() {
  try {
    document.body.classList.remove("camera-open");
    document.body.classList.remove("camera-opening");
  } catch (_) {}
  if (cameraStream) {
    try {
      cameraStream.getTracks().forEach(function (track) {
        try {
          track.stop();
        } catch (_) {}
      });
    } catch (_) {}
    cameraStream = null;
  }
  if (cameraVideoEl) {
    try {
      cameraVideoEl.pause();
      cameraVideoEl.srcObject = null;
    } catch (_) {}
  }
  if (cameraContainerEl) {
    try {
      cameraContainerEl.style.display = "none";
    } catch (_) {}
  }
}

async function openCamera() {
  if (!cameraContainerEl)
    cameraContainerEl = document.getElementById("camera-container");
  if (!cameraVideoEl) cameraVideoEl = document.getElementById("camera-view");
  if (!cameraContainerEl || !cameraVideoEl) {
    window.location.href = "qr.html?scan=1";
    return;
  }
  try {
    document.body.classList.add("camera-opening");
    document.body.classList.add("camera-open");
  } catch (_) {}
  try {
    cameraContainerEl.style.display = "block";
  } catch (_) {}

  if (cameraStream) {
    try {
      cameraStream.getTracks().forEach(function (track) {
        try {
          track.stop();
        } catch (_) {}
      });
    } catch (_) {}
    cameraStream = null;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    closeCamera();
    alert("Twoja przegladarka nie wspiera dostepu do aparatu.");
    return;
  }

  try {
    var stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
    } catch (err) {
      console.log("Fallback do podstawowej kamery:", err);
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
    }
    
    if (!stream) {
      throw new Error("Nie udalo sie uzyskac strumienia kamery");
    }
    
    cameraVideoEl.srcObject = stream;
    cameraStream = stream;
    try {
      var playResult = cameraVideoEl.play();
      if (playResult && typeof playResult.then === "function") {
        playResult.catch(() => undefined);
      }
    } catch (_) {}

    var viewport = document.querySelector(".camera-viewport");
    var applyAR = function () {
      if (!viewport) return;
      try {
        var vw = cameraVideoEl.videoWidth || 0;
        var vh = cameraVideoEl.videoHeight || 0;
        if (vw > 0 && vh > 0) {
          var ar = vw / vh;
          if ("aspectRatio" in viewport.style) {
            viewport.style.aspectRatio = String(ar);
          } else {
            var wpx = viewport.clientWidth || window.innerWidth;
            viewport.style.height = Math.round(wpx / ar) + "px";
          }
        }
      } catch (_) {}
    };

    if (cameraVideoEl.readyState >= 1) {
      applyAR();
    } else {
      cameraVideoEl.addEventListener("loadedmetadata", applyAR, { once: true });
    }
  } catch (error) {
    alert(
      "Nie mozna uzyskac dostepu do aparatu. Sprawdz uprawnienia w przegladarce."
    );
    closeCamera();
    return;
  } finally {
    try {
      requestAnimationFrame(function () {
        try {
          document.body.classList.remove("camera-opening");
        } catch (_) {}
      });
    } catch (_) {
      try {
        document.body.classList.remove("camera-opening");
      } catch (_) {}
    }
  }
}

window.addEventListener("load", function () {
  try {
    if (typeof checkInstallation === "function") checkInstallation();
  } catch (e) {}
  applyProfileImage();
});

document.addEventListener("DOMContentLoaded", function () {
  cameraContainerEl = document.getElementById("camera-container");
  cameraVideoEl = document.getElementById("camera-view");
  try {
    window.openCamera = openCamera;
    window.closeCamera = closeCamera;
  } catch (_) {}

  var notificationTimer = null;
  var hideToast = function (restoreDefault) {
    try {
      var n = document.getElementById("notification");
      if (!n) return;
      var textEl = n.querySelector(".notification-text");
      var defaultText = textEl
        ? textEl.getAttribute("data-default") || textEl.textContent
        : n.getAttribute("data-default") || n.textContent;
      if (notificationTimer) {
        clearTimeout(notificationTimer);
        notificationTimer = null;
      }
      try {
        n.classList.remove("show");
      } catch (_) {}
      try {
        n.style.display = "none";
      } catch (_) {}
      if (restoreDefault) {
        if (textEl) textEl.textContent = defaultText || "";
        else n.textContent = defaultText || "";
      }
    } catch (_) {}
  };

  var showToast = function (msg, durationMs, restoreDefault) {
    try {
      var n = document.getElementById("notification");
      if (!n) return;
      var textEl = n.querySelector(".notification-text");
      if (textEl && !textEl.getAttribute("data-default")) {
        try {
          textEl.setAttribute("data-default", textEl.textContent);
        } catch (_) {}
      }
      var defaultText = textEl
        ? textEl.getAttribute("data-default") || textEl.textContent
        : n.getAttribute("data-default") || n.textContent;
      if (!durationMs || durationMs <= 0) durationMs = 5000;
      var willRestore =
        typeof restoreDefault === "undefined" ? !!msg : !!restoreDefault;
      if (msg != null && String(msg).length) {
        if (textEl) textEl.textContent = msg;
        else n.textContent = msg;
      }
      try {
        n.style.display = "block";
      } catch (_) {}
      try {
        n.classList.add("show");
      } catch (_) {}
      if (notificationTimer) {
        clearTimeout(notificationTimer);
        notificationTimer = null;
      }
      notificationTimer = setTimeout(function () {
        hideToast(willRestore);
      }, durationMs);
    } catch (_) {}
  };

  try {
    var closeBtn = document.querySelector("#notification .notification-close");
    if (closeBtn)
      closeBtn.addEventListener("click", function () {
        hideToast(true);
      });
  } catch (_) {}
  applyProfileImage();

  try {
    var border = document.querySelector(".photo-border");
    var profileImage = document.getElementById("profileImage");
    if (border && profileImage) {
      var updateImageSize = function () {
        var rect = border.getBoundingClientRect();
        profileImage.style.width = rect.width + "px";
        profileImage.style.height = rect.height + "px";
      };
      updateImageSize();
      window.addEventListener("resize", updateImageSize);
    }
  } catch (e) {}

  try {
    var scanIcon = document.querySelector(
      '.quick-actions img[src$="ai002_confirm_identity_mini.svg"]'
    );
    if (scanIcon) {
      var scanBtn = scanIcon.closest(".qa-item") || scanIcon;
      scanBtn.style.cursor = "pointer";
      scanBtn.addEventListener("click", function (ev) {
        try {
          ev.preventDefault();
          ev.stopPropagation();
        } catch (_) {}
        if (typeof openCamera === "function") {
          try {
            openCamera();
          } catch (_) {}
        } else {
          window.location.href = "qr.html?scan=1";
        }
      });
    }
  } catch (_) {}

  try {
    var moreOverlay = document.getElementById("more-shortcuts-overlay");
    
    var openMore = function () {
      try {
        document.body.classList.add("camera-open");
      } catch (_) {}
      try {
        document.body.classList.add("no-scroll");
      } catch (_) {}
      if (moreOverlay) moreOverlay.style.display = "block";
    };
    var closeMore = function () {
      if (moreOverlay) moreOverlay.style.display = "none";
      try {
        document.body.classList.remove("camera-open");
      } catch (_) {}
      try {
        document.body.classList.remove("no-scroll");
      } catch (_) {}
    };
    try {
      window.openMoreShortcutsOverlay = openMore;
      window.closeMoreShortcutsOverlay = closeMore;
    } catch (_) {}

    try {
      var moreIcon = document.querySelector(
        '.quick-actions img[src$="ab011_more_vertical.svg"]'
      );
      if (moreIcon) {
        var moreBtn = moreIcon.closest(".qa-item") || moreIcon;
        moreBtn.style.cursor = "pointer";
        moreBtn.addEventListener("click", function (ev) {
          try {
            ev.preventDefault();
            ev.stopPropagation();
          } catch (_) {}
          openMore();
        });
      }
    } catch (_) {}
  } catch (_) {}

  try {
    var up = function (s) {
      if (s == null) return s;
      try {
        return String(s).toLocaleUpperCase("pl");
      } catch (_) {
        return String(s).toUpperCase();
      }
    };
    var formatDateDots = function (val) {
      if (val == null) return val;
      try {
        var s = String(val).trim();
        if (!s) return s;
        var m = s.match(/^(\d{4})[-./](\d{2})[-./](\d{2})$/);
        if (m) {
          var y = m[1],
            mo = m[2],
            d = m[3];
          return d + "." + mo + "." + y;
        }
        m = s.match(/^(\d{2})[-./](\d{2})[-./](\d{4})$/);
        if (m) {
          var d2 = m[1],
            mo2 = m[2],
            y2 = m[3];
          return d2 + "." + mo2 + "." + y2;
        }
        return s.replace(/-/g, ".");
      } catch (_) {
        return val;
      }
    };
    var setText = function (id, value, options) {
      options = options || {};
      var el = document.getElementById(id);
      if (!el) return;
      var formatted = value;
      if (typeof options.formatter === "function")
        formatted = options.formatter(value);
      if (formatted == null) return;
      var text = String(formatted).trim();
      if (!text) return;
      if (options.onlyIfEmpty && String(el.textContent || "").trim()) return;

      if (options.preserveChildren) {
        var elementChildren = Array.prototype.slice
          .call(el.childNodes || [])
          .filter(function (node) {
            return node.nodeType === Node.ELEMENT_NODE;
          });
        el.textContent = text;
        if (elementChildren.length) {
          el.appendChild(document.createTextNode(" "));
          elementChildren.forEach(function (child) {
            el.appendChild(child);
          });
        }
      } else {
        el.textContent = text;
      }
    };

    var EXTRA_MAPPINGS = [
      { id: "lastName", key: "lastName", formatter: up },
      { id: "gender", key: "gender", formatter: up },
      { id: "fatherSurname", key: "fatherSurname", formatter: up },
      { id: "motherSurname", key: "motherSurname", formatter: up },
      { id: "placeOfBirth", key: "placeOfBirth", formatter: up },
      { id: "address", key: "address", formatter: up },
      { id: "postalcode", key: "postalcode" },
      {
        id: "registrationDate",
        key: "registrationDate",
        formatter: formatDateDots,
      },
    ];

    var _renderingExtra = false;
    var renderExtra = function () {
      if (_renderingExtra) return;
      _renderingExtra = true;
      EXTRA_MAPPINGS.forEach(function (item) {
        setText(item.id, localStorage.getItem(item.key), {
          formatter: item.formatter,
        });
      });
      _renderingExtra = false;
    };

    [
      "display-name",
      "display-surname",
      "display-birthDate",
      "display-pesel",
      "display-category",
      "display-expiryDate",
      "display-issueDate",
      "display-blanketStatus",
      "display-documentNumber",
      "display-blanketNumber",
      "display-issuingAuthority",
      "display-restrictions",
    ].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = "Brak danych";
    });

    [
      { id: "display-name", key: "display-name_prawojazdy", formatter: up },
      {
        id: "display-surname",
        key: "display-surname_prawojazdy",
        formatter: up,
      },
      {
        id: "display-birthDate",
        key: "display-birthDate_prawojazdy",
        formatter: formatDateDots,
      },
      {
        id: "display-birthPlace",
        key: "display-birthPlace_prawojazdy",
        formatter: up,
      },
      { id: "display-pesel", key: "display-pesel_prawojazdy", formatter: up },
      {
        id: "display-category",
        key: "display-category_prawojazdy",
        formatter: up,
      },
      {
        id: "display-expiryDate",
        key: "display-expiryDate_prawojazdy",
        formatter: formatDateDots,
      },
      {
        id: "display-issueDate",
        key: "display-issueDate_prawojazdy",
        formatter: formatDateDots,
      },
      {
        id: "display-blanketStatus",
        key: "display-blanketStatus_prawojazdy",
        formatter: up,
      },
      {
        id: "display-documentNumber",
        key: "display-documentNumber_prawojazdy",
        formatter: up,
      },
      {
        id: "display-blanketNumber",
        key: "display-blanketNumber_prawojazdy",
        formatter: up,
      },
      {
        id: "display-issuingAuthority",
        key: "display-issuingAuthority_prawojazdy",
        formatter: up,
      },
      {
        id: "display-restrictions",
        key: "display-restrictions_prawojazdy",
        formatter: up,
      },
    ].forEach(function (item) {
      setText(item.id, localStorage.getItem(item.key), {
        formatter: item.formatter,
      });
    });

    try {
      var generatedAt = localStorage.getItem("pj_generatedAt");
      if (generatedAt) {
        var notifiedKey = "pj_lastNotified";
        var lastNotified = localStorage.getItem(notifiedKey);
        if (generatedAt !== lastNotified) {
          showToast("Dane prawa jazdy wygenerowano", 4000, true);
          localStorage.setItem(notifiedKey, generatedAt);
        }
      }
    } catch (_) {}

    try {
      renderExtra();
      var extraContent = document.getElementById("extra-content");
      if (extraContent && typeof MutationObserver !== "undefined") {
        var mo = new MutationObserver(function (mutations) {
          for (var i = 0; i < mutations.length; i++) {
            var m = mutations[i];
            if (
              !_renderingExtra &&
              m.type === "childList" &&
              m.addedNodes &&
              Array.prototype.some.call(m.addedNodes, function (n) {
                return n && n.nodeType === Node.ELEMENT_NODE;
              })
            ) {
              renderExtra();
              break;
            }
          }
        });
        mo.observe(extraContent, { childList: true, subtree: false });
      }
      var extraToggle = document.getElementById("extra-toggle");
      if (extraToggle) {
        extraToggle.addEventListener("click", function () {
          setTimeout(renderExtra, 0);
        });
      }
    } catch (_) {}

    var userDataRaw = localStorage.getItem("userProfileData");
    if (userDataRaw) {
      try {
        var userData = JSON.parse(userDataRaw);
        [
          { id: "display-name", value: userData.name, formatter: up },
          { id: "display-surname", value: userData.surname, formatter: up },
          {
            id: "display-nationality",
            value: userData.nationality,
            formatter: up,
          },
          {
            id: "display-birthDate",
            value: userData.birthDate,
            formatter: formatDateDots,
          },
          {
            id: "display-birthPlace",
            value: userData.placeOfBirth,
            formatter: up,
          },
          { id: "display-pesel", value: userData.pesel, formatter: up },
        ].forEach(function (item) {
          setText(item.id, item.value, {
            formatter: item.formatter,
            onlyIfEmpty: true,
          });
        });
      } catch (_) {}
    }
  } catch (e) {}

  try {
    var copyToClipboard = function (text, customMsg) {
      if (!text) {
        showToast("Brak danych do skopiowania");
        return;
      }
      var doToast = function () {
        showToast(customMsg || "Skopiowano serię i numer mDowodu");
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(doToast)
          .catch(function () {
            try {
              var ta = document.createElement("textarea");
              ta.value = text;
              ta.style.position = "fixed";
              ta.style.opacity = "0";
              document.body.appendChild(ta);
              ta.focus();
              ta.select();
              document.execCommand("copy");
              document.body.removeChild(ta);
              doToast();
            } catch (e) {}
          });
      } else {
        try {
          var ta2 = document.createElement("textarea");
          ta2.value = text;
          ta2.style.position = "fixed";
          ta2.style.opacity = "0";
          document.body.appendChild(ta2);
          ta2.focus();
          ta2.select();
          document.execCommand("copy");
          document.body.removeChild(ta2);
          doToast();
        } catch (e) {}
      }
    };

    var getText = function (el) {
      if (!el) return "";
      var t = (el.textContent || "")
        .replace(/\s+/g, " ")
        .replace(/Kopiuj/i, "")
        .trim();
      if (!t) {
        try {
          t = String(el.innerText || "")
            .replace(/Kopiuj/i, "")
            .trim();
        } catch (_) {}
      }
      return t;
    };

    var btnMain = document.getElementById("kopiujMain");
    if (btnMain) {
      btnMain.addEventListener("click", function () {
        var t =
          getText(document.getElementById("idSeriesMain")) ||
          localStorage.getItem("md_idSeries") ||
          "";
        copyToClipboard(String(t).trim());
      });
    }

    var btnModal = document.getElementById("kopiuj");
    if (btnModal) {
      btnModal.addEventListener("click", function (ev) {
        ev.stopPropagation();
        var t2 = localStorage.getItem("do_idSeries") || "";
        copyToClipboard(
          String(t2).trim(),
          "Skopiowano serię i numer dowodu osobistego"
        );
      });
      scanBtn.addEventListener("keydown", function (ev) {
        if (!ev) return;
        if (ev.key === "Enter" || ev.key === " ") {
          try {
            ev.preventDefault();
            ev.stopPropagation();
          } catch (_) {}
          if (typeof openCamera === "function") {
            try {
              openCamera();
            } catch (_) {}
          } else {
            window.location.href = "qr.html?scan=1";
          }
        }
      });
    }
  } catch (e) {}

  try {
    var lastUpdateEl = document.getElementById("sukadziwkakurwa");
    var btn = document.getElementById("aktualizuj");
    var pad = function (n) {
      return n < 10 ? "0" + n : "" + n;
    };
    var nowStr = function () {
      var d = new Date();
      return (
        pad(d.getDate()) + "." + pad(d.getMonth() + 1) + "." + d.getFullYear()
      );
    };

    try {
      var saved = localStorage.getItem("lastUpdateDate");
      if (saved && lastUpdateEl) lastUpdateEl.textContent = saved;
    } catch (_) {}

    if (btn && lastUpdateEl) {
      btn.addEventListener("click", function () {
        var v = nowStr();
        lastUpdateEl.textContent = v;
        try {
          localStorage.setItem("lastUpdateDate", v);
        } catch (_) {}

        var n = document.getElementById("notification");
        if (n) {
          showToast(null, 5000, false);
        }
      });
    }
  } catch (e) {}
});

try {
  document.addEventListener("DOMContentLoaded", function () {
    try {
      var backToDashboard = document.querySelector(
        'header.app-header.dowod-header .header-left a.back-link[href$="documents.html"]'
      );
      if (backToDashboard) {
        backToDashboard.addEventListener("click", function (ev) {
          try {
            ev.preventDefault();
            ev.stopPropagation();
          } catch (_) {}
          var href = backToDashboard.getAttribute("href");
          if (document.startViewTransition) {
            try {
              document.startViewTransition(function () {
                window.location.href = href;
              });
              return;
            } catch (_) {}
          }
          try {
            document.body.classList.add("page-fade-out");
          } catch (_) {}
          setTimeout(function () {
            window.location.href = href;
          }, 280);
        });
      }
    } catch (_) {}
  });
} catch (_) {}

const czasEl = document.querySelector(".czas");

function updateClockNow() {
  const now = new Date();
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  const timeString = `Czas: ${pad(now.getHours())}:${pad(
    now.getMinutes()
  )}:${pad(now.getSeconds())} ${pad(now.getDate())}.${pad(
    now.getMonth() + 1
  )}.${now.getFullYear()}`;
  if (czasEl) czasEl.textContent = timeString;
}

if (czasEl) {
  updateClockNow();
  setInterval(updateClockNow, 1000);
}

const lo = document.querySelector("#extra-toggle");
const content = document.querySelector("#extra-content");
const arrow = document.querySelector("#extra-arrow");

var contentinner = content ? content.innerHTML : "";

let isOpen = false;
if (content) content.innerHTML = "";

if (arrow) {
  arrow.src = "assets/icons/ab008_chevron_down.svg";
}
if (lo) lo.style.borderRadius = "12px";

if (lo) {
  lo.addEventListener("click", function () {
    isOpen = !isOpen;
    if (isOpen) {
      lo.style.borderRadius = "12px 12px 0px 0px";
      if (content) content.innerHTML = contentinner;
      if (arrow) {
        arrow.src = "assets/icons/ab007_chevron_up.svg";
      }
    } else {
      lo.style.borderRadius = "12px";
      if (content) content.innerHTML = "";
      if (arrow) {
        arrow.src = "assets/icons/ab008_chevron_down.svg";
      }
    }
  });
}
