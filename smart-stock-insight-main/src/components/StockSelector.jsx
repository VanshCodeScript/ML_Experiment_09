import { useState } from "react";
import { useStock } from "@/context/StockContext";
import { Search, Loader2, Sparkles } from "lucide-react";

const POPULAR = ["AAPL", "TSLA", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "NFLX"];

const StockSelector = () => {
  const { selectedStock, setSelectedStock, runAnalysis, runPrediction } = useStock();
  const [input, setInput] = useState(selectedStock);

  const handleAnalyze = (sym) => {
    const s = (sym || input).trim().toUpperCase();
    if (!s) return;
    setSelectedStock(s);
    runAnalysis(s);
    runPrediction(s);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="Search symbol (e.g. NVDA)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-[#7c3aed] transition placeholder:text-slate-600 text-white font-bold"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {POPULAR.map((s) => (
          <button
            key={s}
            onClick={() => { setInput(s); handleAnalyze(s); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              selectedStock === s
                ? "bg-[#7c3aed] text-white border-[#7c3aed] shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StockSelector;
