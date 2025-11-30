import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface PointsDisplayProps {
  points: {
    total_points: number;
    level: number;
    points_to_next_level: number;
  };
}

export function PointsDisplay({ points }: PointsDisplayProps) {
  const progress = ((points.total_points % 100) / 100) * 100;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span className="text-lg font-semibold">Level {points.level}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {points.total_points} points
        </span>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground mt-2">
        {points.points_to_next_level} points to next level
      </p>
    </Card>
  );
}
