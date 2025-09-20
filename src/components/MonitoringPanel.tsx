import { ChemicalReaction } from "./ChemistryLab";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";
import { 
  Thermometer, 
  Droplets, 
  Activity,
  Beaker,
  Zap,
  Flame,
  TrendingUp,
  Gauge,
  Wind,
  Atom
} from "lucide-react";

interface MonitoringPanelProps {
  reaction: ChemicalReaction;
  experimentData: Array<{time: number, pH: number, temp: number}>;
  isRunning: boolean;
}

export const MonitoringPanel = ({ reaction, experimentData, isRunning }: MonitoringPanelProps) => {
  const getpHColor = (pH: number) => {
    if (pH < 7) return "text-red-500";
    if (pH > 7) return "text-blue-500";
    return "text-green-500";
  };

  const getpHLabel = (pH: number) => {
    if (pH <= 2) return "Strongly Acidic";
    if (pH <= 4) return "Moderately Acidic";
    if (pH < 7) return "Weakly Acidic";
    if (pH === 7) return "Neutral";
    if (pH <= 10) return "Weakly Basic";
    if (pH <= 12) return "Moderately Basic";
    return "Strongly Basic";
  };

  const getTempColor = (temp: number) => {
    if (temp >= 80) return "text-red-500";
    if (temp >= 40) return "text-orange-500";
    if (temp >= 20) return "text-yellow-500";
    return "text-blue-500";
  };

  const getTemperatureProgress = (temp: number) => {
    return Math.min((temp / 100) * 100, 100);
  };

  const getpHProgress = (pH: number) => {
    return (pH / 14) * 100;
  };

  const getPressureColor = (pressure: number) => {
    if (pressure > 1.5) return "text-red-500";
    if (pressure > 1.2) return "text-orange-500";
    return "text-green-500";
  };

  const getReactionTypeColor = (type: string) => {
    switch (type) {
      case 'neutralization': return 'bg-green-100 text-green-800';
      case 'precipitation': return 'bg-blue-100 text-blue-800';
      case 'gas-evolution': return 'bg-yellow-100 text-yellow-800';
      case 'distillation': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      {/* Live Monitoring Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lab">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className={cn("w-5 h-5 text-primary", isRunning && "animate-pulse")} />
            Live Monitoring
            {isRunning && (
              <Badge variant="destructive" className="ml-2 animate-pulse">
                Recording
              </Badge>
            )}
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
                  {reaction.temperature.toFixed(1)}°C
                </span>
              </div>
              <Progress 
                value={getTemperatureProgress(reaction.temperature)} 
                className="h-3"
              />
              {reaction.isBoiling && (
                <Badge variant="destructive" className="animate-pulse">
                  <Flame className="w-3 h-3 mr-1" />
                  Boiling Point Reached
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
                  {reaction.pH.toFixed(2)}
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

            {/* Pressure Reading */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className={cn("w-4 h-4", getPressureColor(reaction.pressure))} />
                  <span className="font-medium text-sm">Pressure</span>
                </div>
                <span className={cn("font-mono text-lg font-bold", getPressureColor(reaction.pressure))}>
                  {reaction.pressure.toFixed(2)} atm
                </span>
              </div>
              <Progress 
                value={Math.min((reaction.pressure / 2) * 100, 100)} 
                className="h-3"
              />
            </div>

            {/* Concentration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Beaker className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Concentration</span>
                </div>
                <span className="font-mono text-lg font-bold text-primary">
                  {reaction.concentration.toFixed(2)}M
                </span>
              </div>
              <Progress 
                value={Math.min((reaction.concentration / 5) * 100, 100)} 
                className="h-3"
              />
            </div>

            {/* Volume */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-sm">Volume</span>
                </div>
                <span className="font-mono text-lg font-bold text-blue-500">
                  {reaction.volume.toFixed(0)}mL
                </span>
              </div>
              <Progress 
                value={Math.min((reaction.volume / 500) * 100, 100)} 
                className="h-3"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Reaction Status Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lab">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Atom className="w-5 h-5 text-primary" />
            Reaction Status
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Reaction Type</span>
              <Badge className={getReactionTypeColor(reaction.reactionType)}>
                {reaction.reactionType.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="font-mono text-sm font-bold">
                {reaction.reactionProgress.toFixed(1)}%
              </span>
            </div>
            <Progress value={reaction.reactionProgress} className="h-2" />

            <div className="grid grid-cols-2 gap-2 mt-4">
              {reaction.isBubbling && (
                <Badge variant="secondary" className="animate-bounce">
                  <Wind className="w-3 h-3 mr-1" />
                  Bubbling
                </Badge>
              )}
              {reaction.hasGasEvolution && (
                <Badge variant="secondary" className="animate-pulse">
                  <Zap className="w-3 h-3 mr-1" />
                  Gas Evolution
                </Badge>
              )}
              {reaction.hasPrecipitate && (
                <Badge variant="secondary">
                  <Droplets className="w-3 h-3 mr-1" />
                  Precipitate
                </Badge>
              )}
              {reaction.isBoiling && (
                <Badge variant="destructive" className="animate-pulse">
                  <Flame className="w-3 h-3 mr-1" />
                  Boiling
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Real-time Graph */}
      {experimentData.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lab">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Real-time Data
            </h3>
            
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={experimentData.slice(-20)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pH" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={false}
                    name="pH"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    dot={false}
                    name="Temperature (°C)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      )}

      {/* Components List */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lab">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Components</h3>
          <div className="space-y-2">
            {reaction.components.map((component, index) => (
              <Badge key={index} variant="outline" className="mr-2">
                {component.replace('-', ' ')}
              </Badge>
            ))}
            {reaction.components.length === 0 && (
              <p className="text-sm text-muted-foreground">No components added yet</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};