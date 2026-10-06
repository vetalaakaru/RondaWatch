import * as SQLite from 'expo-sqlite';

const dbPromise = SQLite.openDatabaseAsync('rondawatch.db');

export type IncidentDraft = {
  id: number;
  incidentType: string;
  description: string;
  photoUri: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'draft' | 'pending_sync' | 'synced' | 'failed';
};

export async function initOfflineDrafts() {
  const db = await dbPromise;

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS incident_drafts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_type TEXT NOT NULL,
      description TEXT NOT NULL,
      photo_uri TEXT,
      latitude REAL,
      longitude REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'draft'
    );
  `);
}

export async function createIncidentDraft(data: {
  incidentType: string;
  description: string;
  photoUri?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}) {
  await initOfflineDrafts();

  const db = await dbPromise;
  const now = new Date().toISOString();

  const result = await db.runAsync(
    `
      INSERT INTO incident_drafts (
        incident_type,
        description,
        photo_uri,
        latitude,
        longitude,
        created_at,
        updated_at,
        sync_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')
    `,
    data.incidentType,
    data.description,
    data.photoUri ?? null,
    data.latitude ?? null,
    data.longitude ?? null,
    now,
    now
  );

  return result.lastInsertRowId;
}

export async function getIncidentDrafts(): Promise<IncidentDraft[]> {
  await initOfflineDrafts();

  const db = await dbPromise;

  const rows = await db.getAllAsync<IncidentDraft>(
    `
      SELECT
        id,
        incident_type AS incidentType,
        description,
        photo_uri AS photoUri,
        latitude,
        longitude,
        created_at AS createdAt,
        updated_at AS updatedAt,
        sync_status AS syncStatus
      FROM incident_drafts
      ORDER BY updated_at DESC
    `
  );

  return rows;
}

export async function deleteIncidentDraft(id: number) {
  await initOfflineDrafts();

  const db = await dbPromise;

  await db.runAsync(
    'DELETE FROM incident_drafts WHERE id = ?',
    id
  );
}
