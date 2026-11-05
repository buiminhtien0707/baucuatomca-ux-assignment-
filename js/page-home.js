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
    initHeroShaker();
    BCi18n.onLangChange(function () {
      zone.innerHTML = "";
      BC_DATA.ANIMALS.forEach(function (a) { addCard(zone, a); });
      renderFaq();
    });
  }

  /* hero interactive shaker teaser */
  function initHeroShaker() {
    var btn = document.querySelector("#btn-hero-shake");
    if (!btn) return;

    var dice = [
      document.querySelector("#hdice-0"),
      document.querySelector("#hdice-1"),
      document.querySelector("#hdice-2")
    ];
    var fortuneEl = document.querySelector("#hero-fortune");
    var statusEl = document.querySelector("#hero-shaker-status");
    var isRolling = false;
    var rollCount = 0;

    btn.addEventListener("click", function () {
      if (isRolling) return;
      isRolling = true;
      rollCount++;

      if (window.BCAudio) BCAudio.rattle(0.65);

      dice.forEach(function (d) { if (d) d.classList.add("is-rolling"); });
      if (fortuneEl) fortuneEl.innerHTML = '<span style="color:var(--gold);font-weight:800;animation:pulseLive 0.8s infinite">🎲 Đang xóc đĩa... lộc đang tới!</span>';
      btn.disabled = true;
      btn.style.opacity = "0.7";

      var shuffle = setInterval(function () {
        dice.forEach(function (d) {
          if (!d) return;
          var rand = BC_DATA.ANIMALS[Math.floor(Math.random() * BC_DATA.ANIMALS.length)];
          var img = d.querySelector("img");
          var lbl = d.querySelector(".die-label");
          if (img) img.src = rand.img;
          if (lbl) lbl.textContent = BCi18n.L(rand.name);
        });
      }, 70);

      setTimeout(function () {
        clearInterval(shuffle);
        dice.forEach(function (d) { if (d) d.classList.remove("is-rolling"); });

        var r0 = BC_DATA.ANIMALS[Math.floor(Math.random() * BC_DATA.ANIMALS.length)];
        var r1 = BC_DATA.ANIMALS[Math.floor(Math.random() * BC_DATA.ANIMALS.length)];
        var r2 = BC_DATA.ANIMALS[Math.floor(Math.random() * BC_DATA.ANIMALS.length)];

        var res = [r0, r1, r2];
        res.forEach(function (r, idx) {
          if (!dice[idx]) return;
          var img = dice[idx].querySelector("img");
          var lbl = dice[idx].querySelector(".die-label");
          if (img) img.src = r.img;
          if (lbl) lbl.textContent = BCi18n.L(r.name);
        });

        if (statusEl) statusEl.textContent = "Ván #" + rollCount + " · Lắc vui";

        // Fortune text
        var msg = "";
        if (r0.id === r1.id && r1.id === r2.id) {
          msg = "🔥 TAM HOA 3 CON " + BCi18n.L(r0.name).toUpperCase() + "! Đại hồng phát cả năm!";
        } else if (r0.id === r1.id || r1.id === r2.id || r0.id === r2.id) {
          var pair = (r0.id === r1.id) ? r0 : r2;
          msg = "🎋 Về Cặp 2 " + BCi18n.L(pair.name) + "! Tài lộc nhân đôi, may mắn ngập tràn!";
        } else {
          msg = "✨ Ra 3 mặt " + BCi18n.L(r0.name) + " · " + BCi18n.L(r1.name) + " · " + BCi18n.L(r2.name) + "! Khai xuân đắc lộc!";
        }

        if (fortuneEl) fortuneEl.innerHTML = '<span style="color:var(--red)">' + msg + '</span>';

        if (window.BCAudio) BCAudio.win();
        if (window.BCFx) BCFx.confetti(false);

        btn.disabled = false;
        btn.style.opacity = "1";
        isRolling = false;
      }, 700);
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
