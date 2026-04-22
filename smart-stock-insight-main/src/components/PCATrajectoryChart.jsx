import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis, LineChart, Line, CartesianGrid } from "recharts";
import { useStock } from "@/context/StockContext";
import { Navigation, Loader2 } from "lucide-react";

const CLUSTER_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#f43f5e", "#a855f7"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload || {};
  const date = d.date ? new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
  return (
    <div className="bg-black border border-white/10 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl">
      {date && <div className="text-slate-500 mb-1">{date}</div>}
      <div className="text-purple-400">PC1: {(d.pc1 ?? 0).toFixed(3)}</div>
      <div className="text-sky-400">PC2: {(d.pc2 ?? 0).toFixed(3)}</div>
    </div>
  );
};

const PCATrajectoryChart = () => {
  const { trajectory, loadingAnalyze } = useStock();

  // For line chart: PC1 over time
  const lineData = (trajectory || []).map((t, i) => ({
    ...t,
    idx: i,
    label: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  // Scatter with trajectory lines grouped by cluster
  const byCluster = (trajectory || []).reduce((acc, t) => {
    const k = t.cluster ?? 0;
    (acc[k] = acc[k] || []).push(t);
    return acc;
  }, {});

  return (
    <div className="premium-card">
      <div className="card-header-text">
        <Navigation className="w-5 h-5 text-purple-500" />
        PCA Trajectory — Time Movement
      </div>

      {loadingAnalyze ? (
        <div className="h-[280px] flex items-center justify-center text-slate-700">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : !trajectory?.length ? (
        <div className="h-[280px] flex items-center justify-center text-xs text-slate-700 uppercase font-black tracking-widest">
          No trajectory data available
        </div>
      ) : (
        <div className="space-y-4">
          {/* Scatter: 2D path */}
          <div>
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">2D Latent Path (PC1 vs PC2)</p>
            <ResponsiveContainer width="100%" height={180}>
              <ScatterChart margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis type="number" dataKey="pc1" name="PC1" tick={{ fontSize: 12, fill: "#94a3b8" }} domain={['auto', 'auto']} />
                <YAxis type="number" dataKey="pc2" name="PC2" tick={{ fontSize: 12, fill: "#94a3b8" }} domain={['auto', 'auto']} />
                <ZAxis range={[20, 20]} />
                <Tooltip content={<CustomTooltip />} />
                {/* Full path line */}
                <Scatter
                  data={trajectory}
                  fill="rgba(255,255,255,0.15)"
                  line={{ stroke: "rgba(255,255,255,0.12)", strokeWidth: 1 }}
                  lineType="joint"
                />
                {/* Cluster-colored points */}
                {Object.entries(byCluster).map(([k, pts]) => (
                  <Scatter
                    key={k}
                    data={pts}
                    fill={CLUSTER_COLORS[Number(k) % CLUSTER_COLORS.length]}
                    fillOpacity={0.85}
                    line={false}
                  />
                ))}
                {/* Latest point highlight */}
                <Scatter
                  data={[trajectory[trajectory.length - 1]]}
                  fill="#ffffff"
                  shape="diamond"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* PC1 over time */}
          <div>
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">PC1 Over Time (Trend Axis)</p>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={lineData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} interval={6} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 10, color: "#fff" }}
                  formatter={(v) => [v.toFixed(3), "PC1"]}
                />
                <Line type="monotone" dataKey="pc1" stroke="#7c3aed" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-widest text-slate-600">
            {Object.entries(byCluster).map(([k]) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: CLUSTER_COLORS[Number(k) % CLUSTER_COLORS.length] }} />
                Regime {k}
              </span>
            ))}
            <span className="flex items-center gap-1.5 text-white/60">
              <span className="w-2 h-2 rounded-sm bg-white" />
              Current
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PCATrajectoryChart;
