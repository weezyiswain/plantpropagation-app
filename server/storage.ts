import { type User, type InsertUser, type Plant, type PropagationRequest, type InsertPropagationRequest } from "@shared/schema";
import { randomUUID } from "crypto";
import { TOP_PLANTS } from "../client/src/lib/plant-data";
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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private plants: Map<string, Plant>;
  private propagationRequests: Map<string, PropagationRequest>;

  constructor() {
    this.users = new Map();
    this.plants = new Map();
    this.propagationRequests = new Map();
    
    // Initialize with top 100 plants (currently 6, but structured for expansion)
    TOP_PLANTS.forEach(plant => {
      this.plants.set(plant.id, plant);
    });
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
    const inMemoryPlants = Array.from(this.plants.values());
    
    // Try Supabase/Postgres first if DATABASE_URL is configured
    if (process.env.DATABASE_URL) {
      try {
        console.log('[Storage] Fetching all plants from Supabase...');
        const pool = new Pool({ 
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        });
        const db = drizzle(pool);
        
        const results = await db.execute(
          sql`SELECT * FROM "plants" ORDER BY name`
        );
        
        await pool.end();
        
        console.log('[Storage] Supabase returned', results.rows?.length || 0, 'plants');
        
        if (results.rows && results.rows.length > 0) {
          // Map database rows to Plant schema
          const supabasePlants = results.rows.map((row: any) => ({
            id: row.name.toLowerCase().replace(/\s+/g, '-'),
            scientificName: row.name,
            commonName: row.name,
            imageUrl: null,
            difficulty: row.difficulty.toLowerCase(),
            successRate: row.difficulty === 'Easy' ? 90 : row.difficulty === 'Medium' ? 80 : 70,
            methods: [row.propagation_method],
            timeToRoot: '2-4 weeks',
            optimalMonths: [],
            secondaryMonths: null,
            zoneRecommendations: { zones: row.zones },
            propagationSteps: { [row.propagation_method]: [{ step: 1, instruction: row.tips }] },
            careInstructions: { 
              light: 'Bright indirect light',
              watering: 'Regular',
              fertilizer: 'Monthly',
              season: row.best_season
            }
          } as Plant));
          
          // Merge with in-memory plants, with in-memory taking priority (better data)
          const plantsMap = new Map<string, Plant>();
          
          // Add Supabase plants first
          supabasePlants.forEach(plant => plantsMap.set(plant.id, plant));
          
          // Override with in-memory plants (they have detailed propagation steps)
          inMemoryPlants.forEach(plant => plantsMap.set(plant.id, plant));
          
          const mergedPlants = Array.from(plantsMap.values());
          console.log('[Storage] Returning', mergedPlants.length, 'plants (merged from Supabase + in-memory)');
          return mergedPlants;
        }
      } catch (err) {
        console.error('[Storage] Database query error:', err);
      }
    }
    
    // Fallback to in-memory plants only
    console.log('[Storage] Using in-memory plants only');
    return inMemoryPlants;
  }
  
  async getPlantById(id: string): Promise<Plant | undefined> {
    // Check in-memory first
    const memPlant = this.plants.get(id);
    if (memPlant) return memPlant;
    
    // Try Supabase if DATABASE_URL is configured
    if (process.env.DATABASE_URL) {
      try {
        console.log('[Storage] Attempting Supabase lookup for plant ID:', id);
        const pool = new Pool({ 
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        });
        const db = drizzle(pool);
        
        // Convert ID back to name (e.g., "lavender" -> "Lavender")
        const searchName = id.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        const results = await db.execute(
          sql`SELECT * FROM "plants" WHERE LOWER(name) = LOWER(${searchName}) LIMIT 1`
        );
        
        await pool.end();
        
        if (results.rows && results.rows.length > 0) {
          const row: any = results.rows[0];
          console.log('[Storage] Found plant in Supabase:', row.name);
          return {
            id: row.name.toLowerCase().replace(/\s+/g, '-'),
            scientificName: row.name,
            commonName: row.name,
            imageUrl: null,
            difficulty: row.difficulty.toLowerCase(),
            successRate: row.difficulty === 'Easy' ? 90 : row.difficulty === 'Medium' ? 80 : 70,
            methods: [row.propagation_method],
            timeToRoot: '2-4 weeks',
            optimalMonths: [],
            secondaryMonths: null,
            zoneRecommendations: { zones: row.zones },
            propagationSteps: { [row.propagation_method]: [{ step: 1, instruction: row.tips }] },
            careInstructions: { 
              light: 'Bright indirect light',
              watering: 'Regular',
              fertilizer: 'Monthly',
              season: row.best_season
            }
          } as Plant;
        }
      } catch (err) {
        console.error('[Storage] Database lookup error:', err);
      }
    }
    
    return undefined;
  }
  
  async searchPlants(query: string): Promise<Plant[]> {
    // Try Supabase/Postgres first if DATABASE_URL is configured
    if (process.env.DATABASE_URL) {
      try {
        console.log('[Storage] Attempting Supabase search for:', query);
        const pool = new Pool({ 
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        });
        const db = drizzle(pool);
        
        const results = await db.execute(
          sql`SELECT * FROM "plants" WHERE name ILIKE ${`%${query}%`} LIMIT 10`
        );
        
        await pool.end(); // Close the pool after query
        
        console.log('[Storage] Supabase returned', results.rows?.length || 0, 'rows');
        
        if (results.rows && results.rows.length > 0) {
          // Map database rows to Plant schema
          const mapped = results.rows.map((row: any) => ({
            id: row.name.toLowerCase().replace(/\s+/g, '-'),
            scientificName: row.name,
            commonName: row.name,
            imageUrl: null,
            difficulty: row.difficulty.toLowerCase(),
            successRate: row.difficulty === 'Easy' ? 90 : row.difficulty === 'Medium' ? 80 : 70,
            methods: [row.propagation_method],
            timeToRoot: '2-4 weeks',
            optimalMonths: [],
            secondaryMonths: null,
            zoneRecommendations: { zones: row.zones },
            propagationSteps: { [row.propagation_method]: [{ step: 1, instruction: row.tips }] },
            careInstructions: { 
              light: 'Bright indirect light',
              watering: 'Regular',
              fertilizer: 'Monthly',
              season: row.best_season
            }
          } as Plant));
          console.log('[Storage] Returning Supabase results');
          return mapped;
        }
      } catch (err) {
        console.error('[Storage] Database search error:', err);
      }
    }
    
    // Fallback to in-memory search
    console.log('[Storage] Using in-memory fallback search');
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.plants.values()).filter(plant => 
      plant.commonName.toLowerCase().includes(lowercaseQuery) ||
      plant.scientificName.toLowerCase().includes(lowercaseQuery)
    );
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
