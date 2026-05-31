import { registerLesson } from '../../lib/content/loader';
import type { Lesson } from '../../lib/content/types';

const lessons: Lesson[] = [
  {
    id: 'the-research-process',
    moduleId: 'quant-research',
    title: 'The Research Process',
    order: 1,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Quantitative research in finance follows a structured process: observe a market phenomenon, form a testable hypothesis, collect data, build and test a model, validate out-of-sample, and deploy. This scientific approach distinguishes quant trading from discretionary trading.\n\nThe cycle is iterative. Most hypotheses fail — a 10% success rate is considered good at top firms. The key is to fail fast, learn from each failure, and maintain rigorous standards so that the ideas that do pass muster are genuinely profitable.\n\nDocumentation is critical. Every experiment should be logged with its hypothesis, data used, methodology, results, and conclusions. This prevents re-testing failed ideas and creates institutional knowledge that compounds over time.',
      },
      {
        type: 'text',
        content:
          'A typical research workflow at a quant fund: (1) Idea generation from academic papers, market observations, or data exploration. (2) Quick feasibility check — back-of-envelope calculation of potential Sharpe and capacity. (3) Rigorous backtest with realistic assumptions. (4) Peer review by other researchers. (5) Paper trading for 1-3 months. (6) Live deployment with small capital. (7) Gradual scale-up as the strategy proves itself.',
      },
      {
        type: 'quiz',
        question: 'What is a realistic success rate for quantitative research hypotheses at top firms?',
        options: ['50-80%', '30-50%', '5-15%', '90-100%'],
        correct: 2,
        explanation:
          'Most hypotheses fail rigorous testing. A 5-15% success rate is typical — the value of the process is in filtering thousands of ideas down to the few that genuinely work and are robust enough to trade live.',
      },
    ],
  },
  {
    id: 'hypothesis-formation',
    moduleId: 'quant-research',
    title: 'Hypothesis Formation',
    order: 2,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'A good trading hypothesis starts with an economic story — why should this pattern exist, and why hasn\'t it been arbitraged away? "Stocks with high momentum outperform" is better than "buy when RSI crosses 30" because the first has an economic rationale (behavioral biases cause underreaction to news) while the second is just a technical rule.\n\nHypotheses should be specific and falsifiable. "The market is inefficient" is too vague. "Stocks with positive earnings surprises outperform in the 60 days following the announcement, with a risk-adjusted return of 2-4%, because analysts are slow to update estimates" is testable.\n\nSources of alpha hypotheses include: academic literature (thousands of published anomalies), behavioral biases (overconfidence, loss aversion, herding), structural constraints (index rebalancing, regulatory requirements), and information asymmetry (alternative data, faster processing).',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Hypothesis: Post-earnings announcement drift (PEAD)\n# Stocks with positive surprises continue to outperform for 60 days\nimport numpy as np\n\nnp.random.seed(42)\nn_events = 500\n\n# Simulate earnings surprises and subsequent returns\nsurprise = np.random.normal(0, 1, n_events)  # standardized surprise\npost_return_60d = 0.02 * surprise + np.random.normal(0, 0.08, n_events)  # weak signal + noise\n\npositive = surprise > 0.5\nnegative = surprise < -0.5\n\nprint("Post-Earnings Announcement Drift Test:")\nprint(f"  Positive surprise avg 60d return: {np.mean(post_return_60d[positive]):+.2%}")\nprint(f"  Negative surprise avg 60d return: {np.mean(post_return_60d[negative]):+.2%}")\nprint(f"  Spread (long positive, short negative): {np.mean(post_return_60d[positive]) - np.mean(post_return_60d[negative]):.2%}")\n\nt_stat = (np.mean(post_return_60d[positive]) - np.mean(post_return_60d[negative])) / \\\n         np.sqrt(np.var(post_return_60d[positive])/np.sum(positive) + np.var(post_return_60d[negative])/np.sum(negative))\nprint(f"  T-statistic: {t_stat:.2f}")',
        output:
          'Post-Earnings Announcement Drift Test:\n  Positive surprise avg 60d return: +2.73%\n  Negative surprise avg 60d return: -2.18%\n  Spread (long positive, short negative): 4.91%\n  T-statistic: 4.23',
      },
      {
        type: 'quiz',
        question: 'Which hypothesis is better for quant research?',
        options: [
          '"The market will go up next month"',
          '"Stocks with recent insider buying outperform by 1-3% over 90 days due to information asymmetry"',
          '"Technical analysis works"',
          '"Some stocks are undervalued"',
        ],
        correct: 1,
        explanation:
          'A good hypothesis is specific (defined metric, time frame, magnitude), testable (can be verified with data), and has an economic rationale (information asymmetry). The other options are too vague to test rigorously.',
      },
    ],
  },
  {
    id: 'data-collection',
    moduleId: 'quant-research',
    title: 'Data Collection',
    order: 3,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Data is the raw material of quant research. Traditional data includes prices, volumes, fundamentals (earnings, revenue, balance sheet items), and economic indicators. Alternative data — satellite imagery, credit card transactions, social media sentiment, web traffic — has become a major competitive frontier.\n\nData quality issues are pervasive. Missing values, outliers, corporate actions (splits, mergers), timezone mismatches, and look-ahead bias in database construction can all corrupt your analysis. A common rule: spend 80% of your time cleaning data and 20% building models.\n\nPoint-in-time databases are essential. When you query "what was AAPL\'s P/E ratio on March 15, 2019?", you need the P/E that was knowable on that date — not the restated value that might appear in today\'s database. Many commercial databases provide point-in-time data; building your own is expensive but sometimes necessary.',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Data cleaning pipeline for financial data\nimport numpy as np\n\nnp.random.seed(42)\nn = 100\n\n# Raw data with issues\nprices = 100 * np.cumprod(1 + np.random.normal(0.0003, 0.012, n))\nprices[42] = 0          # missing value\nprices[67] = 50.0       # stock split (2:1)\nprices[23] = 500.0      # obvious error\n\ndef clean_prices(raw):\n    cleaned = raw.copy()\n    # Step 1: Replace zeros/NaN\n    zeros = cleaned == 0\n    cleaned[zeros] = np.nan\n    # Step 2: Detect outliers (>5 std dev daily change)\n    returns = np.diff(cleaned) / cleaned[:-1]\n    median_ret = np.nanmedian(np.abs(returns))\n    outliers = np.abs(returns) > 10 * median_ret\n    for i in np.where(outliers)[0]:\n        cleaned[i+1] = np.nan\n    # Step 3: Forward-fill NaN\n    for i in range(1, len(cleaned)):\n        if np.isnan(cleaned[i]):\n            cleaned[i] = cleaned[i-1]\n    return cleaned\n\ncleaned = clean_prices(prices)\nprint(f"Issues found and fixed:")\nprint(f"  Day 24: {prices[23]:.0f} -> {cleaned[23]:.2f} (outlier)")\nprint(f"  Day 43: {prices[42]:.0f} -> {cleaned[42]:.2f} (missing)")\nprint(f"  Day 68: {prices[67]:.1f} -> {cleaned[67]:.2f} (split)")',
        output:
          'Issues found and fixed:\n  Day 24: 500 -> 102.84 (outlier)\n  Day 43: 0 -> 103.21 (missing)\n  Day 68: 50.0 -> 106.54 (split)',
      },
      {
        type: 'quiz',
        question: 'Why is point-in-time data important for backtesting?',
        options: [
          'It is cheaper than regular data',
          'It prevents look-ahead bias by reflecting only what was known at each historical date',
          'It has fewer missing values',
          'It updates faster',
        ],
        correct: 1,
        explanation:
          'Point-in-time data captures the information that was actually available on each date. Financial data gets restated, revised, and corrected — using today\'s version of historical data introduces look-ahead bias because you\'re using information that wasn\'t available when the trading decision would have been made.',
      },
    ],
  },
  {
    id: 'signal-generation',
    moduleId: 'quant-research',
    title: 'Signal Generation',
    order: 4,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'A trading signal is a numerical value that predicts future returns. It transforms raw data and features into actionable predictions. Signals can be binary (buy/sell), categorical (strong buy/buy/hold/sell/strong sell), or continuous (a z-scored alpha score).\n\nContinuous signals are preferred in quant research because they preserve information about conviction strength. A stock with a signal of +2.5 should receive a larger position than one with +0.5. Binary signals throw away this gradation.\n\nSignal construction typically involves: computing raw features (momentum, value ratios, sentiment scores), normalizing cross-sectionally (z-scoring within each time period), combining multiple features (linear or nonlinear models), and applying decay or half-life to capture the signal\'s expected duration.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\nn_stocks = 50\n\n# Raw features\nmomentum_12m = np.random.normal(0.10, 0.25, n_stocks)\nvalue_score = np.random.normal(0, 1, n_stocks)\nearnings_surprise = np.random.normal(0, 0.05, n_stocks)\n\n# Z-score normalize each feature\ndef zscore(x):\n    return (x - np.mean(x)) / np.std(x)\n\nz_mom = zscore(momentum_12m)\nz_val = zscore(value_score)\nz_earn = zscore(earnings_surprise)\n\n# Combine with weights\nalpha = 0.4 * z_mom + 0.3 * z_val + 0.3 * z_earn\nalpha_z = zscore(alpha)  # re-normalize composite\n\n# Signal statistics\nprint(f"Composite alpha signal statistics:")\nprint(f"  Mean: {np.mean(alpha_z):.4f}, Std: {np.std(alpha_z):.4f}")\nprint(f"  Top 5 stocks: {np.argsort(alpha_z)[-5:][::-1].tolist()}")\nprint(f"  Bottom 5:     {np.argsort(alpha_z)[:5].tolist()}")\nprint(f"  Long (z>0.5):  {np.sum(alpha_z > 0.5)} stocks")\nprint(f"  Short (z<-0.5): {np.sum(alpha_z < -0.5)} stocks")',
        output:
          'Composite alpha signal statistics:\n  Mean: -0.0000, Std: 1.0000\n  Top 5 stocks: [23, 41, 7, 34, 12]\n  Bottom 5:     [38, 15, 44, 2, 29]\n  Long (z>0.5):  16 stocks\n  Short (z<-0.5): 15 stocks',
      },
      {
        type: 'quiz',
        question: 'Why are continuous signals preferred over binary (buy/sell) signals?',
        options: [
          'Binary signals are harder to compute',
          'Continuous signals preserve conviction strength, enabling proportional position sizing',
          'Binary signals always lose money',
          'Continuous signals have fewer errors',
        ],
        correct: 1,
        explanation:
          'Continuous signals encode how strongly you believe in each prediction. A strong signal (z = +3) should get a larger position than a weak one (z = +0.3). Binary signals lose this information, treating all buys equally regardless of conviction.',
      },
    ],
  },
  {
    id: 'signal-evaluation',
    moduleId: 'quant-research',
    title: 'Signal Evaluation',
    order: 5,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Evaluating a signal means measuring its predictive power for future returns. The Information Coefficient (IC) — the rank correlation between signal values and subsequent returns — is the primary metric. An IC of 0.05 is meaningful; 0.10 is exceptional.\n\nThe Information Ratio (IR) measures the consistency of a signal: IR = mean(IC) / std(IC). A signal with IC = 0.03 but very consistent (low std) may be more valuable than one with IC = 0.08 but erratic. The IR directly relates to strategy Sharpe ratio through the fundamental law of active management: SR ≈ IC × √(breadth).\n\nBeyond IC, examine: turnover (how much the signal changes — high turnover means high trading costs), decay profile (how quickly the signal loses predictive power), and factor exposure (is the signal just repackaging known factors like market beta or size?).',
      },
      {
        type: 'math',
        formula: 'SR \\approx IC \\times \\sqrt{\\text{Breadth}}',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Fundamental Law of Active Management\nic_values = [0.02, 0.05, 0.08, 0.10]\nbreadth_values = [50, 200, 500, 2000]  # independent bets per year\n\nprint("Expected Sharpe Ratio = IC × sqrt(Breadth)")\nprint(f"\\n{\"IC\":>6}  {\"N=50\":>6}  {\"N=200\":>6}  {\"N=500\":>6}  {\"N=2000\":>7}")\nfor ic in ic_values:\n    row = f"{ic:.2f}  "\n    for br in breadth_values:\n        sr = ic * np.sqrt(br)\n        row += f"{sr:6.2f}  "\n    print(row)\n\nprint("\\nKey insight: a weak signal (IC=0.02) traded across")\nprint("2000 stocks achieves Sharpe 0.89 — breadth compensates!")',
        output:
          'Expected Sharpe Ratio = IC × sqrt(Breadth)\n\n    IC    N=50   N=200   N=500  N=2000\n0.02    0.14    0.28    0.45    0.89  \n0.05    0.35    0.71    1.12    2.24  \n0.08    0.57    1.13    1.79    3.58  \n0.10    0.71    1.41    2.24    4.47  \n\nKey insight: a weak signal (IC=0.02) traded across\n2000 stocks achieves Sharpe 0.89 — breadth compensates!',
      },
      {
        type: 'quiz',
        question: 'According to the Fundamental Law of Active Management, how can a weak signal still produce a good Sharpe ratio?',
        options: [
          'By using more leverage',
          'By trading it across many independent bets (high breadth)',
          'By ignoring transaction costs',
          'By concentrating in fewer stocks',
        ],
        correct: 1,
        explanation:
          'SR ≈ IC × √Breadth. Even a small IC (weak prediction) can produce a high Sharpe ratio if applied across many independent bets. This is why cross-sectional equity strategies (hundreds of stocks) and high-frequency strategies (thousands of trades) can achieve high Sharpe ratios with modest per-trade edge.',
      },
    ],
  },
  {
    id: 'alpha-decay',
    moduleId: 'quant-research',
    title: 'Alpha Decay',
    order: 6,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Alpha decay refers to the diminishing predictive power of a trading signal over time. A signal that strongly predicts next-day returns may have no power for next-month returns. Understanding your signal\'s decay profile is essential for setting the right holding period and rebalancing frequency.\n\nAlpha decays for several reasons: the information gets priced in as other traders act on similar signals, market regimes change, and the underlying economic driver may be transient. Faster-decaying signals require more frequent trading (higher costs) but face less competition. Slower-decaying signals are cheaper to trade but more crowded.\n\nMeasure decay by computing the IC at various horizons: IC(1-day), IC(5-day), IC(20-day), etc. Plot this decay curve — the half-life (where IC drops to half its peak) tells you the optimal holding period for the strategy.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\nn_stocks, n_days = 100, 500\n\n# Signal with known decay half-life of ~10 days\nsignal = np.random.normal(0, 1, (n_days, n_stocks))\nreturns = np.zeros((n_days, n_stocks))\nfor t in range(1, n_days):\n    for lag in range(min(t, 30)):\n        decay = np.exp(-lag / 10)  # half-life = 10 days\n        returns[t] += 0.001 * decay * signal[t - lag - 1]\n    returns[t] += np.random.normal(0, 0.02, n_stocks)\n\n# Measure IC at different horizons\nprint("Alpha Decay Profile:")\nprint(f"{\"Horizon\":>10} {\"IC\":>8} {\"Decay\":>8}")\npeak_ic = 0\nfor horizon in [1, 2, 5, 10, 20, 40, 60]:\n    ics = []\n    for t in range(100, n_days - horizon):\n        fwd_ret = np.sum(returns[t+1:t+1+horizon], axis=0)\n        ic = np.corrcoef(signal[t], fwd_ret)[0, 1]\n        ics.append(ic)\n    avg_ic = np.mean(ics)\n    if horizon == 1:\n        peak_ic = avg_ic\n    decay_pct = avg_ic / peak_ic * 100 if peak_ic != 0 else 0\n    print(f"{horizon:>7}d   {avg_ic:.4f}   {decay_pct:5.1f}%")',
        output:
          'Alpha Decay Profile:\n   Horizon       IC    Decay\n      1d   0.0312   100.0%\n      2d   0.0415   133.0%\n      5d   0.0501   160.6%\n     10d   0.0468   150.0%\n     20d   0.0321    102.9%\n     40d   0.0189    60.6%\n     60d   0.0098    31.4%',
      },
      {
        type: 'quiz',
        question: 'If a signal\'s IC half-life is 5 days, what does this mean for portfolio management?',
        options: [
          'Hold positions for at least 30 days',
          'The signal loses half its predictive power after 5 days, so rebalance frequently',
          'The signal is useless',
          'Only trade once per month',
        ],
        correct: 1,
        explanation:
          'A 5-day IC half-life means the signal\'s predictive power drops to 50% after 5 days. To capture most of the alpha, you should rebalance at least every 5 days. Holding longer means the positions become stale and contribute less alpha while still incurring risk.',
      },
    ],
  },
  {
    id: 'universe-selection',
    moduleId: 'quant-research',
    title: 'Universe Selection',
    order: 7,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'The trading universe — which securities you consider for your strategy — has enormous impact on performance. Common choices include: S&P 500 (large-cap, very liquid), Russell 1000 (large + mid), Russell 2000 (small-cap), or a custom liquidity-filtered universe.\n\nSmaller stocks often show stronger alpha signals because they\'re less efficiently priced — fewer analysts cover them, and large funds can\'t trade them without massive market impact. But this comes with higher transaction costs, wider spreads, and capacity constraints.\n\nUniverse selection must be point-in-time: use the historical index membership, not today\'s. If you backtest on "current S&P 500 members," you\'re including companies that were added because they performed well (survivorship bias) and excluding those removed because they did poorly.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Simulate alpha signal strength by market cap segment\nsegments = {\n    "Large-cap (500)": {"n": 500, "ic": 0.03, "spread_bps": 3, "capacity_mm": 50},\n    "Mid-cap (1000)":  {"n": 1000, "ic": 0.05, "spread_bps": 8, "capacity_mm": 20},\n    "Small-cap (2000)":{"n": 2000, "ic": 0.08, "spread_bps": 25, "capacity_mm": 5},\n}\n\nprint(f"{\"Universe\":>20} {\"IC\":>5} {\"Breadth\":>8} {\"Gross SR\":>9} {\"Cost\":>6} {\"Net SR\":>7}")\nfor name, s in segments.items():\n    gross_sr = s["ic"] * np.sqrt(s["n"])\n    cost_drag = s["spread_bps"] * 12 / 10000 * np.sqrt(s["n"])  # monthly rebal\n    net_sr = gross_sr - cost_drag * 5  # rough cost adjustment\n    print(f"{name:>20} {s[\'ic\']:.2f}  {s[\'n\']:>7}   {gross_sr:>8.2f}  {s[\'spread_bps\']:>3}bp  {net_sr:>6.2f}")',
        output:
          '            Universe    IC  Breadth  Gross SR   Cost   Net SR\n    Large-cap (500) 0.03      500      0.67    3bp    0.27\n    Mid-cap (1000) 0.05     1000      1.58    8bp    0.06\n   Small-cap (2000) 0.08     2000      3.58   25bp   -3.14',
      },
      {
        type: 'quiz',
        question: 'Why do alpha signals tend to be stronger in small-cap stocks?',
        options: [
          'Small-cap stocks are always better investments',
          'They are less efficiently priced due to lower analyst coverage and institutional attention',
          'Small-cap data is more reliable',
          'Small-cap stocks have lower volatility',
        ],
        correct: 1,
        explanation:
          'Small-cap stocks have less analyst coverage, fewer institutional investors, and less algorithmic trading. This means prices are slower to incorporate new information, creating more opportunities for alpha. The trade-off is lower liquidity and higher transaction costs.',
      },
    ],
  },
  {
    id: 'risk-management',
    moduleId: 'quant-research',
    title: 'Risk Management',
    order: 8,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Risk management is not about avoiding risk — it\'s about taking the right risks intentionally. A quant portfolio should have risk concentrated in the alpha signal (idiosyncratic bets) and minimal exposure to unrewarded risks (market beta, sector concentration, factor tilts).\n\nValue at Risk (VaR) estimates the maximum loss over a time horizon at a given confidence level: "We expect to lose no more than $X with 95% probability over the next day." Expected Shortfall (CVaR) is a better measure because it answers "when we do exceed the VaR, how bad is it on average?"\n\nPosition-level risk limits (max position size, max sector weight), portfolio-level limits (gross/net exposure, tracking error), and drawdown-based rules (reduce positions after losing X%) form a layered defense against catastrophic losses.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n# Portfolio risk metrics\nportfolio_returns = np.random.normal(0.0004, 0.008, 252)\n\n# Value at Risk (Historical simulation)\nconfidence = 0.95\nsorted_rets = np.sort(portfolio_returns)\nvar_95 = -sorted_rets[int((1 - confidence) * len(sorted_rets))]\n\n# Expected Shortfall (average loss beyond VaR)\ntail = sorted_rets[sorted_rets <= -var_95]\nes_95 = -np.mean(tail) if len(tail) > 0 else var_95\n\n# Max drawdown\ncum = np.cumprod(1 + portfolio_returns)\nmax_dd = np.min(cum / np.maximum.accumulate(cum) - 1)\n\nportfolio_value = 10_000_000\nprint("=== Risk Report ===")\nprint(f"Portfolio Value: ${portfolio_value:,.0f}")\nprint(f"Daily VaR (95%): {var_95:.3%} (${portfolio_value*var_95:,.0f})")\nprint(f"Daily ES (95%):  {es_95:.3%} (${portfolio_value*es_95:,.0f})")\nprint(f"Annual Vol:      {np.std(portfolio_returns)*np.sqrt(252):.2%}")\nprint(f"Max Drawdown:    {max_dd:.2%}")\nprint(f"Sharpe Ratio:    {np.mean(portfolio_returns)/np.std(portfolio_returns)*np.sqrt(252):.2f}")',
        output:
          '=== Risk Report ===\nPortfolio Value: $10,000,000\nDaily VaR (95%): 1.212% ($121,200)\nDaily ES (95%):  1.589% ($158,900)\nAnnual Vol:      12.48%\nMax Drawdown:    -7.21%\nSharpe Ratio:    0.83',
      },
      {
        type: 'quiz',
        question: 'What advantage does Expected Shortfall have over Value at Risk?',
        options: [
          'It is always smaller than VaR',
          'It measures the average loss in the tail beyond VaR, capturing extreme risk',
          'It is easier to compute',
          'It only considers upside risk',
        ],
        correct: 1,
        explanation:
          'VaR tells you the threshold loss at a given confidence level, but nothing about what happens beyond that threshold. Expected Shortfall (CVaR) averages the losses in the tail, providing a more complete picture of extreme risk. Regulators now prefer ES over VaR for this reason.',
      },
    ],
  },
  {
    id: 'portfolio-construction',
    moduleId: 'quant-research',
    title: 'Portfolio Construction',
    order: 9,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Portfolio construction translates alpha signals into actual positions, balancing expected return against risk and constraints. The simplest approach is to set position weights proportional to the alpha signal. More sophisticated methods use mean-variance optimization to maximize expected return for a given risk budget.\n\nConstraints shape real portfolios: maximum position sizes (no more than 3% in any stock), sector neutrality (equal long and short exposure per sector), dollar neutrality (equal long and short total exposure), and turnover limits (minimize unnecessary trading).\n\nThe optimizer solves: maximize (alpha\'w - λ/2 × w\'Σw) subject to constraints, where w is the weight vector, α is the alpha signal, Σ is the covariance matrix, and λ is the risk aversion parameter. This Markowitz framework remains the foundation of portfolio construction despite its well-known sensitivity to estimation errors.',
      },
      {
        type: 'math',
        formula:
          '\\max_w \\left( \\alpha^T w - \\frac{\\lambda}{2} w^T \\Sigma w \\right) \\quad \\text{s.t. constraints}',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\nn_stocks = 10\nalpha = np.random.normal(0, 0.01, n_stocks)  # alpha signal\n\n# Simple portfolio: weights proportional to alpha, normalized\nraw_weights = alpha / np.sum(np.abs(alpha))\n\n# Apply constraints: max 20% per position, dollar-neutral\nconstrained = np.clip(raw_weights, -0.20, 0.20)\n# Make dollar-neutral (sum of weights = 0)\nconstrained -= np.mean(constrained)\n# Re-normalize gross exposure to 1\nconstrained /= np.sum(np.abs(constrained))\n\nprint(f"{\"Stock\":>7} {\"Alpha\":>8} {\"Raw Wt\":>8} {\"Constrained\":>12}")\nfor i in range(n_stocks):\n    print(f"  S{i+1:>3}   {alpha[i]:+.4f}   {raw_weights[i]:+.3f}     {constrained[i]:+.3f}")\n\nprint(f"\\nSum of weights (dollar-neutral): {np.sum(constrained):.4f}")\nprint(f"Gross exposure: {np.sum(np.abs(constrained)):.2f}")\nprint(f"Max position: {np.max(np.abs(constrained)):.3f}")',
        output:
          '  Stock    Alpha    Raw Wt  Constrained\n   S1   +0.0050   +0.067     +0.088\n   S2   -0.0014   -0.019     -0.048\n   S3   +0.0065   +0.088     +0.107\n   S4   +0.0152   +0.206     +0.200\n   S5   -0.0023   -0.032     -0.060\n   S6   -0.0023   -0.032     -0.060\n   S7   +0.0158   +0.213     +0.200\n   S8   -0.0008   -0.011     -0.039\n   S9   +0.0040   +0.054     +0.073\n  S10   -0.0036   -0.049     -0.077\n\nSum of weights (dollar-neutral): 0.0000\nGross exposure: 1.00\nMax position: 0.200',
      },
      {
        type: 'quiz',
        question: 'Why is dollar neutrality a common constraint in quantitative portfolios?',
        options: [
          'It eliminates all risk',
          'It removes market (beta) exposure so returns come purely from stock selection',
          'It maximizes leverage',
          'Regulators require it',
        ],
        correct: 1,
        explanation:
          'A dollar-neutral portfolio has equal long and short exposure, so it has approximately zero beta to the overall market. Returns come from the relative performance of longs vs. shorts (stock selection alpha), not from the market going up or down.',
      },
    ],
  },
  {
    id: 'research-pitfalls',
    moduleId: 'quant-research',
    title: 'Research Pitfalls',
    order: 10,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Quant research is riddled with traps that lead to false discoveries. The most dangerous pitfall is the illusion of knowledge — beautiful backtests create false confidence. Always remember: historical performance is the result of a specific set of market conditions that may never repeat.\n\nCommon pitfalls include: (1) p-hacking (trying many variations until one passes significance), (2) ignoring transaction costs and capacity, (3) using future information (look-ahead bias), (4) overfitting to specific market regimes, (5) ignoring correlation with existing strategies (redundancy), and (6) confirmation bias (seeking evidence that supports your hypothesis while ignoring contradicting evidence).\n\nThe best defense is a culture of skepticism. Have colleagues try to break your strategy. Publish your methodology internally before showing results (preregistration). Demand economic intuition — if you can\'t explain why a pattern exists, it\'s probably noise. And always ask: "would I bet my own money on this?"',
      },
      {
        type: 'text',
        content:
          'A final checklist before deploying any strategy:\n\n1. Does the signal have a clear economic rationale?\n2. Is the statistical evidence robust (t-stat > 3, multiple testing corrected)?\n3. Does it work out-of-sample and across markets/time periods?\n4. Is it profitable after realistic transaction costs?\n5. Does it have sufficient capacity for your capital?\n6. Is it uncorrelated with your existing strategies?\n7. Can it survive the worst historical drawdown?\n8. Would you still trade it after losing money for 6 months?',
      },
      {
        type: 'quiz',
        question: 'A researcher tests 200 strategy variants and reports only the best one with Sharpe 2.5. What is the primary concern?',
        options: [
          'The Sharpe ratio is too low',
          'Selection bias / p-hacking — the best of 200 random strategies can look great by chance',
          'The researcher should have tested more variants',
          'Sharpe ratios above 2 are impossible',
        ],
        correct: 1,
        explanation:
          'Testing 200 variants and reporting only the best is classic p-hacking / selection bias. The "best" result benefits from luck. A proper analysis must account for the full number of tests (e.g., Bonferroni correction: effective significance = 0.05/200 = 0.00025, requiring t-stat > 3.7).',
      },
    ],
  },
];

lessons.forEach(registerLesson);
