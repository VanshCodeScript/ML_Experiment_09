# Project Report: ML Experiment 09
## SmartStock Insight: Quantum Intelligence Terminal

---

### 1. Executive Summary
**ML Experiment 09** is a high-performance market intelligence platform designed to decode complex financial signals using advanced Machine Learning techniques. The project focuses on transforming raw market data into actionable insights through dimensionality reduction, regime identification, and predictive modeling.

---

### 2. Product Showcase (Interface Analysis)

#### 2.1 Dashboard Overview
The dashboard utilizes a **Glassmorphism** design language, providing a state-of-the-art analytical experience. It features real-time KPI tracking and high-density price action charts.

#### 2.2 Market Regime Explorer (Clustering View)
Using K-Means clustering, the system identifies distinct market "regimes" (e.g., Stable Growth, High Volatility). This allows traders to adjust their strategies based on the current cluster profile.

---

### 3. Deep Dive: PCA (Principal Component Analysis)

#### 3.1 What is PCA?
Principal Component Analysis (PCA) is an unsupervised learning technique used for **dimensionality reduction**. In the context of stock market data, we often deal with dozens of technical indicators (RSI, MACD, Moving Averages, etc.) that are highly correlated with each other.

PCA works by:
1.  **Standardization**: Scaling all features to have a mean of 0 and variance of 1.
2.  **Covariance Matrix Computation**: Finding how indicators move together.
3.  **Eigenvalue Decomposition**: Creating new, uncorrelated variables called **Principal Components (PCs)**.

#### 3.2 Implementation in ML Experiment 09
In this project, PCA is the "intelligence filter" that sits between raw data and the predictive model.

**Key Configuration:**
-   **Explained Variance**: The project is configured to retain **95%** of the original signal variance. This ensures that while we reduce the "noise" (dropping 5% of redundant data), we keep all critical market signals.
-   **Service Logic**: The `PCAService` handles the transformation pipeline, ensuring that every new data point is scaled and projected onto the same coordinate system used during training.

**Benefits:**
-   **Prevents Overfitting**: By reducing the number of input variables for the Random Forest model.
-   **Feature Extraction**: It consolidates overlapping signals (like multiple moving averages) into a single component representing "Trend".

---

### 4. Technical Architecture

#### 4.1 Data Pipeline
The system extracts 13 primary features including:
-   **Price Action**: Open, High, Low, Close, Volume.
-   **Momentum**: RSI, MACD.
-   **Trend**: SMA_20, EMA_20.
-   **Volatility**: Bollinger Bands (Upper/Lower), Rolling Standard Deviation.

#### 4.2 Machine Learning Stack
-   **Clustering (K-Means)**: Segments the market into 5 distinct regimes.
-   **Regression (Random Forest)**: Uses the Principal Components as inputs to predict the `target_return` (percentage change in price for the next period).

---

### 5. Conclusion
**ML Experiment 09** demonstrates a professional-grade implementation of PCA and Clustering in financial technology. By stripping away redundancy and focusing on the core variance of market indicators, the platform provides a significantly clearer view of market dynamics compared to traditional charting tools.
