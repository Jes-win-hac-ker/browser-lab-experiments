import { useEffect, useRef, useState } from "react";
import { Engine, Render, World, Bodies, Body, Runner, Events } from "matter-js";
import { ChemicalReaction, LabEquipmentItem } from "./ChemistryLab";
import { cn } from "@/lib/utils";

interface LabCanvasProps {
  reaction: ChemicalReaction;
  selectedEquipment: LabEquipmentItem | null;
  onEquipmentDrop: (equipment: LabEquipmentItem, position: { x: number; y: number }) => void;
  isActive: boolean;
}

export const LabCanvas = ({ reaction, selectedEquipment, onEquipmentDrop, isActive }: LabCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const renderRef = useRef<Render | null>(null);
  const runnerRef = useRef<Runner | null>(null);
  const [beakerBodies, setBeakerBodies] = useState<Body[]>([]);
  const [liquidBodies, setLiquidBodies] = useState<Body[]>([]);

  // Initialize Matter.js physics engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = Engine.create();
    engine.world.gravity.y = 0.8;

    const render = Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: 'transparent',
        showVelocity: false,
        showAngleIndicator: false,
      }
    });

    // Create lab table (ground)
    const ground = Bodies.rectangle(400, 580, 800, 40, { 
      isStatic: true,
      render: { fillStyle: '#1f2937' }
    });

    // Create glass beaker (centered at 400px horizontally)
    const beakerLeft = Bodies.rectangle(375, 450, 10, 200, { 
      isStatic: true,
      render: { fillStyle: 'rgba(156, 163, 175, 0.3)' }
    });
    const beakerRight = Bodies.rectangle(425, 450, 10, 200, { 
      isStatic: true,
      render: { fillStyle: 'rgba(156, 163, 175, 0.3)' }
    });
    const beakerBottom = Bodies.rectangle(400, 540, 50, 10, { 
      isStatic: true,
      render: { fillStyle: 'rgba(156, 163, 175, 0.3)' }
    });

    const beakers = [beakerLeft, beakerRight, beakerBottom];
    setBeakerBodies(beakers);

    // Add initial water (centered and smaller to fit beaker)
    const initialLiquid = Bodies.rectangle(400, 520, 40, 20, {
      render: { fillStyle: reaction.color },
      frictionAir: 0.1,
      density: 0.001
    });
    setLiquidBodies([initialLiquid]);

    World.add(engine.world, [ground, ...beakers, initialLiquid]);

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    engineRef.current = engine;
    renderRef.current = render;
    runnerRef.current = runner;

    return () => {
      if (renderRef.current) {
        Render.stop(renderRef.current);
      }
      if (runnerRef.current && engineRef.current) {
        Runner.stop(runnerRef.current);
      }
      if (engineRef.current) {
        Engine.clear(engineRef.current);
      }
    };
  }, []);

  // Update liquid color when reaction changes
  useEffect(() => {
    if (liquidBodies.length > 0 && engineRef.current) {
      liquidBodies.forEach(body => {
        body.render.fillStyle = reaction.color;
      });
    }
  }, [reaction.color, liquidBodies]);

  // Handle equipment drop
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedEquipment || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onEquipmentDrop(selectedEquipment, { x, y });

    // Add visual effects based on equipment type
    if (selectedEquipment.type === 'acid' || selectedEquipment.type === 'base') {
      addChemicalDrop(x, y, selectedEquipment.color);
    } else if (selectedEquipment.type === 'burner') {
      addHeatSource(x, y);
    }
  };

  const addChemicalDrop = (x: number, y: number, color: string) => {
    if (!engineRef.current) return;

    const drop = Bodies.circle(x, y, 8, {
      render: { fillStyle: color },
      frictionAir: 0.05,
      density: 0.002
    });

    World.add(engineRef.current.world, drop);

    // Remove drop after animation
    setTimeout(() => {
      if (engineRef.current) {
        World.remove(engineRef.current.world, drop);
      }
    }, 3000);
  };

  const addHeatSource = (x: number, y: number) => {
    if (!engineRef.current) return;

    const heat = Bodies.rectangle(x, y, 60, 20, {
      isStatic: true,
      render: { fillStyle: '#f59e0b' },
      isSensor: true
    });

    World.add(engineRef.current.world, heat);

    // Remove heat source after some time
    setTimeout(() => {
      if (engineRef.current) {
        World.remove(engineRef.current.world, heat);
      }
    }, 5000);
  };

  return (
    <div className="relative">
      <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 shadow-lab border border-border/50">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">Experiment Area</h3>
          <p className="text-sm text-muted-foreground">
            {selectedEquipment 
              ? `Click to add ${selectedEquipment.name} to the beaker` 
              : "Select equipment from the sidebar to begin experiment"
            }
          </p>
        </div>

        <div className="relative bg-gradient-lab rounded-lg overflow-hidden border-2 border-glass-border">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className={cn(
              "cursor-pointer transition-all duration-300",
              selectedEquipment && "cursor-crosshair shadow-glow-blue",
              isActive && "animate-glow-pulse"
            )}
            width={800}
            height={600}
          />

          {/* Bubble effects */}
          {reaction.isBubbling && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-white/30 rounded-full animate-bubble-rise"
                  style={{
                    left: `${45 + i * 2}%`,
                    bottom: '35%',
                    animationDelay: `${i * 0.3}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Heat shimmer effect */}
          {reaction.isBoiling && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-20 h-8 bg-gradient-to-t from-temp-hot/20 to-transparent animate-heat-shimmer" />
            </div>
          )}

          {/* Equipment preview when selected */}
          {selectedEquipment && (
            <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: selectedEquipment.color }}
                />
                <span className="text-sm font-medium">{selectedEquipment.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};