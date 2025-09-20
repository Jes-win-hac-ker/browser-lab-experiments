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
interface ChemicalReaction {
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

interface LabEquipmentItem {
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

  return (
    <div className="min-h-screen bg-gradient-lab flex flex-col space-y-2">
      {/* Control Panel */}
      <div className="container mx-auto px-4 pt-2">
        <Card className="bg-card/50 backdrop-blur border-primary/10">
          <div className="p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* ... (keep all the control panel content) */}
            </div>
          </div>
        </Card>
      </div>

      {/* Main Lab Interface */}
      <div className="container mx-auto px-4 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-180px)] max-w-7xl mx-auto">
          {/* Equipment Sidebar */}
          <div className="lg:col-span-3">
            <EquipmentSidebar
              onEquipmentSelect={handleEquipmentSelect}
              selectedEquipment={selectedEquipment}
              selectedExperiment={selectedExperiment}
            />
          </div>

          {/* Main Lab Canvas - Centered */}
          <div className="lg:col-span-6">
            <div className="w-full h-full flex flex-col space-y-2">
              {/* Instructions Banner */}
              <LabInstructions className="flex-none" />
              
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
            </div>
          </div>

          {/* Enhanced Monitoring Panel */}
          <div className="lg:col-span-3">
            <MonitoringPanel 
              reaction={currentReaction} 
              experimentData={experimentData}
              isRunning={isExperimentRunning}
            />
          </div>
        </div>
      </div>

      {/* Chemistry Assistant Chatbot */}
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
          reactionType: currentReaction.reactionType,
        }}
      />
    </div>
  );
};
