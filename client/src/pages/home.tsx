import { useQuery } from "@tanstack/react-query";
import { Plant } from "@shared/schema";
import { PlantSearch } from "@/components/plant-search";
import { PlantCard } from "@/components/plant-card";
import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [, setLocation] = useLocation();
  
  const { data: plants = [], isLoading } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });

  const popularPlants = plants.slice(0, 4);
  const topPlants = ["pothos-golden", "snake-plant", "monstera-deliciosa", "fiddle-leaf-fig"];

  const handleQuickPlantSelect = (plantId: string) => {
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
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Find the Perfect Time to <span className="text-primary">Propagate</span> Your Plants
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get personalized propagation windows and detailed guides based on your plant type, growing zone, and local conditions.
            </p>

            {/* Plant Search Form */}
            <div className="bg-card rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
              <div className="space-y-6">
                <PlantSearch />

                {/* Quick Start Options */}
                <div>
                  <p className="text-sm text-muted-foreground mb-3 text-left">
                    Or choose a popular plant:
                  </p>
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
                  <PlantCard key={plant.id} plant={plant} />
                ))}
              </div>
            )}

            <div className="text-center mt-8">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  const section = document.querySelector('input[data-testid="input-plant-search"]');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                data-testid="button-view-all-plants"
              >
                Search All Plants
              </Button>
            </div>
          </div>
        </div>
      </section>

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
              © 2024 PlantProp. All rights reserved. Made with 🌱 for plant lovers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
