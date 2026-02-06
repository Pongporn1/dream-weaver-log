import { DreamLog } from "@/types/dream";

const DRAFTS_STORAGE_KEY = "dream-log-drafts-v3";
const ACTIVE_DRAFT_KEY = "dream-log-active-draft-id";
const LEGACY_DRAFT_KEY = "dream-log-draft-v2";

export type DreamFormState = {
  date: string;
  wakeTime: string;
  world: string;
  newWorld: string;
  timeSystem: DreamLog["timeSystem"];
  environments: string[];
  newEnvironment: string;
  selectedEntities: string[];
  newEntity: string;
  threatLevel: DreamLog["threatLevel"];
  safetyOverride: DreamLog["safetyOverride"];
  exit: DreamLog["exit"];
  notes: string;
  storySummary: string;
};

export type DraftMetadata = {
  id: string;
  version: number;
  savedAt: string;
  createdAt: string;
  title: string;
  previewText: string;
  form: DreamFormState;
};

export type DraftsCollection = {
  drafts: Record<string, DraftMetadata>;
  lastModified: string;
};

// Generate a simple UUID
function generateId(): string {
  return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate title from form data
export function generateDraftTitle(form: DreamFormState): string {
  if (form.storySummary && form.storySummary.trim().length > 0) {
    const title = form.storySummary.trim();
    return title.length > 40 ? title.substring(0, 40) + "..." : title;
  }

  const date = form.date || new Date().toISOString().split("T")[0];
  const time = form.wakeTime || "ไม่ระบุเวลา";
  return `ฝันวันที่ ${date} (${time})`;
}

// Generate preview text
function generatePreviewText(form: DreamFormState): string {
  if (form.storySummary && form.storySummary.trim().length > 0) {
    const preview = form.storySummary.trim();
    return preview.length > 100 ? preview.substring(0, 100) + "..." : preview;
  }

  const parts: string[] = [];
  if (form.world) parts.push(`โลก: ${form.world}`);
  if (form.environments.length > 0)
    parts.push(`${form.environments.length} สภาพแวดล้อม`);
  if (form.selectedEntities.length > 0)
    parts.push(`${form.selectedEntities.length} ตัวละคร`);

  return parts.length > 0 ? parts.join(" • ") : "ยังไม่มีข้อมูล";
}

// Get all drafts
export function getDrafts(): DraftsCollection {
  try {
    const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
    if (!raw) {
      return { drafts: {}, lastModified: new Date().toISOString() };
    }
    return JSON.parse(raw) as DraftsCollection;
  } catch (error) {
    console.warn("Failed to load drafts:", error);
    return { drafts: {}, lastModified: new Date().toISOString() };
  }
}

// Save a draft
export function saveDraft(id: string, form: DreamFormState): void {
  try {
    const collection = getDrafts();
    const existingDraft = collection.drafts[id];

    const draft: DraftMetadata = {
      id,
      version: 1,
      savedAt: new Date().toISOString(),
      createdAt: existingDraft?.createdAt || new Date().toISOString(),
      title: generateDraftTitle(form),
      previewText: generatePreviewText(form),
      form,
    };

    collection.drafts[id] = draft;
    collection.lastModified = new Date().toISOString();

    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(collection));
  } catch (error) {
    console.error("Failed to save draft:", error);
    throw error;
  }
}

// Load a specific draft
export function loadDraft(id: string): DraftMetadata | null {
  try {
    const collection = getDrafts();
    return collection.drafts[id] || null;
  } catch (error) {
    console.warn("Failed to load draft:", error);
    return null;
  }
}

// Delete a draft
export function deleteDraft(id: string): void {
  try {
    const collection = getDrafts();
    delete collection.drafts[id];
    collection.lastModified = new Date().toISOString();

    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(collection));

    // Clear active draft if it was deleted
    const activeDraftId = getActiveDraftId();
    if (activeDraftId === id) {
      localStorage.removeItem(ACTIVE_DRAFT_KEY);
    }
  } catch (error) {
    console.error("Failed to delete draft:", error);
    throw error;
  }
}

// Create a new draft
export function createNewDraft(form: DreamFormState): string {
  const id = generateId();
  saveDraft(id, form);
  return id;
}

// Get active draft ID
export function getActiveDraftId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_DRAFT_KEY);
  } catch (error) {
    return null;
  }
}

// Set active draft ID
export function setActiveDraftId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_DRAFT_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_DRAFT_KEY);
    }
  } catch (error) {
    console.error("Failed to set active draft:", error);
  }
}

// Migrate legacy draft
export function migrateLegacyDraft(): boolean {
  try {
    const legacyRaw = localStorage.getItem(LEGACY_DRAFT_KEY);
    if (!legacyRaw) return false;

    const legacyDraft = JSON.parse(legacyRaw) as {
      version: number;
      savedAt: string;
      form: DreamFormState;
    };

    if (!legacyDraft.form) return false;

    // Create new draft from legacy
    const id = createNewDraft(legacyDraft.form);
    setActiveDraftId(id);

    // Remove legacy draft
    localStorage.removeItem(LEGACY_DRAFT_KEY);

    console.log("Successfully migrated legacy draft to:", id);
    return true;
  } catch (error) {
    console.warn("Failed to migrate legacy draft:", error);
    return false;
  }
}

// Get recent drafts (sorted by savedAt, newest first)
export function getRecentDrafts(limit: number = 10): DraftMetadata[] {
  const collection = getDrafts();
  const drafts = Object.values(collection.drafts);

  return drafts
    .sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    )
    .slice(0, limit);
}
