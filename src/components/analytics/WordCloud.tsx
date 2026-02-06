import { useMemo } from "react";
import { DreamLog } from "@/types/dream";
import { Cloud, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  dreams: DreamLog[];
}

interface WordFrequency {
  word: string;
  count: number;
  size: number;
  weight: number;
  tier: "hero" | "core" | "soft";
  colorIndex: number;
  rotate: number;
}

export function WordCloud({ dreams }: Props) {
  const { words, totalMentions, uniqueCount, topWord } = useMemo(() => {
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
      "be",
      "been",
      "are",
      "as",
    ]);

    const wordCount = new Map<
      string,
      { count: number; weight: number; display: string }
    >();

    const hasThai = (value: string) => /[\u0E00-\u0E7F]/.test(value);

    const cleanToken = (value: string) =>
      value
        .normalize("NFC")
        .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")
        .trim();

    const pushWord = (raw: string, weight: number) => {
      const cleaned = cleanToken(raw);
      if (!cleaned) return;

      const isThai = hasThai(cleaned);
      const normalized = isThai ? cleaned : cleaned.toLowerCase();
      if (normalized.length < (isThai ? 2 : 3)) return;
      if (stopWords.has(normalized)) return;

      const entry = wordCount.get(normalized);
      if (entry) {
        entry.count += 1;
        entry.weight += weight;
      } else {
        wordCount.set(normalized, {
          count: 1,
          weight,
          display: cleaned,
        });
      }
    };

    const addText = (text: string, weight: number) => {
      if (!text) return;
      text
        .split(/[\s,.:;!?()[\]{}"“”'’—–\-_/]+/)
        .filter(Boolean)
        .forEach((token) => pushWord(token, weight));
    };

    const addList = (items: string[], weight: number) => {
      items.forEach((item) => pushWord(item, weight));
    };

    dreams.forEach((dream) => {
      addText(dream.notes || "", 1);
      addList(dream.environments || [], 1.2);
      addList(dream.entities || [], 1.4);
      addText(dream.world || "", 1.6);
    });

    // Convert to array and sort by frequency
    const sortedWords = Array.from(wordCount.entries())
      .map(([, data]) => ({
        word: data.display,
        count: data.count,
        weight: data.weight,
      }))
      .sort((a, b) => b.weight - a.weight || b.count - a.count)
      .slice(0, 36); // Top 36 words

    if (sortedWords.length === 0) {
      return {
        words: [],
        totalMentions: 0,
        uniqueCount: 0,
        topWord: null as string | null,
      };
    }

    const weights = sortedWords.map((w) => w.weight);
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);
    const range = maxWeight - minWeight || 1;
    const minSize = 13;
    const maxSize = 38;

    const hashWord = (value: string) =>
      value
        .split("")
        .reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 3), 0);

    const entries: WordFrequency[] = sortedWords.map((entry, index) => {
      const scaled = (entry.weight - minWeight) / range;
      const eased = Math.pow(scaled, 0.72);
      const lengthPenalty = Math.max(0.76, 1 - Math.max(0, entry.word.length - 12) * 0.02);
      const size = minSize + eased * (maxSize - minSize) * lengthPenalty;
      const hash = hashWord(entry.word);
      const tier = index < 4 ? "hero" : index < 12 ? "core" : "soft";

      return {
        word: entry.word,
        count: entry.count,
        weight: entry.weight,
        size,
        tier,
        colorIndex: hash % 5,
        rotate:
          tier === "hero"
            ? 0
            : tier === "soft"
              ? ((hash % 7) - 3) * 1.5
              : ((hash % 5) - 2) * 0.8,
      };
    });

    return {
      words: entries,
      totalMentions: sortedWords.reduce((sum, item) => sum + item.count, 0),
      uniqueCount: sortedWords.length,
      topWord: sortedWords[0]?.word ?? null,
    };
  }, [dreams]);

  const palette = [
    {
      text: "text-sky-700 dark:text-sky-300",
      bg: "bg-sky-100/70 dark:bg-sky-900/30",
      ring: "ring-sky-200/70 dark:ring-sky-800/50",
      gradient: "linear-gradient(120deg, #38bdf8, #6366f1)",
    },
    {
      text: "text-violet-700 dark:text-violet-300",
      bg: "bg-violet-100/70 dark:bg-violet-900/30",
      ring: "ring-violet-200/70 dark:ring-violet-800/50",
      gradient: "linear-gradient(120deg, #a855f7, #6366f1)",
    },
    {
      text: "text-emerald-700 dark:text-emerald-300",
      bg: "bg-emerald-100/70 dark:bg-emerald-900/30",
      ring: "ring-emerald-200/70 dark:ring-emerald-800/50",
      gradient: "linear-gradient(120deg, #34d399, #38bdf8)",
    },
    {
      text: "text-amber-700 dark:text-amber-300",
      bg: "bg-amber-100/70 dark:bg-amber-900/30",
      ring: "ring-amber-200/70 dark:ring-amber-800/50",
      gradient: "linear-gradient(120deg, #f59e0b, #fb7185)",
    },
    {
      text: "text-rose-700 dark:text-rose-300",
      bg: "bg-rose-100/70 dark:bg-rose-900/30",
      ring: "ring-rose-200/70 dark:ring-rose-800/50",
      gradient: "linear-gradient(120deg, #fb7185, #a855f7)",
    },
  ];

  if (words.length === 0) {
    return (
      <div className="card-minimal relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.12), transparent 55%), radial-gradient(circle at 80% 0%, rgba(168, 85, 247, 0.12), transparent 45%)",
          }}
        />
        <div className="relative flex items-center gap-2 mb-3">
          <Cloud className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Word Cloud</h2>
        </div>
        <div className="relative text-sm text-muted-foreground text-center py-8">
          ยังไม่มีข้อมูลเพียงพอ
        </div>
      </div>
    );
  }

  return (
    <div className="card-minimal relative overflow-hidden space-y-4">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(99, 102, 241, 0.12), transparent 55%), radial-gradient(circle at 80% 0%, rgba(56, 189, 248, 0.12), transparent 45%)",
        }}
      />
      <div className="relative flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Word Cloud</h2>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Sparkles className="w-3 h-3" />
          สรุปคำสำคัญ
        </div>
      </div>

      <div className="relative flex flex-wrap gap-2 text-[11px] text-muted-foreground">
        <span className="px-2 py-0.5 rounded-full bg-secondary/70">
          คำไม่ซ้ำ {uniqueCount}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-secondary/70">
          ทั้งหมด {totalMentions} ครั้ง
        </span>
        {topWord && (
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            ยอดนิยม: {topWord}
          </span>
        )}
      </div>

      <div className="relative flex flex-wrap gap-2 justify-center items-center py-4 min-h-[220px]">
        {words.map(({ word, count, size, tier, colorIndex, rotate }) => {
          const paletteEntry = palette[colorIndex];
          const isHero = tier === "hero";
          const isCore = tier === "core";

          return (
          <span
            key={word}
            className={cn(
              "cursor-default select-none transition-all duration-200 ease-out",
              isHero
                ? "px-1 font-semibold tracking-tight text-transparent bg-clip-text drop-shadow-sm"
                : "px-2.5 py-1 rounded-full ring-1",
              !isHero && paletteEntry.bg,
              !isHero && paletteEntry.ring,
              !isHero && paletteEntry.text,
            )}
            style={{
              fontSize: `${size}px`,
              fontWeight: isHero ? 600 : isCore ? 500 : 400,
              opacity: isHero ? 0.95 : isCore ? 0.85 : 0.7,
              transform: `rotate(${rotate}deg)`,
              backgroundImage: isHero ? paletteEntry.gradient : undefined,
            }}
            title={`${count} ครั้ง`}
          >
            {word}
          </span>
          );
        })}
      </div>
    </div>
  );
}
