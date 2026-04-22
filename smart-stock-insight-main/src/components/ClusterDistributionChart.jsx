import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useStock } from "@/context/StockContext";
import { PieChart as PieIcon, Loader2 } from "lucide-react";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#f43f5e", "#a855f7"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-black border border-white/10 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl">
      <div style={{ color: payload[0].fill }} className="mb-1">{d.label}</div>
      <div className="opacity-60">{d.count} sessions · {d.percentage}%</div>
    </div>
  );
};

const ClusterDistributionChart = () => {
  const { clusterDistribution, loadingAnalyze } = useStock();

  const total = (clusterDistribution || []).reduce((s, c) => s + c.count, 0);

  return (
    <div className="premium-card">
      <div className="card-header-text">
        <PieIcon className="w-5 h-5 text-purple-500" />
        Cluster Distribution
      </div>

      {loadingAnalyze ? (
        <div className="h-[200px] flex items-center justify-center text-slate-700">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : !clusterDistribution?.length ? (
        <div className="h-[200px] flex items-center justify-center text-xs text-slate-700 uppercase font-black tracking-widest">
          No cluster data
        </div>
      ) : (
        <div className="flex gap-4 items-center">
          <div className="relative flex-shrink-0">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={clusterDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={64}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {clusterDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-lg font-black text-white tabular-nums">{total}</div>
              <div className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Sessions</div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {clusterDistribution.map((c, i) => (
              <div key={c.cluster} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white truncate">{c.label}</span>
                    <span className="text-[10px] font-black text-slate-500 tabular-nums ml-1">{c.percentage}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full mt-0.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${c.percentage}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClusterDistributionChart;
