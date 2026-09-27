// Theme toggle (dark default), mobile menu, footer year, scroll reveal.
(function () {
  var root = document.documentElement;
  var btn = document.getElementById("theme-btn");
  function paint() { if (btn) btn.textContent = root.dataset.theme === "light" ? "Dark" : "Light"; }
  paint();
  if (btn) btn.addEventListener("click", function () {
    var next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    paint();
    window.dispatchEvent(new Event("themechange"));
  });

  var menuBtn = document.getElementById("menu-btn");
  var links = document.getElementById("nav-links");
  if (menuBtn && links) menuBtn.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });

  var y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();

  var items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  items.forEach(function (el) { io.observe(el); });
})();
