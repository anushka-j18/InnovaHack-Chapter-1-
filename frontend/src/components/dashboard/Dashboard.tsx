import { ShieldCheck, AlertCircle, FileCheck2, BarChart2 } from 'lucide-react';
import { EvidenceGraph } from './EvidenceGraph';

interface DashboardProps {
  data: any;
}

export const Dashboard = ({ data }: DashboardProps) => {
  // Extract info from final state
  const verifiedClaims = data.resolved_claims.filter(
    (c: any) => c.verification_status === 'confirmed' || c.verification_status === 'partially_confirmed'
  );
  
  const conflictingClaims = data.resolved_claims.filter(
    (c: any) => c.verification_status === 'contradicted'
  );
  
  const sourcesCount = new Set(data.resolved_claims.flatMap((c: any) => c.sources.map((s: any) => s.url))).size;
  
  // Calculate average confidence for confirmed/partially_confirmed
  const validScores = verifiedClaims.map((c: any) => c.confidence_score).filter((s: any) => s > 0);
  const avgConfidence = validScores.length > 0 
    ? Math.round(validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <section className="glass-panel p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileCheck2 className="text-primary" />
          Final Report
        </h3>
        <div className="text-gray-300 leading-relaxed text-lg relative z-10 whitespace-pre-wrap">
          {data.final_report}
        </div>
      </section>

      {/* Two Column Layout for Metrics & Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Claims & Contradictions */}
        <div className="lg:col-span-2 space-y-6">
          
          <section className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck className="text-success" />
              Verified Claims
            </h3>
            <div className="space-y-4">
              {verifiedClaims.length > 0 ? verifiedClaims.map((claim: any, idx: number) => (
                <div key={idx} className="bg-surface border border-border rounded-xl p-4 hover:border-success/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-white">{claim.claim}</h4>
                    <span className="px-2 py-1 bg-success/10 text-success border border-success/20 rounded-md text-xs font-semibold">
                      {claim.confidence_score}% Confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{claim.confidence_reasoning}</p>
                  <div className="flex gap-2 text-xs text-gray-500 overflow-x-auto pb-1">
                    {claim.sources.map((s: any, sIdx: number) => (
                      <span key={sIdx} className="bg-surfaceHover px-2 py-1 rounded truncate max-w-[200px]" title={s.url}>
                        {new URL(s.url).hostname} ({s.reliability})
                      </span>
                    ))}
                  </div>
                </div>
              )) : (
                <p className="text-gray-400">No verified claims found.</p>
              )}
            </div>
          </section>

          <section className="glass-panel p-6 border-warning/20">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-warning">
              <AlertCircle />
              Conflicting Evidence
            </h3>
            <div className="space-y-4">
              {conflictingClaims.length > 0 ? conflictingClaims.map((claim: any, idx: number) => (
                <div key={idx} className="bg-surface border border-warning/30 rounded-xl p-4">
                  <h4 className="font-medium text-white mb-3">{claim.claim}</h4>
                  <div className="mt-3 p-3 bg-warning/5 rounded-lg border border-warning/10 text-sm">
                    <span className="text-warning font-semibold">AI Notes:</span> {claim.confidence_reasoning || "Contradicted by multiple sources."}
                  </div>
                </div>
              )) : (
                <p className="text-gray-400">No major contradictions found in the research.</p>
              )}
            </div>
          </section>

        </div>

        {/* Right Column: Stats & Confidence */}
        <div className="space-y-6">
          <section className="glass-panel p-6 flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold mb-6 w-full text-left flex items-center gap-2">
              <BarChart2 className="text-primary" />
              Overall Confidence
            </h3>
            
            <div className="relative w-40 h-40 mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-surfaceHover" />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" stroke="currentColor" strokeWidth="8" 
                  strokeDasharray="283" 
                  strokeDashoffset={283 - (283 * avgConfidence) / 100} 
                  className="text-primary drop-shadow-glow-primary transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{avgConfidence}%</span>
                <span className="text-xs text-gray-400 uppercase tracking-widest mt-1">
                  {avgConfidence > 80 ? 'High' : avgConfidence > 50 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 text-left">
              <div className="bg-surface p-3 rounded-xl border border-border">
                <div className="text-2xl font-semibold text-white">{sourcesCount}</div>
                <div className="text-xs text-gray-400">Sources Analyzed</div>
              </div>
              <div className="bg-surface p-3 rounded-xl border border-border">
                <div className="text-2xl font-semibold text-white">{conflictingClaims.length}</div>
                <div className="text-xs text-gray-400">Contradictions</div>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      {/* Evidence Graph Section */}
      <EvidenceGraph claims={data.resolved_claims} />
    </div>
  );
};
