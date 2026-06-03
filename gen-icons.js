// 產生 PWA 圖示（石門國小校徽 + 深空背景）。dev 工具，輸出的 PNG 才進 repo。
const fs = require("fs");
const path = require("path");
const { createCanvas, GlobalFonts } = require("@napi-rs/canvas");

// 註冊系統中文字型，確保「石門」不變豆腐
let CJK = "Microsoft JhengHei";
for (const [file, alias] of [["msjhbd.ttc", "ShihMenCJK"], ["msjh.ttc", "ShihMenCJK"]]) {
  const p = path.join("C:\\Windows\\Fonts", file);
  if (fs.existsSync(p)) { try { GlobalFonts.registerFromPath(p, "ShihMenCJK"); CJK = "ShihMenCJK"; break; } catch (e) {} }
}

function drawBadge(x, cx, cy, R) {
  x.fillStyle = "#8FCDEA"; x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#ffffff"; x.beginPath(); x.arc(cx, cy, R * 0.905, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#2B2A86"; x.beginPath(); x.arc(cx, cy, R * 0.86, 0, Math.PI * 2); x.fill();
  // 弧形英文校名
  const txt = "Shih Men Elementary School";
  x.fillStyle = "#ffffff";
  x.font = `700 ${R * 0.12}px "Trebuchet MS", Arial, sans-serif`;
  x.textAlign = "center"; x.textBaseline = "middle";
  const arcR = R * 0.745, span = Math.PI * 1.16, start = -span / 2;
  for (let i = 0; i < txt.length; i++) {
    const a = start + span * (i / (txt.length - 1));
    x.save(); x.translate(cx, cy); x.rotate(a); x.translate(0, -arcR); x.fillText(txt[i], 0, 0); x.restore();
  }
  // 水庫大壩 + 門縫
  const T = cy - R * 0.40, B = cy + R * 0.52;
  x.fillStyle = "#27ABE6"; x.beginPath();
  x.moveTo(cx - R * 0.055, T); x.lineTo(cx + R * 0.055, T); x.lineTo(cx + R * 0.30, B); x.lineTo(cx - R * 0.30, B);
  x.closePath(); x.fill();
  x.fillStyle = "#2B2A86"; x.fillRect(cx - R * 0.016, T, R * 0.032, B - T);
  // 橘色幼苗
  x.fillStyle = "#F2901C"; x.fillRect(cx - R * 0.022, cy + R * 0.36, R * 0.044, R * 0.18);
  const leaf = dir => { x.save(); x.translate(cx + dir * R * 0.07, cy + R * 0.37); x.rotate(dir * 0.7);
    x.beginPath(); x.ellipse(0, 0, R * 0.11, R * 0.052, 0, 0, Math.PI * 2); x.fill(); x.restore(); };
  leaf(-1); leaf(1);
  // 紅色「石」「門」白邊
  x.font = `900 ${R * 0.4}px "${CJK}"`;
  x.textAlign = "center"; x.textBaseline = "middle";
  x.lineWidth = R * 0.024; x.lineJoin = "round"; x.strokeStyle = "#ffffff";
  const dc = (ch, px) => { x.strokeText(ch, px, cy + R * 0.03); x.fillStyle = "#E32119"; x.fillText(ch, px, cy + R * 0.03); };
  dc("石", cx - R * 0.6); dc("門", cx + R * 0.6);
}

function icon(size, scale, stars = true) {
  const c = createCanvas(size, size); const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, size); g.addColorStop(0, "#0d0930"); g.addColorStop(1, "#05030f");
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  if (stars) for (let i = 0; i < size / 5; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`; x.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5); }
  drawBadge(x, size / 2, size / 2, size * scale / 2);
  return { buf: c.toBuffer("image/png"), ctx: x, size, scale };
}

const outs = [
  ["icon-192.png", icon(192, 0.86)],
  ["icon-512.png", icon(512, 0.86)],
  ["icon-maskable-512.png", icon(512, 0.62)],
  ["apple-touch-icon.png", icon(180, 0.84, false)],
];
for (const [name, o] of outs) fs.writeFileSync(path.join(__dirname, name), o.buf);

// 自我檢查：掃描 512 圖「石」字所在區域是否有紅色像素（防 CJK 豆腐）
const big = outs[1][1];
const R = big.size * big.scale / 2, cx = big.size / 2, cy = big.size / 2;
const sx = Math.round(cx - R * 0.6), sy = Math.round(cy + R * 0.03);
const data = big.ctx.getImageData(sx - 45, sy - 45, 90, 90).data;
let red = 0;
for (let i = 0; i < data.length; i += 4) if (data[i] > 180 && data[i + 1] < 90 && data[i + 2] < 90) red++;
console.log(`CJK 自我檢查：「石」區域紅色像素 = ${red}（>50 代表中文字正常渲染，使用字型：${CJK}）`);
console.log("已輸出：" + outs.map(o => o[0]).join(", "));
