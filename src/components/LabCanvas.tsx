import { useEffect, useRef, useState } from "react";
import { Engine, Render, World, Bodies, Body, Runner, Events, Mouse, MouseConstraint } from "matter-js";
import { ChemicalReaction, LabEquipmentItem } from "./ChemistryLab";
import Beaker from "./Beaker";
import type { ExperimentState } from "@/types/experiment";
import { cn } from "@/lib/utils";

interface LabCanvasProps {
  reaction: ChemicalReaction;
  selectedEquipment: LabEquipmentItem | null;
  onEquipmentDrop: (equipment: LabEquipmentItem, position: { x: number; y: number }) => void;
  isActive: boolean;
  concentration: number;
  heatingPower: number;
  stirringSpeed: number;
}

export const LabCanvas = ({ reaction, selectedEquipment, onEquipmentDrop, isActive, concentration, heatingPower, stirringSpeed }: LabCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const renderRef = useRef<Render | null>(null);
  const runnerRef = useRef<Runner | null>(null);
  const [beakerBodies, setBeakerBodies] = useState<Body[]>([]);
  const [liquidBodies, setLiquidBodies] = useState<Body[]>([]);
  const [particleBodies, setParticleBodies] = useState<Body[]>([]);
  const [gasParticles, setGasParticles] = useState<Body[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Convert ChemicalReaction to ExperimentState
  const convertToExperimentState = (reaction: ChemicalReaction): ExperimentState => {
    // Map component names to basic categories and estimate volumes
    const names = reaction.components.map(c => c.toLowerCase());

    const acidKeywords = ['hcl', 'hydrochloric', 'nitric', 'nitrate', 'acid'];
    const baseKeywords = ['naoh', 'sodium', 'carbonate', 'base', 'hydroxide', 'chloride'];

    const acidCount = names.filter(n => acidKeywords.some(k => n.includes(k))).length;
    const baseCount = names.filter(n => baseKeywords.some(k => n.includes(k))).length;
    const indicatorAdded = names.some(n => n.includes('indicator')) || names.some(n => n.includes('universal'));

    // Heuristic volumes matching EquipmentSidebar defaults
    const acidVolume = acidCount * 50;
    const baseVolume = baseCount * 50;

    // Determine reaction state based on pH and presence of reagents
    let reactionState: ExperimentState['reactionState'] = 'none';
    if (acidVolume > 0 || baseVolume > 0) {
      if (reaction.pH < 6.5) reactionState = 'acidic';
      else if (reaction.pH > 7.5) reactionState = 'basic';
      else reactionState = 'neutral';
    }

    return {
      acidVolume,
      baseVolume,
      indicatorAdded,
      reactionState,
      pH: reaction.pH,
      temperature: reaction.temperature,
      color: reaction.color,
      isBoiling: reaction.isBoiling,
      isBubbling: reaction.isBubbling,
      hasGasEvolution: reaction.hasGasEvolution,
      hasPrecipitate: reaction.hasPrecipitate,
      components: reaction.components,
      concentration: reaction.concentration,
      volume: reaction.volume,
      pressure: reaction.pressure,
      reactionProgress: reaction.reactionProgress,
      reactionType: reaction.reactionType
    };
  };

  const handleBeakerDrop = (type: 'acid' | 'base' | 'indicator') => {
    // Create a mock equipment item for the drop handler
    const equipment: LabEquipmentItem = {
      id: type === 'acid' ? 'hcl-acid' : type === 'base' ? 'naoh-base' : 'universal-indicator',
      type: type === 'indicator' ? 'water' : type, // Use 'water' as fallback for indicator
      name: type === 'acid' ? 'HCl' : type === 'base' ? 'NaOH' : 'Universal Indicator',
      color: type === 'acid' ? '#EF4444' : type === 'base' ? '#3B82F6' : '#FBBF24',
      icon: 'droplets'
    };

    // Call the original drop handler
    onEquipmentDrop(equipment, { x: 400, y: 400 });
  };

  // Advanced particle system for realistic chemical reactions
  const createParticleSystem = (x: number, y: number, color: string, particleCount: number) => {
    if (!engineRef.current) return [];
    
    const particles: Body[] = [];
    for (let i = 0; i < particleCount; i++) {
      const particle = Bodies.circle(
        x + (Math.random() - 0.5) * 20, 
        y + (Math.random() - 0.5) * 20, 
        Math.random() * 3 + 1,
        {
          render: { 
            fillStyle: color,
            strokeStyle: 'transparent'
          },
          frictionAir: 0.02,
          density: 0.001,
          restitution: 0.8
        }
      );
      particles.push(particle);
    }
    
    World.add(engineRef.current.world, particles);
    return particles;
  };

  // Create gas bubbles for reactions
  const createGasBubbles = (count: number) => {
    if (!engineRef.current) return [];
    
    const bubbles: Body[] = [];
    for (let i = 0; i < count; i++) {
      const bubble = Bodies.circle(
        380 + Math.random() * 40,
        500 + Math.random() * 40,
        Math.random() * 4 + 2,
        {
          render: { 
            fillStyle: 'rgba(255, 255, 255, 0.6)',
            strokeStyle: 'rgba(255, 255, 255, 0.8)',
            lineWidth: 1
          },
          frictionAir: 0.05,
          density: 0.0001, // Very light for buoyancy effect
          restitution: 0.9,
          isSensor: true // Don't collide with other bodies
        }
      );
      
      // Apply upward force to simulate buoyancy
      Body.applyForce(bubble, bubble.position, { x: 0, y: -0.001 });
      bubbles.push(bubble);
    }
    
    World.add(engineRef.current.world, bubbles);
    
    // Remove bubbles after they rise
    setTimeout(() => {
      if (engineRef.current) {
        World.remove(engineRef.current.world, bubbles);
      }
    }, 5000);
    
    return bubbles;
  };

  // Initialize Matter.js physics engine with enhanced features
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = Engine.create();
    engine.world.gravity.y = 0.8;

    const render = Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: 400,
        height: 300,
        wireframes: false,
        background: 'transparent',
        showVelocity: false,
        showAngleIndicator: false,
        showDebug: false,
      }
    });

    // Create enhanced lab environment
    const ground = Bodies.rectangle(200, 280, 400, 40, { 
      isStatic: true,
      render: { fillStyle: '#1f2937' }
    });

    // Multiple beakers for complex experiments
    const mainBeakerLeft = Bodies.rectangle(375, 450, 10, 200, { 
      isStatic: true,
      render: { fillStyle: 'rgba(156, 163, 175, 0.3)' }
    });
    const mainBeakerRight = Bodies.rectangle(425, 450, 10, 200, { 
      isStatic: true,
      render: { fillStyle: 'rgba(156, 163, 175, 0.3)' }
    });
    const mainBeakerBottom = Bodies.rectangle(400, 540, 50, 10, { 
      isStatic: true,
      render: { fillStyle: 'rgba(156, 163, 175, 0.3)' }
    });

    // Secondary equipment
    const testTube = Bodies.rectangle(600, 480, 20, 80, { 
      isStatic: true,
      render: { fillStyle: 'rgba(156, 163, 175, 0.2)' }
    });

    const distillationFlask = Bodies.circle(200, 480, 40, { 
      isStatic: true,
      render: { fillStyle: 'rgba(156, 163, 175, 0.2)' }
    });

    const beakers = [mainBeakerLeft, mainBeakerRight, mainBeakerBottom, testTube, distillationFlask];
    setBeakerBodies(beakers);

    // Enhanced liquid simulation with particle effects
    const liquidParticles: Body[] = [];
    for (let i = 0; i < 15; i++) {
      const liquidParticle = Bodies.circle(
        390 + i * 2,
        520 + Math.random() * 10,
        2,
        {
          render: { fillStyle: reaction.color },
          frictionAir: 0.1,
          density: 0.002,
          restitution: 0.3
        }
      );
      liquidParticles.push(liquidParticle);
    }
    setLiquidBodies(liquidParticles);

    // Add mouse interaction for stirring
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    });

    World.add(engine.world, [ground, ...beakers, ...liquidParticles, mouseConstraint]);

    // Enhanced collision detection for chemical reactions
    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        if (liquidBodies.includes(bodyA) || liquidBodies.includes(bodyB)) {
          // Trigger mixing effects
          console.log('Chemical mixing detected');
        }
      });
    });

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

  // Update liquid properties based on reaction state
  useEffect(() => {
    if (liquidBodies.length > 0 && engineRef.current) {
      liquidBodies.forEach(body => {
        body.render.fillStyle = reaction.color;
        
        // Apply stirring motion
        if (stirringSpeed > 0) {
          const force = stirringSpeed * 0.0001;
          Body.applyForce(body, body.position, {
            x: Math.sin(Date.now() * 0.01) * force,
            y: Math.cos(Date.now() * 0.01) * force
          });
        }
      });
    }
  }, [reaction.color, liquidBodies, stirringSpeed]);

  // Gas evolution effects
  useEffect(() => {
    if (reaction.hasGasEvolution && engineRef.current) {
      const interval = setInterval(() => {
        createGasBubbles(3);
      }, 500);

      return () => clearInterval(interval);
    }
  }, [reaction.hasGasEvolution]);

  // Precipitation effects
  useEffect(() => {
    if (reaction.hasPrecipitate && engineRef.current && particleBodies.length === 0) {
      const precipitate = createParticleSystem(400, 530, '#E5E7EB', 20);
      setParticleBodies(precipitate);
    }
  }, [reaction.hasPrecipitate, particleBodies.length]);

  // Temperature effects on particle motion
  useEffect(() => {
    if (liquidBodies.length > 0 && engineRef.current) {
      const tempFactor = Math.max(0.1, reaction.temperature / 100);
      liquidBodies.forEach(body => {
        // Increase particle motion with temperature
        if (Math.random() < tempFactor * 0.1) {
          Body.applyForce(body, body.position, {
            x: (Math.random() - 0.5) * 0.001 * tempFactor,
            y: (Math.random() - 0.5) * 0.001 * tempFactor
          });
        }
      });
    }
  }, [reaction.temperature, liquidBodies]);

  // Enhanced equipment drop with realistic physics
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedEquipment || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onEquipmentDrop(selectedEquipment, { x, y });

    // Enhanced visual effects based on equipment type
    if (selectedEquipment.type === 'acid' || selectedEquipment.type === 'base') {
      addChemicalDrop(x, y, selectedEquipment.color, selectedEquipment.concentration || 1.0);
    } else if (selectedEquipment.type === 'burner') {
      addHeatSource(x, y);
    } else if (selectedEquipment.type === 'stirrer') {
      addStirrer(x, y);
    } else if (selectedEquipment.type === 'thermometer') {
      addMeasurementTool(x, y, 'thermometer');
    } else if (selectedEquipment.type === 'ph-meter') {
      addMeasurementTool(x, y, 'ph-meter');
    }
  };

  const addChemicalDrop = (x: number, y: number, color: string, concentration: number) => {
    if (!engineRef.current) return;

    // Create multiple drops based on concentration
    const dropCount = Math.floor(concentration * 5);
    const drops: Body[] = [];
    
    for (let i = 0; i < dropCount; i++) {
      const drop = Bodies.circle(
        x + (Math.random() - 0.5) * 10, 
        y + (Math.random() - 0.5) * 10, 
        Math.random() * 4 + 2,
        {
          render: { 
            fillStyle: color,
            strokeStyle: 'rgba(255, 255, 255, 0.3)',
            lineWidth: 1
          },
          frictionAir: 0.05,
          density: 0.002 * concentration,
          restitution: 0.4
        }
      );
      drops.push(drop);
    }

    World.add(engineRef.current.world, drops);

    // Enhanced mixing animation
    setTimeout(() => {
      if (engineRef.current) {
        World.remove(engineRef.current.world, drops);
        // Create mixing effect particles
        createParticleSystem(x, y, color, 10);
      }
    }, 2000);
  };

  const addHeatSource = (x: number, y: number) => {
    if (!engineRef.current) return;

    const heat = Bodies.rectangle(x, y, 60, 20, {
      isStatic: true,
      render: { 
        fillStyle: `hsl(${25 + heatingPower}, 70%, 50%)`,
        strokeStyle: '#ff6b35',
        lineWidth: 2
      },
      isSensor: true
    });

    World.add(engineRef.current.world, heat);

    // Heat effect on nearby liquid particles
    const heatInterval = setInterval(() => {
      if (liquidBodies.length > 0) {
        liquidBodies.forEach(body => {
          const distance = Math.sqrt(
            Math.pow(body.position.x - x, 2) + 
            Math.pow(body.position.y - y, 2)
          );
          
          if (distance < 100) {
            // Apply heat agitation
            Body.applyForce(body, body.position, {
              x: (Math.random() - 0.5) * 0.002 * (heatingPower / 100),
              y: (Math.random() - 0.5) * 0.002 * (heatingPower / 100)
            });
          }
        });
      }
    }, 100);

    setTimeout(() => {
      if (engineRef.current) {
        World.remove(engineRef.current.world, heat);
        clearInterval(heatInterval);
      }
    }, 10000);
  };

  const addStirrer = (x: number, y: number) => {
    if (!engineRef.current) return;

    const stirrer = Bodies.rectangle(x, y, 40, 5, {
      isStatic: true,
      render: { 
        fillStyle: '#8B5CF6',
        strokeStyle: '#7C3AED'
      },
      isSensor: true
    });

    World.add(engineRef.current.world, stirrer);

    // Stirring motion effect
    let angle = 0;
    const stirInterval = setInterval(() => {
      angle += stirringSpeed * 0.01;
      Body.setAngle(stirrer, angle);
      
      // Apply circular force to nearby particles
      liquidBodies.forEach(body => {
        const distance = Math.sqrt(
          Math.pow(body.position.x - x, 2) + 
          Math.pow(body.position.y - y, 2)
        );
        
        if (distance < 50) {
          const forceIntensity = (stirringSpeed / 1000) * 0.001;
          Body.applyForce(body, body.position, {
            x: Math.cos(angle) * forceIntensity,
            y: Math.sin(angle) * forceIntensity
          });
        }
      });
    }, 50);

    setTimeout(() => {
      if (engineRef.current) {
        World.remove(engineRef.current.world, stirrer);
        clearInterval(stirInterval);
      }
    }, 8000);
  };

  const addMeasurementTool = (x: number, y: number, type: 'thermometer' | 'ph-meter') => {
    if (!engineRef.current) return;

    const tool = Bodies.rectangle(x, y, 10, 40, {
      isStatic: true,
      render: { 
        fillStyle: type === 'thermometer' ? '#DC2626' : '#059669',
        strokeStyle: '#374151',
        lineWidth: 1
      },
      isSensor: true
    });

    World.add(engineRef.current.world, tool);

    setTimeout(() => {
      if (engineRef.current) {
        World.remove(engineRef.current.world, tool);
      }
    }, 5000);
  };

  return (
    <div className="relative w-full flex justify-center">
      <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 shadow-lab border border-border/50 w-full max-w-4xl">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Experiment Area</h3>
          <p className="text-sm text-muted-foreground">
            {selectedEquipment 
              ? `Drag and drop ${selectedEquipment.name} to the beaker or click to add` 
              : "Select equipment from the sidebar to begin experiment"
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Enhanced React Beaker Component */}
          <div className="flex justify-center">
            <Beaker 
              experimentState={convertToExperimentState(reaction)}
              onDrop={handleBeakerDrop}
              isDragOver={isDragOver}
            />
          </div>

          {/* Matter.js Physics Canvas for additional effects */}
          <div className="relative bg-gradient-lab rounded-lg overflow-hidden border-2 border-glass-border flex justify-center">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className={cn(
                "cursor-pointer transition-all duration-300 block",
                selectedEquipment && "cursor-crosshair shadow-glow-blue",
                isActive && "animate-glow-pulse"
              )}
              width={400}
              height={300}
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
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-20 h-8 bg-gradient-to-t from-orange-500/20 to-transparent animate-pulse" />
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

        {/* Instructions */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>🧪 Drag chemicals from the sidebar to the beaker, or click on the beaker after selecting equipment</p>
          <p>📊 Watch real-time pH, temperature, and reaction changes</p>
        </div>
      </div>
    </div>
  );
};