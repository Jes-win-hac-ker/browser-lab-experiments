import { ChemicalReaction } from "./ChemistryLab";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Thermometer, 
  Droplets, 
  Activity,
  Beaker,
  Zap,
  Flame
} from "lucide-react";

interface MonitoringPanelProps {
  reaction: ChemicalReaction;
}

export const MonitoringPanel = ({ reaction }: MonitoringPanelProps) => {
  const getpHColor = (pH: number) => {
    if (pH < 7) return "text-acid";
    if (pH > 7) return "text-base";
    return "text-neutral";
  };

  const getpHLabel = (pH: number) => {
    if (pH < 7) return "Acidic";
    if (pH > 7) return "Basic";
    return "Neutral";
  };

  const getTempColor = (temp: number) => {
    if (temp >= 80) return "text-temp-hot";
    if (temp >= 40) return "text-temp-warm";
    return "text-temp-cold";
  };

  const getTemperatureProgress = (temp: number) => {
    return Math.min((temp / 100) * 100, 100);
  };

  const getpHProgress = (pH: number) => {
    return (pH / 14) * 100;
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lab h-fit">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Live Monitoring
        </h3>

        <div className="space-y-6">
          {/* Temperature Reading */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className={cn("w-4 h-4", getTempColor(reaction.temperature))} />
                <span className="font-medium text-sm">Temperature</span>
              </div>
              <span className={cn("font-mono text-lg font-bold", getTempColor(reaction.temperature))}>
                {reaction.temperature}°C
              </span>
            </div>
            <Progress 
              value={getTemperatureProgress(reaction.temperature)} 
              className="h-3"
            />
            {reaction.isBoiling && (
              <Badge variant="destructive" className="animate-pulse">
                <Flame className="w-3 h-3 mr-1" />
                Boiling
              </Badge>
            )}
          </div>

          {/* pH Reading */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className={cn("w-4 h-4", getpHColor(reaction.pH))} />
                <span className="font-medium text-sm">pH Level</span>
              </div>
              <span className={cn("font-mono text-lg font-bold", getpHColor(reaction.pH))}>
                {reaction.pH.toFixed(1)}
              </span>
            </div>
            <Progress 
              value={getpHProgress(reaction.pH)} 
              className="h-3"
            />
            <Badge 
              variant="outline" 
              className={cn("border-current", getpHColor(reaction.pH))}
            >
              {getpHLabel(reaction.pH)}
            </Badge>
          </div>

          {/* Solution Color */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Beaker className="w-4 h-4 text-foreground" />
              <span className="font-medium text-sm">Solution Color</span>
            </div>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-lg border-2 border-border shadow-inner"
                style={{ backgroundColor: reaction.color }}
              />
              <div className="text-xs text-muted-foreground font-mono">
                {reaction.color.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Active Components */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Components</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {reaction.components.map((component, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="text-xs"
                >
                  {component}
                </Badge>
              ))}
            </div>
          </div>

          {/* Active Reactions */}
          {(reaction.isBubbling || reaction.isBoiling) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent animate-pulse" />
                <span className="font-medium text-sm">Active Reactions</span>
              </div>
              <div className="space-y-2">
                {reaction.isBubbling && (
                  <Badge variant="outline" className="w-full justify-center animate-pulse">
                    Gas Evolution - Bubbling
                  </Badge>
                )}
                {reaction.isBoiling && (
                  <Badge variant="outline" className="w-full justify-center animate-pulse">
                    Phase Change - Boiling
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Safety Status */}
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Safety Status</span>
              <Badge 
                variant={reaction.temperature > 80 || reaction.pH < 2 || reaction.pH > 12 ? "destructive" : "default"}
                className="animate-pulse"
              >
                {reaction.temperature > 80 || reaction.pH < 2 || reaction.pH > 12 ? "CAUTION" : "SAFE"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};