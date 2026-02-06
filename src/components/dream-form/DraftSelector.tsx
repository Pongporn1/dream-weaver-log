import { Clock, FileText, Plus, Trash2, X } from "lucide-react";
import { DraftMetadata } from "@/lib/draftManager";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface DraftSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drafts: DraftMetadata[];
  activeDraftId: string | null;
  onSelectDraft: (id: string) => void;
  onDeleteDraft: (id: string) => void;
  onNewDraft: () => void;
}

export function DraftSelector({
  open,
  onOpenChange,
  drafts,
  activeDraftId,
  onSelectDraft,
  onDeleteDraft,
  onNewDraft,
}: DraftSelectorProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>แบบร่างทั้งหมด</SheetTitle>
              <SheetDescription>
                เลือกแบบร่างที่ต้องการแก้ไข หรือสร้างใหม่
              </SheetDescription>
            </div>
            <Button onClick={onNewDraft} size="sm" className="shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              สร้างแบบร่างใหม่
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {drafts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">ยังไม่มีแบบร่างที่บันทึกไว้</p>
              <p className="text-xs mt-1">เริ่มต้นสร้างแบบร่างใหม่ได้เลย</p>
            </div>
          ) : (
            drafts.map((draft) => (
              <div
                key={draft.id}
                className={`
                  card-minimal p-3 sm:p-4 cursor-pointer transition-all
                  hover:border-primary/40 hover:shadow-sm
                  ${activeDraftId === draft.id ? "border-primary bg-primary/5" : ""}
                `}
                onClick={() => {
                  onSelectDraft(draft.id);
                  onOpenChange(false);
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">
                        {draft.title}
                      </h3>
                      {activeDraftId === draft.id && (
                        <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full shrink-0">
                          กำลังใช้
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {draft.previewText}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>บันทึกเมื่อ {formatDate(draft.savedAt)}</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("ต้องการลบแบบร่างนี้หรือไม่?")) {
                        onDeleteDraft(draft.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
