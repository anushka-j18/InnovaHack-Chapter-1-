import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WorkflowVisualizer } from '../shared/WorkflowVisualizer';
import { Dashboard } from '../dashboard/Dashboard';

interface ResearchViewProps {
  query: string;
}

export const ResearchView: React.FC<ResearchViewProps> = ({ query }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [finalState, setFinalState] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when query changes
    setProgress(0);
    setIsComplete(false);
    setFinalState(null);
    setError(null);

    const startResearch = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/research', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic: query }),
        });

        if (!response.body) throw new Error('ReadableStream not yet supported in this browser.');

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        // Simple mapping from node names to progress percentage
        const nodeProgressMap: Record<string, number> = {
          'planner': 10,
          'researcher': 30,
          'evidence_evaluator': 50,
          'verification': 70,
          'contradiction_checker': 80,
          'confidence_scorer': 90,
          'report_generator': 100,
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          let currentEvent = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.substring(7).trim();
            } else if (line.startsWith('data: ')) {
              const dataStr = line.substring(6).trim();
              if (dataStr) {
                const data = JSON.parse(dataStr);
                if (currentEvent === 'node_update') {
                  const nodeName = data.node;
                  if (nodeProgressMap[nodeName]) {
                    setProgress(nodeProgressMap[nodeName]);
                  }
                } else if (currentEvent === 'complete') {
                  setProgress(100);
                  setFinalState(data);
                  setTimeout(() => setIsComplete(true), 500);
                } else if (currentEvent === 'error') {
                  setError(data.detail);
                }
              }
            }
          }
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during research.');
      }
    };

    startResearch();
  }, [query]);

  return (
    <div className="flex flex-col min-h-full space-y-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Research Session</h2>
          <p className="text-gray-400 text-lg flex items-center gap-2">
            <span className="text-primary">Query:</span> "{query}"
          </p>
        </div>
      </div>

      <WorkflowVisualizer progress={progress} />

      {error ? (
        <div className="p-4 bg-error/20 border border-error/50 rounded-xl text-error">
          <h3 className="font-bold">Research Error</h3>
          <p>{error}</p>
        </div>
      ) : isComplete && finalState ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Dashboard data={finalState} />
        </motion.div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-white/5 rounded-3xl bg-surface/30 backdrop-blur-md">
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div 
              className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
            </div>
          </div>
          <h3 className="text-xl font-medium text-white mb-2 animate-pulse">Synthesizing Information...</h3>
          <p className="text-gray-400">Our agents are actively researching your query across multiple sources.</p>
        </div>
      )}
    </div>
  );
};
