import { useEffect, useMemo, useState } from "react";
import { useStock } from "@/context/StockContext";
import PriceChart from "@/components/PriceChart";
import PredictionCard from "@/components/PredictionCard";
import ClusterComparisonTable from "@/components/ClusterComparisonTable";
import VarianceChart from "@/components/VarianceChart";
import PCAPlot from "@/components/PCAPlot";
import ClusterChart from "@/components/ClusterChart";
import RawVsPCAPanel from "@/components/RawVsPCAPanel";
import PCValueInterpreter from "@/components/PCValueInterpreter";
import ClusterDistributionChart from "@/components/ClusterDistributionChart";
import PCAPredictionExplainer from "@/components/PCAPredictionExplainer";
import PCATrajectoryChart from "@/components/PCATrajectoryChart";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  User,
  Zap,
} from "lucide-react";

const STOCKS = ["AAPL", "TSLA", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "NFLX"];
const WATCHLIST = ["TSLA", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "NFLX"];

const toneByTrend = {
  UP: "text-emerald-300 bg-emerald-500/10 border-emerald-400/30",
  DOWN: "text-rose-300 bg-rose-500/10 border-rose-400/30",
};

const formatMoney = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const Dashboard = () => {
  const {
    runAnalysis,
    runPrediction,
    runMultiStockCompare,
    comparisonPoints,
    selectedStock,
    setSelectedStock,
    marketState,
    prediction,
    clusterDistribution,
    priceHistory,
    loadingAnalyze,
    loadingPredict,
  } = useStock();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    runAnalysis(selectedStock);
    runPrediction(selectedStock);
    runMultiStockCompare(WATCHLIST);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStockChange = (next) => {
    setSelectedStock(next);
    runAnalysis(next);
    runPrediction(next);
  };

  const latestClose = useMemo(() => {
    const rows = priceHistory || [];
    if (!rows.length) return null;
    const last = rows[rows.length - 1];
    return Number(last.close);
  }, [priceHistory]);

  const targetPrice = typeof prediction?.predicted_price === "number" ? prediction.predicted_price : latestClose;
  const expectedChangePct = latestClose && targetPrice
    ? ((targetPrice - latestClose) / latestClose) * 100
    : 0;
  const totalSessions = (clusterDistribution || []).reduce((sum, item) => sum + item.count, 0);
  const trendTone = toneByTrend[prediction?.trend] || "text-slate-300 bg-white/5 border-white/10";

  const MARKET_STATE_STYLE = {
    BULLISH_TREND: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    BEARISH_TREND: "text-rose-400 border-rose-500/20 bg-rose-500/5",
    VOLATILE: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    RANGE_BOUND: "text-sky-400 border-sky-500/20 bg-sky-500/5",
    UNKNOWN: "text-slate-400 border-white/10 bg-white/5",
  };
  const marketStyle = MARKET_STATE_STYLE[marketState] || MARKET_STATE_STYLE.UNKNOWN;

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: "radial-gradient(1400px 820px at 50% -15%, rgba(192, 132, 252, 0.42), transparent 58%), radial-gradient(980px 620px at 5% 100%, rgba(168, 85, 247, 0.35), transparent 62%), radial-gradient(980px 620px at 95% 95%, rgba(126, 34, 206, 0.28), transparent 64%), #12051f",
      }}
    >
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200]">
        <div className="flex items-center h-12 px-6 rounded-full bg-black/90 border border-white/20 backdrop-blur-3xl shadow-[0_30px_70px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-4 pr-5 border-r border-white/10 h-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/80">ONLINE</span>
            </div>
            <div className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${marketStyle}`}>
              {marketState}
            </div>
          </div>

          <div className="relative px-5 h-full flex items-center group">
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
            >
              <div className="absolute inset-x-2 inset-y-1 bg-purple-500/10 blur-lg rounded-full -z-10 group-hover:bg-purple-500/20 transition-all" />
              <span className="text-sm font-black tracking-tighter">{selectedStock}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-[120%] left-0 w-48 bg-black/90 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl p-2 py-3 space-y-1">
                <div className="px-3 pb-2 text-[8px] font-black uppercase tracking-widest text-slate-600">Switch Asset</div>
                {STOCKS.map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => {
                      handleStockChange(symbol);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      selectedStock === symbol ? "bg-purple-500/20 text-purple-400" : "hover:bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pl-5 border-l border-white/10 h-6 flex items-center">
            <button
              onClick={() => {
                runAnalysis(selectedStock);
                runPrediction(selectedStock);
              }}
              disabled={loadingAnalyze || loadingPredict}
              className="flex items-center gap-2.5 hover:bg-white/5 text-white/90 font-black px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest transition-all border border-transparent hover:border-white/10 active:scale-95 disabled:opacity-50"
            >
              Initiate Scan <Zap className="w-3 h-3 text-purple-400" />
            </button>
          </div>

          <div className="pl-4 ml-4 border-l border-white/10 h-6 flex items-center">
            <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-purple-500/50 transition-colors cursor-pointer">
              <User className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1560px] mx-auto px-4 md:px-8 py-6 md:py-8" style={{ paddingTop: "100px" }}>

        <section className="mt-5 grid grid-cols-1 gap-5">
          <article className="rounded-3xl border border-white/10 bg-black/90 backdrop-blur-xl p-5 md:p-7">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Signal Overview</p>
                <h2 className="text-3xl md:text-5xl font-semibold mt-1">{formatMoney(targetPrice)}</h2>
              </div>
              <div className={`px-3 py-2 rounded-xl border text-sm font-semibold inline-flex items-center gap-2 ${trendTone}`}>
                {prediction?.trend === "DOWN" ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                {prediction?.trend || "WAITING"}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/90 p-4 md:p-5">
              <PriceChart />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="rounded-xl border border-white/10 bg-black/90 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.14em]">Current Price</p>
                <p className="text-lg font-semibold mt-1">{formatMoney(latestClose)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/90 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.14em]">Expected Move</p>
                <p className={`text-lg font-semibold mt-1 ${expectedChangePct >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                  {expectedChangePct >= 0 ? "+" : ""}{expectedChangePct.toFixed(2)}%
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/90 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.14em]">Regime State</p>
                <p className="text-lg font-semibold mt-1">{marketState || "UNKNOWN"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/90 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.14em]">Sessions</p>
                <p className="text-lg font-semibold mt-1">{totalSessions}</p>
              </div>
            </div>
          </article>

        </section>

        <section className="mt-5 pb-2">
          <article className="h-[244px] rounded-3xl border border-purple-500/30 bg-black/90 backdrop-blur-xl p-0 overflow-hidden flex w-full shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            
            <div className="flex-1 p-5 md:p-6 border-r border-white/10 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Watchlist</p>
                <p className="text-xs text-slate-500">PC1</p>
              </div>
              <div className="space-y-2.5 max-h-[172px] overflow-y-auto pr-1">
                {WATCHLIST.map((symbol) => {
                  const point = comparisonPoints.find((entry) => entry.symbol === symbol);
                  const score = point ? point.pc1 : 0;
                  return (
                    <button
                      key={symbol}
                      onClick={() => handleStockChange(symbol)}
                      className="w-full rounded-xl border border-white/10 bg-black/90 hover:bg-black/95 transition px-3 py-2.5 flex items-center justify-between"
                    >
                      <span className="font-semibold">{symbol}</span>
                      <span className={`${score >= 0 ? "text-emerald-300" : "text-rose-300"} text-sm font-semibold`}>
                        {score >= 0 ? "+" : ""}{score.toFixed(1)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 p-4 border-r border-white/10 min-w-0">
              <PredictionCard />
            </div>
            
            <div className="flex-1 p-4 border-r border-white/10 min-w-0">
              <ClusterDistributionChart />
            </div>
            <div className="flex-1 p-4 min-w-0">
              <RawVsPCAPanel />
            </div>
          </article>
        </section>

        <section className="mt-5">
          <article className="rounded-3xl border border-purple-500/30 bg-black/90 backdrop-blur-xl p-0 overflow-hidden grid grid-cols-1 lg:grid-cols-2 w-full shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <div className="p-4 md:p-6 border-b lg:border-b-0 lg:border-r border-white/10 min-w-0">
              <PCValueInterpreter />
            </div>
            <div className="p-4 md:p-6 min-w-0">
              <PCAPredictionExplainer />
            </div>
          </article>
        </section>

        <section className="mt-5 grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-7 rounded-3xl border border-white/10 bg-black/90 backdrop-blur-xl p-2">
            <PCATrajectoryChart />
          </div>
          <div className="xl:col-span-5 rounded-3xl border border-white/10 bg-black/90 backdrop-blur-xl p-2">
            <PCAPlot />
          </div>
        </section>

        <section className="mt-5 grid grid-cols-1 gap-5">
          <div className="rounded-3xl border border-white/10 bg-black/90 backdrop-blur-xl p-2">
            <VarianceChart />
          </div>
        </section>

        <section className="mt-5 pb-10 grid grid-cols-1 gap-5">
          <div className="rounded-3xl border border-white/10 bg-black/90 backdrop-blur-xl p-2">
            <ClusterComparisonTable />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
