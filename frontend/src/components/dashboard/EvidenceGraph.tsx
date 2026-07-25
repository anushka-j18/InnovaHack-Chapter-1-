import { useMemo } from 'react';
import { ReactFlow, Controls, Background, MarkerType } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network } from 'lucide-react';

interface EvidenceGraphProps {
  claims: any[];
}

export const EvidenceGraph = ({ claims }: EvidenceGraphProps) => {
  const { nodes, edges } = useMemo(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // Central Question Node
    newNodes.push({
      id: 'root',
      position: { x: 400, y: 50 },
      data: { label: 'Query' },
      style: { background: '#1c1c1f', color: '#fff', border: '1px solid #3b82f6', borderRadius: '8px', padding: '10px' }
    });

    let claimY = 150;
    let sourceY = 250;
    let claimXStart = 100;
    let sourceIdCounter = 100;

    claims.forEach((claim, idx) => {
      const claimId = `claim-${idx}`;
      const isConfirmed = claim.verification_status === 'confirmed';
      const isContradicted = claim.verification_status === 'contradicted';
      
      const borderColor = isConfirmed ? '#10b981' : isContradicted ? '#ef4444' : '#f59e0b';
      
      newNodes.push({
        id: claimId,
        position: { x: claimXStart + (idx * 250), y: claimY },
        data: { label: claim.claim.substring(0, 40) + '...' },
        style: { background: '#141416', color: '#fff', border: `1px solid ${borderColor}`, borderRadius: '8px', padding: '10px', width: 200 }
      });

      newEdges.push({
        id: `e-root-${claimId}`,
        source: 'root',
        target: claimId,
        animated: true,
        style: { stroke: borderColor }
      });

      // Sources
      claim.sources.slice(0, 2).forEach((source: any, sIdx: number) => {
        const sourceId = `source-${sourceIdCounter++}`;
        newNodes.push({
          id: sourceId,
          position: { x: claimXStart + (idx * 250) + (sIdx * 150) - 50, y: sourceY },
          data: { label: new URL(source.url).hostname },
          style: { background: '#2a2a2e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '10px' }
        });

        newEdges.push({
          id: `e-${claimId}-${sourceId}`,
          source: claimId,
          target: sourceId,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#4b5563' },
          style: { stroke: '#4b5563' }
        });
      });
    });

    return { nodes: newNodes, edges: newEdges };
  }, [claims]);

  return (
    <section className="glass-panel p-6 h-[500px] flex flex-col">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Network className="text-primary" />
        Evidence Graph
      </h3>
      <div className="flex-1 rounded-xl overflow-hidden border border-border">
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          fitView
          proOptions={{ hideAttribution: true }}
          className="bg-background"
        >
          <Background color="#2a2a2e" gap={16} />
          <Controls className="!bg-surface !border-border !fill-white" />
        </ReactFlow>
      </div>
    </section>
  );
};
