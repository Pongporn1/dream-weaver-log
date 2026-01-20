import { DreamLog, SleepLog, World, Entity, SystemModule, ThreatEntry } from '@/types/dream';

// Generate Dream ID: DS-YYYYMMDD-###
const generateDreamId = (date: string, existingLogs: DreamLog[]): string => {
  const dateStr = date.replace(/-/g, '');
  const sameDayLogs = existingLogs.filter(log => log.date === date);
  const sequence = String(sameDayLogs.length + 1).padStart(3, '0');
  return `DS-${dateStr}-${sequence}`;
};

// Seed data
const seedDreamLogs: DreamLog[] = [
  {
    id: 'DS-20250115-001',
    date: '2025-01-15',
    wakeTime: '07:30',
    world: 'ทะเลหมอก',
    timeSystem: 'activated',
    environments: ['fog', 'sea'],
    entities: ['ผู้สังเกต'],
    threatLevel: 1,
    safetyOverride: 'none',
    exit: 'wake',
    notes: 'มองเห็นชายฝั่งจากระยะไกล มีหมอกบางๆ',
    createdAt: '2025-01-15T07:35:00Z'
  },
  {
    id: 'DS-20250116-001',
    date: '2025-01-16',
    wakeTime: '06:45',
    world: 'เมืองกลางคืน',
    timeSystem: 'inactive',
    environments: ['city', 'night', 'rain'],
    entities: ['นักเดินทาง', 'ผู้พิทักษ์'],
    threatLevel: 3,
    safetyOverride: 'separation',
    exit: 'separation',
    notes: 'ฝนตกหนัก ต้องแยกตัวออกมา',
    createdAt: '2025-01-16T06:50:00Z'
  }
];

const seedSleepLogs: SleepLog[] = [
  {
    id: 'SL-20250114-001',
    date: '2025-01-14',
    sleepStart: '04:48',
    wakeTime: '12:23',
    totalSleep: { hours: 7, minutes: 25 },
    deep: { hours: 2, minutes: 14 },
    light: { hours: 3, minutes: 46 },
    rem: { hours: 1, minutes: 25 },
    nap: { minutes: 11, start: '12:12', end: '12:23' },
    sleepScore: 84,
    deepContinuityScore: 69,
    createdAt: '2025-01-14T12:30:00Z'
  }
];

const seedWorlds: World[] = [
  {
    id: 'w1',
    name: 'ทะเลหมอก',
    type: 'persistent',
    stability: 4,
    dreamIds: ['DS-20250115-001'],
    description: 'ชายฝั่งทะเลที่มีหมอกปกคลุม'
  },
  {
    id: 'w2',
    name: 'เมืองกลางคืน',
    type: 'transient',
    stability: 2,
    dreamIds: ['DS-20250116-001'],
    description: 'เมืองใหญ่ในความมืด'
  }
];

const seedEntities: Entity[] = [
  { id: 'e1', name: 'ผู้สังเกต', role: 'observer', dreamIds: ['DS-20250115-001'] },
  { id: 'e2', name: 'นักเดินทาง', role: 'guide', dreamIds: ['DS-20250116-001'] },
  { id: 'e3', name: 'ผู้พิทักษ์', role: 'protector', dreamIds: ['DS-20250116-001'] }
];

const seedModules: SystemModule[] = [
  { id: 'm1', name: 'Time Activation', type: 'time_activation', dreamIds: ['DS-20250115-001'] },
  { id: 'm2', name: 'Safety Override', type: 'safety_override', dreamIds: ['DS-20250116-001'] }
];

const seedThreats: ThreatEntry[] = [
  { id: 't1', name: 'หมอกหนา', level: 1, response: 'สังเกต', dreamIds: ['DS-20250115-001'] },
  { id: 't2', name: 'ฝนกรด', level: 3, response: 'แยกตัว', dreamIds: ['DS-20250116-001'] }
];

// Local storage helpers
const STORAGE_KEYS = {
  dreamLogs: 'dreambook_dreams',
  sleepLogs: 'dreambook_sleep',
  worlds: 'dreambook_worlds',
  entities: 'dreambook_entities',
  modules: 'dreambook_modules',
  threats: 'dreambook_threats'
};

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading from storage:', e);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to storage:', e);
  }
}

// Initialize with seed data if empty
export function initializeStore(): void {
  if (!localStorage.getItem(STORAGE_KEYS.dreamLogs)) {
    saveToStorage(STORAGE_KEYS.dreamLogs, seedDreamLogs);
  }
  if (!localStorage.getItem(STORAGE_KEYS.sleepLogs)) {
    saveToStorage(STORAGE_KEYS.sleepLogs, seedSleepLogs);
  }
  if (!localStorage.getItem(STORAGE_KEYS.worlds)) {
    saveToStorage(STORAGE_KEYS.worlds, seedWorlds);
  }
  if (!localStorage.getItem(STORAGE_KEYS.entities)) {
    saveToStorage(STORAGE_KEYS.entities, seedEntities);
  }
  if (!localStorage.getItem(STORAGE_KEYS.modules)) {
    saveToStorage(STORAGE_KEYS.modules, seedModules);
  }
  if (!localStorage.getItem(STORAGE_KEYS.threats)) {
    saveToStorage(STORAGE_KEYS.threats, seedThreats);
  }
}

// Dream Logs
export function getDreamLogs(): DreamLog[] {
  return getFromStorage(STORAGE_KEYS.dreamLogs, seedDreamLogs);
}

export function addDreamLog(log: Omit<DreamLog, 'id' | 'createdAt'>): DreamLog {
  const logs = getDreamLogs();
  const newLog: DreamLog = {
    ...log,
    id: generateDreamId(log.date, logs),
    createdAt: new Date().toISOString()
  };
  saveToStorage(STORAGE_KEYS.dreamLogs, [newLog, ...logs]);
  return newLog;
}

export function updateDreamLog(id: string, updates: Partial<DreamLog>): void {
  const logs = getDreamLogs();
  const index = logs.findIndex(l => l.id === id);
  if (index !== -1) {
    logs[index] = { ...logs[index], ...updates };
    saveToStorage(STORAGE_KEYS.dreamLogs, logs);
  }
}

export function deleteDreamLog(id: string): void {
  const logs = getDreamLogs().filter(l => l.id !== id);
  saveToStorage(STORAGE_KEYS.dreamLogs, logs);
}

// Sleep Logs
export function getSleepLogs(): SleepLog[] {
  return getFromStorage(STORAGE_KEYS.sleepLogs, seedSleepLogs);
}

export function addSleepLog(log: Omit<SleepLog, 'id' | 'createdAt'>): SleepLog {
  const logs = getSleepLogs();
  const dateStr = log.date.replace(/-/g, '');
  const sameDayLogs = logs.filter(l => l.date === log.date);
  const sequence = String(sameDayLogs.length + 1).padStart(3, '0');
  const newLog: SleepLog = {
    ...log,
    id: `SL-${dateStr}-${sequence}`,
    createdAt: new Date().toISOString()
  };
  saveToStorage(STORAGE_KEYS.sleepLogs, [newLog, ...logs]);
  return newLog;
}

// Library getters
export function getWorlds(): World[] {
  return getFromStorage(STORAGE_KEYS.worlds, seedWorlds);
}

export function getEntities(): Entity[] {
  return getFromStorage(STORAGE_KEYS.entities, seedEntities);
}

export function getModules(): SystemModule[] {
  return getFromStorage(STORAGE_KEYS.modules, seedModules);
}

export function getThreats(): ThreatEntry[] {
  return getFromStorage(STORAGE_KEYS.threats, seedThreats);
}

// Add new world
export function addWorld(world: Omit<World, 'id'>): World {
  const worlds = getWorlds();
  const newWorld: World = { ...world, id: `w${Date.now()}` };
  saveToStorage(STORAGE_KEYS.worlds, [...worlds, newWorld]);
  return newWorld;
}

// Add new entity
export function addEntity(entity: Omit<Entity, 'id'>): Entity {
  const entities = getEntities();
  const newEntity: Entity = { ...entity, id: `e${Date.now()}` };
  saveToStorage(STORAGE_KEYS.entities, [...entities, newEntity]);
  return newEntity;
}
