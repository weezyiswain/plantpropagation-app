import { useQuery, useMutation } from "@tanstack/react-query";
import { Plant, InsertPropagationRequest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Sprout, ArrowLeft, AlertCircle, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { autoDetectUSDAZone } from "@/lib/zone-detection";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const USDA_ZONES = [
  "1a", "1b", "2a", "2b", "3a", "3b", "4a", "4b", "5a", "5b",
  "6a", "6b", "7a", "7b", "8a", "8b", "9a", "9b", "10a", "10b",
  "11a", "11b", "12a", "12b", "13a", "13b"
];

export default function AllPlants() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedZone, setSelectedZone] = useState<string>(() => {
    return localStorage.getItem('userZone') || '';
  });
  
  const { data: plants = [], isLoading, isError, error, refetch } = useQuery<Plant[]>({
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

  useEffect(() => {
    document.title = "All Plants - PlantProp";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Browse our complete database of plants for propagation. Find detailed propagation guides, success rates, and step-by-step instructions for each plant.');
    }
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

  const sortedPlants = [...plants].sort((a, b) => 
    a.commonName.localeCompare(b.commonName)
  );

  const handlePlantClick = (plantId: string) => {
    if (!selectedZone) {
      toast({
        title: "Zone Required",
        description: "Please select your growing zone first",
        variant: "destructive",
      });
      return;
    }

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
            
            <div className="flex items-center space-x-4">
              {/* Zone Selector */}
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedZone} onValueChange={handleZoneChange}>
                  <SelectTrigger className="w-[120px]" data-testid="select-zone-header">
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {USDA_ZONES.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        Zone {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                variant="ghost"
                onClick={() => setLocation("/")}
                data-testid="button-back-home"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="text-all-plants-heading">
                All Plants
              </h2>
              <p className="text-lg text-muted-foreground" data-testid="text-plant-count">
                Browse our complete database of {plants.length} plants
              </p>
            </div>

            {isLoading ? (
              <div className="grid gap-3">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-error-heading">
                  Error Loading Plants
                </h3>
                <p className="text-muted-foreground mb-4" data-testid="text-error-message">
                  {error instanceof Error ? error.message : "Failed to load plants. Please try again."}
                </p>
                <Button 
                  onClick={() => refetch()} 
                  data-testid="button-retry"
                >
                  Retry
                </Button>
              </div>
            ) : sortedPlants.length === 0 ? (
              <div className="text-center py-12">
                <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-empty-heading">
                  No Plants Found
                </h3>
                <p className="text-muted-foreground" data-testid="text-empty-message">
                  Our plant database is currently empty.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {sortedPlants.map((plant) => (
                  <button
                    key={plant.id}
                    onClick={() => handlePlantClick(plant.id)}
                    className="bg-card hover:bg-accent/50 border border-border rounded-lg p-6 text-left transition-colors group"
                    data-testid={`plant-item-${plant.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {plant.commonName}
                        </h3>
                        <p className="text-sm text-muted-foreground italic">
                          {plant.scientificName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Difficulty</p>
                        <p className="text-sm font-medium capitalize text-foreground">
                          {plant.difficulty}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
