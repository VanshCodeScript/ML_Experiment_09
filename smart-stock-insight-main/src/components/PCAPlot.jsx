import { useState, useRef, useEffect } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";
import { useStock } from "@/context/StockContext";
import { Loader2, ZoomIn, ZoomOut } from "lucide-react";

const CLUSTER_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#f43f5e", "#a855f7"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-black border border-white/10 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl">
      <div className="text-purple-400 mb-1">{d.label || `Regime ${d.cluster}`}</div>
      <div className="opacity-60">PC1: {d.pc1.toFixed(3)}</div>
      <div className="opacity-60">PC2: {d.pc2.toFixed(3)}</div>
    </div>
  );
};

const PCAPlot = () => {
  const { pcaData, trajectory, comparisonPoints, loadingAnalyze } = useStock();
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef(null);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 10));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.5, 0.5));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      // ctrlKey captures trackpad pinch
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomDelta = -e.deltaY * 0.01;
        setZoomLevel((prev) => Math.max(0.5, Math.min(prev + zoomDelta, 10)));
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  const grouped = (pcaData || []).reduce((acc, p) => {
    const k = p.cluster ?? 0;
    (acc[k] = acc[k] || []).push(p);
    return acc;
  }, {});

  // Calculate domains based on zoom level if data exists
  let xDomain = ["auto", "auto"];
  let yDomain = ["auto", "auto"];
  
  if (pcaData?.length > 0 && zoomLevel !== 1) {
      let minX = Infinity; let maxX = -Infinity;
      let minY = Infinity; let maxY = -Infinity;
      
      pcaData.forEach(p => {
          if (p.pc1 < minX) minX = p.pc1;
          if (p.pc1 > maxX) maxX = p.pc1;
          if (p.pc2 < minY) minY = p.pc2;
          if (p.pc2 > maxY) maxY = p.pc2;
      });

      const xRange = maxX - minX;
      const yRange = maxY - minY;
      const xCenter = minX + (xRange / 2);
      const yCenter = minY + (yRange / 2);
      
      const newXRange = xRange / zoomLevel;
      const newYRange = yRange / zoomLevel;

      xDomain = [xCenter - (newXRange / 2), xCenter + (newXRange / 2)];
      yDomain = [yCenter - (newYRange / 2), yCenter + (newYRange / 2)];
  }

  return (
    <div className="h-full w-full relative" ref={containerRef}>
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <button onClick={handleZoomOut} className="p-1.5 rounded bg-black/50 border border-white/10 hover:bg-white/10 text-slate-400 transition-colors" title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={handleZoomIn} className="p-1.5 rounded bg-black/50 border border-white/10 hover:bg-white/10 text-slate-400 transition-colors" title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {loadingAnalyze ? (
        <div className="h-[300px] flex items-center justify-center text-slate-700">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : !pcaData?.length ? (
        <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">Dimension mapping awaiting input...</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis type="number" dataKey="pc1" hide domain={xDomain} />
            <YAxis type="number" dataKey="pc2" hide domain={yDomain} />
            <ZAxis range={[30, 30]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.1)" }} />
            {Object.entries(grouped).map(([k, pts]) => (
              <Scatter
                key={k}
                data={pts}
                fill={CLUSTER_COLORS[k % CLUSTER_COLORS.length]}
                fillOpacity={0.6}
              />
            ))}
            {trajectory?.length ? (
              <Scatter
                name="trajectory"
                data={trajectory}
                fill="#fff"
                line={{ stroke: "#fff", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
            ) : null}
            {comparisonPoints?.length ? (
              <Scatter
                name="compare"
                data={comparisonPoints}
                fill="#a855f7"
                shape="cross"
              />
            ) : null}
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PCAPlot;
