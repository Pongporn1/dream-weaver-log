/**
 * Moon Crack System
 *
 * Cracks on the moon surface with branching patterns and glowing effects
 */

export interface MoonCrack {
  startAngle: number;
  length: number;
  width: number;
  branches: { angle: number; length: number }[];
  opacity: number;
}

/**
 * Initialize Moon Cracks for Shattered Moon
 */
export const initMoonCracks = (count = 5): MoonCrack[] => {
  const cracks: MoonCrack[] = [];

  for (let i = 0; i < count; i++) {
    const startAngle =
      ((Math.PI * 2) / count) * i + (Math.random() - 0.5) * 0.4;
    // สร้างรอยแตกที่มีความยาวแตกต่างกัน - ดูเป็นธรรมชาติ
    const crackType = Math.random();
    let length, width;

    if (crackType < 0.3) {
      // รอยแตกยาวมาก (30%)
      length = 50 + Math.random() * 40;
      width = 2 + Math.random() * 1.5;
    } else if (crackType < 0.7) {
      // รอยแตกปานกลาง (40%)
      length = 35 + Math.random() * 25;
      width = 1.8 + Math.random() * 1.2;
    } else {
      // รอยแตกสั้น (30%)
      length = 20 + Math.random() * 20;
      width = 1.5 + Math.random() * 1;
    }

    const crack: MoonCrack = {
      startAngle,
      length,
      width,
      branches: [],
      opacity: 0.7 + Math.random() * 0.3,
    };

    // กิ่งแตกที่หลากหลาย - รอยยาวมีกิ่งเยอะ รอยสั้นมีกิ่งน้อย
    const branchCount =
      crackType < 0.3
        ? 2 + Math.floor(Math.random() * 3)
        : crackType < 0.7
          ? 1 + Math.floor(Math.random() * 2)
          : Math.floor(Math.random() * 2);

    for (let j = 0; j < branchCount; j++) {
      crack.branches.push({
        angle: (Math.random() - 0.5) * 0.7,
        length: 10 + Math.random() * (length * 0.4),
      });
    }

    cracks.push(crack);
  }

  return cracks;
};

/**
 * Draw Moon Cracks on the moon surface
 */
export const drawMoonCracks = (
  ctx: CanvasRenderingContext2D,
  cracks: MoonCrack[],
  moonX: number,
  moonY: number,
  moonRadius: number,
  moonColor: string,
) => {
  ctx.save();

  cracks.forEach((crack) => {
    // เริ่มรอยแตกจากใกล้ขอบดวงจันทร์
    const startRadius = moonRadius * (0.3 + Math.random() * 0.4);
    const startX = moonX + Math.cos(crack.startAngle) * startRadius;
    const startY = moonY + Math.sin(crack.startAngle) * startRadius;
    const endX =
      moonX + Math.cos(crack.startAngle) * (startRadius + crack.length);
    const endY =
      moonY + Math.sin(crack.startAngle) * (startRadius + crack.length);

    // Layer 1: เงาลึกของรอยแตก (ดูเหมือนรอยแตกจริงๆ)
    ctx.strokeStyle = `rgba(10, 10, 20, ${crack.opacity * 0.95})`;
    ctx.lineWidth = crack.width + 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 12;
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Layer 2: รอยแตกหลัก
    ctx.strokeStyle = `rgba(25, 25, 40, ${crack.opacity})`;
    ctx.lineWidth = crack.width;
    ctx.shadowBlur = 0;
    ctx.stroke();

    // Layer 3: แสงส่องผ่านรอยแตก (inner glow) - สีน้ำเงินอมม่วงนุ่มนวล
    const innerGlow = ctx.createLinearGradient(startX, startY, endX, endY);
    innerGlow.addColorStop(0, `rgba(200, 220, 255, ${crack.opacity * 0.25})`);
    innerGlow.addColorStop(0.5, `rgba(180, 200, 255, ${crack.opacity * 0.4})`);
    innerGlow.addColorStop(1, `rgba(160, 180, 255, ${crack.opacity * 0.2})`);
    ctx.strokeStyle = innerGlow;
    ctx.lineWidth = crack.width * 0.6;
    ctx.shadowBlur = 8;
    ctx.shadowColor = `rgba(180, 200, 255, ${crack.opacity * 0.6})`;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Layer 4: ขอบรอยแตกเรืองแสงเล็กน้อย
    ctx.strokeStyle = `rgba(220, 230, 255, ${crack.opacity * 0.15})`;
    ctx.lineWidth = crack.width + 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `rgba(200, 220, 255, ${crack.opacity * 0.3})`;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // เพิ่ม sparkle particles ตามรอยแตก
    const sparkleCount = Math.floor(crack.length / 15);
    for (let i = 0; i < sparkleCount; i++) {
      const ratio = (i + 0.5) / sparkleCount;
      const sparkleX = startX + (endX - startX) * ratio;
      const sparkleY = startY + (endY - startY) * ratio;

      if (Math.random() < 0.4) {
        const sparkleGrad = ctx.createRadialGradient(
          sparkleX,
          sparkleY,
          0,
          sparkleX,
          sparkleY,
          2.5,
        );
        sparkleGrad.addColorStop(
          0,
          `rgba(255, 255, 255, ${crack.opacity * 0.5})`,
        );
        sparkleGrad.addColorStop(
          0.5,
          `rgba(200, 220, 255, ${crack.opacity * 0.3})`,
        );
        sparkleGrad.addColorStop(1, "rgba(200, 220, 255, 0)");
        ctx.fillStyle = sparkleGrad;
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // วาดกิ่งแยก
    crack.branches.forEach((branch) => {
      const branchStartRatio = 0.25 + Math.random() * 0.5;
      const branchStartX = startX + (endX - startX) * branchStartRatio;
      const branchStartY = startY + (endY - startY) * branchStartRatio;

      const branchAngle = crack.startAngle + branch.angle;
      const branchEndX = branchStartX + Math.cos(branchAngle) * branch.length;
      const branchEndY = branchStartY + Math.sin(branchAngle) * branch.length;

      // เงากิ่ง
      ctx.strokeStyle = `rgba(10, 10, 20, ${crack.opacity * 0.8})`;
      ctx.lineWidth = crack.width * 0.8 + 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.beginPath();
      ctx.moveTo(branchStartX, branchStartY);
      ctx.lineTo(branchEndX, branchEndY);
      ctx.stroke();

      // กิ่งหลัก
      ctx.strokeStyle = `rgba(25, 25, 40, ${crack.opacity * 0.85})`;
      ctx.lineWidth = crack.width * 0.7;
      ctx.shadowBlur = 0;
      ctx.stroke();

      // แสงในกิ่ง
      ctx.strokeStyle = `rgba(180, 200, 255, ${crack.opacity * 0.3})`;
      ctx.lineWidth = crack.width * 0.5;
      ctx.shadowBlur = 6;
      ctx.shadowColor = `rgba(180, 200, 255, ${crack.opacity * 0.4})`;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ขอบเรืองแสงกิ่ง
      ctx.strokeStyle = `rgba(220, 230, 255, ${crack.opacity * 0.12})`;
      ctx.lineWidth = crack.width * 0.8 + 1.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgba(200, 220, 255, ${crack.opacity * 0.25})`;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
  });

  ctx.restore();
};
