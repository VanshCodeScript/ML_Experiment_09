import { useStock } from "@/context/StockContext";
import { GitCompare, ArrowDown, Loader2 } from "lucide-react";

const RawVsPCAPanel = () => {
  const { dimensionReduction, loadingAnalyze } = useStock();

  if (loadingAnalyze) {
    return (
      <div className="premium-card">
        <div className="card-header-text">
          <GitCompare className="w-5 h-5 text-purple-500" />
          Dimensionality Reduction
        </div>
        <div className="h-[160px] flex items-center justify-center text-slate-700">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      </div>
    );
  }

  if (!dimensionReduction) {
    return (
      <div className="premium-card">
        <div className="card-header-text">
          <GitCompare className="w-5 h-5 text-purple-500" />
          Dimensionality Reduction
        </div>
        <div className="h-[160px] flex items-center justify-center text-xs text-slate-700 uppercase font-black tracking-widest">
          Awaiting scan...
        </div>
      </div>
    );
  }

  const { raw_features, pca_components, reduction_pct, variance_retained } = dimensionReduction;

  return (
    <div className="premium-card">
      <div className="card-header-text">
        <GitCompare className="w-5 h-5 text-purple-500" />
        Dimensionality Reduction
      </div>

      <div className="flex items-center justify-center gap-6 py-4">
        {/* Raw features */}
        <div className="text-center">
          <div className="text-3xl font-black text-white tabular-nums">{raw_features}</div>
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Raw Features</div>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center gap-1">
          <ArrowDown className="w-5 h-5 text-purple-500 animate-bounce" />
          <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">PCA</span>
        </div>

        {/* PCA components */}
        <div className="text-center">
          <div className="text-3xl font-black text-purple-400 tabular-nums">{pca_components}</div>
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Components</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
          <div className="text-lg font-black text-emerald-400 tabular-nums">{reduction_pct}%</div>
          <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Reduction</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
          <div className="text-lg font-black text-sky-400 tabular-nums">{variance_retained}%</div>
          <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Variance Kept</div>
        </div>
      </div>
    </div>
  );
};

export default RawVsPCAPanel;
