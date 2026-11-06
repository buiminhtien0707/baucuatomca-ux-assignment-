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
    initMascotPicker();
    BCi18n.onLangChange(function () {
      zone.innerHTML = "";
      BC_DATA.ANIMALS.forEach(function (a) { addCard(zone, a); });
      renderFaq();
      updateMascotLanguage();
    });
  }

  /* 6-animal mascot showcase & lucky mascot picker */
  var meanings = {
    bau: { vn: "Bầu (Bình an & Sung túc)", en: "Gourd (Peace & Abundance)", zh: "葫芦（平安富贵）" },
    cua: { vn: "Cua (Vững vàng & Tài lộc)", en: "Crab (Strength & Wealth)", zh: "螃蟹（四平八稳）" },
    tom: { vn: "Tôm (Bứt phá & Thuận buồm)", en: "Shrimp (Leap & Smooth Sailing)", zh: "大虾（步步高升）" },
    ca: { vn: "Cá (Dư dả & Thịnh vượng)", en: "Fish (Surplus & Prosperity)", zh: "金鱼（年年有余）" },
    ga: { vn: "Gà (Đại cát & Tinh anh)", en: "Rooster (Good Luck & Vitality)", zh: "雄鸡（大吉大利）" },
    huou: { vn: "Hươu (Trường thọ & May mắn)", en: "Stag (Longevity & Fortune)", zh: "吉祥鹿（福禄双全）" }
  };

  function updateMascotLanguage() {
    var descEl = document.querySelector("#lucky-mascot-desc");
    if (!descEl) return;
    var currentId = "bau";
    try {
      currentId = localStorage.getItem("bc_lucky_mascot") || "bau";
    } catch (e) {}
    var m = meanings[currentId];
    if (m) {
      var lang = (window.BCi18n && BCi18n.currentLang) || "vn";
      descEl.textContent = m[lang] || m.vn;
    }
  }

  function initMascotPicker() {
    var tiles = document.querySelectorAll(".mascot-pick-tile");
    var descEl = document.querySelector("#lucky-mascot-desc");
    var randomBtn = document.querySelector("#btn-random-mascot");
    if (!tiles.length) return;

    function selectMascot(animalId, playAudio) {
      tiles.forEach(function (t) {
        var isThis = t.getAttribute("data-animal") === animalId;
        t.classList.toggle("selected", isThis);
        if (isThis && playAudio) {
          t.classList.remove("is-animating");
          void t.offsetWidth;
          t.classList.add("is-animating");
        }
      });

      var m = meanings[animalId];
      if (m && descEl) {
        var lang = (window.BCi18n && BCi18n.currentLang) || "vn";
        descEl.textContent = m[lang] || m.vn;
      }

      try {
        localStorage.setItem("bc_lucky_mascot", animalId);
      } catch (e) {}

      if (playAudio && window.BCAudio && BCAudio.chip) {
        BCAudio.chip();
      }
    }

    tiles.forEach(function (t) {
      t.addEventListener("click", function () {
        var id = t.getAttribute("data-animal");
        selectMascot(id, true);
      });
    });

    if (randomBtn) {
      var isSpinning = false;
      randomBtn.addEventListener("click", function () {
        if (isSpinning) return;
        isSpinning = true;
        randomBtn.style.opacity = "0.6";
        var animalIds = ["bau", "cua", "tom", "ca", "ga", "huou"];
        var counter = 0;
        var maxSteps = 10;
        var spinInterval = setInterval(function () {
          var rand = animalIds[Math.floor(Math.random() * animalIds.length)];
          selectMascot(rand, false);
          counter++;
          if (counter >= maxSteps) {
            clearInterval(spinInterval);
            isSpinning = false;
            randomBtn.style.opacity = "1";
            var finalPick = animalIds[Math.floor(Math.random() * animalIds.length)];
            selectMascot(finalPick, true);
            if (window.BCAudio && BCAudio.win) BCAudio.win();
          }
        }, 60);
      });
    }

    // Initialize with saved or default
    var initial = "bau";
    try {
      initial = localStorage.getItem("bc_lucky_mascot") || "bau";
    } catch (e) {}
    selectMascot(initial, false);
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
    var lang = (BCStore.load && BCStore.load().lang) || "vn";
    var altNames = [];
    if (lang !== "vn") altNames.push(a.name.vn);
    if (lang !== "en") altNames.push(a.name.en);
    if (lang !== "zh") altNames.push(a.name.zh);
    var altStr = altNames.length ? ' <span class="mono mut">(' + altNames.join(" · ") + ")</span>" : "";

    modal.querySelector(".box").innerHTML =
      '<div class="close-row"><button class="icon-btn" data-act="modal-close" aria-label="Close">✕</button></div>' +
      '<img src="' + a.img + '" alt="' + BCi18n.L(a.name) + '" style="width:100%;border:3px solid var(--ink);border-radius:12px;display:block;">' +
      "<h3 style=\"margin:14px 0 6px\">" + BCi18n.L(a.name) + altStr + "</h3>" +
      "<p><strong>" + BCi18n.L(a.line) + "</strong></p>" +
      "<p style=\"margin:0\">" + BCi18n.L(a.fact) + "</p>";
    modal.classList.add("show");
    modal.onclick = function (e) {
      if (e.target === modal) modal.classList.remove("show");
    };
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
