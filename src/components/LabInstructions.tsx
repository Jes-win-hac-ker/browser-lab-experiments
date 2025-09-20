import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, FlaskConical, Thermometer, Droplets } from "lucide-react";

interface LabInstructionsProps {
  className?: string;
}

export const LabInstructions = ({ className = '' }: LabInstructionsProps) => {
  return (
    <Card className={`bg-primary/5 border-primary/20 shadow-sm ${className}`}>
      <div className="p-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary flex-shrink-0" />
          <h4 className="text-sm font-medium text-foreground">Lab Instructions</h4>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <FlaskConical className="w-3 h-3 text-acid" />
            <span className="text-muted-foreground">
              Mix chemicals carefully
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-temp-hot" />
            <span className="text-muted-foreground">
              Monitor temperature
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="w-3 h-3 text-primary" />
            <span className="text-muted-foreground">
              Watch reactions
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};