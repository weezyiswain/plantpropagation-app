import { type User, type InsertUser, type Plant, type PropagationRequest, type InsertPropagationRequest } from "@shared/schema";
import { randomUUID } from "crypto";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Plant methods
  getAllPlants(): Promise<Plant[]>;
  getPlantById(id: string): Promise<Plant | undefined>;
  searchPlants(query: string): Promise<Plant[]>;
  
  // Propagation request methods
  createPropagationRequest(request: InsertPropagationRequest): Promise<PropagationRequest>;
  getPropagationRequest(id: string): Promise<PropagationRequest | undefined>;
}

// Helper function to create database connection
function createDBConnection() {
  return new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

// Helper function to create consistent slug from plant name
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
}

// Helper function to map database row to Plant type
function mapRowToPlant(row: any): Plant {
  // Generate consistent ID from common_name
  const id = slugify(row.common_name);
  
  return {
    id,
    name: row.name || row.common_name,
    scientificName: row.scientific_name || row.common_name,
    commonName: row.common_name,
    imageUrl: row.image_url || null,
    difficulty: row.difficulty?.toLowerCase() || 'medium',
    successRate: row.success_rate || 80,
    methods: Array.isArray(row.methods) ? row.methods : ['stem-cutting'],
    timeToRoot: row.time_to_root || '2-4 weeks',
    optimalMonths: Array.isArray(row.optimal_months) ? row.optimal_months : [],
    secondaryMonths: Array.isArray(row.secondary_months) ? row.secondary_months : null,
    zoneRecommendations: row.zone_recommendations || { all: 'Suitable for most zones' },
    propagationSteps: row.propagation_steps || {},
    careInstructions: row.care_instructions || {
      light: 'Bright indirect light',
      watering: 'Keep soil moderately moist',
      fertilizer: 'Feed monthly during growing season',
      humidity: 'Average household humidity'
    }
  };
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private propagationRequests: Map<string, PropagationRequest>;

  constructor() {
    this.users = new Map();
    this.propagationRequests = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getAllPlants(): Promise<Plant[]> {
    if (!process.env.DATABASE_URL) {
      console.error('[Storage] DATABASE_URL not configured');
      return [];
    }

    try {
      console.log('[Storage] Fetching all plants from Supabase...');
      const pool = createDBConnection();
      const db = drizzle(pool);
      
      const results = await db.execute(
        sql`SELECT * FROM "plants" ORDER BY common_name`
      );
      
      await pool.end();
      
      console.log('[Storage] Supabase returned', results.rows?.length || 0, 'plants');
      
      if (results.rows && results.rows.length > 0) {
        const plants = results.rows.map(mapRowToPlant);
        return plants;
      }
      
      console.log('[Storage] No plants found in database');
      return [];
    } catch (err) {
      console.error('[Storage] Database query error:', err);
      return [];
    }
  }
  
  async getPlantById(id: string): Promise<Plant | undefined> {
    if (!process.env.DATABASE_URL) {
      console.error('[Storage] DATABASE_URL not configured');
      return undefined;
    }

    try {
      console.log('[Storage] Looking up plant by ID:', id);
      const pool = createDBConnection();
      const db = drizzle(pool);
      
      // Use consistent slugification: convert common_name to slug in SQL and compare
      const results = await db.execute(
        sql`SELECT * FROM "plants" 
        WHERE LOWER(REGEXP_REPLACE(common_name, '[^a-zA-Z0-9]+', '-', 'g')) = LOWER(${id})
        OR LOWER(REGEXP_REPLACE(REGEXP_REPLACE(common_name, '[^a-zA-Z0-9]+', '-', 'g'), '^-+|-+$', '', 'g')) = LOWER(${id})
        LIMIT 1`
      );
      
      await pool.end();
      
      if (results.rows && results.rows.length > 0) {
        console.log('[Storage] Found plant:', results.rows[0].common_name);
        return mapRowToPlant(results.rows[0]);
      }
      
      console.log('[Storage] Plant not found');
      return undefined;
    } catch (err) {
      console.error('[Storage] Database lookup error:', err);
      return undefined;
    }
  }
  
  async searchPlants(query: string): Promise<Plant[]> {
    if (!process.env.DATABASE_URL) {
      console.error('[Storage] DATABASE_URL not configured');
      return [];
    }

    const pool = createDBConnection();
    
    try {
      console.log('[Storage] Searching plants for:', query);
      const db = drizzle(pool);
      
      // Try with name column first
      try {
        const results = await db.execute(
          sql`SELECT * FROM "plants" 
          WHERE name ILIKE ${`%${query}%`}
          OR common_name ILIKE ${`%${query}%`} 
          OR scientific_name ILIKE ${`%${query}%`}
          LIMIT 20`
        );
        
        console.log('[Storage] Search returned', results.rows?.length || 0, 'results');
        
        if (results.rows && results.rows.length > 0) {
          return results.rows.map(mapRowToPlant);
        }
        
        return [];
      } catch (columnErr: any) {
        // If name column doesn't exist (error code 42703), retry without it
        if (columnErr?.code === '42703' || String(columnErr?.code) === '42703') {
          console.log('[Storage] name column not found, retrying without it');
          const results = await db.execute(
            sql`SELECT * FROM "plants" 
            WHERE common_name ILIKE ${`%${query}%`} 
            OR scientific_name ILIKE ${`%${query}%`}
            LIMIT 20`
          );
          
          console.log('[Storage] Search returned', results.rows?.length || 0, 'results');
          
          if (results.rows && results.rows.length > 0) {
            return results.rows.map(mapRowToPlant);
          }
          
          return [];
        }
        throw columnErr;
      }
    } catch (err) {
      console.error('[Storage] Database search error:', err);
      return [];
    } finally {
      await pool.end();
    }
  }
  
  async createPropagationRequest(insertRequest: InsertPropagationRequest): Promise<PropagationRequest> {
    const id = randomUUID();
    const request: PropagationRequest = { 
      ...insertRequest,
      id,
      createdAt: new Date()
    };
    this.propagationRequests.set(id, request);
    return request;
  }
  
  async getPropagationRequest(id: string): Promise<PropagationRequest | undefined> {
    return this.propagationRequests.get(id);
  }
}

export const storage = new MemStorage();
