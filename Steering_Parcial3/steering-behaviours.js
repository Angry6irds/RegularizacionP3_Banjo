// steering-behaviours.js — Simulaciones animadas de los 10 behaviours
// Requiere: steering-advanced.html (pestaña Behaviours)

(function () {
  'use strict';

  // ─── UTILIDADES DE CANVAS ─────────────────────────────────

  function cls(ctx, w, h) {
    ctx.fillStyle = '#060810';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#151c28';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  }

  function tri(ctx, x, y, angle, r, col) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    ctx.beginPath(); ctx.moveTo(r + 4, 0); ctx.lineTo(-r, -r * 0.65); ctx.lineTo(-r, r * 0.65); ctx.closePath();
    ctx.fillStyle = col + '22'; ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  }

  function circ(ctx, x, y, r, col, dashed) {
    ctx.save();
    if (dashed) ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  }

  function dot(ctx, x, y, r, col) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = col; ctx.fill();
  }

  function arw(ctx, x1, y1, x2, y2, col, dashed) {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    if (len < 1) return;
    ctx.save();
    if (dashed) ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.setLineDash([]);
    const nx = dx / len, ny = dy / len;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - nx * 7 + ny * 3.5, y2 - ny * 7 - nx * 3.5);
    ctx.lineTo(x2 - nx * 7 - ny * 3.5, y2 - ny * 7 + nx * 3.5);
    ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    ctx.restore();
  }

  function ln(ctx, x1, y1, x2, y2, col, dashed) {
    ctx.save();
    if (dashed) ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  }

  function lbl(ctx, text, x, y, col) {
    ctx.font = '9px JetBrains Mono'; ctx.fillStyle = col || '#6b7a96'; ctx.fillText(text, x, y);
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function norm(vx, vy) { const l = Math.hypot(vx, vy); return l > 0.001 ? [vx / l, vy / l] : [0, 0]; }
  function limit(vx, vy, max) { const l = Math.hypot(vx, vy); return l > max ? [vx / l * max, vy / l * max] : [vx, vy]; }
  function gp(id) { const el = document.getElementById(id); return el ? parseFloat(el.value) : null; }

  // ─── REGISTRO DE SIMULACIONES ─────────────────────────────

  const sims = {};

  function startSim(canvasId, initFn, drawFn) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (sims[canvasId]) sims[canvasId].stop();
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const state = initFn(W, H);
    let active = true, last = 0;

    function loop(ts) {
      if (!active) return;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      drawFn(ctx, state, W, H, dt);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(t => { last = t; loop(t); });
    sims[canvasId] = { state, stop() { active = false; } };
  }

  // ─── 01 PURSUIT ───────────────────────────────────────────

  function pursuiInit(W, H) {
    return {
      t: { x: W * 0.7, y: H * 0.35, vx: 46, vy: 28 },
      a: { x: W * 0.18, y: H * 0.72, vx: 0, vy: 0 },
    };
  }

  function pursuiDraw(ctx, s, W, H, dt) {
    cls(ctx, W, H);
    const maxSpeed = gp('ph-speed') || 80;
    const predMult = gp('ph-pred') || 1.0;
    const { t, a } = s;

    t.x += t.vx * dt; t.y += t.vy * dt;
    if (t.x < 12) t.vx = Math.abs(t.vx);
    if (t.x > W - 12) t.vx = -Math.abs(t.vx);
    if (t.y < 12) t.vy = Math.abs(t.vy);
    if (t.y > H - 12) t.vy = -Math.abs(t.vy);

    const dist = Math.hypot(a.x - t.x, a.y - t.y);
    const T = (dist / maxSpeed) * predMult;
    const fpx = t.x + t.vx * T, fpy = t.y + t.vy * T;

    const [dnx, dny] = norm(fpx - a.x, fpy - a.y);
    const desVx = dnx * maxSpeed, desVy = dny * maxSpeed;
    let [svx, svy] = limit(desVx - a.vx, desVy - a.vy, 200 * dt);
    a.vx += svx; a.vy += svy;
    [a.vx, a.vy] = limit(a.vx, a.vy, maxSpeed);
    a.x += a.vx * dt; a.y += a.vy * dt;
    a.x = clamp(a.x, 10, W - 10); a.y = clamp(a.y, 10, H - 10);

    ln(ctx, t.x, t.y, fpx, fpy, '#ff9f4340', true);
    circ(ctx, fpx, fpy, 6, '#ff9f4360', true);
    ln(ctx, a.x, a.y, fpx, fpy, '#74b9ff30', true);
    arw(ctx, t.x, t.y, t.x + t.vx * 0.28, t.y + t.vy * 0.28, '#ff9f4390');
    arw(ctx, a.x, a.y, a.x + a.vx * 0.3, a.y + a.vy * 0.3, '#7effd490');
    tri(ctx, t.x, t.y, Math.atan2(t.vy, t.vx), 8, '#ff9f43');
    tri(ctx, a.x, a.y, Math.atan2(a.vy, a.vx) || 0, 8, '#7effd4');
    dot(ctx, fpx, fpy, 3, '#ff9f4370');
    lbl(ctx, 'target', t.x + 11, t.y - 3, '#ff9f43');
    lbl(ctx, 'futurePos', clamp(fpx + 5, 2, W - 60), clamp(fpy - 6, 10, H - 4), '#ff9f4390');
    lbl(ctx, 'agente', a.x - 7, a.y + 17, '#7effd4');
    lbl(ctx, `t = dist/maxSpeed × ${predMult.toFixed(1)}`, 4, H - 6, '#3a4560');
  }

  // ─── 02 EVADE ────────────────────────────────────────────

  function evadeInit(W, H) {
    return {
      p: { x: W * 0.15, y: H * 0.5, vx: 50, vy: 0 },
      a: { x: W * 0.65, y: H * 0.5, vx: 0, vy: 0 },
      t: 0,
    };
  }

  function evadeDraw(ctx, s, W, H, dt) {
    cls(ctx, W, H);
    const maxSpeed = gp('eh-speed') || 90;
    const panicDist = gp('eh-panic') || 110;
    const { p, a } = s;
    s.t += dt;

    if (s.t > 12) {
      p.x = W * 0.1; p.y = H * 0.5; p.vx = 50; p.vy = 0;
      a.x = W * 0.65; a.y = H * 0.5; a.vx = 0; a.vy = 0;
      s.t = 0;
    }

    const [pnx, pny] = norm(a.x - p.x, a.y - p.y);
    p.vx = pnx * 52; p.vy = pny * 52;
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.x = clamp(p.x, 10, W - 10); p.y = clamp(p.y, 10, H - 10);

    const dist = Math.hypot(a.x - p.x, a.y - p.y);
    const T = dist / maxSpeed;
    const fpx = p.x + p.vx * T, fpy = p.y + p.vy * T;
    const inPanic = dist < panicDist;

    if (inPanic) {
      const [fx, fy] = norm(a.x - fpx, a.y - fpy);
      a.vx += fx * 200 * dt; a.vy += fy * 200 * dt;
    } else {
      a.vx *= (1 - 2 * dt); a.vy *= (1 - 2 * dt);
    }
    [a.vx, a.vy] = limit(a.vx, a.vy, maxSpeed);
    a.x += a.vx * dt; a.y += a.vy * dt;
    if (a.x < 5) { a.x = W - 10; } if (a.x > W - 5) { a.x = 10; }
    if (a.y < 5) { a.y = H - 10; } if (a.y > H - 5) { a.y = 10; }

    circ(ctx, a.x, a.y, panicDist, inPanic ? '#fd79a825' : '#fd79a812', true);
    ln(ctx, p.x, p.y, fpx, fpy, '#ff9f4335', true);
    circ(ctx, fpx, fpy, 5, '#ff9f4350', true);
    if (inPanic) arw(ctx, a.x, a.y, a.x + a.vx * 0.4, a.y + a.vy * 0.4, '#7effd4');
    arw(ctx, p.x, p.y, p.x + p.vx * 0.28, p.y + p.vy * 0.28, '#ff9f4390');
    tri(ctx, p.x, p.y, Math.atan2(p.vy, p.vx), 8, '#ff9f43');
    tri(ctx, a.x, a.y, Math.atan2(a.vy, a.vx) || 0, 8, inPanic ? '#fd79a8' : '#7effd4');
    lbl(ctx, 'pursuer', p.x + 11, p.y - 3, '#ff9f43');
    lbl(ctx, 'panicDist', a.x + panicDist * 0.65, a.y - 4, '#fd79a870');
    lbl(ctx, inPanic ? 'EVADE!' : 'agente', a.x - 7, a.y + 17, inPanic ? '#fd79a8' : '#7effd4');
    lbl(ctx, 'futurePos (pursuer)', clamp(fpx + 4, 2, W - 90), clamp(fpy - 5, 10, H - 4), '#ff9f4380');
    lbl(ctx, `panicDist = ${panicDist.toFixed(0)}`, 4, H - 6, '#3a4560');
  }

  // ─── 03 COLLISION AVOIDANCE ──────────────────────────────

  function collavInit(W, H) {
    const agents = [];
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 + 0.1;
      const r = Math.min(W, H) * 0.34;
      agents.push({
        x: W / 2 + Math.cos(angle) * r,
        y: H / 2 + Math.sin(angle) * r,
        vx: -Math.cos(angle) * 38,
        vy: -Math.sin(angle) * 38,
      });
    }
    return { agents, t: 0 };
  }

  function collavDraw(ctx, s, W, H, dt) {
    cls(ctx, W, H);
    const { agents } = s;
    const combR = gp('ch-range') || 45;
    const maxSpeed = 48;
    s.t += dt;

    if (s.t > 9) {
      for (let i = 0; i < agents.length; i++) {
        const angle = (Math.PI * 2 * i) / agents.length + Math.random() * 0.4;
        const r = Math.min(W, H) * 0.34;
        agents[i].x = W / 2 + Math.cos(angle) * r;
        agents[i].y = H / 2 + Math.sin(angle) * r;
        agents[i].vx = -Math.cos(angle) * 38;
        agents[i].vy = -Math.sin(angle) * 38;
      }
      s.t = 0;
    }

    const steers = agents.map(() => [0, 0]);
    const threat = agents.map(() => false);

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      let bestT = Infinity, bestJ = -1;
      for (let j = 0; j < agents.length; j++) {
        if (i === j) continue;
        const b = agents[j];
        const rvx = a.vx - b.vx, rvy = a.vy - b.vy;
        const rpx = a.x - b.x, rpy = a.y - b.y;
        const dv2 = rvx * rvx + rvy * rvy;
        if (dv2 < 0.001) continue;
        const tMin = -(rpx * rvx + rpy * rvy) / dv2;
        if (tMin <= 0 || tMin > 3) continue;
        const pax = a.x + a.vx * tMin, pay = a.y + a.vy * tMin;
        const pbx = b.x + b.vx * tMin, pby = b.y + b.vy * tMin;
        const fd = Math.hypot(pax - pbx, pay - pby);
        if (fd < combR && tMin < bestT) { bestT = tMin; bestJ = j; }
      }
      if (bestJ >= 0) {
        const b = agents[bestJ];
        const pax = a.x + a.vx * bestT, pay = a.y + a.vy * bestT;
        const pbx = b.x + b.vx * bestT, pby = b.y + b.vy * bestT;
        const [ox, oy] = norm(pax - pbx, pay - pby);
        steers[i] = [ox * 120, oy * 120];
        threat[i] = true;
      }
    }

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      a.vx += steers[i][0] * dt; a.vy += steers[i][1] * dt;
      [a.vx, a.vy] = limit(a.vx, a.vy, maxSpeed);
      a.x += a.vx * dt; a.y += a.vy * dt;
      if (a.x < 0) a.x = W; if (a.x > W) a.x = 0;
      if (a.y < 0) a.y = H; if (a.y > H) a.y = 0;
      circ(ctx, a.x, a.y, combR * 0.5, threat[i] ? '#fd79a818' : '#a29bfe10', true);
      tri(ctx, a.x, a.y, Math.atan2(a.vy, a.vx), 8, threat[i] ? '#fd79a8' : '#7effd4');
    }

    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const d = Math.hypot(agents[i].x - agents[j].x, agents[i].y - agents[j].y);
        if (d < combR * 1.4) {
          ctx.globalAlpha = 0.25 * (1 - d / (combR * 1.4));
          ln(ctx, agents[i].x, agents[i].y, agents[j].x, agents[j].y, '#fd79a8');
          ctx.globalAlpha = 1;
        }
      }
    }
    lbl(ctx, `detectionRadius = ${combR.toFixed(0)}`, 4, H - 6, '#3a4560');
  }

  // ─── 04 PATH FOLLOWING ────────────────────────────────────

  function pathInit(W, H) {
    const wps = [];
    for (let i = 0; i <= 7; i++) {
      wps.push({
        x: 18 + (W - 36) * i / 7,
        y: H / 2 + Math.sin(i * 1.05) * H * 0.30
      });
    }
    return { wps, a: { x: 20, y: H / 2, vx: 28, vy: 0 } };
  }

  function pathDraw(ctx, s, W, H, dt) {
    cls(ctx, W, H);
    const { wps, a } = s;
    const pathR = gp('pfh-radius') || 18;
    const laD = gp('pfh-la') || 32;
    const maxSpeed = 52;

    let bestDist = Infinity, bestProjX = a.x, bestProjY = a.y;
    let bestSdx = 1, bestSdy = 0, bestT = 0, bestSeg = 0;

    for (let i = 0; i < wps.length - 1; i++) {
      const ax = wps[i].x, ay = wps[i].y, bx = wps[i + 1].x, by = wps[i + 1].y;
      const segLen = Math.hypot(bx - ax, by - ay);
      const sdx = (bx - ax) / segLen, sdy = (by - ay) / segLen;
      let t = (a.x - ax) * sdx + (a.y - ay) * sdy;
      t = clamp(t, 0, segLen);
      const px = ax + sdx * t, py = ay + sdy * t;
      const d = Math.hypot(a.x - px, a.y - py);
      if (d < bestDist) { bestDist = d; bestProjX = px; bestProjY = py; bestSdx = sdx; bestSdy = sdy; bestT = t; bestSeg = i; }
    }

    const si = bestSeg;
    const ax0 = wps[si].x, ay0 = wps[si].y;
    const bx0 = wps[si + 1] ? wps[si + 1].x : ax0;
    const by0 = wps[si + 1] ? wps[si + 1].y : ay0;
    const segLen0 = Math.hypot(bx0 - ax0, by0 - ay0);
    let laT = bestT + laD, laX, laY;
    if (laT <= segLen0) {
      laX = ax0 + bestSdx * laT; laY = ay0 + bestSdy * laT;
    } else if (si + 1 < wps.length - 1) {
      const extra = laT - segLen0;
      const nx = wps[si + 1].x, ny = wps[si + 1].y;
      const nx2 = wps[si + 2].x, ny2 = wps[si + 2].y;
      const sl2 = Math.hypot(nx2 - nx, ny2 - ny);
      laX = nx + ((nx2 - nx) / sl2) * extra; laY = ny + ((ny2 - ny) / sl2) * extra;
    } else {
      laX = wps[wps.length - 1].x; laY = wps[wps.length - 1].y;
    }

    if (bestDist > pathR) {
      const [nx, ny] = norm(laX - a.x, laY - a.y);
      a.vx += nx * 160 * dt; a.vy += ny * 160 * dt;
    }
    [a.vx, a.vy] = limit(a.vx, a.vy, maxSpeed);
    a.x += a.vx * dt; a.y += a.vy * dt;
    if (a.x > W - 8 || a.x < 8) { a.x = 20; a.y = H / 2; a.vx = 28; a.vy = 0; }

    // Draw path tube
    ctx.beginPath(); ctx.moveTo(wps[0].x, wps[0].y);
    for (let i = 1; i < wps.length; i++) ctx.lineTo(wps[i].x, wps[i].y);
    ctx.strokeStyle = '#1e2535'; ctx.lineWidth = pathR * 2;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(wps[0].x, wps[0].y);
    for (let i = 1; i < wps.length; i++) ctx.lineTo(wps[i].x, wps[i].y);
    ctx.strokeStyle = '#2a3347'; ctx.lineWidth = 1; ctx.stroke();
    for (const wp of wps) dot(ctx, wp.x, wp.y, 3, '#2a3347');

    ln(ctx, a.x, a.y, bestProjX, bestProjY, '#a29bfe50', true);
    dot(ctx, bestProjX, bestProjY, 4, '#ff9f43');
    dot(ctx, laX, laY, 5, '#7effd4');
    lbl(ctx, 'proj', bestProjX + 5, bestProjY - 5, '#ff9f4380');
    lbl(ctx, 'look-ahead', clamp(laX + 5, 2, W - 65), clamp(laY - 5, 10, H - 4), '#7effd490');
    if (bestDist > pathR) arw(ctx, a.x, a.y, laX, laY, '#74b9ff50');
    tri(ctx, a.x, a.y, Math.atan2(a.vy, a.vx) || 0, 8, '#7effd4');
    lbl(ctx, `pathR=${pathR} la=${laD}`, 4, H - 6, '#3a4560');
  }

  // ─── 05 LEADER FOLLOWING ──────────────────────────────────

  function leaderInit(W, H) {
    return {
      l: { x: W / 2, y: H / 2, vx: 40, vy: 0, angle: 0 },
      f: { x: W / 2 - 50, y: H / 2 + 10, vx: 0, vy: 0 },
      t: 0,
    };
  }

  function leaderDraw(ctx, s, W, H, dt) {
    cls(ctx, W, H);
    const followD = gp('lfh-dist') || 40;
    const brakeD = gp('lfh-brake') || 55;
    const { l, f } = s;
    const maxSpeed = 58;
    s.t += dt;

    l.angle += dt * 0.65;
    const cx = W / 2, cy = H / 2, r = Math.min(W, H) * 0.30;
    const [lnx, lny] = norm(cx + Math.cos(l.angle) * r - l.x, cy + Math.sin(l.angle) * r - l.y);
    l.vx = lnx * 43; l.vy = lny * 43;
    l.x += l.vx * dt; l.y += l.vy * dt;

    const [lfx, lfy] = norm(l.vx, l.vy);
    const behX = l.x - lfx * followD, behY = l.y - lfy * followD;
    const toFx = f.x - l.x, toFy = f.y - l.y;
    const dfl = Math.hypot(toFx, toFy);
    const dotV = dfl > 0.001 ? lfx * (toFx / dfl) + lfy * (toFy / dfl) : -1;
    const inFront = dotV > 0.75 && dfl < brakeD;

    if (inFront) {
      const fpx = l.x + l.vx * 0.35, fpy = l.y + l.vy * 0.35;
      const [nx, ny] = norm(f.x - fpx, f.y - fpy);
      f.vx += nx * 200 * dt; f.vy += ny * 200 * dt;
    } else {
      const [nx, ny] = norm(behX - f.x, behY - f.y);
      f.vx += nx * 160 * dt; f.vy += ny * 160 * dt;
    }
    [f.vx, f.vy] = limit(f.vx, f.vy, maxSpeed);
    f.x += f.vx * dt; f.y += f.vy * dt;
    f.x = clamp(f.x, 8, W - 8); f.y = clamp(f.y, 8, H - 8);

    circ(ctx, cx, cy, r, '#1a2030', false);

    // Braking cone
    ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(Math.atan2(l.vy, l.vx));
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, brakeD, -0.55, 0.55); ctx.closePath();
    ctx.fillStyle = 'rgba(255,159,67,0.04)'; ctx.fill();
    ctx.strokeStyle = '#ff9f4328'; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();

    dot(ctx, behX, behY, 3, '#a29bfe50');
    lbl(ctx, 'behindPt', behX - 28, behY - 6, '#a29bfe60');
    ln(ctx, f.x, f.y, inFront ? l.x + l.vx * 0.35 : behX, inFront ? l.y + l.vy * 0.35 : behY, inFront ? '#fd79a840' : '#7effd440', true);
    tri(ctx, l.x, l.y, Math.atan2(l.vy, l.vx), 9, '#ff9f43');
    tri(ctx, f.x, f.y, Math.atan2(f.vy, f.vx) || 0, 8, inFront ? '#fd79a8' : '#7effd4');
    lbl(ctx, 'LEADER', l.x + 11, l.y - 3, '#ff9f43');
    lbl(ctx, inFront ? 'EVADE!' : 'follower', f.x - 7, f.y + 17, inFront ? '#fd79a8' : '#7effd4');
    lbl(ctx, `followDist=${followD} brakeDist=${brakeD}`, 4, H - 6, '#3a4560');
  }

  // ─── 06 QUEUE ─────────────────────────────────────────────

  function queueInit(W, H) {
    const dest = { x: W - 15, y: H / 2 };
    const agents = [];
    for (let i = 0; i < 5; i++) {
      agents.push({
        x: 20 + i * 18 + Math.random() * 8,
        y: H / 2 + (Math.random() - 0.5) * 18,
        vx: 0, vy: 0, isBreaking: false,
      });
    }
    return { agents, dest, t: 0 };
  }

  function queueDraw(ctx, s, W, H, dt) {
    cls(ctx, W, H);
    const { agents, dest } = s;
    const neighborD = gp('qh-dist') || 35;
    const brakeFac = gp('qh-brake') || 1.6;
    const maxSpeed = 48;
    s.t += dt;

    if (s.t > 11) {
      for (let i = 0; i < agents.length; i++) {
        agents[i].x = 20 + i * 18 + Math.random() * 8;
        agents[i].y = H / 2 + (Math.random() - 0.5) * 18;
        agents[i].vx = 0; agents[i].vy = 0; agents[i].isBreaking = false;
      }
      s.t = 0;
    }

    dot(ctx, dest.x, dest.y, 5, '#6b7a96');
    lbl(ctx, 'destino', dest.x - 35, dest.y + 14, '#6b7a96');

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      const [fwdX, fwdY] = norm(dest.x - a.x, dest.y - a.y);
      let nbr = null, nbrDist = Infinity;

      for (let j = 0; j < agents.length; j++) {
        if (i === j) continue;
        const b = agents[j];
        const toNX = b.x - a.x, toNY = b.y - a.y;
        const d = Math.hypot(toNX, toNY);
        if (d < neighborD) {
          const dotV = fwdX * (toNX / d) + fwdY * (toNY / d);
          if (dotV > 0 && d < nbrDist) { nbrDist = d; nbr = b; }
        }
      }

      if (nbr) {
        let bfx = -a.vx * brakeFac, bfy = -a.vy * brakeFac;
        if (nbr.isBreaking) { bfx *= 2; bfy *= 2; }
        a.vx += bfx * dt; a.vy += bfy * dt;
        a.isBreaking = true;
        arw(ctx, a.x, a.y, a.x + fwdX * neighborD * 0.6, a.y + fwdY * neighborD * 0.6, '#7effd440');
      } else {
        const [nx, ny] = norm(dest.x - a.x, dest.y - a.y);
        a.vx += nx * 90 * dt; a.vy += ny * 90 * dt;
        a.isBreaking = false;
      }
      [a.vx, a.vy] = limit(a.vx, a.vy, maxSpeed);
      a.x += a.vx * dt; a.y += a.vy * dt;
      a.x = clamp(a.x, 8, W - 8); a.y = clamp(a.y, 8, H - 8);

      const ang = Math.atan2(a.vy, a.vx);
      const faceAng = Math.abs(a.vx) + Math.abs(a.vy) < 0.5 ? Math.atan2(dest.y - a.y, dest.x - a.x) : ang;
      tri(ctx, a.x, a.y, faceAng, 8, a.isBreaking ? '#fd79a8' : '#7effd4');
      if (a.isBreaking) lbl(ctx, '⛔', a.x - 5, a.y - 12);
    }
    lbl(ctx, `neighborDist=${neighborD} brakeFactor=${brakeFac.toFixed(1)}`, 4, H - 6, '#3a4560');
  }

  // ─── 07 SEPARATION ───────────────────────────────────────

  function sepInit(W, H) {
    const agents = [];
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      agents.push({
        x: W * 0.18 + Math.random() * W * 0.64,
        y: H * 0.18 + Math.random() * H * 0.64,
        vx: Math.cos(angle) * 18, vy: Math.sin(angle) * 18,
      });
    }
    return { agents };
  }

  function sepDraw(ctx, s, W, H, dt) {
    cls(ctx, W, H);
    const { agents } = s;
    const sepR = gp('sh-radius') || 45;
    const maxSpeed = 38;

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      let sfx = 0, sfy = 0;
      for (let j = 0; j < agents.length; j++) {
        if (i === j) continue;
        const b = agents[j];
        const dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
        if (d < sepR && d > 0.1) {
          const strength = (sepR - d) / sepR;
          sfx += (dx / d) * strength; sfy += (dy / d) * strength;
        }
      }
      a.vx += sfx * 80 * dt; a.vy += sfy * 80 * dt;
      a.vx += (Math.random() - 0.5) * 12 * dt;
      a.vy += (Math.random() - 0.5) * 12 * dt;
      [a.vx, a.vy] = limit(a.vx, a.vy, maxSpeed);
      a.x += a.vx * dt; a.y += a.vy * dt;
      if (a.x < 8) { a.vx = Math.abs(a.vx); a.x = 8; }
      if (a.x > W - 8) { a.vx = -Math.abs(a.vx); a.x = W - 8; }
      if (a.y < 8) { a.vy = Math.abs(a.vy); a.y = 8; }
      if (a.y > H - 8) { a.vy = -Math.abs(a.vy); a.y = H - 8; }

      circ(ctx, a.x, a.y, sepR, '#fd79a812', true);
      tri(ctx, a.x, a.y, Math.atan2(a.vy, a.vx), 7, '#7effd4');
    }

    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const d = Math.hypot(agents[i].x - agents[j].x, agents[i].y - agents[j].y);
        if (d < sepR) {
          ctx.globalAlpha = 0.4 * (1 - d / sepR);
          ln(ctx, agents[i].x, agents[i].y, agents[j].x, agents[j].y, '#fd79a8');
          ctx.globalAlpha = 1;
        }
      }
    }
    lbl(ctx, `separationRadius = ${sepR.toFixed(0)}`, 4, H - 6, '#3a4560');
  }

  // ─── 08 COHESION ──────────────────────────────────────────

  function cohInit(W, H) {
    const agents = [];
    for (let i = 0; i < 9; i++) {
      const angle = (Math.PI * 2 * i) / 9;
      const r = Math.min(W, H) * 0.36;
      agents.push({
        x: W / 2 + Math.cos(angle) * r,
        y: H / 2 + Math.sin(angle) * r,
        vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30,
      });
    }
    return { agents };
  }

  function cohDraw(ctx, s, W, H, dt) {
    cls(ctx, W, H);
    const { agents } = s;
    const cohR = gp('cohh-radius') || 90;
    const maxSpeed = 42;

    let cX = 0, cY = 0;
    for (const a of agents) { cX += a.x; cY += a.y; }
    cX /= agents.length; cY /= agents.length;

    dot(ctx, cX, cY, 5, '#a29bfe55');
    lbl(ctx, 'centroide', cX + 6, cY + 3, '#a29bfe60');

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      const [cx, cy] = norm(cX - a.x, cY - a.y);
      a.vx += cx * 55 * dt; a.vy += cy * 55 * dt;
      for (let j = 0; j < agents.length; j++) {
        if (i === j) continue;
        const b = agents[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 18 && d > 0.1) {
          a.vx += (a.x - b.x) / d * 35 * dt;
          a.vy += (a.y - b.y) / d * 35 * dt;
        }
      }
      [a.vx, a.vy] = limit(a.vx, a.vy, maxSpeed);
      a.x += a.vx * dt; a.y += a.vy * dt;
      if (a.x < 8) { a.vx = Math.abs(a.vx); a.x = 8; }
      if (a.x > W - 8) { a.vx = -Math.abs(a.vx); a.x = W - 8; }
      if (a.y < 8) { a.vy = Math.abs(a.vy); a.y = 8; }
      if (a.y > H - 8) { a.vy = -Math.abs(a.vy); a.y = H - 8; }

      ctx.globalAlpha = 0.08;
      ln(ctx, a.x, a.y, cX, cY, '#a29bfe');
      ctx.globalAlpha = 1;
      tri(ctx, a.x, a.y, Math.atan2(a.vy, a.vx), 7, '#7effd4');
    }
    lbl(ctx, `cohesionRadius = ${cohR.toFixed(0)}`, 4, H - 6, '#3a4560');
  }

  // ─── 09 ALIGNMENT ─────────────────────────────────────────

  function aliInit(W, H) {
    const agents = [];
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      agents.push({
        x: 18 + Math.random() * (W - 36),
        y: 18 + Math.random() * (H - 36),
        vx: Math.cos(angle) * 38, vy: Math.sin(angle) * 38,
      });
    }
    return { agents };
  }

  function aliDraw(ctx, s, W, H, dt) {
    cls(ctx, W, H);
    const { agents } = s;
    const aliR = gp('alih-radius') || 70;
    const maxSpeed = 42;

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      let avgVx = 0, avgVy = 0, cnt = 0;
      for (let j = 0; j < agents.length; j++) {
        if (i === j) continue;
        if (Math.hypot(a.x - agents[j].x, a.y - agents[j].y) < aliR) {
          avgVx += agents[j].vx; avgVy += agents[j].vy; cnt++;
        }
      }
      if (cnt > 0) {
        avgVx /= cnt; avgVy /= cnt;
        const [nx, ny] = norm(avgVx, avgVy);
        a.vx += (nx * maxSpeed - a.vx) * 0.9 * dt;
        a.vy += (ny * maxSpeed - a.vy) * 0.9 * dt;
      }
      [a.vx, a.vy] = limit(a.vx, a.vy, maxSpeed);
      a.x += a.vx * dt; a.y += a.vy * dt;
      if (a.x < 0) a.x = W; if (a.x > W) a.x = 0;
      if (a.y < 0) a.y = H; if (a.y > H) a.y = 0;
      tri(ctx, a.x, a.y, Math.atan2(a.vy, a.vx), 7, '#74b9ff');
    }

    let avgVx = 0, avgVy = 0;
    for (const a of agents) { avgVx += a.vx; avgVy += a.vy; }
    avgVx /= agents.length; avgVy /= agents.length;
    const [nx, ny] = norm(avgVx, avgVy);
    arw(ctx, W / 2, H / 2, W / 2 + nx * 28, H / 2 + ny * 28, '#74b9ff70');
    lbl(ctx, 'avgVel', W / 2 + nx * 32 - 10, H / 2 + ny * 32 + 4, '#74b9ff70');
    lbl(ctx, `alignRadius = ${aliR.toFixed(0)}`, 4, H - 6, '#3a4560');
  }

  // ─── 10 FLOCKING ──────────────────────────────────────────

  function flockInit(W, H) {
    const agents = [];
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      agents.push({
        x: W / 2 + (Math.random() - 0.5) * W * 0.55,
        y: H / 2 + (Math.random() - 0.5) * H * 0.55,
        vx: Math.cos(angle) * 32, vy: Math.sin(angle) * 32,
      });
    }
    return { agents };
  }

  function flockDraw(ctx, s, W, H, dt) {
    cls(ctx, W, H);
    const { agents } = s;
    const wSep = gp('fh-wsep') || 1.5;
    const wCoh = gp('fh-wcoh') || 1.0;
    const wAli = gp('fh-wali') || 0.8;
    const maxSpeed = 48, R = 52;

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      let sepX = 0, sepY = 0, cX = 0, cY = 0, aVx = 0, aVy = 0, cnt = 0;
      for (let j = 0; j < agents.length; j++) {
        if (i === j) continue;
        const b = agents[j];
        const dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
        if (d < R) {
          if (d < R * 0.45 && d > 0.1) {
            const str = (R * 0.45 - d) / (R * 0.45);
            sepX += (dx / d) * str; sepY += (dy / d) * str;
          }
          cX += b.x; cY += b.y; aVx += b.vx; aVy += b.vy; cnt++;
        }
      }
      let stX = sepX * wSep, stY = sepY * wSep;
      if (cnt > 0) {
        cX /= cnt; cY /= cnt;
        const [cohX, cohY] = norm(cX - a.x, cY - a.y);
        stX += cohX * wCoh; stY += cohY * wCoh;
        aVx /= cnt; aVy /= cnt;
        const [alX, alY] = norm(aVx, aVy);
        stX += alX * wAli; stY += alY * wAli;
      }
      a.vx += stX * 40 * dt; a.vy += stY * 40 * dt;
      [a.vx, a.vy] = limit(a.vx, a.vy, maxSpeed);
      a.x += a.vx * dt; a.y += a.vy * dt;
      if (a.x < 0) a.x = W; if (a.x > W) a.x = 0;
      if (a.y < 0) a.y = H; if (a.y > H) a.y = 0;
      tri(ctx, a.x, a.y, Math.atan2(a.vy, a.vx), 6, '#7effd4');
    }
    lbl(ctx, `wSep=${wSep.toFixed(1)}  wCoh=${wCoh.toFixed(1)}  wAli=${wAli.toFixed(1)}`, 4, H - 6, '#3a4560');
  }

  // ─── INICIAR TODAS LAS SIMS ────────────────────────────────

  window.initBhSims = function () {
    startSim('bh-pursuit', pursuiInit, pursuiDraw);
    startSim('bh-evade', evadeInit, evadeDraw);
    startSim('bh-collav', collavInit, collavDraw);
    startSim('bh-path', pathInit, pathDraw);
    startSim('bh-leader', leaderInit, leaderDraw);
    startSim('bh-queue', queueInit, queueDraw);
    startSim('bh-sep', sepInit, sepDraw);
    startSim('bh-coh', cohInit, cohDraw);
    startSim('bh-ali', aliInit, aliDraw);
    startSim('bh-flock', flockInit, flockDraw);
  };

  window.stopBhSims = function () {
    Object.values(sims).forEach(s => s.stop());
  };

  // ─── BARRA DE PROGRESO ────────────────────────────────────

  window.updateBhProgress = function () {
    const all = document.querySelectorAll('.bh-chk');
    const done = document.querySelectorAll('.bh-chk:checked').length;
    const pct = all.length > 0 ? (done / all.length) * 100 : 0;
    const bar = document.getElementById('bh-progress-bar');
    const txt = document.getElementById('bh-progress-txt');
    if (bar) bar.style.width = pct + '%';
    if (txt) txt.textContent = `${done} / ${all.length} completados`;
    // Color por progreso
    if (bar) {
      if (pct >= 100) bar.style.background = 'linear-gradient(90deg,#7effd4,#7effd4)';
      else if (pct >= 50) bar.style.background = 'linear-gradient(90deg,#7effd4,#74b9ff)';
      else bar.style.background = 'linear-gradient(90deg,#ff9f43,#74b9ff)';
    }
  };

  // Restaurar estado desde localStorage
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.bh-chk').forEach(cb => {
      if (localStorage.getItem('bh-' + cb.id) === '1') cb.checked = true;
      cb.addEventListener('change', function () {
        localStorage.setItem('bh-' + this.id, this.checked ? '1' : '0');
        updateBhProgress();
      });
    });
    updateBhProgress();
  });

})();
