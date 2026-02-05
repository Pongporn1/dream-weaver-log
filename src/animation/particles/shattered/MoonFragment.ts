/**
 * Moon Fragment System
 *
 * Floating pieces of the shattered moon that orbit around the main body
 */

export interface MoonFragment {
  x: number;
  y: number;
  size: number;
  angle: number;
  distance: number;
  orbitSpeed: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

/**
 * Initialize Floating Moon Fragments
 */
export const initMoonFragments = (
  moonX: number,
  moonY: number,
  count = 12,
): MoonFragment[] => {
  const fragments: MoonFragment[] = [];

  for (let i = 0; i < count; i++) {
    const angle = ((Math.PI * 2) / count) * i + (Math.random() - 0.5) * 0.4;
    const distance = 60 + Math.random() * 45; // ลอยออกไปไกลขึ้น

    fragments.push({
      x: moonX + Math.cos(angle) * distance,
      y: moonY + Math.sin(angle) * distance,
      size: 5 + Math.random() * 8, // ใหญ่ขึ้น
      angle,
      distance,
      orbitSpeed: 0.0008 + Math.random() * 0.0015, // ช้าลงนิดหน่อย
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.025,
      opacity: 0.7 + Math.random() * 0.3, // โปร่งใสน้อยลง
    });
  }

  return fragments;
};

/**
 * Draw and update Floating Moon Fragments
 */
export const drawMoonFragments = (
  ctx: CanvasRenderingContext2D,
  fragments: MoonFragment[],
  moonX: number,
  moonY: number,
  moonColor: string,
) => {
  fragments.forEach((frag) => {
    // Update orbit
    frag.angle += frag.orbitSpeed;
    frag.rotation += frag.rotationSpeed;

    // Calculate position
    frag.x = moonX + Math.cos(frag.angle) * frag.distance;
    frag.y = moonY + Math.sin(frag.angle) * frag.distance;

    ctx.save();
    ctx.translate(frag.x, frag.y);
    ctx.rotate(frag.rotation);

    // วาดเงาของเศษดวงจันทร์
    ctx.fillStyle = `rgba(0, 0, 0, ${frag.opacity * 0.4})`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.beginPath();
    const sides = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < sides; i++) {
      const angle = ((Math.PI * 2) / sides) * i;
      const radius = frag.size * (0.8 + Math.random() * 0.5);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // วาดเศษดวงจันทร์หลัก
    ctx.fillStyle = `${moonColor}${Math.floor(frag.opacity * 255)
      .toString(16)
      .padStart(2, "0")}`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = moonColor;
    ctx.fill();

    // เพิ่มขอบเรืองแสง
    ctx.strokeStyle = `rgba(255, 255, 255, ${frag.opacity * 0.6})`;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 5;
    ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
    ctx.stroke();

    // วาดไฮไลท์ตรงกลาง
    const highlightGrad = ctx.createRadialGradient(
      0,
      0,
      0,
      0,
      0,
      frag.size * 0.6,
    );
    highlightGrad.addColorStop(0, `rgba(255, 255, 255, ${frag.opacity * 0.4})`);
    highlightGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = highlightGrad;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(0, 0, frag.size * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
};
