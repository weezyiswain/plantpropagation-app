import { useQuery } from "@tanstack/react-query";
import { Plant } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Sprout, ArrowLeft, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

export default function AllPlants() {
  const [, setLocation] = useLocation();
  
  const { data: plants = [], isLoading, isError, error, refetch } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });

  useEffect(() => {
    document.title = "All Plants - PlantProp";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Browse our complete database of plants for propagation. Find detailed propagation guides, success rates, and step-by-step instructions for each plant.');
    }
  }, []);

  const sortedPlants = [...plants].sort((a, b) => 
    a.commonName.localeCompare(b.commonName)
  );

  const handlePlantClick = (plantId: string) => {
    setLocation(`/propagation-form/${plantId}`);
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
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Difficulty</p>
                          <p className="text-sm font-medium capitalize text-foreground">
                            {plant.difficulty}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Success Rate</p>
                          <p className="text-sm font-medium text-foreground">
                            {plant.successRate}%
                          </p>
                        </div>
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
