// engine.js — Ortak efekt motoru.
// Operatör önizlemesi (canvas tribün) ve katılımcı telefonlar AYNI dosyayı kullanır;
// böylece önizleme ile gerçek davranış birbirinden sapamaz.
// fxState dönüşü: { css, torch, v } — v (0..1) parlaklık; canvas glow'u css parse etmeden okur.

export const clamp = (v) => Math.max(0, Math.min(1, v));

export function hexRgb(h) {
  h = String(h).replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return {
    r: parseInt(h.slice(0, 2), 16) || 0,
    g: parseInt(h.slice(2, 4), 16) || 0,
    b: parseInt(h.slice(4, 6), 16) || 0,
  };
}

export function rgbCss(hex, v) {
  const { r, g, b } = hexRgb(hex);
  const k = clamp(v);
  return `rgb(${(r * k) | 0},${(g * k) | 0},${(b * k) | 0})`;
}

export function hslCss(h, l) {
  return `hsl(${h | 0} 100% ${Math.round(clamp(l) * 50)}%)`;
}

// İki hex rengi k (0..1) ile karıştırır, v (0..1) parlaklıkla çarpar.
export function lerpRgbCss(h1, h2, k, v) {
  const a = hexRgb(h1), b = hexRgb(h2);
  const kk = clamp(k), vv = clamp(v == null ? 1 : v);
  return `rgb(${Math.round((a.r + (b.r - a.r) * kk) * vv)},${Math.round((a.g + (b.g - a.g) * kk) * vv)},${Math.round((a.b + (b.b - a.b) * kk) * vv)})`;
}

// Seçili palet (1..10 renk). Eski payload'larla uyum için e.color'a düşer.
export const palette = (e) =>
  (Array.isArray(e.colors) && e.colors.length) ? e.colors : [e.color || '#ffffff'];

// Bu telefonun şu anki rengi.
//  mode 'split' → faza göre sabit renk (kalabalık renk gruplarına bölünür)
//  mode 'cycle' → herkes birlikte, iki vuruşta bir sıradaki renge geçer
export function pickColor(e, phase, t) {
  const cols = palette(e);
  if (cols.length === 1) return cols[0];
  if (e.mode === 'cycle') {
    const period = 120 / (e.bpm || 120); // 2 vuruş
    return cols[Math.floor(t / period) % cols.length];
  }
  return cols[Math.floor(clamp(phase) * cols.length) % cols.length];
}

// Efektin bu telefondaki anlık durumu: { css, torch, v }
// phase: telefona özel sabit 0..1 — dalga/sıra desenlerinin sırrı.
export function fxState(e, phase, now) {
  if (!e || !e.action) return { css: '#000000', torch: false, v: 0 };
  const t = Math.max(0, (now - (e.startAt || now)) / 1000);
  switch (e.action) {
    case 'color':
      return { css: rgbCss(pickColor(e, phase, t), 1), torch: false, v: 1 };
    case 'flash':
      return { css: '#ffffff', torch: true, v: 1 };
    case 'off':
      return { css: '#000000', torch: false, v: 0 };

    case 'wave': { // kalabalık boyunca gezen parlaklık dalgası
      const s = e.speed || 0.4;
      const w = 0.5 + 0.5 * Math.cos(2 * Math.PI * (t * s - phase));
      const v = w * w;
      return { css: rgbCss(pickColor(e, phase, t), v), torch: !!e.torch && w > 0.75, v };
    }
    case 'twinkle': { // her telefon farklı anda parlar
      const r = e.rate || 1.6;
      const on = Math.sin(2 * Math.PI * (t * r * (0.6 + phase * 0.9)) + phase * 97) > 0.72;
      const v = on ? 1 : 0;
      return { css: rgbCss(pickColor(e, phase, t), v), torch: false, v };
    }
    case 'rainbow': { // paletten bağımsız tam spektrum
      const s = e.speed || 0.08;
      return { css: hslCss(((phase + t * s) % 1) * 360, 1), torch: false, v: 1 };
    }
    case 'chase': { // gruplar sırayla yanar; split modda her grubun kendi rengi
      const g = e.groups || 5, b = e.bpm || 120;
      const cols = palette(e);
      const my = Math.min(g - 1, Math.floor(clamp(phase) * g));
      const act = Math.floor(t * b / 60) % g;
      const c = (e.mode === 'cycle') ? pickColor(e, phase, t) : cols[my % cols.length];
      const on = act === my;
      const v = on ? 1 : 0.02;
      return { css: rgbCss(c, v), torch: !!e.torch && on, v };
    }
    case 'pulse': { // birlikte nefes alma
      const b = e.bpm || 60;
      const v = 0.5 + 0.5 * Math.sin(2 * Math.PI * t * b / 60);
      return { css: rgbCss(pickColor(e, phase, t), v), torch: !!e.torch && v > 0.7, v };
    }
    case 'strobe': { // hızlı yanıp sönme; cycle modda her çakışta sıradaki renk
      const hz = e.hz || 8;
      const on = (Math.floor(t * hz * 2) % 2) === 0;
      const cols = palette(e);
      const c = (e.mode === 'cycle') ? cols[Math.floor(t * hz) % cols.length] : pickColor(e, phase, t);
      const v = on ? 1 : 0;
      return { css: rgbCss(c, v), torch: !!e.torch && on, v };
    }

    case 'comet': { // tek yönde dönen keskin baş + üstel kuyruk
      const s = e.speed || 0.3;
      const pos = (t * s) % 1;
      const d = ((pos - clamp(phase)) % 1 + 1) % 1;
      const v = Math.exp(-9 * d);
      const cols = palette(e);
      const c = (e.mode === 'cycle') ? cols[Math.floor(t * s) % cols.length] : pickColor(e, phase, t);
      return { css: rgbCss(c, v), torch: !!e.torch && d < 0.08, v };
    }
    case 'scan': { // duvardan dönen huzme; GRUP faderi ışın kalınlığı
      const s = e.speed || 0.25;
      const p = 0.5 + 0.5 * Math.sin(2 * Math.PI * t * s);
      const w = 1 / (e.groups || 5);
      const v0 = clamp(1 - Math.abs(clamp(phase) - p) / w);
      const v = v0 * v0;
      const cols = palette(e);
      const c = (e.mode === 'cycle') ? cols[Math.floor(2 * t * s + 0.5) % cols.length] : pickColor(e, phase, t);
      return { css: rgbCss(c, v), torch: !!e.torch && v > 0.9, v };
    }
    case 'riser': { // 8 vuruşluk yükseliş → senkron beyaz DROP; e.hold=true gerilimi asılı tutar
      const b = e.bpm || 120;
      const T = 480 / b; // 8 vuruşluk bar (sn)
      const cols = palette(e);
      if (e.hold) {
        // u 0.9'da sabitlenir; shimmer sabit frekansta kaynamaya devam eder
        const tc = Math.min(t, 0.9 * T);
        const u = tc / T;
        const theta = T * (2 * u + (14 / 3) * u * u * u) + Math.max(0, t - 0.9 * T) * (2 + 14 * 0.81);
        const base = 0.6 * u * u;
        const on = ((theta + clamp(phase)) % 1) < 0.5;
        const v = on ? (0.3 + 0.7 * u) : base;
        const c = (e.mode === 'cycle') ? cols[0] : pickColor(e, phase, t);
        return { css: rgbCss(c, v), torch: false, v };
      }
      const u = (t % T) / T;
      if (u < 0.05) return { css: '#ffffff', torch: !!e.torch, v: 1 }; // DROP: bar başında senkron beyaz
      const theta = T * (2 * u + (14 / 3) * u * u * u); // ∫(2+14x²)dx — hızlanan shimmer, sweep hatasız
      const base = 0.6 * u * u;
      const on = ((theta + clamp(phase)) % 1) < 0.5;
      const v = on ? (0.3 + 0.7 * u) : base;
      const c = (e.mode === 'cycle') ? cols[Math.floor(t / T) % cols.length] : pickColor(e, phase, t);
      return { css: rgbCss(c, v), torch: !!e.torch && u > 0.92, v };
    }
    case 'dawn': { // seçili paletin renkleri arasında dakikalar süren göç; asla sönmez
      const s = e.speed || 0.05;
      const cols = palette(e);
      const N = cols.length;
      const x = (e.mode === 'cycle') ? (t * s) % 1 : (clamp(phase) * 0.8 + t * s) % 1;
      const f = x * N;
      const i = Math.floor(f) % N;
      const k = f - Math.floor(f);
      const k2 = k * k * (3 - 2 * k); // smoothstep
      const v = 0.72 + 0.28 * Math.sin(2 * Math.PI * (t * 0.06 + phase * 2.7));
      return { css: lerpRgbCss(cols[i], cols[(i + 1) % N], k2, v), torch: false, v };
    }

    default:
      return { css: '#000000', torch: false, v: 0 };
  }
}
