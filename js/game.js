/* game.js — Play page controller: board, chips, shake/reveal/settle */
window.BCGame = (function () {
  "use strict";

  var EMOJI = window.BCGameCore.EMOJI;
  var state = "IDLE";            // IDLE → SHAKING → IDLE
  var selectedChip = 100;
  var pendingTimer = null;
  var pillFrom = 0;

  function $(sel) { return document.querySelector(sel); }
  function byId(id) {
    return BC_DATA.ANIMALS.filter(function (a) { return a.id === id; })[0];
  }

  /* ---------- render ---------- */
  function renderBoard() {
    var board = $(".board");
    board.innerHTML = "";
    BC_DATA.ANIMALS.forEach(function (a, idx) {
      var b = document.createElement("button");
      b.className = "cell";
      b.dataset.animal = a.id;
      b.setAttribute("aria-label", BCi18n.L(a.name));
      b.setAttribute("aria-keyshortcuts", String(idx + 1));
      b.innerHTML =
        '<span class="name">' + BCi18n.L(a.name) + "</span>" +
        '<span class="key-hint" aria-hidden="true">[' + (idx + 1) + ']</span>' +
        '<img src="' + a.img + '" alt="">' +
        '<span class="amt"></span>';
      b.addEventListener("click", function (e) {
        if (e.target.closest(".amt-del")) {
          e.stopPropagation();
          e.preventDefault();
          clearAnimalBet(a.id);
          return;
        }
        onCell(a.id);
      });
      b.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        clearAnimalBet(a.id);
      });
      board.appendChild(b);
    });
  }

  function renderChips() {
    var tray = $(".chip-tray");
    tray.innerHTML = "";
    [10, 50, 100, 500].forEach(function (v) {
      var c = document.createElement("button");
      c.className = "chip" + (v === selectedChip ? " selected" : "");
      c.dataset.value = v;
      c.textContent = v;
      c.setAttribute("aria-label", v + " xu");
      c.addEventListener("click", function () {
        selectedChip = v;
        document.querySelectorAll(".chip").forEach(function (x) {
          x.classList.toggle("selected", x === c);
        });
        BCAudio.chip();
      });
      tray.appendChild(c);
    });
    refreshChipAvailability();
  }

  function refreshChipAvailability() {
    var spendable = BCWallet.balance() - BCWallet.holdTotal();
    document.querySelectorAll(".chip").forEach(function (c) {
      c.disabled = Number(c.dataset.value) > spendable;
    });
    var anyChip = document.querySelector(".chip:not(:disabled)");
    if (anyChip && Number(document.querySelector(".chip.selected").dataset.value) > spendable) {
      document.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("selected"); });
      anyChip.classList.add("selected");
      selectedChip = Number(anyChip.dataset.value);
    }
    var undoBtn = $("[data-act=undo]");
    if (undoBtn) undoBtn.disabled = BCWallet.holdTotal() === 0;
    var clearBtn = $("[data-act=clear]");
    if (clearBtn) clearBtn.disabled = BCWallet.holdTotal() === 0;
    var rebetBtn = $("[data-act=rebet]");
    if (rebetBtn) rebetBtn.disabled = !BCWallet.hasLastBets();
  }

  function renderHolds() {
    var holds = BCWallet.holds();
    var board = document.querySelector(".board");
    var anySel = false;
    document.querySelectorAll(".cell").forEach(function (c) {
      var id = c.dataset.animal;
      var amt = holds[id] || 0;
      var isMax = amt >= BCWallet.MAX_PER_ANIMAL;
      var sel = amt > 0;
      if (sel) anySel = true;
      c.classList.toggle("selected", sel);
      c.setAttribute("aria-pressed", sel ? "true" : "false");
      c.classList.toggle("has-bet", amt > 0);
      c.classList.toggle("is-max-bet", isMax);
      var amtEl = c.querySelector(".amt");
      if (amt > 0) {
        amtEl.innerHTML =
          '<span class="amt-val">' + amt.toLocaleString("vi-VN") + (isMax ? ' <span class="amt-max">MAX</span>' : '') + '</span>' +
          '<button type="button" class="amt-del" title="' + BCi18n.t("play.clearAnimalTip") + '" aria-label="' + BCi18n.t("play.clearAnimalTip") + '">✕</button>';
        amtEl.classList.remove("pop");
        void amtEl.offsetWidth;
        amtEl.classList.add("pop");
      } else {
        amtEl.innerHTML = "";
      }
    });
    if (board) board.classList.toggle("has-selection", anySel);
    refreshChipAvailability();
  }

  function clearAnimalBet(id) {
    if (state !== "IDLE") return;
    var removed = BCWallet.removeAnimalHold(id);
    if (removed > 0) {
      BCAudio.pop();
      var animal = byId(id);
      BCUI.toast(BCi18n.t("play.clearedAnimal", { name: BCi18n.L(animal.name), n: removed.toLocaleString("vi-VN") }));
      renderHolds();
    }
  }

  /* ---------- round flow ---------- */
  function onCell(id) {
    if (state !== "IDLE") return;
    /* đúng luật truyền thống: cược bao nhiêu ô tùy thích (giới hạn bởi xu + MAX/con) */
    var res = BCWallet.addHold(id, selectedChip);
    if (!res.ok) {
      if (res.reason === "max_bet") {
        BCUI.toast(BCi18n.t("play.maxBet", { n: BCWallet.MAX_PER_ANIMAL }), "lose");
        BCAudio.thud();
      } else {
        BCUI.toast(BCi18n.t("play.broke"), "lose");
      }
      return;
    }
    BCAudio.chip();
    renderHolds();
  }

  function shake() {
    if (state !== "IDLE") return;
    if (BCWallet.holdTotal() === 0) {
      BCUI.toast(BCi18n.t("play.needBet"), "lose");
      return;
    }
    state = "SHAKING";
    var reduced = BCUI.reducedMotion();
    pillFrom = BCWallet.balance();
    BCWallet.commit();
    lockBoard(true);
    setStatus(BCi18n.t("play.statusShake"));
    $("[data-act=shake]").disabled = true;
    $("[data-act=rebet]").disabled = true;

    var secs = reduced ? 0.4 : 1.5;
    BCAudio.rattle(secs);
    if (!reduced && "vibrate" in navigator) {
      try { navigator.vibrate([25, 40, 30, 40, 35]); } catch (e) {}
    }
    var bowl = $(".bowl");
    bowl.classList.remove("lifted");
    bowl.classList.add("shaking");
    pendingTimer = setTimeout(finishRound, secs * 1000);
  }

  function finishRound() {
    pendingTimer = null;
    var dice = BCGameCore.rollDice();
    var res = BCWallet.settle(dice);
    var reduced = BCUI.reducedMotion();

    var bowlEl = $(".bowl");
    bowlEl.classList.remove("shaking");
    bowlEl.classList.add("lifted");
    renderDice(dice, reduced ? 0 : 260);
    highlightWinners(res.perCell, reduced ? 0 : 500);
    var msgKey = res.net > 0
      ? (res.matches > 1 ? "play.statusWin" : "play.statusWinOnly")
      : (res.net === 0 ? "play.statusBreak" : "play.statusLose");
    var msg = BCi18n.t(msgKey, { x: res.matches, n: Math.abs(res.net) });
    setStatus(msg);
    spawnFloat(res.net);
    bumpPill();
    if (!reduced && "vibrate" in navigator) {
      try {
        if (res.net > 0) {
          navigator.vibrate(res.matches >= 2 ? [60, 80, 100, 80, 120] : [40, 60, 40]);
        }
      } catch (e) {}
    }
    if (res.net > 0) {
      BCFx.confetti(res.matches >= 2 || res.net >= 200);
    } else if (res.net < 0) {
      BCFx.shake(document.querySelector(".board"), "lose-shake");
    }
    BCUI.toast(msg, res.net > 0 ? "win" : (res.net === 0 ? "gold" : "lose"));
    countPill();
    updateHistory();
    renderHolds();

    $("[data-act=shake]").disabled = false;
    lockBoard(false);

    BCBadges.check("first_round");
    BCBadges.check("first_loss");
    BCBadges.check("streak3");
    setStatusIdleAfter(2.6);
  }

  function countPill() {
    BCFx.countUp(document.querySelector(".coin-pill span"), pillFrom, BCWallet.balance(), 700, BCi18n.t("unit.xu"));
  }

  function setStatusIdleAfter(secs) {
    setTimeout(function () {
      if (state === "IDLE") setStatus(BCi18n.t("play.statusIdle"));
    }, secs * 1000);
  }

  function renderDice(dice, delayMs) {
    var row = $(".dice-row");
    row.innerHTML = "";
    dice.forEach(function (id, i) {
      var die = document.createElement("div");
      die.className = "die";
      var img = document.createElement("img");
      img.src = "assets/img/animals/" + id + ".svg";
      img.alt = BCi18n.L(byId(id).name);
      img.width = 42;
      img.height = 42;
      img.style.imageRendering = "pixelated";
      die.appendChild(img);
      die.setAttribute("aria-label", BCi18n.L(byId(id).name));
      if (delayMs) {
        setTimeout(function () {
        row.appendChild(die);
        BCAudio.clack(520 + i * 140);
      }, delayMs * i);
      } else {
        row.appendChild(die);
      }
    });
  }

  function highlightWinners(perCell, delayMs) {
    setTimeout(function () {
      document.querySelectorAll(".cell").forEach(function (c) {
        var k = perCell[c.dataset.animal] || 0;
        c.classList.toggle("win-flash", k > 0);
      });
      setTimeout(function () {
        document.querySelectorAll(".cell").forEach(function (c) {
          c.classList.remove("win-flash");
        });
      }, 2200);
    }, delayMs);
  }

  function updateHistory() {
    var st = BCStore.load();
    var zone = $(".history-strip");
    zone.innerHTML = "";
    if (!st.rounds.length) {
      zone.innerHTML = '<span class="mut">' + BCi18n.t("play.historyEmpty") + "</span>";
      return;
    }
    st.rounds.forEach(function (r) {
      var div = document.createElement("div");
      div.className = "hist-round";
      div.innerHTML = r.dice.map(function (id) {
        return '<img src="assets/img/animals/' + id + '.svg" width="22" height="22" alt="" style="image-rendering:pixelated;vertical-align:middle;margin:0 2px">';
      }).join("") +
        '<span class="net ' + (r.net > 0 ? "pos" : "neg") + '">' +
        (r.net > 0 ? "+" : "") + r.net + "</span>";
      zone.appendChild(div);
    });
  }

  function spawnFloat(net) {
    var zone = document.querySelector(".bowl-zone");
    if (!zone) return;
    var el = document.createElement("div");
    var cls = net > 0 ? "plus" : (net === 0 ? "zero" : "minus");
    el.className = "float-xu " + cls;
    var key = net > 0 ? "float.plus" : (net === 0 ? "float.zero" : "float.minus");
    el.textContent = net === 0 ? BCi18n.t(key) : BCi18n.t(key, { n: Math.abs(net).toLocaleString("vi-VN") });
    zone.appendChild(el);
    setTimeout(function () { el.remove(); }, 1500);
  }

  function bumpPill() {
    var pill = document.querySelector(".coin-pill");
    if (!pill) return;
    pill.classList.remove("bump");
    void pill.offsetWidth; /* restart animation */
    pill.classList.add("bump");
    setTimeout(function () { pill.classList.remove("bump"); }, 500);
  }

  function setStatus(txt) { $(".status-line").textContent = txt; }

  function lockBoard(lock) {
    state = lock ? "SHAKING" : "IDLE";
    $(".board").classList.toggle("locked", lock);
  }

  /* ---------- boot ---------- */
  function boot() {
    renderBoard(); renderChips(); updateHistory();
    setStatus(BCi18n.t("play.statusIdle"));
    $("[data-act=shake]").addEventListener("click", shake);
    $("[data-act=undo]").addEventListener("click", function () {
      if (state !== "IDLE") return;
      BCWallet.undoHold();
      renderHolds();
      BCAudio.chip();
    });
    $("[data-act=clear]").addEventListener("click", function () {
      if (state !== "IDLE") return;
      BCWallet.clearHolds();
      renderHolds();
    });
    $("[data-act=rebet]").addEventListener("click", function () {
      if (state !== "IDLE") return;
      if (BCWallet.rebet()) { renderHolds(); BCAudio.chip(); }
      else BCUI.toast(BCi18n.t("play.broke"), "lose");
    });
    // tap the bowl zone to skip the shake animation
    $(".bowl-zone").addEventListener("click", function () {
      if (pendingTimer) { clearTimeout(pendingTimer); finishRound(); }
    });

    document.addEventListener("keydown", function (e) {
      if (e.target && e.target.matches && (e.target.matches("input, textarea, select") || e.target.isContentEditable)) return;
      var key = (e.key || "").toLowerCase();
      if ((e.key === "Enter" || e.code === "Space") && state === "IDLE") {
        e.preventDefault();
        shake();
        return;
      }
      if (state === "IDLE" && e.key >= "1" && e.key <= "6") {
        var num = parseInt(e.key, 10);
        if (num >= 1 && num <= BC_DATA.ANIMALS.length) {
          e.preventDefault();
          onCell(BC_DATA.ANIMALS[num - 1].id);
        }
        return;
      }
      if (state === "IDLE" && (key === "u" || ((e.ctrlKey || e.metaKey) && key === "z"))) {
        var uBtn = $("[data-act=undo]");
        if (uBtn && !uBtn.disabled) { e.preventDefault(); uBtn.click(); }
        return;
      }
      if (state === "IDLE" && key === "c") {
        var cBtn = $("[data-act=clear]");
        if (cBtn && !cBtn.disabled) { e.preventDefault(); cBtn.click(); }
        return;
      }
      if (state === "IDLE" && key === "r") {
        var rBtn = $("[data-act=rebet]");
        if (rBtn && !rBtn.disabled) { e.preventDefault(); rBtn.click(); }
        return;
      }
      if (state === "IDLE" && key === "l") {
        e.preventDefault();
        var qBtn = document.querySelector("[data-act=quick-lixi]");
        if (qBtn) qBtn.click();
        return;
      }
    });

    BCWallet.onChange(function () {
      refreshChipAvailability();
    });

    BCi18n.onLangChange(function () {
      document.querySelectorAll(".cell .name").forEach(function (el, i) {
        el.textContent = BCi18n.L(BC_DATA.ANIMALS[i].name);
      });
      if (state === "IDLE") setStatus(BCi18n.t("play.statusIdle"));
    });

    var helpBtn = document.querySelector("[data-act=help]");
    if (helpBtn) helpBtn.addEventListener("click", showHelp);

    if (!BCStore.load().coachDone) showCoach();
  }

  /* FR-38: rules modal, always reachable */
  function showHelp() {
    var m = document.querySelector("#modal-help");
    m.querySelector("#help-box").innerHTML =
      "<div class=\"close-row\"><button class=\"icon-btn\" data-act=\"help-close\">✕</button></div>" +
      "<h3>" + BCi18n.t("help.title") + "</h3>" +
      "<div class=\"steps\">" + step(1, "coach.1") + step(2, "coach.2") + step(3, "coach.3") + "</div>" +
      "<p><strong>" + BCi18n.t("help.payout") + "</strong></p>" +
      "<ul>" +
      "<li>" + BCi18n.t("learn.rule.0") + "</li>" +
      "<li>" + BCi18n.t("learn.rule.1") + "</li>" +
      "<li>" + BCi18n.t("learn.rule.2") + "</li>" +
      "<li>" + BCi18n.t("learn.rule.3") + "</li>" +
      "</ul>" +
      "<a class=\"btn-bc btn-sm\" href=\"learn.html\">" + BCi18n.t("help.link") + "</a>";
    m.classList.add("show");
    m.onclick = function (e) {
      if (e.target === m) m.classList.remove("show");
    };
    m.querySelector("[data-act=help-close]").addEventListener("click", function () {
      m.classList.remove("show");
    });
  }

  /* ---------- first-visit coach marks ---------- */
  function showCoach() {
    var d = document.createElement("div");
    d.className = "coach";
    d.innerHTML =
      '<div class="box card-bc">' +
      "<h3>" + BCi18n.t("coach.t") + "</h3>" +
      '<div class="steps">' +
      step(1, "coach.1") + step(2, "coach.2") + step(3, "coach.3") +
      "</div>" +
      '<button class="btn-bc btn-gold" data-act="coach-ok">' + BCi18n.t("coach.btn") + "</button>" +
      "</div>";
    document.body.appendChild(d);
    d.querySelector("[data-act=coach-ok]").addEventListener("click", function () {
      BCStore.load().coachDone = true;
      BCStore.save();
      d.remove();
      BCAudio.pop();
    });
  }

  function step(n, key) {
    return '<div class="step-row"><span class="n">' + n + "</span><span>" + BCi18n.t(key) + "</span></div>";
  }

  return { boot: boot };
})();
