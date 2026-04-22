# Technical Thesis: ML Experiment 09
## Quantitative Market Intelligence via Dimensionality Reduction & Regime Clustering

---

### 1. Mathematical Foundation of PCA Decomposition

In ML Experiment 09, **Principal Component Analysis (PCA)** is utilized to solve the "Curse of Dimensionality" in high-frequency financial indicators.

#### 1.1 Feature Standardization (Z-Score)
Before decomposition, features are normalized to ensure the variance of each indicator (e.g., Volume in millions vs. RSI in 0-100) is comparable.
$$z = \frac{x - \mu}{\sigma}$$
*Where $\mu$ is the mean and $\sigma$ is the standard deviation.*

#### 1.2 The Covariance Matrix ($\Sigma$)
We compute the relationship between all 13 technical features:
$$\Sigma = \frac{1}{n-1} X^T X$$

#### 1.3 Eigen-Decomposition
The core of the "Quantum Filter" is solving the characteristic equation:
$$Av = \lambda v$$
-   **$\lambda$ (Eigenvalues)**: Represent the amount of variance explained by each new Principal Component.
-   **$v$ (Eigenvectors)**: Define the direction of the new feature space (Loadings).

Our model selects $k$ components such that:
$$\frac{\sum_{i=1}^{k} \lambda_i}{\sum_{j=1}^{d} \lambda_j} \ge 0.95$$

---

### 2. Market Indicator Derivations

The intelligence engine extracts the following quantitative signals from raw price action ($P$):

| Indicator | Formula / Logic | Market Significance |
| :--- | :--- | :--- |
| **RSI** | $100 - [100 / (1 + \frac{AvgGain}{AvgLoss})]$ | Measure of velocity & magnitude of price movements. |
| **MACD** | $EMA_{12}(P) - EMA_{26}(P)$ | Trend-following momentum indicator. |
| **Bollinger Bands** | $SMA_{20}(P) \pm (2 \cdot \sigma_{20})$ | Dynamic volatility envelopes based on standard deviation. |
| **Log Returns** | $\ln(P_t / P_{t-1})$ | Stationarity-preserving return transformation. |

---

### 3. Data Pipeline & Logic Flow

1. **Ingestion**: Fetches OHLCV data from Yahoo Finance.
2. **Standardization**: Z-score normalization.
3. **PCA Solver**: Eigen-decomposition to project data into a lower-dimensional subspace.
4. **Regime Labeler**: K-Means clustering to identify market states.
5. **Prediction**: Random Forest ensemble for return forecasting.

---

### 4. Regime Identification (K-Means)

The system minimizes the **Within-Cluster Sum of Squares (WCSS)** to identify market states:
$$\arg \min_S \sum_{i=1}^{k} \sum_{x \in S_i} \| x - \mu_i \|^2$$

**Detected Regimes in ML Exp 09:**
-   **Cluster 0 (Convergence)**: Low volatility, tight Bollinger Bands.
-   **Cluster 1 (Expansion)**: High momentum, RSI > 70.
-   **Cluster 2 (Contraction)**: RSI < 30, Mean Reversion potential.
-   **Cluster 3 (High Entropy)**: Extreme volume spikes with erratic price action.

---

### 5. Predictive Modeling (Random Forest)

The **Random Forest Regressor** acts as an ensemble of $N=500$ decision trees. Each tree is trained on a bootstrap sample (Bagging) to minimize the **Mean Squared Error (MSE)**:
$$MSE = \frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2$$

---

### 6. Technical Conclusion
ML Experiment 09 represents a rigorous application of **Statistical Arbitrage** and **Unsupervised Learning**. By projecting high-dimensional market noise into a low-dimensional subspace of maximal variance, the system provides a robust platform for algorithmic trend prediction.
