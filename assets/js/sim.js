// Illustrative Monte Carlo: geometric Brownian motion fan chart. Not market data.
(function () {
  var cv = document.getElementById("sim");
  if (!cv) return;
  var ctx = cv.getContext("2d");
  var S0 = 100, T = 252, dt = 1 / 252;
  var el = {
    mu: document.getElementById("mu"), sg: document.getElementById("sg"),
    muV: document.getElementById("mu-v"), sgV: document.getElementById("sg-v"),
    run: document.getElementById("rerun"),
    mean: document.getElementById("r-mean"), p5: document.getElementById("r-p5"),
    p95: document.getElementById("r-p95"), loss: document.getElementById("r-loss")
  };
  var N = 120, seed = 20260926, paths = [], bands = null, prog = 1, raf = 0;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function css(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function q(sorted, p) { var i = (sorted.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo); }

  function simulate() {
    var mu = +el.mu.value / 100, sg = +el.sg.value / 100, r = rng(seed);
    paths = [];
    for (var i = 0; i < N; i++) {
      var s = S0, p = [s];
      for (var t = 1; t <= T; t++) {
        var u1 = r() || 1e-9, u2 = r(), z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        s *= Math.exp((mu - 0.5 * sg * sg) * dt + sg * Math.sqrt(dt) * z);
        p.push(s);
      }
      paths.push(p);
    }
    bands = { p5: [], p25: [], p50: [], p75: [], p95: [] };
    for (var k = 0; k <= T; k++) {
      var col = paths.map(function (p) { return p[k]; }).sort(function (a, b) { return a - b; });
      bands.p5.push(q(col, .05)); bands.p25.push(q(col, .25)); bands.p50.push(q(col, .5)); bands.p75.push(q(col, .75)); bands.p95.push(q(col, .95));
    }
    var fin = paths.map(function (p) { return p[T]; }).sort(function (a, b) { return a - b; });
    var mean = fin.reduce(function (a, b) { return a + b; }, 0) / fin.length;
    el.mean.textContent = mean.toFixed(1);
    el.p5.textContent = q(fin, .05).toFixed(1);
    el.p95.textContent = q(fin, .95).toFixed(1);
    var loss = fin.filter(function (v) { return v < S0; }).length / fin.length;
    el.loss.textContent = (loss * 100).toFixed(0) + "%";
    el.muV.textContent = el.mu.value + "%";
    el.sgV.textContent = el.sg.value + "%";
  }

  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    var w = cv.clientWidth, h = cv.clientHeight, L = 44, R = 12, Tp = 12, B = 22;
    var cLine = css("--line"), cDim = css("--faint"), cAmb = css("--amber"), cTxt = css("--dim");
    ctx.clearRect(0, 0, w, h);
    var lo = Infinity, hi = -Infinity;
    for (var k = 0; k <= T; k++) { lo = Math.min(lo, bands.p5[k]); hi = Math.max(hi, bands.p95[k]); }
    lo = Math.floor(lo * 0.94 / 10) * 10; hi = Math.ceil(hi * 1.04 / 10) * 10;
    function X(k) { return L + (w - L - R) * k / T; }
    function Y(v) { return Tp + (h - Tp - B) * (1 - (v - lo) / (hi - lo)); }
    ctx.font = "10.5px 'IBM Plex Mono', ui-monospace, monospace"; ctx.textBaseline = "middle";
    var step = (hi - lo) > 140 ? 40 : 20;
    for (var v = Math.ceil(lo / step) * step; v <= hi; v += step) {
      ctx.strokeStyle = cLine; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L, Y(v) + .5); ctx.lineTo(w - R, Y(v) + .5); ctx.stroke();
      ctx.fillStyle = cDim; ctx.textAlign = "right"; ctx.fillText(v, L - 8, Y(v));
    }
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    [0, 63, 126, 189, 252].forEach(function (d) { ctx.fillStyle = cDim; ctx.fillText(d === 0 ? "t0" : d + "d", Math.min(Math.max(X(d), L + 8), w - R - 8), h - B + 6); });
    ctx.strokeStyle = cDim; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(L, Y(S0) + .5); ctx.lineTo(w - R, Y(S0) + .5); ctx.stroke(); ctx.setLineDash([]);

    var kmax = Math.max(1, Math.round(prog * T));
    function band(a, b, alpha) {
      ctx.beginPath();
      for (var k = 0; k <= kmax; k++) ctx[k ? "lineTo" : "moveTo"](X(k), Y(bands[a][k]));
      for (k = kmax; k >= 0; k--) ctx.lineTo(X(k), Y(bands[b][k]));
      ctx.closePath(); ctx.globalAlpha = alpha; ctx.fillStyle = cAmb; ctx.fill(); ctx.globalAlpha = 1;
    }
    band("p5", "p95", .10); band("p25", "p75", .16);
    ctx.lineWidth = 1; ctx.strokeStyle = cTxt; ctx.globalAlpha = .22;
    for (var i = 0; i < 40; i++) { ctx.beginPath(); for (k = 0; k <= kmax; k++) ctx[k ? "lineTo" : "moveTo"](X(k), Y(paths[i][k])); ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.lineWidth = 1.6; ctx.strokeStyle = cAmb;
    ctx.beginPath(); for (k = 0; k <= kmax; k++) ctx[k ? "lineTo" : "moveTo"](X(k), Y(bands.p50[k])); ctx.stroke();
  }

  function play() {
    cancelAnimationFrame(raf);
    if (reduce) { prog = 1; draw(); return; }
    var t0 = null; prog = 0;
    (function frame(ts) {
      if (t0 === null) t0 = ts;
      prog = Math.min(1, (ts - t0) / 1400);
      draw();
      if (prog < 1) raf = requestAnimationFrame(frame);
    })(performance.now());
  }

  function rerun(newSeed) { if (newSeed) { seed = (Math.random() * 1e9) | 0; simulate(); play(); } else { simulate(); cancelAnimationFrame(raf); prog = 1; draw(); } }
  el.run.addEventListener("click", function () { rerun(true); });
  ["input", "change"].forEach(function (ev) { el.mu.addEventListener(ev, function () { rerun(false); }); el.sg.addEventListener(ev, function () { rerun(false); }); });
  window.addEventListener("themechange", draw);
  if ("ResizeObserver" in window) new ResizeObserver(function () { size(); draw(); }).observe(cv);
  size(); simulate(); play();
})();
