import express, { type Request, Response, NextFunction } from "express";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { z } from "zod";

// Configure for Node.js runtime
export const config = {
  runtime: "nodejs",
};

// Inline schema definitions
const insertPropagationRequestSchema = z.object({
  plantId: z.string(),
  zone: z.string(),
  maturity: z.string(),
  environment: z.string(),
});

// Cached database connection pool (reused across invocations)
let cachedPool: Pool | null = null;

function getDBConnection() {
  if (!cachedPool) {
    cachedPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1, // Limit connections for serverless
    });
  }
  return cachedPool;
}

// Helper function to map database row to Plant type
function mapRowToPlant(row: any) {
  const id = String(row.id);

  return {
    id,
    name: row.name || row.common_name,
    scientificName: row.scientific_name || row.common_name,
    commonName: row.common_name,
    imageUrl: row.image_url || null,
    difficulty: row.difficulty?.toLowerCase() || "medium",
    successRate: row.success_rate || 80,
    methods: Array.isArray(row.methods) ? row.methods : ["stem-cutting"],
    timeToRoot: row.time_to_root || "2-4 weeks",
    optimalMonths: Array.isArray(row.optimal_months) ? row.optimal_months : [],
    secondaryMonths: Array.isArray(row.secondary_months)
      ? row.secondary_months
      : null,
    zoneRecommendations: row.zone_recommendations || {
      all: "Suitable for most zones",
    },
    propagationSteps: row.propagation_steps || {},
    careInstructions: row.care_instructions || {
      light: "Bright indirect light",
      watering: "Keep soil moderately moist",
      fertilizer: "Feed monthly during growing season",
      humidity: "Average household humidity",
    },
  };
}

// Storage functions
async function getAllPlants() {
  if (!process.env.DATABASE_URL) {
    console.error("[Storage] DATABASE_URL not configured");
    return [];
  }

  const pool = getDBConnection();

  try {
    console.log("[Storage] Fetching all plants from Supabase...");
    const db = drizzle(pool);

    const results = await db.execute(
      sql`SELECT * FROM "plants" ORDER BY common_name`,
    );

    console.log(
      "[Storage] Supabase returned",
      results.rows?.length || 0,
      "plants",
    );

    if (results.rows && results.rows.length > 0) {
      return results.rows.map(mapRowToPlant);
    }

    return [];
  } catch (err) {
    console.error("[Storage] Database query error:", err);
    return [];
  }
}

async function getPlantById(id: string) {
  if (!process.env.DATABASE_URL) {
    return undefined;
  }

  const pool = getDBConnection();

  try {
    const db = drizzle(pool);
    const results = await db.execute(
      sql`SELECT * FROM "plants" WHERE id = ${id} LIMIT 1`,
    );

    if (results.rows && results.rows.length > 0) {
      return mapRowToPlant(results.rows[0]);
    }
    return undefined;
  } catch (err) {
    console.error("[Storage] getPlantById error:", err);
    return undefined;
  }
}

async function searchPlants(query: string) {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  const pool = getDBConnection();
  const searchPattern = `%${query.toLowerCase()}%`;

  try {
    const db = drizzle(pool);

    try {
      const results = await db.execute(
        sql`SELECT * FROM "plants" WHERE 
          LOWER(name) LIKE ${searchPattern} OR
          LOWER(common_name) LIKE ${searchPattern} OR 
          LOWER(scientific_name) LIKE ${searchPattern}`,
      );

      if (results.rows && results.rows.length > 0) {
        return results.rows.map(mapRowToPlant);
      }
    } catch (err: any) {
      if (err.code === "42703") {
        const results = await db.execute(
          sql`SELECT * FROM "plants" WHERE 
            LOWER(common_name) LIKE ${searchPattern} OR 
            LOWER(scientific_name) LIKE ${searchPattern}`,
        );

        if (results.rows && results.rows.length > 0) {
          return results.rows.map(mapRowToPlant);
        }
      } else {
        throw err;
      }
    }

    return [];
  } catch (err) {
    console.error("[Storage] searchPlants error:", err);
    return [];
  }
}

async function createPropagationRequest(data: any) {
  if (!process.env.DATABASE_URL) {
    throw new Error("Database not configured");
  }

  const pool = getDBConnection();
  const id = crypto.randomUUID();

  try {
    const db = drizzle(pool);
    await db.execute(
      sql`INSERT INTO "propagation_requests" (id, plant_id, zone, maturity, environment, created_at)
          VALUES (${id}, ${data.plantId}, ${data.zone}, ${data.maturity}, ${data.environment}, NOW())`,
    );

    return {
      id,
      plantId: data.plantId,
      zone: data.zone,
      maturity: data.maturity,
      environment: data.environment,
      createdAt: new Date(),
    };
  } catch (err) {
    console.error("[Storage] createPropagationRequest error:", err);
    throw err;
  }
}

async function getPropagationRequest(id: string) {
  if (!process.env.DATABASE_URL) {
    return undefined;
  }

  const pool = getDBConnection();

  try {
    const db = drizzle(pool);
    const results = await db.execute(
      sql`SELECT * FROM "propagation_requests" WHERE id = ${id} LIMIT 1`,
    );

    if (results.rows && results.rows.length > 0) {
      const row = results.rows[0];
      return {
        id: row.id,
        plantId: row.plant_id,
        zone: row.zone,
        maturity: row.maturity,
        environment: row.environment,
        createdAt: row.created_at,
      };
    }
    return undefined;
  } catch (err) {
    console.error("[Storage] getPropagationRequest error:", err);
    return undefined;
  }
}

// Create Express app
let app: any = null;

function createExpressApp() {
  if (app) return app;

  app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Get all plants
  app.get("/api/plants", async (_req: Request, res: Response) => {
    try {
      const plants = await getAllPlants();
      res.json(plants);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Search plants
  app.get("/api/plants/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res
          .status(400)
          .json({ message: "Query parameter 'q' is required" });
      }
      const plants = await searchPlants(query);
      res.json(plants);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get plant by ID
  app.get("/api/plants/:id", async (req: Request, res: Response) => {
    try {
      const plant = await getPlantById(req.params.id);
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      res.json(plant);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create propagation request
  app.post("/api/propagation-requests", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPropagationRequestSchema.parse(req.body);
      const request = await createPropagationRequest(validatedData);
      res.status(201).json(request);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Get propagation request by ID
  app.get(
    "/api/propagation-requests/:id",
    async (req: Request, res: Response) => {
      try {
        const request = await getPropagationRequest(req.params.id);
        if (!request) {
          return res
            .status(404)
            .json({ message: "Propagation request not found" });
        }
        res.json(request);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    },
  );

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  return app;
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  const expressApp = createExpressApp();

  // Log incoming request for debugging
  console.log("[Handler] Original req.url:", req.url);
  console.log("[Handler] req.query:", req.query);

  // Reconstruct the full URL from Vercel's catch-all path segments
  // Vercel captures path segments in req.query.path as an array
  const pathSegments = req.query?.path;
  if (pathSegments) {
    // Build the path from segments
    const path = Array.isArray(pathSegments)
      ? pathSegments.join("/")
      : pathSegments;

    // Extract other query parameters (excluding 'path')
    const queryParams = { ...req.query };
    delete queryParams.path;

    // Rebuild query string
    const queryString =
      Object.keys(queryParams).length > 0
        ? "?" + new URLSearchParams(queryParams).toString()
        : "";

    // Reconstruct full URL for Express
    req.url = `/${path}${queryString}`;
    console.log("[Handler] Reconstructed req.url:", req.url);
  }

  return expressApp(req, res);
}
