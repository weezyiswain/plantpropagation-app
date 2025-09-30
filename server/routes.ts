import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropagationRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all plants
  app.get("/api/plants", async (_req, res) => {
    try {
      const plants = await storage.getAllPlants();
      res.json(plants);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Search plants
  app.get("/api/plants/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      const plants = await storage.searchPlants(query);
      res.json(plants);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get plant by ID
  app.get("/api/plants/:id", async (req, res) => {
    try {
      const plant = await storage.getPlantById(req.params.id);
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      res.json(plant);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create propagation request
  app.post("/api/propagation-requests", async (req, res) => {
    try {
      const validatedData = insertPropagationRequestSchema.parse(req.body);
      const request = await storage.createPropagationRequest(validatedData);
      res.status(201).json(request);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get propagation request by ID
  app.get("/api/propagation-requests/:id", async (req, res) => {
    try {
      const request = await storage.getPropagationRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Propagation request not found" });
      }
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
