import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CoverPreviewProps {
  coverUrl: string | null;
  isGenerating: boolean;
  onRegenerate?: () => void;
  dreamTitle?: string;
}

export function CoverPreview({
  coverUrl,
  isGenerating,
  onRegenerate,
  dreamTitle,
}: CoverPreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleDownload = () => {
    if (!coverUrl) return;
    const link = document.createElement("a");
    link.href = coverUrl;
    link.download = `dream-cover-${Date.now()}.png`;
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          ปกหนังสือความฝัน
        </h3>
        {coverUrl && !isGenerating && (
          <div className="flex gap-2">
            {onRegenerate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRegenerate}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                สร้างใหม่
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <Download className="h-4 w-4 mr-1" />
              ดาวน์โหลด
            </Button>
          </div>
        )}
      </div>

      <div
        className={cn(
          "relative aspect-[2/3] max-w-[280px] mx-auto rounded-lg overflow-hidden",
          "bg-gradient-to-br from-amber-200/40 via-white to-cyan-200/30",
          "border-2 border-amber-200/70 shadow-2xl shadow-amber-200/40"
        )}
      >
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            >
              <div className="relative">
                <div className="absolute inset-0 animate-ping">
                  <Sparkles className="h-12 w-12 text-amber-300/70" />
                </div>
                <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">กำลังสร้างปก...</p>
                <p className="text-xs text-muted-foreground">
                  AI กำลังวาดภาพจากความฝันของคุณ
                </p>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-amber-500"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ) : coverUrl ? (
            <motion.div
              key="image"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative w-full h-full"
            >
              <img
                src={coverUrl}
                alt="Dream Cover"
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-500",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
              />
              {/* Book spine effect */}
              <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/30 to-transparent" />
              {/* Title overlay */}
              {dreamTitle && (
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-sm font-medium line-clamp-2">
                    {dreamTitle}
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-amber-200/60 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-amber-500/70" />
              </div>
              <p className="text-sm text-muted-foreground">
                กรอกข้อมูลความฝันแล้วกด "บันทึก"
                <br />
                ระบบจะสร้างปกให้อัตโนมัติ
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
