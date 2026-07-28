var _dashboardMaxScroll = Infinity;

const CARD_STACK_STEP_STORAGE = "card-stack-step";
const DEFAULT_CARD_STACK_STEP = 50;
const CARD_STACK_REF_HEIGHT = 205;

function loadCardStackStepSetting() {
  const section = document.getElementById("wybor-p");
  if (!section) return DEFAULT_CARD_STACK_STEP;

  let step = DEFAULT_CARD_STACK_STEP;
  try {
    const saved = localStorage.getItem(CARD_STACK_STEP_STORAGE);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        step = parsed;
      }
    }
  } catch (_) {}

  section.style.setProperty("--card-stack-step", step + "px");
  return step;
}

function getCardStackStep(sectionEl, cardHeight) {
  const section = sectionEl || document.getElementById("wybor-p");
  let step = DEFAULT_CARD_STACK_STEP;
  if (section) {
    const raw = getComputedStyle(section)
      .getPropertyValue("--card-stack-step")
      .trim();
    const parsed = parseFloat(raw);
    if (!Number.isNaN(parsed) && parsed > 0) {
      step = parsed;
    }
  }
  const h = cardHeight || CARD_STACK_REF_HEIGHT;
  return Math.round(step * (h / CARD_STACK_REF_HEIGHT));
}

function setDashboardScrollLimit() {
  try {
    const body = document.body;
    if (!body || !body.classList.contains("dashboard-page")) return;
    const header = document.querySelector("header.app-header");
    const title = document.getElementById("main-title");
    if (!header || !title) return;

    const viewportH =
      (window.visualViewport && window.visualViewport.height) ||
      window.innerHeight ||
      document.documentElement.clientHeight ||
      0;
    const headerH = Math.ceil(header.getBoundingClientRect().height || 0);
    const titleRect = title.getBoundingClientRect();
    const coverDistance = Math.max(
      0,
      Math.ceil(titleRect.bottom - headerH + 1 + window.scrollY),
    );

    _dashboardMaxScroll = coverDistance;

    const targetH = Math.max(0, Math.round(viewportH + coverDistance));
    body.style.minHeight = targetH + "px";
    body.style.height = targetH + "px";
  } catch (_) { }
}

window.addEventListener("scroll", function () {
  if (window.scrollY > _dashboardMaxScroll) {
    window.scrollTo(0, _dashboardMaxScroll);
  }
}, { passive: true });

function applyEntryAnimation() {
  try {
    const fromLogin = sessionStorage.getItem("from-login");
    if (fromLogin === "true") {
      sessionStorage.removeItem("from-login");
      const section = document.getElementById("wybor-p");
      if (section) {
        section.style.opacity = "0";
        section.style.transform = "translateY(100vh)";
        requestAnimationFrame(() => {
          section.classList.add("slide-up-enter");
        });
      }
    }
  } catch (e) { }
}

const AVAILABLE_DOCS = {
  mdowod: {
    id: "mdowod",
    title: "mDowód",
    image: "assets/icons/mdowod_bg_big.webp",
    logo: "assets/icons/logo_mdowod.svg",
    href: "dowod.html",
  },
  mdowod2: {
    id: "mdowod2",
    title: "Moje pojazdy",
    image: "assets/icons/mpojazd_bg_big.webp",
    logo: "assets/icons/logo_mdowod.svg",
    href: "pojazdy.html",
  },
  mdowod3: {
    id: "mdowod3",
    title: "Legitymacja osoby niepełnosprawnej",
    image: "assets/icons/niepelnosprawny_bg_big.webp",
    logo: "assets/icons/logo_mdowod.svg",
    href: "niepelnosprawny.html",
  },
  mdowod4: {
    id: "mdowod4",
    title: "Legitymacja radcy prawnego",
    image: "assets/icons/radca_prawny_bg_big.webp",
    logo: "assets/icons/logo_mdowod.svg",
    href: "radca_prawny.html",
  },
  diia: {
    id: "diia",
    title: "Dokument ochrony czasowej",
    image: "assets/icons/diia_bg_big.webp",
    logo: "assets/icons/logo_mdowod.svg",
    href: "diia.html",
  },
  legszk: {
    id: "legszk",
    title: "Legitymacja szkolna",
    image: "assets/icons/leg_szkolna_bg_big.webp",
    logo: "assets/icons/logo_mdowod.svg",
    href: "legszk.html",
  },
  legstu: {
    id: "legstu",
    title: "Legitymacja studencka",
    image: "assets/icons/leg_studencka_bg_big.webp",
    logo: "assets/icons/logo_mdowod.svg",
    href: "legstu.html",
  },
  prawojazdy: {
    id: "prawojazdy",
    title: "Prawo jazdy",
    image: "assets/icons/prawo_jazdy_bg_big.webp",
    logo: "assets/icons/logo_mdowod.svg",
    href: "prawojazdy.html",
  },
};

let cardOrder = [];
let visibleCards = [];

function loadSettings() {
  try {
    const savedOrder = localStorage.getItem("doc-cards-order");
    const savedVisible = localStorage.getItem("doc-cards-visible");

    const defaultOrder = [
      "mdowod",
      "mdowod2",
      "mdowod3",
      "mdowod4",
      "diia",
      "legszk",
      "legstu",
      "prawojazdy",
    ];

    if (savedOrder) {
      cardOrder = JSON.parse(savedOrder);
      const missingDocs = defaultOrder.filter((id) => !cardOrder.includes(id));
      cardOrder = cardOrder.concat(missingDocs);
    } else {
      cardOrder = defaultOrder;
    }

    if (savedVisible) {
      visibleCards = JSON.parse(savedVisible);
    } else {
      visibleCards = ["mdowod"];
    }
  } catch (e) {
    cardOrder = ["mdowod", "mdowod2", "mdowod3", "mdowod4", "diia", "legszk", "legstu", "prawojazdy"];
    visibleCards = ["mdowod"];
  }
}

function saveSettings() {
  try {
    localStorage.setItem("doc-cards-order", JSON.stringify(cardOrder));
    localStorage.setItem("doc-cards-visible", JSON.stringify(visibleCards));
  } catch (e) { }
}

function renderCards() {
  const container = document.getElementById("cards-container");
  if (!container) return;

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const cardsToRender = cardOrder.filter((id) => visibleCards.includes(id));

  const containerWidth = container.clientWidth || 304;
  const baseHeight = Math.round((containerWidth * CARD_STACK_REF_HEIGHT) / 304);
  const offsetPerCard = getCardStackStep(
    document.getElementById("wybor-p"),
    baseHeight,
  );
  const totalHeight =
    baseHeight + Math.max(0, cardsToRender.length - 1) * offsetPerCard;
  container.style.minHeight = totalHeight + "px";

  cardsToRender.forEach((docId, index) => {
    const doc = AVAILABLE_DOCS[docId];
    if (!doc) return;

    const card = document.createElement("div");
    card.className = "id-card";
    card.dataset.href = doc.href;
    card.dataset.docId = docId;
    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");
    card.style.top = index * offsetPerCard + "px";
    card.style.zIndex = index + 1;

    const img = document.createElement("img");
    img.src = doc.image;
    img.alt = doc.title;
    img.className = "id-card-image";
    img.loading = "eager";
    img.decoding = "async";
    img.width = 400;
    img.height = 240;

    const header = document.createElement("div");
    header.className = "id-card-header";

    const title = document.createElement("span");
    title.className = "id-card-title";
    title.textContent = doc.title;

    const logo = document.createElement("img");
    logo.src = doc.logo;
    logo.alt = "Logo " + doc.title;
    logo.className = "id-card-logo";
    logo.loading = "eager";
    logo.width = 64;
    logo.height = 64;

    header.appendChild(title);
    header.appendChild(logo);
    card.appendChild(img);
    card.appendChild(header);

    card.addEventListener("click", function (e) {
      if (card.classList.contains("is-activating")) return;
      card.classList.add("is-activating");
      card.style.pointerEvents = "none";

      setTimeout(function () {
        window.location.href = card.dataset.href;
      }, 320);
    });

    container.appendChild(card);
  });
}

function refreshCardsLayout() {
  try {
    renderCards();
    setDashboardScrollLimit();
  } catch (_) { }
}

function renderSortableList() {
  const sortableContainer = document.getElementById("sortable-cards");
  if (!sortableContainer) return;

  while (sortableContainer.firstChild) {
    sortableContainer.removeChild(sortableContainer.firstChild);
  }

  visibleCards.forEach((docId) => {
    const doc = AVAILABLE_DOCS[docId];
    if (!doc) return;

    const item = document.createElement("div");
    item.className = "sortable-item";
    item.draggable = true;
    item.dataset.docId = docId;

    const dragHandle = document.createElement("div");
    dragHandle.className = "drag-handle";

    const span1 = document.createElement("span");
    const span2 = document.createElement("span");
    const span3 = document.createElement("span");

    dragHandle.appendChild(span1);
    dragHandle.appendChild(span2);
    dragHandle.appendChild(span3);

    const label = document.createElement("span");
    label.className = "sortable-item-label";
    label.textContent = doc.title;

    item.appendChild(dragHandle);
    item.appendChild(label);

    sortableContainer.appendChild(item);
  });

  initDragAndDrop();
}

let draggedElement = null;
let draggedOverElement = null;
let touchStartY = 0;
let touchCurrentY = 0;
let isDragging = false;

function initDragAndDrop() {
  const items = document.querySelectorAll(".sortable-item");

  items.forEach((item) => {
    item.addEventListener("dragstart", function (e) {
      draggedElement = this;
      this.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", this.innerHTML);
    });

    item.addEventListener("dragend", function (e) {
      this.classList.remove("dragging");

      const allItems = document.querySelectorAll(".sortable-item");
      allItems.forEach((el) => el.classList.remove("dragover"));

      draggedElement = null;
      draggedOverElement = null;

      updateOrderFromDOM();
    });

    item.addEventListener("dragover", function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      if (draggedElement && draggedElement !== this) {
        draggedOverElement = this;

        const container = this.parentNode;
        const afterElement = getDragAfterElement(container, e.clientY);

        if (afterElement == null) {
          container.appendChild(draggedElement);
        } else {
          container.insertBefore(draggedElement, afterElement);
        }
      }
    });

    item.addEventListener("drop", function (e) {
      e.preventDefault();
      e.stopPropagation();
    });

    item.addEventListener(
      "touchstart",
      function (e) {
        isDragging = false;
        touchStartY = e.touches[0].clientY;

        setTimeout(() => {
          if (!isDragging) {
            draggedElement = this;
            this.classList.add("dragging");
            isDragging = true;

            const overlayContent = document.querySelector(
              "#customize-overlay .overlay-content",
            );
            if (overlayContent) {
              overlayContent.classList.add("dragging-active");
            }
          }
        }, 150);
      },
      { passive: false },
    );

    item.addEventListener(
      "touchmove",
      function (e) {
        if (!isDragging || !draggedElement) return;

        e.preventDefault();
        e.stopPropagation();

        touchCurrentY = e.touches[0].clientY;
        const touch = e.touches[0];

        const elementBelow = document.elementFromPoint(
          touch.clientX,
          touch.clientY,
        );
        const sortableItem = elementBelow?.closest(".sortable-item");

        if (sortableItem && sortableItem !== draggedElement) {
          const container = draggedElement.parentNode;
          const afterElement = getDragAfterElement(container, touch.clientY);

          if (afterElement == null) {
            container.appendChild(draggedElement);
          } else {
            container.insertBefore(draggedElement, afterElement);
          }
        }
      },
      { passive: false },
    );

    item.addEventListener(
      "touchend",
      function (e) {
        if (isDragging && draggedElement) {
          draggedElement.classList.remove("dragging");

          const allItems = document.querySelectorAll(".sortable-item");
          allItems.forEach((el) => el.classList.remove("dragover"));

          const overlayContent = document.querySelector(
            "#customize-overlay .overlay-content",
          );
          if (overlayContent) {
            overlayContent.classList.remove("dragging-active");
          }

          draggedElement = null;
          isDragging = false;

          updateOrderFromDOM();
        }
      },
      { passive: false },
    );

    item.addEventListener(
      "touchcancel",
      function (e) {
        if (draggedElement) {
          draggedElement.classList.remove("dragging");

          const overlayContent = document.querySelector(
            "#customize-overlay .overlay-content",
          );
          if (overlayContent) {
            overlayContent.classList.remove("dragging-active");
          }

          draggedElement = null;
          isDragging = false;
        }
      },
      { passive: false },
    );
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".sortable-item:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
}

function updateOrderFromDOM() {
  const items = document.querySelectorAll(".sortable-item");
  const newOrder = [];

  items.forEach((item) => {
    const docId = item.dataset.docId;
    if (docId && visibleCards.includes(docId)) {
      newOrder.push(docId);
    }
  });

  visibleCards = newOrder;

  cardOrder = cardOrder.filter((id) => !visibleCards.includes(id));
  cardOrder = [...visibleCards, ...cardOrder];

  saveSettings();
  renderCards();
}

window.DocumentsCustomizeApi = {
  getVisibleOrder: function () {
    return cardOrder.filter(function (id) {
      return visibleCards.includes(id);
    });
  },
  getDoc: function (docId) {
    return AVAILABLE_DOCS[docId] || null;
  },
  setVisibleOrder: function (visibleOrder) {
    const hidden = cardOrder.filter(function (id) {
      return !visibleCards.includes(id);
    });
    cardOrder = visibleOrder.concat(hidden);
    saveSettings();
    renderCards();
  },
};

function initDocumentsCustomize() {
  function getCustomizeApi() {
    return window.DocumentsCustomizeApi || null;
  }

  function showCustomizePanel(selector) {
    const panel = document.querySelector(selector);
    const root = document.getElementById("documents-panels");
    if (!panel || !root) return;
    root.classList.add("documents-panels--active");
    root.setAttribute("aria-hidden", "false");
    panel.classList.add("is-open");
    document.body.classList.add("documents-panel-open");
    if (selector === ".order_view") {
      document.body.classList.add("documents-order-open");
    }
  }

  function hideCustomizePanel(selector) {
    const panel = document.querySelector(selector);
    const root = document.getElementById("documents-panels");
    if (!panel) return;
    panel.classList.remove("is-open");
    if (selector === ".order_view") {
      document.body.classList.remove("documents-order-open");
    }
    const anyOpen = root && root.querySelector(".doc-panel.is-open");
    if (!anyOpen) {
      if (root) {
        root.classList.remove("documents-panels--active");
        root.setAttribute("aria-hidden", "true");
      }
      document.body.classList.remove("documents-panel-open");
      document.body.classList.remove("documents-order-open");
    }
  }

  function selectLayout(value) {
    document.querySelectorAll(".customize_view .option").forEach(function (opt) {
      opt.classList.toggle("selected", opt.dataset.option === value);
    });
    document.querySelectorAll('.customize_view input[name="doc_layout"]').forEach(
      function (input) {
        input.checked = input.value === value;
      },
    );
  }

  function saveLayoutSelection(value) {
    if (!value) return;
    try {
      localStorage.setItem("documents_layout", value);
    } catch (_) {}
  }

  function persistOrderFromList(list) {
    const api = getCustomizeApi();
    if (!list || !api) return;
    const keys = Array.from(list.querySelectorAll("li[data-key]")).map(function (
      li,
    ) {
      return li.getAttribute("data-key");
    });
    if (!keys.length) return;
    api.setVisibleOrder(keys);
  }

  function populateOrder() {
    const list = document.querySelector(".order_view .order_list");
    const api = getCustomizeApi();
    if (!list || !api) return;

    if (list._orderPointerHandlers) {
      document.removeEventListener("pointermove", list._orderPointerHandlers.move);
      document.removeEventListener("pointerup", list._orderPointerHandlers.end);
      document.removeEventListener("pointercancel", list._orderPointerHandlers.end);
      delete list._orderPointerHandlers;
    }

    list.innerHTML = "";
    const order = api.getVisibleOrder();

    order.forEach(function (docId) {
      const doc = api.getDoc(docId);
      if (!doc) return;

      const li = document.createElement("li");
      li.setAttribute("data-key", docId);
      li.className = "order_item";
      li.setAttribute("draggable", "true");

      const imgWrap = document.createElement("div");
      const img = document.createElement("img");
      img.src = doc.image;
      img.alt = doc.title;
      imgWrap.appendChild(img);

      const textWrap = document.createElement("div");
      textWrap.className = "order_item_text";
      const title = document.createElement("div");
      title.className = "order_item_title";
      title.textContent = doc.title;
      const hint = document.createElement("div");
      hint.className = "order_item_hint";
      hint.textContent = "Przytrzymaj i przeciągnij";
      textWrap.appendChild(title);
      textWrap.appendChild(hint);

      const handle = document.createElement("div");
      handle.className = "order_drag_handle";
      handle.setAttribute("aria-hidden", "true");
      for (let i = 0; i < 6; i++) {
        handle.appendChild(document.createElement("span"));
      }

      li.appendChild(imgWrap);
      li.appendChild(textWrap);
      li.appendChild(handle);
      list.appendChild(li);
    });

    initOrderDrag(list);
  }

  function initOrderDrag(list) {
    let dragged = null;
    let placeholder = null;
    let pointerId = null;
    let startOffsetY = 0;

    function cleanupPointerDrag() {
      if (!dragged) return;
      dragged.classList.remove("dragging");
      dragged.style.position = "";
      dragged.style.left = "";
      dragged.style.top = "";
      dragged.style.width = "";
      dragged.style.pointerEvents = "";
      dragged.style.cursor = "grab";
      dragged.style.transform = "";
      if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.insertBefore(dragged, placeholder);
        placeholder.remove();
      }
      dragged = null;
      placeholder = null;
      pointerId = null;
    }

    function getDragAfterElement(container, clientY) {
      const items = Array.from(
        container.querySelectorAll(".order_item:not(.dragging)"),
      );
      let closest = { offset: Number.NEGATIVE_INFINITY, element: null };
      items.forEach(function (child) {
        const box = child.getBoundingClientRect();
        const offset = clientY - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          closest = { offset: offset, element: child };
        }
      });
      return closest.element;
    }

    function startPointerDrag(event, li) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      event.preventDefault();
      const rect = li.getBoundingClientRect();
      dragged = li;
      pointerId = event.pointerId;
      startOffsetY = event.clientY - rect.top;
      placeholder = document.createElement("li");
      placeholder.className = "order_placeholder";
      placeholder.style.height = rect.height + "px";
      li.parentNode.insertBefore(placeholder, li.nextSibling);
      li.classList.add("dragging");
      li.style.position = "fixed";
      li.style.left = rect.left + "px";
      li.style.top = rect.top + "px";
      li.style.width = rect.width + "px";
      li.style.pointerEvents = "none";
      li.style.cursor = "grabbing";
      try {
        li.setPointerCapture(pointerId);
      } catch (_) {}
    }

    function movePointerDrag(event) {
      if (!dragged || event.pointerId !== pointerId) return;
      event.preventDefault();
      dragged.style.top = event.clientY - startOffsetY + "px";
      const afterElement = getDragAfterElement(list, event.clientY);
      if (!afterElement) {
        list.appendChild(placeholder);
      } else {
        list.insertBefore(placeholder, afterElement);
      }
    }

    function endPointerDrag(event) {
      if (!dragged || event.pointerId !== pointerId) return;
      cleanupPointerDrag();
      persistOrderFromList(list);
    }

    list.addEventListener("dragover", function (e) {
      e.preventDefault();
      const draggingEl = list.querySelector(".order_item.dragging") || dragged;
      if (!draggingEl) return;
      const afterElement = getDragAfterElement(list, e.clientY);
      if (!afterElement) {
        list.appendChild(draggingEl);
      } else {
        list.insertBefore(draggingEl, afterElement);
      }
    });

    list.querySelectorAll("li[data-key]").forEach(function (li) {
      li.addEventListener("dragstart", function (e) {
        dragged = li;
        li.classList.add("dragging");
        try {
          e.dataTransfer.effectAllowed = "move";
        } catch (_) {}
        try {
          e.dataTransfer.setData("text/plain", li.getAttribute("data-key"));
        } catch (_) {}
      });

      li.addEventListener("dragend", function () {
        li.classList.remove("dragging");
        dragged = null;
        persistOrderFromList(list);
      });

      li.addEventListener("pointerdown", function (e) {
        startPointerDrag(e, li);
      });
      li.addEventListener("pointermove", movePointerDrag);
      li.addEventListener("pointerup", endPointerDrag);
      li.addEventListener("pointercancel", endPointerDrag);
    });

    list._orderPointerHandlers = {
      move: movePointerDrag,
      end: endPointerDrag,
    };
    document.addEventListener("pointermove", list._orderPointerHandlers.move);
    document.addEventListener("pointerup", list._orderPointerHandlers.end);
    document.addEventListener("pointercancel", list._orderPointerHandlers.end);
  }

  const openBtn = document.getElementById("customize-view-btn");
  if (openBtn) {
    openBtn.addEventListener("click", function (e) {
      e.preventDefault();
      showCustomizePanel(".customize_view");
    });
  }

  const backCustomize = document.querySelector('[data-button="customize_back"]');
  if (backCustomize) {
    backCustomize.addEventListener("click", function (e) {
      e.preventDefault();
      hideCustomizePanel(".customize_view");
    });
  }

  document.querySelectorAll(".customize_view .option").forEach(function (opt) {
    opt.addEventListener("click", function (e) {
      e.preventDefault();
      const input = opt.querySelector('input[name="doc_layout"]');
      if (input) input.checked = true;
      selectLayout(opt.dataset.option);
      saveLayoutSelection(opt.dataset.option);
    });
  });

  try {
    const saved = localStorage.getItem("documents_layout") || "big";
    selectLayout(saved);
  } catch (_) {
    selectLayout("big");
  }

  const setOrderBtn = document.querySelector('[data-button="set_order"]');
  if (setOrderBtn) {
    setOrderBtn.addEventListener("click", function (e) {
      e.preventDefault();
      populateOrder();
      showCustomizePanel(".order_view");
    });
  }

  const orderBack = document.querySelector('[data-button="order_back"]');
  if (orderBack) {
    orderBack.addEventListener("click", function (e) {
      e.preventDefault();
      hideCustomizePanel(".order_view");
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadCardStackStepSetting();
  loadSettings();
  renderCards();
  initDocumentsCustomize();

  applyEntryAnimation();

  const addBtn = document.querySelector(".floating-add-doc-btn");
  try {
    if (typeof initHeaderTitleObserver === "function") {
      initHeaderTitleObserver({
        onEnter: function () {
          if (addBtn) addBtn.classList.remove("compact");
        },
        onLeave: function () {
          if (addBtn) addBtn.classList.add("compact");
        },
      });
    }
  } catch (_) { }

  setDashboardScrollLimit();
});

window.addEventListener("load", setDashboardScrollLimit);
window.addEventListener("resize", refreshCardsLayout);
window.addEventListener("orientationchange", refreshCardsLayout);
if (window.visualViewport) {
  try {
    window.visualViewport.addEventListener("resize", refreshCardsLayout);
  } catch (_) { }
}
