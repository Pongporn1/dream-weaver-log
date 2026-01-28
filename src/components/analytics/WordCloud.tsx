import { useMemo } from "react";
import { DreamLog } from "@/types/dream";
import { Cloud } from "lucide-react";

interface Props {
  dreams: DreamLog[];
}

interface WordFrequency {
  word: string;
  count: number;
  size: number;
}

export function WordCloud({ dreams }: Props) {
  const words = useMemo(() => {
    // Thai stop words to filter out
    const stopWords = new Set([
      "และ",
      "ของ",
      "ที่",
      "ใน",
      "เป็น",
      "ได้",
      "มี",
      "ไป",
      "มา",
      "แล้ว",
      "กับ",
      "ก็",
      "จาก",
      "นี้",
      "นั้น",
      "ว่า",
      "ถ้า",
      "เมื่อ",
      "หรือ",
      "อยู่",
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "from",
      "up",
      "about",
      "into",
      "is",
      "was",
      "were",
    ]);

    const wordCount = new Map<string, number>();

    dreams.forEach((dream) => {
      // Extract words from notes, environments, and entities
      const text = [
        dream.notes || "",
        ...dream.environments,
        ...dream.entities,
        dream.world,
      ].join(" ");

      // Split by whitespace and Thai word boundaries
      const words = text
        .split(/[\s,.:;!?()[\]{}]+/)
        .filter((word) => word.length > 2 && !stopWords.has(word.toLowerCase()))
        .map((word) => word.toLowerCase());

      words.forEach((word) => {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      });
    });

    // Convert to array and sort by frequency
    const sortedWords = Array.from(wordCount.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30); // Top 30 words

    if (sortedWords.length === 0) return [];

    // Calculate sizes (font sizes from 12px to 36px)
    const maxCount = Math.max(...sortedWords.map((w) => w.count));
    const minCount = Math.min(...sortedWords.map((w) => w.count));
    const range = maxCount - minCount || 1;

    return sortedWords.map(({ word, count }) => ({
      word,
      count,
      size: 12 + ((count - minCount) / range) * 24,
    }));
  }, [dreams]);

  if (words.length === 0) {
    return (
      <div className="card-minimal">
        <div className="flex items-center gap-2 mb-3">
          <Cloud className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Word Cloud</h2>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">
          ยังไม่มีข้อมูลเพียงพอ
        </p>
      </div>
    );
  }

  return (
    <div className="card-minimal space-y-3">
      <div className="flex items-center gap-2">
        <Cloud className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">Word Cloud</h2>
      </div>

      <div className="flex flex-wrap gap-2 justify-center items-center py-4 min-h-[200px]">
        {words.map(({ word, count, size }) => (
          <span
            key={word}
            className="cursor-default hover:text-primary transition-colors"
            style={{
              fontSize: `${size}px`,
              fontWeight: Math.round(300 + (size / 36) * 400),
              opacity: 0.6 + (size / 36) * 0.4,
            }}
            title={`${count} ครั้ง`}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}
