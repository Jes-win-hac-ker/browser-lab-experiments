export interface ExperimentState {
  acidVolume: number;
  baseVolume: number;
  indicatorAdded: boolean;
  reactionState: 'none' | 'acidic' | 'basic' | 'neutral';
  pH: number;
  temperature: number;
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
