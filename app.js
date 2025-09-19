import { converter } from "./converter.js";
import { getNews } from "./news.js";
import { initFMC } from "./fmc.js";

// --- UI Elements ---

const events = {
  converterOpt: document.getElementById("converterOptBtn"),
  newsOpt: document.getElementById("newsOptBtn"),
  fmcOpt: document.getElementById("fmcOptBtn"),
  converterContainer: document.getElementById("converterContainer"),
  newsContainer: document.getElementById("newsContainer"),
  fmcContainer: document.getElementById("fmcContainer"),
  content: document.querySelector(".content"),
  sidebar: document.querySelector("aside"),
  mobileSidebarToggle: document.getElementById("sidebarToggle"),
  closeSidebarBtn: document.getElementById("closeSidebarBtn"),
  desktopSidebarToggle: document.querySelector(".sideAction .brand-logo"),
};

const isMobile = () => window.innerWidth <= 768;

const showPage = (page) => {
  if (!events.converterContainer || !events.newsContainer) return;
  if (page === "news") {
    events.converterContainer.style.display = "none";
    events.newsContainer.style.display = "flex";
    events.fmcContainer.style.display = "none";
  } else if (page === "fmc") {
    events.fmcContainer.style.display = "flex";
    events.newsContainer.style.display = "none";
    events.converterContainer.style.display = "none";
  } else {
    events.converterContainer.style.display = "flex";
    events.newsContainer.style.display = "none";
    events.fmcContainer.style.display = "none";
  }
};

function handleHashChange() {
  const hash = window.location.hash;
  if (hash === "#news") {
    showPage("news");
    if (typeof getNews === "function") getNews();
  } else if (hash === "#fmc") {
    showPage("fmc")
    if (typeof initFMC === "function") initFMC();
  }
  else {
    showPage("converter");
    if (converter && typeof converter.init === "function") converter.init();
  }
}

function openMobileSidebar(e) {
  e?.stopPropagation();
  events.sidebar?.classList.add("open");
}

function closeMobileSidebar() {
  events.sidebar?.classList.remove("open");
}

function toggleDesktopSidebar() {
  if (window.innerWidth > 768) {
    events.sidebar?.classList.toggle("closed");
    events.content?.classList.toggle("sidebar-closed");
  }
}

function outsideClickHandler(e) {
  if (!isMobile()) return;
  if (
    events.sidebar &&
    !events.sidebar.contains(e.target) &&
    events.mobileSidebarToggle &&
    !events.mobileSidebarToggle.contains(e.target) &&
    events.sidebar.classList.contains("open")
  ) {
    closeMobileSidebar();
  }
}

function navClickHandler(hash) {
  window.location.hash = hash;
  if (isMobile()) closeMobileSidebar();
}

function handleResize() {
  if (!events.sidebar || !events.content) return;
  if (window.innerWidth > 768) {
    // remove mobile-specific open state
    events.sidebar.classList.remove("open");
  } else {
    // remove desktop-specific collapsed state on mobile
    events.sidebar.classList.remove("closed");
    events.content.classList.remove("sidebar-closed");
  }
}

/* simple debounce */
const debounce = (fn, wait = 150) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};

// --- Event wiring with guards ---
if (events.mobileSidebarToggle) {
  events.mobileSidebarToggle.addEventListener("click", openMobileSidebar);
}

if (events.closeSidebarBtn) {
  events.closeSidebarBtn.addEventListener("click", closeMobileSidebar);
}

if (events.desktopSidebarToggle) {
  events.desktopSidebarToggle.addEventListener("click", toggleDesktopSidebar);
}

document.addEventListener("click", outsideClickHandler);

if (events.converterOpt) {
  events.converterOpt.addEventListener("click", () => navClickHandler("#"));
}
if (events.newsOpt) {
  events.newsOpt.addEventListener("click", () => navClickHandler("#news"));
}
if (events.fmcOpt) {
  events.fmcOpt.addEventListener("click", () => navClickHandler("#fmc"));
}

window.addEventListener("hashchange", handleHashChange);
window.addEventListener("resize", debounce(handleResize, 120));

window.addEventListener("DOMContentLoaded", () => {
  // Initialize UI state and render initial page
  handleHashChange();
  handleResize();
});
