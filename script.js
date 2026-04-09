const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const OUT_W = 1000;
const OUT_H = 1250;
canvas.width = OUT_W;
canvas.height = OUT_H;

const template = new Image();
template.src = 'Fort Fest Custom DP Portrait 4.png';

let userImg = null;
let zoom = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let lastX = 0;
let lastY = 0;
let pinchStartDistance = 0;
let pinchStartZoom = 1;

const circle = { x: 500, y: 285, r: 150 };

template.onload = draw;
draw();

function draw() {
if (userImg) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
  ctx.clip();

  const diameter = circle.r * 2;
  const imgRatio = userImg.width / userImg.height;

  let w, h;

  if (imgRatio > 1) {
    h = diameter * zoom;
    w = h * imgRatio;
  } else {
    w = diameter * zoom;
    h = w / imgRatio;
  }

  ctx.drawImage(
    userImg,
    circle.x - w / 2 + offsetX,
    circle.y - h / 2 + offsetY,
    w,
    h
  );

  ctx.restore();
}
}

function getDistance(t1, t2) {
  const dx = t2.clientX - t1.clientX;
  const dy = t2.clientY - t1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

document.getElementById('photoInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      userImg = img;
      zoom = 1;
      offsetX = 0;
      offsetY = 0;

      document.getElementById('controls').style.display = 'block';
      document.getElementById('downloadBtn').disabled = false;
      draw();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById('zoom').addEventListener('input', (e) => {
  zoom = e.target.value / 100;
  document.getElementById('zoomVal').textContent = `${e.target.value}%`;
  draw();
});

canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});

window.addEventListener('mouseup', () => {
  isDragging = false;
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDragging || !userImg) return;

  const scaleX = OUT_W / canvas.clientWidth;
  const scaleY = OUT_H / canvas.clientHeight;

  offsetX += (e.offsetX - lastX) * scaleX;
  offsetY += (e.offsetY - lastY) * scaleY;

  lastX = e.offsetX;
  lastY = e.offsetY;

  draw();
});

canvas.addEventListener('touchstart', (e) => {
  if (!userImg) return;

  if (e.touches.length === 1) {
    isDragging = true;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    pinchStartDistance = getDistance(e.touches[0], e.touches[1]);
    pinchStartZoom = zoom;
  }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  if (!userImg) return;
  e.preventDefault();

  if (e.touches.length === 1 && isDragging) {
    const scaleX = OUT_W / canvas.clientWidth;
    const scaleY = OUT_H / canvas.clientHeight;

    offsetX += (e.touches[0].clientX - lastX) * scaleX;
    offsetY += (e.touches[0].clientY - lastY) * scaleY;

    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    draw();
  }

  if (e.touches.length === 2) {
    const newDistance = getDistance(e.touches[0], e.touches[1]);
    zoom = Math.max(0.5, Math.min(3, pinchStartZoom * (newDistance / pinchStartDistance)));

    document.getElementById('zoom').value = Math.round(zoom * 100);
    document.getElementById('zoomVal').textContent = `${Math.round(zoom * 100)}%`;
    draw();
  }
}, { passive: false });

canvas.addEventListener('touchend', () => {
  isDragging = false;
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'FortFest2026_DP.png';
  a.click();
});
