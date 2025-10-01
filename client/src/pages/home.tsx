import { useQuery, useMutation } from "@tanstack/react-query";
import { Plant, InsertPropagationRequest } from "@shared/schema";
import { PlantSearch } from "@/components/plant-search";
import { PlantCard } from "@/components/plant-card";
import { Button } from "@/components/ui/button";
import { Sprout, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { autoDetectUSDAZone } from "@/lib/zone-detection";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdPlaceholder } from "@/components/ad-placeholder";

const USDA_ZONES = [
  "1a", "1b", "2a", "2b", "3a", "3b", "4a", "4b", "5a", "5b",
  "6a", "6b", "7a", "7b", "8a", "8b", "9a", "9b", "10a", "10b",
  "11a", "11b", "12a", "12b", "13a", "13b"
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedZone, setSelectedZone] = useState<string>(() => {
    // Load from localStorage or default to empty
    return localStorage.getItem('userZone') || '';
  });
  
  const { data: plants = [], isLoading } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });

  // Auto-detect zone on mount if not already set
  useEffect(() => {
    const detectZone = async () => {
      if (!selectedZone) {
        const detectedZone = await autoDetectUSDAZone();
        if (detectedZone) {
          setSelectedZone(detectedZone);
          localStorage.setItem('userZone', detectedZone);
        }
      }
    };
    detectZone();
  }, []);

  const handleZoneChange = (zone: string) => {
    setSelectedZone(zone);
    localStorage.setItem('userZone', zone);
  };

  const createRequestMutation = useMutation({
    mutationFn: async (data: InsertPropagationRequest) => {
      const res = await apiRequest("POST", "/api/propagation-requests", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/propagation-requests"] });
      setLocation(`/results/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Please select your growing zone first",
        variant: "destructive",
      });
    },
  });

  const popularPlants = plants.slice(0, 4);
  const topPlants = ["pothos-golden", "snake-plant", "monstera-deliciosa", "fiddle-leaf-fig"];

  // Cycling search suggestions
  const searchSuggestions = [
    "Monstera, Rose, Basil",
    "Pothos, Tomato, Snake Plant",
    "Lavender, Mint, Fiddle Leaf Fig",
    "Spider Plant, Oregano, Jade Plant"
  ];
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestionIndex((prev) => (prev + 1) % searchSuggestions.length);
    }, 3000); // Change every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const handleQuickPlantSelect = (plantId: string) => {
    // Check if zone is selected
    if (!selectedZone) {
      toast({
        title: "Zone Required",
        description: "Please select your growing zone first",
        variant: "destructive",
      });
      return;
    }

    // Create request with defaults and go straight to results
    createRequestMutation.mutate({
      plantId,
      zone: selectedZone,
      maturity: "mature",
      environment: "inside",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Sprout className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">PlantProp</h1>
                <p className="text-xs text-muted-foreground">Smart Propagation Guide</p>
              </div>
            </div>
            
            {/* Zone Selector */}
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedZone} onValueChange={handleZoneChange}>
                <SelectTrigger className="w-[120px]" data-testid="select-zone-header">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {USDA_ZONES.map((zone) => (
                    <SelectItem key={zone} value={zone} data-testid={`zone-option-${zone}`}>
                      Zone {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl text-foreground mb-6">
              <span className="font-bold">Propagate with Confidence:</span>{" "}
              <span className="font-normal">Personalized Guides for 100+ Plants</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Step-by-step propagation guides for 100+ plants.
            </p>

            {/* Plant Search Form */}
            <div className="bg-card rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
              <div className="space-y-6">
                <div>
                  <PlantSearch onPlantSelect={handleQuickPlantSelect} />
                  <p className="text-sm text-muted-foreground mt-2 text-center transition-opacity duration-500">
                    🌿 Try: {searchSuggestions[currentSuggestionIndex]}…
                  </p>
                </div>

                {/* Quick Start Options */}
                <div>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <p className="text-sm text-muted-foreground">
                      Or
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setLocation("/all-plants")}
                      className="text-sm"
                      data-testid="button-browse-all"
                    >
                      Browse all plants
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {topPlants.map((plantId) => {
                      const plant = plants.find((p) => p.id === plantId);
                      return plant ? (
                        <Button
                          key={plantId}
                          variant="secondary"
                          onClick={() => handleQuickPlantSelect(plantId)}
                          className="text-sm"
                          data-testid={`button-quick-${plantId}`}
                        >
                          {plant.commonName.replace(" Plant", "")}
                        </Button>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* After Hero Ad */}
      <div className="bg-background py-6">
        <div className="container mx-auto px-4">
          <AdPlaceholder slot="home-after-hero" format="leaderboard" />
          <AdPlaceholder slot="home-after-hero-mobile" format="mobile-banner" />
        </div>
      </div>

      {/* Popular Plants */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Explore Popular Plants
              </h3>
              <p className="text-muted-foreground">
                Browse our database of the most popular plants for propagation
              </p>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularPlants.map((plant) => (
                  <PlantCard key={plant.id} plant={plant} onPlantSelect={handleQuickPlantSelect} />
                ))}
              </div>
            )}

            <div className="text-center mt-8">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setLocation("/all-plants")}
                data-testid="button-view-all-plants"
              >
                Search All Plants
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* After Popular Plants Ad */}
      <div className="bg-background py-6">
        <div className="container mx-auto px-4">
          <AdPlaceholder slot="home-after-plants" format="leaderboard" />
          <AdPlaceholder slot="home-after-plants-mobile" format="mobile-banner" />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Sprout className="text-primary-foreground h-5 w-5" />
                </div>
                <span className="font-bold text-foreground">PlantProp</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Smart plant propagation guidance for gardeners of all levels.
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-foreground mb-4">Plant Database</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Popular Plants</li>
                <li>Houseplants</li>
                <li>Succulents</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-foreground mb-4">Resources</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Propagation Guide</li>
                <li>Growing Zones</li>
                <li>Plant Care Tips</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-foreground mb-4">Support</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>About Us</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 PlantProp. All rights reserved. Made with 🌱 for plant lovers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
