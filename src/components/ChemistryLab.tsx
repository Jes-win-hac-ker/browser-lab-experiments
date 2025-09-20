import { useState, useCallback } from "react";
import { LabCanvas } from "./LabCanvas";
import { EquipmentSidebar } from "./EquipmentSidebar";
import { MonitoringPanel } from "./MonitoringPanel";
import { LabInstructions } from "./LabInstructions";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

export interface ChemicalReaction {
  id: string;
  temperature: number;
  pH: number;
  color: string;
  isBoiling: boolean;
  isBubbling: boolean;
  components: string[];
}

export interface LabEquipmentItem {
  id: string;
  type: 'acid' | 'base' | 'water' | 'beaker' | 'burner' | 'dropper';
  name: string;
  color: string;
  icon: string;
}

const initialReaction: ChemicalReaction = {
  id: 'main',
  temperature: 20,
  pH: 7,
  color: '#60A5FA', // water blue
  isBoiling: false,
  isBubbling: false,
  components: ['water']
};

export const ChemistryLab = () => {
  const [currentReaction, setCurrentReaction] = useState<ChemicalReaction>(initialReaction);
  const [selectedEquipment, setSelectedEquipment] = useState<LabEquipmentItem | null>(null);
  const [isExperimentActive, setIsExperimentActive] = useState(false);

  const handleEquipmentSelect = useCallback((equipment: LabEquipmentItem) => {
    setSelectedEquipment(equipment);
    toast(`Selected ${equipment.name}`);
  }, []);

  const handleEquipmentDrop = useCallback((equipment: LabEquipmentItem, position: { x: number; y: number }) => {
    setIsExperimentActive(true);
    
    // Simulate chemical reactions
    const newReaction = { ...currentReaction };
    
    if (equipment.type === 'acid' && !newReaction.components.includes('acid')) {
      newReaction.components.push('acid');
      newReaction.pH = 3;
      newReaction.color = '#EF4444'; // acid red
      toast("Added acid - pH decreased!");
    } else if (equipment.type === 'base' && !newReaction.components.includes('base')) {
      newReaction.components.push('base');
      newReaction.pH = 11;
      newReaction.color = '#3B82F6'; // base blue
      toast("Added base - pH increased!");
    } else if (equipment.type === 'water' && !newReaction.components.includes('water-dilution')) {
      newReaction.components.push('water-dilution');
      newReaction.temperature = Math.max(20, newReaction.temperature - 10);
      toast("Added water - solution diluted!");
    } else if (equipment.type === 'burner') {
      newReaction.temperature = Math.min(100, newReaction.temperature + 30);
      if (newReaction.temperature >= 100) {
        newReaction.isBoiling = true;
        toast("Solution is boiling!");
      }
    } else if (equipment.type === 'beaker') {
      toast("New beaker added to workspace!");
    } else if (equipment.type === 'dropper') {
      toast("Using dropper for precise measurements!");
    }

    // Acid + Base neutralization
    if (newReaction.components.includes('acid') && newReaction.components.includes('base')) {
      newReaction.pH = 7;
      newReaction.color = '#10B981'; // neutral green
      newReaction.isBubbling = true;
      toast("Neutralization reaction! Gas bubbles forming!");
    }

    setCurrentReaction(newReaction);
    setSelectedEquipment(null);
  }, [currentReaction]);

  const handleReset = useCallback(() => {
    setCurrentReaction(initialReaction);
    setSelectedEquipment(null);
    setIsExperimentActive(false);
    toast("Experiment reset");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-lab">
      {/* Header with Instructions */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-primary">Virtual Chemistry Lab</h1>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="hover:bg-destructive/10 hover:text-destructive border-border"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Experiment
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Instructions Banner */}
      <LabInstructions />

      {/* Main Lab Interface */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Equipment Sidebar */}
          <div className="lg:col-span-3">
            <EquipmentSidebar
              onEquipmentSelect={handleEquipmentSelect}
              selectedEquipment={selectedEquipment}
            />
          </div>

          {/* Main Lab Canvas */}
          <div className="lg:col-span-6">
            <LabCanvas
              reaction={currentReaction}
              selectedEquipment={selectedEquipment}
              onEquipmentDrop={handleEquipmentDrop}
              isActive={isExperimentActive}
            />
          </div>

          {/* Monitoring Panel */}
          <div className="lg:col-span-3">
            <MonitoringPanel reaction={currentReaction} />
          </div>
        </div>
      </div>
    </div>
  );
};