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

export interface ExperimentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'acid-base' | 'precipitation' | 'gas-evolution' | 'distillation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  expectedOutcome: string;
  requiredEquipment: string[];
  steps: string[];
}

const experimentTemplates: ExperimentTemplate[] = [
  {
    id: 'acid-base-neutralization',
    name: 'Acid-Base Neutralization',
    description: 'Observe pH changes and heat release when mixing acids and bases',
    category: 'acid-base',
    difficulty: 'beginner',
    expectedOutcome: 'pH approaches 7, solution turns green, temperature increases',
    requiredEquipment: ['hcl-acid', 'naoh-base', 'ph-meter', 'thermometer'],
    steps: [
      'Add HCl acid to beaker',
      'Slowly add NaOH base while monitoring pH',
      'Observe color change and temperature rise',
      'Record neutralization point'
    ]
  },
  {
    id: 'gas-evolution',
    name: 'Gas Evolution Reaction',
    description: 'Generate CO2 gas by mixing carbonate with acid',
    category: 'gas-evolution',
    difficulty: 'beginner',
    expectedOutcome: 'Vigorous bubbling, CO2 gas production, pH decreases',
    requiredEquipment: ['hcl-acid', 'sodium-carbonate', 'gas-collection-tube'],
    steps: [
      'Add sodium carbonate to beaker',
      'Slowly add HCl acid',
      'Observe bubble formation',
      'Collect evolved gas'
    ]
  },
  {
    id: 'precipitation-reaction',
    name: 'Precipitation Formation',
    description: 'Form a solid precipitate by mixing two solutions',
    category: 'precipitation',
    difficulty: 'intermediate',
    expectedOutcome: 'White precipitate forms, solution becomes cloudy',
    requiredEquipment: ['silver-nitrate', 'sodium-chloride', 'stirrer', 'funnel'],
    steps: [
      'Add silver nitrate solution',
      'Add sodium chloride solution',
      'Observe precipitate formation',
      'Filter the precipitate'
    ]
  },
  {
    id: 'simple-distillation',
    name: 'Simple Distillation',
    description: 'Separate water from a salt solution using heat',
    category: 'distillation',
    difficulty: 'advanced',
    expectedOutcome: 'Pure water condenses, salt remains in original flask',
    requiredEquipment: ['salt-water', 'distillation-setup', 'burner', 'thermometer'],
    steps: [
      'Set up distillation apparatus',
      'Heat salt water solution',
      'Collect condensed water',
      'Observe salt residue'
    ]
  }
];

const initialReaction: ChemicalReaction = {
  id: 'main',
  temperature: 20,
  pH: 7,
  color: '#60A5FA', // water blue
  isBoiling: false,
  isBubbling: false,
  hasGasEvolution: false,
  hasPrecipitate: false,
  components: ['water'],
  concentration: 1.0,
  volume: 100,
  pressure: 1.0,
  reactionProgress: 0,
  reactionType: 'none'
};

export const ChemistryLab = () => {
  const [currentReaction, setCurrentReaction] = useState<ChemicalReaction>(initialReaction);
  const [selectedEquipment, setSelectedEquipment] = useState<LabEquipmentItem | null>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentTemplate | null>(null);
  const [isExperimentActive, setIsExperimentActive] = useState(false);
  const [isExperimentRunning, setIsExperimentRunning] = useState(false);
  const [experimentData, setExperimentData] = useState<Array<{time: number, pH: number, temp: number}>>([]);
  const [concentration, setConcentration] = useState(1.0);
  const [heatingPower, setHeatingPower] = useState(0);
  const [stirringSpeed, setStirringSpeed] = useState(0);
  const [challengeMode, setChallengeMode] = useState(false);
  const [prediction, setPrediction] = useState('');

  // Real-time data collection
  useEffect(() => {
    if (isExperimentRunning) {
      const interval = setInterval(() => {
        setExperimentData(prev => [
          ...prev,
          {
            time: prev.length * 0.5, // Every 0.5 seconds
            pH: currentReaction.pH + (Math.random() - 0.5) * 0.1,
            temp: currentReaction.temperature + (Math.random() - 0.5) * 2
          }
        ]);
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isExperimentRunning, currentReaction.pH, currentReaction.temperature]);

  const handleExperimentSelect = useCallback((experimentId: string) => {
    const experiment = experimentTemplates.find(exp => exp.id === experimentId);
    if (experiment) {
      setSelectedExperiment(experiment);
      setCurrentReaction(initialReaction);
      setExperimentData([]);
      toast(`Selected: ${experiment.name}`);
    }
  }, []);

  const handleEquipmentSelect = useCallback((equipment: LabEquipmentItem) => {
    setSelectedEquipment(equipment);
    toast(`Selected ${equipment.name}`);
  }, []);

  const startExperiment = useCallback(() => {
    setIsExperimentRunning(true);
    setExperimentData([]);
    toast("Experiment started - monitoring in real-time");
  }, []);

  const pauseExperiment = useCallback(() => {
    setIsExperimentRunning(false);
    toast("Experiment paused");
  }, []);

  const captureScreenshot = useCallback(() => {
    // In a real implementation, this would capture the canvas
    toast("Screenshot captured!");
  }, []);

  const exportData = useCallback(() => {
    const csvData = experimentData.map(row => `${row.time},${row.pH},${row.temp}`).join('\n');
    const blob = new Blob([`Time(s),pH,Temperature(°C)\n${csvData}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'experiment_data.csv';
    a.click();
    toast("Data exported successfully!");
  }, [experimentData]);

  const handleEquipmentDrop = useCallback((equipment: LabEquipmentItem, position: { x: number; y: number }) => {
    setIsExperimentActive(true);
    
    // Advanced chemical reaction simulation
    const newReaction = { ...currentReaction };
    let reactionOccurred = false;
    
    // Apply concentration effects
    const effectiveConcentration = concentration;
    
    if (equipment.type === 'acid' && !newReaction.components.includes('acid')) {
      newReaction.components.push('acid');
      newReaction.pH = Math.max(0, 7 - (4 * effectiveConcentration));
      newReaction.color = `hsl(${Math.max(0, 240 - effectiveConcentration * 100)}, 70%, 50%)`;
      newReaction.temperature += effectiveConcentration * 5; // Exothermic
      reactionOccurred = true;
      toast(`Added ${equipment.name} - pH: ${newReaction.pH.toFixed(1)}`);
    } 
    else if (equipment.type === 'base' && !newReaction.components.includes('base')) {
      newReaction.components.push('base');
      newReaction.pH = Math.min(14, 7 + (4 * effectiveConcentration));
      newReaction.color = `hsl(${Math.min(240, 180 + effectiveConcentration * 60)}, 70%, 50%)`;
      newReaction.temperature += effectiveConcentration * 3; // Slightly exothermic
      reactionOccurred = true;
      toast(`Added ${equipment.name} - pH: ${newReaction.pH.toFixed(1)}`);
    }
    else if (equipment.type === 'water') {
      // Dilution effect
      newReaction.concentration *= 0.7;
      newReaction.volume += 50;
      newReaction.temperature = Math.max(20, newReaction.temperature - 5);
      toast("Solution diluted - concentration decreased");
    }
    else if (equipment.type === 'burner') {
      newReaction.temperature = Math.min(100, newReaction.temperature + heatingPower * 10);
      if (newReaction.temperature >= 100) {
        newReaction.isBoiling = true;
        toast("Solution is boiling!");
      }
    }

    // Complex reaction logic
    if (newReaction.components.includes('acid') && newReaction.components.includes('base')) {
      // Neutralization reaction
      newReaction.reactionType = 'neutralization';
      newReaction.pH = 7 + (Math.random() - 0.5) * 0.5; // Close to neutral with slight variation
      newReaction.color = '#10B981'; // Green for neutral
      newReaction.isBubbling = true;
      newReaction.hasGasEvolution = false;
      newReaction.temperature += 15; // Heat of neutralization
      newReaction.reactionProgress = Math.min(100, newReaction.reactionProgress + 25);
      
      if (!reactionOccurred) {
        toast("Neutralization complete! Heat released, pH ≈ 7");
      }
    }

    // Gas evolution simulation (acid + carbonate)
    if (newReaction.components.includes('acid') && newReaction.components.includes('carbonate')) {
      newReaction.reactionType = 'gas-evolution';
      newReaction.hasGasEvolution = true;
      newReaction.isBubbling = true;
      newReaction.pH -= 1; // CO2 makes solution more acidic
      newReaction.pressure += 0.2;
      toast("CO2 gas evolving! Vigorous bubbling observed.");
    }

    // Precipitation reaction
    if (newReaction.components.includes('silver-nitrate') && newReaction.components.includes('chloride')) {
      newReaction.reactionType = 'precipitation';
      newReaction.hasPrecipitate = true;
      newReaction.color = '#E5E7EB'; // Cloudy white
      toast("White precipitate forming! AgCl precipitation reaction.");
    }

    // Temperature effects
    if (newReaction.temperature >= 100) {
      newReaction.isBoiling = true;
      if (newReaction.reactionType === 'distillation') {
        toast("Distillation in progress - water vapor condensing");
      }
    }

    setCurrentReaction(newReaction);
    setSelectedEquipment(null);
  }, [currentReaction, concentration, heatingPower]);

  const handleReset = useCallback(() => {
    setCurrentReaction(initialReaction);
    setSelectedEquipment(null);
    setSelectedExperiment(null);
    setIsExperimentActive(false);
    setIsExperimentRunning(false);
    setExperimentData([]);
    setHeatingPower(0);
    setStirringSpeed(0);
    toast("Lab reset - ready for new experiment");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-lab flex flex-col">
      {/* Enhanced Header with Experiment Selection */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-primary">Interactive Chemistry Lab</h1>
              <div className="flex items-center gap-2">
                <Select onValueChange={handleExperimentSelect}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Experiment" />
                  </SelectTrigger>
                  <SelectContent>
                    {experimentTemplates.map((exp) => (
                      <SelectItem key={exp.id} value={exp.id}>
                        {exp.name} ({exp.difficulty})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {!isExperimentRunning ? (
                  <Button onClick={startExperiment} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                ) : (
                  <Button onClick={pauseExperiment} size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
                
                <Button onClick={captureScreenshot} variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </Button>
                
                <Button onClick={exportData} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="hover:bg-destructive/10 hover:text-destructive border-border"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Experiment Information Panel */}
      {selectedExperiment && (
        <div className="container mx-auto px-4 py-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-primary">{selectedExperiment.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  selectedExperiment.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  selectedExperiment.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedExperiment.difficulty}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{selectedExperiment.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Expected Outcome:</h4>
                  <p className="text-xs text-muted-foreground">{selectedExperiment.expectedOutcome}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Required Equipment:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedExperiment.requiredEquipment.map((eq, idx) => (
                      <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                        {eq.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Control Panel */}
      <div className="container mx-auto px-4 py-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Experiment Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Concentration (M)</label>
                <Slider
                  value={[concentration]}
                  onValueChange={(value) => setConcentration(value[0])}
                  max={5}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{concentration.toFixed(1)}M</span>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Heating Power (%)</label>
                <Slider
                  value={[heatingPower]}
                  onValueChange={(value) => setHeatingPower(value[0])}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{heatingPower}%</span>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Stirring Speed (rpm)</label>
                <Slider
                  value={[stirringSpeed]}
                  onValueChange={(value) => setStirringSpeed(value[0])}
                  max={1000}
                  min={0}
                  step={50}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{stirringSpeed} rpm</span>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-sm font-medium mb-2">Reaction Progress</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${currentReaction.reactionProgress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground mt-1">{currentReaction.reactionProgress.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Instructions Banner */}
      <LabInstructions />

      {/* Main Lab Interface */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-400px)] max-w-7xl mx-auto">
          {/* Equipment Sidebar */}
          <div className="lg:col-span-3">
            <EquipmentSidebar
              onEquipmentSelect={handleEquipmentSelect}
              selectedEquipment={selectedEquipment}
              selectedExperiment={selectedExperiment}
            />
          </div>

          {/* Main Lab Canvas - Centered */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <div className="w-full max-w-2xl">
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
        reactionState={currentReaction}
      />
    </div>
  );
};