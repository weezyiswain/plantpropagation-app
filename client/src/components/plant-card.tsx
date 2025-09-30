import { Plant } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

interface PlantCardProps {
  plant: Plant;
}

export function PlantCard({ plant }: PlantCardProps) {
  const [, setLocation] = useLocation();

  const difficultyColors = {
    easy: "bg-primary/10 text-primary",
    medium: "bg-accent/20 text-accent-foreground",
    hard: "bg-orange-100 text-orange-800",
  };

  return (
    <Card
      className="plant-card cursor-pointer overflow-hidden"
      onClick={() => setLocation(`/propagation-form/${plant.id}`)}
      data-testid={`card-plant-${plant.id}`}
    >
      {plant.imageUrl && (
        <img
          src={plant.imageUrl}
          alt={plant.commonName}
          className="w-full h-48 object-cover"
        />
      )}
      <CardContent className="p-4">
        <h4 className="font-semibold text-foreground mb-1">{plant.commonName}</h4>
        <p className="text-sm text-muted-foreground mb-2">{plant.scientificName}</p>
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
