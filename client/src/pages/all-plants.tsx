import { useQuery, useMutation } from "@tanstack/react-query";
import { Plant, InsertPropagationRequest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Sprout, ArrowLeft, AlertCircle, MapPin, ArrowUpDown, Search } from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { autoDetectUSDAZone } from "@/lib/zone-detection";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { DifficultyBadge } from "@/components/difficulty-badge";

const USDA_ZONES = [
  "1a", "1b", "2a", "2b", "3a", "3b", "4a", "4b", "5a", "5b",
  "6a", "6b", "7a", "7b", "8a", "8b", "9a", "9b", "10a", "10b",
  "11a", "11b", "12a", "12b", "13a", "13b"
];

type SortOption = 'name-asc' | 'name-desc' | 'difficulty-asc' | 'difficulty-desc' | 'success-asc' | 'success-desc';
type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

export default function AllPlants() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedZone, setSelectedZone] = useState<string>(() => {
    return localStorage.getItem('userZone') || '';
  });
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: plants = [], isLoading, isError, error, refetch } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const difficultyOrder: Record<string, number> = {
    'easy': 1,
    'medium': 2,
    'hard': 3
  };

  const filteredAndSortedPlants = plants
    .filter((plant) => {
      // Filter by difficulty
      if (difficultyFilter !== 'all' && plant.difficulty?.toLowerCase() !== difficultyFilter) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          plant.name?.toLowerCase().includes(query) ||
          plant.commonName?.toLowerCase().includes(query) ||
          plant.scientificName?.toLowerCase().includes(query)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.name || a.commonName).localeCompare(b.name || b.commonName);
        case 'name-desc':
          return (b.name || b.commonName).localeCompare(a.name || a.commonName);
        case 'difficulty-asc':
          return (difficultyOrder[a.difficulty?.toLowerCase() || 'medium'] || 2) - 
                 (difficultyOrder[b.difficulty?.toLowerCase() || 'medium'] || 2);
        case 'difficulty-desc':
          return (difficultyOrder[b.difficulty?.toLowerCase() || 'medium'] || 2) - 
                 (difficultyOrder[a.difficulty?.toLowerCase() || 'medium'] || 2);
        case 'success-asc':
          return (a.successRate || 0) - (b.successRate || 0);
        case 'success-desc':
          return (b.successRate || 0) - (a.successRate || 0);
        default:
          return 0;
      }
    });

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
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="text-all-plants-heading">
                All Plants
              </h2>
              <p className="text-lg text-muted-foreground" data-testid="text-plant-count">
                Browse our complete database of {plants.length} plants
              </p>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex items-center gap-4 mb-6">
              {/* Search Bar - Left side, 1/3 width */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
                <Input
                  type="text"
                  placeholder="Search plants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 border-2 border-primary/30 focus:border-primary focus-visible:ring-primary"
                  data-testid="input-search-plants"
                />
              </div>

              {/* Sort and Filter - Right side */}
              <div className="flex items-center gap-4 ml-auto">
                {/* Results Count */}
                <div className="text-xs text-muted-foreground">
                  {filteredAndSortedPlants.length} plant{filteredAndSortedPlants.length !== 1 ? 's' : ''}
                </div>

                {/* Sort By */}
                <div className="flex items-center gap-2">
                  <Label htmlFor="sort-select" className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                    <ArrowUpDown className="h-3 w-3" />
                    Sort
                  </Label>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger id="sort-select" data-testid="select-sort" className="h-8 w-[180px] text-xs border-2 border-primary/30 focus:border-primary focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                      <SelectItem value="difficulty-asc">Difficulty (Easy to Hard)</SelectItem>
                      <SelectItem value="difficulty-desc">Difficulty (Hard to Easy)</SelectItem>
                      <SelectItem value="success-desc">Success Rate (High to Low)</SelectItem>
                      <SelectItem value="success-asc">Success Rate (Low to High)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filter by Difficulty */}
                <div className="flex items-center gap-2">
                  <Label htmlFor="difficulty-filter" className="text-xs text-muted-foreground whitespace-nowrap">
                    Filter
                  </Label>
                  <Select value={difficultyFilter} onValueChange={(value) => setDifficultyFilter(value as DifficultyFilter)}>
                    <SelectTrigger id="difficulty-filter" data-testid="select-difficulty-filter" className="h-8 w-[140px] text-xs border-2 border-primary/30 focus:border-primary focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
            ) : filteredAndSortedPlants.length === 0 ? (
              <div className="text-center py-12">
                <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-empty-heading">
                  No Plants Found
                </h3>
                <p className="text-muted-foreground" data-testid="text-empty-message">
                  {difficultyFilter !== 'all' 
                    ? `No ${difficultyFilter} plants found in our database.`
                    : 'Our plant database is currently empty.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredAndSortedPlants.map((plant) => (
                  <button
                    key={plant.id}
                    onClick={() => handlePlantClick(plant.id)}
                    className="bg-card hover:bg-accent/50 border border-border rounded-lg p-6 text-left transition-colors group"
                    data-testid={`plant-item-${plant.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {plant.name}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>{plant.commonName}</span>
                          <span>•</span>
                          <span className="italic">{plant.scientificName}</span>
                        </p>
                      </div>
                      <div className="flex items-center">
                        <DifficultyBadge difficulty={plant.difficulty} size="md" />
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
