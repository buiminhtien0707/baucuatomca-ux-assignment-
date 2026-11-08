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
    initHowInteractive();
    BCi18n.onLangChange(function () {
      zone.innerHTML = "";
      BC_DATA.ANIMALS.forEach(function (a) { addCard(zone, a); });
      renderFaq();
      if (updateHowLang) updateHowLang();
    });
  }

  var updateHowLang = null;

  function initHowInteractive() {
    var section = document.querySelector("#how-to-play");
    if (!section) return;

    var currentChip = 100;
    var currentAnimalIdx = 1; // 1 = Cua
    var isRolling = false;
    var currentDiceIdxs = [1, 1, 3]; // Cua, Cua, Cá

    var chips = section.querySelectorAll(".demo-chip");
    var cellDemo = section.querySelector(".how-cell-demo");
    var betPill = section.querySelector(".cell-bet-pill");
    var cellImg = section.querySelector(".cell-info img");
    var cellLabel = section.querySelector(".cell-info .cell-label");
    var diceDemo = section.querySelector(".how-dice-demo");
    var payoutPill = section.querySelector(".demo-payout-pill");
    var diceEls = section.querySelectorAll(".demo-die");

    function getLang() {
      return (window.BCStore && BCStore.load().lang) || "en";
    }

    function getAnimalName(a) {
      var l = getLang();
      if (l === "vn") return a.name.vn.toUpperCase();
      if (l === "zh") return a.name.zh;
      return a.name.en.toUpperCase();
    }

    function spawnClickBurst(el, e) {
      if (!el) return;
      var rect = el.getBoundingClientRect();
      var x = (e && e.clientX) ? (e.clientX - rect.left) : (rect.width / 2);
      var y = (e && e.clientY) ? (e.clientY - rect.top) : (rect.height / 2);
      var ripple = document.createElement("span");
      ripple.className = "how-click-burst";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      el.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 500);
    }

    function updatePayoutText(matchCount) {
      if (!payoutPill) return;
      var curA = BC_DATA.ANIMALS[currentAnimalIdx];
      var name = getAnimalName(curA);
      var l = getLang();

      if (matchCount > 0) {
        if (l === "vn") {
          payoutPill.textContent = "Khớp " + matchCount + " " + name + ": Hoàn gốc + Ăn ×" + matchCount + "!";
        } else if (l === "zh") {
          payoutPill.textContent = "中 " + matchCount + " 个" + name + "：返还本金 + 赔 " + matchCount + "×！";
        } else {
          payoutPill.textContent = matchCount + " " + name + " matched: Stake back + Win ×" + matchCount + "!";
        }
        payoutPill.style.background = matchCount === 3 ? "var(--red)" : "var(--gold)";
        payoutPill.style.color = matchCount === 3 ? "var(--ink-on-dark)" : "var(--ink)";
      } else {
        if (l === "vn") {
          payoutPill.textContent = "Chưa trúng " + name + " — Nhấn để lắc lại! 🎲";
        } else if (l === "zh") {
          payoutPill.textContent = "未中 " + name + " — 点击再试一次！🎲";
        } else {
          payoutPill.textContent = "No " + name + " matched — Tap to roll again! 🎲";
        }
        payoutPill.style.background = "var(--cream)";
        payoutPill.style.color = "var(--mut-ink)";
      }
    }

    updateHowLang = function () {
      var curA = BC_DATA.ANIMALS[currentAnimalIdx];
      if (cellLabel) cellLabel.textContent = getAnimalName(curA);
      // count current matches
      var matches = currentDiceIdxs.filter(function (idx) { return idx === currentAnimalIdx; }).length;
      updatePayoutText(matches);
    };

    // 1. Step 1: Chips
    chips.forEach(function (chip) {
      chip.addEventListener("click", function (e) {
        e.stopPropagation();
        var val = parseInt(chip.getAttribute("data-val") || chip.textContent, 10);
        if (!val) return;
        currentChip = val;
        chips.forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        chip.classList.remove("pop-anim");
        void chip.offsetWidth;
        chip.classList.add("pop-anim");
        if (window.BCAudio) BCAudio.chip();

        if (betPill) {
          betPill.textContent = "+" + currentChip + " xu";
          betPill.classList.remove("pop-anim");
          void betPill.offsetWidth;
          betPill.classList.add("pop-anim");
        }
        spawnClickBurst(chip, e);
      });
    });

    // 2. Step 2: Animal cell
    function cycleAnimal(e) {
      currentAnimalIdx = (currentAnimalIdx + 1) % BC_DATA.ANIMALS.length;
      var a = BC_DATA.ANIMALS[currentAnimalIdx];
      if (cellImg) {
        cellImg.src = a.img;
        cellImg.alt = getAnimalName(a);
      }
      if (cellLabel) {
        cellLabel.textContent = getAnimalName(a);
      }
      if (betPill) {
        betPill.textContent = "+" + currentChip + " xu";
        betPill.classList.remove("pop-anim");
        void betPill.offsetWidth;
        betPill.classList.add("pop-anim");
      }
      if (cellDemo) {
        cellDemo.classList.remove("cell-pulse");
        void cellDemo.offsetWidth;
        cellDemo.classList.add("cell-pulse");
      }
      if (window.BCAudio) BCAudio.chip();
      spawnClickBurst(cellDemo || section.querySelector('.how-card[data-step="2"]'), e);

      // Recalculate payout with current dice
      var matches = currentDiceIdxs.filter(function (idx) { return idx === currentAnimalIdx; }).length;
      diceEls.forEach(function (dieEl, idx) {
        if (currentDiceIdxs[idx] === currentAnimalIdx) {
          dieEl.classList.add("winner");
        } else {
          dieEl.classList.remove("winner");
        }
      });
      updatePayoutText(matches);
    }

    if (cellDemo) {
      cellDemo.addEventListener("click", function (e) {
        e.stopPropagation();
        cycleAnimal(e);
      });
    }

    // 3. Step 3: Dice roll
    function rollDemoDice(e) {
      if (isRolling) return;
      isRolling = true;
      if (window.BCAudio) BCAudio.rattle(0.4);

      diceEls.forEach(function (d) {
        d.classList.add("rolling");
        d.classList.remove("winner");
      });
      spawnClickBurst(diceDemo || section.querySelector('.how-card[data-step="3"]'), e);

      setTimeout(function () {
        diceEls.forEach(function (d) { d.classList.remove("rolling"); });

        var rollIdxs = [];
        var r = Math.random();
        if (r < 0.45) {
          // 2 matches
          rollIdxs = [currentAnimalIdx, currentAnimalIdx, Math.floor(Math.random() * BC_DATA.ANIMALS.length)];
        } else if (r < 0.75) {
          // 1 match
          rollIdxs = [currentAnimalIdx, Math.floor(Math.random() * BC_DATA.ANIMALS.length), Math.floor(Math.random() * BC_DATA.ANIMALS.length)];
        } else if (r < 0.85) {
          // 3 matches!
          rollIdxs = [currentAnimalIdx, currentAnimalIdx, currentAnimalIdx];
        } else {
          // random
          rollIdxs = [
            Math.floor(Math.random() * BC_DATA.ANIMALS.length),
            Math.floor(Math.random() * BC_DATA.ANIMALS.length),
            Math.floor(Math.random() * BC_DATA.ANIMALS.length)
          ];
        }
        rollIdxs.sort(function () { return 0.5 - Math.random(); });
        currentDiceIdxs = rollIdxs;

        var matchCount = 0;
        diceEls.forEach(function (dieEl, idx) {
          var a = BC_DATA.ANIMALS[rollIdxs[idx]];
          var img = dieEl.querySelector("img");
          if (img) {
            img.src = a.img;
            img.alt = getAnimalName(a);
          }
          if (rollIdxs[idx] === currentAnimalIdx) {
            matchCount++;
            dieEl.classList.add("winner");
          }
        });

        if (matchCount > 0) {
          if (window.BCAudio) BCAudio.win();
          if (matchCount === 3 && window.BCFx) BCFx.confetti(true);
        } else {
          if (window.BCAudio) BCAudio.pop();
        }

        updatePayoutText(matchCount);
        if (payoutPill) {
          payoutPill.classList.remove("pop-anim");
          void payoutPill.offsetWidth;
          payoutPill.classList.add("pop-anim");
        }

        isRolling = false;
      }, 400);
    }

    if (diceDemo) {
      diceDemo.addEventListener("click", function (e) {
        e.stopPropagation();
        rollDemoDice(e);
      });
    }

    // Card-level click handlers
    var card1 = section.querySelector('.how-card[data-step="1"]');
    if (card1) {
      card1.addEventListener("click", function (e) {
        if (e.target.closest(".demo-chip")) return;
        var chipVals = [10, 50, 100, 500];
        var nextIdx = (chipVals.indexOf(currentChip) + 1) % chipVals.length;
        var targetChip = section.querySelector('.demo-chip[data-val="' + chipVals[nextIdx] + '"]');
        if (targetChip) targetChip.click();
      });
    }

    var card2 = section.querySelector('.how-card[data-step="2"]');
    if (card2) {
      card2.addEventListener("click", function (e) {
        if (e.target.closest(".how-cell-demo")) return;
        cycleAnimal(e);
      });
    }

    var card3 = section.querySelector('.how-card[data-step="3"]');
    if (card3) {
      card3.addEventListener("click", function (e) {
        if (e.target.closest(".how-dice-demo")) return;
        rollDemoDice(e);
      });
    }

    // Initial label
    updateHowLang();
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
    var lang = (BCStore.load && BCStore.load().lang) || "en";
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
