import { useStock } from "@/context/StockContext";
import { Loader2, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";

const PredictionCard = () => {
  const { prediction, runPrediction, loadingPredict, selectedStock } = useStock();
  const up = prediction?.trend === "UP";
  const confidencePct = Math.max(0, Math.min(100, Number((prediction?.confidence ?? 0) * 100)));

  return (
    <div className="premium-card relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 z-0" />
      
      <div className="relative z-10">
        <div className="card-header-text !mb-4">
          <Zap className="w-5 h-5 text-purple-500" />
          ML Forecast Signal
        </div>

        {prediction ? (
          <div className="flex-1 flex flex-col pt-4">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Price Target</span>
              <span className="text-4xl font-black text-white tabular-nums tracking-tighter">
                ${prediction.predicted_price?.toFixed(2)}
              </span>
            </div>

            <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg w-fit border ${
              up ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}>
              {up ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              <span className="font-black text-sm tracking-widest uppercase">{prediction.trend}</span>
            </div>

            <div className="mt-10">
              <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 mb-2">
                <span>Model Confidence</span>
                <span className="text-white">
                  {confidencePct.toFixed(0)}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden border border-white/10">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                  style={{
                    width: `${confidencePct}%`,
                    background: up ? "#10b981" : "#f43f5e",
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 text-slate-700">
               <Zap className="w-8 h-8" />
            </div>
            <p className="text-xs text-slate-600 font-bold max-w-[200px] leading-relaxed uppercase tracking-wider">Initialize ML Engine to generate price targets.</p>
          </div>
        )}

        <button
          onClick={() => runPrediction()}
          disabled={loadingPredict}
          className="btn-purple w-full mt-10 shadow-xl shadow-purple-100 flex items-center justify-center gap-2"
        >
          {loadingPredict ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Signals...</>
          ) : (
            "Predict Next Session"
          )}
        </button>
      </div>
    </div>
  );
};

export default PredictionCard;
