// จัดการความถี่การใช้งานของตัวละคร
const ENTITY_FREQUENCY_KEY = "dream-entity-frequency";

export interface EntityFrequency {
  [entityName: string]: number;
}

// โหลดความถี่จาก localStorage
export function getEntityFrequency(): EntityFrequency {
  try {
    const stored = localStorage.getItem(ENTITY_FREQUENCY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("Failed to load entity frequency:", error);
  }
  return {};
}

// บันทึกความถี่ลง localStorage
export function saveEntityFrequency(frequency: EntityFrequency): void {
  try {
    localStorage.setItem(ENTITY_FREQUENCY_KEY, JSON.stringify(frequency));
  } catch (error) {
    console.warn("Failed to save entity frequency:", error);
  }
}

// เพิ่มความถี่ของตัวละครที่ใช้
export function incrementEntityFrequency(entityNames: string[]): void {
  const frequency = getEntityFrequency();

  entityNames.forEach((name) => {
    if (name && name.trim()) {
      frequency[name] = (frequency[name] || 0) + 1;
    }
  });

  saveEntityFrequency(frequency);
}

// ดึง Top N ตัวละครที่ใช้บ่อยที่สุด
export function getTopEntities(count: number = 9): string[] {
  const frequency = getEntityFrequency();

  // เรียงตามความถี่จากมากไปน้อย
  const sorted = Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([name]) => name);

  return sorted;
}

// รีเซ็ตความถี่ทั้งหมด (ใช้เมื่อต้องการเริ่มใหม่)
export function resetEntityFrequency(): void {
  localStorage.removeItem(ENTITY_FREQUENCY_KEY);
}
