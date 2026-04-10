const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const W = 1000;
const H = 1250;

canvas.width = W;
canvas.height = H;

// ===== FRAME IMAGE =====
const frame = new Image();
frame.src = "Fort Fest Custom DP Portrait 4.png";

// ===== CIRCLE POSITION =====
const hole = {
  x: 500,
  y: 390,
  r: 160
};

// ===== USER IMAGE =====
let photo = null;
let zoom = 1;
let dx = 0;
let dy = 0;
let dragging = false;
let lastX = 0;
let lastY = 0;
let pinchDist = 0;
let pinchZoom = 1;

// ===== LOAD FRAME =====
frame.onload = () => {
  render();
};

frame.onerror = () => {
  console.error("Frame image failed to load.");
};

// ===== RENDER =====
function render() {
  ctx.clearRect(0, 0, W, H);

  // Draw uploaded image inside circle
  if (photo) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.r, 0, Math.PI * 2);
    ctx.clip();

    // Better scaling fix
    const baseSize = hole.r * 1.8 * zoom;
    const ratio = photo.width / photo.height;

    let drawW, drawH;

    if (ratio > 1) {
      drawH = baseSize;
      drawW = baseSize * ratio;
    } else {
      drawW = baseSize;
      drawH = baseSize / ratio;
    }

    ctx.drawImage(
      photo,
      hole.x - drawW / 2 + dx,
      hole.y - drawH / 2 + dy,
      drawW,
      drawH
    );

    ctx.restore();
  }

  // Draw frame design on top
  ctx.drawImage(frame, 0, 0, W, H);
}

// ===== DISTANCE =====
function touchDistance(t1, t2) {
  const x = t2.clientX - t1.clientX;
  const y = t2.clientY - t1.clientY;
  return Math.hypot(x, y);
}

// ===== POINTER =====
function pointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;
  return { x, y };
}

// ===== UPLOAD =====
document.getElementById("photoInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (ev) => {
    const img = new Image();

    img.onload = () => {
      photo = img;
      zoom = 1;
      dx = 0;
      dy = 0;

      document.getElementById("controls").style.display = "block";
      document.getElementById("downloadBtn").disabled = false;

      render();
    };

    img.src = ev.target.result;
  };

  reader.readAsDataURL(file);
});

// ===== SLIDER ZOOM =====
document.getElementById("zoom").addEventListener("input", (e) => {
  zoom = e.target.value / 100;
  document.getElementById("zoomVal").textContent = e.target.value + "%";
  render();
});

// ===== MOUSE DRAG =====
canvas.addEventListener("mousedown", (e) => {
  if (!photo) return;
  dragging = true;
  const p = pointerPos(e);
  lastX = p.x;
  lastY = p.y;
});

window.addEventListener("mouseup", () => {
  dragging = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (!dragging || !photo) return;

  const p = pointerPos(e);
  const scaleX = W / canvas.clientWidth;
  const scaleY = H / canvas.clientHeight;

  dx += (p.x - lastX) * scaleX;
  dy += (p.y - lastY) * scaleY;

  lastX = p.x;
  lastY = p.y;

  render();
});

// ===== TOUCH =====
canvas.addEventListener(
  "touchstart",
  (e) => {
    if (!photo) return;

    if (e.touches.length === 1) {
      dragging = true;
      const p = pointerPos(e);
      lastX = p.x;
      lastY = p.y;
    }

    if (e.touches.length === 2) {
      pinchDist = touchDistance(e.touches[0], e.touches[1]);
      pinchZoom = zoom;
    }
  },
  { passive: false }
);

canvas.addEventListener(
  "touchmove",
  (e) => {
    if (!photo) return;
    e.preventDefault();

    if (e.touches.length === 1 && dragging) {
      const p = pointerPos(e);
      const scaleX = W / canvas.clientWidth;
      const scaleY = H / canvas.clientHeight;

      dx += (p.x - lastX) * scaleX;
      dy += (p.y - lastY) * scaleY;

      lastX = p.x;
      lastY = p.y;

      render();
    }

    if (e.touches.length === 2) {
      const dist = touchDistance(e.touches[0], e.touches[1]);

      zoom = Math.max(
        0.5,
        Math.min(3, pinchZoom * (dist / pinchDist))
      );

      document.getElementById("zoom").value = Math.round(zoom * 100);
      document.getElementById("zoomVal").textContent =
        Math.round(zoom * 100) + "%";

      render();
    }
  },
  { passive: false }
);

canvas.addEventListener("touchend", () => {
  dragging = false;
});

// ===== DOWNLOAD =====
document.getElementById("downloadBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "FortFest_DP.png";
  link.click();
});
