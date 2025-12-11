// canvas-utils.ts

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Draws the NFT design onto the canvas.
 * @param ctx The 2D rendering context.
 * @param w Canvas width.
 * @param h Canvas height.
 * @param title The title text to display.
 */
export function drawNFT(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  title: string = 'My NFT'
): void {
  // Clear previous drawings
  ctx.clearRect(0, 0, w, h);

  // background gradient
  const g = ctx.createLinearGradient(0, 0, w, h);
  const a = Math.floor(Math.random() * 360);
  g.addColorStop(0, `hsl(${a}deg 70% 45% / 1)`);
  g.addColorStop(1, `hsl(${(a + 60) % 360}deg 70% 55% / 0.9)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // random blob shapes
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.globalAlpha = 0.12 + Math.random() * 0.25;
    ctx.fillStyle = `hsl(${(a + i * 30) % 360}deg 80% 50%)`;
    const cx = Math.random() * w;
    const cy = Math.random() * h;
    const rx = 120 + Math.random() * 520;
    const ry = 120 + Math.random() * 520;
    ctx.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // decorative circles
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    const r = 8 + Math.random() * 120;
    ctx.fillStyle = `hsla(${(a + i * 7) % 360}deg,60%,55%,0.6)`;
    ctx.arc(Math.random() * w, Math.random() * h, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // center rounded panel
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  const pad = 96;
  roundRect(ctx, pad, pad, w - 2 * pad, h - 2 * pad, 40);
  ctx.fill();

  // title text
  ctx.fillStyle = 'white';
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  ctx.font = 'bold 56px system-ui, Inter, Roboto, Arial';
  ctx.fillText(title, w / 2, h * 0.85);

  // small author / timestamp
  ctx.font = '20px system-ui, Inter';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  const ts = new Date().toISOString();
  ctx.fillText('by GitHub Pages • ' + ts, w / 2, h * 0.9);

  // Reset globalAlpha
  ctx.globalAlpha = 1;
}