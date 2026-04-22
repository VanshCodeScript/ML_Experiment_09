import { useStock } from "@/context/StockContext";
import { Link2, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";

const STRENGTH_WIDTH = { strong: "w-full", moderate: "w-2/3", weak: "w-1/3" };
const IMPACT_STYLE = {
  bullish: { text: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", icon: TrendingUp },
  bearish: { text: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10", icon: TrendingDown },
};

const PCAPredictionExplainer = () => {
  const { pcaPredictionLink, prediction, loadingAnalyze } = useStock();

  return (
    <div className="premium-card">
      <div className="card-header-text">
        <Link2 className="w-5 h-5 text-purple-500" />
        PCA → Prediction Chain
      </div>

      {loadingAnalyze ? (
        <div className="h-[200px] flex items-center justify-center text-slate-700">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : !pcaPredictionLink?.length ? (
        <div className="h-[200px] flex items-center justify-center text-xs text-slate-700 uppercase font-black tracking-widest">
          Initialize scan to see prediction chain
        </div>
      ) : (
        <div className="space-y-3">
          {pcaPredictionLink.map((link, i) => {
            const style = IMPACT_STYLE[link.impact] || IMPACT_STYLE.bullish;
            const Icon = style.icon;
            return (
              <div
                key={link.component}
                className={`rounded-xl border p-4 ${style.border} ${style.bg} transition-all hover:brightness-110`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{link.component}</span>
                      <span className="text-[10px] font-black text-white">{link.name}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${style.border} ${style.text}`}>
                        {link.strength}
                      </span>
                    </div>
                    <p className={`text-[10px] font-bold leading-relaxed ${style.text} opacity-90`}>
                      {link.explanation}
                    </p>
                    {/* Strength bar */}
                    <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${STRENGTH_WIDTH[link.strength]} transition-all duration-700`}
                        style={{ background: link.impact === "bullish" ? "#10b981" : "#f43f5e" }}
                      />
                    </div>
                  </div>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${style.bg} border ${style.border}`}>
                    <Icon className={`w-4 h-4 ${style.text}`} />
                  </div>
                </div>
              </div>
            );
          })}

          {prediction && (
            <div className="mt-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Composite signal</span>
              <span className={`text-sm font-black uppercase tracking-widest ${prediction.trend === "UP" ? "text-emerald-400" : "text-rose-400"}`}>
                {prediction.trend} · {(prediction.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PCAPredictionExplainer;
