import { useState, useCallback, useEffect } from "react";
import { LabCanvas } from "./LabCanvas";
import { EquipmentSidebar } from "./EquipmentSidebar";
import { MonitoringPanel } from "./MonitoringPanel";
import { LabInstructions } from "./LabInstructions";
import ChatBot from "./ChatBot";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, Play, Pause, Download, Camera } from "lucide-react";
import { toast } from "sonner";

// Interfaces
export interface ChemicalReaction {
  id: string;
  temperature: number;
  pH: number;
  color: string;
  isBoiling: boolean;
  isBubbling: boolean;
  hasGasEvolution: boolean;
  hasPrecipitate: boolean;
  components: string[];
  concentration: number;
  volume: number;
  pressure: number;
  reactionProgress: number;
  reactionType: 'neutralization' | 'precipitation' | 'gas-evolution' | 'distillation' | 'none';
}

export interface LabEquipmentItem {
  id: string;
  type: 'acid' | 'base' | 'water' | 'beaker' | 'burner' | 'dropper' | 'thermometer' | 'ph-meter' | 'stirrer' | 'test-tube' | 'funnel' | 'distillation-setup';
  name: string;
  color: string;
  icon: string;
  concentration?: number;
  volume?: number;
}

interface ExperimentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'acid-base' | 'precipitation' | 'gas-evolution' | 'distillation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  expectedOutcome: string;
  requiredEquipment: string[];
  steps: string[];
  [key: string]: unknown; // Allow additional properties
}

// Component
export const ChemistryLab = () => {
  // Equipment and experiment state
  const [selectedEquipment, setSelectedEquipment] = useState<LabEquipmentItem | null>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentTemplate | null>(null);
  const [isExperimentRunning, setIsExperimentRunning] = useState(false);
  const [isExperimentActive, setIsExperimentActive] = useState(false);

  // Control parameters
  const [concentration, setConcentration] = useState(1.0);
  const [heatingPower, setHeatingPower] = useState(0);
  const [stirringSpeed, setStirringSpeed] = useState(0);

  // Reaction state
  const [currentReaction, setCurrentReaction] = useState<ChemicalReaction>({
    id: 'default',
    temperature: 20.0,
    pH: 7.0,
    color: '#ffffff',
    isBoiling: false,
    isBubbling: false,
    hasGasEvolution: false,
    hasPrecipitate: false,
    components: [],
    concentration: 0,
    volume: 0,
    pressure: 1.0,
    reactionProgress: 0,
    reactionType: 'none'
  });

  // Experiment data for graphs
  const [experimentData, setExperimentData] = useState<Array<{ time: number; pH: number; temp: number }>>([]);

  // Equipment selection handler
  const handleEquipmentSelect = useCallback((equipment: LabEquipmentItem) => {
    setSelectedEquipment(equipment);
    toast.info(`Selected ${equipment.name}`);
  }, []);

  // Equipment drop handler
  const handleEquipmentDrop = useCallback((equipment: LabEquipmentItem) => {
    // Add equipment to current reaction
    setCurrentReaction(prev => ({
      ...prev,
      components: [...prev.components, equipment.name]
    }));
    toast.success(`Added ${equipment.name} to reaction`);
  }, []);

  // Experiment control handlers
  const startExperiment = useCallback(() => {
    setIsExperimentRunning(true);
    setIsExperimentActive(true);
    setExperimentData([]);
    toast.success("Experiment started");
  }, []);

  const pauseExperiment = useCallback(() => {
    setIsExperimentRunning(false);
    toast.info("Experiment paused");
  }, []);

  const resetExperiment = useCallback(() => {
    setCurrentReaction({
      id: 'default',
      temperature: 20.0,
      pH: 7.0,
      color: '#ffffff',
      isBoiling: false,
      isBubbling: false,
      hasGasEvolution: false,
      hasPrecipitate: false,
      components: [],
      concentration: 0,
      volume: 0,
      pressure: 1.0,
      reactionProgress: 0,
      reactionType: 'none'
    });
    setExperimentData([]);
    setIsExperimentRunning(false);
    setIsExperimentActive(false);
    toast.info("Experiment reset");
  }, []);

  // Update reaction state based on conditions
  useEffect(() => {
    if (isExperimentRunning) {
      const interval = setInterval(() => {
        // Update reaction progress
        setCurrentReaction(prev => ({
          ...prev,
          temperature: prev.temperature + (heatingPower * 0.1),
          reactionProgress: Math.min(prev.reactionProgress + 2, 100),
          isBoiling: prev.temperature >= 100,
          isBubbling: stirringSpeed > 50
        }));

        // Record data point
        setExperimentData(prev => [
          ...prev,
          {
            time: prev.length * 0.5,
            pH: currentReaction.pH + (Math.random() - 0.5) * 0.1,
            temp: currentReaction.temperature + (Math.random() - 0.5) * 0.5
          }
        ]);
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isExperimentRunning, heatingPower, stirringSpeed, currentReaction.pH, currentReaction.temperature]);

  // Derive reaction chemistry when components list changes
  useEffect(() => {
    setCurrentReaction(prev => {
      const components = prev.components;
      if (components.length === 0) return { ...prev, pH: 7, volume: 0, concentration: 0, reactionType: 'none' };

      // Count acids, bases, water, indicator
      const acidCount = components.filter(c => c.toLowerCase().includes('hcl') || c.toLowerCase().includes('nitrate') ).length;
      const baseCount = components.filter(c => c.toLowerCase().includes('naoh') || c.toLowerCase().includes('carbonate') || c.toLowerCase().includes('chloride')).length;
      const waterCount = components.filter(c => c.toLowerCase().includes('water')).length;
      const indicatorAdded = components.some(c => c.toLowerCase().includes('indicator'));

      // Volume heuristic (each chemical 50 mL if volume known else 10 mL; water 100 or 5 for indicator)
      let volume = 0;
      components.forEach(name => {
        const lower = name.toLowerCase();
        if (lower.includes('water') && !lower.includes('indicator')) volume += 100;
        else if (lower.includes('indicator')) volume += 5;
        else if (lower.includes('hcl') || lower.includes('naoh')) volume += 50;
        else volume += 10;
      });

      // pH estimation
      let pH = 7;
      if (acidCount > baseCount) pH = Math.max(1, 7 - (acidCount - baseCount) * 1.5);
      else if (baseCount > acidCount) pH = Math.min(13, 7 + (baseCount - acidCount) * 1.5);

      // Reaction type
      let reactionType: ChemicalReaction['reactionType'] = 'none';
      if (acidCount && baseCount) {
        const balance = Math.abs(acidCount - baseCount);
        reactionType = balance === 0 ? 'neutralization' : 'gas-evolution'; // simple heuristic
      } else if (components.some(c => c.toLowerCase().includes('silver') ) && components.some(c => c.toLowerCase().includes('chloride'))) {
        reactionType = 'precipitation';
      }

      // Gas / precipitate flags
      const hasGasEvolution = reactionType === 'gas-evolution';
      const hasPrecipitate = reactionType === 'precipitation';

      // Concentration heuristic (moles/volume) simplified: (#reactive components)/ (volume/100)
      const reactiveCount = acidCount + baseCount;
      const concentration = volume > 0 ? Math.min(5, reactiveCount / Math.max(1, volume / 100)) : 0;

      return {
        ...prev,
        pH,
        volume,
        concentration,
        reactionType,
        hasGasEvolution,
        hasPrecipitate,
        color: indicatorAdded ? (pH < 7 ? '#EF4444' : pH > 7 ? '#3B82F6' : '#10B981') : prev.color
      };
    });
  }, [currentReaction.components]);

  return (
    <div className="min-h-screen bg-gradient-lab flex flex-col">
      {/* Main Lab Interface */}
      <div className="container mx-auto px-4 py-2 flex-1">
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-7xl mx-auto">
          {/* Equipment Sidebar */}
          <div className="lg:col-span-3 flex flex-col space-y-2">
            <EquipmentSidebar
              onEquipmentSelect={handleEquipmentSelect}
              selectedEquipment={selectedEquipment}
              selectedExperiment={selectedExperiment}
            />
          </div>

          {/* Main Lab Canvas - Centered */}
          <div className="lg:col-span-6 flex flex-col space-y-2">
            {/* Instructions Banner */}
            <LabInstructions className="flex-none" />
            
            {/* Control Panel */}
            <Card className="bg-card/50 backdrop-blur border-primary/10">
              <div className="p-2">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {/* Control buttons */}
                  <div className="col-span-2 lg:col-span-4 flex items-center gap-2">
                    <Button onClick={startExperiment} className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Start
                    </Button>
                    <Button onClick={pauseExperiment} className="flex items-center gap-2">
                      <Pause className="w-4 h-4" />
                      Pause
                    </Button>
                    <Button variant="destructive" onClick={resetExperiment} className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </Button>
                  </div>
                  {/* ... (keep all the control panel content) */}
                </div>
              </div>
            </Card>
            
            {/* Lab Canvas */}
            <div className="flex-1 flex items-center justify-center bg-card/30 backdrop-blur-sm rounded-lg border border-primary/10">
              <LabCanvas
                reaction={currentReaction}
                selectedEquipment={selectedEquipment}
                onEquipmentDrop={handleEquipmentDrop}
                isActive={isExperimentActive}
                concentration={concentration}
                heatingPower={heatingPower}
                stirringSpeed={stirringSpeed}
              />
            </div>
          </div>{/* end col-span-6 */}
          {/* Enhanced Monitoring Panel + Chatbot */}
          <div className="lg:col-span-3 flex flex-col space-y-4">
            <MonitoringPanel 
              reaction={currentReaction} 
              experimentData={experimentData}
              isRunning={isExperimentRunning}
            />
            {/* Chemistry Assistant Chatbot */}
            <div className="mt-4">
              <ChatBot 
                currentExperiment={selectedExperiment}
                reactionState={{
                  temperature: currentReaction.temperature,
                  pH: currentReaction.pH,
                  color: currentReaction.color,
                  isBoiling: currentReaction.isBoiling,
                  isBubbling: currentReaction.isBubbling,
                  hasGasEvolution: currentReaction.hasGasEvolution,
                  hasPrecipitate: currentReaction.hasPrecipitate,
                  components: currentReaction.components,
                  reactionProgress: currentReaction.reactionProgress,
                  concentration: currentReaction.concentration,
                  volume: currentReaction.volume,
                  pressure: currentReaction.pressure,
                  reactionType: currentReaction.reactionType
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
