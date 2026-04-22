import { BarChart, Bar, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useStock } from "@/context/StockContext";
import { Loader2 } from "lucide-react";

const VarianceChart = () => {
  const { explainedVariance, varianceStory, loadingAnalyze } = useStock();
  const data = (explainedVariance || []).map((v, i) => ({
    name: `PC${i + 1}`,
    variance: +(v * 100).toFixed(2),
  }));

  return (
    <div className="h-full w-full">
      {loadingAnalyze ? (
        <div className="h-[200px] flex items-center justify-center text-slate-700">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        </div>
      ) : !data.length ? (
        <div className="h-[200px] flex items-center justify-center text-xs text-slate-700 uppercase font-black tracking-widest">
          No dataset analyzed
        </div>
      ) : (
        <div className="h-[200px] flex flex-col">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={1} />
                  <stop offset="100%" stopColor="#2e1065" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  background: "#000",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  fontSize: 10,
                  color: "#fff",
                  fontWeight: "bold"
                }}
                itemStyle={{ color: "#a855f7" }}
                formatter={(v) => [`${v}%`, "Explained"]}
              />
              <Bar dataKey="variance" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => <Cell key={i} fill="url(#barGrad)" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default VarianceChart;
