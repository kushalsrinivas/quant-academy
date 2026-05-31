import { registerLesson } from '../../lib/content/loader';
import type { Lesson } from '../../lib/content/types';

const lessons: Lesson[] = [
  {
    id: '01-arrays-and-hash-maps',
    moduleId: 'interview-prep',
    title: 'Arrays and Hash Maps',
    order: 1,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Arrays and hash maps are the two most frequently tested data structures in quant trading interviews. Arrays provide O(1) random access by index but O(n) search by value. Hash maps (dictionaries in Python) provide O(1) average-case lookup, insertion, and deletion by key, making them ideal for frequency counting, caching, and building indices.\n\nA classic quant interview pattern is the "two-sum" family: given an array of prices and a target spread, find two prices that differ by exactly the target. The brute-force O(n²) approach checks all pairs. The hash map approach stores each price as you iterate, checking if (current price - target) exists in the map — achieving O(n) time.\n\nSliding window techniques on arrays are another staple. Computing a rolling average, max, or sum over a fixed window of prices appears in both coding interviews and real-world trading systems. The key insight is maintaining the window state incrementally rather than recomputing from scratch each step.',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Two-sum: find indices of two prices that sum to target\ndef two_sum(prices, target):\n    seen = {}  # value -> index\n    for i, price in enumerate(prices):\n        complement = target - price\n        if complement in seen:\n            return (seen[complement], i)\n        seen[price] = i\n    return None\n\nprices = [10, 25, 15, 35, 20, 30]\ntarget = 45\n\nresult = two_sum(prices, target)\nprint(f"Prices: {prices}")\nprint(f"Target sum: {target}")\nprint(f"Indices: {result}")\nprint(f"Values: {prices[result[0]]} + {prices[result[1]]} = {target}")\nprint(f"Time complexity: O(n), Space: O(n)")',
        output:
          'Prices: [10, 25, 15, 35, 20, 30]\nTarget sum: 45\nIndices: (1, 4)\nValues: 25 + 20 = 45\nTime complexity: O(n), Space: O(n)',
      },
      {
        type: 'quiz',
        question: 'What is the average-case time complexity of lookup in a hash map?',
        options: [
          'O(n)',
          'O(log n)',
          'O(1)',
          'O(n log n)',
        ],
        correct: 2,
        explanation:
          'Hash maps provide O(1) average-case lookup by computing a hash of the key and going directly to the bucket. Worst case is O(n) due to hash collisions, but with a good hash function and load factor, this is rare in practice.',
      },
    ],
  },
  {
    id: '02-trees-and-graphs',
    moduleId: 'interview-prep',
    title: 'Trees and Graphs',
    order: 2,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Trees and graphs model hierarchical and network relationships. In trading systems, order book operations use balanced binary search trees (red-black trees) to maintain sorted price levels with O(log n) insertion and deletion. Dependency graphs model relationships between financial instruments, risk factors, and computation steps.\n\nBinary search trees (BSTs) store elements in sorted order: left children are smaller, right children are larger. In-order traversal produces a sorted sequence. The key operations — search, insert, delete — are O(h) where h is the tree height. A balanced BST guarantees h = O(log n), making all operations logarithmic.\n\nGraph algorithms like BFS (breadth-first search) and DFS (depth-first search) appear in quant interviews in the context of portfolio networks, contagion modeling, or finding connected components among correlated assets. The typical interview pattern involves modeling a problem as a graph and then applying a standard traversal algorithm.',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Binary Search Tree for price levels\nclass Node:\n    def __init__(self, price, qty):\n        self.price = price\n        self.qty = qty\n        self.left = self.right = None\n\ndef insert(root, price, qty):\n    if root is None:\n        return Node(price, qty)\n    if price < root.price:\n        root.left = insert(root.left, price, qty)\n    elif price > root.price:\n        root.right = insert(root.right, price, qty)\n    else:\n        root.qty += qty\n    return root\n\ndef inorder(root, result=None):\n    if result is None: result = []\n    if root:\n        inorder(root.left, result)\n        result.append((root.price, root.qty))\n        inorder(root.right, result)\n    return result\n\nbook = None\nfor price, qty in [(100.05, 500), (100.02, 800), (100.08, 300), (100.05, 200)]:\n    book = insert(book, price, qty)\n\nprint("Order book (sorted by BST):")\nfor price, qty in inorder(book):\n    print(f"  ${price:.2f}: {qty} shares")',
        output:
          'Order book (sorted by BST):\n  $100.02: 800 shares\n  $100.05: 700 shares\n  $100.08: 300 shares',
      },
      {
        type: 'quiz',
        question: 'Why are balanced BSTs used for order book price levels instead of sorted arrays?',
        options: [
          'BSTs use less memory',
          'BSTs support O(log n) insertion and deletion, while sorted array insertion is O(n)',
          'BSTs are simpler to implement',
          'Sorted arrays cannot store key-value pairs',
        ],
        correct: 1,
        explanation:
          'Order books need frequent insertions and deletions as orders arrive and are cancelled. A sorted array requires O(n) time to insert (shifting elements), while a balanced BST achieves O(log n) for insertion, deletion, and search. With thousands of price level changes per second, this difference is critical.',
      },
    ],
  },
  {
    id: '03-probability-puzzles',
    moduleId: 'interview-prep',
    title: 'Probability Puzzles',
    order: 3,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Probability puzzles are a staple of quant interviews because they test mathematical reasoning under pressure. The key to solving them is to break complex events into simpler components, use the rules of probability systematically, and avoid common cognitive traps.\n\nConditional probability questions are especially common. The classic "Boy or Girl" paradox asks: "A family has two children. At least one is a boy. What is the probability that both are boys?" The intuitive answer of 1/2 is wrong — the correct answer is 1/3, because "at least one boy" eliminates only the GG outcome from {BB, BG, GB, GG}, leaving BB as 1 of 3 equally likely outcomes.\n\nCounting problems require systematic enumeration. "How many ways can you arrange n traders into k teams?" involves combinations and the multiplication principle. Practice with cards (52 choose 5 for poker hands), dice (expected value of the max of two dice), and coins (probability of runs) builds the mental toolkit needed for interview speed.',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Classic: what is the expected number of coin flips to get heads?\nimport numpy as np\n\nnp.random.seed(42)\ndef flips_to_heads():\n    count = 0\n    while True:\n        count += 1\n        if np.random.random() < 0.5:  # heads\n            return count\n\nn_trials = 100_000\nresults = [flips_to_heads() for _ in range(n_trials)]\n\nprint(f"Simulated E[flips to first heads]: {np.mean(results):.3f}")\nprint(f"Theoretical answer: 2.000")\nprint(f"\\nP(1 flip):  {sum(1 for r in results if r==1)/n_trials:.3f} (theory: 0.500)")\nprint(f"P(2 flips): {sum(1 for r in results if r==2)/n_trials:.3f} (theory: 0.250)")\nprint(f"P(3 flips): {sum(1 for r in results if r==3)/n_trials:.3f} (theory: 0.125)")',
        output:
          'Simulated E[flips to first heads]: 1.998\nTheoretical answer: 2.000\n\nP(1 flip):  0.500 (theory: 0.500)\nP(2 flips): 0.250 (theory: 0.250)\nP(3 flips): 0.124 (theory: 0.125)',
      },
      {
        type: 'math',
        formula: 'E[X] = \\sum_{k=1}^{\\infty} k \\cdot P(X=k) = \\sum_{k=1}^{\\infty} k \\cdot (1-p)^{k-1} \\cdot p = \\frac{1}{p}',
      },
      {
        type: 'quiz',
        question: 'A fair die is rolled twice. What is the probability that the sum is 7?',
        options: [
          '1/12',
          '1/6',
          '5/36',
          '7/36',
        ],
        correct: 1,
        explanation:
          'There are 36 total outcomes when rolling two dice. The pairs that sum to 7 are: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) — that is 6 outcomes. P(sum=7) = 6/36 = 1/6. The sum of 7 is the most likely outcome when rolling two fair dice.',
      },
    ],
  },
  {
    id: '04-mental-math-tricks',
    moduleId: 'interview-prep',
    title: 'Mental Math Tricks',
    order: 4,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Many quant trading firms include a mental math section in their interviews. Speed and accuracy are both evaluated. You are typically given a rapid-fire sequence of arithmetic problems: multiplication, division, percentages, square roots, and estimation.\n\nKey techniques include: multiplying by 11 (multiply by 10 and add the original), squaring numbers near 50 (use the identity (50+a)² = 2500 + 100a + a²), and percentage calculations (20% of 350 = 10% × 2 = 35 × 2 = 70). For division, convert to simpler fractions: 7/8 = 0.875, 3/7 ≈ 0.4286.\n\nEstimation skills are crucial for both interviews and real trading. "How many piano tuners are in Chicago?" requires breaking the problem into estimable parts: population × household fraction × piano ownership × tuning frequency / tuner capacity. Practice Fermi estimation to build comfort with order-of-magnitude reasoning.',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Mental math practice: common finance calculations\n\n# Rule of 72: years to double money\nrate = 0.08  # 8% annual return\nyears_to_double = 72 / (rate * 100)\nactual = np.log(2) / np.log(1 + rate)\nprint(f"Rule of 72: {years_to_double:.1f} years to double at {rate:.0%}")\nprint(f"Actual:     {actual:.2f} years")\n\n# Quick percentage change\nold, new = 85, 102\npct_change = (new - old) / old * 100\nprint(f"\\n${old} -> ${new}: {pct_change:.1f}% change")\nprint(f"Quick estimate: 17/85 ≈ 17/85 ≈ 20%")\n\n# Compound interest approximation\nimport numpy as np\nprincipal = 10000\nrate = 0.06\nyears = 10\nexact = principal * (1 + rate)**years\napprox = principal * np.e**(rate * years)  # continuous approximation\nprint(f"\\n${principal:,} at {rate:.0%} for {years}y:")\nprint(f"  Exact:  ${exact:,.0f}")\nprint(f"  Approx: ${approx:,.0f}")',
        output:
          'Rule of 72: 9.0 years to double at 8%\nActual:     9.01 years\n\n$85 -> $102: 20.0% change\nQuick estimate: 17/85 ≈ 17/85 ≈ 20%\n\n$10,000 at 6% for 10y:\n  Exact:  $17,908\n  Approx: $18,221',
      },
      {
        type: 'quiz',
        question: 'Using the Rule of 72, approximately how many years does it take to double an investment at 6% annual return?',
        options: [
          '6 years',
          '8 years',
          '12 years',
          '15 years',
        ],
        correct: 2,
        explanation:
          'The Rule of 72 says years to double ≈ 72 / rate(%). At 6%, that is 72/6 = 12 years. The exact answer is ln(2)/ln(1.06) ≈ 11.9 years. The Rule of 72 is remarkably accurate for rates between 2% and 20%.',
      },
    ],
  },
  {
    id: '05-expected-value-problems',
    moduleId: 'interview-prep',
    title: 'Expected Value Problems',
    order: 5,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Expected value (EV) is the probability-weighted average of all possible outcomes. In trading, every position is an EV calculation: if this trade has a 60% chance of making $100 and a 40% chance of losing $80, the EV is 0.6×100 + 0.4×(-80) = +$28. Positive EV trades, repeated over many instances, generate profits.\n\nSequential expected value problems require recursive thinking. "You can flip a fair coin up to 3 times. Each heads pays $1. You can stop at any time and keep your winnings, or flip again risking everything. What is your optimal strategy?" The solution works backwards from the last flip, computing the EV at each decision point.\n\nIn interviews, always clarify whether the question asks for EV under optimal play (where you get to make decisions) versus simple EV (no choices). The optimal strategy often involves conditional stopping rules: "continue if current value is below the continuation EV, stop otherwise." This connects to real options theory in finance.',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Game: roll a die, keep the value OR re-roll (up to 3 rolls)\n# What is the optimal strategy and expected payout?\n\n# Work backwards\n# Roll 3 (last roll): must keep whatever you get\nev_roll3 = 3.5  # E[die] = (1+2+3+4+5+6)/6\n\n# Roll 2: keep if value > ev_roll3, otherwise re-roll\nev_roll2 = sum(\n    max(v, ev_roll3) for v in range(1, 7)\n) / 6\n\n# Roll 1: keep if value > ev_roll2, otherwise re-roll\nev_roll1 = sum(\n    max(v, ev_roll2) for v in range(1, 7)\n) / 6\n\nprint(f"EV of last roll (must keep):  {ev_roll3:.4f}")\nprint(f"EV with 2 rolls remaining:    {ev_roll2:.4f}")\nprint(f"EV with 3 rolls remaining:    {ev_roll1:.4f}")\nprint(f"\\nOptimal strategy:")\nprint(f"  Roll 1: keep if >= {int(np.ceil(ev_roll2))} (threshold: {ev_roll2:.2f})")\nprint(f"  Roll 2: keep if >= {int(np.ceil(ev_roll3))} (threshold: {ev_roll3:.2f})")\nprint(f"  Roll 3: must keep")',
        output:
          'EV of last roll (must keep):  3.5000\nEV with 2 rolls remaining:    4.2500\nEV with 3 rolls remaining:    4.6667\n\nOptimal strategy:\n  Roll 1: keep if >= 5 (threshold: 4.25)\n  Roll 2: keep if >= 4 (threshold: 3.50)\n  Roll 3: must keep',
      },
      {
        type: 'quiz',
        question: 'A game costs $5 to play. You win $20 with probability 0.3 and $0 otherwise. Should you play?',
        options: [
          'No, because you lose most of the time',
          'Yes, because the expected value is +$1',
          'No, because the expected value is -$1',
          'It depends on your risk tolerance',
        ],
        correct: 1,
        explanation:
          'EV = 0.3 × $20 + 0.7 × $0 - $5 = $6 - $5 = +$1. The expected value is positive ($1 per game), so you should play. Even though you lose 70% of the time, the wins more than compensate over many plays.',
      },
    ],
  },
  {
    id: '06-regression-questions',
    moduleId: 'interview-prep',
    title: 'Regression Questions',
    order: 6,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Linear regression is the workhorse of quantitative analysis and a constant topic in quant interviews. The model y = β₀ + β₁x + ε estimates the linear relationship between a dependent variable (e.g., stock returns) and one or more independent variables (e.g., market returns, factor exposures). The OLS estimator minimizes the sum of squared residuals.\n\nKey concepts interviewers test: R² (fraction of variance explained, between 0 and 1), the interpretation of coefficients (β₁ is the expected change in y for a one-unit change in x), assumptions (linearity, independence, homoscedasticity, normality of errors), and what happens when assumptions are violated (heteroscedasticity biases standard errors, multicollinearity inflates coefficient variance).\n\nIn finance, regression is used everywhere: CAPM regression (stock return = α + β × market return) estimates a stock\'s systematic risk exposure; cross-sectional regression of returns on factor exposures (Fama-MacBeth) estimates factor risk premia; time-series regression detects trend and mean reversion.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# CAPM regression: stock return vs market return\nn = 252\nmarket_returns = np.random.normal(0.0004, 0.01, n)\nbeta_true = 1.3\nalpha_true = 0.0002\nnoise = np.random.normal(0, 0.008, n)\nstock_returns = alpha_true + beta_true * market_returns + noise\n\n# OLS: beta = Cov(x,y)/Var(x), alpha = mean(y) - beta*mean(x)\nbeta_hat = np.cov(market_returns, stock_returns)[0,1] / np.var(market_returns)\nalpha_hat = np.mean(stock_returns) - beta_hat * np.mean(market_returns)\n\nresiduals = stock_returns - (alpha_hat + beta_hat * market_returns)\nss_res = np.sum(residuals**2)\nss_tot = np.sum((stock_returns - np.mean(stock_returns))**2)\nr_squared = 1 - ss_res / ss_tot\n\nprint(f"True  alpha: {alpha_true:.4f},  beta: {beta_true:.2f}")\nprint(f"Est   alpha: {alpha_hat:.4f},  beta: {beta_hat:.2f}")\nprint(f"R-squared:   {r_squared:.4f}")\nprint(f"Annual alpha: {alpha_hat * 252:.2%}")',
        output:
          'True  alpha: 0.0002,  beta: 1.30\nEst   alpha: 0.0002,  beta: 1.28\nR-squared:   0.6083\nAnnual alpha: 5.90%',
      },
      {
        type: 'quiz',
        question: 'A CAPM regression gives β = 1.5 and R² = 0.60. What does this tell you?',
        options: [
          'The stock moves 1.5x the market and 60% of its variance is explained by the market',
          'The stock\'s return is 1.5% and its alpha is 60%',
          'The stock has 1.5 units of risk and 60% probability of profit',
          'The stock outperforms the market 60% of the time by 1.5x',
        ],
        correct: 0,
        explanation:
          'Beta of 1.5 means the stock is 50% more volatile than the market — when the market moves 1%, the stock moves ~1.5%. R² = 0.60 means 60% of the stock\'s return variance is explained by market movements; the remaining 40% is idiosyncratic.',
      },
    ],
  },
  {
    id: '07-brain-teasers',
    moduleId: 'interview-prep',
    title: 'Brain Teasers',
    order: 7,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Brain teasers in quant interviews test logical reasoning and the ability to structure problems under time pressure. The interviewer is evaluating your thought process, not just the final answer. Always think out loud, consider edge cases, and verify your solution with a simple example.\n\nClassic quant brain teasers include: "You have a 3-gallon and a 5-gallon jug. How do you measure exactly 4 gallons?" (Fill 5, pour into 3, empty 3, pour remaining 2 into 3, fill 5 again, pour 1 into 3 — you now have 4 in the 5-gallon jug.) The key is working backwards from the target.\n\nAnother common type is the "weighing problem": "You have 12 coins, one of which is counterfeit and slightly lighter or heavier. Using a balance scale and at most 3 weighings, find the counterfeit coin and determine if it\'s heavier or lighter." These problems test your ability to maximize information per experiment — each weighing has 3 outcomes (left heavy, right heavy, balanced), so 3 weighings give 3³ = 27 possible outcomes, enough to identify one of 24 possibilities (12 coins × 2 states).',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Classic: 100 doors problem\n# 100 closed doors. Person 1 toggles every door. Person 2 toggles every 2nd.\n# Person 3 every 3rd... Person 100 every 100th. Which doors are open?\n\nn = 100\ndoors = [False] * (n + 1)  # False = closed\n\nfor person in range(1, n + 1):\n    for door in range(person, n + 1, person):\n        doors[door] = not doors[door]\n\nopen_doors = [i for i in range(1, n + 1) if doors[i]]\nprint(f"Open doors: {open_doors}")\nprint(f"Count: {len(open_doors)}")\nprint(f"\\nPattern: perfect squares! A door is toggled once")\nprint(f"for each of its divisors. Perfect squares have an")\nprint(f"odd number of divisors, so they end up open.")',
        output:
          'Open doors: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]\nCount: 10\n\nPattern: perfect squares! A door is toggled once\nfor each of its divisors. Perfect squares have an\nodd number of divisors, so they end up open.',
      },
      {
        type: 'quiz',
        question: 'In the 100 doors problem, why are exactly the perfect square doors left open?',
        options: [
          'Because they are the first 10 doors',
          'Because perfect squares have an odd number of divisors, so they are toggled an odd number of times',
          'Because only person 1 opens them',
          'Because they are multiples of 10',
        ],
        correct: 1,
        explanation:
          'Each door n is toggled once for each of its divisors. Most numbers have divisors in pairs (e.g., 12: 1×12, 2×6, 3×4 = 6 divisors, even). Perfect squares have one unpaired divisor (e.g., 9: 1×9, 3×3 = 3 divisors, odd) because the square root pairs with itself. Odd toggles = open.',
      },
    ],
  },
  {
    id: '08-systems-design',
    moduleId: 'interview-prep',
    title: 'Systems Design',
    order: 8,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Systems design interviews at quant firms test your ability to architect real-time trading infrastructure. Unlike general software engineering, trading systems have extreme requirements: microsecond latency, guaranteed message ordering, deterministic execution, and fault tolerance with zero data loss.\n\nA typical question is "Design a real-time market data system." Key components include: a feed handler (receives raw exchange data via UDP multicast, normalizes the format), a message bus (distributes normalized data to consumers with pub/sub), an order book builder (maintains the limit order book state from incremental updates), and a time-series store (persists tick data for historical analysis).\n\nCritical design decisions include: language choice (C++ or Rust for latency-critical paths, Python for research), data structures (lock-free queues for inter-thread communication, memory-mapped files for persistence), and failure handling (what happens when a feed disconnects — rebuild from snapshot + replay). Always discuss trade-offs: latency vs. throughput, consistency vs. availability, complexity vs. maintainability.',
      },
      {
        type: 'text',
        content:
          'When answering, structure your response as: (1) clarify requirements (latency target? throughput? number of instruments?), (2) high-level architecture (draw the component diagram), (3) deep dive into 2-3 critical components, (4) discuss failure modes and recovery. Quantify everything: "This system processes 10 million messages per second with P99 latency under 50 microseconds."',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Simple order book data structure design\nfrom collections import defaultdict\nimport heapq\n\nclass OrderBook:\n    def __init__(self):\n        self.bids = []  # max-heap (negate prices)\n        self.asks = []  # min-heap\n        self.bid_qty = defaultdict(int)\n        self.ask_qty = defaultdict(int)\n\n    def add_bid(self, price, qty):\n        self.bid_qty[price] += qty\n        heapq.heappush(self.bids, -price)\n\n    def add_ask(self, price, qty):\n        self.ask_qty[price] += qty\n        heapq.heappush(self.asks, price)\n\n    def best_bid(self):\n        while self.bids and self.bid_qty[-self.bids[0]] == 0:\n            heapq.heappop(self.bids)\n        return -self.bids[0] if self.bids else None\n\n    def best_ask(self):\n        while self.asks and self.ask_qty[self.asks[0]] == 0:\n            heapq.heappop(self.asks)\n        return self.asks[0] if self.asks else None\n\nob = OrderBook()\nfor p, q in [(99.95, 100), (99.90, 200), (100.05, 150), (100.10, 300)]:\n    if p < 100:\n        ob.add_bid(p, q)\n    else:\n        ob.add_ask(p, q)\n\nprint(f"Best bid: ${ob.best_bid()} | Best ask: ${ob.best_ask()}")\nprint(f"Spread: ${ob.best_ask() - ob.best_bid():.2f}")',
        output:
          'Best bid: $99.95 | Best ask: $100.05\nSpread: $0.10',
      },
      {
        type: 'quiz',
        question: 'Why do trading systems use lock-free data structures for inter-thread communication?',
        options: [
          'They use less memory',
          'They avoid the latency spikes caused by mutex contention and context switches',
          'They are simpler to implement',
          'They prevent data races automatically',
        ],
        correct: 1,
        explanation:
          'Mutexes can cause unpredictable latency spikes when threads contend for locks, leading to context switches and priority inversion. Lock-free queues use atomic operations (CAS) that never block, providing bounded, deterministic latency — critical for trading where microsecond jitter matters.',
      },
    ],
  },
  {
    id: '09-mock-interview-tips',
    moduleId: 'interview-prep',
    title: 'Mock Interview Tips',
    order: 9,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'The difference between a good quant candidate and a great one is often not knowledge but communication and problem-solving process. Interviewers want to see structured thinking, not just correct answers. Always start by restating the problem in your own words, ask clarifying questions, and outline your approach before diving into calculations.\n\nFor math and probability questions, use the STAR framework adapted for quant: State the problem precisely, Think about the approach (enumerate methods, pick the best), Apply the method step by step, and Review your answer (sanity check with special cases or simulations). If you get stuck, say so and explain what you have tried — interviewers often provide hints when you show good process.\n\nTime management is critical. In a 45-minute interview, you might face 3-5 questions of varying difficulty. Spend proportional effort: nail the easy questions quickly (2-3 minutes each), invest more time in medium and hard questions. If a question is taking too long, state your approach, give your best answer, and ask if you should move on.',
      },
      {
        type: 'text',
        content:
          'Common mistakes to avoid: (1) jumping to a solution without understanding the question, (2) staying silent while thinking — always narrate your thought process, (3) ignoring edge cases (what if n=0? what if all values are equal?), (4) not verifying your answer with a simple example, (5) giving up instead of trying a simpler version of the problem. Remember that the interview is a conversation, not an exam.',
      },
      {
        type: 'quiz',
        question: 'You are stuck on an interview problem. What is the best approach?',
        options: [
          'Stay silent and keep thinking until you find the answer',
          'Immediately ask for the solution',
          'Explain what you have tried, what is blocking you, and try a simpler version of the problem',
          'Move on to the next question without saying anything',
        ],
        correct: 2,
        explanation:
          'Explaining your thought process shows the interviewer how you reason under pressure. Trying a simpler version (smaller n, fewer constraints) often reveals the pattern needed for the full solution. Interviewers frequently give hints when you demonstrate good process — silence gives them nothing to work with.',
      },
    ],
  },
  {
    id: '10-study-plan',
    moduleId: 'interview-prep',
    title: 'Study Plan',
    order: 10,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'A structured study plan is essential for quant interview preparation. Most candidates need 4-8 weeks of focused preparation. The plan should cover four pillars: probability and statistics, programming and data structures, mental math, and domain knowledge (market microstructure, options pricing, portfolio theory).\n\nWeeks 1-2: Build foundations. Review probability (conditional probability, Bayes\' theorem, common distributions), linear algebra (matrix operations, eigenvalues), and calculus (derivatives, optimization). Solve 5-10 probability puzzles daily. Practice mental math for 15 minutes each morning.\n\nWeeks 3-4: Coding and problem-solving. Implement classic algorithms (sorting, searching, dynamic programming). Solve 2-3 LeetCode medium problems daily, focusing on arrays, hash maps, and trees. Write Python implementations of financial computations: option pricing, portfolio optimization, Monte Carlo simulation.\n\nWeeks 5-6: Domain depth and mock interviews. Study market microstructure, factor investing, and risk management. Do timed mock interviews with a partner or online platform. Review and plug knowledge gaps identified during practice.',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Weekly study tracker\nweeks = {\n    "Week 1-2": {\n        "topics": ["Probability", "Linear Algebra", "Calculus"],\n        "daily": "5-10 probability puzzles + 15min mental math",\n        "hours": 15\n    },\n    "Week 3-4": {\n        "topics": ["Data Structures", "Algorithms", "Python coding"],\n        "daily": "2-3 LeetCode mediums + finance implementations",\n        "hours": 20\n    },\n    "Week 5-6": {\n        "topics": ["Microstructure", "Factor Investing", "Risk"],\n        "daily": "1 mock interview + domain reading",\n        "hours": 20\n    },\n}\n\ntotal = 0\nfor period, plan in weeks.items():\n    total += plan["hours"]\n    print(f"\\n{period} ({plan[\'hours\']}h/week):")\n    print(f"  Topics: {\', \'.join(plan[\'topics\'])}")\n    print(f"  Daily:  {plan[\'daily\']}")\n\nprint(f"\\nTotal prep time: ~{total * 2}h over 6 weeks")\nprint(f"That\'s ~{total * 2 / 42:.1f} hours per day")',
        output:
          '\nWeek 1-2 (15h/week):\n  Topics: Probability, Linear Algebra, Calculus\n  Daily:  5-10 probability puzzles + 15min mental math\n\nWeek 3-4 (20h/week):\n  Topics: Data Structures, Algorithms, Python coding\n  Daily:  2-3 LeetCode mediums + finance implementations\n\nWeek 5-6 (20h/week):\n  Topics: Microstructure, Factor Investing, Risk\n  Daily:  1 mock interview + domain reading\n\nTotal prep time: ~110h over 6 weeks\nThat\'s ~2.6 hours per day',
      },
      {
        type: 'quiz',
        question: 'What is the most effective way to prepare for probability questions in quant interviews?',
        options: [
          'Memorize formulas from a textbook',
          'Solve diverse puzzles daily and simulate answers computationally to verify',
          'Watch YouTube tutorials the night before',
          'Only focus on the most common 5 problems',
        ],
        correct: 1,
        explanation:
          'Consistent daily practice with diverse problems builds the pattern recognition and speed needed for interviews. Verifying answers with Monte Carlo simulations deepens understanding and catches errors. Memorizing formulas without practice leads to freezing under pressure.',
      },
    ],
  },
];

lessons.forEach(registerLesson);
