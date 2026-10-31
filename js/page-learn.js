/* page-learn.js — tabs + gallery + detail modal */
window.BCPageLearn = (function () {
  "use strict";

  var tab = "animal";

  function boot() {
    if (!document.querySelector("#learn-root")) return;
    document.querySelectorAll(".tab").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll(".tab").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        tab = b.dataset.tab;
        render();
      });
    });
    render();
    BCi18n.onLangChange(render);
  }

  function render() {
    var zone = document.querySelector("#learn-zone");
    zone.innerHTML = "";
    if (tab === "animal") return renderAnimals(zone);
    if (tab === "history") return renderStatic(zone, "history");
    if (tab === "rules") return renderStatic(zone, "rules");
    if (tab === "tet") return renderStatic(zone, "tet");
  }

  function renderAnimals(zone) {
    BC_DATA.ANIMALS.forEach(function (a) {
      var card = document.createElement("button");
      card.className = "animal-card story-card";
      card.innerHTML =
        '<img src="' + a.img + '" alt="' + BCi18n.L(a.name) + '">' +
        '<div class="pad"><h3>' + BCi18n.L(a.name) + '</h3>' +
        '<span class="en">' + BCi18n.L(a.line) + "</span></div>";
      card.addEventListener("click", function () { openAnimal(a.id); });
      zone.appendChild(card);
    });
  }

  function renderStatic(zone, kind) {
    var box = document.createElement("div");
    box.className = "card-bc";
    if (kind === "history") {
      box.innerHTML = "<h3>" + BCi18n.t("tab.history") + "</h3><p>" + BCi18n.t("learn.historyBody") + "</p>";
    } else if (kind === "rules") {
      box.innerHTML =
        "<h3>" + BCi18n.t("tab.rules") + "</h3>" +
        "<p>" + BCi18n.t("learn.rulesIntro") + "</p>" +
        "<ul>" +
        li("learn.rule.0") + li("learn.rule.1") + li("learn.rule.2") + li("learn.rule.3") +
        "</ul>" +
        "<p class=\"mut\">" + BCi18n.t("learn.rulesNote") + "</p>";
    } else {
      box.innerHTML =
        "<h3>" + BCi18n.t("tab.tet") + "</h3><p>" +
        BCi18n.t("tet.respBody") + "</p>";
    }
    zone.appendChild(box);
  }

  function li(key) { return "<li>" + BCi18n.t(key) + "</li>"; }

  function openAnimal(id) {
    var a = BC_DATA.ANIMALS.filter(function (x) { return x.id === id; })[0];
    var st = BCStore.load();
    if (st.seenAnimals.indexOf(id) === -1) {
      st.seenAnimals.push(id);
      BCStore.save();
      BCBadges.check("animal_viewed");
    }
    var modal = document.querySelector("#modal-animal");
    modal.querySelector(".box").innerHTML =
      '<div class="close-row"><button class="icon-btn" data-act="modal-close">✕</button></div>' +
      '<img src="' + a.img + '" alt="' + BCi18n.L(a.name) + '" style="width:100%;border:3px solid var(--ink);border-radius:12px;">'
      + "<h3>" + BCi18n.L(a.name) + ' <span class="mono mut">(' + a.name.en + " · " + a.name.zh + ")</span></h3>"
      + "<p><strong>" + BCi18n.L(a.line) + "</strong></p>"
      + "<p>" + BCi18n.L(a.fact) + "</p>";
    modal.classList.add("show");
    modal.querySelector("[data-act=modal-close]").addEventListener("click", function () {
      modal.classList.remove("show");
    });
  }

  document.addEventListener("DOMContentLoaded", boot);
  return { boot: boot };
})();
