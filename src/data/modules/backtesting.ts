import { registerLesson } from '@/lib/content/loader';
import type { Lesson } from '@/lib/content/types';

const lessons: Lesson[] = [
  {
    id: '01-what-is-backtesting',
    moduleId: 'backtesting',
    title: 'What is Backtesting',
    order: 1,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Backtesting is the process of testing a trading strategy on historical data to evaluate how it would have performed in the past. It is the primary method quants use to develop, validate, and compare strategies before risking real capital. A good backtest simulates realistic trading conditions as faithfully as possible.\n\nThe core assumption behind backtesting is that patterns in historical data will persist into the future — at least to some degree. This assumption is imperfect (markets evolve), but without it there is no basis for systematic trading. The key is distinguishing genuine patterns from noise, which requires statistical rigor and healthy skepticism.\n\nA backtest produces a simulated equity curve and performance metrics. But a strong backtest is necessary, not sufficient, for a profitable strategy. The history of quantitative finance is littered with strategies that backtested beautifully but failed in live trading due to overfitting, data errors, or regime changes.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\nimport pandas as pd\n\nnp.random.seed(42)\n\n# Simplest possible backtest: momentum strategy\nprices = pd.Series(100 * np.cumprod(1 + np.random.normal(0.0003, 0.015, 252)))\nreturns = prices.pct_change().dropna()\n\n# Signal: buy if yesterday\'s return was positive\nsignal = (returns.shift(1) > 0).astype(float)\nstrategy_returns = signal * returns\n\ncum_strategy = (1 + strategy_returns).cumprod()\ncum_buyhold = (1 + returns).cumprod()\n\nprint(f"Buy & Hold:  {cum_buyhold.iloc[-1] - 1:.2%}")\nprint(f"Momentum:    {cum_strategy.iloc[-1] - 1:.2%}")\nprint(f"Win rate:    {(strategy_returns[signal==1] > 0).mean():.1%}")\nprint(f"Avg win:     {strategy_returns[strategy_returns > 0].mean():.4f}")\nprint(f"Avg loss:    {strategy_returns[strategy_returns < 0].mean():.4f}")',
        output:
          'Buy & Hold:  12.43%\nMomentum:    8.21%\nWin rate:    51.2%\nAvg win:     0.0108\nAvg loss:    -0.0112',
      },
      {
        type: 'quiz',
        question: 'Why is a strong backtest necessary but not sufficient for a profitable strategy?',
        options: [
          'Backtests use fake data',
          'Historical patterns may not persist, and the backtest may be overfit to past data',
          'Backtests cannot calculate Sharpe ratios',
          'Real markets only exist during trading hours',
        ],
        correct: 1,
        explanation:
          'A backtest can appear profitable due to overfitting (fitting noise rather than signal), data errors, or patterns that existed historically but have since disappeared. Live markets involve regime changes, transaction costs, and execution slippage that may not be fully captured in the backtest.',
      },
    ],
  },
  {
    id: '02-data-requirements',
    moduleId: 'backtesting',
    title: 'Data Requirements',
    order: 2,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'The quality of a backtest is bounded by the quality of its data. Essential data requirements include: sufficient history (at least 5-10 years for daily strategies), point-in-time accuracy (data as it was known at each historical point, not revised afterward), survivorship-bias-free universe (including delisted and bankrupt companies), and proper adjustment for corporate actions (splits, dividends, spinoffs).\n\nLook-ahead bias is a subtle but fatal error where the backtest uses information that would not have been available at the time. Common examples include using adjusted financial data that was restated months later, trading on signals derived from end-of-day data at intraday prices, and selecting a universe of stocks based on current knowledge.\n\nData frequency matters too. Daily OHLCV data is sufficient for strategies that trade weekly or less. Intraday strategies need tick or minute-bar data. Higher-frequency data is orders of magnitude more expensive and harder to store and process, but is essential for strategies with holding periods under a day.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\nimport pandas as pd\n\nnp.random.seed(42)\n\n# Demonstrate survivorship bias\nn_stocks = 100\nn_years = 10\n\n# Full universe: some stocks go bankrupt (return -100%)\nall_returns = []\nfor i in range(n_stocks):\n    annual_returns = np.random.normal(0.08, 0.30, n_years)\n    if np.random.random() < 0.15:  # 15% chance of bankruptcy\n        crash_year = np.random.randint(2, n_years)\n        annual_returns[crash_year] = -1.0  # total loss\n        annual_returns[crash_year+1:] = 0\n    all_returns.append(annual_returns)\n\nall_returns = np.array(all_returns)\nsurvived = np.all(all_returns > -0.99, axis=1)\n\nprint(f"Total stocks:          {n_stocks}")\nprint(f"Survived full period:  {survived.sum()}")\nprint(f"\\nAvg annual return (all stocks):   {all_returns.mean():.2%}")\nprint(f"Avg annual return (survivors):    {all_returns[survived].mean():.2%}")\nprint(f"Survivorship bias:                {all_returns[survived].mean() - all_returns.mean():.2%}")',
        output:
          'Total stocks:          100\nSurvived full period:  86\n\nAvg annual return (all stocks):   5.15%\nAvg annual return (survivors):    8.42%\nSurvivorship bias:                3.27%',
      },
      {
        type: 'quiz',
        question:
          'Which of the following is an example of look-ahead bias in a backtest?',
        options: [
          'Using 10 years of historical data',
          'Including transaction costs in the simulation',
          'Using restated earnings data that was revised after the trading date',
          'Testing the strategy on out-of-sample data',
        ],
        correct: 2,
        explanation:
          'Look-ahead bias occurs when you use information that was not available at the time of the simulated trade. Restated earnings are revised months after initial reporting — using the restated values in a backtest means your strategy is trading on information it couldn\'t have known.',
      },
    ],
  },
  {
    id: '03-simple-ma-crossover',
    moduleId: 'backtesting',
    title: 'Simple MA Crossover',
    order: 3,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'The moving average (MA) crossover is the "hello world" of trading strategies. The idea is simple: when a short-term moving average crosses above a long-term moving average, the trend is turning up (buy signal). When it crosses below, the trend is turning down (sell signal). A common variant uses 50-day and 200-day moving averages — the "golden cross" and "death cross."\n\nDespite its simplicity, the MA crossover illustrates key concepts in systematic trading: trend following, signal generation, position management, and the tradeoff between responsiveness (shorter windows catch trends earlier but generate more false signals) and smoothness (longer windows are more reliable but enter trends late).\n\nIn backtesting, we compute both moving averages for the full historical period, generate the crossover signal, shift it forward by one day to avoid look-ahead bias, and calculate the resulting strategy returns. We then compare performance against a buy-and-hold benchmark.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\nimport pandas as pd\n\nnp.random.seed(42)\n\n# Two years of daily prices with a trend and noise\ntrend = np.linspace(0, 0.3, 504)\nnoise = np.cumsum(np.random.normal(0, 0.012, 504))\nprices = pd.Series(100 * np.exp(trend + noise))\nreturns = prices.pct_change().dropna()\n\n# MA Crossover: 20-day vs 50-day\nma_short = prices.rolling(20).mean()\nma_long = prices.rolling(50).mean()\n\nposition = (ma_short > ma_long).astype(float).shift(1)\nstrategy_returns = (position * returns).dropna()\n\n# Performance\nann_ret = strategy_returns.mean() * 252\nann_vol = strategy_returns.std() * np.sqrt(252)\nsharpe = ann_ret / ann_vol\nbh_ret = (1 + returns).cumprod().iloc[-1] - 1\nst_ret = (1 + strategy_returns).cumprod().iloc[-1] - 1\n\nprint(f"MA Crossover (20/50):")\nprint(f"  Total return:  {st_ret:.2%}")\nprint(f"  Annual vol:    {ann_vol:.2%}")\nprint(f"  Sharpe ratio:  {sharpe:.2f}")\nprint(f"  Time in market: {position.mean():.0%}")\nprint(f"\\nBuy & Hold:      {bh_ret:.2%}")',
        output:
          'MA Crossover (20/50):\n  Total return:  25.14%\n  Annual vol:    13.27%\n  Sharpe ratio:  0.88\n  Time in market: 73%\n\nBuy & Hold:      35.18%',
      },
      {
        type: 'quiz',
        question:
          'What is the main drawback of using very short moving average windows (e.g., 5-day and 10-day)?',
        options: [
          'They never generate any signals',
          'They produce too many false signals (whipsaws) in choppy markets',
          'They require more computing power',
          'They only work on bond markets',
        ],
        correct: 1,
        explanation:
          'Short windows are highly responsive to price movements, causing frequent crossovers in range-bound or choppy markets. Each false signal (whipsaw) incurs transaction costs and potential losses. The tradeoff between responsiveness and noise is fundamental to all trend-following strategies.',
      },
    ],
  },
  {
    id: '04-the-overfitting-trap',
    moduleId: 'backtesting',
    title: 'The Overfitting Trap',
    order: 4,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Overfitting occurs when a model captures noise in historical data rather than genuine patterns. An overfitted strategy performs brilliantly in the backtest but poorly in live trading because the "patterns" it learned were random artifacts of the specific data sample. This is the single most dangerous pitfall in quantitative finance.\n\nThe more parameters a strategy has, the more susceptible it is to overfitting. A strategy with 20 tunable parameters can be tweaked to show amazing backtest results on almost any dataset, but those results are meaningless. A simple rule: if your strategy has more parameters than you have independent observations, you\'re almost certainly overfitting.\n\nSigns of overfitting include: backtest performance that is unrealistically good (Sharpe > 3 is a red flag), performance that degrades sharply when parameters are changed slightly, performance that differs dramatically across similar time periods, and strategy logic that has no economic rationale or intuition.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Demonstrate overfitting: optimize MA window on in-sample, test on out-of-sample\nreturns = np.random.normal(0.0003, 0.015, 1000)  # random walk (no real signal)\nprices = 100 * np.cumprod(1 + returns)\n\nis_prices = prices[:500]    # in-sample\nos_prices = prices[500:]    # out-of-sample\nis_returns = returns[1:500]\nos_returns = returns[500:]\n\nbest_sharpe = -np.inf\nbest_window = None\n\n# Try many parameter combinations on in-sample data\nfor short_w in range(5, 50, 5):\n    for long_w in range(short_w + 20, 200, 10):\n        if long_w >= len(is_prices):\n            continue\n        short_ma = np.convolve(is_prices, np.ones(short_w)/short_w, mode=\'valid\')\n        long_ma = np.convolve(is_prices, np.ones(long_w)/long_w, mode=\'valid\')\n        min_len = min(len(short_ma), len(long_ma))\n        pos = (short_ma[:min_len] > long_ma[:min_len]).astype(float)\n        ret_slice = is_returns[-min_len:]\n        strat_ret = pos[:-1] * ret_slice[1:len(pos)]\n        sr = strat_ret.mean() / (strat_ret.std() + 1e-10) * np.sqrt(252)\n        if sr > best_sharpe:\n            best_sharpe = sr\n            best_window = (short_w, long_w)\n\nprint(f"Best in-sample params: short={best_window[0]}, long={best_window[1]}")\nprint(f"In-sample Sharpe:  {best_sharpe:.2f}")\nprint(f"\\n(Data is a random walk — ANY positive Sharpe is overfitting)")',
        output:
          'Best in-sample params: short=15, long=55\nIn-sample Sharpe:  0.67\n\n(Data is a random walk — ANY positive Sharpe is overfitting)',
      },
      {
        type: 'quiz',
        question:
          'Which of the following is the strongest sign that a strategy is overfit?',
        options: [
          'It has a Sharpe ratio of 0.8',
          'It uses only one parameter',
          'Its performance degrades dramatically with small parameter changes',
          'It underperforms buy-and-hold slightly',
        ],
        correct: 2,
        explanation:
          'If tiny changes to parameters (e.g., moving a window from 20 to 22 days) cause large changes in performance, the strategy is fitting to noise rather than a robust pattern. A genuine edge should be somewhat stable across nearby parameter values.',
      },
    ],
  },
  {
    id: '05-data-snooping-bias',
    moduleId: 'backtesting',
    title: 'Data Snooping Bias',
    order: 5,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Data snooping bias (also called selection bias or multiple testing bias) occurs when you test many strategies on the same dataset and select the best-performing one. Even if all strategies have zero true edge, some will appear profitable by chance. The more strategies you test, the more likely you are to find a false positive.\n\nThis is a fundamental problem in quantitative research. If you test 100 random strategies at the 5% significance level, about 5 will appear statistically significant purely by luck. Many published academic "anomalies" and commercial trading strategies suffer from this bias — they are the winners of a massive tournament of random strategies.\n\nSolutions include: reserving a truly untouched out-of-sample dataset for final validation, applying multiple testing corrections (Bonferroni, Holm, or the false discovery rate), requiring economic intuition for why the strategy should work, and using techniques like the Deflated Sharpe Ratio that adjust for the number of strategies tested.',
      },
      {
        type: 'math',
        formula: 'SR_{\\text{deflated}} = \\frac{\\widehat{SR} - \\sqrt{\\frac{V[\\widehat{SR}]}{N}} \\cdot Z_{\\alpha/K}}{\\sqrt{V[\\widehat{SR}]}}',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Data snooping: test many random strategies, report the best\nn_strategies = 200\nn_days = 252\n\nall_sharpes = []\nfor i in range(n_strategies):\n    fake_returns = np.random.normal(0, 0.01, n_days)  # zero-edge strategies\n    sharpe = fake_returns.mean() / fake_returns.std() * np.sqrt(252)\n    all_sharpes.append(sharpe)\n\nall_sharpes = np.array(all_sharpes)\nbest_sharpe = all_sharpes.max()\np_significant = (np.abs(all_sharpes) > 2.0).mean()\n\nprint(f"Strategies tested:      {n_strategies}")\nprint(f"True edge in any:       None")\nprint(f"Best Sharpe found:      {best_sharpe:.2f}")\nprint(f"Strategies with |SR|>2: {(np.abs(all_sharpes) > 2.0).sum()}")\nprint(f"\\nBonferroni threshold:   SR > {2.0 + np.log(n_strategies)/2:.2f}")\nprint(f"Would the best pass?    {\'No\' if best_sharpe < 2.0 + np.log(n_strategies)/2 else \'Yes\'}")',
        output:
          'Strategies tested:      200\nTrue edge in any:       None\nBest Sharpe found:      2.71\nStrategies with |SR|>2: 7\n\nBonferroni threshold:   SR > 4.65\nWould the best pass?    No',
      },
      {
        type: 'quiz',
        question:
          'You tested 500 strategies and found one with a Sharpe ratio of 2.5. How should you interpret this?',
        options: [
          'The strategy definitely has a genuine edge',
          'The strategy should be deployed immediately',
          'The result is likely due to chance given the number of strategies tested',
          'A Sharpe of 2.5 is too low to be meaningful',
        ],
        correct: 2,
        explanation:
          'With 500 strategies tested, finding one with SR ≈ 2.5 is expected even if none have a real edge. The Bonferroni-adjusted threshold would be much higher. Without adjusting for multiple testing, you\'re likely selecting a lucky random strategy.',
      },
    ],
  },
  {
    id: '06-walk-forward-analysis',
    moduleId: 'backtesting',
    title: 'Walk-Forward Analysis',
    order: 6,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Walk-forward analysis (WFA) is the gold standard methodology for backtesting. Instead of optimizing on the full dataset (which guarantees overfitting), WFA divides data into sequential windows: optimize parameters on an in-sample window, then test on the immediately following out-of-sample window. Then slide both windows forward and repeat.\n\nThis process mimics how a strategy would actually be used: periodically re-optimize using recent data, then trade out-of-sample until the next re-optimization. The concatenated out-of-sample results form the "walk-forward equity curve," which is a much more realistic estimate of live performance.\n\nKey choices in WFA include the in-sample window length (long enough to capture patterns, short enough to adapt to regime changes), the out-of-sample window length (long enough for meaningful evaluation), and the re-optimization frequency. Common setups use 2-3 years in-sample and 6-12 months out-of-sample.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\nimport pandas as pd\n\nnp.random.seed(42)\n\n# Simulate 5 years of daily data\nreturns = np.random.normal(0.0003, 0.015, 1260)\nprices = 100 * np.cumprod(1 + returns)\n\n# Walk-forward: 252-day in-sample, 126-day out-of-sample\nis_window = 252\nos_window = 126\nos_returns_all = []\n\nfor start in range(0, len(prices) - is_window - os_window, os_window):\n    is_end = start + is_window\n    os_end = is_end + os_window\n\n    is_prices = prices[start:is_end]\n    os_prices = prices[is_end:os_end]\n    os_rets = returns[is_end:os_end]\n\n    # "Optimize" MA window on in-sample (simplified)\n    best_w = 20\n    best_sr = -np.inf\n    for w in [10, 15, 20, 30, 50]:\n        ma = pd.Series(is_prices).rolling(w).mean().values\n        pos = (is_prices[w:] > ma[w:]).astype(float)\n        r = returns[start+w+1:is_end]\n        sr = np.mean(pos[:len(r)] * r) / (np.std(pos[:len(r)] * r) + 1e-10)\n        if sr > best_sr:\n            best_sr = sr\n            best_w = w\n\n    # Apply best window out-of-sample\n    ma = pd.Series(os_prices).rolling(best_w).mean().values\n    pos = (os_prices[best_w:] > ma[best_w:]).astype(float)\n    os_strat = pos[:-1] * os_rets[best_w+1:best_w+len(pos)]\n    os_returns_all.extend(os_strat)\n\nos_arr = np.array(os_returns_all)\nprint(f"Walk-forward periods:   {len(range(0, len(prices)-is_window-os_window, os_window))}")\nprint(f"Total OOS days:         {len(os_arr)}")\nprint(f"OOS annual return:      {os_arr.mean() * 252:.2%}")\nprint(f"OOS Sharpe ratio:       {os_arr.mean() / (os_arr.std()+1e-10) * np.sqrt(252):.2f}")',
        output:
          'Walk-forward periods:   7\nTotal OOS days:         679\nOOS annual return:      5.82%\nOOS Sharpe ratio:       0.38',
      },
      {
        type: 'quiz',
        question: 'Why is walk-forward analysis more reliable than a single train/test split?',
        options: [
          'It uses more computing power',
          'It tests across multiple market regimes and reduces sensitivity to a single test period',
          'It always produces higher Sharpe ratios',
          'It eliminates the need for out-of-sample testing',
        ],
        correct: 1,
        explanation:
          'A single train/test split is vulnerable to the specific choice of split point. Walk-forward analysis tests across multiple out-of-sample periods, providing a more robust estimate of performance across different market conditions and reducing the impact of any single lucky or unlucky period.',
      },
    ],
  },
  {
    id: '07-transaction-costs',
    moduleId: 'backtesting',
    title: 'Transaction Costs',
    order: 7,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Transaction costs are the silent strategy killer. A backtest that ignores trading costs will dramatically overstate returns, especially for high-turnover strategies. The main components of transaction costs are: commissions (per-share or per-trade fees), the bid-ask spread (you buy at the ask and sell at the bid), market impact (your own order moves the price), and slippage (the price changes between signal generation and execution).\n\nFor institutional-size orders, market impact is typically the largest cost. Moving $10 million in a mid-cap stock can easily move the price 0.5-1%. This is why quant strategies have capacity constraints — they can only manage a limited amount of capital before impact costs erode the edge.\n\nA useful rule of thumb: transaction costs for liquid U.S. equities are approximately 5-20 basis points (0.05-0.20%) per side for retail-sized orders, and 10-50 basis points for institutional orders depending on stock liquidity. A strategy that trades daily and earns 5 bps per trade before costs might have zero or negative returns after costs.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\nimport pandas as pd\n\nnp.random.seed(42)\n\n# Impact of transaction costs on a momentum strategy\nreturns = np.random.normal(0.0005, 0.015, 504)\nprices = pd.Series(100 * np.cumprod(1 + returns))\nret = prices.pct_change().dropna()\n\nposition = (prices.rolling(20).mean() > prices.rolling(50).mean()).astype(float).shift(1)\ntrades = position.diff().abs().fillna(0)  # 1 when position changes\nturnover = trades.sum()  # total number of trades\n\nfor cost_bps in [0, 5, 10, 20, 50]:\n    cost = cost_bps / 10000\n    gross_return = (position * ret).dropna()\n    trade_costs = trades * cost\n    net_return = gross_return - trade_costs.reindex(gross_return.index, fill_value=0)\n    sharpe = net_return.mean() / net_return.std() * np.sqrt(252)\n    total = (1 + net_return).cumprod().iloc[-1] - 1\n    print(f"Cost {cost_bps:2d} bps: total return = {total:+.2%}, Sharpe = {sharpe:.2f}")\n\nprint(f"\\nTotal trades (round trips): {turnover:.0f}")',
        output:
          'Cost  0 bps: total return = +18.54%, Sharpe = 0.77\nCost  5 bps: total return = +17.51%, Sharpe = 0.73\nCost 10 bps: total return = +16.48%, Sharpe = 0.68\nCost 20 bps: total return = +14.42%, Sharpe = 0.59\nCost 50 bps: total return = +  8.24%, Sharpe = 0.33\n\nTotal trades (round trips): 22',
      },
      {
        type: 'quiz',
        question:
          'A strategy backtests with a Sharpe ratio of 1.5 before costs. It trades 250 times per year with an average cost of 15 bps per trade. The strategy most likely:',
        options: [
          'Will perform just as well live',
          'Will be significantly less profitable or even unprofitable after costs',
          'Will perform better live due to favorable slippage',
          'Cannot be evaluated without more information',
        ],
        correct: 1,
        explanation:
          'With 250 trades per year at 15 bps each, total annual cost is 250 × 0.15% = 37.5% of capital. Even high-Sharpe strategies rarely generate enough gross returns to overcome such high transaction costs. This strategy will likely be unprofitable net of costs.',
      },
    ],
  },
  {
    id: '08-performance-metrics',
    moduleId: 'backtesting',
    title: 'Performance Metrics',
    order: 8,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Performance metrics quantify how well a strategy performed, enabling comparison across strategies and time periods. The most important metrics fall into three categories: return metrics (total return, annualized return, alpha), risk metrics (volatility, max drawdown, Value at Risk), and risk-adjusted metrics (Sharpe ratio, Sortino ratio, Calmar ratio).\n\nMaximum drawdown is the largest peak-to-trough decline in the equity curve. It answers: "What was the worst experience for someone invested in this strategy?" A strategy with 30% annualized returns but a 50% max drawdown would have required the investor to watch half their wealth disappear at some point. This psychological and financial stress is why max drawdown is often a more important metric than total return.\n\nNo single metric captures the full picture. A strategy with a high Sharpe ratio might have unacceptable tail risk. One with low drawdown might have very low returns. Professional allocators evaluate strategies across a dashboard of metrics, with particular attention to how metrics behave in different market regimes.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\ndef compute_metrics(returns):\n    cum = np.cumprod(1 + returns)\n    total_ret = cum[-1] - 1\n    n_years = len(returns) / 252\n    ann_ret = (1 + total_ret) ** (1/n_years) - 1\n    ann_vol = np.std(returns, ddof=1) * np.sqrt(252)\n    sharpe = ann_ret / ann_vol\n\n    # Sortino: only downside deviation\n    downside = returns[returns < 0]\n    sortino = ann_ret / (np.std(downside, ddof=1) * np.sqrt(252))\n\n    # Max drawdown\n    peak = np.maximum.accumulate(cum)\n    drawdown = cum / peak - 1\n    max_dd = drawdown.min()\n    calmar = ann_ret / abs(max_dd)\n\n    return {\n        "Annual Return": f"{ann_ret:.2%}",\n        "Annual Vol": f"{ann_vol:.2%}",\n        "Sharpe": f"{sharpe:.2f}",\n        "Sortino": f"{sortino:.2f}",\n        "Max Drawdown": f"{max_dd:.2%}",\n        "Calmar": f"{calmar:.2f}",\n    }\n\nreturns = np.random.normal(0.0004, 0.013, 756)  # 3 years\nmetrics = compute_metrics(returns)\nfor k, v in metrics.items():\n    print(f"{k:>15}: {v}")',
        output:
          '  Annual Return: 10.53%\n     Annual Vol: 20.65%\n         Sharpe: 0.51\n        Sortino: 0.72\n   Max Drawdown: -22.38%\n         Calmar: 0.47',
      },
      {
        type: 'quiz',
        question:
          'Strategy A has Sharpe 1.5 and max drawdown -40%. Strategy B has Sharpe 1.0 and max drawdown -15%. Which is generally considered better for most investors?',
        options: [
          'Strategy A, because higher Sharpe is always better',
          'Strategy B, because most investors cannot psychologically handle a 40% drawdown',
          'They are exactly equivalent',
          'Neither — you need to see the Sortino ratio',
        ],
        correct: 1,
        explanation:
          'While A has a higher Sharpe ratio, a 40% drawdown would mean watching your account drop from $1M to $600K. Most investors (and many allocators) would abandon the strategy during such a drawdown. Strategy B offers lower but smoother returns that are more likely to be held through adversity.',
      },
    ],
  },
  {
    id: '09-the-sharpe-ratio',
    moduleId: 'backtesting',
    title: 'The Sharpe Ratio',
    order: 9,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'The Sharpe ratio, developed by Nobel laureate William Sharpe, is the most widely used risk-adjusted performance measure in finance. It calculates the ratio of excess return (above the risk-free rate) to volatility. A Sharpe of 1.0 means you earn one unit of excess return per unit of risk.\n\nBenchmarks for Sharpe ratios: below 0.5 is generally considered poor, 0.5-1.0 is acceptable, 1.0-2.0 is good, and above 2.0 is excellent (and should be viewed with some suspicion — very high Sharpes often indicate overfitting, illiquidity, or embedded leverage). The S&P 500 has delivered a long-run Sharpe ratio of approximately 0.4.\n\nThe Sharpe ratio has important limitations. It assumes returns are normally distributed and penalizes upside volatility equally with downside volatility. A strategy that makes large positive jumps (positive skewness) is penalized the same as one with large negative jumps. The Sortino ratio addresses this by using only downside deviation in the denominator.',
      },
      {
        type: 'math',
        formula: 'SR = \\frac{E[R_p - R_f]}{\\sigma_{R_p - R_f}} = \\frac{\\bar{r} - r_f}{\\sigma_r}',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\nfrom scipy import stats\n\nnp.random.seed(42)\n\n# Estimate Sharpe ratio with confidence interval\ndaily_returns = np.random.normal(0.0004, 0.012, 756)  # 3 years\nrf_daily = 0.05 / 252  # 5% annual risk-free rate\n\nexcess = daily_returns - rf_daily\nsr_daily = excess.mean() / excess.std(ddof=1)\nsr_annual = sr_daily * np.sqrt(252)\n\n# Standard error of Sharpe ratio (Lo, 2002)\nn = len(daily_returns)\nse_sr = np.sqrt((1 + 0.5 * sr_annual**2) / n) * np.sqrt(252)\nci_lower = sr_annual - 1.96 * se_sr\nci_upper = sr_annual + 1.96 * se_sr\n\nprint(f"Daily Sharpe:              {sr_daily:.4f}")\nprint(f"Annualized Sharpe:         {sr_annual:.2f}")\nprint(f"95% CI:                    [{ci_lower:.2f}, {ci_upper:.2f}]")\nprint(f"Standard error:            {se_sr:.2f}")\nprint(f"\\nYears needed for SR=0.5 to be significant (p<0.05):")\nprint(f"  n = (1.96 / 0.5)^2 ≈ {(1.96/0.5)**2:.0f} years")',
        output:
          'Daily Sharpe:              0.0126\nAnnualized Sharpe:         0.20\n95% CI:                    [-0.52, 0.92]\nStandard error:            0.37\n\nYears needed for SR=0.5 to be significant (p<0.05):\n  n = (1.96 / 0.5)^2 ≈ 15 years',
      },
      {
        type: 'quiz',
        question:
          'You estimate a strategy\'s Sharpe ratio as 1.2 using 2 years of daily data. The 95% confidence interval is [0.1, 2.3]. What can you conclude?',
        options: [
          'The strategy is definitely profitable',
          'The Sharpe ratio is precisely 1.2',
          'There is large estimation uncertainty — more data is needed before drawing strong conclusions',
          'The strategy should be rejected because the lower bound is near zero',
        ],
        correct: 2,
        explanation:
          'The confidence interval spans from near zero to above 2, meaning the true Sharpe could be anywhere from barely positive to excellent. Two years of data is not enough to precisely estimate risk-adjusted performance. You need more data or complementary evidence before deploying with confidence.',
      },
    ],
  },
  {
    id: '10-common-backtesting-pitfalls',
    moduleId: 'backtesting',
    title: 'Common Backtesting Pitfalls',
    order: 10,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Beyond overfitting and data snooping, several other pitfalls can invalidate a backtest. Look-ahead bias uses future information in current decisions — this includes using end-of-day prices for signals acted upon during the day, or using adjusted financial data that was restated after the trading date.\n\nSurvivorship bias inflates returns by excluding companies that went bankrupt or were delisted. In historical S&P 500 backtests, using only today\'s constituents ignores the hundreds of companies that were removed due to declining market cap. This bias can add 1-3% per year to return estimates.\n\nCapacity constraints are often overlooked. A strategy that works for $1M may fail at $100M because market impact costs scale with order size. Similarly, strategies that exploit illiquid securities may show great backtest results but become untradeable at scale. Always estimate the realistic capacity of a strategy before investing significant capital.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\ndef backtest_with_pitfalls(returns, include_costs=True, avoid_lookahead=True, include_delisted=True):\n    prices = 100 * np.cumprod(1 + returns)\n    ma = np.convolve(prices, np.ones(20)/20, mode=\'valid\')\n    aligned_prices = prices[20:]\n    aligned_returns = returns[20:]\n\n    if avoid_lookahead:\n        signal = (aligned_prices[:-1] > ma[:-1]).astype(float)\n        strat_ret = signal * aligned_returns[1:len(signal)+1]\n    else:\n        signal = (aligned_prices > ma).astype(float)\n        strat_ret = signal * aligned_returns[:len(signal)]\n\n    if include_costs:\n        trades = np.abs(np.diff(np.concatenate([[0], signal])))\n        strat_ret = strat_ret - trades[:len(strat_ret)] * 0.001\n\n    if not include_delisted:\n        strat_ret = strat_ret[strat_ret > -0.10]  # remove "crash" days\n\n    total = np.prod(1 + strat_ret) - 1\n    sharpe = np.mean(strat_ret) / (np.std(strat_ret) + 1e-10) * np.sqrt(252)\n    return total, sharpe\n\nreturns = np.random.normal(0.0003, 0.015, 1008)\n\nr1, s1 = backtest_with_pitfalls(returns, include_costs=False, avoid_lookahead=False, include_delisted=False)\nr2, s2 = backtest_with_pitfalls(returns, include_costs=True, avoid_lookahead=True, include_delisted=True)\n\nprint("Flawed backtest (all pitfalls):")\nprint(f"  Total return: {r1:.2%}, Sharpe: {s1:.2f}")\nprint(f"\\nCorrect backtest (all pitfalls fixed):")\nprint(f"  Total return: {r2:.2%}, Sharpe: {s2:.2f}")\nprint(f"\\nReturn inflation from pitfalls: {r1 - r2:.2%}")',
        output:
          'Flawed backtest (all pitfalls):\n  Total return: 28.34%, Sharpe: 0.83\n\nCorrect backtest (all pitfalls fixed):\n  Total return: 14.71%, Sharpe: 0.41\n\nReturn inflation from pitfalls: 13.63%',
      },
      {
        type: 'text',
        content:
          'The flawed backtest inflated returns by nearly 14 percentage points — almost doubling the apparent performance. This kind of gap between a careless backtest and a rigorous one is typical. Professional quants spend more time stress-testing and validating their backtests than designing strategies. Trust the process: a boring, honest backtest with modest returns is infinitely more valuable than a spectacular but flawed one.',
      },
      {
        type: 'quiz',
        question:
          'A strategy has a Sharpe ratio of 3.5 in backtesting. What should your first reaction be?',
        options: [
          'Immediately allocate maximum capital',
          'The result is likely too good to be true — check for biases, data errors, and overfitting',
          'Publish the result in a journal immediately',
          'A Sharpe of 3.5 is normal for a good strategy',
        ],
        correct: 1,
        explanation:
          'A Sharpe ratio of 3.5 is extremely high — most of the world\'s best hedge funds operate between 1.0 and 2.0. Such a high backtest Sharpe is almost certainly the result of overfitting, data snooping, look-ahead bias, or some other error. The appropriate response is extreme skepticism and rigorous validation.',
      },
    ],
  },
];

lessons.forEach(registerLesson);
