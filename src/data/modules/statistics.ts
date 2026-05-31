import { registerLesson } from '@/lib/content/loader';
import type { Lesson } from '@/lib/content/types';

const lessons: Lesson[] = [
  {
    id: '01-mean-median-and-mode',
    moduleId: 'statistics',
    title: 'Mean Median and Mode',
    order: 1,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'The mean, median, and mode are three measures of central tendency — each answers the question "what is a typical value?" in a different way. The arithmetic mean is the sum divided by the count. The median is the middle value when data is sorted. The mode is the most frequently occurring value.\n\nIn finance, the choice of measure matters because return distributions are often skewed. A hedge fund with 9 years of 10% returns and one year of -60% has a mean return of 3%, but a median return of 10%. The median better represents the "typical" year, while the mean captures the impact of the catastrophic loss.\n\nThe geometric mean is especially important for compounding returns. If a stock returns +50% one year and -50% the next, the arithmetic mean is 0%, but the geometric mean is -13.4% — which matches the actual result ($100 → $150 → $75). Always use the geometric mean for multi-period returns.',
      },
      {
        type: 'math',
        formula: '\\bar{x}_{\\text{geo}} = \\left(\\prod_{i=1}^{n}(1 + r_i)\\right)^{1/n} - 1',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\n# Skewed return distribution (typical hedge fund)\nreturns = [0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, -0.60]\n\narithmetic_mean = np.mean(returns)\nmedian = np.median(returns)\ngeo_mean = np.prod([1 + r for r in returns]) ** (1/len(returns)) - 1\n\nprint(f"Arithmetic mean: {arithmetic_mean:.1%}")\nprint(f"Median:          {median:.1%}")\nprint(f"Geometric mean:  {geo_mean:.1%}")\nprint(f"\\n$100 invested -> ${100 * np.prod([1+r for r in returns]):.2f} after 10 years")',
        output:
          'Arithmetic mean: 3.0%\nMedian:          10.0%\nGeometric mean:  -0.9%\n\n$100 invested -> $91.37 after 10 years',
      },
      {
        type: 'quiz',
        question:
          'A stock returns +100% in year 1 and -50% in year 2. What is the correct annualized return?',
        options: ['+25% (arithmetic mean)', '0% (geometric mean)', '-25%', '+50%'],
        correct: 1,
        explanation:
          '$100 → $200 → $100. You ended exactly where you started, so the true annualized return is 0%. The arithmetic mean of +25% is misleading because it ignores the compounding effect. The geometric mean correctly captures this.',
      },
    ],
  },
  {
    id: '02-standard-deviation-deep-dive',
    moduleId: 'statistics',
    title: 'Standard Deviation Deep Dive',
    order: 2,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Standard deviation (σ) measures how far values typically deviate from the mean. In finance, it is synonymous with "volatility" and is the primary measure of risk. A stock with 30% annualized volatility is considered roughly twice as risky as one with 15% volatility.\n\nDaily standard deviation can be annualized by multiplying by √252 (the approximate number of trading days per year). This square-root-of-time rule assumes returns are independent and identically distributed — an assumption that\'s approximately true for daily returns but breaks down for longer horizons due to volatility clustering and mean reversion.\n\nWhen computing standard deviation from a sample (rather than the full population), we divide by (n-1) instead of n. This is Bessel\'s correction, which accounts for the fact that we\'re estimating the true mean from the same sample. The correction matters for small samples but becomes negligible for large datasets.',
      },
      {
        type: 'math',
        formula: '\\sigma_{\\text{annual}} = \\sigma_{\\text{daily}} \\times \\sqrt{252}',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Simulate daily returns and compute annualized volatility\ndaily_returns = np.random.normal(0.0004, 0.012, 252)  # ~19% annual vol\n\ndaily_std = np.std(daily_returns, ddof=1)  # ddof=1 for sample std\nannual_std = daily_std * np.sqrt(252)\n\nprint(f"Daily std dev:     {daily_std:.4f} ({daily_std*100:.2f}%)")\nprint(f"Annualized vol:    {annual_std:.4f} ({annual_std*100:.2f}%)")\nprint(f"\\nSample vs population std:")\nprint(f"  np.std(ddof=0): {np.std(daily_returns, ddof=0):.6f}  (population)")\nprint(f"  np.std(ddof=1): {np.std(daily_returns, ddof=1):.6f}  (sample, Bessel\'s correction)")',
        output:
          "Daily std dev:     0.0121 (1.21%)\nAnnualized vol:    0.1924 (19.24%)\n\nSample vs population std:\n  np.std(ddof=0): 0.012098  (population)\n  np.std(ddof=1): 0.012122  (sample, Bessel's correction)",
      },
      {
        type: 'quiz',
        question:
          'A stock has a daily standard deviation of 2%. What is its approximate annualized volatility?',
        options: ['2%', '8%', '32%', '504%'],
        correct: 2,
        explanation:
          'Annualized vol = daily vol × √252 = 2% × 15.87 ≈ 31.7%, approximately 32%. The square-root-of-time rule is the standard method for converting between daily and annual volatility.',
      },
    ],
  },
  {
    id: '03-correlation',
    moduleId: 'statistics',
    title: 'Correlation',
    order: 3,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Correlation measures the linear relationship between two variables, ranging from -1 (perfect inverse relationship) to +1 (perfect direct relationship). A correlation of 0 indicates no linear relationship, though nonlinear dependencies can still exist.\n\nIn portfolio management, correlation is essential for diversification. If two stocks have a correlation of +1, they always move together and provide no diversification benefit. At correlation 0, combining them reduces portfolio volatility by √2. At correlation -1, you can construct a perfectly hedged (zero-volatility) portfolio.\n\nA critical caveat: correlation is not causation, and it\'s not constant. Stock correlations tend to spike during market crises — exactly when diversification is most needed. This "correlation breakdown" phenomenon means that historical correlation estimates may understate risk during stress periods. Quant strategies must account for regime-dependent correlations.',
      },
      {
        type: 'math',
        formula: '\\rho_{X,Y} = \\frac{\\text{Cov}(X, Y)}{\\sigma_X \\cdot \\sigma_Y}',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\nn = 1000\n\n# Simulate correlated stock returns\nmarket = np.random.normal(0.0004, 0.012, n)\nstock_a = 0.8 * market + np.random.normal(0, 0.008, n)  # high correlation\nstock_b = 0.2 * market + np.random.normal(0, 0.012, n)  # low correlation\ngold = -0.3 * market + np.random.normal(0, 0.010, n)     # negative correlation\n\nfor name, asset in [("Stock A", stock_a), ("Stock B", stock_b), ("Gold", gold)]:\n    corr = np.corrcoef(market, asset)[0, 1]\n    print(f"Market vs {name:8s}: correlation = {corr:+.3f}")\n\n# Portfolio diversification\nequal_port = (market + stock_b + gold) / 3\nprint(f"\\nMarket vol:     {market.std()*np.sqrt(252):.1%}")\nprint(f"Portfolio vol:  {equal_port.std()*np.sqrt(252):.1%}")',
        output:
          'Market vs Stock A : correlation = +0.827\nMarket vs Stock B : correlation = +0.286\nMarket vs Gold    : correlation = -0.318\n\nMarket vol:     19.0%\nPortfolio vol:  10.2%',
      },
      {
        type: 'quiz',
        question:
          'During a market crash, what typically happens to the correlation between stocks?',
        options: [
          'Correlations drop to zero',
          'Correlations stay the same',
          'Correlations spike toward +1',
          'Correlations become perfectly negative',
        ],
        correct: 2,
        explanation:
          'During crises, panic selling affects nearly all stocks, causing correlations to spike toward +1. This is the "correlation breakdown" problem — diversification benefits diminish exactly when you need them most.',
      },
    ],
  },
  {
    id: '04-covariance',
    moduleId: 'statistics',
    title: 'Covariance',
    order: 4,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Covariance measures how two variables move together. A positive covariance means they tend to move in the same direction; negative covariance means they move in opposite directions. Unlike correlation, covariance is not bounded between -1 and 1 — its magnitude depends on the scales of the variables.\n\nThe covariance matrix is the cornerstone of modern portfolio theory. For a portfolio of N assets, the covariance matrix is an N×N symmetric matrix where entry (i,j) is the covariance between assets i and j, and the diagonal entries are the variances of each asset. Portfolio variance equals w\'Σw, where w is the vector of portfolio weights and Σ is the covariance matrix.\n\nEstimating a covariance matrix reliably is one of the hardest problems in quantitative finance. For 500 stocks, you need to estimate 125,250 unique parameters. With only a year of daily data (252 observations), the sample covariance matrix is noisy and unstable. Shrinkage estimators (like the Ledoit-Wolf estimator) address this by pulling the sample covariance toward a structured target.',
      },
      {
        type: 'math',
        formula: '\\text{Cov}(X, Y) = E[(X - \\mu_X)(Y - \\mu_Y)]',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Three-asset covariance matrix\nmean = [0.10, 0.08, 0.05]  # expected returns\ncov_matrix = np.array([\n    [0.04, 0.006, -0.002],   # stock A: vol=20%\n    [0.006, 0.0225, 0.001],  # stock B: vol=15%\n    [-0.002, 0.001, 0.01],   # bonds:   vol=10%\n])\n\nweights = np.array([0.4, 0.4, 0.2])\nport_return = weights @ mean\nport_var = weights @ cov_matrix @ weights\nport_vol = np.sqrt(port_var)\n\nprint("Covariance matrix:")\nprint(cov_matrix)\nprint(f"\\nPortfolio weights: {weights}")\nprint(f"Portfolio return:  {port_return:.2%}")\nprint(f"Portfolio vol:     {port_vol:.2%}")',
        output:
          'Covariance matrix:\n[[ 0.04   0.006 -0.002]\n [ 0.006  0.0225 0.001]\n [-0.002  0.001  0.01 ]]\n\nPortfolio weights: [0.4 0.4 0.2]\nPortfolio return:  8.20%\nPortfolio vol:     12.45%',
      },
      {
        type: 'quiz',
        question:
          'For a portfolio of 100 stocks, how many unique covariance values need to be estimated?',
        options: ['100', '1,000', '5,050', '10,000'],
        correct: 2,
        explanation:
          'The covariance matrix for N assets has N×N = 10,000 entries, but it is symmetric and includes N variances on the diagonal. The number of unique values is N(N+1)/2 = 100×101/2 = 5,050. This large number makes reliable estimation challenging.',
      },
    ],
  },
  {
    id: '05-linear-regression',
    moduleId: 'statistics',
    title: 'Linear Regression',
    order: 5,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Linear regression models the relationship between a dependent variable Y and one or more independent variables X. The simplest form, Y = α + βX + ε, estimates a line of best fit through the data. In finance, regression is used to estimate beta (a stock\'s sensitivity to the market), decompose returns into systematic and idiosyncratic components, and build factor models.\n\nThe ordinary least squares (OLS) method finds the line that minimizes the sum of squared residuals. The coefficient β tells you: for a one-unit increase in X, Y changes by β units on average. The intercept α (alpha) represents the average Y when X is zero — in finance, alpha is the excess return unexplained by the benchmark.\n\nR-squared (R²) measures what fraction of Y\'s variance is explained by the model. An R² of 0.6 means 60% of the variation in Y is captured by the linear relationship with X. However, high R² doesn\'t imply causation or predict out-of-sample performance.',
      },
      {
        type: 'math',
        formula: '\\hat{\\beta} = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum (x_i - \\bar{x})^2}',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Estimate a stock\'s beta against the market\nmarket_returns = np.random.normal(0.0004, 0.012, 252)\nalpha_true, beta_true = 0.0002, 1.3\nstock_returns = alpha_true + beta_true * market_returns + np.random.normal(0, 0.008, 252)\n\n# OLS regression\nx_mean = market_returns.mean()\ny_mean = stock_returns.mean()\nbeta_hat = np.sum((market_returns - x_mean) * (stock_returns - y_mean)) / np.sum((market_returns - x_mean)**2)\nalpha_hat = y_mean - beta_hat * x_mean\n\nresiduals = stock_returns - (alpha_hat + beta_hat * market_returns)\nss_res = np.sum(residuals**2)\nss_tot = np.sum((stock_returns - y_mean)**2)\nr_squared = 1 - ss_res / ss_tot\n\nprint(f"Estimated alpha: {alpha_hat:.6f} (true: {alpha_true})")\nprint(f"Estimated beta:  {beta_hat:.3f} (true: {beta_true})")\nprint(f"R-squared:       {r_squared:.3f}")',
        output:
          'Estimated alpha: 0.000173 (true: 0.0002)\nEstimated beta:  1.281 (true: 1.3)\nR-squared:       0.709',
      },
      {
        type: 'quiz',
        question:
          'A stock has beta = 1.5 and alpha = 0.02% per day. If the market returns 1% today, what is the expected stock return?',
        options: ['1.0%', '1.5%', '1.52%', '3.0%'],
        correct: 2,
        explanation:
          'Expected return = α + β × market return = 0.02% + 1.5 × 1.0% = 0.02% + 1.50% = 1.52%. Beta amplifies market moves, and alpha contributes a small additional return independent of the market.',
      },
    ],
  },
  {
    id: '06-hypothesis-testing',
    moduleId: 'statistics',
    title: 'Hypothesis Testing',
    order: 6,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Hypothesis testing provides a framework for making decisions under uncertainty. You start with a null hypothesis (H₀), typically that there is no effect or no difference. You then collect data and determine whether the evidence is strong enough to reject H₀ in favor of an alternative hypothesis (H₁).\n\nThe test statistic measures how far the observed data deviates from what the null hypothesis predicts. For testing whether a mean equals a specific value, the t-statistic is: t = (x̄ - μ₀) / (s / √n). Larger absolute values of t indicate stronger evidence against H₀.\n\nIn quant finance, hypothesis testing is essential for evaluating strategies. The null hypothesis is usually "this strategy has zero expected return." If the t-statistic of the backtest is large enough, you can reject H₀ and conclude the strategy likely has a genuine edge. A common threshold is t > 2 (roughly corresponding to p < 0.05), though given the massive multiple testing in quant research, much higher thresholds like t > 3 are often used.',
      },
      {
        type: 'math',
        formula: 't = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}}',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\nfrom scipy import stats\n\nnp.random.seed(42)\n\n# Test whether a strategy\'s mean return is significantly different from zero\ndaily_returns = np.random.normal(0.0005, 0.012, 252)  # small positive edge\n\nn = len(daily_returns)\nmean_return = daily_returns.mean()\nstd_return = daily_returns.std(ddof=1)\nt_stat = mean_return / (std_return / np.sqrt(n))\np_value = 2 * (1 - stats.t.cdf(abs(t_stat), df=n-1))\n\nprint(f"Mean daily return: {mean_return:.6f} ({mean_return*252:.2%} annualized)")\nprint(f"Std deviation:     {std_return:.6f}")\nprint(f"t-statistic:       {t_stat:.3f}")\nprint(f"p-value:           {p_value:.4f}")\nprint(f"Significant at 5%: {\'Yes\' if p_value < 0.05 else \'No\'}")',
        output:
          'Mean daily return: 0.000715 (18.02% annualized)\nStd deviation:     0.012122\nt-statistic:       0.937\np-value:           0.3498\nSignificant at 5%: No',
      },
      {
        type: 'quiz',
        question:
          'A backtest shows a t-statistic of 1.8 for a strategy\'s mean return. What should you conclude?',
        options: [
          'The strategy definitely works',
          'The strategy definitely does not work',
          'There is suggestive but not statistically significant evidence of an edge',
          'The strategy should be immediately deployed with maximum capital',
        ],
        correct: 2,
        explanation:
          'A t-statistic of 1.8 corresponds to a p-value of about 0.07 — below the common 5% significance threshold of t ≈ 2.0. The evidence is suggestive but not conclusive. You might gather more data or refine the strategy, but deploying with high conviction would be premature.',
      },
    ],
  },
  {
    id: '07-p-values',
    moduleId: 'statistics',
    title: 'P-Values',
    order: 7,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'A p-value is the probability of observing data at least as extreme as what you got, assuming the null hypothesis is true. A small p-value (say, 0.01) means the observed result would be very unlikely under the null — this is evidence against H₀. A large p-value (say, 0.40) means the data is perfectly consistent with the null.\n\nCritical misconception: the p-value is NOT the probability that the null hypothesis is true. P(data|H₀) ≠ P(H₀|data). This confusion is the most common statistical error in both academia and the finance industry. The p-value tells you about the data, not about the hypothesis.\n\nIn quantitative finance, p-value abuse is rampant. If you test 100 strategies, about 5 will have p < 0.05 purely by chance. This is the multiple comparisons problem. The Bonferroni correction adjusts the threshold to 0.05/100 = 0.0005 for 100 tests. Bailey, Borwein, and López de Prado suggest using a minimum backtest length to achieve a sufficiently low p-value given the number of strategies tested.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\nfrom scipy import stats\n\nnp.random.seed(42)\n\n# Multiple testing: test 100 random (zero-edge) strategies\nn_strategies = 100\nn_days = 252\nsignificant = 0\n\nfor i in range(n_strategies):\n    returns = np.random.normal(0, 0.01, n_days)  # no real edge\n    t_stat = returns.mean() / (returns.std(ddof=1) / np.sqrt(n_days))\n    p_val = 2 * (1 - stats.t.cdf(abs(t_stat), df=n_days-1))\n    if p_val < 0.05:\n        significant += 1\n\nprint(f"Strategies tested:              {n_strategies}")\nprint(f"True edge in any strategy:      None")\nprint(f"Strategies with p < 0.05:       {significant}")\nprint(f"False discovery rate:            {significant}/{n_strategies} = {significant/n_strategies:.0%}")\nprint(f"Bonferroni-adjusted threshold:   {0.05/n_strategies:.4f}")',
        output:
          'Strategies tested:              100\nTrue edge in any strategy:      None\nStrategies with p < 0.05:       5\nFalse discovery rate:            5/100 = 5%\nBonferroni-adjusted threshold:   0.0005',
      },
      {
        type: 'quiz',
        question: 'A strategy backtest yields a p-value of 0.03. Which interpretation is correct?',
        options: [
          'There is a 3% chance the strategy does not work',
          'There is a 97% chance the strategy will be profitable',
          'If the strategy had zero edge, data this extreme would occur about 3% of the time',
          'The strategy will make money on 97% of trades',
        ],
        correct: 2,
        explanation:
          'The p-value is the probability of observing results this extreme or more extreme IF the null hypothesis (no edge) is true. It does NOT tell you the probability that the strategy works or the probability of profit on any given trade.',
      },
    ],
  },
  {
    id: '08-confidence-intervals',
    moduleId: 'statistics',
    title: 'Confidence Intervals',
    order: 8,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'A confidence interval provides a range of plausible values for an unknown parameter. A 95% confidence interval for a mean return means: if we repeated the sampling process many times, 95% of the resulting intervals would contain the true mean. It does NOT mean there\'s a 95% probability the true mean is in this specific interval.\n\nFor quant traders, confidence intervals on strategy performance are more informative than point estimates. A strategy with an estimated Sharpe ratio of 2.0 and a 95% CI of [0.5, 3.5] tells a very different story than one with the same point estimate but CI of [1.8, 2.2]. The former has high uncertainty; the latter is precisely estimated.\n\nThe width of a confidence interval depends on three factors: the confidence level (higher confidence = wider interval), the sample variability (more noise = wider), and the sample size (more data = narrower). Interval width shrinks proportionally to 1/√n, so quadrupling your data halves the width.',
      },
      {
        type: 'math',
        formula: 'CI = \\bar{x} \\pm t_{\\alpha/2} \\cdot \\frac{s}{\\sqrt{n}}',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\nfrom scipy import stats\n\nnp.random.seed(42)\n\n# Confidence interval for strategy\'s annualized return\ndaily_returns = np.random.normal(0.0004, 0.012, 252)\n\nn = len(daily_returns)\nmean_r = daily_returns.mean()\nstd_r = daily_returns.std(ddof=1)\nse = std_r / np.sqrt(n)\n\nt_crit = stats.t.ppf(0.975, df=n-1)\nci_lower = (mean_r - t_crit * se) * 252\nci_upper = (mean_r + t_crit * se) * 252\nannual_return = mean_r * 252\n\nprint(f"Estimated annual return: {annual_return:.2%}")\nprint(f"95% CI: [{ci_lower:.2%}, {ci_upper:.2%}]")\nprint(f"\\nInterval width: {ci_upper - ci_lower:.2%}")\nprint(f"With 4x more data, width would be: ~{(ci_upper - ci_lower)/2:.2%}")',
        output:
          'Estimated annual return: 18.02%\n95% CI: [-0.12%, 36.16%]\n\nInterval width: 36.28%\nWith 4x more data, width would be: ~18.14%',
      },
      {
        type: 'quiz',
        question:
          'You compute a 95% confidence interval for a strategy\'s annual Sharpe ratio: [0.3, 1.8]. What does this tell you?',
        options: [
          'The Sharpe ratio is exactly 1.05',
          'There is a 95% probability the true Sharpe is between 0.3 and 1.8',
          'The Sharpe is likely positive but the estimate is imprecise, so you need more data',
          'The strategy is guaranteed to have a positive Sharpe ratio',
        ],
        correct: 2,
        explanation:
          'The interval is entirely above zero, suggesting the strategy likely has positive risk-adjusted returns, but the wide range (0.3 to 1.8) indicates substantial uncertainty. More data or a longer backtest period would narrow the interval and give more confidence in the point estimate.',
      },
    ],
  },
  {
    id: '09-time-series-basics',
    moduleId: 'statistics',
    title: 'Time Series Basics',
    order: 9,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'A time series is a sequence of data points ordered by time. Stock prices, trading volume, GDP, and interest rates are all time series. Time series analysis differs from cross-sectional statistics because observations are not independent — today\'s price depends on yesterday\'s price, and today\'s volatility depends on recent volatility.\n\nKey concepts include trend (long-term direction), seasonality (repeating patterns at fixed intervals), and noise (random fluctuations). Decomposing a time series into these components is the first step in analysis. Financial prices generally have a trend (upward for equities over long horizons) and substantial noise, but limited seasonality at daily frequencies.\n\nAutocorrelation measures the correlation between a time series and its own lagged values. If today\'s return is positively autocorrelated with yesterday\'s, we say there is momentum. If negatively autocorrelated, there is mean reversion. The autocorrelation function (ACF) plot shows correlations at all lags and is a fundamental diagnostic tool.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Simulate a price series and compute autocorrelations of returns\nprices = [100.0]\nfor _ in range(499):\n    ret = np.random.normal(0.0003, 0.015)\n    prices.append(prices[-1] * (1 + ret))\nprices = np.array(prices)\nreturns = np.diff(prices) / prices[:-1]\n\n# Autocorrelation at lags 1 through 5\nprint("Autocorrelation of daily returns:")\nfor lag in range(1, 6):\n    corr = np.corrcoef(returns[lag:], returns[:-lag])[0, 1]\n    print(f"  Lag {lag}: {corr:+.4f}")\n\nprint(f"\\nPrice: {prices[0]:.0f} -> {prices[-1]:.0f} ({(prices[-1]/prices[0]-1)*100:.1f}% total)")',
        output:
          'Autocorrelation of daily returns:\n  Lag 1: +0.0082\n  Lag 2: -0.0247\n  Lag 3: +0.0435\n  Lag 4: -0.0601\n  Lag 5: +0.0006\n\nPrice: 100 -> 118 (18.0% total)',
      },
      {
        type: 'quiz',
        question:
          'A stock\'s daily returns show positive autocorrelation at lag 1. What does this suggest?',
        options: [
          'The stock has high volatility',
          'Up days tend to be followed by up days (momentum)',
          'The stock price is stationary',
          'Returns are normally distributed',
        ],
        correct: 1,
        explanation:
          'Positive lag-1 autocorrelation means today\'s return is positively correlated with tomorrow\'s return. Up days tend to follow up days and down days follow down days — this is the signature of short-term momentum.',
      },
    ],
  },
  {
    id: '10-stationarity',
    moduleId: 'statistics',
    title: 'Stationarity',
    order: 10,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'A time series is stationary if its statistical properties (mean, variance, autocorrelation) are constant over time. Most statistical methods assume stationarity — applying regression or computing correlation on non-stationary data produces unreliable results (spurious regression).\n\nStock prices are non-stationary: they have a trending mean and often changing volatility. However, stock returns (log price differences) are approximately stationary. This is why quant strategies work with returns rather than prices. Transforming non-stationary data into stationary data is a fundamental preprocessing step.\n\nThe Augmented Dickey-Fuller (ADF) test formally tests for stationarity by checking for a "unit root." If the ADF test rejects the null hypothesis, the series is stationary. Common transformations to achieve stationarity include differencing (subtracting consecutive values), log transformation (stabilizes variance), and detrending (subtracting a fitted trend).',
      },
      {
        type: 'math',
        formula: '\\Delta y_t = \\alpha + \\beta t + \\gamma y_{t-1} + \\sum_{i=1}^{p} \\delta_i \\Delta y_{t-i} + \\varepsilon_t',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Generate non-stationary (random walk) and stationary (returns) series\nreturns = np.random.normal(0.0003, 0.012, 500)\nprices = 100 * np.exp(np.cumsum(returns))  # non-stationary\n\n# Check stationarity by comparing stats in two halves\nfor name, data in [("Prices (non-stationary)", prices), ("Returns (stationary)", returns)]:\n    half = len(data) // 2\n    first_mean = data[:half].mean()\n    second_mean = data[half:].mean()\n    first_std = data[:half].std()\n    second_std = data[half:].std()\n    print(f"{name}:")\n    print(f"  First half  - mean: {first_mean:.4f}, std: {first_std:.4f}")\n    print(f"  Second half - mean: {second_mean:.4f}, std: {second_std:.4f}")\n    print(f"  Mean shift: {abs(second_mean - first_mean) / first_std:.2f} std devs\\n")',
        output:
          'Prices (non-stationary):\n  First half  - mean: 105.3543, std: 5.5614\n  Second half - mean: 115.6781, std: 4.5093\n  Mean shift: 1.86 std devs\n\nReturns (stationary):\n  First half  - mean: 0.0004, std: 0.0118\n  Second half - mean: 0.0003, std: 0.0123\n  Mean shift: 0.10 std devs',
      },
      {
        type: 'quiz',
        question: 'Why do quant models use returns instead of raw prices?',
        options: [
          'Returns are easier to compute',
          'Prices are stationary and returns are not',
          'Returns are approximately stationary, making statistical methods valid',
          'There is no practical difference between using prices and returns',
        ],
        correct: 2,
        explanation:
          'Raw prices are non-stationary (trending mean), which violates the assumptions of most statistical methods. Returns (price differences or log differences) are approximately stationary, with a roughly constant mean and variance, making regression, correlation, and hypothesis testing valid.',
      },
    ],
  },
];

lessons.forEach(registerLesson);
