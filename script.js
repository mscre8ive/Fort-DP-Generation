if (photo) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(hole.x, hole.y, hole.r, 0, Math.PI * 2);
  ctx.clip();

  const diameter = hole.r * 2;
  const imgRatio = photo.width / photo.height;

  let drawW, drawH;

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
