import { LabEquipmentItem } from "./ChemistryLab";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  Beaker, 
  Flame, 
  Droplets,
  TestTube,
  FlaskConical,
  Eye
} from "lucide-react";

interface EquipmentSidebarProps {
  onEquipmentSelect: (equipment: LabEquipmentItem) => void;
  selectedEquipment: LabEquipmentItem | null;
}

const labEquipment: LabEquipmentItem[] = [
  {
    id: 'hcl-acid',
    type: 'acid',
    name: 'HCl (Acid)',
    color: '#EF4444',
    icon: 'droplets'
  },
  {
    id: 'naoh-base',
    type: 'base',
    name: 'NaOH (Base)',
    color: '#3B82F6',
    icon: 'droplets'
  },
  {
    id: 'distilled-water',
    type: 'water',
    name: 'Distilled Water',
    color: '#60A5FA',
    icon: 'droplets'
  },
  {
    id: 'glass-beaker',
    type: 'beaker',
    name: 'Glass Beaker',
    color: '#9CA3AF',
    icon: 'beaker'
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
    name: 'Dropper',
    color: '#8B5CF6',
    icon: 'eye'
  }
];

const getIcon = (iconName: string) => {
  const iconMap = {
    droplets: Droplets,
    beaker: Beaker,
    flame: Flame,
    eye: Eye,
    testTube: TestTube,
    flask: FlaskConical
  };
  return iconMap[iconName as keyof typeof iconMap] || Droplets;
};

export const EquipmentSidebar = ({ onEquipmentSelect, selectedEquipment }: EquipmentSidebarProps) => {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lab">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary" />
          Lab Equipment
        </h3>
        
        <div className="space-y-3">
          {labEquipment.map((equipment) => {
            const IconComponent = getIcon(equipment.icon);
            const isSelected = selectedEquipment?.id === equipment.id;
            
            return (
              <Button
                key={equipment.id}
                onClick={() => onEquipmentSelect(equipment)}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto p-4 transition-all duration-200",
                  "border border-border/50 hover:border-primary/50",
                  "hover:bg-primary/10 hover:shadow-equipment",
                  isSelected && "bg-primary/20 border-primary shadow-glow-blue",
                  isSelected && "animate-equipment-drag"
                )}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="relative">
                    <IconComponent 
                      className={cn(
                        "w-6 h-6 transition-colors",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )} 
                    />
                    <div 
                      className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background"
                      style={{ backgroundColor: equipment.color }}
                    />
                  </div>
                  
                  <div className="text-left flex-1">
                    <div className={cn(
                      "font-medium text-sm",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {equipment.name}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {equipment.type}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              </Button>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border/30">
          <h4 className="font-medium text-sm text-foreground mb-2">Instructions:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Click to select equipment</li>
            <li>• Click on canvas to use</li>
            <li>• Mix acids & bases to see reactions</li>
            <li>• Use burner to heat solutions</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};