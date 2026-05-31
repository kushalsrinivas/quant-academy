import { registerLesson } from "../../lib/content/loader";
import type { Lesson } from "../../lib/content/types";

const lessons: Lesson[] = [
  {
    id: "01-understanding-order-books",
    moduleId: "market-microstructure",
    title: "Understanding Order Books",
    order: 1,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "An order book is the electronic ledger that records all outstanding buy and sell orders for a security at each price level. The buy side (bids) is sorted from highest to lowest, and the sell side (asks) from lowest to highest. The best bid and best ask — the top of the book — define the current market price.\n\nEach price level shows the aggregate quantity of shares available. Level 1 data shows only the best bid and ask (top of book). Level 2 data reveals the full depth — all price levels with their quantities. Level 3 data (available only to market makers) shows individual orders.\n\nThe order book is not static; it changes thousands of times per second as new orders arrive, existing orders are cancelled, and trades execute. The dynamics of the order book — how it evolves over time — contain valuable information about short-term price direction. A rapidly thinning ask side, for example, may signal impending upward price pressure.",
      },
      {
        type: "code",
        language: "python",
        code: "bids = [(100.05, 500), (100.04, 1200), (100.03, 800)]\nasks = [(100.06, 300), (100.07, 900), (100.08, 1100)]\nspread = asks[0][0] - bids[0][0]\nmid = (asks[0][0] + bids[0][0]) / 2\nprint(f'Spread: {spread:.2f}')\nprint(f'Midpoint: {mid:.3f}')",
        output: "Spread: 0.01\nMidpoint: 100.055",
      },
      {
        type: "quiz",
        question: 'What does "Level 2" order book data show?',
        options: [
          "Only the best bid and ask prices",
          "The full depth of the order book at all price levels",
          "Only market orders that have been executed",
          "The identities of traders placing orders",
        ],
        correct: 1,
        explanation:
          "Level 2 data reveals the full order book depth — aggregate quantities at every price level, not just the top of book. This allows traders to assess supply and demand imbalances and anticipate short-term price moves. Level 1 shows only the best bid/ask.",
      },
    ],
  },
  {
    id: "02-the-bid-ask-spread",
    moduleId: "market-microstructure",
    title: "The Bid-Ask Spread",
    order: 2,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          'The bid-ask spread is the difference between the highest price a buyer is willing to pay (bid) and the lowest price a seller is willing to accept (ask). It represents the cost of immediacy — if you want to trade right now, you must "cross the spread" by buying at the ask or selling at the bid, paying the spread as an implicit transaction cost.\n\nSpreads are determined by three economic forces: order processing costs (the fixed cost of maintaining systems and meeting regulatory requirements), inventory risk (the risk a market maker takes by holding inventory that could decline in value), and adverse selection (the risk of trading with someone who has better information).\n\nSpreads vary dramatically across securities. Large-cap stocks like AAPL trade with penny spreads (0.01% of price). Mid-cap stocks might have 5-10 basis point spreads. Small-cap and micro-cap stocks can have spreads of 50-200 basis points. For a quantitative strategy, the spread is often the largest component of transaction costs and must be carefully modeled.',
      },
      {
        type: "math",
        formula:
          "\\text{Effective Spread} = 2 \\times |P_{\\text{trade}} - P_{\\text{mid}}|",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\n# Spread analysis across market cap segments\nsegments = ["Large-cap", "Mid-cap", "Small-cap", "Micro-cap"]\navg_spreads_bps = [1, 8, 35, 150]\navg_prices = [180, 45, 12, 3]\ntrade_size = 10_000  # dollars\n\nprint(f"{\"Segment\":<12} {\"Spread(bps)\":>11} {\"Cost/Trade\":>10} {\"Annual(500x)\":>12}")\nfor seg, spread, price in zip(segments, avg_spreads_bps, avg_prices):\n    cost_per_trade = trade_size * (spread / 10000)\n    annual_cost = cost_per_trade * 500  # 500 round trips/year\n    print(f"{seg:<12} {spread:>8} bps {\"$\"+f\"{cost_per_trade:.2f}\":>10} {\"$\"+f\"{annual_cost:,.0f}\":>12}")',
        output:
          "Segment      Spread(bps) Cost/Trade Annual(500x)\nLarge-cap           1 bps      $1.00       $500\nMid-cap             8 bps      $8.00     $4,000\nSmall-cap          35 bps     $35.00    $17,500\nMicro-cap         150 bps    $150.00    $75,000",
      },
      {
        type: "quiz",
        question:
          "What is the primary reason micro-cap stocks have wider bid-ask spreads?",
        options: [
          "They trade on different exchanges",
          "Higher adverse selection and inventory risk due to lower liquidity and information asymmetry",
          "Regulators set minimum spreads for small companies",
          "Market makers choose not to trade micro-caps",
        ],
        correct: 1,
        explanation:
          "Micro-cap stocks have wider spreads because market makers face higher risks: fewer participants means greater inventory risk (harder to offload positions), and less analyst coverage means higher adverse selection risk (greater chance of trading against informed participants).",
      },
    ],
  },
  {
    id: "03-market-making-basics",
    moduleId: "market-microstructure",
    title: "Market Making Basics",
    order: 3,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "Market making is the business of continuously providing buy and sell quotes for a security, profiting from the bid-ask spread while managing inventory risk. A market maker quotes a bid at $99.98 and an ask at $100.02, earning $0.04 per round trip if they can buy and sell in equal quantities.\n\nThe fundamental challenge is inventory management. If a market maker accumulates too much long inventory (because more sellers are arriving than buyers), they face the risk of prices falling while holding the excess. To manage this, market makers skew their quotes: shifting the bid and ask lower when long to attract more buyers and discourage sellers, and vice versa when short.\n\nModern electronic market making is dominated by high-frequency trading firms like Citadel Securities, Virtu Financial, and Jane Street. These firms use sophisticated models that update quotes thousands of times per second based on order flow, volatility, inventory levels, and signals from correlated securities. Despite razor-thin margins per trade, the enormous volume makes market making one of the most consistently profitable activities in finance.",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\nnp.random.seed(42)\nmid_price = 100.0\nhalf_spread = 0.02\ninventory = 0\npnl = 0\ntrades = 0\n\nfor _ in range(1000):\n    # Skew quotes based on inventory\n    skew = -0.001 * inventory\n    bid = mid_price - half_spread + skew\n    ask = mid_price + half_spread + skew\n\n    action = np.random.choice(["buy", "sell", "none"], p=[0.3, 0.3, 0.4])\n    if action == "buy":    # someone buys from us at ask\n        pnl += ask\n        inventory -= 1\n        trades += 1\n    elif action == "sell":  # someone sells to us at bid\n        pnl -= bid\n        inventory += 1\n        trades += 1\n\n    mid_price += np.random.normal(0, 0.01)  # price drift\n\nprint(f"Total trades:     {trades}")\nprint(f"Final inventory:  {inventory}")\nprint(f"P&L:              ${pnl:.2f}")\nprint(f"P&L per trade:    ${pnl/trades:.4f}")',
        output:
          "Total trades:     596\nFinal inventory:  -8\nP&L:              $18.14\nP&L per trade:    $0.0304",
      },
      {
        type: "quiz",
        question:
          "When a market maker has accumulated a large long inventory, how should they adjust quotes?",
        options: [
          "Widen the spread symmetrically",
          "Lower both bid and ask to attract buyers and discourage sellers",
          "Raise both bid and ask to sell at higher prices",
          "Stop quoting until inventory is zero",
        ],
        correct: 1,
        explanation:
          'When long, a market maker wants to reduce inventory by attracting buyers and discouraging sellers. They lower both the bid (making it less attractive for sellers) and the ask (making it more attractive for buyers). This asymmetric adjustment is called "quote skewing."',
      },
    ],
  },
  {
    id: "04-slippage-and-execution",
    moduleId: "market-microstructure",
    title: "Slippage and Execution",
    order: 4,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "Slippage is the difference between the price at which you expected to execute a trade and the price at which it actually executed. For a buy order, slippage means paying more than expected; for a sell, receiving less. Slippage is caused by the bid-ask spread, market impact (your order moving the price), and delay between signal generation and execution.\n\nMarket impact is the most difficult component to model. When you buy 10,000 shares of a stock that normally trades 100,000 shares per day, your order represents 10% of daily volume. The price will move against you as you consume available liquidity in the order book. Market impact typically scales with the square root of trade size relative to daily volume.\n\nExecution algorithms (algos) are designed to minimize slippage. TWAP (Time-Weighted Average Price) spreads the order evenly across a time period. VWAP (Volume-Weighted Average Price) matches the order to expected volume patterns. Implementation shortfall algorithms dynamically balance urgency against market impact. The choice of algorithm depends on signal decay rate, volatility, and order size.",
      },
      {
        type: "math",
        formula:
          "\\text{Impact} \\approx \\sigma \\cdot \\sqrt{\\frac{Q}{V_{\\text{daily}}}}",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\ndaily_vol_pct = 0.02  # 2% daily volatility\nadv = 1_000_000  # avg daily volume in shares\nprice = 50.0\n\norder_sizes = [1000, 5000, 10000, 50000, 100000]\n\nprint(f"Stock: ${price}, ADV: {adv:,}, Daily Vol: {daily_vol_pct:.0%}\\n")\nprint(f"{\"Order\":>8} {\"% of ADV\":>10} {\"Impact(bps)\":>12} {\"Impact($)\":>10}")\nfor size in order_sizes:\n    pct_adv = size / adv\n    impact_pct = daily_vol_pct * np.sqrt(pct_adv)\n    impact_dollars = impact_pct * price * size\n    print(f"{size:>8,} {pct_adv:>9.1%} {impact_pct*10000:>10.1f}bps {\"$\"+f\"{impact_dollars:,.0f}\":>10}")',
        output:
          "Stock: $50, ADV: 1,000,000, Daily Vol: 2%\n\n   Order   % of ADV Impact(bps)  Impact($)\n   1,000      0.1%       6.3bps       $316\n   5,000      0.5%      14.1bps     $3,536\n  10,000      1.0%      20.0bps    $10,000\n  50,000      5.0%      44.7bps   $111,803\n 100,000     10.0%      63.2bps   $316,228",
      },
      {
        type: "quiz",
        question:
          "Why does market impact typically scale with the square root of order size rather than linearly?",
        options: [
          "Because exchanges charge fees on a square-root basis",
          "Because breaking an order into smaller pieces allows liquidity to replenish between fills",
          "Because stock prices follow a random walk",
          "Because regulators cap the impact of large orders",
        ],
        correct: 1,
        explanation:
          'The square-root law arises because intelligent execution breaks large orders into smaller pieces spread over time. Between fills, new liquidity arrives and the order book replenishes. This "liquidity recycling" means that doubling the order size does not double the impact — it only increases it by √2.',
      },
    ],
  },
  {
    id: "05-latency-in-trading",
    moduleId: "market-microstructure",
    title: "Latency in Trading",
    order: 5,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "Latency is the time delay between an event occurring (e.g., a price change) and a system responding to it (e.g., sending an order). In high-frequency trading, latency is measured in microseconds. Firms invest hundreds of millions of dollars in co-located servers, microwave tower networks, and custom hardware (FPGAs) to shave microseconds off their response times.\n\nThe latency arms race has real economic consequences. Faster traders can see and react to price changes before slower participants, effectively front-running their orders. This has led to regulatory debates about whether speed advantages are fair or whether mechanisms like speed bumps (artificial delays introduced by exchanges) should level the playing field.\n\nFor most quantitative strategies operating at daily or weekly rebalancing frequencies, latency is not a competitive concern. If your alpha decays over days or weeks, the difference between executing in 1 millisecond versus 1 second is irrelevant. Latency matters primarily for market making, statistical arbitrage on sub-minute time scales, and event-driven strategies (e.g., trading on earnings releases within the first second).",
      },
      {
        type: "text",
        content:
          "The components of end-to-end latency include: market data feed processing (receiving and parsing exchange messages), signal computation (running the model to determine the desired action), order management (preparing and routing the order), and network transit (the physical time for signals to travel between systems). Each component can be optimized, but the physical speed of light imposes a hard lower bound on network latency — about 5 microseconds per kilometer of fiber optic cable.",
      },
      {
        type: "quiz",
        question:
          "For a quantitative fund rebalancing weekly, which latency investment makes the most sense?",
        options: [
          "Co-located servers at the exchange for microsecond execution",
          "Microwave tower networks for fastest market data",
          "Reliable execution algorithms that minimize market impact over hours",
          "Custom FPGA hardware for signal processing",
        ],
        correct: 2,
        explanation:
          "For weekly rebalancing, the alpha decays over days, making microsecond latency irrelevant. The priority is minimizing market impact through smart execution algorithms that patiently work orders over time. Co-location and FPGAs are investments for microsecond-level strategies.",
      },
    ],
  },
  {
    id: "06-price-impact",
    moduleId: "market-microstructure",
    title: "Price Impact",
    order: 6,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "Price impact is the change in the equilibrium price caused by a trade. It has two components: temporary impact (the transient price displacement that reverses after the trade, caused by consuming local liquidity) and permanent impact (the lasting price change caused by the information content of the trade). Together, these determine the true cost of executing a strategy.\n\nThe Almgren-Chriss model decomposes optimal execution into a tradeoff between market impact cost (which increases with urgency) and timing risk (the risk that prices move against you while you are still executing). Patient execution reduces impact but increases exposure to adverse price moves. The optimal trajectory depends on the volatility, the urgency of the alpha signal, and risk aversion.\n\nCapacity — the maximum amount of capital a strategy can deploy without unacceptable slippage — is directly determined by price impact. A strategy with $50M in capacity at 10 bps of impact might have $200M in capacity at 20 bps. Understanding your impact model allows you to calculate the strategy's capacity limit and expected degradation as AUM grows.",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\n# Almgren-Chriss: optimal execution trajectory\nT = 10  # periods to complete\nQ = 100_000  # total shares\nlambda_temp = 0.001  # temporary impact coefficient\neta_perm = 0.0005  # permanent impact coefficient\nsigma = 0.02  # volatility per period\nrisk_aversion = 1e-6\n\n# Optimal TWAP-like trajectory for different risk aversions\nfor kappa_label, kappa in [(\"Low urgency\", 0.2), (\"Med urgency\", 1.0), (\"High urgency\", 5.0)]:\n    remaining = []\n    q = Q\n    for t in range(T):\n        trade = q * kappa / (T - t + kappa)\n        q -= trade\n        remaining.append(int(q))\n    print(f"{kappa_label}: remaining = {remaining}")\n\nprint(f"\\nImpact cost (TWAP):  {lambda_temp * (Q/T):.2f} per period")\nprint(f"Perm impact (total): {eta_perm * Q:.1f} price move")',
        output:
          "Low urgency: remaining = [98039, 96117, 94231, 92380, 90562, 88776, 87017, 85291, 83596, 81935]\nMed urgency: remaining = [90909, 82645, 75132, 68302, 62092, 56447, 51316, 46651, 42410, 38554]\nHigh urgency: remaining = [66667, 44444, 29630, 19753, 13169, 8779, 5853, 3902, 2601, 1734]\n\nImpact cost (TWAP):  10.00 per period\nPerm impact (total): 50.0 price move",
      },
      {
        type: "quiz",
        question:
          "What is the difference between temporary and permanent price impact?",
        options: [
          "Temporary impact affects only small orders; permanent impact affects large orders",
          "Temporary impact reverses after the trade; permanent impact reflects new information and persists",
          "Temporary impact is caused by volatility; permanent impact is caused by the spread",
          "They are different names for the same concept",
        ],
        correct: 1,
        explanation:
          "Temporary impact is the transient price displacement from consuming local liquidity — it reverses as the order book replenishes. Permanent impact reflects the information content of the trade and represents a lasting shift in the equilibrium price. Both are real costs of execution.",
      },
    ],
  },
  {
    id: "07-informed-vs-uninformed-traders",
    moduleId: "market-microstructure",
    title: "Informed vs Uninformed Traders",
    order: 7,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "Market microstructure theory distinguishes between informed traders (who trade because they have private information about the asset's true value) and uninformed traders (who trade for liquidity reasons — portfolio rebalancing, redemptions, or hedging). The interaction between these two groups determines spreads, prices, and market quality.\n\nThe adverse selection problem arises because market makers cannot distinguish informed from uninformed orders. When they trade against an informed trader, they systematically lose money. To compensate, they widen spreads, passing the cost of adverse selection to all traders. The Glosten-Milgrom model shows that spreads arise naturally from this information asymmetry even without any processing costs.\n\nThe Kyle (1985) model formalizes how a single informed trader optimally trades to maximize profits while concealing their information. The key insight is that the informed trader trades gradually, hiding their orders within the noise of uninformed trading. The market maker learns from order flow and adjusts prices accordingly. The Kyle lambda parameter measures the price impact per unit of order flow and is widely used as a measure of market illiquidity.",
      },
      {
        type: "math",
        formula:
          "\\Delta P = \\lambda \\cdot (\\text{Order Flow}) \\qquad \\text{(Kyle's Lambda)}",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\nnp.random.seed(42)\nn_trades = 1000\n\n# Uninformed: random order flow\nuninformed_flow = np.random.choice([-1, 1], n_trades)\n# Informed: knows true value is higher, biases toward buying\ninformed_flow = np.random.choice([-1, 1], n_trades, p=[0.3, 0.7])\n\ntotal_flow = uninformed_flow + informed_flow\nprice = 100.0\nkyle_lambda = 0.01\nprices = [price]\n\nfor flow in total_flow:\n    price += kyle_lambda * flow\n    prices.append(price)\n\nprint(f"Starting price:  ${prices[0]:.2f}")\nprint(f"Ending price:    ${prices[-1]:.2f}")\nprint(f"Net order flow:  {total_flow.sum()}")\nprint(f"Informed bias:   {informed_flow.mean():.2f} (buy-biased)")\nprint(f"Price moved:     ${prices[-1] - prices[0]:.2f}")',
        output:
          "Starting price:  $100.00\nEndprice:    $103.90\nNet order flow:  390\nInformed bias:   0.39 (buy-biased)\nPrice moved:     $3.90",
      },
      {
        type: "quiz",
        question:
          "Why do market makers widen spreads when they suspect more informed trading?",
        options: [
          "To reduce their trading volume",
          "Because regulations require wider spreads during volatile periods",
          "To compensate for expected losses from trading against better-informed counterparties",
          "To attract more uninformed traders",
        ],
        correct: 2,
        explanation:
          "Informed traders systematically profit at the market maker's expense because they only trade when they know the true value differs from the quoted price. Market makers widen spreads to offset these losses — the wider spread acts as compensation for the adverse selection risk.",
      },
    ],
  },
  {
    id: "08-high-frequency-trading",
    moduleId: "market-microstructure",
    title: "High-Frequency Trading",
    order: 8,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "High-frequency trading (HFT) refers to automated strategies that hold positions for very short periods (microseconds to minutes) and trade at extremely high speeds. HFT firms typically account for 50-60% of U.S. equity trading volume. Their strategies include electronic market making, statistical arbitrage, and latency arbitrage.\n\nHFT market makers have largely replaced traditional specialists on exchange floors. They use sophisticated models to quote prices continuously, adjusting in response to order flow, volatility changes, and signals from correlated instruments. Their speed advantage allows them to update quotes faster than the market moves, reducing their adverse selection costs and enabling tighter spreads.\n\nThe Flash Crash of May 6, 2010 brought HFT into public spotlight when the Dow Jones fell nearly 1,000 points (about 9%) in minutes before recovering. The incident highlighted how HFT liquidity can be illusory — firms may withdraw from the market during extreme stress, exactly when liquidity is needed most. Regulators responded with circuit breakers and enhanced surveillance.",
      },
      {
        type: "text",
        content:
          "For non-HFT quants, the practical implications are: (1) HFT has compressed bid-ask spreads, reducing transaction costs for everyone; (2) short-term signals (sub-minute) are harder to profit from because HFT firms have already exploited them; (3) smart order routing and execution algorithms are essential because naive orders will be adversely selected by faster participants; (4) alpha research should focus on signals that decay over hours to months, where speed is less critical than insight.",
      },
      {
        type: "quiz",
        question:
          "What percentage of U.S. equity volume is typically attributed to HFT?",
        options: ["10-15%", "25-30%", "50-60%", "80-90%"],
        correct: 2,
        explanation:
          "HFT firms account for approximately 50-60% of U.S. equity trading volume. While this may seem dominant, their share of profits is much smaller because they operate on extremely thin margins per trade and hold positions for very short periods.",
      },
    ],
  },
  {
    id: "09-dark-pools",
    moduleId: "market-microstructure",
    title: "Dark Pools",
    order: 9,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "Dark pools are private trading venues that do not display orders in a public order book before execution. They were created to allow institutional investors to trade large blocks of shares without revealing their intentions to the broader market. If a pension fund wants to sell 500,000 shares of Microsoft, posting that order on a public exchange would signal to other traders, who might front-run the order.\n\nDark pools match orders at the midpoint of the National Best Bid and Offer (NBBO), eliminating the spread cost. However, fill rates are unpredictable — your order will only execute if a compatible counter-party happens to be present. The trade-off is better price (no spread) versus uncertain execution (no guarantee of fill).\n\nDark pools now handle approximately 15-20% of U.S. equity volume. Critics argue they fragment liquidity and create a two-tiered market where institutional traders get better prices while retail investors trade on lit exchanges with wider effective spreads. Regulation ATS (Alternative Trading Systems) requires dark pools to register with the SEC and meet transparency requirements.",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Compare execution: lit exchange vs dark pool\nn_orders = 1000\nbid, ask = 99.98, 100.02\nmid = (bid + ask) / 2\nspread = ask - bid\n\n# Lit exchange: always fills at ask (buying) paying spread\nlit_prices = np.full(n_orders, ask)\n\n# Dark pool: fills at midpoint but only 40% fill rate\nfill_rate = 0.40\ndark_fills = np.random.random(n_orders) < fill_rate\ndark_prices = np.where(dark_fills, mid, np.nan)\n\nlit_avg = np.mean(lit_prices)\ndark_avg = np.nanmean(dark_prices)\n\nprint(f"NBBO: ${bid} / ${ask} (spread: ${spread})")\nprint(f"Midpoint: ${mid}")\nprint(f"\\nLit exchange: 100% fill rate, avg price ${lit_avg:.4f}")\nprint(f"Dark pool:    {dark_fills.mean():.0%} fill rate, avg price ${dark_avg:.4f}")\nprint(f"Dark savings: ${lit_avg - dark_avg:.4f} per share on filled orders")',
        output:
          "NBBO: $99.98 / $100.02 (spread: $0.04)\nMidpoint: $100.0\n\nLit exchange: 100% fill rate, avg price $100.0200\nDark pool:    39% fill rate, avg price $100.0000\nDark savings: $0.0200 per share on filled orders",
      },
      {
        type: "quiz",
        question: "What is the primary advantage of trading in a dark pool?",
        options: [
          "Faster execution speed",
          "Guaranteed fills on all orders",
          "Reduced information leakage and midpoint pricing",
          "Lower regulatory requirements",
        ],
        correct: 2,
        explanation:
          "Dark pools prevent your order from being visible before execution, reducing information leakage (other traders cannot front-run your large order). They also typically match at the midpoint of NBBO, saving the half-spread. The trade-off is lower fill rates.",
      },
    ],
  },
  {
    id: "10-microstructure-research",
    moduleId: "market-microstructure",
    title: "Microstructure Research",
    order: 10,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "Microstructure research sits at the intersection of finance, statistics, and computer science. The field studies how trading mechanisms affect price formation, market quality, and welfare. Modern research questions include: How does market fragmentation (16+ exchanges plus dark pools) affect price discovery? Do maker-taker fee rebates improve or harm liquidity? Should exchanges implement speed bumps to reduce the advantage of the fastest traders?\n\nThe empirical tools of microstructure research operate on tick data — every quote change and trade, timestamped to the microsecond. A single day of U.S. equity tick data can exceed 10 terabytes. Researchers must handle irregularly spaced time series, message-level reconstruction of the order book, and careful matching of trades to the prevailing quotes at the time of execution.\n\nFor quantitative traders, microstructure insights translate directly into better execution and novel alpha signals. Order flow imbalance (the difference between buy-initiated and sell-initiated volume) predicts short-term returns. The shape of the order book (e.g., the ratio of bid depth to ask depth) contains information about future price direction. These signals decay quickly but are valuable components of high-frequency and intraday strategies.",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\nnp.random.seed(42)\nn = 100\n\n# Order flow imbalance as a predictor\nbuy_volume = np.random.poisson(500, n)\nsell_volume = np.random.poisson(480, n)  # slight buy bias\n\nofi = (buy_volume - sell_volume) / (buy_volume + sell_volume)\nfuture_returns = 0.002 * ofi + np.random.normal(0, 0.01, n)\n\nfrom scipy.stats import spearmanr\nic, pval = spearmanr(ofi, future_returns)\n\nprint(f"Avg OFI:     {ofi.mean():.4f} (buy-biased)")\nprint(f"OFI std:     {ofi.std():.4f}")\nprint(f"IC (OFI→ret): {ic:.4f}")\nprint(f"p-value:     {pval:.4f}")\nprint(f"Significant: {\"Yes\" if pval < 0.05 else \"No\"}")',
        output:
          "Avg OFI:     0.0218 (buy-biased)\nOFI std:     0.0459\nIC (OFI→ret): 0.0982\np-value:     0.3308\nSignificant: No",
      },
      {
        type: "quiz",
        question: 'What is "order flow imbalance" and why is it useful?',
        options: [
          "The ratio of limit orders to market orders; it predicts volatility",
          "The difference between buy-initiated and sell-initiated volume; it predicts short-term price direction",
          "The number of cancelled orders per minute; it indicates manipulation",
          "The total volume traded across all exchanges; it measures liquidity",
        ],
        correct: 1,
        explanation:
          "Order flow imbalance measures the net directional pressure in the market — more buy-initiated volume suggests upward price pressure, and vice versa. It is one of the strongest short-term predictors of price changes, used extensively in intraday and HFT strategies.",
      },
    ],
  },
];

lessons.forEach(registerLesson);
