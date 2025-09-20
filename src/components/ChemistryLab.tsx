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

// ... (keep all the interfaces and initial data)

export const ChemistryLab = () => {
  // ... (keep all the state and handlers)

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
