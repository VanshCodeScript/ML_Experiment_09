import { useStock } from "@/context/StockContext";
import { Activity, Loader2 } from "lucide-react";

const GAUGE_COLORS = {
  positive: { bar: "bg-emerald-500", text: "text-emerald-400", glow: "shadow-[0_0_10px_rgba(16,185,129,0.4)]" },
  negative: { bar: "bg-rose-500", text: "text-rose-400", glow: "shadow-[0_0_10px_rgba(244,63,94,0.4)]" },
  neutral: { bar: "bg-slate-500", text: "text-slate-400", glow: "" },
};

const PCValueInterpreter = () => {
  const { pcValues, loadingAnalyze } = useStock();

  return (
    <div className="premium-card">
      <div className="card-header-text">
        <Activity className="w-5 h-5 text-purple-500" />
        Live PC Value Interpreter
      </div>

      {loadingAnalyze ? (
        <div className="h-[200px] flex items-center justify-center text-slate-700">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : !pcValues?.length ? (
        <div className="h-[200px] flex items-center justify-center text-xs text-slate-700 uppercase font-black tracking-widest">
          Run scan to interpret components
        </div>
      ) : (
        <div className="space-y-4">
          {pcValues.map((pc) => {
            const isPos = pc.value > 0.1;
            const isNeg = pc.value < -0.1;
            const style = isPos ? GAUGE_COLORS.positive : isNeg ? GAUGE_COLORS.negative : GAUGE_COLORS.neutral;
            const barWidth = Math.min(Math.abs(pc.value) / 3 * 100, 100);

            return (
              <div key={pc.component} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{pc.component}</span>
                    <span className="text-[10px] font-black text-white">{pc.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black tabular-nums ${style.text}`}>
                      {pc.value > 0 ? "+" : ""}{pc.value.toFixed(3)}
                    </span>
                    <span className="text-[8px] font-black text-slate-600 uppercase">{pc.variance_pct}%</span>
                  </div>
                </div>

                {/* Bidirectional bar */}
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden flex">
                  <div className="flex-1 flex justify-end pr-0.5">
                    {pc.value < 0 && (
                      <div
                        className={`h-full rounded-full ${style.bar} ${style.glow} transition-all duration-700`}
                        style={{ width: `${barWidth}%` }}
                      />
                    )}
                  </div>
                  <div className="w-px bg-white/20 flex-shrink-0" />
                  <div className="flex-1 pl-0.5">
                    {pc.value >= 0 && (
                      <div
                        className={`h-full rounded-full ${style.bar} ${style.glow} transition-all duration-700`}
                        style={{ width: `${barWidth}%` }}
                      />
                    )}
                  </div>
                </div>

                <p className={`text-[9px] font-bold italic ${style.text} opacity-80`}>{pc.interpretation}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PCValueInterpreter;
