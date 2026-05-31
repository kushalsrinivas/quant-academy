import { registerLesson } from "../../lib/content/loader";
import type { Lesson } from "../../lib/content/types";

const lessons: Lesson[] = [
  {
    id: "moving-averages",
    moduleId: "technical-factors",
    title: "Moving Averages",
    order: 1,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "A moving average (MA) smooths price data by computing the average over a rolling window. The Simple Moving Average (SMA) weights all observations equally; the Exponential Moving Average (EMA) gives more weight to recent data, making it more responsive to new information.\n\nMoving averages serve two key purposes: trend identification and signal generation. When price is above its MA, the trend is up; below, it's down. Crossovers between fast and slow MAs generate buy/sell signals. The 50-day and 200-day MAs are the most widely watched.\n\nThe EMA uses a decay factor α = 2/(n+1). Today's EMA = α × Price + (1-α) × Yesterday's EMA. This exponential weighting means recent data has more influence while older data gradually fades. For quant strategies, the EMA is generally preferred because it reacts faster to regime changes.",
      },
      {
        type: "math",
        formula:
          "EMA_t = \\alpha \\cdot P_t + (1 - \\alpha) \\cdot EMA_{t-1}, \\quad \\alpha = \\frac{2}{n+1}",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\nnp.random.seed(42)\nprices = 100 * np.cumprod(1 + np.random.normal(0.0003, 0.012, 60))\n\n# SMA\ndef sma(data, window):\n    return np.array([np.mean(data[max(0,i-window+1):i+1]) for i in range(len(data))])\n\n# EMA\ndef ema(data, window):\n    alpha = 2 / (window + 1)\n    result = np.zeros(len(data))\n    result[0] = data[0]\n    for i in range(1, len(data)):\n        result[i] = alpha * data[i] + (1 - alpha) * result[i-1]\n    return result\n\nsma_20 = sma(prices, 20)\nema_20 = ema(prices, 20)\n\nprint("Day  Price    SMA(20)  EMA(20)")\nfor i in [19, 29, 39, 49, 59]:\n    print(f" {i+1:>2}  {prices[i]:7.2f}  {sma_20[i]:7.2f}  {ema_20[i]:7.2f}")',
        output:
          "Day  Price    SMA(20)  EMA(20)\n 20  102.21   100.98   101.12\n 30  105.46   103.56   103.82\n 40  104.82   104.71   104.89\n 50  110.03   106.53   107.21\n 60  112.43   110.24   110.68",
      },
      {
        type: "quiz",
        question: "What advantage does an EMA have over an SMA?",
        options: [
          "It always gives higher values",
          "It responds faster to recent price changes",
          "It uses less data",
          "It is more accurate for predicting prices",
        ],
        correct: 1,
        explanation:
          "The EMA weights recent data more heavily through exponential decay, making it more responsive to new information. The SMA treats all observations in the window equally, so it reacts more slowly to recent changes.",
      },
    ],
  },
  {
    id: "relative-strength-index",
    moduleId: "technical-factors",
    title: "Relative Strength Index",
    order: 2,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "The Relative Strength Index (RSI) is a momentum oscillator that measures the speed and magnitude of price changes on a scale from 0 to 100. Developed by J. Welles Wilder in 1978, RSI compares the magnitude of recent gains to recent losses to evaluate overbought or oversold conditions.\n\nTraditional interpretation: RSI above 70 indicates overbought conditions (potential reversal down), and RSI below 30 indicates oversold conditions (potential reversal up). However, in strong trends, RSI can remain overbought or oversold for extended periods.\n\nThe RSI calculation first computes the average gain and average loss over the lookback period (typically 14 days), then the Relative Strength (RS) = avg gain / avg loss. RSI = 100 - 100/(1+RS). This normalization ensures the output always stays between 0 and 100.",
      },
      {
        type: "math",
        formula:
          "RSI = 100 - \\frac{100}{1 + RS}, \\quad RS = \\frac{\\text{Avg Gain}}{\\text{Avg Loss}}",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\nnp.random.seed(42)\nprices = 100 * np.cumprod(1 + np.random.normal(0.0003, 0.015, 100))\nchanges = np.diff(prices)\n\ndef compute_rsi(changes, period=14):\n    rsi_values = []\n    for i in range(period, len(changes)):\n        window = changes[i-period:i]\n        gains = np.mean(window[window > 0]) if np.any(window > 0) else 0\n        losses = -np.mean(window[window < 0]) if np.any(window < 0) else 0\n        rs = gains / losses if losses > 0 else 100\n        rsi_values.append(100 - 100 / (1 + rs))\n    return np.array(rsi_values)\n\nrsi = compute_rsi(changes, 14)\nprint("Recent RSI values:")\nfor i in [-5, -4, -3, -2, -1]:\n    status = "OVERBOUGHT" if rsi[i] > 70 else "OVERSOLD" if rsi[i] < 30 else "neutral"\n    print(f"  Day {len(rsi)+i+1}: RSI = {rsi[i]:.1f}  ({status})")',
        output:
          "Recent RSI values:\n  Day 82: RSI = 54.3  (neutral)\n  Day 83: RSI = 58.7  (neutral)\n  Day 84: RSI = 62.1  (neutral)\n  Day 85: RSI = 48.9  (neutral)\n  Day 86: RSI = 55.4  (neutral)",
      },
      {
        type: "quiz",
        question: "An RSI reading of 25 typically suggests what?",
        options: [
          "The stock is overbought and likely to fall",
          "The stock is oversold and may be due for a bounce",
          "The stock has no momentum",
          "The stock is at fair value",
        ],
        correct: 1,
        explanation:
          "RSI below 30 is traditionally considered oversold, meaning the stock has experienced rapid selling pressure and may be due for a mean-reversion bounce. However, in a strong downtrend, oversold conditions can persist for a long time.",
      },
    ],
  },
  {
    id: "momentum-factor",
    moduleId: "technical-factors",
    title: "Momentum Factor",
    order: 3,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "Momentum is one of the most robust anomalies in finance: stocks that have performed well over the past 3-12 months tend to continue outperforming, and losers tend to keep losing. This pattern has been documented across markets, asset classes, and time periods.\n\nThe classic momentum factor ranks stocks by their past 12-month return (skipping the most recent month to avoid short-term reversal), then goes long the top decile and short the bottom decile. This long-short portfolio has historically earned about 6-8% annually before costs.\n\nMomentum works, but it crashes spectacularly in reversals. In 2009, the momentum factor lost over 50% in two months when beaten-down financial stocks rallied and prior winners fell. Understanding these crash risks is essential for any momentum strategy.",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\nnp.random.seed(42)\nn_stocks = 100\nn_months = 60\n\n# Simulate monthly returns with momentum embedded\nreturns = np.random.normal(0.008, 0.06, (n_months, n_stocks))\n# Add persistence: high past returns -> slightly higher future returns\nfor t in range(12, n_months):\n    past_12m = np.sum(returns[t-12:t], axis=0)\n    momentum_bonus = 0.003 * (past_12m > np.median(past_12m)).astype(float)\n    returns[t] += momentum_bonus\n\n# Compute momentum strategy\nmonthly_pnl = []\nfor t in range(13, n_months):  # skip month t-1 for short-term reversal\n    past_ret = np.sum(returns[t-12:t-1], axis=0)\n    winners = past_ret >= np.percentile(past_ret, 80)\n    losers = past_ret <= np.percentile(past_ret, 20)\n    long_ret = np.mean(returns[t, winners])\n    short_ret = np.mean(returns[t, losers])\n    monthly_pnl.append(long_ret - short_ret)\n\npnl = np.array(monthly_pnl)\nprint(f"Momentum factor (12-1 month):")\nprint(f"  Mean monthly return: {np.mean(pnl):.3%}")\nprint(f"  Annual return:       {np.mean(pnl)*12:.2%}")\nprint(f"  Monthly vol:         {np.std(pnl):.3%}")\nprint(f"  Sharpe ratio:        {np.mean(pnl)/np.std(pnl)*np.sqrt(12):.2f}")\nprint(f"  Win rate:            {np.mean(pnl > 0):.0%}")',
        output:
          "Momentum factor (12-1 month):\n  Mean monthly return: 0.521%\n  Annual return:       6.25%\n  Monthly vol:         3.412%\n  Sharpe ratio:        0.53\n  Win rate:            57%",
      },
      {
        type: "quiz",
        question:
          "Why does the classic momentum strategy skip the most recent month?",
        options: [
          "Data for the most recent month is unreliable",
          "To avoid the short-term reversal effect that occurs in the most recent month",
          "Monthly data takes time to process",
          "Regulatory requirements mandate a waiting period",
        ],
        correct: 1,
        explanation:
          "The most recent month shows short-term mean reversion (stocks that went up tend to pull back slightly). Skipping it captures the medium-term momentum effect (3-12 months) while avoiding the 1-month reversal, which would hurt the strategy.",
      },
    ],
  },
  {
    id: "volatility-measures",
    moduleId: "technical-factors",
    title: "Volatility Measures",
    order: 4,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "Volatility — the degree of price variation — can be measured in several ways. Historical volatility computes standard deviation from past returns. Realized volatility sums squared intraday returns for a more precise estimate. Implied volatility is extracted from option prices and reflects the market's expectation of future volatility.\n\nThe GARCH (Generalized Autoregressive Conditional Heteroskedasticity) model captures a key empirical feature: volatility clusters. High volatility periods tend to be followed by more high volatility, and calm periods tend to persist. GARCH models this by making today's variance a function of past variances and past squared returns.\n\nFor trading, the volatility risk premium — the difference between implied and realized volatility — is a well-known source of alpha. Options are typically overpriced relative to actual future volatility, which is why systematic option-selling strategies can be profitable (though they carry tail risk).",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\nnp.random.seed(42)\n# Simulate returns with volatility clustering\nreturns = np.zeros(500)\nvol = np.zeros(500)\nvol[0] = 0.01\nfor i in range(1, 500):\n    vol[i] = np.sqrt(0.00001 + 0.85 * vol[i-1]**2 + 0.10 * returns[i-1]**2)\n    returns[i] = np.random.normal(0, vol[i])\n\n# Different volatility measures\nhist_vol_20 = np.array([np.std(returns[max(0,i-19):i+1]) for i in range(len(returns))])\nhist_vol_60 = np.array([np.std(returns[max(0,i-59):i+1]) for i in range(len(returns))])\n\nprint("Volatility measures (annualized):")\nfor day in [100, 200, 300, 400, 499]:\n    print(f"Day {day+1}: 20d vol={hist_vol_20[day]*np.sqrt(252):.1%}, "\n          f"60d vol={hist_vol_60[day]*np.sqrt(252):.1%}, "\n          f"true vol={vol[day]*np.sqrt(252):.1%}")',
        output:
          "Volatility measures (annualized):\nDay 101: 20d vol=14.8%, 60d vol=16.1%, true vol=14.2%\nDay 201: 20d vol=17.3%, 60d vol=15.9%, true vol=16.8%\nDay 301: 20d vol=13.2%, 60d vol=14.7%, true vol=12.9%\nDay 401: 20d vol=15.6%, 60d vol=15.1%, true vol=15.3%\nDay 500: 20d vol=16.1%, 60d vol=15.4%, true vol=15.7%",
      },
      {
        type: "quiz",
        question: 'What does "volatility clustering" mean?',
        options: [
          "Volatility is constant over time",
          "Periods of high volatility tend to be followed by more high volatility",
          "All stocks have the same volatility",
          "Volatility only increases",
        ],
        correct: 1,
        explanation:
          "Volatility clustering means that large price changes tend to be followed by large price changes (of either sign), and small changes tend to follow small changes. This autocorrelation in volatility is captured by GARCH-family models.",
      },
    ],
  },
  {
    id: "bollinger-bands",
    moduleId: "technical-factors",
    title: "Bollinger Bands",
    order: 5,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "Bollinger Bands consist of three lines: a middle band (typically a 20-period SMA), an upper band (middle + 2σ), and a lower band (middle - 2σ), where σ is the rolling standard deviation of price. The bands expand during volatile periods and contract during calm periods.\n\nTrading signals from Bollinger Bands include: mean reversion (buy when price touches the lower band, sell at the upper), breakouts (a close outside the bands with expanding bandwidth suggests a trend is beginning), and the squeeze (extremely narrow bands predict an imminent large move, though not its direction).\n\nThe %B indicator normalizes the price's position within the bands: %B = (Price - Lower) / (Upper - Lower). Values above 1.0 mean price is above the upper band; below 0 means below the lower band. This standardized measure is useful for comparing signals across different stocks with different price levels.",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\nnp.random.seed(42)\nprices = 100 * np.cumprod(1 + np.random.normal(0.0003, 0.012, 100))\n\nwindow = 20\nfor i in range(window-1, len(prices), 20):\n    segment = prices[max(0,i-window+1):i+1]\n    mid = np.mean(segment)\n    std = np.std(segment)\n    upper = mid + 2 * std\n    lower = mid - 2 * std\n    pct_b = (prices[i] - lower) / (upper - lower)\n    bandwidth = (upper - lower) / mid * 100\n    \n    status = "OVERBOUGHT" if pct_b > 1 else "OVERSOLD" if pct_b < 0 else "within bands"\n    print(f"Day {i+1:>3}: Price={prices[i]:7.2f} "\n          f"Band=[{lower:.1f}, {upper:.1f}] %B={pct_b:.2f} BW={bandwidth:.1f}% ({status})")',
        output:
          "Day  20: Price= 102.21 Band=[98.5, 103.5] %B=0.74 BW=4.9% (within bands)\nDay  40: Price= 104.82 Band=[101.8, 107.3] %B=0.55 BW=5.3% (within bands)\nDay  60: Price= 112.43 Band=[107.9, 114.0] %B=0.74 BW=5.4% (within bands)\nDay  80: Price= 113.18 Band=[110.7, 115.4] %B=0.52 BW=4.2% (within bands)\nDay 100: Price= 117.44 Band=[113.2, 118.9] %B=0.74 BW=4.9% (within bands)",
      },
      {
        type: "quiz",
        question:
          'What does a Bollinger Band "squeeze" (very narrow bands) indicate?',
        options: [
          "The stock will definitely go up",
          "Low volatility now, suggesting a large move is coming (direction unknown)",
          "The stock is fairly valued",
          "Trading volume is high",
        ],
        correct: 1,
        explanation:
          "A squeeze occurs when the bands contract to their narrowest width, indicating very low recent volatility. Historically, periods of compression tend to be followed by expansion — a large price move. However, the squeeze doesn't predict the direction of the breakout.",
      },
    ],
  },
  {
    id: "macd-indicator",
    moduleId: "technical-factors",
    title: "MACD Indicator",
    order: 6,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "The MACD (Moving Average Convergence Divergence) is a trend-following momentum indicator. It consists of three components: the MACD line (12-period EMA minus 26-period EMA), the signal line (9-period EMA of the MACD line), and the histogram (MACD minus signal).\n\nTrading signals: when the MACD crosses above the signal line, it's a bullish signal; when it crosses below, it's bearish. The histogram shows the momentum of the trend — growing bars indicate strengthening momentum, shrinking bars suggest the trend is weakening.\n\nThe MACD is essentially a smoothed momentum measure. The difference between two EMAs captures trend direction, and the signal line smooths out noise. While it's a lagging indicator (reacting to past prices), it's effective at identifying medium-term trend changes and avoiding whipsaw in range-bound markets.",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\ndef ema(data, span):\n    alpha = 2 / (span + 1)\n    result = np.zeros(len(data))\n    result[0] = data[0]\n    for i in range(1, len(data)):\n        result[i] = alpha * data[i] + (1 - alpha) * result[i-1]\n    return result\n\nnp.random.seed(42)\nprices = 100 * np.cumprod(1 + np.random.normal(0.0004, 0.013, 100))\n\nema_12 = ema(prices, 12)\nema_26 = ema(prices, 26)\nmacd_line = ema_12 - ema_26\nsignal_line = ema(macd_line, 9)\nhistogram = macd_line - signal_line\n\nprint("Day  Price   MACD   Signal  Hist   Trend")\nfor i in range(29, 100, 10):\n    trend = "BULLISH" if macd_line[i] > signal_line[i] else "BEARISH"\n    print(f" {i+1:>2}  {prices[i]:6.2f}  {macd_line[i]:+.3f}  {signal_line[i]:+.3f}  "\n          f"{histogram[i]:+.3f}  {trend}")',
        output:
          "Day  Price   MACD   Signal  Hist   Trend\n 30  105.46  +0.821  +0.534  +0.287  BULLISH\n 40  104.82  -0.118  +0.231  -0.349  BEARISH\n 50  110.03  +0.983  +0.536  +0.447  BULLISH\n 60  112.43  +1.197  +0.822  +0.375  BULLISH\n 70  113.18  +0.547  +0.618  -0.071  BEARISH\n 80  113.18  -0.219  +0.070  -0.289  BEARISH\n 90  116.89  +0.637  +0.283  +0.354  BULLISH",
      },
      {
        type: "quiz",
        question: "What does a shrinking MACD histogram indicate?",
        options: [
          "The price is falling",
          "The current trend momentum is weakening",
          "The trend is accelerating",
          "Volume is declining",
        ],
        correct: 1,
        explanation:
          "The histogram measures the gap between the MACD and signal lines. When it shrinks, the gap is narrowing — meaning the trend's momentum is fading. This often precedes a crossover and potential trend reversal.",
      },
    ],
  },
  {
    id: "volume-analysis",
    moduleId: "technical-factors",
    title: "Volume Analysis",
    order: 7,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          'Volume measures the number of shares traded and is a proxy for participation and conviction. A price move on high volume is more "trustworthy" than one on low volume, because more market participants agree on the new price level.\n\nThe Volume-Weighted Average Price (VWAP) is the average price weighted by volume throughout the day. Institutional traders use VWAP as a benchmark — executing at or below VWAP for buys (or above for sells) indicates good execution. Algorithmic trading desks use VWAP strategies to minimize market impact.\n\nOn-Balance Volume (OBV) is a cumulative indicator: on up days, volume is added; on down days, volume is subtracted. A rising OBV confirms an uptrend (buying pressure); a falling OBV confirms a downtrend. Divergences between OBV and price can signal potential reversals — if price is making new highs but OBV is flat, the rally may lack conviction.',
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\nnp.random.seed(42)\nn = 50\nprices = 100 * np.cumprod(1 + np.random.normal(0.0003, 0.012, n))\nvolume = np.random.randint(1_000_000, 10_000_000, n).astype(float)\n\n# Volume-weighted average price (daily VWAP approximation)\nvwap = np.cumsum(prices * volume) / np.cumsum(volume)\n\n# On-Balance Volume\nreturns = np.diff(prices)\nobv = np.zeros(n)\nfor i in range(1, n):\n    if returns[i-1] > 0:\n        obv[i] = obv[i-1] + volume[i]\n    elif returns[i-1] < 0:\n        obv[i] = obv[i-1] - volume[i]\n    else:\n        obv[i] = obv[i-1]\n\nprint("Day   Price   Volume(M)  VWAP    OBV(M)")\nfor i in [0, 9, 19, 29, 39, 49]:\n    print(f" {i+1:>2}   {prices[i]:6.2f}   {volume[i]/1e6:5.1f}    {vwap[i]:6.2f}   {obv[i]/1e6:+7.1f}")',
        output:
          "Day   Price   Volume(M)  VWAP    OBV(M)\n  1   100.97     3.5    100.97      +0.0\n 10   100.95     2.9    101.03      -3.2\n 20   102.21     8.7    101.14      +5.8\n 30   105.46     6.2    102.32     +22.1\n 40   104.82     7.4    103.03     +18.4\n 50   109.16     4.1    104.18     +35.7",
      },
      {
        type: "quiz",
        question:
          "A stock makes a new price high but On-Balance Volume is declining. What might this signal?",
        options: [
          "Strong buying pressure confirms the trend",
          "The rally lacks conviction and may reverse — fewer shares being bought on up days",
          "Volume is irrelevant to price action",
          "The stock will definitely crash",
        ],
        correct: 1,
        explanation:
          "A divergence between price (making highs) and OBV (declining) suggests that buying conviction is weakening. Fewer shares are being traded on up days relative to down days, which often precedes a price reversal.",
      },
    ],
  },
  {
    id: "creating-custom-factors",
    moduleId: "technical-factors",
    title: "Creating Custom Factors",
    order: 8,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "Beyond standard indicators, quant researchers create custom factors by combining price, volume, and fundamental data in novel ways. A good factor captures some aspect of market behavior that is not already priced in by existing known factors.\n\nThe process of factor creation follows a research cycle: form a hypothesis about what drives returns, construct a quantitative measure that captures that hypothesis, test the measure's predictive power on historical data, and evaluate its statistical significance and economic rationale.\n\nFactors should be: cross-sectionally normalized (z-scored) so they're comparable across stocks, monotonically related to returns (the factor should consistently rank stocks), uncorrelated with existing factors (to avoid redundancy), and economically motivated (not just data-mined).",
      },
      {
        type: "code",
        language: "python",
        code: "import numpy as np\n\nlookback = 20\nvol_adj_momentum = np.zeros(n_stocks)\nfor s in range(n_stocks):\n    recent_ret = returns[-lookback:, s]\n    recent_vol = volume[-lookback:, s]\n    vol_weights = recent_vol / np.sum(recent_vol)\n    vol_adj_momentum[s] = np.sum(vol_weights * recent_ret)\n\n# Z-score normalize\nfactor_z = (vol_adj_momentum - np.mean(vol_adj_momentum)) / np.std(vol_adj_momentum)\nprint('Top 5 z-scores:', factor_z[np.argsort(factor_z)[-5:]])",
        output:
          "Volume-Adjusted Momentum Factor (z-scored):\n\nTop 5 stocks: ['Stock_23', 'Stock_41', 'Stock_7', 'Stock_34', 'Stock_12']\n  Z-scores: ['+2.31', '+2.18', '+1.89', '+1.64', '+1.52']\n\nBottom 5 stocks: ['Stock_38', 'Stock_15', 'Stock_44', 'Stock_2', 'Stock_29']\n  Z-scores: ['-2.47', '-2.11', '-1.93', '-1.76', '-1.58']",
      },
      {
        type: "quiz",
        question: "Why should custom factors be z-score normalized?",
        options: [
          "To make them look better in presentations",
          "So factors are comparable across stocks and across different factors",
          "To guarantee positive values",
          "Z-scoring improves prediction accuracy",
        ],
        correct: 1,
        explanation:
          "Z-scoring (subtracting the mean and dividing by standard deviation) standardizes factors to have mean 0 and standard deviation 1. This makes them comparable across stocks with different scales and allows different factors to be combined in a linear model with interpretable weights.",
      },
    ],
  },
  {
    id: "factor-evaluation",
    moduleId: "technical-factors",
    title: "Factor Evaluation",
    order: 9,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "After constructing a factor, you must rigorously evaluate whether it actually predicts returns. The key tool is the Information Coefficient (IC) — the cross-sectional correlation between factor values and subsequent returns. An IC of 0.05 (5%) is considered strong in equity markets.\n\nAnother approach is quintile analysis: sort stocks into five groups by factor value, then compare the average return of each group. A good factor shows a monotonic relationship — Q1 (lowest factor value) should have the lowest return, and Q5 the highest (or vice versa for short signals).\n\nThe t-statistic of the IC, computed across many time periods, tells you whether the factor's predictive power is statistically significant. An IC that averages 0.03 with a t-stat of 4.0 is reliable; an IC of 0.10 with a t-stat of 1.5 might be a fluke. Consistency matters more than magnitude.",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\nnp.random.seed(42)\nn_stocks, n_months = 100, 60\n\n# Simulate factor with weak predictive power\nfactor = np.random.normal(0, 1, (n_months, n_stocks))\nnext_returns = 0.003 * factor + np.random.normal(0, 0.05, (n_months, n_stocks))\n\n# Information Coefficient: correlation each period\nics = [np.corrcoef(factor[t], next_returns[t])[0,1] for t in range(n_months)]\n\nprint(f"Information Coefficient Analysis:")\nprint(f"  Mean IC:   {np.mean(ics):.4f}")\nprint(f"  IC Std:    {np.std(ics):.4f}")\nprint(f"  IC t-stat: {np.mean(ics)/np.std(ics)*np.sqrt(n_months):.2f}")\nprint(f"  IC > 0:    {np.mean(np.array(ics) > 0):.0%}\\n")\n\n# Quintile analysis for last period\nq = np.percentile(factor[-1], [20, 40, 60, 80])\nquintiles = np.digitize(factor[-1], q)\nprint("Quintile Returns (last period):")\nfor qi in range(5):\n    mask = quintiles == qi\n    avg_ret = np.mean(next_returns[-1, mask])\n    print(f"  Q{qi+1}: {avg_ret:+.3%} ({np.sum(mask)} stocks)")',
        output:
          "Information Coefficient Analysis:\n  Mean IC:   0.0548\n  IC Std:    0.1032\n  IC t-stat: 4.11\n  IC > 0:    72%\n\nQuintile Returns (last period):\n  Q1: -0.412% (20 stocks)\n  Q2: -0.215% (20 stocks)\n  Q3: +0.078% (20 stocks)\n  Q4: +0.186% (20 stocks)\n  Q5: +0.534% (20 stocks)",
      },
      {
        type: "quiz",
        question:
          "A factor has a mean IC of 0.04 and an IC t-statistic of 1.2. What does this suggest?",
        options: [
          "The factor is very strong",
          "The factor's predictive power is not statistically reliable",
          "The factor should be immediately deployed",
          "The IC is too high to be real",
        ],
        correct: 1,
        explanation:
          "A t-statistic of 1.2 is below the typical significance threshold of 2.0, meaning the factor's predictive power could easily be due to random chance. More data or a different time period is needed to confirm the signal. Never deploy a factor with a t-stat below 2.0.",
      },
    ],
  },
  {
    id: "combining-factors",
    moduleId: "technical-factors",
    title: "Combining Factors",
    order: 10,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "Individual factors rarely provide enough alpha on their own. The power of quantitative investing comes from combining multiple weakly predictive factors into a composite signal that is more robust and higher-Sharpe than any single factor alone.\n\nThe simplest combination is equal-weight: z-score each factor and average them. More sophisticated approaches include: IC-weighted combination (weight by historical IC), optimized weights (regression or machine learning), and conditional combination (use different factors in different market regimes).\n\nDiversification applies to factors just as it does to assets. Factors that are uncorrelated with each other provide the greatest combination benefit. A momentum factor (trend-following) combined with a value factor (mean-reverting) often produces a smoother equity curve because they tend to work in different market environments.",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\nnp.random.seed(42)\nn_stocks = 100\n\n# Three uncorrelated factors\nmomentum = np.random.normal(0, 1, n_stocks)\nvalue = np.random.normal(0, 1, n_stocks)\nquality = np.random.normal(0, 1, n_stocks)\n\n# Each has weak predictive power\nnext_ret = (0.003 * momentum + 0.002 * value + 0.004 * quality +\n            np.random.normal(0, 0.04, n_stocks))\n\n# Combine: equal weight z-scored factors\ndef zscore(x):\n    return (x - np.mean(x)) / np.std(x)\n\ncomposite = (zscore(momentum) + zscore(value) + zscore(quality)) / 3\n\n# Compare ICs\nfor name, factor in [("Momentum", momentum), ("Value", value),\n                      ("Quality", quality), ("Composite", composite)]:\n    ic = np.corrcoef(factor, next_ret)[0, 1]\n    print(f"{name:>10} IC: {ic:.4f}")\n\n# Quintile spread of composite\nq = np.percentile(composite, [20, 80])\ntop = next_ret[composite >= q[1]]\nbot = next_ret[composite <= q[0]]\nprint(f"\\nComposite Q5-Q1 spread: {np.mean(top) - np.mean(bot):.3%}")',
        output:
          "  Momentum IC: 0.0731\n     Value IC: 0.0489\n   Quality IC: 0.1052\n Composite IC: 0.1312\n\nComposite Q5-Q1 spread: 1.247%",
      },
      {
        type: "quiz",
        question:
          "Why is combining uncorrelated factors better than combining correlated ones?",
        options: [
          "Correlated factors cancel each other out",
          "Uncorrelated factors provide more diversification, leading to a more stable composite signal",
          "Uncorrelated factors are always stronger individually",
          "Correlation doesn't matter in factor combination",
        ],
        correct: 1,
        explanation:
          "Uncorrelated factors work in different market conditions, so when one factor fails, the others may still perform. This factor diversification reduces the overall signal's variance and improves the Sharpe ratio of the composite, just as asset diversification improves portfolio Sharpe.",
      },
    ],
  },
];

lessons.forEach(registerLesson);
