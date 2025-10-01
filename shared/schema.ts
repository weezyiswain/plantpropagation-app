import { pgTable, text, varchar, integer, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const plants = pgTable("plants", {
  id: varchar("id").primaryKey(),
  scientificName: text("scientific_name").notNull(),
  commonName: text("common_name").notNull(),
  imageUrl: text("image_url"),
  difficulty: text("difficulty").notNull(), // "easy", "medium", "hard"
  successRate: integer("success_rate").notNull(), // percentage
  methods: json("methods").$type<string[]>().notNull(), // ["stem-cutting", "division", "layering"]
  timeToRoot: text("time_to_root").notNull(), // "2-4 weeks"
  optimalMonths: json("optimal_months").$type<number[]>().notNull(), // [3,4,5] for March-May
  secondaryMonths: json("secondary_months").$type<number[]>(), // [8,9] for August-September
  zoneRecommendations: json("zone_recommendations").$type<Record<string, any>>(),
  propagationSteps: json("propagation_steps").$type<Record<string, any>>().notNull(),
  careInstructions: json("care_instructions").$type<Record<string, any>>().notNull(),
});

export const propagationRequests = pgTable("propagation_requests", {
  id: varchar("id").primaryKey(),
  plantId: varchar("plant_id").notNull(),
  zone: text("zone").notNull(),
  maturity: text("maturity").notNull(), // "seedling", "young", "mature", "established"
  environment: text("environment").notNull(), // "inside", "outside", "greenhouse"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPlantSchema = createInsertSchema(plants);
export const insertPropagationRequestSchema = createInsertSchema(propagationRequests).omit({
  id: true,
  createdAt: true,
});

export type Plant = typeof plants.$inferSelect;
export type InsertPlant = z.infer<typeof insertPlantSchema>;
export type PropagationRequest = typeof propagationRequests.$inferSelect;
export type InsertPropagationRequest = z.infer<typeof insertPropagationRequestSchema>;

// User schema (keeping existing structure)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
