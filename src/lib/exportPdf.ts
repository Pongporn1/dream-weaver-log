import { DreamLog } from "@/types/dream";
import { DREAM_TYPE_LABELS } from "@/types/dream";

// ตรวจสอบว่าเป็น iOS หรือไม่
function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function printDreamLog(dream: DreamLog) {
  const dreamTypeLabels = dream.dreamTypes
    ?.map((type) => DREAM_TYPE_LABELS[type as keyof typeof DREAM_TYPE_LABELS])
    .join(", ");

  const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dream Log - ${dream.date}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Sarabun', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
          color: #1a1a1a;
        }
        
        h1 {
          font-size: 28px;
          color: #2563eb;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 3px solid #2563eb;
        }
        
        .metadata {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 30px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
        }
        
        .metadata-item {
          display: flex;
          flex-direction: column;
        }
        
        .metadata-label {
          font-size: 12px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .metadata-value {
          font-size: 16px;
          color: #1e293b;
          font-weight: 500;
        }
        
        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .content {
          padding: 15px;
          background: white;
          border-left: 4px solid #2563eb;
          white-space: pre-wrap;
        }
        
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }
        
        .tag {
          display: inline-block;
          padding: 4px 12px;
          background: #e0e7ff;
          color: #3730a3;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .tag-dream-type {
          background: #fef3c7;
          color: #92400e;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #94a3b8;
          font-size: 12px;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          
          .no-print {
            display: none;
          }
        }
        
        @page {
          margin: 2cm;
        }
      </style>
    </head>
    <body>
      <h1>🌙 Dream Log</h1>
      
      <div class="metadata">
        <div class="metadata-item">
          <span class="metadata-label">วันที่</span>
          <span class="metadata-value">${new Date(
            dream.date,
          ).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">เวลาตื่น</span>
          <span class="metadata-value">${dream.wakeTime}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">โลก</span>
          <span class="metadata-value">${dream.world}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">ระบบเวลา</span>
          <span class="metadata-value">${
            dream.timeSystem === "activated"
              ? "ใช้งาน"
              : dream.timeSystem === "inactive"
                ? "ไม่ใช้งาน"
                : "ไม่ทราบ"
          }</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">ระดับภัยคุกคาม</span>
          <span class="metadata-value">Level ${dream.threatLevel}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">การออก</span>
          <span class="metadata-value">${
            dream.exit === "wake"
              ? "ตื่น"
              : dream.exit === "separation"
                ? "แยก"
                : dream.exit === "collapse"
                  ? "ถล่ม"
                  : "ไม่ทราบ"
          }</span>
        </div>
      </div>
      
      ${
        dreamTypeLabels
          ? `
      <div class="section">
        <div class="section-title">ประเภทฝัน</div>
        <div class="tags">
          ${dream.dreamTypes
            ?.map(
              (type) =>
                `<span class="tag tag-dream-type">${DREAM_TYPE_LABELS[type as keyof typeof DREAM_TYPE_LABELS]}</span>`,
            )
            .join("")}
        </div>
      </div>
      `
          : ""
      }
      
      ${
        dream.environments.length > 0
          ? `
      <div class="section">
        <div class="section-title">สภาพแวดล้อม</div>
        <div class="tags">
          ${dream.environments.map((env) => `<span class="tag">${env}</span>`).join("")}
        </div>
      </div>
      `
          : ""
      }
      
      ${
        dream.entities.length > 0
          ? `
      <div class="section">
        <div class="section-title">ตัวละคร/สิ่งมีชีวิต</div>
        <div class="tags">
          ${dream.entities.map((entity) => `<span class="tag">${entity}</span>`).join("")}
        </div>
      </div>
      `
          : ""
      }
      
      ${
        dream.notes
          ? `
      <div class="section">
        <div class="section-title">Notes & เรื่องย่อ</div>
        <div class="content">${dream.notes}</div>
      </div>
      `
          : ""
      }
      
      <div class="footer">
        บันทึกเมื่อ ${new Date(dream.createdAt).toLocaleString("th-TH")}
      </div>
      
      <script>
        // Auto-print เฉพาะบน desktop, iOS ต้องกดเอง
        if (!/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          window.onload = function() {
            window.print();
          };
        }
      </script>
    </body>
    </html>
  `;

  // สำหรับ iOS - ใช้ iframe แทน popup
  if (isIOS()) {
    // ลบ iframe เก่าถ้ามี
    const oldIframe = document.getElementById("dream-print-frame");
    if (oldIframe) oldIframe.remove();

    // สร้าง iframe ใหม่
    const iframe = document.createElement("iframe");
    iframe.id = "dream-print-frame";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      // รอให้โหลดเสร็จแล้วเปิด print dialog
      setTimeout(() => {
        iframe.contentWindow?.print();

        // ลบ iframe หลัง print
        setTimeout(() => {
          iframe.remove();
        }, 1000);
      }, 500);
    }
  } else {
    // Desktop - ใช้ window.open ตามเดิม
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("กรุณาอนุญาตให้เปิดหน้าต่างใหม่");
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
