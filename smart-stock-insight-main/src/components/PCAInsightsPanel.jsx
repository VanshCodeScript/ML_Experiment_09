import { Brain, Loader2 } from "lucide-react";
import { useStock } from "@/context/StockContext";

const THEME_CONFIG = {
  Trend:            { emoji: "📈", color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5",  dot: "bg-emerald-500"  },
  Volatility:       { emoji: "⚠️", color: "text-amber-400",   border: "border-amber-500/20",   bg: "bg-amber-500/5",    dot: "bg-amber-500"    },
  Momentum:         { emoji: "⚡", color: "text-sky-400",      border: "border-sky-500/20",      bg: "bg-sky-500/5",      dot: "bg-sky-500"      },
  "Market Structure":{ emoji: "🧭", color: "text-purple-400", border: "border-purple-500/20",  bg: "bg-purple-500/5",   dot: "bg-purple-500"   },
};

const HUMAN_NAMES = {
  Trend:             "Trend Driver",
  Volatility:        "Volatility Axis",
  Momentum:          "Momentum Signal",
  "Market Structure":"Structure Lens",
};

const PCAInsightsPanel = () => {
  const { pcaInsights, componentNames, loadingAnalyze } = useStock();

  return (
    <div className="premium-card">
      <div className="card-header-text">
        <Brain className="w-5 h-5 text-purple-500" />
        Market Behavior Drivers
      </div>

      {loadingAnalyze ? (
        <div className="h-[140px] flex items-center justify-center text-slate-700">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : !pcaInsights?.length ? (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl p-8">
          <p className="text-xs text-slate-700 font-bold uppercase tracking-wider text-center">Structural analysis pending...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pcaInsights.slice(0, 3).map((item) => {
            const cfg = THEME_CONFIG[item.theme] || THEME_CONFIG["Market Structure"];
            const humanName = componentNames?.[item.component] || HUMAN_NAMES[item.theme] || item.theme;

            return (
              <article
                key={item.component}
                className={`group rounded-2xl border ${cfg.border} ${cfg.bg} p-5 transition-all hover:brightness-110`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-0.5">{item.component}</div>
                    <div className={`text-xs font-black uppercase tracking-tight ${cfg.color}`}>{humanName}</div>
                  </div>
                  <span className="text-xl">{cfg.emoji}</span>
                </div>

                <div className="flex items-center gap-1.5 mb-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${cfg.color} opacity-80`}>{item.theme}</span>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-2">Key Drivers</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(item.top_features || []).map((f) => (
                      <span
                        key={f}
                        className={`text-[8px] px-2 py-1 rounded-lg border ${cfg.border} ${cfg.bg} font-black ${cfg.color} opacity-80`}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PCAInsightsPanel;
