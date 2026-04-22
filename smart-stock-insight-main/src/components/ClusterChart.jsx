import { useStock } from "@/context/StockContext";

const COLORS = [
  { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-500", border: "border-emerald-500/20" },
  { bg: "bg-blue-500/10",    text: "text-blue-400",    dot: "bg-blue-500",    border: "border-blue-500/20" },
  { bg: "bg-amber-500/10",   text: "text-amber-400",   dot: "bg-amber-500",   border: "border-amber-500/20" },
  { bg: "bg-rose-500/10",    text: "text-rose-400",    dot: "bg-rose-500",    border: "border-rose-500/20" },
  { bg: "bg-purple-500/10",  text: "text-purple-400",  dot: "bg-purple-500",  border: "border-purple-500/20" },
];

const ClusterChart = () => {
  const { clusterData } = useStock();

  const normalizedClusters = Array.isArray(clusterData)
    ? (() => {
        if (clusterData.length > 0 && typeof clusterData[0] === "number") {
          const counts = clusterData.reduce((acc, value) => {
            const id = Number(value);
            if (Number.isFinite(id)) acc[id] = (acc[id] || 0) + 1;
            return acc;
          }, {});

          return Object.entries(counts)
            .map(([cluster, size]) => ({
              cluster: Number(cluster),
              label: `Regime ${cluster}`,
              size,
            }))
            .sort((a, b) => b.size - a.size);
        }

        return clusterData
          .map((entry, index) => {
            if (typeof entry === "number") {
              return { cluster: entry, label: `Regime ${entry}`, size: null };
            }

            const clusterId = Number(entry?.cluster);
            return {
              cluster: Number.isFinite(clusterId) ? clusterId : index,
              label: entry?.label || `Regime ${Number.isFinite(clusterId) ? clusterId : index}`,
              size: entry?.size ?? null,
            };
          })
          .filter((entry) => Number.isFinite(entry.cluster));
      })()
    : [];

  return (
    <div className="h-full w-full">
      {!normalizedClusters.length ? (
        <div className="text-[10px] text-slate-700 font-bold uppercase tracking-widest py-8 text-center flex items-center justify-center h-[200px]">
           No latent structures mapped
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {normalizedClusters.slice(0, 5).map((c, i) => {
            const colorIndex = Math.abs(c.cluster) % COLORS.length;
            const col = COLORS[colorIndex] || COLORS[0];
            return (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${col.border} ${col.bg} transition-all hover:bg-white/5`}>
                <div className="flex items-center gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full ${col.dot} shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
                  <div>
                    <div className={`text-[11px] font-black uppercase tracking-tight ${col.text}`}>{c.label}</div>
                  </div>
                </div>
                {c.size != null && (
                  <span className="text-[10px] font-black text-white bg-black/40 px-2 py-0.5 rounded border border-white/10 tabular-nums">
                    {c.size}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClusterChart;
