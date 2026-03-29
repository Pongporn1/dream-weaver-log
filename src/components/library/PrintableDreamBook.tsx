import { DreamLog, DREAM_TYPE_LABELS, THREAT_ENTRY_LEVEL_LABELS } from "@/types/dream";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface PrintableDreamBookProps {
  dreams: DreamLog[];
}

export function PrintableDreamBook({ dreams }: PrintableDreamBookProps) {
  // Sort dreams chronologically for a book reading experience
  const sortedDreams = [...dreams].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div id="printable-dream-book" className="hidden print:block !text-black bg-white min-h-screen font-serif w-full max-w-none">
      
      {/* Cover Page */}
      <div className="flex flex-col items-center justify-center min-h-[100vh] text-center border-8 border-double border-gray-800 p-12" style={{ pageBreakAfter: 'always' }}>
        <h1 className="text-5xl font-bold mb-8 uppercase tracking-widest font-['DM_Serif_Display']">The Dream Weaver</h1>
        <h2 className="text-3xl font-semibold mb-12 text-gray-700">บันทึกมิติความฝัน</h2>
        <div className="w-24 h-px bg-gray-500 my-8"></div>
        <p className="text-xl text-gray-600 mb-2">ข้อมูลทั้งหมดตั้งแต่วันที่</p>
        <p className="text-2xl font-medium">
          {sortedDreams.length > 0
            ? format(new Date(sortedDreams[0].date), "dd MMMM yyyy", { locale: th })
            : "-"} 
            {" ถึง "} 
          {sortedDreams.length > 0
            ? format(new Date(sortedDreams[sortedDreams.length - 1].date), "dd MMMM yyyy", { locale: th })
            : "-"}
        </p>
        <div className="mt-auto pb-12">
          <p className="text-lg text-gray-500">รวมทั้งหมด {dreams.length} ตอน</p>
          <p className="text-sm text-gray-400 mt-2">สร้างอัตโนมัติจากเวทมนตร์แห่ง Dream Weaver Log</p>
        </div>
      </div>

      {/* Chapters (List of Dreams) */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        <h3 className="text-4xl font-bold mb-10 text-center border-b-2 border-gray-300 pb-4 font-['DM_Serif_Display']">
          สารบบความฝัน (Archive of Realities)
        </h3>

        {sortedDreams.map((dream, index) => {
          // Format date like 'วันอาทิตย์ที่ 10 สิงหาคม 2566'
          const formattedDate = format(new Date(dream.date), "EEEEที่ d MMMM yyyy", { locale: th });
          
          return (
            <article 
              key={dream.id} 
              className="mb-16 pt-8 border-t border-dashed border-gray-400"
              style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
            >
              <header className="mb-6">
                <div className="flex justify-between items-baseline mb-2">
                  <h4 className="text-2xl font-bold text-gray-900">
                    ตอนที่ {index + 1}: ดินแดน {dream.world || "ไร้ชื่อ"}
                  </h4>
                  <span className="text-gray-500 text-sm font-medium">
                    {formattedDate} เวลาตื่น {dream.wakeTime}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 text-xs mb-4">
                  {dream.dreamTypes?.map((t) => (
                    <span key={t} className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-gray-700">
                      {DREAM_TYPE_LABELS[t as keyof typeof DREAM_TYPE_LABELS] || t}
                    </span>
                  ))}
                  <span className="px-2 py-1 bg-red-50 border border-red-200 rounded text-red-800">
                    ภัยคุกคาม {dream.threatLevel > 0 ? `ระดับ ${dream.threatLevel}` : 'ไม่มี'}
                  </span>
                  {dream.environments?.length > 0 && (
                    <span className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-blue-800">
                      สภาพแวดล้อม: {dream.environments.join(", ")}
                    </span>
                  )}
                  {dream.entities?.length > 0 && (
                    <span className="px-2 py-1 bg-green-50 border border-green-200 rounded text-green-800">
                      สิ่งมีชีวิต: {dream.entities.join(", ")}
                    </span>
                  )}
                </div>
              </header>

              <div className="text-lg leading-relaxed text-gray-800 text-justify whitespace-pre-wrap font-sans">
                {dream.notes ? dream.notes : <span className="text-gray-400 italic">...ไม่มีบันทึกรายละเอียดของความฝันนี้...</span>}
              </div>
              
              <footer className="mt-8 text-sm text-gray-500 italic text-right">
                ทางออก: {dream.exit} | มาตรการรักษาความปลอดภัย: {dream.safetyOverride}
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}
