export function normalizeText(value: string): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;
  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;

  const costs = new Array(bLen + 1).fill(0).map((_, i) => i);

  for (let i = 1; i <= aLen; i++) {
    let prevDiagonal = costs[0];
    costs[0] = i;
    for (let j = 1; j <= bLen; j++) {
      const temp = costs[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      costs[j] = Math.min(costs[j] + 1, costs[j - 1] + 1, prevDiagonal + cost);
      prevDiagonal = temp;
    }
  }

  return costs[bLen];
}

function tokenOverlap(a: string, b: string): number {
  const aTokens = a.split(" ").filter((t) => t.length > 1);
  const bTokens = b.split(" ").filter((t) => t.length > 1);
  if (aTokens.length === 0 || bTokens.length === 0) return 0;

  const bSet = new Set(bTokens);
  const common = aTokens.filter((t) => bSet.has(t));
  return common.length / Math.max(aTokens.length, bTokens.length);
}

export function isLikelySame(a: string, b: string): boolean {
  const left = normalizeText(a);
  const right = normalizeText(b);
  if (!left || !right) return false;
  if (left === right) return true;

  const maxLen = Math.max(left.length, right.length);
  if (maxLen <= 4) return false;

  const overlap = tokenOverlap(left, right);
  if (overlap >= 0.7) return true;

  const distance = levenshtein(left, right);
  const similarity = 1 - distance / maxLen;
  const threshold = maxLen <= 7 ? 0.88 : 0.84;
  return similarity >= threshold;
}

export function findCommonValues(listA: string[], listB: string[]): string[] {
  const normalizedB = listB
    .map((raw) => ({ raw, norm: normalizeText(raw) }))
    .filter((item) => item.norm.length > 0);

  const seen = new Set<string>();
  const common: string[] = [];

  for (const raw of listA) {
    const norm = normalizeText(raw);
    if (!norm || seen.has(norm)) continue;

    const matched = normalizedB.some((item) => {
      if (item.norm === norm) return true;
      return isLikelySame(raw, item.raw);
    });

    if (matched) {
      common.push(raw);
      seen.add(norm);
    }
  }

  return common;
}
