/* game-core.js — pure game logic (no DOM) */
window.BCGameCore = (function () {
  "use strict";

  var EMOJI = { bau: "🍈", cua: "🦀", tom: "🦐", ca: "🐟", ga: "🐔", huou: "🦌" };

  function rollDice() {
    var ids = ["bau", "cua", "tom", "ca", "ga", "huou"];
    var out = [];
    for (var i = 0; i < 3; i++) {
      if (window.crypto && crypto.getRandomValues) {
        out.push(ids[crypto.getRandomValues(new Uint32Array(1))[0] % 6]);
      } else {
        out.push(ids[Math.floor(Math.random() * 6)]);
      }
    }
    return out;
  }

  /* bets: {id: amount}; dice: [id,id,id]
     payout per cell = stake back + k× prize; net = payout − total stake */
  function evaluate(bets, dice) {
    var staked = 0, payout = 0, matches = 0;
    var perCell = {};
    Object.keys(bets).forEach(function (id) {
      var b = bets[id] || 0;
      staked += b;
      var k = dice.filter(function (d) { return d === id; }).length;
      perCell[id] = k;
      matches = Math.max(matches, k);
      payout += k === 0 ? 0 : b * (k + 1);   // 0 matches = lose stake
    });
    return { staked: staked, payout: payout, net: payout - staked, perCell: perCell, matches: matches };
  }

  return { EMOJI: EMOJI, rollDice: rollDice, evaluate: evaluate };
})();
