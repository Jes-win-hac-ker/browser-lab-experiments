import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, FlaskConical, Thermometer, Droplets } from "lucide-react";

export const LabInstructions = () => {
  return (
    <div className="container mx-auto px-4 py-4">
      <Card className="bg-primary/5 border-primary/20 shadow-glow-blue">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-2">Virtual Chemistry Lab Instructions</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-acid" />
                  <span className="text-muted-foreground">
                    <Badge variant="outline" className="mr-1 text-xs">Acid + Base</Badge>
                    creates neutralization reaction
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-temp-hot" />
                  <span className="text-muted-foreground">
                    <Badge variant="outline" className="mr-1 text-xs">Burner</Badge>
                    heats solution to boiling point
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    <Badge variant="outline" className="mr-1 text-xs">Monitor</Badge>
                    pH and temperature changes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};