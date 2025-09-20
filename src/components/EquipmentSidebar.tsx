import { LabEquipmentItem, ExperimentTemplate } from "./ChemistryLab";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Beaker, 
  Flame, 
  Droplets,
  TestTube,
  FlaskConical,
  Eye,
  Thermometer,
  Zap,
  Activity,
  Gauge,
  FlaskRound,
  Filter
} from "lucide-react";

interface EquipmentSidebarProps {
  onEquipmentSelect: (equipment: LabEquipmentItem) => void;
  selectedEquipment: LabEquipmentItem | null;
  selectedExperiment: ExperimentTemplate | null;
}

const labEquipment: LabEquipmentItem[] = [
  // Chemicals
  {
    id: 'hcl-acid',
    type: 'acid',
    name: 'HCl (Hydrochloric Acid)',
    color: '#EF4444',
    icon: 'droplets',
    concentration: 1.0,
    volume: 50
  },
  {
    id: 'naoh-base',
    type: 'base',
    name: 'NaOH (Sodium Hydroxide)',
    color: '#3B82F6',
    icon: 'droplets',
    concentration: 1.0,
    volume: 50
  },
  {
    id: 'distilled-water',
    type: 'water',
    name: 'Distilled Water',
    color: '#60A5FA',
    icon: 'droplets',
    volume: 100
  },
  {
    id: 'sodium-carbonate',
    type: 'base',
    name: 'Na₂CO₃ (Sodium Carbonate)',
    color: '#8B5CF6',
    icon: 'droplets',
    concentration: 0.5
  },
  {
    id: 'silver-nitrate',
    type: 'acid',
    name: 'AgNO₃ (Silver Nitrate)',
    color: '#6B7280',
    icon: 'droplets',
    concentration: 0.1
  },
  {
    id: 'sodium-chloride',
    type: 'base',
    name: 'NaCl (Sodium Chloride)',
    color: '#F3F4F6',
    icon: 'droplets',
    concentration: 1.0
  },
  {
    id: 'universal-indicator',
    type: 'water',
    name: 'Universal Indicator',
    color: '#FBBF24',
    icon: 'eye',
    volume: 5
  },
  
  // Glassware & Equipment
  {
    id: 'glass-beaker',
    type: 'beaker',
    name: 'Glass Beaker (250mL)',
    color: '#9CA3AF',
    icon: 'beaker'
  },
  {
    id: 'test-tube',
    type: 'test-tube',
    name: 'Test Tube',
    color: '#9CA3AF',
    icon: 'testTube'
  },
  {
    id: 'bunsen-burner',
    type: 'burner',
    name: 'Bunsen Burner',
    color: '#F59E0B',
    icon: 'flame'
  },
  {
    id: 'dropper',
    type: 'dropper',
    name: 'Precision Dropper',
    color: '#8B5CF6',
    icon: 'eye'
  },
  
  // Measurement Tools
  {
    id: 'thermometer',
    type: 'thermometer',
    name: 'Digital Thermometer',
    color: '#DC2626',
    icon: 'thermometer'
  },
  {
    id: 'ph-meter',
    type: 'ph-meter',
    name: 'pH Meter',
    color: '#059669',
    icon: 'gauge'
  },
  {
    id: 'magnetic-stirrer',
    type: 'stirrer',
    name: 'Magnetic Stirrer',
    color: '#7C3AED',
    icon: 'activity'
  },
  
  // Advanced Equipment
  {
    id: 'funnel',
    type: 'funnel',
    name: 'Separation Funnel',
    color: '#6B7280',
    icon: 'funnel'
  },
  {
    id: 'distillation-setup',
    type: 'distillation-setup',
    name: 'Distillation Apparatus',
    color: '#1F2937',
    icon: 'filter'
  }
];

const getIcon = (iconName: string) => {
  const iconMap = {
    droplets: Droplets,
    beaker: Beaker,
    flame: Flame,
    eye: Eye,
    testTube: TestTube,
    flask: FlaskConical,
    thermometer: Thermometer,
    gauge: Gauge,
    activity: Activity,
    funnel: FlaskRound,
    filter: Filter,
    zap: Zap
  };
  return iconMap[iconName as keyof typeof iconMap] || Droplets;
};

export const EquipmentSidebar = ({ onEquipmentSelect, selectedEquipment, selectedExperiment }: EquipmentSidebarProps) => {
  // Filter equipment based on selected experiment
  const getFilteredEquipment = () => {
    if (!selectedExperiment) return labEquipment;
    
    const required = selectedExperiment.requiredEquipment;
    const filteredEquipment = labEquipment.filter(eq => 
      required.some(req => req.includes(eq.id.split('-')[0]) || req === eq.id)
    );
    
    // Also include basic equipment
    const basicEquipment = labEquipment.filter(eq => 
      ['glass-beaker', 'distilled-water', 'bunsen-burner', 'dropper'].includes(eq.id)
    );
    
    return [...new Set([...filteredEquipment, ...basicEquipment])];
  };

  const filteredEquipment = getFilteredEquipment();

  const getEquipmentCategory = (equipment: LabEquipmentItem) => {
    if (['hcl-acid', 'naoh-base', 'distilled-water', 'sodium-carbonate', 'silver-nitrate', 'sodium-chloride'].includes(equipment.id)) {
      return 'Chemicals';
    }
    if (['glass-beaker', 'test-tube', 'funnel', 'distillation-setup'].includes(equipment.id)) {
      return 'Glassware';
    }
    if (['thermometer', 'ph-meter', 'magnetic-stirrer'].includes(equipment.id)) {
      return 'Instruments';
    }
    return 'Tools';
  };

  const groupedEquipment = filteredEquipment.reduce((acc, equipment) => {
    const category = getEquipmentCategory(equipment);
    if (!acc[category]) acc[category] = [];
    acc[category].push(equipment);
    return acc;
  }, {} as Record<string, LabEquipmentItem[]>);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lab h-full overflow-hidden">
      <div className="p-6 h-full flex flex-col">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary" />
          Lab Equipment
          {selectedExperiment && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {selectedExperiment.name}
            </Badge>
          )}
        </h3>
        
        <div className="flex-1 overflow-y-auto space-y-6">
          {Object.entries(groupedEquipment).map(([category, equipment]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                {category}
              </h4>
              <div className="space-y-2">
                {equipment.map((item) => {
                  const IconComponent = getIcon(item.icon);
                  const isSelected = selectedEquipment?.id === item.id;
                  const isRequired = selectedExperiment?.requiredEquipment.some(req => 
                    req.includes(item.id.split('-')[0]) || req === item.id
                  );
                  
                  return (
                    <Button
                      key={item.id}
                      onClick={() => onEquipmentSelect(item)}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-auto p-3 transition-all duration-200 text-left",
                        "border border-border/50 hover:border-primary/50",
                        "hover:bg-primary/10 hover:shadow-equipment",
                        isSelected && "bg-primary/20 border-primary shadow-glow-blue",
                        isSelected && "animate-equipment-drag",
                        isRequired && "ring-2 ring-green-500/50"
                      )}
                      draggable={item.type === 'acid' || item.type === 'base' || item.type === 'water'}
                      onDragStart={(e) => {
                        if (item.type === 'acid' || item.type === 'base') {
                          e.dataTransfer.setData('text/plain', item.type);
                        } else if (item.type === 'water' && item.name.includes('Indicator')) {
                          e.dataTransfer.setData('text/plain', 'indicator');
                        }
                      }}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${item.color}20` }}
                        >
                          <IconComponent 
                            className="w-4 h-4" 
                            style={{ color: item.color }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {item.name}
                            </span>
                            {isRequired && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Required
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.concentration && (
                              <span>Conc: {item.concentration}M</span>
                            )}
                            {item.volume && (
                              <span className={item.concentration ? "ml-2" : ""}>
                                Vol: {item.volume}mL
                              </span>
                            )}
                            {!item.concentration && !item.volume && (
                              <span className="capitalize">{item.type.replace('-', ' ')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {selectedEquipment && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-sm font-medium text-primary mb-1">
              Selected: {selectedEquipment.name}
            </div>
            <div className="text-xs text-muted-foreground">
              Click on the experiment area to add this item
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};