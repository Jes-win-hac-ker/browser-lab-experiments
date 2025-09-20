import React from 'react';
import { cn } from '@/lib/utils';
import type { ExperimentState } from '@/types/experiment';

interface BeakerProps {
  experimentState: ExperimentState;
  onDrop: (type: 'acid' | 'base' | 'indicator') => void;
  isDragOver?: boolean;
}

const Beaker: React.FC<BeakerProps> = ({ experimentState, onDrop, isDragOver = false }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain') as 'acid' | 'base' | 'indicator';
    if (type) {
      onDrop(type);
    }
  };

  const getSolutionColor = () => {
    if (experimentState.reactionState === 'none') return 'transparent';
    
    switch (experimentState.reactionState) {
      case 'acidic':
        return 'bg-red-500/80';
      case 'basic':
        return 'bg-blue-500/80';
      case 'neutral':
        return 'bg-green-500/80';
      default:
        return 'transparent';
    }
  };

  const getSolutionLevel = () => {
    const totalVolume = experimentState.acidVolume + experimentState.baseVolume;
    if (totalVolume === 0) return 0;
    
    // Scale to beaker capacity (max 100%)
    const percentage = Math.min((totalVolume / 20) * 100, 90); // Max 20mL for full beaker
    return percentage;
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Reaction Beaker</h3>
      
      <div
        className={cn(
          'relative w-48 h-64 border-4 border-gray-400 rounded-b-3xl',
          'bg-white/10 backdrop-blur-sm transition-all duration-300',
          isDragOver && 'border-primary shadow-lg scale-105',
          'overflow-hidden'
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Measurement marks */}
        <div className="absolute left-2 top-0 h-full flex flex-col justify-evenly text-xs text-muted-foreground">
          <span>20mL</span>
          <span>15mL</span>
          <span>10mL</span>
          <span>5mL</span>
        </div>

        {/* Solution */}
        <div 
          className={cn(
            'absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out',
            getSolutionColor()
          )}
          style={{ height: `${getSolutionLevel()}%` }}
        >
          {/* Bubble effects */}
          {experimentState.reactionState !== 'none' && experimentState.isBubbling && (
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-2 left-4 w-2 h-2 bg-white rounded-full animate-pulse" />
              <div className="absolute top-6 right-6 w-1 h-1 bg-white rounded-full animate-pulse delay-300" />
              <div className="absolute top-10 left-8 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-500" />
              <div className="absolute top-4 right-4 w-1 h-1 bg-white rounded-full animate-pulse delay-700" />
              <div className="absolute top-8 left-6 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-1000" />
            </div>
          )}
        </div>

        {/* Drop zone indicator */}
        {isDragOver && (
          <div className="absolute inset-0 border-2 border-dashed border-primary bg-primary/10 rounded-b-3xl flex items-center justify-center">
            <span className="text-primary font-semibold">Drop chemicals here</span>
          </div>
        )}

        {/* Beaker spout */}
        <div className="absolute -top-2 right-4 w-8 h-4 bg-gray-400 rounded-t-lg border-2 border-gray-400" />
      </div>

      {/* Status display */}
      <div className="mt-4 text-center">
        <div className="flex gap-4 text-sm">
          <span>Acid: {experimentState.acidVolume}mL</span>
          <span>Base: {experimentState.baseVolume}mL</span>
          {experimentState.indicatorAdded && <span className="text-yellow-500">Indicator ✓</span>}
        </div>
        <div className="mt-2">
          <span className={cn(
            'px-3 py-1 rounded-full text-sm font-semibold',
            experimentState.reactionState === 'acidic' && 'bg-red-500 text-white',
            experimentState.reactionState === 'basic' && 'bg-blue-500 text-white',
            experimentState.reactionState === 'neutral' && 'bg-green-500 text-white',
            experimentState.reactionState === 'none' && 'bg-muted text-muted-foreground'
          )}>
            {experimentState.reactionState === 'none' ? 'No Reaction' : 
             experimentState.reactionState === 'neutral' ? `Neutral (pH ≈ ${experimentState.pH.toFixed(1)})` :
             experimentState.reactionState === 'acidic' ? `Acidic (pH ${experimentState.pH.toFixed(1)})` :
             `Basic (pH ${experimentState.pH.toFixed(1)})`}
          </span>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Temperature: {experimentState.temperature.toFixed(1)}°C
        </div>
      </div>
    </div>
  );
};

export default Beaker;
