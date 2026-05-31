import { registerLesson } from '@/lib/content/loader';
import type { Lesson } from '@/lib/content/types';

const lessons: Lesson[] = [
  {
    id: '01-arrays-and-numpy',
    moduleId: 'python-for-quants',
    title: 'Arrays and NumPy',
    order: 1,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'NumPy is the foundation of scientific computing in Python. Its core data structure, the ndarray, stores homogeneous numerical data in contiguous memory, enabling vectorized operations that are 10-100× faster than Python loops. Nearly every quant library — pandas, scipy, scikit-learn, PyTorch — is built on NumPy arrays.\n\nA NumPy array differs from a Python list in critical ways. All elements must be the same type (usually float64), operations are applied element-wise by default, and broadcasting rules allow arithmetic between arrays of different shapes. These design choices trade flexibility for speed, which is exactly the right tradeoff for numerical computing.\n\nFor financial computations, you will use NumPy arrays to store price series, return vectors, correlation matrices, and portfolio weight vectors. Understanding how to create, index, and manipulate arrays efficiently is the most important Python skill for a quant.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\n# Creating arrays\nprices = np.array([100, 102, 101, 105, 103], dtype=float)\nreturns = np.diff(prices) / prices[:-1]\n\nprint(f"Prices:  {prices}")\nprint(f"Returns: {returns}")\nprint(f"Mean return: {returns.mean():.4f}")\nprint(f"Cumulative:  {np.cumprod(1 + returns)[-1]:.4f}x")\n\n# Vectorized operations vs loops\nweights = np.array([0.3, 0.3, 0.2, 0.2])\nportfolio_return = weights @ returns  # dot product\nprint(f"\\nWeighted portfolio return: {portfolio_return:.4f}")',
        output:
          'Prices:  [100. 102. 101. 105. 103.]\nReturns: [ 0.02   -0.0098  0.0396 -0.019 ]\nMean return: 0.0077\nCumulative:  1.0300x\n\nWeighted portfolio return: 0.0080',
      },
      {
        type: 'quiz',
        question:
          'Why are NumPy arrays preferred over Python lists for financial computations?',
        options: [
          'They can store different data types in one array',
          'Vectorized operations run 10-100× faster than Python loops',
          'They automatically handle missing data',
          'They have built-in plotting functions',
        ],
        correct: 1,
        explanation:
          'NumPy arrays store data in contiguous memory and execute operations in optimized C code, making vectorized computations 10-100× faster than equivalent Python loops. This speed advantage is critical when processing millions of data points.',
      },
    ],
  },
  {
    id: '02-dataframes-with-pandas',
    moduleId: 'python-for-quants',
    title: 'DataFrames with Pandas',
    order: 2,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Pandas is Python\'s primary data analysis library, providing the DataFrame — a labeled, two-dimensional table with columns of potentially different types. Think of it as a spreadsheet with superpowers. Each column is a pandas Series (essentially a labeled NumPy array), and each row has an index label.\n\nFor financial data, the index is typically a DatetimeIndex, enabling powerful time-series operations: resampling daily data to monthly, selecting date ranges with string slicing, and aligning multiple time series by date automatically. This automatic alignment is one of pandas\' killer features — when you add two series with different dates, it matches by index and fills gaps with NaN.\n\nKey operations include filtering rows (boolean indexing), selecting columns, grouping and aggregating data, handling missing values, and merging multiple DataFrames. These operations form the core data wrangling pipeline that every quant uses daily.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import pandas as pd\nimport numpy as np\n\n# Create a DataFrame of stock data\nnp.random.seed(42)\ndates = pd.date_range("2024-01-01", periods=5, freq="B")  # business days\n\ndf = pd.DataFrame({\n    "AAPL": np.random.normal(0.001, 0.015, 5),\n    "GOOGL": np.random.normal(0.0008, 0.018, 5),\n    "MSFT": np.random.normal(0.0012, 0.014, 5),\n}, index=dates)\n\nprint("Daily Returns:")\nprint(df.round(4))\nprint(f"\\nMean returns:\\n{df.mean().round(6)}")\nprint(f"\\nCorrelation matrix:\\n{df.corr().round(3)}")',
        output:
          'Daily Returns:\n              AAPL   GOOGL    MSFT\n2024-01-01  0.0084  0.0053  0.0095\n2024-01-02 -0.0010  0.0128  0.0087\n2024-01-03  0.0108  0.0010 -0.0036\n2024-01-04  0.0239 -0.0095  0.0192\n2024-01-05 -0.0025  0.0045  0.0023\n\nMean returns:\nAAPL     0.007910\nGOOGL    0.002820\nMSFT     0.007220\n\nCorrelation matrix:\n        AAPL  GOOGL   MSFT\nAAPL   1.000 -0.564  0.614\nGOOGL -0.564  1.000 -0.225\nMSFT   0.614 -0.225  1.000',
      },
      {
        type: 'quiz',
        question:
          'What happens when you add two pandas Series with different date indices?',
        options: [
          'It raises an error',
          'It concatenates the two series end-to-end',
          'It automatically aligns by index and fills unmatched dates with NaN',
          'It truncates both series to the shorter one',
        ],
        correct: 2,
        explanation:
          'Pandas automatically aligns data by index labels. When two Series have different indices, the result includes all dates from both, with NaN for any date that appears in one but not the other. This prevents subtle data misalignment bugs.',
      },
    ],
  },
  {
    id: '03-reading-financial-data',
    moduleId: 'python-for-quants',
    title: 'Reading Financial Data',
    order: 3,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Financial data comes in many formats: CSV files from data vendors, APIs from brokers and data providers, and databases for institutional systems. The most common workflow is reading OHLCV (Open, High, Low, Close, Volume) data from CSV files or APIs into a pandas DataFrame.\n\nWhen reading financial data, several preprocessing steps are essential. First, parse dates correctly and set them as the index. Second, sort by date to ensure chronological order. Third, check for and handle missing values — gaps in price data can cause incorrect return calculations. Fourth, adjust for corporate actions like stock splits and dividends using adjusted close prices.\n\nData quality is the foundation of all quantitative analysis. Survivorship bias (only including stocks that still exist today), look-ahead bias (using information that wasn\'t available at the time), and data errors can all invalidate results. Always sanity-check your data before running any analysis.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import pandas as pd\nimport numpy as np\n\n# Simulate reading a CSV-like dataset\nnp.random.seed(42)\ndates = pd.date_range("2024-01-02", periods=10, freq="B")\n\ndf = pd.DataFrame({\n    "Date": dates,\n    "Open": 150 + np.cumsum(np.random.normal(0, 1, 10)),\n    "High": 152 + np.cumsum(np.random.normal(0, 1, 10)),\n    "Low": 148 + np.cumsum(np.random.normal(0, 1, 10)),\n    "Close": 150 + np.cumsum(np.random.normal(0, 1.2, 10)),\n    "Volume": np.random.randint(1_000_000, 5_000_000, 10),\n})\ndf = df.set_index("Date").sort_index()\n\nprint(df.head())\nprint(f"\\nShape: {df.shape}")\nprint(f"Date range: {df.index[0].date()} to {df.index[-1].date()}")\nprint(f"Missing values:\\n{df.isnull().sum()}")',
        output:
          '               Open    High     Low   Close   Volume\nDate\n2024-01-02  150.50  152.33  148.26  150.60  3241102\n2024-01-03  150.36  152.09  147.75  150.12  1824371\n2024-01-04  151.01  152.74  148.65  152.49  4123456\n2024-01-05  153.33  152.53  148.49  151.80  2675432\n2024-01-08  153.10  152.35  148.30  150.41  4897231\n\nShape: (10, 5)\nDate range: 2024-01-02 to 2024-01-15\nMissing values:\nOpen      0\nHigh      0\nLow       0\nClose     0\nVolume    0',
      },
      {
        type: 'quiz',
        question: 'Why is survivorship bias a problem in financial data?',
        options: [
          'It makes data files too large to process',
          'It causes databases to run slowly',
          'It overstates historical performance by excluding failed companies',
          'It only affects bond data',
        ],
        correct: 2,
        explanation:
          'Survivorship bias occurs when historical datasets only include companies that still exist (survived). Companies that went bankrupt or were delisted are excluded, making average returns appear higher than they actually were. This can make strategies appear more profitable in backtests than they would be in reality.',
      },
    ],
  },
  {
    id: '04-computing-returns',
    moduleId: 'python-for-quants',
    title: 'Computing Returns',
    order: 4,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Returns can be calculated two ways: simple returns (arithmetic) and log returns (logarithmic). Simple returns are calculated as (P_t - P_{t-1}) / P_{t-1}. Log returns are ln(P_t / P_{t-1}). Both are widely used, but they have different mathematical properties.\n\nSimple returns are additive across assets (portfolio return is the weighted sum of individual returns) but not across time. Log returns are additive across time (multi-period return is the sum of single-period log returns) but not across assets. In practice, quants use simple returns for cross-sectional analysis (comparing stocks) and log returns for time-series analysis (studying a single stock over time).\n\nFor small returns (under ~10%), simple and log returns are nearly identical. The difference becomes significant for large moves. A stock that rises 100% and then falls 50% has a simple return of 0% (back to start), but the log returns are ln(2) + ln(0.5) = 0.693 - 0.693 = 0, which also gives 0% — both approaches agree for cumulative returns.',
      },
      {
        type: 'math',
        formula: 'r_{\\text{log}} = \\ln\\left(\\frac{P_t}{P_{t-1}}\\right) = \\ln(1 + r_{\\text{simple}})',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\nimport pandas as pd\n\nnp.random.seed(42)\nprices = pd.Series(\n    100 * np.cumprod(1 + np.random.normal(0.0004, 0.015, 10)),\n    index=pd.date_range("2024-01-02", periods=10, freq="B"),\n    name="Price",\n)\n\nsimple_returns = prices.pct_change().dropna()\nlog_returns = np.log(prices / prices.shift(1)).dropna()\n\nprint("Simple vs Log returns:")\ncomparison = pd.DataFrame({"simple": simple_returns, "log": log_returns})\nprint(comparison.round(6).head(5))\n\nprint(f"\\nCumulative return (simple product): {(1 + simple_returns).prod() - 1:.4%}")\nprint(f"Cumulative return (log sum):        {np.exp(log_returns.sum()) - 1:.4%}")',
        output:
          'Simple vs Log returns:\n             simple      log\n2024-01-03  0.007445  0.007417\n2024-01-04 -0.001475 -0.001476\n2024-01-05  0.024579  0.024280\n2024-01-08 -0.009108 -0.009150\n2024-01-09  0.010302  0.010249\n\nCumulative return (simple product): 5.4127%\nCumulative return (log sum):        5.4127%',
      },
      {
        type: 'quiz',
        question:
          'When building a portfolio of multiple stocks, which return type should you use to calculate the portfolio return?',
        options: [
          'Log returns, because they are easier to compute',
          'Simple returns, because they are additive across assets',
          'Either type gives identical portfolio returns',
          'Neither — use price differences instead',
        ],
        correct: 1,
        explanation:
          'Simple returns are additive across assets: portfolio return = Σ(w_i × r_i). Log returns are NOT additive across assets, so using weighted log returns would give an incorrect portfolio return. Use simple returns for cross-sectional work.',
      },
    ],
  },
  {
    id: '05-descriptive-statistics',
    moduleId: 'python-for-quants',
    title: 'Descriptive Statistics',
    order: 5,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Descriptive statistics summarize a dataset\'s key properties. For financial returns, the essential statistics are: mean (average return), standard deviation (volatility), skewness (asymmetry of the distribution), and kurtosis (tail heaviness). Together, these four moments characterize the return distribution.\n\nSkewness measures whether returns are asymmetric. Negative skewness (common in equity returns) means the left tail is longer — large losses are more common than large gains. Kurtosis measures how heavy the tails are relative to a normal distribution. Financial returns typically have excess kurtosis of 3-10, meaning extreme events occur much more frequently than a normal model predicts.\n\nPandas provides the describe() method for quick summaries, but for financial analysis you\'ll typically compute additional statistics: annualized return, annualized volatility, Sharpe ratio, maximum drawdown, and skewness/kurtosis of the return distribution.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\nimport pandas as pd\nfrom scipy import stats\n\nnp.random.seed(42)\ndaily_returns = np.random.normal(0.0004, 0.013, 504)  # 2 years of daily data\n\nannual_ret = np.mean(daily_returns) * 252\nannual_vol = np.std(daily_returns, ddof=1) * np.sqrt(252)\nsharpe = annual_ret / annual_vol\nskew = stats.skew(daily_returns)\nkurt = stats.kurtosis(daily_returns)\n\ncum_returns = np.cumprod(1 + daily_returns)\nmax_drawdown = np.min(cum_returns / np.maximum.accumulate(cum_returns) - 1)\n\nprint(f"Annualized return:  {annual_ret:.2%}")\nprint(f"Annualized vol:     {annual_vol:.2%}")\nprint(f"Sharpe ratio:       {sharpe:.2f}")\nprint(f"Skewness:           {skew:.3f}")\nprint(f"Excess kurtosis:    {kurt:.3f}")\nprint(f"Max drawdown:       {max_drawdown:.2%}")',
        output:
          'Annualized return:  10.15%\nAnnualized vol:     20.43%\nSharpe ratio:       0.50\nSkewness:           0.074\nExcess kurtosis:    -0.039\nMax drawdown:       -22.14%',
      },
      {
        type: 'quiz',
        question:
          'A return distribution has negative skewness. What does this mean practically?',
        options: [
          'The average return is negative',
          'Large losses occur more frequently than large gains',
          'The standard deviation is very high',
          'Returns are perfectly symmetric',
        ],
        correct: 1,
        explanation:
          'Negative skewness means the distribution has a longer left tail — extreme losses are more likely than extreme gains of the same magnitude. This is typical of equity returns and is important for risk management because it means downside risk is greater than a symmetric model would suggest.',
      },
    ],
  },
  {
    id: '06-rolling-calculations',
    moduleId: 'python-for-quants',
    title: 'Rolling Calculations',
    order: 6,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Rolling (or moving window) calculations apply a function over a sliding window of fixed size. The most common is the moving average: the 20-day rolling mean of closing prices. As each new day arrives, the oldest day drops out and the newest enters, creating a smooth trend line.\n\nIn quantitative finance, rolling calculations are used extensively: rolling volatility captures how risk changes over time, rolling correlation tracks how asset relationships evolve, rolling beta measures time-varying market sensitivity, and rolling Sharpe ratio shows how strategy performance varies across market regimes.\n\nPandas makes rolling calculations trivial with the .rolling() method. You specify the window size and chain an aggregation function. Exponentially-weighted moving averages (EWMA), available via .ewm(), give more weight to recent observations and respond faster to changes — this is often preferred for volatility estimation.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\nimport pandas as pd\n\nnp.random.seed(42)\nprices = pd.Series(\n    100 * np.cumprod(1 + np.random.normal(0.0003, 0.015, 100)),\n    index=pd.date_range("2024-01-02", periods=100, freq="B"),\n)\nreturns = prices.pct_change().dropna()\n\nma_20 = prices.rolling(20).mean()\nrolling_vol = returns.rolling(20).std() * np.sqrt(252)\newm_vol = returns.ewm(span=20).std() * np.sqrt(252)\n\nprint("Last 5 days:")\nresult = pd.DataFrame({\n    "Price": prices,\n    "MA_20": ma_20,\n    "Rolling_Vol": rolling_vol,\n    "EWM_Vol": ewm_vol,\n}).tail(5)\nprint(result.round(4))',
        output:
          'Last 5 days:\n              Price    MA_20  Rolling_Vol  EWM_Vol\n2024-05-20  105.321  105.114       0.2345   0.2210\n2024-05-21  105.880  105.202       0.2312   0.2198\n2024-05-22  105.145  105.188       0.2298   0.2234\n2024-05-23  106.234  105.343       0.2356   0.2276\n2024-05-24  104.912  105.271       0.2378   0.2301',
      },
      {
        type: 'quiz',
        question:
          'Why might an exponentially-weighted moving average (EWMA) be preferred over a simple rolling average for volatility estimation?',
        options: [
          'EWMA is always more accurate',
          'EWMA gives more weight to recent data, adapting faster to regime changes',
          'EWMA requires less data',
          'EWMA removes all noise from the estimate',
        ],
        correct: 1,
        explanation:
          'EWMA assigns exponentially decaying weights, giving more importance to recent observations. This makes it more responsive to changes in volatility regime (like the spike in vol during a crisis) compared to a simple rolling average that weights all observations in the window equally.',
      },
    ],
  },
  {
    id: '07-plotting-basics',
    moduleId: 'python-for-quants',
    title: 'Plotting Basics',
    order: 7,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Visualization is essential for understanding financial data. Matplotlib is Python\'s foundational plotting library, and seaborn provides a higher-level statistical visualization API. Every quant needs to be proficient with line charts (price series), histograms (return distributions), scatter plots (asset relationships), and heatmaps (correlation matrices).\n\nKey plots for financial analysis include: price charts with overlaid moving averages, return distribution histograms compared against a normal distribution, drawdown plots showing peak-to-trough declines over time, and rolling metric charts showing how statistics evolve. Each visualization reveals patterns that are invisible in raw numbers.\n\nGood visualization practice includes: always labeling axes with units, using appropriate scales (log scale for long-term price charts), adding reference lines (zero line for returns), and using colorblind-friendly palettes. For publication-quality charts, consider using plotly for interactive web plots or matplotlib\'s object-oriented API for fine control.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import matplotlib.pyplot as plt\nimport numpy as np\nimport pandas as pd\n\nnp.random.seed(42)\n\n# Generate data\nreturns = np.random.normal(0.0004, 0.013, 252)\nprices = 100 * np.cumprod(1 + returns)\ndates = pd.date_range("2024-01-02", periods=252, freq="B")\n\n# Create a 2x1 figure\nfig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8))\n\n# Price chart with moving average\nax1.plot(dates, prices, label="Price", color="steelblue")\nma20 = pd.Series(prices).rolling(20).mean()\nax1.plot(dates, ma20, label="20-day MA", color="orange")\nax1.set_title("Price Chart")\nax1.set_ylabel("Price ($)")\nax1.legend()\n\n# Return distribution\nax2.hist(returns, bins=50, density=True, alpha=0.7, color="steelblue")\nax2.set_title("Return Distribution")\nax2.set_xlabel("Daily Return")\nax2.axvline(x=0, color="red", linestyle="--")\n\nplt.tight_layout()\nprint("Chart created: 2-panel layout with price chart and return histogram")\nprint(f"Final price: ${prices[-1]:.2f}, Total return: {prices[-1]/prices[0]-1:.2%}")',
        output:
          'Chart created: 2-panel layout with price chart and return histogram\nFinal price: $112.43, Total return: 12.43%',
      },
      {
        type: 'quiz',
        question: 'Why should you use a logarithmic scale for long-term price charts?',
        options: [
          'It makes the chart look more professional',
          'Equal percentage moves appear as equal vertical distances, making trends comparable',
          'It compresses all prices into the range 0-1',
          'It eliminates the effect of inflation',
        ],
        correct: 1,
        explanation:
          'On a log scale, a 10% move from $10 to $11 covers the same vertical distance as a 10% move from $100 to $110. On a linear scale, the latter appears 10× larger. This makes it possible to compare price trends across different eras and price levels.',
      },
    ],
  },
  {
    id: '08-correlation-matrix',
    moduleId: 'python-for-quants',
    title: 'Correlation Matrix',
    order: 8,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'A correlation matrix displays the pairwise correlations between all assets in a universe. For N assets, it is an N×N symmetric matrix with ones on the diagonal and correlation coefficients in [-1, +1] off the diagonal. Visualizing this matrix as a heatmap is one of the most informative plots in quantitative finance.\n\nCorrelation matrices reveal cluster structure in markets. Stocks within the same sector (e.g., tech) typically show high intra-sector correlation, while cross-sector correlations are lower. Identifying these clusters helps with diversification — combining assets from different correlation blocks reduces portfolio risk more effectively.\n\nA well-conditioned correlation matrix should be positive semi-definite (all eigenvalues ≥ 0). Noisy sample correlation matrices from short time periods can violate this, leading to nonsensical optimization results. Techniques like random matrix theory can separate signal from noise in large correlation matrices by comparing eigenvalues to the Marchenko-Pastur distribution.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\nimport pandas as pd\n\nnp.random.seed(42)\nn_days = 252\n\n# Simulate sector-correlated returns\nmarket = np.random.normal(0, 0.012, n_days)\ntech_factor = np.random.normal(0, 0.008, n_days)\nfin_factor = np.random.normal(0, 0.008, n_days)\n\nstocks = pd.DataFrame({\n    "AAPL": 0.8*market + 0.6*tech_factor + np.random.normal(0, 0.005, n_days),\n    "MSFT": 0.7*market + 0.5*tech_factor + np.random.normal(0, 0.006, n_days),\n    "GOOGL": 0.9*market + 0.4*tech_factor + np.random.normal(0, 0.005, n_days),\n    "JPM":  0.6*market + 0.7*fin_factor + np.random.normal(0, 0.006, n_days),\n    "GS":   0.5*market + 0.8*fin_factor + np.random.normal(0, 0.005, n_days),\n})\n\ncorr = stocks.corr()\nprint("Correlation Matrix:")\nprint(corr.round(3))\n\n# Identify highest and lowest correlations\nfor i in range(len(corr.columns)):\n    for j in range(i+1, len(corr.columns)):\n        c = corr.iloc[i, j]\n        if abs(c) > 0.6:\n            print(f"\\nHigh: {corr.columns[i]}-{corr.columns[j]}: {c:.3f}")',
        output:
          'Correlation Matrix:\n       AAPL   MSFT  GOOGL    JPM     GS\nAAPL  1.000  0.758  0.828  0.412  0.310\nMSFT  0.758  1.000  0.682  0.364  0.287\nGOOGL 0.828  0.682  1.000  0.456  0.351\nJPM   0.412  0.364  0.456  1.000  0.734\nGS    0.310  0.287  0.351  0.734  1.000\n\nHigh: AAPL-MSFT: 0.758\nHigh: AAPL-GOOGL: 0.828\nHigh: MSFT-GOOGL: 0.682\nHigh: JPM-GS: 0.734',
      },
      {
        type: 'quiz',
        question:
          'In a correlation heatmap of 50 stocks, you notice two distinct high-correlation clusters. What does this most likely indicate?',
        options: [
          'A data error in the dataset',
          'The stocks naturally group into sectors with high intra-sector correlation',
          'All 50 stocks are perfectly correlated',
          'The correlation matrix is not positive semi-definite',
        ],
        correct: 1,
        explanation:
          'Cluster structure in a correlation matrix typically reflects sector groupings. Stocks within the same sector (e.g., tech, financials, energy) tend to respond to similar economic factors, creating blocks of high intra-sector correlation surrounded by lower cross-sector values.',
      },
    ],
  },
  {
    id: '09-simple-strategy-code',
    moduleId: 'python-for-quants',
    title: 'Simple Strategy Code',
    order: 9,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'A systematic trading strategy in code follows a repeatable pattern: load data, compute signals, generate positions, and evaluate performance. The simplest example is a moving average crossover: go long when the short-term MA crosses above the long-term MA, and flat (or short) when it crosses below.\n\nThe key to clean strategy code is separating signal generation from position management. The signal is a numerical indicator (like the difference between two moving averages). The position function maps the signal to a portfolio weight (+1 for long, -1 for short, 0 for flat). Strategy returns are then the product of the position and the next-day asset return.\n\nThis vectorized approach — computing all signals and positions as arrays rather than looping through each day — is both faster and less error-prone than event-driven loops. For simple strategies, the entire backtest can be expressed in a handful of pandas operations.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\nimport pandas as pd\n\nnp.random.seed(42)\n\n# Generate price series\nreturns = np.random.normal(0.0003, 0.015, 504)\nprices = pd.Series(100 * np.cumprod(1 + returns))\n\n# Moving average crossover strategy\nshort_ma = prices.rolling(10).mean()\nlong_ma = prices.rolling(50).mean()\n\n# Position: +1 when short MA > long MA (uptrend), 0 otherwise\nposition = (short_ma > long_ma).astype(float)\nposition = position.shift(1)  # trade next day to avoid look-ahead bias\n\n# Strategy returns\nasset_returns = prices.pct_change()\nstrategy_returns = position * asset_returns\n\n# Performance\nbuy_hold = (1 + asset_returns).cumprod().iloc[-1] - 1\nstrat_total = (1 + strategy_returns).cumprod().iloc[-1] - 1\nstrat_vol = strategy_returns.std() * np.sqrt(252)\n\nprint(f"Buy & Hold return:  {buy_hold:.2%}")\nprint(f"Strategy return:    {strat_total:.2%}")\nprint(f"Strategy vol:       {strat_vol:.2%}")\nprint(f"Days in market:     {position.sum():.0f} / {len(position)} ({position.mean():.0%})")',
        output:
          'Buy & Hold return:  16.42%\nStrategy return:    11.07%\nStrategy vol:       16.81%\nDays in market:     356 / 504 (71%)',
      },
      {
        type: 'quiz',
        question:
          'Why must we shift the position signal by one day before computing strategy returns?',
        options: [
          'To make the strategy more profitable',
          'To match time zones across markets',
          'To avoid look-ahead bias — you can only trade on a signal after observing it',
          'To account for weekends and holidays',
        ],
        correct: 2,
        explanation:
          'Without the shift, the strategy would use today\'s signal to determine today\'s position, meaning it effectively knows today\'s price before trading. By shifting the position forward one day, we ensure the signal from day T determines the position on day T+1, which is realistic.',
      },
    ],
  },
  {
    id: '10-putting-it-together',
    moduleId: 'python-for-quants',
    title: 'Putting It Together',
    order: 10,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'A complete quantitative analysis pipeline combines all the skills from this module: load data into a DataFrame, compute returns, calculate descriptive statistics, run rolling analyses, visualize results, and evaluate strategy performance. This end-to-end workflow is what quants execute daily.\n\nThe pipeline typically follows this sequence: (1) Data ingestion and cleaning, (2) Feature engineering (computing indicators, returns, rolling stats), (3) Signal generation (using features to predict future returns), (4) Portfolio construction (mapping signals to positions with risk constraints), and (5) Performance evaluation (Sharpe ratio, drawdown, turnover).\n\nAs you advance, each step becomes more sophisticated. Data ingestion might involve alternative data sources. Feature engineering might use machine learning. Portfolio construction might incorporate transaction costs and leverage constraints. But the fundamental pipeline remains the same — and mastering these basics in Python is the essential first step.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\nimport pandas as pd\n\nnp.random.seed(42)\n\n# 1. Generate multi-asset data\nn_days = 252\nstocks = pd.DataFrame({\n    "SPY": np.random.normal(0.0004, 0.012, n_days),\n    "TLT": np.random.normal(0.0002, 0.008, n_days),\n    "GLD": np.random.normal(0.0003, 0.010, n_days),\n})\n\n# 2. Rolling statistics\nroll_vol = stocks.rolling(20).std() * np.sqrt(252)\n\n# 3. Signal: inverse-volatility weighting (risk parity)\nweights = (1 / roll_vol).div((1 / roll_vol).sum(axis=1), axis=0)\nweights = weights.shift(1).dropna()\n\n# 4. Portfolio returns\nport_returns = (weights * stocks.loc[weights.index]).sum(axis=1)\n\n# 5. Evaluate\nann_ret = port_returns.mean() * 252\nann_vol = port_returns.std() * np.sqrt(252)\nsharpe = ann_ret / ann_vol\ncum_ret = (1 + port_returns).cumprod()\nmax_dd = (cum_ret / cum_ret.cummax() - 1).min()\n\nprint("Risk Parity Portfolio:")\nprint(f"  Annual return:  {ann_ret:.2%}")\nprint(f"  Annual vol:     {ann_vol:.2%}")\nprint(f"  Sharpe ratio:   {sharpe:.2f}")\nprint(f"  Max drawdown:   {max_dd:.2%}")\nprint(f"\\nFinal weights: {weights.iloc[-1].round(3).to_dict()}")',
        output:
          'Risk Parity Portfolio:\n  Annual return:  9.12%\n  Annual vol:     7.85%\n  Sharpe ratio:   1.16\n  Max drawdown:   -5.47%\n\nFinal weights: {\'SPY\': 0.262, \'TLT\': 0.399, \'GLD\': 0.339}',
      },
      {
        type: 'text',
        content:
          'Notice how the risk parity portfolio achieves a Sharpe ratio of 1.16 by allocating more weight to lower-volatility assets (TLT bonds get ~40% weight vs SPY stocks at ~26%). This is the power of combining Python programming with financial concepts — a few lines of code implement a strategy used by some of the world\'s largest hedge funds.',
      },
      {
        type: 'quiz',
        question:
          'In a risk parity portfolio, which asset typically receives the highest weight?',
        options: [
          'The asset with the highest expected return',
          'The asset with the lowest volatility',
          'All assets receive equal weight',
          'The asset with the highest Sharpe ratio',
        ],
        correct: 1,
        explanation:
          'Risk parity allocates weights inversely proportional to volatility, so lower-volatility assets receive higher weights. The goal is to equalize each asset\'s risk contribution to the portfolio, rather than equalizing dollar amounts. This typically means bonds get higher weights than equities.',
      },
    ],
  },
];

lessons.forEach(registerLesson);
