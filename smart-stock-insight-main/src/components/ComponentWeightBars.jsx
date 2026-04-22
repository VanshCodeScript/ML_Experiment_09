import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { useStock } from "@/context/StockContext";
import { Weight, Loader2, ChevronDown, ChevronUp } from "lucide-react";

const COLORS = ["#7c3aed", "#38bdf8", "#f59e0b", "#10b981", "#f43f5e"];

const ComponentWeightBars = () => {
  const { componentWeights, loadingAnalyze } = useStock();
  const [selectedPC, setSelectedPC] = useState(0);

  const current = componentWeights?.[selectedPC];
  const features = (current?.features || [])
    .slice(0, 8)
    .map((f) => ({
      name: f.feature,
      weight: f.weight,
      absWeight: Math.abs(f.weight),
    }));

  return (
    <div className="premium-card">
      <div className="card-header-text">
        <Weight className="w-5 h-5 text-purple-500" />
        Component Weight Analysis
      </div>
      {loadingAnalyze ? (
        <div className="h-[280px] flex items-center justify-center text-slate-700">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : !componentWeights?.length ? (
        <div className="h-[280px] flex items-center justify-center text-xs text-slate-700 uppercase font-black tracking-widest">
          No components loaded
        </div>
      ) : (
        <div className="space-y-4">
          {/* PC Tabs */}
          <div className="flex gap-2 flex-wrap">
            {componentWeights.map((cw, i) => (
              <button
                key={cw.component}
                onClick={() => setSelectedPC(i)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                  i === selectedPC
                    ? "bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                    : "bg-white/5 text-slate-500 border-white/5 hover:text-white hover:border-white/20"
                }`}
              >
                {cw.component} · {cw.name}
              </button>
            ))}
          </div>

          {/* Weight bars */}
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={features} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 60 }}>
                <XAxis type="number" tick={{ fontSize: 9, fill: "#64748b", fontWeight: 700 }} domain={[-0.6, 0.6]} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 700 }} width={58} />
                <Tooltip
                  contentStyle={{ background: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 10, color: "#fff", fontWeight: "bold" }}
                  formatter={(v) => [`${v.toFixed(4)}`, "Weight"]}
                />
                <ReferenceLine x={0} stroke="rgba(255,255,255,0.1)" />
                <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                  {features.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.weight >= 0 ? "#10b981" : "#f43f5e"}
                      fillOpacity={0.7 + Math.min(entry.absWeight, 0.3)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
            Showing top 8 features by absolute weight for {current?.component} ({current?.name})
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentWeightBars;
