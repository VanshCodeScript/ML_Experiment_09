import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts";
import { useStock } from "@/context/StockContext";
import { TrendingUp, Loader2 } from "lucide-react";

const CumulativeVarianceChart = () => {
  const { explainedVariance, cumulativeVariance, loadingAnalyze } = useStock();

  const data = (cumulativeVariance || []).map((v, i) => ({
    name: `PC${i + 1}`,
    cumulative: +(v * 100).toFixed(1),
    individual: +((explainedVariance?.[i] || 0) * 100).toFixed(1),
  }));

  const threshold95 = data.findIndex((d) => d.cumulative >= 95);

  return (
    <div className="premium-card">
      <div className="card-header-text">
        <TrendingUp className="w-5 h-5 text-purple-500" />
        Cumulative Variance Curve
      </div>
      {loadingAnalyze ? (
        <div className="h-[220px] flex items-center justify-center text-slate-700">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : !data.length ? (
        <div className="h-[220px] flex items-center justify-center text-xs text-slate-700 uppercase font-black tracking-widest">
          Awaiting analysis...
        </div>
      ) : (
        <>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b", fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b", fontWeight: 700 }} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ background: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 10, color: "#fff", fontWeight: "bold" }}
                  formatter={(v, name) => [`${v}%`, name === "cumulative" ? "Cumulative" : "Individual"]}
                />
                {threshold95 >= 0 && (
                  <ReferenceLine x={data[threshold95]?.name} stroke="#10b981" strokeDasharray="6 3" label={{ value: "95%", fill: "#10b981", fontSize: 9, fontWeight: 800 }} />
                )}
                <ReferenceLine y={95} stroke="rgba(16,185,129,0.3)" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="cumulative" stroke="#7c3aed" strokeWidth={2} fill="url(#cumGrad)" dot={{ r: 3, fill: "#7c3aed", stroke: "#7c3aed" }} />
                <Line type="monotone" dataKey="individual" stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="4 3" dot={{ r: 2, fill: "#38bdf8" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex gap-4 text-[9px] font-black uppercase tracking-widest text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" /> Cumulative</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-sky-400 rounded" /> Per-Component</span>
            {threshold95 >= 0 && <span className="text-emerald-500">95% reached at {data[threshold95]?.name}</span>}
          </div>
        </>
      )}
    </div>
  );
};

export default CumulativeVarianceChart;
