import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Store the SQLite database in the backend directory
const sqlite = new Database(path.join(__dirname, '../../sqlite.db'));

export const db = drizzle(sqlite, { schema });
