
import { BrainCircuit, Search, FileText, CheckCircle2, AlertTriangle, BarChart, FileOutput, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface WorkflowVisualizerProps {
  progress: number;
}

const agents = [
  { id: 'planner', name: 'Planner Agent', icon: BrainCircuit, threshold: 0 },
  { id: 'research', name: 'Research Agent', icon: Search, threshold: 15 },
  { id: 'evidence', name: 'Evidence Agent', icon: FileText, threshold: 30 },
  { id: 'verification', name: 'Verification Agent', icon: CheckCircle2, threshold: 50 },
  { id: 'contradiction', name: 'Contradiction Agent', icon: AlertTriangle, threshold: 65 },
  { id: 'confidence', name: 'Confidence Agent', icon: BarChart, threshold: 80 },
  { id: 'report', name: 'Report Generator', icon: FileOutput, threshold: 95 },
];

export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({ progress }) => {
  return (
    <div className="glass-panel p-6 overflow-x-auto custom-scrollbar">
      <div className="min-w-[900px]">
        <div className="flex items-center justify-between relative px-4 py-8">
          {/* Connecting Line Background */}
          <div className="absolute top-1/2 left-10 right-10 h-1 bg-border -translate-y-1/2 z-0"></div>
          
          {/* Animated Progress Line */}
          <div 
            className="absolute top-1/2 left-10 h-1 bg-gradient-to-r from-primary to-accent -translate-y-1/2 z-0 transition-all duration-300 shadow-glow-primary"
            style={{ width: `calc(${progress}% - 2.5rem)` }}
          ></div>

          {agents.map((agent, index) => {
            const isComplete = progress >= agent.threshold + 10;
            const isActive = progress >= agent.threshold && progress < agent.threshold + 15;

            return (
              <div key={agent.id} className="relative z-10 flex flex-col items-center group">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 relative
                    ${isComplete ? 'bg-success/20 text-success border border-success/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 
                      isActive ? 'bg-primary/20 text-primary border border-primary/50 shadow-glow-primary' : 
                      'bg-surface border border-border text-gray-500'}`}
                >
                  {isComplete ? (
                    <Check size={24} className="animate-fade-in" />
                  ) : (
                    <agent.icon size={24} className={isActive ? 'animate-pulse' : ''} />
                  )}
                  
                  {/* Processing Ring */}
                  {isActive && (
                    <div className="absolute inset-[-4px] rounded-2xl border-2 border-primary/50 border-t-transparent animate-spin"></div>
                  )}
                </motion.div>
                
                <div className="absolute top-16 w-32 text-center">
                  <p className={`text-sm font-medium transition-colors duration-300 ${isActive || isComplete ? 'text-white' : 'text-gray-500'}`}>
                    {agent.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isComplete ? 'Done' : isActive ? 'Processing...' : 'Waiting'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
