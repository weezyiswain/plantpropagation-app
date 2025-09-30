import { type User, type InsertUser, type Plant, type PropagationRequest, type InsertPropagationRequest } from "@shared/schema";
import { randomUUID } from "crypto";
import { TOP_PLANTS } from "../client/src/lib/plant-data";

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
    return Array.from(this.plants.values());
  }
  
  async getPlantById(id: string): Promise<Plant | undefined> {
    return this.plants.get(id);
  }
  
  async searchPlants(query: string): Promise<Plant[]> {
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
      preferredMethod: insertRequest.preferredMethod || null,
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
