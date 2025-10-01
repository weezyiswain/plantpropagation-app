import { Plant } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useState } from "react";
import { Sprout } from "lucide-react";

interface PlantCardProps {
  plant: Plant;
  onPlantSelect?: (plantId: string) => void;
}

export function PlantCard({ plant, onPlantSelect }: PlantCardProps) {
  const [, setLocation] = useLocation();
  const [imageError, setImageError] = useState(false);

  const difficultyColors = {
    easy: "bg-primary/10 text-primary",
    medium: "bg-accent/20 text-accent-foreground",
    hard: "bg-orange-100 text-orange-800",
  };

  const handleClick = () => {
    if (onPlantSelect) {
      onPlantSelect(plant.id);
    } else {
      setLocation(`/propagation-form/${plant.id}`);
    }
  };

  return (
    <Card
      className="plant-card cursor-pointer overflow-hidden"
      onClick={handleClick}
      data-testid={`card-plant-${plant.id}`}
    >
      {plant.imageUrl && !imageError ? (
        <img
          src={plant.imageUrl}
          alt={plant.commonName}
          className="w-full h-48 object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
          <Sprout className="w-16 h-16 text-primary/40" />
        </div>
      )}
      <CardContent className="p-4">
        <h4 className="font-semibold text-foreground mb-1">{plant.name}</h4>
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
          <span>{plant.commonName}</span>
          <span>•</span>
          <span className="italic">{plant.scientificName}</span>
        </p>
        <div className="flex items-center justify-between text-xs">
          <span
            className={`px-2 py-1 rounded-full capitalize ${
              difficultyColors[plant.difficulty as keyof typeof difficultyColors]
            }`}
          >
            {plant.difficulty}
          </span>
          <span className="text-muted-foreground">{plant.successRate}% success</span>
        </div>
      </CardContent>
    </Card>
  );
}
