import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceDot } from "recharts";
import { useMemo } from "react";
import { useStock } from "@/context/StockContext";
import { LineChart as LineChartIcon } from "lucide-react";

const PriceChart = () => {
  const { priceHistory, prediction } = useStock();

  const data = useMemo(() => {
    return (priceHistory || []).map((row) => ({
      date: new Date(row.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      close: Number(row.close),
    }));
  }, [priceHistory]);

  const last = data[data.length - 1];

  return (
    <div className="h-full w-full">

      {!data.length ? (
        <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">No price data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
            <XAxis dataKey="date" minTickGap={24} tick={{ fontSize: 10, fill: "#64748b", fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis domain={["auto", "auto"]} hide />
            <Tooltip
              contentStyle={{
                background: "#190a2d",
                border: "1px solid rgba(216, 180, 254, 0.35)",
                borderRadius: 8,
                fontSize: 10,
                color: "#fff",
                fontWeight: "bold"
              }}
              itemStyle={{ color: "#a855f7" }}
            />
            <Line type="monotone" dataKey="close" stroke="#7c3aed" strokeWidth={3} dot={false} animationDuration={2000} />
            {prediction?.predicted_price != null && last && (
              <ReferenceDot
                x={last.date}
                y={prediction.predicted_price}
                r={5}
                fill={prediction.trend === "UP" ? "#10b981" : "#f43f5e"}
                stroke="#271341"
                label={{ value: `TARGET: $${prediction.predicted_price.toFixed(2)}`, position: "top", fontSize: 10, fill: "#fff", fontWeight: 900 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PriceChart;
