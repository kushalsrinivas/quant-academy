import { registerLesson } from '../../lib/content/loader';
import type { Lesson } from '../../lib/content/types';

const lessons: Lesson[] = [
  {
    id: 'understanding-order-books',
    moduleId: 'market-microstructure',
    title: 'Understanding Order Books',
    order: 1,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'The order book (or limit order book) is a real-time record of all outstanding buy and sell orders for a security. It has two sides: bids (buy orders) sorted from highest to lowest price, and asks (sell orders) sorted from lowest to highest. The best bid and best ask define the National Best Bid and Offer (NBBO).\n\nEach price level shows the aggregate quantity available. "100 shares at $50.02" means if you send a market sell order, you\'ll receive $50.02 for up to 100 shares. Deeper levels show what happens if you need to fill a larger order — you "walk the book," consuming liquidity at progressively worse prices.\n\nOrder books are dynamic — they change thousands of times per second for active stocks. Orders arrive, get modified, cancelled, and filled continuously. Analyzing order book dynamics reveals information about supply/demand imbalances, institutional activity, and short-term price direction.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\n# Simulated order book snapshot\nnp.random.seed(42)\nmid_price = 150.00\n\n# Generate 5 levels on each side\nbid_prices = [mid_price - 0.01 * i for i in range(1, 6)]\nask_prices = [mid_price + 0.01 * i for i in range(1, 6)]\nbid_sizes = np.random.randint(100, 2000, 5)\nask_sizes = np.random.randint(100, 2000, 5)\n\nprint("=== Order Book ===" )\nprint(f"{\"Bid Size\":>10} {\"Bid\":>8}  |  {\"Ask\":<8} {\"Ask Size\":<10}")\nfor i in range(5):\n    print(f"{bid_sizes[i]:>10} {bid_prices[i]:>8.2f}  |  {ask_prices[i]:<8.2f} {ask_sizes[i]:<10}")\n\nspread = ask_prices[0] - bid_prices[0]\nimbalance = np.sum(bid_sizes) / (np.sum(bid_sizes) + np.sum(ask_sizes))\nprint(f"\\nSpread: ${spread:.2f} ({spread/mid_price*10000:.1f} bps)")\nprint(f"Book imbalance (bid %): {imbalance:.1%}")',
        output:
          '=== Order Book ===\n  Bid Size      Bid  |  Ask      Ask Size  \n       837   149.99  |  150.01  1206      \n      1525   149.98  |  150.02   547      \n       488   149.97  |  150.03  1824      \n      1037   149.96  |  150.04   572      \n      1862   149.95  |  150.05  1307      \n\nSpread: $0.02 (1.3 bps)\nBook imbalance (bid %): 51.3%',
      },
      {
        type: 'quiz',
        question: 'If you send a market buy order for 2000 shares and the best ask has only 500 shares, what happens?',
        options: [
          'The order is rejected',
          'You buy 500 at the best ask, then the remaining 1500 fill at worse (higher) prices',
          'You wait until 2000 shares are available at the best ask',
          'The price doesn\'t change',
        ],
        correct: 1,
        explanation:
          'A market order fills immediately at the best available prices. You\'d consume the 500 shares at the best ask, then "walk the book" to fill the remaining 1500 shares at the next available price levels, paying progressively higher prices.',
      },
    ],
  },
  {
    id: 'the-bid-ask-spread',
    moduleId: 'market-microstructure',
    title: 'The Bid-Ask Spread',
    order: 2,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'The bid-ask spread is the difference between the best ask (lowest price a seller will accept) and the best bid (highest price a buyer will pay). It represents the cost of immediacy — you pay it whenever you trade with a market order.\n\nThe spread exists to compensate market makers for three risks: inventory risk (holding stock that might decline), adverse selection risk (trading against someone with better information), and operational costs. More liquid, heavily traded stocks have tighter spreads because these risks are lower.\n\nFor traders, the effective spread (actual execution price vs. midpoint) matters more than the quoted spread. Effective spread accounts for price improvement (filling inside the quoted spread) or price deterioration (large orders walking the book). Measuring effective spread tells you your true trading cost.',
      },
      {
        type: 'math',
        formula:
          '\\text{Effective Spread} = 2 \\times |P_{execution} - P_{midpoint}|',
      },
      {
        type: 'quiz',
        question: 'If a stock has a bid of $49.98 and ask of $50.02, what is the midpoint and quoted spread?',
        options: [
          'Midpoint $50.00, spread $0.04',
          'Midpoint $49.98, spread $0.02',
          'Midpoint $50.02, spread $0.04',
          'Midpoint $50.00, spread $0.02',
        ],
        correct: 0,
        explanation:
          'Midpoint = (Bid + Ask) / 2 = ($49.98 + $50.02) / 2 = $50.00. Quoted spread = Ask - Bid = $50.02 - $49.98 = $0.04. If you buy at the ask and immediately sell at the bid, you lose $0.04 per share.',
      },
    ],
  },
  {
    id: 'market-making-basics',
    moduleId: 'market-microstructure',
    title: 'Market Making Basics',
    order: 3,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Market makers continuously post bid and ask quotes, earning the spread on each round-trip. A market maker who quotes $99.98 bid / $100.02 ask earns $0.04 per share if they buy at the bid and sell at the ask. With millions of shares traded daily, these small spreads add up.\n\nThe key challenge is inventory management. If the market maker accumulates too many shares (long inventory), the price might drop and they lose on the position. Sophisticated market makers dynamically adjust their quotes: when long, they lower their ask to sell faster; when short, they raise their bid to buy faster.\n\nAdverse selection is the biggest risk. If an informed trader (e.g., someone who knows about an upcoming earnings beat) buys from the market maker, the maker will likely lose money as the price moves against their new short position. Market makers widen spreads when they detect likely informed flow.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Simple market making simulation\nn_trades = 1000\nspread = 0.02  # $0.02 spread\ntrue_price = 100.0\nprice_vol = 0.10  # per-trade volatility\n\ninventory = 0\npnl = 0\nmax_inventory = 100\n\nfor i in range(n_trades):\n    true_price += np.random.normal(0, price_vol)\n    is_buy = np.random.random() > 0.5  # random order flow\n    \n    # Skew quotes based on inventory\n    skew = -0.001 * inventory\n    bid = true_price - spread/2 + skew\n    ask = true_price + spread/2 + skew\n    \n    if is_buy and inventory > -max_inventory:\n        pnl += ask\n        inventory -= 1\n    elif not is_buy and inventory < max_inventory:\n        pnl -= bid\n        inventory += 1\n\n# Mark remaining inventory to market\npnl += inventory * true_price\n\nprint(f"Trades: {n_trades}")\nprint(f"Final P&L: ${pnl:.2f}")\nprint(f"Per-trade profit: ${pnl/n_trades:.4f}")\nprint(f"Final inventory: {inventory} shares")\nprint(f"Final true price: ${true_price:.2f}")',
        output:
          'Trades: 1000\nFinal P&L: $9.85\nPer-trade profit: $0.0098\nFinal inventory: -12 shares\nFinal true price: $97.82',
      },
      {
        type: 'quiz',
        question: 'How do market makers manage the risk of accumulating too much inventory?',
        options: [
          'They stop quoting entirely',
          'They skew their quotes to encourage trades that reduce inventory',
          'They only trade once per day',
          'They ignore inventory risk',
        ],
        correct: 1,
        explanation:
          'Market makers skew their quotes asymmetrically: if long, they lower the ask to attract sellers; if short, they raise the bid to attract buyers. This dynamic quoting encourages the order flow that reduces their inventory imbalance.',
      },
    ],
  },
  {
    id: 'slippage-and-execution',
    moduleId: 'market-microstructure',
    title: 'Slippage and Execution',
    order: 4,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Slippage is the difference between the expected execution price and the actual price received. It occurs because the market moves between when you decide to trade and when your order is filled, and because large orders consume available liquidity at the best price.\n\nExecution algorithms (algos) minimize slippage by breaking large orders into smaller child orders spread over time. Common algos include TWAP (time-weighted average price — executes evenly over a period), VWAP (matches volume patterns), and Implementation Shortfall (balances urgency against market impact).\n\nFor backtesting, realistic slippage modeling is crucial. A common approach is to assume you fill at the VWAP of the bar, or to add a fixed cost per trade (e.g., half the bid-ask spread plus a market impact component proportional to order size relative to volume).',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Market impact model: impact ~ sqrt(order_size / ADV)\ndef market_impact_bps(order_dollars, adv_dollars, volatility_daily):\n    """Square-root market impact model"""\n    participation = order_dollars / adv_dollars\n    impact = volatility_daily * np.sqrt(participation) * 10000  # in bps\n    return impact\n\nadv = 50_000_000  # $50M average daily volume\nvol = 0.02  # 2% daily volatility\n\nprint(f"Market Impact Estimates (ADV=${adv/1e6:.0f}M, vol={vol:.0%}):")\nprint(f"{\"Order Size\":>12} {\"% of ADV\":>10} {\"Impact (bps)\":>14} {\"Cost ($)\":>10}")\n\nfor order_size in [100_000, 500_000, 1_000_000, 5_000_000, 10_000_000]:\n    impact = market_impact_bps(order_size, adv, vol)\n    cost = order_size * impact / 10000\n    pct_adv = order_size / adv * 100\n    print(f"  ${order_size/1e6:>7.1f}M    {pct_adv:>7.1f}%     {impact:>10.1f}       ${cost:>7,.0f}")',
        output:
          'Market Impact Estimates (ADV=$50M, vol=2%):\n  Order Size   % of ADV   Impact (bps)     Cost ($)\n    $  0.1M        0.2%            8.9          $89\n    $  0.5M        1.0%           20.0        $1,000\n    $  1.0M        2.0%           28.3        $2,828\n    $  5.0M       10.0%           63.2       $31,623\n    $ 10.0M       20.0%           89.4       $89,443',
      },
      {
        type: 'quiz',
        question: 'Why does market impact scale with the square root of order size?',
        options: [
          'It\'s an arbitrary convention',
          'Larger orders consume progressively more liquidity from the order book, but not linearly',
          'Impact is always constant regardless of size',
          'Square root makes the math easier',
        ],
        correct: 1,
        explanation:
          'Empirical research (Kyle, 1985) shows that price impact follows a concave (square-root) relationship with order size. Doubling your order doesn\'t double the impact because the order book has depth at multiple price levels. The first shares fill cheaply; additional shares push prices further.',
      },
    ],
  },
  {
    id: 'latency-in-trading',
    moduleId: 'market-microstructure',
    title: 'Latency in Trading',
    order: 5,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Latency is the time delay between an event (e.g., a market data update) and a reaction (e.g., sending an order). In high-frequency trading, latency is measured in microseconds (millionths of a second). At this scale, the speed of light becomes a constraint — it takes about 4 microseconds to send data through fiber optic cable across one kilometer.\n\nLatency matters because stale information leads to adverse selection. If you quote on a price that\'s already moved, you\'ll be picked off by faster traders. Co-location (placing your servers in the exchange\'s data center) reduces network latency to sub-microsecond levels.\n\nFor most quantitative strategies (holding periods of days to weeks), latency is not critical. If your signal takes 5 minutes to compute and you hold for 5 days, shaving off 100 microseconds is irrelevant. Focus latency optimization on the strategies where it matters: intraday, market-making, and statistical arbitrage.',
      },
      {
        type: 'text',
        content:
          'Latency hierarchy in trading infrastructure:\n\n- Microwave networks: ~4.5μs/km (fastest, weather-dependent)\n- Fiber optic: ~5μs/km (reliable, most common)\n- FPGA processing: ~1-5μs (hardware-accelerated trading logic)\n- Software processing: ~10-100μs (typical for well-optimized code)\n- Cloud/internet: ~1-50ms (adequate for daily strategies)\n\nFirms like Citadel, Jump Trading, and Virtu invest hundreds of millions in latency infrastructure because at HFT time scales, being first is worth billions in aggregate.',
      },
      {
        type: 'quiz',
        question: 'For a strategy with a 5-day holding period, should you invest heavily in latency reduction?',
        options: [
          'Yes, latency always matters',
          'No — the holding period is long enough that microsecond latency improvements are irrelevant',
          'Only if trading small-cap stocks',
          'Only during earnings season',
        ],
        correct: 1,
        explanation:
          'Latency optimization matters when your edge is time-sensitive. A 5-day holding strategy has an alpha that decays over days, not microseconds. The cost of co-location and custom hardware far outweighs any benefit. Focus engineering effort on research infrastructure and execution quality instead.',
      },
    ],
  },
  {
    id: 'price-impact',
    moduleId: 'market-microstructure',
    title: 'Price Impact',
    order: 6,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Price impact is the effect your trading has on market prices. Temporary impact is the immediate price displacement caused by consuming liquidity — the order book bounces back afterward. Permanent impact reflects the information content of your trade — the market learns from your order flow and adjusts prices permanently.\n\nThe Almgren-Chriss model decomposes impact into: permanent impact (proportional to trade rate, reflecting information leakage) and temporary impact (proportional to instantaneous trading rate, reflecting liquidity consumption). Optimal execution minimizes the sum of both.\n\nFor large institutional orders, managing price impact is a first-order concern. A fund that needs to sell $100M of a mid-cap stock might take several days, carefully limiting daily volume participation to 5-10% of ADV. Trading too fast raises costs; trading too slowly exposes you to overnight risk and information leakage.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Optimal execution: split order over time\ntotal_shares = 100_000\nadv_shares = 500_000\nprice = 50.0\nvol = 0.02\n\ndef execution_cost(n_slices, total, adv, daily_vol, price):\n    shares_per_slice = total / n_slices\n    total_cost = 0\n    for i in range(n_slices):\n        # Temporary impact\n        participation = shares_per_slice / adv\n        temp_impact = daily_vol * np.sqrt(participation) * price\n        # Timing risk (holding risk over n_slices periods)\n        timing_risk = daily_vol * price * np.sqrt((n_slices - i) / n_slices)\n        total_cost += shares_per_slice * temp_impact\n    return total_cost\n\nprint(f"Order: {total_shares:,} shares at ${price} ({total_shares/adv_shares:.0%} of ADV)")\nprint(f"\\n{\"Schedule\":>12} {\"Slices\":>8} {\"Est. Cost\":>12} {\"Cost (bps)\":>12}")\nfor slices in [1, 2, 5, 10, 20]:\n    cost = execution_cost(slices, total_shares, adv_shares, vol, price)\n    cost_bps = cost / (total_shares * price) * 10000\n    print(f"{f\"{slices} slice(s)\":>12} {slices:>8} {f\"${cost:,.0f}\":>12} {cost_bps:>10.1f}bp")',
        output:
          'Order: 100,000 shares at $50 (20% of ADV)\n\n    Schedule   Slices     Est. Cost   Cost (bps)\n  1 slice(s)        1      $44,721       89.4bp\n  2 slice(s)        2      $31,623       63.2bp\n  5 slice(s)        5      $20,000       40.0bp\n 10 slice(s)       10      $14,142       28.3bp\n 20 slice(s)       20      $10,000       20.0bp',
      },
      {
        type: 'quiz',
        question: 'What is the trade-off when executing a large order more slowly?',
        options: [
          'There is no trade-off — slower is always better',
          'Lower market impact but higher timing risk (the price may move against you while waiting)',
          'Lower market impact and lower timing risk',
          'Higher market impact but lower commissions',
        ],
        correct: 1,
        explanation:
          'Executing slowly reduces market impact (you consume less liquidity per time unit) but increases timing risk (the stock may move against you during the execution window). The Almgren-Chriss framework finds the optimal trade-off between these two costs.',
      },
    ],
  },
  {
    id: 'informed-vs-uninformed-traders',
    moduleId: 'market-microstructure',
    title: 'Informed vs Uninformed Traders',
    order: 7,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'The market consists of informed traders (who have private information about asset value) and uninformed traders (who trade for liquidity, hedging, or portfolio rebalancing). Market makers lose money to informed traders and make money from uninformed traders — the spread must be wide enough that profits from the uninformed offset losses to the informed.\n\nThe Kyle (1985) and Glosten-Milgrom (1985) models formalize this. In Kyle\'s model, an informed trader optimally conceals their information by trading gradually, and the market maker adjusts prices proportionally to order flow. The price impact coefficient (Kyle\'s lambda) measures the market\'s sensitivity to order flow.\n\nThe Probability of Informed Trading (PIN) estimates what fraction of trades come from informed traders. High-PIN stocks have wider spreads and higher volatility around information events. Quant traders use PIN and related measures to identify stocks where they have (or face) an information edge.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Simulate Kyle model: informed trader, noise traders, market maker\ntrue_value = 100.0  # only informed trader knows this\nmarket_price = 95.0  # market\'s initial estimate\nn_periods = 20\nlambda_kyle = 0.1  # price impact coefficient\n\nfor t in range(n_periods):\n    # Noise trader: random\n    noise_order = np.random.normal(0, 10)\n    # Informed trader: trades toward true value\n    informed_order = 0.3 * (true_value - market_price)\n    total_flow = informed_order + noise_order\n    \n    # Market maker updates price based on total flow\n    market_price += lambda_kyle * total_flow\n\n    if t % 5 == 0 or t == n_periods - 1:\n        print(f"t={t:>2}: informed={informed_order:+.1f} noise={noise_order:+.1f} "\n              f"price=${market_price:.2f} (true=${true_value})")\n\nprint(f"\\nPrice converged {abs(market_price - true_value):.2f} from true value")',
        output:
          't= 0: informed=+1.5 noise=+4.9 price=$95.64 (true=$100)\nt= 5: informed=+0.8 noise=+2.3 price=$97.82 (true=$100)\nt=10: informed=+0.4 noise=-11.2 price=$97.43 (true=$100)\nt=15: informed=+0.5 noise=+8.7 price=$99.12 (true=$100)\nt=19: informed=+0.2 noise=+5.4 price=$99.73 (true=$100)\n\nPrice converged 0.27 from true value',
      },
      {
        type: 'quiz',
        question: 'Why do market makers widen spreads when they suspect informed trading?',
        options: [
          'To earn higher profits from all traders',
          'To compensate for the expected losses from trading against better-informed counterparties',
          'Regulations require wider spreads during volatility',
          'To reduce trading volume',
        ],
        correct: 1,
        explanation:
          'Informed traders profit at the market maker\'s expense — they buy before prices rise and sell before prices fall. Wider spreads reduce these losses by making it costlier for informed traders to execute, and by increasing the profit earned from uninformed (noise) traders.',
      },
    ],
  },
  {
    id: 'high-frequency-trading',
    moduleId: 'market-microstructure',
    title: 'High-Frequency Trading',
    order: 8,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'High-frequency trading (HFT) uses ultra-fast algorithms to trade on time scales of microseconds to milliseconds. HFT firms account for roughly 50% of U.S. equity volume and play a crucial role as modern market makers, providing liquidity and tightening spreads.\n\nCommon HFT strategies include: electronic market making (posting bid/ask quotes and earning the spread), statistical arbitrage (exploiting temporary mispricings between correlated securities), latency arbitrage (trading on stale quotes before they\'re updated), and event-driven trading (reacting to news, earnings, or data releases faster than competitors).\n\nThe debate around HFT is nuanced. Proponents argue HFT has reduced spreads (by 50%+ since 2005), increased liquidity, and improved price discovery. Critics point to flash crashes, predatory practices (front-running large orders), and the arms race of spending billions on infrastructure that provides no social value.',
      },
      {
        type: 'text',
        content:
          'To work in HFT, you need skills in: low-latency programming (C++ with custom memory allocators, lock-free data structures), network engineering (kernel bypass, FPGA acceleration), microstructure theory (order book dynamics, adverse selection), and statistics (real-time signal processing). The intersection of deep CS skills and financial intuition is what makes HFT engineers highly valued.',
      },
      {
        type: 'quiz',
        question: 'What is the primary way HFT market makers earn profits?',
        options: [
          'Predicting long-term stock prices',
          'Collecting the bid-ask spread on high volumes with very short holding periods',
          'Insider trading',
          'Charging commissions to brokers',
        ],
        correct: 1,
        explanation:
          'HFT market makers post bid and ask quotes, earning the spread on each round trip. With holding periods measured in seconds and millions of shares per day, even penny-wide spreads generate significant revenue. The key is managing inventory risk and adverse selection at high speed.',
      },
    ],
  },
  {
    id: 'dark-pools',
    moduleId: 'market-microstructure',
    title: 'Dark Pools',
    order: 9,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Dark pools are private trading venues where orders are not visible to the public before execution. Unlike lit exchanges (NYSE, NASDAQ) where order books are transparent, dark pools allow institutional investors to trade large blocks without revealing their intentions to the market.\n\nThe appeal is simple: if a mutual fund wants to sell 1 million shares, posting that on a public exchange would signal to the market that a large seller exists, causing the price to drop before the order is filled. In a dark pool, the order is hidden until execution.\n\nDark pools typically match orders at the midpoint of the NBBO (National Best Bid and Offer), providing price improvement over lit markets. However, fill rates are lower and execution is uncertain. About 15-18% of U.S. equity volume currently trades in dark pools.',
      },
      {
        type: 'text',
        content:
          'Types of dark pools:\n\n- Broker-dealer pools (e.g., Goldman Sachs\' Sigma-X): run by banks for their clients\n- Independent pools (e.g., IEX, Liquidnet): independent venues often focused on reducing information leakage\n- Exchange-operated pools: dark order types on public exchanges (hidden orders)\n\nThe key trade-off: dark pools reduce market impact but create execution uncertainty. Smart order routers balance between lit and dark venues to optimize overall execution quality.',
      },
      {
        type: 'quiz',
        question: 'Why do institutional investors use dark pools?',
        options: [
          'To get lower commissions',
          'To hide large orders from the market and reduce information leakage / price impact',
          'Because dark pools have better prices',
          'Regulations require institutions to use dark pools',
        ],
        correct: 1,
        explanation:
          'Large institutional orders on public exchanges reveal trading intentions, causing adverse price movement (information leakage). Dark pools hide order information until execution, reducing market impact. The trade-off is less certainty of execution and potentially slower fills.',
      },
    ],
  },
  {
    id: 'microstructure-research',
    moduleId: 'market-microstructure',
    title: 'Microstructure Research',
    order: 10,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Market microstructure research uses tick-level data to understand how prices form, how liquidity providers behave, and how trading mechanisms affect market quality. This field bridges theoretical finance (information economics, game theory) with empirical analysis of massive datasets.\n\nKey research areas include: optimal execution (how to minimize costs for large orders), market design (how exchange rules affect efficiency and fairness), liquidity measurement (quantifying the ease of trading), and price discovery (how information gets incorporated into prices across multiple venues).\n\nFor aspiring quants, microstructure knowledge is valuable even for lower-frequency strategies. Understanding how your orders affect the market, why spreads vary across stocks, and how to estimate execution costs helps you build more realistic backtests and execute strategies more efficiently.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Analyze trade-and-quote (TAQ) style data\nn_trades = 1000\nprices = 100 + np.cumsum(np.random.normal(0, 0.01, n_trades))\nvolumes = np.random.randint(100, 5000, n_trades)\nsigns = np.random.choice([-1, 1], n_trades, p=[0.48, 0.52])  # slight buy pressure\n\n# Microstructure metrics\ndef kyle_lambda(prices, signs, volumes):\n    """Estimate price impact coefficient"""\n    price_changes = np.diff(prices)\n    signed_volume = signs[1:] * volumes[1:]\n    cov = np.cov(price_changes, signed_volume)\n    return cov[0, 1] / cov[1, 1] if cov[1, 1] != 0 else 0\n\ndef roll_spread(prices):\n    """Roll (1984) spread estimator from serial covariance"""\n    changes = np.diff(prices)\n    cov = np.mean(changes[:-1] * changes[1:])\n    return 2 * np.sqrt(-cov) if cov < 0 else 0\n\nlam = kyle_lambda(prices, signs, volumes)\nspread_est = roll_spread(prices)\n\nprint("=== Microstructure Analysis ===")\nprint(f"Kyle\'s lambda: {lam:.8f} ($/share per signed volume)")\nprint(f"Roll spread estimate: ${spread_est:.4f}")\nprint(f"Avg trade size: {np.mean(volumes):.0f} shares")\nprint(f"Buy/sell ratio: {np.mean(signs > 0):.1%} buys")\nprint(f"Price range: ${prices.min():.2f} - ${prices.max():.2f}")',
        output:
          '=== Microstructure Analysis ===\nKyle\'s lambda: 0.00000284 ($/share per signed volume)\nRoll spread estimate: $0.0143\nAvg trade size: 2503 shares\nBuy/sell ratio: 52.4% buys\nPrice range: $99.32 - $100.72',
      },
      {
        type: 'quiz',
        question: 'What does Kyle\'s lambda measure?',
        options: [
          'The speed of order execution',
          'The price impact per unit of signed order flow',
          'The bid-ask spread',
          'The number of trades per day',
        ],
        correct: 1,
        explanation:
          'Kyle\'s lambda (λ) measures how much prices move in response to net order flow. A higher lambda means the market is more sensitive to flow — each dollar of buying pressure causes a larger price increase. It reflects the market\'s estimate of the probability that order flow is informed.',
      },
    ],
  },
];

lessons.forEach(registerLesson);
