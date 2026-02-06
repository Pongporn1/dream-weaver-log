import { DreamLog, DREAM_TYPE_LABELS } from "@/types/dream";

export function exportToHTML(
  dreams: DreamLog[],
  title: string = "บันทึกความฝัน",
) {
  const sortedDreams = [...dreams].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: "Sukhumvit Set", "Sarabun", "Noto Sans Thai", sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #ffffff;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #0a0a0a;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 0.5rem;
    }
    .meta {
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 2rem;
    }
    .toc {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .toc h2 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      color: #111827;
    }
    .toc ul {
      list-style: none;
      padding-left: 0;
    }
    .toc li {
      margin-bottom: 0.5rem;
    }
    .toc a {
      color: #3b82f6;
      text-decoration: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    .toc a:hover {
      background: #dbeafe;
    }
    .dream {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 2rem;
      page-break-inside: avoid;
      background: #ffffff;
    }
    .dream-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #111827;
    }
    .dream-meta {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }
    .dream-meta-item {
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .dream-meta-label {
      font-weight: 600;
      color: #6b7280;
      font-size: 0.75rem;
      text-transform: uppercase;
    }
    .dream-meta-value {
      color: #111827;
    }
    .dream-types {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }
    .dream-type-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 500;
      background: #dbeafe;
      color: #1e40af;
    }
    .dream-type-lucid {
      background: #e9d5ff;
      color: #6b21a8;
    }
    .dream-type-nightmare {
      background: #fee2e2;
      color: #991b1b;
    }
    .dream-type-recurring {
      background: #fef3c7;
      color: #92400e;
    }
    .dream-type-prophetic {
      background: #cffafe;
      color: #155e75;
    }
    .dream-section {
      margin-bottom: 1.5rem;
    }
    .dream-section-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #374151;
    }
    .dream-content {
      color: #1f2937;
      white-space: pre-wrap;
      line-height: 1.8;
    }
    .tag-list {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .tag {
      padding: 0.25rem 0.75rem;
      background: #f3f4f6;
      border-radius: 999px;
      font-size: 0.875rem;
      color: #374151;
    }
    .footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;
    }
    @media print {
      body {
        padding: 0;
      }
      .dream {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    สร้างเมื่อ ${new Date().toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })} • ${sortedDreams.length} ฝัน
  </div>

  <div class="toc">
    <h2>สารบัญ</h2>
    <ul>
      ${sortedDreams
        .map(
          (dream, i) => `
        <li>
          <a href="#dream-${i}">
            <span>${dream.world || "โลกไม่ระบุชื่อ"}</span>
            <span style="color: #9ca3af; font-size: 0.75rem;">
              ${dream.date ? formatDate(dream.date) : "ไม่ระบุวันที่"}
            </span>
          </a>
        </li>
      `,
        )
        .join("")}
    </ul>
  </div>

  ${sortedDreams
    .map(
      (dream, i) => `
    <div class="dream" id="dream-${i}">
      <div class="dream-title">${dream.world || "โลกไม่ระบุชื่อ"}</div>
      
      ${
        dream.dreamTypes && dream.dreamTypes.length > 0
          ? `
        <div class="dream-types">
          ${dream.dreamTypes
            .map(
              (type) => `
            <span class="dream-type-badge dream-type-${type}">
              ${DREAM_TYPE_LABELS[type as keyof typeof DREAM_TYPE_LABELS] || type}
            </span>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }

      <div class="dream-meta">
        <div class="dream-meta-item">
          <div class="dream-meta-label">วันที่</div>
          <div class="dream-meta-value">
            ${dream.date ? formatDate(dream.date) : "ไม่ระบุ"}
          </div>
        </div>
        <div class="dream-meta-item">
          <div class="dream-meta-label">เวลาตื่น</div>
          <div class="dream-meta-value">${dream.wakeTime || "ไม่ระบุ"}</div>
        </div>
        <div class="dream-meta-item">
          <div class="dream-meta-label">ระดับภัยคุกคาม</div>
          <div class="dream-meta-value">Level ${dream.threatLevel}</div>
        </div>
        <div class="dream-meta-item">
          <div class="dream-meta-label">ระบบเวลา</div>
          <div class="dream-meta-value">
            ${
              dream.timeSystem === "activated"
                ? "เปิดใช้งาน"
                : dream.timeSystem === "inactive"
                  ? "ไม่ทำงาน"
                  : "ไม่ทราบ"
            }
          </div>
        </div>
      </div>

      ${
        dream.environments && dream.environments.length > 0
          ? `
        <div class="dream-section">
          <div class="dream-section-title">สภาพแวดล้อม</div>
          <div class="tag-list">
            ${dream.environments.map((env) => `<span class="tag">${env}</span>`).join("")}
          </div>
        </div>
      `
          : ""
      }

      ${
        dream.entities && dream.entities.length > 0
          ? `
        <div class="dream-section">
          <div class="dream-section-title">เอนทิตี</div>
          <div class="tag-list">
            ${dream.entities.map((ent) => `<span class="tag">${ent}</span>`).join("")}
          </div>
        </div>
      `
          : ""
      }

      ${
        dream.notes && dream.notes.trim()
          ? `
        <div class="dream-section">
          <div class="dream-section-title">บันทึก</div>
          <div class="dream-content">${dream.notes}</div>
        </div>
      `
          : ""
      }
    </div>
  `,
    )
    .join("")}

  <div class="footer">
    <p>บันทึกความฝัน • สร้างด้วย Dream Weaver Log</p>
    <p>© ${new Date().getFullYear()} • เอกสารนี้สร้างขึ้นเพื่อการเก็บบันทึกส่วนตัว</p>
  </div>
</body>
</html>`;

  return html;
}

export function downloadHTML(
  dreams: DreamLog[],
  filename: string = "dream-logs",
) {
  const html = exportToHTML(dreams);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
