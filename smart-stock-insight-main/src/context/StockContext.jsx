import { createContext, useContext, useState, useCallback } from "react";
import { analyzeStock, predictStock } from "@/api/api";

const StockContext = createContext(null);

export const StockProvider = ({ children }) => {
  const [selectedStock, setSelectedStock] = useState("AAPL");
  const [pcaData, setPcaData] = useState(null);
  const [clusterData, setClusterData] = useState(null);
  const [explainedVariance, setExplainedVariance] = useState(null);
  const [pcaInsights, setPcaInsights] = useState([]);
  const [trajectory, setTrajectory] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [clusterComparison, setClusterComparison] = useState([]);
  const [marketState, setMarketState] = useState("UNKNOWN");
  const [varianceStory, setVarianceStory] = useState("");
  const [comparisonPoints, setComparisonPoints] = useState([]);
  const [prediction, setPrediction] = useState(null);

  // New PCA-deep state
  const [componentWeights, setComponentWeights] = useState([]);
  const [cumulativeVariance, setCumulativeVariance] = useState([]);
  const [dimensionReduction, setDimensionReduction] = useState(null);
  const [pcValues, setPcValues] = useState([]);
  const [clusterDistribution, setClusterDistribution] = useState([]);
  const [componentNames, setComponentNames] = useState({});
  const [pcaPredictionLink, setPcaPredictionLink] = useState([]);

  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const runAnalysis = useCallback(async (symbol) => {
    const sym = (symbol || selectedStock).toUpperCase();
    setLoadingAnalyze(true);
    setError(null);
    const { data, fallback, error: err } = await analyzeStock(sym);

    const rawPoints = data.pca_points || data.pca || [];
    const rawClusters = data.clusters || [];
    const normalizedPca = rawPoints.map((point, idx) => {
      const clusterEntry = rawClusters[idx];
      const cluster = typeof clusterEntry === "number" ? clusterEntry : (clusterEntry?.cluster ?? 0);
      const label = typeof clusterEntry === "object" && clusterEntry?.label ? clusterEntry.label : `Cluster ${cluster}`;

      if (Array.isArray(point)) {
        return { pc1: point[0] ?? 0, pc2: point[1] ?? 0, cluster, label };
      }
      return {
        pc1: point?.pc1 ?? 0,
        pc2: point?.pc2 ?? 0,
        cluster,
        label,
      };
    });

    setPcaData(normalizedPca);
    setClusterData(rawClusters);
    setExplainedVariance(data.explained_variance || []);
    setPcaInsights(data.pca_insights || []);
    setTrajectory(data.trajectory || []);
    setPriceHistory(data.price_history || []);
    setClusterComparison(data.cluster_comparison || []);
    setMarketState(data.market_state || "UNKNOWN");
    setVarianceStory(data.variance_story || "");

    // New PCA-deep fields
    setComponentWeights(data.component_weights || []);
    setCumulativeVariance(data.cumulative_variance || []);
    setDimensionReduction(data.dimension_reduction || null);
    setPcValues(data.pc_values || []);
    setClusterDistribution(data.cluster_distribution || []);
    setComponentNames(data.component_names || {});
    setPcaPredictionLink(data.pca_prediction_link || []);

    setUsingFallback(fallback);
    if (fallback) setError(`Backend unavailable — showing demo data (${err})`);
    setLoadingAnalyze(false);
  }, [selectedStock]);

  const runPrediction = useCallback(async (symbol) => {
    const sym = (symbol || selectedStock).toUpperCase();
    setLoadingPredict(true);
    const { data, fallback } = await predictStock(sym);
    setPrediction(data);
    setUsingFallback((prev) => prev || fallback);
    setLoadingPredict(false);
  }, [selectedStock]);

  const runMultiStockCompare = useCallback(async (symbols) => {
    const list = (symbols || []).map((s) => s.toUpperCase().trim()).filter(Boolean);
    if (!list.length) {
      setComparisonPoints([]);
      return;
    }

    const results = await Promise.all(list.map(async (sym) => {
      const { data } = await analyzeStock(sym);
      const points = data?.pca_points || data?.pca || [];
      const clusters = data?.clusters || [];
      const last = points[points.length - 1];
      const lastCluster = clusters[clusters.length - 1];

      if (!last) return null;
      const pc1 = Array.isArray(last) ? Number(last[0] || 0) : Number(last.pc1 || 0);
      const pc2 = Array.isArray(last) ? Number(last[1] || 0) : Number(last.pc2 || 0);

      return {
        symbol: sym,
        pc1,
        pc2,
        cluster: typeof lastCluster === "number" ? lastCluster : (lastCluster?.cluster ?? 0),
      };
    }));

    setComparisonPoints(results.filter(Boolean));
  }, []);

  return (
    <StockContext.Provider
      value={{
        selectedStock, setSelectedStock,
        pcaData, clusterData, explainedVariance, pcaInsights, trajectory, priceHistory,
        clusterComparison, marketState, varianceStory, comparisonPoints, prediction,
        loadingAnalyze, loadingPredict, error, usingFallback,
        runAnalysis, runPrediction, runMultiStockCompare,
        // New PCA-deep data
        componentWeights, cumulativeVariance, dimensionReduction, pcValues,
        clusterDistribution, componentNames, pcaPredictionLink,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error("useStock must be used inside StockProvider");
  return ctx;
};
