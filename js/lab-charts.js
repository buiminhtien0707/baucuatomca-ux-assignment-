/* lab-charts.js — hand-drawn canvas charts (no libraries) */
window.BCLabCharts = (function () {
  "use strict";

  function prep(canvas) {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    return canvas.getContext("2d");
  }

  function draw(matchCounts, series) {
    drawBar(matchCounts);
    drawLine(series);
  }

  function drawBar(counts) {
    var canvas = document.querySelector("#chart-bar");
    if (!canvas) return;
    var g = prep(canvas);
    var w = canvas.clientWidth, h = canvas.clientHeight, m = 26;
    g.clearRect(0, 0, w, h);
    var max = Math.max.apply(null, counts.concat([1]));
    var bw = (w - m * 2 - 30) / 4;
    var labels = ["0", "1", "2", "3"];
    counts.forEach(function (c, i) {
      var bh = (h - m * 2) * (c / max);
      g.fillStyle = "#2F4BD8";
      g.fillRect(m + i * (bw + 10), h - m - bh, bw, bh);
      g.fillStyle = "#141414";
      g.font = "12px 'Space Mono',monospace";
      g.textAlign = "center";
      g.fillText(String(c), m + i * (bw + 10) + bw / 2, h - m - bh - 6);
      g.fillText(labels[i], m + i * (bw + 10) + bw / 2, h - 8);
    });
  }

  function drawLine(series) {
    var canvas = document.querySelector("#chart-line");
    if (!canvas) return;
    var g = prep(canvas);
    var w = canvas.clientWidth, h = canvas.clientHeight, m = 26;
    g.clearRect(0, 0, w, h);
    var min = Math.min.apply(null, series);
    var max = Math.max.apply(null, series);
    if (Math.abs(max - min) < 0.001) { min -= 1; max += 1; }
    g.strokeStyle = "#E8442E"; g.lineWidth = 3;
    g.beginPath();
    series.forEach(function (v, i) {
      var x = m + (w - m * 2) * (i / (series.length - 1));
      var y = h - m - (h - m * 2) * ((v - min) / (max - min));
      if (i) g.lineTo(x, y); else g.moveTo(x, y);
    });
    g.stroke();
    g.strokeStyle = "#999"; g.lineWidth = 1; g.setLineDash([4, 4]);
    g.beginPath();
    var y0 = h - m - (h - m * 2) * ((1000 - min) / (max - min));
    g.moveTo(m, y0); g.lineTo(w - m, y0);
    g.stroke(); g.setLineDash([]);
  }

  return { draw: draw };
})();
