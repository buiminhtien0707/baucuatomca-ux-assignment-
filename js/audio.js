/* audio.js — synthesized sound effects (Web Audio API, no audio files)
   Sounds: rattle (dice), chip (place), win, lose, pop (UI), drum (lì xì)  */
window.BCAudio = (function () {
  "use strict";
  var ctx = null, master = null;

  function ensure() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function muted() { return BCStore.load().muted; }

  /* short filtered-noise burst, repeated = dice rattle */
  function burst(at, freq, dur, vol) {
    var c = ctx, len = Math.floor(c.sampleRate * dur);
    var buf = c.createBuffer(1, len, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = c.createBufferSource(); src.buffer = buf;
    var f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq;
    var g = c.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(master);
    src.start(at);
  }

  function tone(at, freq, dur, type, vol, slideTo) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "triangle"; o.frequency.setValueAtTime(freq, at);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, at + dur);
    g.gain.setValueAtTime(vol, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(master);
    o.start(at); o.stop(at + dur + 0.02);
  }

  return {
    init: function () { ensure(); },
    rattle: function (secs) {
      if (muted() || !ensure()) return;
      var t0 = ctx.currentTime, n = Math.floor((secs || 1.4) / 0.09);
      for (var i = 0; i < n; i++) burst(t0 + i * 0.09 + Math.random() * 0.02, 1800 + Math.random() * 900, 0.05, 0.5);
    },
    chip: function () {
      if (muted() || !ensure()) return;
      tone(ctx.currentTime, 950, 0.06, "square", 0.18);
    },
    pop: function () {
      if (muted() || !ensure()) return;
      tone(ctx.currentTime, 420, 0.09, "triangle", 0.2, 720);
    },
    win: function () {
      if (muted() || !ensure()) return;
      var t0 = ctx.currentTime;
      [523, 659, 784, 1047].forEach(function (f, i) { tone(t0 + i * 0.09, f, 0.16, "triangle", 0.25); });
    },
    lose: function () {
      if (muted() || !ensure()) return;
      var t0 = ctx.currentTime;
      tone(t0, 220, 0.3, "sine", 0.3, 130);
    },
    drum: function () {
      if (muted() || !ensure()) return;
      var t0 = ctx.currentTime;
      tone(t0, 150, 0.25, "sine", 0.5, 60);
      burst(t0, 300, 0.12, 0.4);
    }
  };
})();
