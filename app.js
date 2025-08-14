import { converter } from "./converter.js";
import { getNews } from "./news.js";

const converterOpt = document.getElementById("converterOptBtn");
const newsOpt = document.getElementById("newsOptBtn");
const converterContainer = document.getElementById("converterContainer");
const newsContainer = document.getElementById("newsContainer");
const sidebarToggle = document.getElementById("sidebarToggle");
const aside = document.querySelector("aside");

// --- Sidebar Toggle Logic ---
sidebarToggle.addEventListener("click", () => {
  aside.classList.toggle("closed");
});

function checkScreenSize() {
  if (window.innerWidth <= 768) {
    aside.classList.add("closed");
  } else {
    aside.classList.remove("closed");
  }
}
// --- End Sidebar Logic ---

function locationHashChanged() {
  if (location.hash === "#") {
    render("converter");
    converter.init();
  } else if (location.hash === "#news") {
    render("news");
    getNews();
  } else {
    render("converter");
    converter.init();
  }
}

converterOpt.addEventListener("click", () => {
  window.location.hash = "#";
  if (window.innerWidth <= 768) {
    aside.classList.add("closed");
  }
});
newsOpt.addEventListener("click", () => {
  window.location.hash = "#news";
  if (window.innerWidth <= 768) {
    aside.classList.add("closed");
  }
});

function render(page) {
  if (page === "converter") {
    converterContainer.style.display = "flex";
    newsContainer.style.display = "none";
  } else if (page === "news") {
    converterContainer.style.display = "none";
    newsContainer.style.display = "flex";
  }
}

window.onload = () => {
  locationHashChanged();
  checkScreenSize(); // Set initial sidebar state
};
window.onhashchange = locationHashChanged;
window.onresize = checkScreenSize; // Adjust sidebar on window resize
