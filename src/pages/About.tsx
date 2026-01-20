import { Shield, Info, Bot } from 'lucide-react';

export default function About() {
  return (
    <div className="py-4 space-y-8">
      <h1>About / Safety</h1>

      <div className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-medium">เกี่ยวกับ Dream book</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Dream book by Bon เป็นเว็บบันทึกความฝันส่วนตัว ออกแบบมาเพื่อจัดระบบและติดตามรูปแบบความฝันอย่างมีโครงสร้าง 
            ไม่ใช่ไดอารี่หรือการเล่าเรื่องยาวๆ แต่เป็น structured log ที่ช่วยให้เห็นความเชื่อมโยงระหว่างโลก สิ่งมีชีวิต 
            และระบบต่างๆ ในความฝัน
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-medium">ข้อควรระวัง</h2>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>นี่ไม่ใช่เครื่องมือทำนายอนาคตหรือตีความทางจิตวิทยา</li>
            <li>ความฝันเป็นประสบการณ์ส่วนตัว ข้อมูลไม่ได้บ่งบอกถึงสิ่งเหนือธรรมชาติ</li>
            <li>การบันทึกเป็นเพียงการจดจำและจัดระบบเท่านั้น</li>
            <li>หากมีความกังวลเกี่ยวกับการนอนหรือสุขภาพจิต ควรปรึกษาผู้เชี่ยวชาญ</li>
          </ul>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-medium">AI ในระบบนี้</h2>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>
              <strong>Sleep Calculator:</strong> ใช้ AI Vision ดึงตัวเลขจากภาพหน้าจอแอปนอน คำนวณสถิติการนอน
            </li>
            <li>
              <strong>AI Librarian:</strong> ค้นหาและอ้างอิงข้อมูลจากคลังเท่านั้น ไม่ตีความ ไม่ทำนาย 
              ถ้าไม่พบข้อมูลจะบอกว่า "ไม่พบในคลัง"
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            AI เป็นเครื่องมือช่วยจัดระบบและคำนวณ ไม่ใช่ผู้ให้คำตอบเรื่องชีวิตหรือความหมาย
          </p>
        </section>

        <section className="card-minimal text-center">
          <p className="text-sm text-muted-foreground">
            Dream book by Bon © {new Date().getFullYear()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Personal Dream Logging System
          </p>
        </section>
      </div>
    </div>
  );
}
