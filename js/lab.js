/* lab.js — probability simulator (logic + boot) */
window.BCLab = (function () {
  "use strict";

  var cells = 1, rounds = 100, speed = "fast", running = false;
  var matchCounts = [0, 0, 0, 0];
  var series = [1000];
  var stakedTotal = 0;

  function $(sel) { return document.querySelector(sel); }

  function boot() {
    if (!document.querySelector("#lab-root")) return;
    document.querySelectorAll('input[name="cells"]').forEach(function (r) {
      r.addEventListener("change", function () { cells = Number(r.value); });
    });
    document.querySelectorAll('input[name="rounds"]').forEach(function (r) {
      r.addEventListener("change", function () { rounds = Number(r.value); });
    });
    document.querySelectorAll('input[name="speed"]').forEach(function (r) {
      r.addEventListener("change", function () { speed = r.value; });
    });
    document.querySelector("[data-act=lab-run]").addEventListener("click", run);
    BCi18n.onLangChange(function () { BCLabCharts.draw(matchCounts, series); });
  }
  document.addEventListener("DOMContentLoaded", boot);

  function run() {
    if (running) return;
    running = true;
    var done = 0;
    matchCounts = [0, 0, 0, 0];
    series = [1000];
    stakedTotal = 0;
    var coins = 1000;
    var runBtn = document.querySelector("[data-act=lab-run]");
    if (runBtn) runBtn.disabled = true;

    function stepOne() {
      var dice = BCGameCore.rollDice();
      var bets = {};
      if (cells === 1) {
        bets.bau = 100;
      } else {
        bets.bau = 100; bets.cua = 100; bets.tom = 100;
      }
      var r = BCGameCore.evaluate(bets, dice);
      coins += r.payout - r.staked;
      series.push(coins);
      matchCounts[r.matches] += 1;
      stakedTotal += r.staked;
      done++;

      BCLabCharts.draw(matchCounts, series);
      var pct = Math.floor((done / rounds) * 100);
      live().textContent = BCi18n.t("lab.running", { x: pct }) + " (" + done + "/" + rounds + " ván · " + coins + " xu)";

      if (done < rounds) {
        setTimeout(stepOne, 75);
      } else {
        finish();
      }
    }

    function chunk() {
      var target = Math.min(done + 25, rounds);
      for (; done < target; done++) {
        var dice = BCGameCore.rollDice();
        var bets = {};
        if (cells === 1) {
          bets.bau = 100;
        } else {
          bets.bau = 100; bets.cua = 100; bets.tom = 100;
        }
        var r = BCGameCore.evaluate(bets, dice);
        coins += r.payout - r.staked;
        series.push(coins);
        matchCounts[r.matches] += 1;
        stakedTotal += r.staked;
      }
      BCLabCharts.draw(matchCounts, series);
      var pct = Math.floor((done / rounds) * 100);
      live().textContent = BCi18n.t("lab.running", { x: pct });
      if (done < rounds) {
        requestAnimationFrame(chunk);
      } else {
        finish();
      }
    }

    function finish() {
      var ev = ((coins - 1000) / stakedTotal) * 100;
      live().textContent = BCi18n.t("lab.evReal", { x: ev.toFixed(1) });
      running = false;
      if (runBtn) runBtn.disabled = false;
      BCBadges.check("lab_run");
      BCAudio.pop();
    }

    if (speed === "slow") {
      stepOne();
    } else {
      requestAnimationFrame(chunk);
    }
  }

  function live() { return document.querySelector("#lab-live"); }

  return { boot: boot, run: run };
})();
