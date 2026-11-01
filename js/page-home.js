/* page-home.js — render animals carousel + FAQ */
window.BCPageHome = (function () {
  "use strict";

  function boot() {
    if (!document.querySelector("#animal-track")) return;

    /* animals carousel */
    var zone = document.querySelector("#animal-track");
    BC_DATA.ANIMALS.forEach(function (a) {
      var card = document.createElement("button");
      card.className = "animal-card";
      card.innerHTML =
        '<img src="' + a.img + '" alt="' + BCi18n.L(a.name) + '">' +
        '<div class="pad"><h3>' + BCi18n.L(a.name) + '</h3>' +
        '<span class="en">' + BCi18n.L(a.line) + "</span></div>";
      card.addEventListener("click", function () { openAnimal(a.id); });
      zone.appendChild(card);
    });

    /* carousel arrows */
    var prev = document.querySelector("[data-act=car-prev]");
    var next = document.querySelector("[data-act=car-next]");
    if (prev) prev.addEventListener("click", function () {
      zone.scrollBy({ left: -280, behavior: "smooth" });
    });
    if (next) next.addEventListener("click", function () {
      zone.scrollBy({ left: 280, behavior: "smooth" });
    });

    renderFaq();
    BCi18n.onLangChange(function () {
      zone.innerHTML = "";
      BC_DATA.ANIMALS.forEach(function (a) { addCard(zone, a); });
      renderFaq();
    });
  }

  function addCard(zone, a) {
    var card = document.createElement("button");
    card.className = "animal-card";
    card.innerHTML =
      '<img src="' + a.img + '" alt="' + BCi18n.L(a.name) + '">' +
      '<div class="pad"><h3>' + BCi18n.L(a.name) + '</h3>' +
      '<span class="en">' + BCi18n.L(a.line) + "</span></div>";
    card.addEventListener("click", function () { openAnimal(a.id); });
    zone.appendChild(card);
  }

  /* animal detail modal + seenAnimal tracking */
  function openAnimal(id) {
    var a = BC_DATA.ANIMALS.filter(function (x) { return x.id === id; })[0];
    var st = BCStore.load();
    if (st.seenAnimals.indexOf(id) === -1) {
      st.seenAnimals.push(id);
      BCStore.save();
    }
    BCBadges.check("animal_viewed");
    var modal = document.querySelector("#modal-animal");
    modal.querySelector(".box").innerHTML =
      '<div class="close-row"><button class="icon-btn" data-act="modal-close">✕</button></div>' +
      '<img src="' + a.img + '" alt="' + BCi18n.L(a.name) + '" style="width:100%;border:3px solid var(--ink);border-radius:12px;">' +
      "<h3 style=\"margin:12px 0 4px\">" + BCi18n.L(a.name) +
      ' <span class="mono mut">(' + a.name.en + " · " + a.name.zh + ")</span></h3>" +
      "<p><strong>" + BCi18n.L(a.line) + "</strong></p>" +
      "<p>" + BCi18n.L(a.fact) + "</p>";
    modal.classList.add("show");
    modal.querySelector("[data-act=modal-close]").addEventListener("click", function () {
      modal.classList.remove("show");
    });
    BCAudio.pop();
  }

  function renderFaq() {
    var zone = document.querySelector("#faq-zone");
    if (!zone) return;
    zone.innerHTML = "";
    BC_CONTENT.FAQ.forEach(function (f) {
      var d = document.createElement("details");
      d.className = "faq";
      d.innerHTML = "<summary>" + BCi18n.L(f.q) + '</summary><div class="a">' + BCi18n.L(f.a) + "</div>";
      zone.appendChild(d);
     });
  }

  document.addEventListener("DOMContentLoaded", boot);
  return { boot: boot };
})();
