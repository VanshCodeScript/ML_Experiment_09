import { useStock } from "@/context/StockContext";
import { MessageSquareQuote, Info } from "lucide-react";

const WhyPredictionPanel = () => {
  const { prediction, marketState } = useStock();

  const reasons = prediction?.reasons || [];
  const midPoint = Math.ceil(reasons.length / 2);
  const leftReasons = reasons.slice(0, midPoint);
  const rightReasons = reasons.slice(midPoint);

  return (
    <div className="premium-card flex flex-col">
      <div className="card-header-text">
        <MessageSquareQuote className="w-5 h-5 text-purple-500" />
        Analysis Narrative
      </div>

      {!prediction ? (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl p-8">
          <p className="text-xs text-slate-700 font-bold uppercase tracking-wider text-center">Narrative drivers pending...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Dominant Strengths</h4>
              <ul className="space-y-2">
                {leftReasons.length > 0 ? leftReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-400 font-medium">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0Shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span>{reason}</span>
                  </li>
                )) : (
                  <li className="text-xs text-slate-700 italic font-medium">No major strengths detected</li>
                )}
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
               <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3">Critical Risks</h4>
               <ul className="space-y-2">
                {rightReasons.length > 0 ? rightReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-400 font-medium">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                    <span>{reason}</span>
                  </li>
                )) : (
                  <li className="text-xs text-slate-700 italic font-medium">Market structural stability (PC2 Low)</li>
                )}
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
               <span>State: </span>
               <span className="text-white">{marketState || "Stable"}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-700 font-bold">
              <Info className="w-3 h-3" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhyPredictionPanel;
