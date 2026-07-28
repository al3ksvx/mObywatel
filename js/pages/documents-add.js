(function () {
  const ADD_KEY_MAP = {
    student_id: "legstu",
    school_id: "legszk",
    mprawojazdy: "prawojazdy",
  };

  const ADDABLE_DOCS = [
    { addKey: "mdowod", title: "mDowód" },
    { addKey: "mdowod2", title: "Moje pojazdy" },
    { addKey: "mdowod3", title: "Legitymacja osoby niepełnosprawnej" },
    { addKey: "mdowod4", title: "Legitymacja radcy prawnego" },
    { addKey: "diia", title: "Diia.pl" },
    { addKey: "school_id", title: "Legitymacja szkolna" },
    { addKey: "student_id", title: "Legitymacja studencka" },
    { addKey: "mprawojazdy", title: "Prawo jazdy" },
  ];

  function resolveDocId(addKey) {
    return ADD_KEY_MAP[addKey] || addKey;
  }

  function loadVisibleCards() {
    try {
      const saved = localStorage.getItem("doc-cards-visible");
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch (_) {}
    return ["mdowod"];
  }

  function saveVisibleCards(visibleCards) {
    try {
      localStorage.setItem("doc-cards-visible", JSON.stringify(visibleCards));
    } catch (_) {}
  }

  function applyToggle(visibleCards, docId, checked) {
    let next = visibleCards.slice();

    if (checked) {
      let conflictingDocs = [];

      if (
        (docId === "mdowod" ||
          docId === "mdowod2" ||
          docId === "mdowod3" ||
          docId === "mdowod4") &&
        next.includes("diia")
      ) {
        conflictingDocs = ["diia"];
      } else if (docId === "diia") {
        conflictingDocs = next.filter(
          (id) =>
            id === "mdowod" ||
            id === "mdowod2" ||
            id === "mdowod3" ||
            id === "mdowod4",
        );
      }

      if (docId === "legszk" && next.includes("legstu")) {
        conflictingDocs.push("legstu");
      } else if (docId === "legstu" && next.includes("legszk")) {
        conflictingDocs.push("legszk");
      }

      if (conflictingDocs.length > 0) {
        next = next.filter((id) => !conflictingDocs.includes(id));
      }

      if (!next.includes(docId)) {
        next.push(docId);
      }
    } else {
      next = next.filter((id) => id !== docId);
    }

    return next;
  }

  function syncCheckboxStates(visibleCards) {
    document.querySelectorAll("[data-document-add]").forEach(function (row) {
      const addKey = row.getAttribute("data-document-add");
      const docId = resolveDocId(addKey);
      const checkbox = row.querySelector('input[type="checkbox"]');
      if (checkbox) checkbox.checked = visibleCards.includes(docId);
    });
  }

  function createRow(addKey, title) {
    const row = document.createElement("div");
    row.className = "add-doc-row";
    row.setAttribute("data-document-add", addKey);

    row.innerHTML =
      '<div class="add-doc-row__inner">' +
      '<div class="add-doc-row__check"><input type="checkbox" /></div>' +
      '<div class="add-doc-row__icon"></div>' +
      '<h1 class="add-doc-row__title">' +
      title +
      "</h1>" +
      "</div>";

    return row;
  }

  function ensureDocumentRows() {
    const card = document.querySelector(".add_document_list .add-doc-card");
    if (!card) return;

    const existing = new Set(
      Array.from(card.querySelectorAll("[data-document-add]")).map(function (row) {
        return row.getAttribute("data-document-add");
      }),
    );

    ADDABLE_DOCS.forEach(function (doc, index) {
      if (existing.has(doc.addKey)) {
        const row = card.querySelector('[data-document-add="' + doc.addKey + '"]');
        if (row) {
          row.classList.remove("display-none");
          const sep = card.querySelector(
            '[data-document-separator="' + doc.addKey + '"]',
          );
          if (sep) sep.classList.remove("display-none");
        }
        return;
      }

      if (index > 0) {
        const separator = document.createElement("div");
        separator.className = "add-doc-separator";
        separator.setAttribute("data-document-separator", doc.addKey);
        card.appendChild(separator);
      }

      card.appendChild(createRow(doc.addKey, doc.title));
    });
  }

  function bindRowInteractions(getVisible, setVisible) {
    document.querySelectorAll("[data-document-add]").forEach(function (row) {
      if (row.tagName !== "LABEL") {
        row.addEventListener("click", function (e) {
          const checkbox = row.querySelector('input[type="checkbox"]');
          if (!checkbox) return;
          if (e.target === checkbox) return;
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        });
      }

      const checkbox = row.querySelector('input[type="checkbox"]');
      if (!checkbox) return;

      checkbox.addEventListener("change", function () {
        const addKey = row.getAttribute("data-document-add");
        const docId = resolveDocId(addKey);
        const next = applyToggle(getVisible(), docId, checkbox.checked);
        setVisible(next);
        syncCheckboxStates(next);
      });
    });
  }

  function initAddSearch() {
    const input = document.querySelector(".add-doc-search");
    if (!input) return;

    input.addEventListener("input", function () {
      const query = String(input.value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

      document.querySelectorAll(".add-doc-option").forEach(function (row) {
        const label = row.querySelector(".add-doc-option__label");
        const text = (label ? label.textContent : "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        const show = !query || text.indexOf(query) !== -1;
        row.hidden = !show;
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    let visibleCards = loadVisibleCards();

    ensureDocumentRows();
    syncCheckboxStates(visibleCards);
    initAddSearch();
    bindRowInteractions(
      function () {
        return visibleCards;
      },
      function (next) {
        visibleCards = next;
        saveVisibleCards(visibleCards);
      },
    );

    const backBtn = document.querySelector('[data-button="add_document_list_back"]');
    if (backBtn) {
      backBtn.addEventListener("click", function (e) {
        e.preventDefault();
        window.location.href = "documents.html";
      });
    }

    const saveAddBtn = document.querySelector('[data-button="save_add_documents"]');
    if (saveAddBtn) {
      saveAddBtn.addEventListener("click", function (e) {
        e.preventDefault();
        saveVisibleCards(visibleCards);
        window.location.href = "documents.html";
      });
    }
  });
})();
