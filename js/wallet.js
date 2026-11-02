/* wallet.js — virtual-coin economy: hold/commit/settle, lì xì, stats */
window.BCWallet = (function () {
  "use strict";

  var listeners = [];

  function s() { return BCStore.load(); }

  function emit() { listeners.forEach(function (fn) { fn(); }); }
  function onChange(fn) { listeners.push(fn); }

  /* ---------- bets (hold until SHAKE commits them) ---------- */
  var holds = {};
  var placed = [];      // stack of {id, amt} — undo removes the last placed chip
  var lastBets = {};
  var lastStaked = 0;
  var MAX_PER_ANIMAL = 500;

  function holdTotal() {
    return Object.keys(holds).reduce(function (a, id) { return a + holds[id]; }, 0);
  }
  function addHold(id, amt) {
    if ((holds[id] || 0) + amt > MAX_PER_ANIMAL) {
      return { ok: false, reason: "max_bet", max: MAX_PER_ANIMAL };
    }
    if (holdTotal() + amt > s().balance) {
      return { ok: false, reason: "broke" };
    }
    holds[id] = (holds[id] || 0) + amt;
    placed.push({ id: id, amt: amt });
    return { ok: true };
  }
  function removeAnimalHold(id) {
    if (!holds[id]) return 0;
    var removed = holds[id];
    delete holds[id];
    placed = placed.filter(function (p) { return p.id !== id; });
    return removed;
  }
  function undoHold() {
    var last = placed.pop();
    if (!last) return false;
    holds[last.id] -= last.amt;
    if (holds[last.id] <= 0) delete holds[last.id];
    return true;
  }
  function clearHolds() { holds = {}; placed = []; }
  function rememberBets() { lastBets = JSON.parse(JSON.stringify(holds)); }
  function rebet() {
    if (!Object.keys(lastBets).length) return false;
    var total = Object.keys(lastBets).reduce(function (a, id) { return a + lastBets[id]; }, 0);
    if (total > s().balance) return false;
    holds = JSON.parse(JSON.stringify(lastBets));
    return true;
  }

  /* ---------- round money flow ---------- */
  function commit() {
    var staked = holdTotal();
    lastStaked = staked;
    s().balance -= staked;
    rememberBets();
    clearHolds();
    BCStore.save();
    emit();
    return staked;
  }

  function settle(dice) {           // dice = [idx,idx,idx] of animal ids
    var st = s();
    var payout = 0, matches = 0;
    var perCell = {};
    Object.keys(lastBets).forEach(function (id) {
      var bet = lastBets[id] || 0;
      if (!bet) return;
      var k = dice.filter(function (d) { return d === id; }).length;
      perCell[id] = k;
      matches = Math.max(matches, k);
      payout += k === 0 ? 0 : bet * (k + 1);   // 0 matches = lose stake      // stake back + k× prize
    });
    st.balance += payout;
    var net = payout - lastStaked;
    st.stats.played += 1;
    if (net > 0) { st.stats.won += 1; st.stats.streak += 1; st.stats.bestStreak = Math.max(st.stats.bestStreak, st.stats.streak); }
    else if (net < 0) { st.stats.lost += 1; st.stats.streak = 0; }
    st.rounds.unshift({ dice: dice, net: net });
    st.rounds = st.rounds.slice(0, 10);
    st.stats.peak = Math.max(st.stats.peak, st.balance);
    BCStore.save();
    emit();
    return { net: net, perCell: perCell, matches: matches };
  }

  /* ---------- lì xì: unlimited ---------- */
  function today() { return new Date().toISOString().slice(0, 10); }
  function canClaimLiXi() {
    return true;
  }
  function claimLiXi() {
    var st = s();
    st.balance += 500;
    st.lastLiXi = today();
    BCStore.save();
    emit();
    return true;
  }

  /* ---------- return-visit tracking ---------- */
  function touchVisit() {
    var st = s();
    var t = today();
    if (st.lastVisit && st.lastVisit !== t) {
      st.stats._prevVisit = st.lastVisit;
    }
    st.lastVisit = t;
    BCStore.save();
  }

  return {
    onChange: onChange, balance: function () { return s().balance; },
    holdTotal: holdTotal, addHold: addHold, removeAnimalHold: removeAnimalHold, undoHold: undoHold, clearHolds: clearHolds,
    commit: commit, settle: settle, rebet: rebet, hasLastBets: function () { return Object.keys(lastBets).length > 0; },
    canClaimLiXi: canClaimLiXi, claimLiXi: claimLiXi, touchVisit: touchVisit,
    lastBets: function () { return lastBets; },
    holds: function () { return JSON.parse(JSON.stringify(holds)); },
    MAX_PER_ANIMAL: MAX_PER_ANIMAL
  };
})();
