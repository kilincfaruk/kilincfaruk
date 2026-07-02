// engine.js — Ortak efekt motoru.
// Operatör önizlemesi ve katılımcı telefonlar AYNI dosyayı kullanır;
// böylece önizleme ile gerçek davranış birbirinden sapamaz.

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

// Efektin bu telefondaki anlık durumu: { css, torch }
// phase: telefona özel sabit 0..1 — dalga/sıra desenlerinin sırrı.
export function fxState(e, phase, now) {
  if (!e || !e.action) return { css: '#000000', torch: false };
  const t = Math.max(0, (now - (e.startAt || now)) / 1000);
  switch (e.action) {
    case 'color':
      return { css: rgbCss(pickColor(e, phase, t), 1), torch: false };
    case 'flash':
      return { css: '#ffffff', torch: true };
    case 'off':
      return { css: '#000000', torch: false };

    case 'wave': { // kalabalık boyunca gezen parlaklık dalgası
      const s = e.speed || 0.4;
      const v = 0.5 + 0.5 * Math.cos(2 * Math.PI * (t * s - phase));
      return { css: rgbCss(pickColor(e, phase, t), v * v), torch: !!e.torch && v > 0.75 };
    }
    case 'twinkle': { // her telefon farklı anda parlar
      const r = e.rate || 1.6;
      const on = Math.sin(2 * Math.PI * (t * r * (0.6 + phase * 0.9)) + phase * 97) > 0.72;
      return { css: rgbCss(pickColor(e, phase, t), on ? 1 : 0), torch: false };
    }
    case 'rainbow': { // paletten bağımsız tam spektrum
      const s = e.speed || 0.08;
      return { css: hslCss(((phase + t * s) % 1) * 360, 1), torch: false };
    }
    case 'chase': { // gruplar sırayla yanar; split modda her grubun kendi rengi
      const g = e.groups || 5, b = e.bpm || 120;
      const cols = palette(e);
      const my = Math.min(g - 1, Math.floor(clamp(phase) * g));
      const act = Math.floor(t * b / 60) % g;
      const c = (e.mode === 'cycle') ? pickColor(e, phase, t) : cols[my % cols.length];
      const on = act === my;
      return { css: rgbCss(c, on ? 1 : 0.02), torch: !!e.torch && on };
    }
    case 'pulse': { // birlikte nefes alma
      const b = e.bpm || 60;
      const v = 0.5 + 0.5 * Math.sin(2 * Math.PI * t * b / 60);
      return { css: rgbCss(pickColor(e, phase, t), v), torch: !!e.torch && v > 0.7 };
    }
    case 'strobe': { // hızlı yanıp sönme; cycle modda her çakışta sıradaki renk
      const hz = e.hz || 8;
      const on = (Math.floor(t * hz * 2) % 2) === 0;
      const cols = palette(e);
      const c = (e.mode === 'cycle') ? cols[Math.floor(t * hz) % cols.length] : pickColor(e, phase, t);
      return { css: rgbCss(c, on ? 1 : 0), torch: !!e.torch && on };
    }
    default:
      return { css: '#000000', torch: false };
  }
}
