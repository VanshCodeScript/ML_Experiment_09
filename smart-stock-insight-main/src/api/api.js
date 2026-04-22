import axios from "axios";

const BASE_URL = "http://localhost:8000";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ---------- Dummy fallback data ----------
const dummyAnalyze = (symbol = "AAPL") => {
  const clusters = 4;
  const labels = ["Growth", "Stable", "Volatile", "Declining"];
  const points = Array.from({ length: 80 }, (_, i) => {
    const c = i % clusters;
    const cx = [2, -2, 0, 1.5][c];
    const cy = [1.5, -1, 2, -2][c];
    return {
      pc1: cx + (Math.random() - 0.5) * 1.6,
      pc2: cy + (Math.random() - 0.5) * 1.6,
      cluster: c,
      label: labels[c],
    };
  });
  const evr = [0.42, 0.27, 0.15, 0.09, 0.04, 0.03];
  let cum = 0;
  const cumulativeVariance = evr.map((v) => { cum += v; return +cum.toFixed(4); });

  const clusterComp = labels.map((l, i) => ({
    cluster: i,
    label: l,
    count: points.filter((p) => p.cluster === i).length,
    avg_return: [0.012, 0.002, 0.006, -0.005][i],
    volatility: [0.014, 0.009, 0.028, 0.02][i],
    trend: ["UP", "SIDEWAYS", "UP", "DOWN"][i],
  }));

  const featureNames = ["Close", "EMA_20", "SMA_20", "BB_upper", "BB_lower", "Open", "High", "Low", "Volatility_20", "Returns", "RSI", "MACD", "Volume"];

  return {
    symbol,
    pca_points: points.map((p) => [p.pc1, p.pc2]),
    explained_variance: evr,
    clusters: points.map((p) => p.cluster),
    rows: 504,
    columns: ["Date", "Open", "High", "Low", "Close", "Volume"],
    sample: {},
    pca_insights: [
      { component: "PC1", theme: "Trend", top_features: ["Close", "EMA_20", "SMA_20"] },
      { component: "PC2", theme: "Volatility", top_features: ["Volatility_20", "Returns", "BB_upper"] },
      { component: "PC3", theme: "Momentum", top_features: ["RSI", "MACD", "Returns"] },
    ],
    trajectory: points.slice(-30).map((p, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString(),
      pc1: p.pc1,
      pc2: p.pc2,
      cluster: p.cluster,
    })),
    price_history: Array.from({ length: 120 }, (_, i) => ({
      date: new Date(Date.now() - (119 - i) * 86400000).toISOString(),
      close: +(160 + Math.sin(i / 12) * 12 + Math.random() * 3).toFixed(2),
    })),
    cluster_comparison: clusterComp,
    market_state: "VOLATILE",
    variance_story: "Top 3 components explain 84.0% of market behavior.",
    // New PCA-deep fields
    component_weights: [
      { component: "PC1", name: "Trend Driver", features: featureNames.map((f) => ({ feature: f, weight: +(Math.random() * 0.8 - 0.4).toFixed(4) })) },
      { component: "PC2", name: "Volatility Axis", features: featureNames.map((f) => ({ feature: f, weight: +(Math.random() * 0.6 - 0.3).toFixed(4) })) },
      { component: "PC3", name: "Momentum Signal", features: featureNames.map((f) => ({ feature: f, weight: +(Math.random() * 0.5 - 0.25).toFixed(4) })) },
    ],
    cumulative_variance: cumulativeVariance,
    dimension_reduction: { raw_features: 13, pca_components: 6, reduction_pct: 53.8, variance_retained: 100.0 },
    pc_values: [
      { component: "PC1", name: "Trend Driver", value: +(Math.random() * 3 - 1.5).toFixed(4), variance_pct: 42.0, interpretation: "Strong bullish trend detected" },
      { component: "PC2", name: "Volatility Axis", value: +(Math.random() * 2 - 1).toFixed(4), variance_pct: 27.0, interpretation: "Normal volatility regime" },
      { component: "PC3", name: "Momentum Signal", value: +(Math.random() * 2 - 1).toFixed(4), variance_pct: 15.0, interpretation: "Momentum in equilibrium" },
      { component: "PC4", name: "Structure Lens", value: +(Math.random() - 0.5).toFixed(4), variance_pct: 9.0, interpretation: "Below-average structural reading" },
    ],
    cluster_distribution: clusterComp.map((c) => ({ cluster: c.cluster, label: c.label, count: c.count, percentage: +(c.count / 80 * 100).toFixed(1) })),
    component_names: { PC1: "Trend Driver", PC2: "Volatility Axis", PC3: "Momentum Signal", PC4: "Structure Lens" },
    pca_prediction_link: [
      { component: "PC1", name: "Trend Driver", value: 0.85, direction: "positive", strength: "strong", impact: "bullish", explanation: "Trend Driver (PC1) shows strong positive signal → bullish pressure on prediction" },
      { component: "PC2", name: "Volatility Axis", value: -0.32, direction: "negative", strength: "moderate", impact: "bearish", explanation: "Volatility Axis (PC2) shows moderate negative signal → bearish pressure on prediction" },
      { component: "PC3", name: "Momentum Signal", value: 0.12, direction: "positive", strength: "weak", impact: "bullish", explanation: "Momentum Signal (PC3) shows weak positive signal → bullish pressure on prediction" },
    ],
  };
};

const dummyPredict = (symbol = "AAPL") => {
  const up = Math.random() > 0.4;
  return {
    symbol,
    predicted_price: +(150 + Math.random() * 80).toFixed(2),
    trend: up ? "UP" : "DOWN",
    confidence: +(0.6 + Math.random() * 0.35).toFixed(2),
    horizon: "1d",
    latest_close: +(150 + Math.random() * 40).toFixed(2),
    expected_change_pct: +(((Math.random() - 0.4) * 4).toFixed(2)),
    reasons: up
      ? [
          "Strong positive trend signal from PC1",
          "Lower volatility regime from PC2",
          "Model expects upside move in next session",
        ]
      : [
          "Weak/negative trend signal from PC1",
          "Elevated volatility pressure from PC2",
          "Model expects downside move in next session",
        ],
  };
};

const dummyComponents = () => ({
  components: [
    { name: "PC1", weight: 0.42 },
    { name: "PC2", weight: 0.27 },
    { name: "PC3", weight: 0.15 },
    { name: "PC4", weight: 0.09 },
    { name: "PC5", weight: 0.04 },
  ],
});

// ---------- API methods ----------
export const analyzeStock = async (symbol) => {
  try {
    const { data } = await client.post("/analyze-stock", { symbol });
    return { data, fallback: false };
  } catch (e) {
    return { data: dummyAnalyze(symbol), fallback: true, error: e.message };
  }
};

export const predictStock = async (symbol) => {
  try {
    const { data } = await client.post("/predict", { symbol });
    return { data, fallback: false };
  } catch (e) {
    return { data: dummyPredict(symbol), fallback: true, error: e.message };
  }
};

export const getComponents = async () => {
  try {
    const { data } = await client.get("/get-components");
    return { data, fallback: false };
  } catch (e) {
    return { data: dummyComponents(), fallback: true, error: e.message };
  }
};

export default client;
