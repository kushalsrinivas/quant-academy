import { registerLesson } from '@/lib/content/loader';
import type { Lesson } from '@/lib/content/types';

const lessons: Lesson[] = [
  {
    id: '01-what-are-stocks',
    moduleId: 'markets-101',
    title: 'What are Stocks',
    order: 1,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'A stock represents fractional ownership in a publicly traded company. When you buy a share of Apple (AAPL), you literally own a tiny piece of that corporation — its assets, earnings, and future growth potential.\n\nCompanies issue stock to raise capital. Instead of borrowing from a bank, they sell ownership stakes to the public through an Initial Public Offering (IPO). After the IPO, shares trade freely on exchanges like the NYSE or NASDAQ, and prices fluctuate based on supply and demand.\n\nThe price of a stock at any moment reflects the market\'s consensus about the present value of all future cash flows the company will generate. This is why earnings reports, economic data, and even tweets can move prices — they change expectations about those future cash flows.',
      },
      {
        type: 'math',
        formula: 'P = \\sum_{t=1}^{\\infty} \\frac{D_t}{(1+r)^t}',
      },
      {
        type: 'text',
        content:
          'The formula above is the Dividend Discount Model, one of the simplest ways to value a stock. P is the current price, D_t is the dividend in year t, and r is the required rate of return. While real-world valuation is more complex, this captures the core idea: a stock is worth the discounted sum of its future payouts.',
      },
      {
        type: 'quiz',
        question: 'What does owning a share of stock represent?',
        options: [
          'A loan to the company',
          'Fractional ownership of the company',
          'A guarantee of future profits',
          'A bond issued by the company',
        ],
        correct: 1,
        explanation:
          'A share of stock represents fractional ownership in a company. Unlike bonds (which are loans), stocks give you an equity stake with voting rights and a claim on residual earnings.',
      },
    ],
  },
  {
    id: '02-etfs-and-index-funds',
    moduleId: 'markets-101',
    title: 'ETFs and Index Funds',
    order: 2,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'An Exchange-Traded Fund (ETF) is a basket of securities that trades on an exchange like a single stock. SPY, for example, holds all 500 stocks in the S&P 500 index, letting you buy the entire U.S. large-cap market in one trade.\n\nIndex funds work similarly but are structured as mutual funds — you buy and sell them at the end-of-day Net Asset Value (NAV) rather than at intraday market prices. Vanguard\'s VFIAX is a classic example tracking the same S&P 500 index.\n\nETFs and index funds both provide instant diversification at low cost. The key differences are trading mechanics (ETFs trade intraday, index funds settle at NAV), tax efficiency (ETFs generally have a structural advantage due to the creation/redemption mechanism), and minimum investments (ETFs require just one share, some index funds have $3,000+ minimums).',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\n# Compare holding 1 stock vs. a 500-stock index\nnp.random.seed(42)\nsingle_stock_return = np.random.normal(0.10, 0.40)  # high vol\nindex_returns = np.random.normal(0.10, 0.40, 500)\nindex_return = np.mean(index_returns)  # diversification reduces vol\n\nprint(f"Single stock return: {single_stock_return:.2%}")\nprint(f"Index return:        {index_return:.2%}")\nprint(f"Index volatility is ~1/sqrt(500) = {1/np.sqrt(500):.1%} of single stock vol")',
        output:
          'Single stock return: 29.87%\nIndex return:        10.44%\nIndex volatility is ~1/sqrt(500) = 4.5% of single stock vol',
      },
      {
        type: 'quiz',
        question: 'What is the primary advantage of an ETF over a single stock?',
        options: [
          'ETFs always go up in value',
          'ETFs provide instant diversification',
          'ETFs have no fees',
          'ETFs pay higher dividends',
        ],
        correct: 1,
        explanation:
          'The primary advantage of ETFs is diversification — by holding a basket of securities, you reduce idiosyncratic (company-specific) risk. ETFs still have fees (expense ratios) and can decline in value.',
      },
    ],
  },
  {
    id: '03-futures-contracts',
    moduleId: 'markets-101',
    title: 'Futures Contracts',
    order: 3,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'A futures contract is an agreement to buy or sell an asset at a predetermined price on a specific future date. Originally created for agricultural commodities — a wheat farmer could lock in a sale price before harvest — futures now cover everything from crude oil to S&P 500 index values to Bitcoin.\n\nUnlike stocks, futures are leveraged instruments. You don\'t pay the full contract value upfront; instead, you post a margin deposit (typically 5-15% of the notional value). This leverage amplifies both gains and losses. A single E-mini S&P 500 futures contract (/ES) has a notional value of roughly $200,000, but the initial margin is about $13,000.\n\nFutures are marked-to-market daily, meaning gains and losses are settled each trading day. If the contract moves against you and your margin falls below the maintenance level, you receive a margin call and must deposit additional funds or your position is liquidated.',
      },
      {
        type: 'math',
        formula: 'F_0 = S_0 \\cdot e^{(r - q) \\cdot T}',
      },
      {
        type: 'text',
        content:
          'The cost-of-carry model above determines the theoretical futures price. F₀ is the futures price, S₀ is the current spot price, r is the risk-free rate, q is the dividend yield, and T is time to expiration. When the futures price deviates from this theoretical value, arbitrageurs step in to close the gap.',
      },
      {
        type: 'quiz',
        question: 'What happens when a futures position is marked-to-market?',
        options: [
          'The contract expires immediately',
          'Daily gains and losses are settled in your account',
          'The margin requirement is eliminated',
          'The contract price is fixed permanently',
        ],
        correct: 1,
        explanation:
          'Mark-to-market means that at the end of each trading day, the profit or loss on your position is calculated and credited or debited from your margin account. This daily settlement is a key feature distinguishing futures from forward contracts.',
      },
    ],
  },
  {
    id: '04-options-basics',
    moduleId: 'markets-101',
    title: 'Options Basics',
    order: 4,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'An option gives you the right, but not the obligation, to buy or sell an underlying asset at a specified price (the strike price) before a certain date (expiration). A call option gives you the right to buy; a put option gives you the right to sell.\n\nYou pay a premium to purchase an option. If the option expires worthless (out of the money), you lose only that premium. If it expires in the money, your profit is the difference between the stock price and strike price, minus the premium paid. This asymmetric payoff — limited downside, potentially unlimited upside on calls — is what makes options attractive for hedging and speculation.\n\nOptions pricing depends on five key factors: the current stock price, the strike price, time to expiration, volatility of the underlying, and the risk-free interest rate. The Black-Scholes model combines these into a single theoretical price.',
      },
      {
        type: 'math',
        formula: 'C = S_0 \\, N(d_1) - K \\, e^{-rT} \\, N(d_2)',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Call option payoff at expiration\nimport numpy as np\n\nstock_prices = np.arange(80, 121)\nstrike = 100\npremium = 5\n\npayoff = np.maximum(stock_prices - strike, 0) - premium\nprofit_at_110 = max(110 - strike, 0) - premium\nprofit_at_95 = max(95 - strike, 0) - premium\n\nprint(f"Stock at $110 -> profit: ${profit_at_110}")\nprint(f"Stock at $95  -> profit: ${profit_at_95}")\nprint(f"Breakeven price: ${strike + premium}")',
        output:
          'Stock at $110 -> profit: $5\nStock at $95  -> profit: $-5\nBreakeven price: $105',
      },
      {
        type: 'quiz',
        question:
          'You buy a call option with strike $50 for a premium of $3. At expiration the stock is at $56. What is your profit?',
        options: ['$6', '$3', '$0', '$56'],
        correct: 1,
        explanation:
          'Profit = (Stock Price - Strike) - Premium = ($56 - $50) - $3 = $3. The option is $6 in the money, but you paid $3 for it, so your net profit is $3.',
      },
    ],
  },
  {
    id: '05-how-exchanges-work',
    moduleId: 'markets-101',
    title: 'How Exchanges Work',
    order: 5,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'A stock exchange is a centralized marketplace where buyers and sellers meet to trade securities. The New York Stock Exchange (NYSE) and NASDAQ are the two largest equity exchanges in the world by market capitalization.\n\nModern exchanges operate electronic order books — a continuously updated list of all outstanding buy (bid) and sell (ask) orders. When a new buy order arrives at or above the lowest ask price, a trade executes. This matching engine processes millions of messages per second with latency measured in microseconds.\n\nExchanges also play a regulatory role. Companies must meet listing requirements (minimum market cap, financial reporting, corporate governance standards) to trade on a major exchange. The exchange ensures fair and orderly markets, halting trading during extreme volatility (circuit breakers) and monitoring for manipulation.',
      },
      {
        type: 'text',
        content:
          'The U.S. equity market is fragmented across 16+ exchanges and dozens of alternative trading systems (ATS). When you submit an order through your broker, it\'s routed — sometimes through multiple venues — to find the best available price under Regulation NMS (National Market System). This means your order might execute on NASDAQ even if you\'re trading a NYSE-listed stock.',
      },
      {
        type: 'quiz',
        question:
          'What is the primary function of a stock exchange\'s matching engine?',
        options: [
          'Setting the opening price of stocks',
          'Matching buy and sell orders based on price and time priority',
          'Deciding which companies can go public',
          'Calculating dividends for shareholders',
        ],
        correct: 1,
        explanation:
          'The matching engine pairs incoming buy and sell orders using price-time priority — the best price gets filled first, and among orders at the same price, the earliest order has priority.',
      },
    ],
  },
  {
    id: '06-market-makers-and-liquidity',
    moduleId: 'markets-101',
    title: 'Market Makers and Liquidity',
    order: 6,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Market makers are firms that continuously quote both a buy price (bid) and a sell price (ask) for a security, profiting from the bid-ask spread. They provide liquidity — the ability to buy or sell quickly without significantly moving the price.\n\nWithout market makers, you might submit a buy order and wait hours for a willing seller. Market makers solve this coordination problem by always standing ready to trade. In exchange, they earn the spread. If a market maker quotes $99.95 bid / $100.05 ask, they buy at $99.95 and sell at $100.05, earning $0.10 per share round-trip.\n\nLiquidity is measured in several ways: the bid-ask spread (tighter is better), depth (how many shares are available at or near the best price), and resilience (how quickly the order book recovers after a large trade). Highly liquid stocks like AAPL have penny-wide spreads and millions of shares in depth; illiquid micro-caps might have spreads of 5% or more.',
      },
      {
        type: 'math',
        formula: '\\text{Spread} = \\frac{P_{ask} - P_{bid}}{P_{mid}} \\times 100\\%',
      },
      {
        type: 'quiz',
        question: 'How do market makers primarily earn profit?',
        options: [
          'By predicting which direction the stock will move',
          'By collecting the bid-ask spread on trades',
          'By charging commissions to brokers',
          'By receiving dividends from the stocks they hold',
        ],
        correct: 1,
        explanation:
          'Market makers earn the bid-ask spread by simultaneously quoting buy and sell prices. They buy at the bid and sell at the ask, pocketing the difference. Their goal is not to take directional bets but to manage inventory while collecting spread.',
      },
    ],
  },
  {
    id: '07-why-prices-move',
    moduleId: 'markets-101',
    title: 'Why Prices Move',
    order: 7,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Stock prices move because of an imbalance between buying and selling pressure. At any moment, the market price reflects the point where the marginal buyer and marginal seller agree. When more buyers arrive (or sellers withdraw), the price rises; when sellers dominate, it falls.\n\nSeveral forces drive these imbalances. Fundamental factors include earnings reports, revenue growth, macroeconomic data (GDP, inflation, interest rates), and industry trends. When Apple beats earnings expectations, buyers rush in because the stock is now worth more than previously estimated.\n\nSentiment and behavioral factors also matter. Fear, greed, herding, and anchoring biases cause prices to overshoot or undershoot fundamental values. The Efficient Market Hypothesis (EMH) argues that prices already reflect all available information, but behavioral finance research shows persistent anomalies that quants try to exploit.',
      },
      {
        type: 'text',
        content:
          'On very short time scales (milliseconds to minutes), prices move due to order flow imbalances and market microstructure effects. A large buy order that consumes available liquidity will mechanically push the price up. On longer time scales (months to years), fundamentals like earnings growth and interest rates dominate. Successful quantitative strategies operate across all these time horizons.',
      },
      {
        type: 'quiz',
        question:
          'According to the Efficient Market Hypothesis, when a company announces better-than-expected earnings, what should happen?',
        options: [
          'The stock price slowly drifts up over weeks',
          'The stock price adjusts immediately to reflect the new information',
          'Nothing, because earnings are already priced in before the announcement',
          'The stock price falls due to profit-taking',
        ],
        correct: 1,
        explanation:
          'The EMH predicts that prices adjust rapidly to new information. When unexpected good news arrives, the price should jump almost instantly to its new fair value, with no predictable drift afterward. In practice, research shows some post-earnings drift, which is an anomaly quants study.',
      },
    ],
  },
  {
    id: '08-order-types',
    moduleId: 'markets-101',
    title: 'Order Types',
    order: 8,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'The two fundamental order types are market orders and limit orders. A market order says "buy/sell immediately at the best available price." A limit order says "buy/sell only at my specified price or better." Market orders guarantee execution but not price; limit orders guarantee price but not execution.\n\nBeyond these basics, exchanges support several conditional order types. A stop-loss order becomes a market order when the stock hits a trigger price, used to limit downside. A stop-limit order becomes a limit order at the trigger, offering price protection but risking non-execution during fast moves. Trailing stops adjust the trigger price as the stock moves in your favor.\n\nFor quant traders, the choice between limit and market orders directly impacts execution quality and strategy profitability. Limit orders avoid paying the spread but may not fill, causing you to miss trades. Market orders guarantee fills but pay the spread as a cost. Many systematic strategies use limit orders with smart cancellation logic to balance fill rates against slippage.',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Simulate fill probability for limit orders at various distances from mid\nimport numpy as np\n\nnp.random.seed(42)\nn_simulations = 10000\nmid_price = 100.0\nvolatility = 0.02  # 2% daily vol\n\nfor offset_bps in [0, 5, 10, 25, 50]:\n    limit_price = mid_price * (1 - offset_bps / 10000)\n    future_prices = mid_price * (1 + np.random.normal(0, volatility, n_simulations))\n    fill_rate = np.mean(future_prices <= limit_price)\n    print(f"Limit {offset_bps}bps below mid: fill rate = {fill_rate:.1%}")',
        output:
          'Limit 0bps below mid: fill rate = 50.3%\nLimit 5bps below mid: fill rate = 49.0%\nLimit 10bps below mid: fill rate = 48.0%\nLimit 25bps below mid: fill rate = 44.9%\nLimit 50bps below mid: fill rate = 40.7%',
      },
      {
        type: 'quiz',
        question:
          'You want to buy a stock currently at $50 but only if it drops to $48. Which order type should you use?',
        options: [
          'Market order',
          'Limit buy order at $48',
          'Stop-loss order at $48',
          'Trailing stop at $48',
        ],
        correct: 1,
        explanation:
          'A limit buy order at $48 will only execute if the stock price reaches $48 or lower, which is exactly what you want. A stop-loss at $48 would trigger a sell, not a buy. Market orders execute immediately at the current price.',
      },
    ],
  },
  {
    id: '09-reading-a-stock-quote',
    moduleId: 'markets-101',
    title: 'Reading a Stock Quote',
    order: 9,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'A stock quote provides a snapshot of a security\'s current trading information. The essential components are: Last Price (the most recent trade price), Bid (the highest price a buyer is willing to pay), Ask (the lowest price a seller is willing to accept), Volume (total shares traded today), and Open/High/Low/Close (OHLC) for the day.\n\nMarket capitalization (market cap) equals the share price times the total number of outstanding shares. This tells you the company\'s total equity value. A company trading at $150 per share with 1 billion shares outstanding has a market cap of $150 billion.\n\nThe P/E ratio (price-to-earnings) divides the stock price by earnings per share and is the most widely used valuation metric. A P/E of 25 means investors are paying $25 for every $1 of annual earnings. Higher P/E ratios indicate that the market expects faster future growth.',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Parse and display a stock quote\nquote = {\n    "symbol": "AAPL",\n    "last": 185.50,\n    "bid": 185.48,\n    "ask": 185.52,\n    "volume": 52_340_000,\n    "open": 184.20,\n    "high": 186.10,\n    "low": 183.90,\n    "shares_outstanding": 15_500_000_000,\n    "eps": 6.42,\n}\n\nmarket_cap = quote["last"] * quote["shares_outstanding"]\npe_ratio = quote["last"] / quote["eps"]\nspread = quote["ask"] - quote["bid"]\n\nprint(f"{quote[\'symbol\']} Last: ${quote[\'last\']:.2f}")\nprint(f"Bid/Ask: ${quote[\'bid\']:.2f} / ${quote[\'ask\']:.2f} (spread: ${spread:.2f})")\nprint(f"Day range: ${quote[\'low\']:.2f} - ${quote[\'high\']:.2f}")\nprint(f"Volume: {quote[\'volume\']:,.0f}")\nprint(f"Market Cap: ${market_cap/1e12:.2f}T")\nprint(f"P/E Ratio: {pe_ratio:.1f}x")',
        output:
          "AAPL Last: $185.50\nBid/Ask: $185.48 / $185.52 (spread: $0.04)\nDay range: $183.90 - $186.10\nVolume: 52,340,000\nMarket Cap: $2.87T\nP/E Ratio: 28.9x",
      },
      {
        type: 'quiz',
        question:
          'A stock has a price of $80 and earnings per share of $4. What is its P/E ratio?',
        options: ['4x', '20x', '80x', '320x'],
        correct: 1,
        explanation:
          'P/E = Price / EPS = $80 / $4 = 20x. This means investors are paying $20 for each $1 of annual earnings, implying they expect meaningful growth to justify that multiple.',
      },
    ],
  },
  {
    id: '10-your-first-trade',
    moduleId: 'markets-101',
    title: 'Your First Trade',
    order: 10,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Placing your first trade involves several steps: choosing a broker, funding your account, selecting a security, deciding on order type and size, and executing. Modern brokers like Interactive Brokers, Schwab, and Robinhood offer zero-commission trading on stocks and ETFs, though the real costs come from the bid-ask spread and potential price impact.\n\nPosition sizing is crucial. A common beginner mistake is concentrating too much capital in a single trade. Professional risk managers typically limit individual positions to 1-5% of total portfolio value. This ensures that no single loss can seriously damage your capital.\n\nBefore trading with real money, paper trading (simulated trading) lets you test strategies without risk. Most brokers offer paper trading accounts with real-time market data. This is essential practice — many aspiring quants spend months paper trading before going live.',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Position sizing: how many shares can you buy?\nportfolio_value = 100_000\nmax_position_pct = 0.02  # 2% max per position\nstock_price = 185.50\n\nmax_dollar_amount = portfolio_value * max_position_pct\nmax_shares = int(max_dollar_amount / stock_price)\n\nprint(f"Portfolio: ${portfolio_value:,.0f}")\nprint(f"Max position size (2%): ${max_dollar_amount:,.0f}")\nprint(f"At ${stock_price}/share -> max {max_shares} shares")\nprint(f"Actual exposure: ${max_shares * stock_price:,.2f} ({max_shares * stock_price / portfolio_value:.1%})")',
        output:
          'Portfolio: $100,000\nMax position size (2%): $2,000.00\nAt $185.50/share -> max 10 shares\nActual exposure: $1,855.00 (1.9%)',
      },
      {
        type: 'text',
        content:
          'Remember that every trade has two sides. When you buy, someone else is selling — and they may know something you don\'t. In quantitative trading, the goal is to develop a systematic edge: a strategy backed by data, tested rigorously, and executed consistently. The lessons ahead will teach you the math, statistics, and programming needed to build that edge.',
      },
      {
        type: 'quiz',
        question:
          'Why is paper trading recommended before using real money?',
        options: [
          'Paper trading always generates profits',
          'It lets you test strategies without financial risk',
          'Brokers require a minimum paper trading period',
          'Paper trades execute faster than real trades',
        ],
        correct: 1,
        explanation:
          'Paper trading simulates real market conditions without risking actual capital. It allows you to test and refine strategies, learn the mechanics of order entry, and build confidence before committing real money.',
      },
    ],
  },
];

lessons.forEach(registerLesson);
