// จัดการความถี่การใช้งานของสภาพแวดล้อม
const ENVIRONMENT_FREQUENCY_KEY = "dream-environment-frequency";

export interface EnvironmentFrequency {
  [environmentName: string]: number;
}

// โหลดความถี่จาก localStorage
export function getEnvironmentFrequency(): EnvironmentFrequency {
  try {
    const stored = localStorage.getItem(ENVIRONMENT_FREQUENCY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("Failed to load environment frequency:", error);
  }
  return {};
}

// บันทึกความถี่ลง localStorage
export function saveEnvironmentFrequency(
  frequency: EnvironmentFrequency,
): void {
  try {
    localStorage.setItem(ENVIRONMENT_FREQUENCY_KEY, JSON.stringify(frequency));
  } catch (error) {
    console.warn("Failed to save environment frequency:", error);
  }
}

// เพิ่มความถี่ของสภาพแวดล้อมที่ใช้
export function incrementEnvironmentFrequency(
  environmentNames: string[],
): void {
  const frequency = getEnvironmentFrequency();

  environmentNames.forEach((name) => {
    if (name && name.trim()) {
      frequency[name] = (frequency[name] || 0) + 1;
    }
  });

  saveEnvironmentFrequency(frequency);
}

// ดึง Top N สภาพแวดล้อมที่ใช้บ่อยที่สุด
export function getTopEnvironments(count: number = 6): string[] {
  const frequency = getEnvironmentFrequency();

  // เรียงตามความถี่จากมากไปน้อย
  const sorted = Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([name]) => name);

  return sorted;
}

// รีเซ็ตความถี่ทั้งหมด
export function resetEnvironmentFrequency(): void {
  localStorage.removeItem(ENVIRONMENT_FREQUENCY_KEY);
}
