function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getServiceCardLabel(card) {
  if (!card) return "";
  var labelEl = card.querySelector(".card__left p");
  if (labelEl && labelEl.textContent) {
    return labelEl.textContent.trim();
  }
  var img = card.querySelector(".card__left img");
  if (img && img.alt) {
    return img.alt.trim();
  }
  return "";
}

function initServicesSearch() {
  var pageMain = document.querySelector(".page-main");
  var input = document.getElementById("services-search-input");
  if (!pageMain || !input) return;

  var searchBar = input.closest(".search-bar");
  if (searchBar) {
    searchBar.addEventListener("click", function () {
      try {
        input.focus({ preventScroll: true });
      } catch (_) {
        input.focus();
      }
    });
  }

  var sections = [];
  pageMain.querySelectorAll(".category-title").forEach(function (titleEl) {
    var listEl = titleEl.nextElementSibling;
    if (!listEl || !listEl.classList.contains("card-list")) return;
    sections.push({
      titleEl: titleEl,
      listEl: listEl,
      cards: Array.prototype.slice.call(listEl.querySelectorAll(".card")),
    });
  });

  var emptyEl = document.getElementById("services-search-empty");
  if (!emptyEl) {
    emptyEl = document.createElement("p");
    emptyEl.id = "services-search-empty";
    emptyEl.className = "services-search-empty";
    emptyEl.hidden = true;
    emptyEl.textContent = "Brak wyników wyszukiwania.";
    pageMain.appendChild(emptyEl);
  }

  var customizeEl = pageMain.querySelector(".customize-link-top");

  function applyServicesFilter() {
    var query = normalizeSearchText(input.value);
    var anyMatch = false;

    sections.forEach(function (section) {
      var visibleInSection = 0;

      section.cards.forEach(function (card) {
        var haystack = normalizeSearchText(getServiceCardLabel(card));
        var matches = !query || haystack.indexOf(query) !== -1;
        card.hidden = !matches;
        if (matches) visibleInSection += 1;
      });

      var showSection = visibleInSection > 0;
      section.titleEl.hidden = !showSection;
      section.listEl.hidden = !showSection;
      if (showSection) anyMatch = true;
    });

    if (customizeEl) {
      customizeEl.hidden = !!query;
    }

    emptyEl.hidden = !query || anyMatch;
  }

  ["input", "keyup", "change", "search"].forEach(function (eventName) {
    input.addEventListener(eventName, applyServicesFilter);
  });

  applyServicesFilter();
}

function bootServicesPage() {
  try {
    if (typeof initHeaderTitleObserver === "function") {
      initHeaderTitleObserver();
    }
  } catch (_) {}

  initServicesSearch();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootServicesPage);
} else {
  bootServicesPage();
}
