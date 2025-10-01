import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plant } from "@shared/schema";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

interface PlantSearchProps {
  onPlantSelect?: (plantId: string) => void;
}

export function PlantSearch({ onPlantSelect }: PlantSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [, setLocation] = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults = [], isLoading } = useQuery<Plant[]>({
    queryKey: ["/api/plants/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const res = await fetch(`/api/plants/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Failed to search plants");
      return res.json();
    },
    enabled: searchQuery.length >= 2,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePlantClick = (plant: Plant) => {
    if (onPlantSelect) {
      onPlantSelect(plant.id);
    } else {
      setLocation(`/propagation-form/${plant.id}`);
    }
    setShowResults(false);
    setSearchQuery("");
  };

  return (
    <div ref={searchRef} className="relative">
      <label className="block text-sm font-medium text-foreground mb-2 text-left">
        Search for your plant
      </label>
      <div className="relative">
        <Input
          type="text"
          placeholder="e.g., Monstera deliciosa, Snake plant, Pothos..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="pl-12"
          data-testid="input-plant-search"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
      </div>

      {showResults && searchQuery.length >= 2 && (
        <div className="absolute w-full bg-popover border border-border rounded-lg mt-1 shadow-lg z-10 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No plants found matching "{searchQuery}"
            </div>
          ) : (
            <div className="p-2">
              {searchResults.map((plant) => (
                <button
                  key={plant.id}
                  onClick={() => handlePlantClick(plant)}
                  className="w-full p-3 hover:bg-accent rounded-md cursor-pointer flex items-center space-x-3 text-left"
                  data-testid={`button-plant-${plant.id}`}
                >
                  {plant.imageUrl && (
                    <img
                      src={plant.imageUrl}
                      alt={plant.commonName}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-foreground">{plant.commonName}</p>
                    <p className="text-sm text-muted-foreground">{plant.scientificName}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
