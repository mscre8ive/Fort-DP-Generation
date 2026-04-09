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
  y: 335,
  r: 220
};

// ===== USER IMAGE STATE =====
let photo = null;
let zoom = 1;
let dx = 0;
let dy = 0;
let dragging = false;
let lastX = 0;
let lastY = 0;

// ===== RENDER =====
function render() {
  ctx.clearRect(0, 0, W, H);

  // draw uploaded image first
  if (photo) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.r, 0, Math.PI * 2);
    ctx.clip();

    const diameter = hole.r * 2;
    const imgRatio = photo.width / photo.height;

    let drawW;
    let drawH;

    if (imgRatio > 1) {
      drawH = diameter * zoom;
      drawW = drawH * imgRatio;
    } else {
      drawW = diameter * zoom;
      drawH = drawW / imgRatio;
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

  // draw frame
  if (frame.complete) {
    ctx.drawImage(frame, 0, 0, W, H);
  }
}

// ===== LOAD FRAME =====
frame.onload = () => {
  render();
};

// ===== IMAGE UPLOAD =====
const input = document.getElementById("photoInput");
const controls = document.getElementById("controls");
const downloadBtn = document.getElementById("downloadBtn");
const zoomSlider = document.getElementById("zoom");
const zoomVal = document.getElementById("zoomVal");

input.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    const img = new Image();

    img.onload = function () {
      photo = img;
      zoom = 1;
      dx = 0;
      dy = 0;

      controls.style.display = "block";
      downloadBtn.disabled = false;
      zoomSlider.value = 100;
      zoomVal.textContent = "100%";

      render();
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

// ===== ZOOM SLIDER =====
zoomSlider.addEventListener("input", function () {
  zoom = this.value / 100;
  zoomVal.textContent = `${this.value}%`;
  render();
});

// ===== DRAG =====
canvas.addEventListener("mousedown", (e) => {
  if (!photo) return;
  dragging = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});

window.addEventListener("mouseup", () => {
  dragging = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (!dragging || !photo) return;

  const scaleX = W / canvas.clientWidth;
  const scaleY = H / canvas.clientHeight;

  dx += (e.offsetX - lastX) * scaleX;
  dy += (e.offsetY - lastY) * scaleY;

  lastX = e.offsetX;
  lastY = e.offsetY;

  render();
});

// ===== DOWNLOAD =====
downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "FortFest_DP.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});
