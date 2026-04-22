import { useStock } from "@/context/StockContext";
import { Table2, Settings2 } from "lucide-react";

const ClusterComparisonTable = () => {
  const { clusterComparison } = useStock();

  return (
    <div className="premium-card flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="card-header-text !mb-0">
          <Table2 className="w-5 h-5 text-purple-500" />
          Market Regimes
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded border border-white/10 text-[10px] font-black text-slate-500 hover:text-white transition uppercase tracking-widest">
           <Settings2 className="w-3 h-3" />
           Config
        </button>
      </div>

      <div className="flex-1 overflow-x-auto">
        {!clusterComparison?.length ? (
          <div className="flex items-center justify-center py-10 border-2 border-dashed border-white/5 rounded-xl">
             <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Regime data pending...</p>
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-slate-500 border-b border-white/5">
                <th className="text-left font-black uppercase tracking-widest text-[9px] py-3 pr-4">Regime</th>
                <th className="text-right font-black uppercase tracking-widest text-[9px] py-3 pr-4">Return</th>
                <th className="text-right font-black uppercase tracking-widest text-[9px] py-3 pr-4">Vol</th>
                <th className="text-center font-black uppercase tracking-widest text-[9px] py-3">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clusterComparison.map((row) => (
                <tr key={row.cluster} className="group hover:bg-white/5 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        row.trend === "UP" ? "bg-emerald-500" : row.trend === "DOWN" ? "bg-rose-500" : "bg-purple-500"
                      } shadow-[0_0_8px_rgba(124,58,237,0.3)]`} />
                      <span className="font-bold text-white text-xs">{row.label}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-[11px] text-slate-400 font-bold">{(row.avg_return * 100).toFixed(2)}%</td>
                  <td className="py-3 pr-4 text-right font-mono text-[11px] text-slate-400 font-bold">{(row.volatility * 100).toFixed(2)}%</td>
                  <td className="py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded font-black text-[10px] ${
                      row.trend === "UP" ? "text-emerald-500 bg-emerald-500/10" : row.trend === "DOWN" ? "text-rose-500 bg-rose-500/10" : "text-slate-500 bg-white/5"
                    }`}>
                      {row.trend === "UP" ? "↑" : row.trend === "DOWN" ? "↓" : "→"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
        <span>Live Distribution</span>
        <span>24H WINDOW</span>
      </div>
    </div>
  );
};

export default ClusterComparisonTable;
