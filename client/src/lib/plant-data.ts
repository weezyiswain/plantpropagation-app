import { Plant } from "@shared/schema";

export const TOP_PLANTS: Plant[] = [
  {
    id: "pothos-golden",
    scientificName: "Epipremnum aureum",
    commonName: "Golden Pothos",
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=240&fit=crop",
    difficulty: "easy",
    successRate: 95,
    methods: ["stem-cutting", "node-cutting"],
    timeToRoot: "2-4 weeks",
    optimalMonths: [3, 4, 5, 6],
    secondaryMonths: [8, 9],
    zoneRecommendations: {
      all: "Suitable for all zones when grown indoors"
    },
    propagationSteps: {
      "stem-cutting": [
        {
          step: 1,
          title: "Select and Prepare Your Cutting",
          description: "Choose a healthy stem with at least 2-3 nodes. Cut 4-6 inches below a node using clean, sharp scissors.",
          tip: "Morning cuttings have higher moisture content and root more successfully."
        },
        {
          step: 2,
          title: "Root in Water or Soil",
          description: "Place cutting in clean water (change every 3-4 days) or directly in moist, well-draining potting mix. Keep in bright, indirect light.",
          options: [
            { method: "Water", details: "Roots in 2-4 weeks, transplant when 2-3 inches long" },
            { method: "Soil", details: "Established roots in 4-6 weeks, less transplant shock" }
          ]
        },
        {
          step: 3,
          title: "Monitor and Care",
          description: "Maintain consistent moisture and humidity. Watch for new growth after 2-3 weeks, which indicates successful rooting.",
          requirements: ["Keep soil moist, not soggy", "65-75°F ideal range"]
        }
      ]
    },
    careInstructions: {
      light: "Bright, indirect light. Avoid direct sun for first month.",
      watering: "Water when top inch of soil is dry. Usually every 7-10 days.",
      fertilizer: "Wait 6-8 weeks before first feeding. Use diluted liquid fertilizer.",
      humidity: "60-70% ideal, tolerates normal household humidity"
    }
  },
  {
    id: "snake-plant",
    scientificName: "Sansevieria trifasciata",
    commonName: "Snake Plant",
    imageUrl: "https://images.unsplash.com/photo-1572688484438-313a6e50c333?w=400&h=240&fit=crop",
    difficulty: "easy",
    successRate: 90,
    methods: ["division", "leaf-cutting"],
    timeToRoot: "4-6 weeks",
    optimalMonths: [4, 5, 6, 7],
    secondaryMonths: [8, 9],
    zoneRecommendations: {
      all: "Suitable for all zones when grown indoors"
    },
    propagationSteps: {
      "division": [
        {
          step: 1,
          title: "Remove Plant from Pot",
          description: "Gently remove the entire plant from its pot. Shake off excess soil to expose the root system and rhizomes.",
          tip: "Water the plant 1-2 days before division to make root separation easier."
        },
        {
          step: 2,
          title: "Divide the Rhizomes",
          description: "Identify natural divisions in the rhizome. Using a clean, sharp knife, cut between sections ensuring each division has at least 3-4 leaves and healthy roots.",
          options: []
        },
        {
          step: 3,
          title: "Plant Divisions",
          description: "Plant each division in well-draining soil. Water lightly and place in bright, indirect light. Avoid overwatering for the first 2-3 weeks.",
          requirements: ["Use cactus/succulent mix", "Allow soil to dry between waterings"]
        }
      ]
    },
    careInstructions: {
      light: "Tolerates low to bright indirect light. Avoid direct sun.",
      watering: "Water every 2-3 weeks. Let soil dry completely between waterings.",
      fertilizer: "Feed monthly during growing season with diluted fertilizer.",
      humidity: "Tolerates dry air, no special humidity needs"
    }
  },
  {
    id: "monstera-deliciosa",
    scientificName: "Monstera deliciosa",
    commonName: "Swiss Cheese Plant",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=240&fit=crop",
    difficulty: "easy",
    successRate: 95,
    methods: ["stem-cutting", "air-layering", "node-cutting"],
    timeToRoot: "2-4 weeks",
    optimalMonths: [3, 4, 5],
    secondaryMonths: [8, 9],
    zoneRecommendations: {
      "9a": "Best results during spring growth period. Last frost: February 28 - March 15",
      "10a": "Can propagate nearly year-round. Optimal in spring.",
      default: "Indoor propagation recommended for most zones"
    },
    propagationSteps: {
      "stem-cutting": [
        {
          step: 1,
          title: "Select and Prepare Your Cutting",
          description: "Choose a healthy stem with at least 2-3 nodes and aerial roots if possible. Cut 4-6 inches below a node using clean, sharp scissors.",
          tip: "Morning cuttings have higher moisture content and root more successfully."
        },
        {
          step: 2,
          title: "Root in Water or Soil",
          description: "Place cutting in clean water (change every 3-4 days) or directly in moist, well-draining potting mix. Keep in bright, indirect light.",
          options: [
            { method: "Water Method", details: "Roots in 2-4 weeks, transplant when 2-3 inches long" },
            { method: "Soil Method", details: "Established roots in 4-6 weeks, less transplant shock" }
          ]
        },
        {
          step: 3,
          title: "Monitor and Care",
          description: "Maintain consistent moisture and humidity. Watch for new growth after 4-6 weeks, which indicates successful rooting.",
          requirements: ["Keep soil moist, not soggy", "65-75°F ideal range"]
        }
      ],
      "air-layering": [
        {
          step: 1,
          title: "Choose and Prepare the Node",
          description: "Select a healthy stem with a node. Make a small upward cut below the node, about 1/3 through the stem.",
          tip: "Choose a stem with aerial roots for faster results."
        },
        {
          step: 2,
          title: "Apply Rooting Medium",
          description: "Wrap the cut area with moist sphagnum moss. Cover with plastic wrap and secure with twist ties or string.",
          options: []
        },
        {
          step: 3,
          title: "Wait and Monitor",
          description: "Keep moss moist by misting through the plastic. Roots should develop in 4-8 weeks. Once well-rooted, cut below the new roots and pot.",
          requirements: ["Check moisture weekly", "Look for white roots through plastic"]
        }
      ]
    },
    careInstructions: {
      light: "Bright, indirect light. Avoid direct sun for first month.",
      watering: "Water when top inch of soil is dry. Usually every 7-10 days.",
      fertilizer: "Wait 6-8 weeks before first feeding. Use diluted liquid fertilizer.",
      humidity: "60-80% ideal for best growth"
    }
  },
  {
    id: "zz-plant",
    scientificName: "Zamioculcas zamiifolia",
    commonName: "ZZ Plant",
    imageUrl: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&h=240&fit=crop",
    difficulty: "medium",
    successRate: 85,
    methods: ["division", "leaf-cutting"],
    timeToRoot: "6-8 weeks",
    optimalMonths: [4, 5, 6],
    secondaryMonths: [7, 8],
    zoneRecommendations: {
      all: "Best propagated indoors. Slow but reliable."
    },
    propagationSteps: {
      "division": [
        {
          step: 1,
          title: "Remove Plant from Container",
          description: "Carefully remove the ZZ plant from its pot. Gently shake off soil to expose the rhizomes.",
          tip: "ZZ plants have thick rhizomes that store water. Handle carefully to avoid damage."
        },
        {
          step: 2,
          title: "Separate Rhizomes",
          description: "Identify natural divisions where rhizomes separate. Use a clean knife to cut if needed, ensuring each section has stems and roots.",
          options: []
        },
        {
          step: 3,
          title: "Replant Divisions",
          description: "Plant each division in well-draining soil. Water lightly and wait 1 week before watering again. Place in bright, indirect light.",
          requirements: ["Use well-draining mix", "Minimal watering for first month"]
        }
      ]
    },
    careInstructions: {
      light: "Low to bright indirect light. Very adaptable.",
      watering: "Water every 2-3 weeks. Prefers to stay on the dry side.",
      fertilizer: "Feed every 2-3 months during growing season.",
      humidity: "Tolerates low humidity well"
    }
  },
  {
    id: "fiddle-leaf-fig",
    scientificName: "Ficus lyrata",
    commonName: "Fiddle Leaf Fig",
    imageUrl: "https://pixabay.com/get/g195968d39c9a21bd4a18dd9e9b368b943253c620ded23e71d0080019e6b88a65c7365e2d3353b8edf289157a4e66545202c3580be4e13e485e50510ed5d09377_1280.jpg",
    difficulty: "hard",
    successRate: 70,
    methods: ["stem-cutting", "air-layering"],
    timeToRoot: "4-8 weeks",
    optimalMonths: [4, 5, 6],
    secondaryMonths: [7, 8],
    zoneRecommendations: {
      all: "Indoor propagation recommended. Requires patience and stable conditions."
    },
    propagationSteps: {
      "stem-cutting": [
        {
          step: 1,
          title: "Select Healthy Stem",
          description: "Choose a stem with at least 2-3 leaves. Cut 6-8 inches below the lowest leaf using sharp, sterilized scissors. Remove bottom leaves.",
          tip: "Use rooting hormone for better success rates with fiddle leaf figs."
        },
        {
          step: 2,
          title: "Prepare and Root",
          description: "Dip cut end in rooting hormone. Place in water or moist soil mix. Keep in warm (70-75°F), humid environment with bright indirect light.",
          options: [
            { method: "Water", details: "Change water weekly, expect roots in 4-6 weeks" },
            { method: "Soil", details: "Keep consistently moist, roots in 6-8 weeks" }
          ]
        },
        {
          step: 3,
          title: "Maintain Optimal Conditions",
          description: "Keep humidity high (60-80%) using a humidity dome or bag. Ensure consistent warmth. Be patient - fiddle leaf figs are slow to root.",
          requirements: ["High humidity essential", "Stable temperature 70-75°F", "No direct sunlight"]
        }
      ]
    },
    careInstructions: {
      light: "Bright, indirect light. Rotate weekly for even growth.",
      watering: "Water when top 2 inches dry. Usually once per week.",
      fertilizer: "Begin feeding after 8 weeks with diluted fertilizer.",
      humidity: "Prefers 50-60% humidity"
    }
  },
  {
    id: "spider-plant",
    scientificName: "Chlorophytum comosum",
    commonName: "Spider Plant",
    imageUrl: "https://images.unsplash.com/photo-1572688484438-313a6e50c333?w=400&h=240&fit=crop",
    difficulty: "easy",
    successRate: 98,
    methods: ["plantlets", "division"],
    timeToRoot: "1-2 weeks",
    optimalMonths: [3, 4, 5, 6, 7, 8, 9],
    secondaryMonths: [10],
    zoneRecommendations: {
      all: "One of the easiest plants to propagate. Nearly foolproof."
    },
    propagationSteps: {
      "plantlets": [
        {
          step: 1,
          title: "Select Mature Plantlet",
          description: "Choose a plantlet (baby spider plant) that has developed small roots. These appear as brown nubs on the bottom of the plantlet.",
          tip: "Plantlets with visible roots establish faster."
        },
        {
          step: 2,
          title: "Plant or Root",
          description: "Either cut the plantlet from the mother plant and place in water, or plant directly in soil while still attached. If still attached, roots develop in 1-2 weeks.",
          options: [
            { method: "Water first", details: "Root in water for 1 week, then plant" },
            { method: "Direct soil", details: "Plant while attached, cut after 2 weeks" }
          ]
        },
        {
          step: 3,
          title: "Establish in Soil",
          description: "Once rooted, plant in well-draining soil. Keep moist for first 2 weeks. Place in bright, indirect light.",
          requirements: ["Moderate moisture", "Bright indirect light"]
        }
      ]
    },
    careInstructions: {
      light: "Bright to medium indirect light.",
      watering: "Water when top inch is dry. Usually twice per week.",
      fertilizer: "Feed monthly during spring and summer.",
      humidity: "Average humidity is fine"
    }
  }
];
