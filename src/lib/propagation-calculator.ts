import { Plant, PropagationRequest } from "@shared/schema";

export interface PropagationWindow {
  type: "primary" | "secondary";
  label: string;
  startMonth: number;
  endMonth: number;
  startDate: string;
  endDate: string;
  successRate: number;
}

export interface ZoneInfo {
  lastFrost: string;
  firstFrost: string;
  growingSeason: string;
  idealHumidity: string;
}

const ZONE_DATA: Record<string, ZoneInfo> = {
  "1a": { lastFrost: "June 1-15", firstFrost: "August 15-30", growingSeason: "June through August", idealHumidity: "40-60%" },
  "1b": { lastFrost: "May 15-31", firstFrost: "August 30 - Sept 15", growingSeason: "May through September", idealHumidity: "40-60%" },
  "3a": { lastFrost: "May 1-15", firstFrost: "September 15-30", growingSeason: "May through September", idealHumidity: "45-65%" },
  "3b": { lastFrost: "April 15-30", firstFrost: "October 1-15", growingSeason: "April through October", idealHumidity: "45-65%" },
  "5a": { lastFrost: "April 1-15", firstFrost: "October 15-31", growingSeason: "April through October", idealHumidity: "50-70%" },
  "5b": { lastFrost: "March 15-31", firstFrost: "October 31 - Nov 15", growingSeason: "March through November", idealHumidity: "50-70%" },
  "7a": { lastFrost: "March 15-31", firstFrost: "November 1-15", growingSeason: "March through November", idealHumidity: "55-75%" },
  "7b": { lastFrost: "March 1-15", firstFrost: "November 15-30", growingSeason: "March through November", idealHumidity: "55-75%" },
  "9a": { lastFrost: "February 28 - March 15", firstFrost: "November 30 - Dec 15", growingSeason: "March through November", idealHumidity: "60-70%" },
  "9b": { lastFrost: "February 15-28", firstFrost: "December 1-15", growingSeason: "February through December", idealHumidity: "60-70%" },
  "10a": { lastFrost: "January 30 - February 15", firstFrost: "December 15-31", growingSeason: "Year-round (frost-free)", idealHumidity: "60-75%" },
  "10b": { lastFrost: "January 15-30", firstFrost: "Rare frost events", growingSeason: "Year-round", idealHumidity: "60-75%" },
  "12a": { lastFrost: "Frost-free", firstFrost: "Frost-free", growingSeason: "Year-round", idealHumidity: "65-80%" },
  "13a": { lastFrost: "Frost-free", firstFrost: "Frost-free", growingSeason: "Year-round", idealHumidity: "70-85%" },
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getDateRange(months: number[]): { start: string; end: string } {
  if (months.length === 0) return { start: "", end: "" };
  
  const startMonth = Math.min(...months);
  const endMonth = Math.max(...months);
  
  return {
    start: `${MONTH_NAMES[startMonth - 1]} 1`,
    end: `${MONTH_NAMES[endMonth - 1]} 30`
  };
}

export function calculatePropagationWindows(
  plant: Plant,
  request: PropagationRequest
): {
  primary: PropagationWindow | null;
  secondary: PropagationWindow | null;
  zoneInfo: ZoneInfo;
  adjustedSuccessRate: number;
} {
  const zoneInfo = ZONE_DATA[request.zone] || ZONE_DATA["7a"];
  
  // Calculate success rate adjustments based on conditions
  let successAdjustment = 0;
  
  // Maturity adjustments
  if (request.maturity === "seedling") successAdjustment -= 10;
  else if (request.maturity === "established") successAdjustment += 5;
  
  // Environment adjustments (greenhouse is typically more controlled)
  if (request.environment === "greenhouse") successAdjustment += 5;
  else if (request.environment === "outside") successAdjustment -= 5;
  
  const adjustedSuccessRate = Math.min(100, Math.max(50, plant.successRate + successAdjustment));
  
  const primaryRange = getDateRange(plant.optimalMonths);
  const secondaryRange = plant.secondaryMonths ? getDateRange(plant.secondaryMonths) : null;
  
  const primary: PropagationWindow = {
    type: "primary",
    label: "Spring Growth Period",
    startMonth: Math.min(...plant.optimalMonths),
    endMonth: Math.max(...plant.optimalMonths),
    startDate: primaryRange.start,
    endDate: primaryRange.end,
    successRate: adjustedSuccessRate
  };
  
  const secondary: PropagationWindow | null = secondaryRange ? {
    type: "secondary",
    label: "Late Summer",
    startMonth: Math.min(...(plant.secondaryMonths || [])),
    endMonth: Math.max(...(plant.secondaryMonths || [])),
    startDate: secondaryRange.start,
    endDate: secondaryRange.end,
    successRate: Math.max(60, adjustedSuccessRate - 15)
  } : null;
  
  return {
    primary,
    secondary,
    zoneInfo,
    adjustedSuccessRate
  };
}

export function getRecommendedMethod(plant: Plant, preferredMethod?: string): string {
  if (preferredMethod && preferredMethod !== "any") {
    const methodMap: Record<string, string> = {
      "cutting": "stem-cutting",
      "division": "division",
      "layering": "air-layering"
    };
    const mapped = methodMap[preferredMethod];
    if (plant.methods.includes(mapped)) {
      return mapped;
    }
  }
  
  // Default to first method in the list
  return plant.methods[0];
}
