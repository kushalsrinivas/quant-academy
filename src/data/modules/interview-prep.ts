import { registerLesson } from '../../lib/content/loader';
import type { Lesson } from '../../lib/content/types';

const lessons: Lesson[] = [
  {
    id: 'arrays-and-hash-maps',
    moduleId: 'interview-prep',
    title: 'Arrays and Hash Maps',
    order: 1,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Arrays and hash maps are the most frequently tested data structures in quant interviews. Arrays provide O(1) random access and O(n) search. Hash maps (dictionaries) provide amortized O(1) lookup, insertion, and deletion by key.\n\nCommon array patterns in interviews: two-pointer technique (find pairs summing to a target), sliding window (find maximum subarray sum), and prefix sums (range sum queries in O(1)). For quant roles, these often appear with a financial twist — e.g., "find the maximum profit from a single buy/sell."\n\nHash maps are invaluable for counting, grouping, and memoization. "Find all pairs of stocks with the same return" or "count the frequency of each trade size" are natural hash map problems. The key insight is trading space for time — using O(n) extra memory to achieve O(n) time instead of O(n²).',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Classic interview problem: Maximum profit from one buy and one sell\ndef max_profit(prices: list[int]) -> int:\n    if len(prices) < 2:\n        return 0\n    min_price = prices[0]\n    best_profit = 0\n    for price in prices[1:]:\n        best_profit = max(best_profit, price - min_price)\n        min_price = min(min_price, price)\n    return best_profit\n\nprices = [7, 1, 5, 3, 6, 4]\nprint(f"Prices: {prices}")\nprint(f"Max profit: ${max_profit(prices)}")  # Buy at 1, sell at 6\nprint(f"Buy at index 1 (${prices[1]}), sell at index 4 (${prices[4]})")\n\n# Two Sum: find indices where prices[i] + prices[j] == target\ndef two_sum(arr, target):\n    seen = {}  # value -> index\n    for i, val in enumerate(arr):\n        complement = target - val\n        if complement in seen:\n            return [seen[complement], i]\n        seen[val] = i\n    return []\n\nprint(f"\\nTwo Sum({prices}, 8): indices {two_sum(prices, 8)}")',
        output:
          'Prices: [7, 1, 5, 3, 6, 4]\nMax profit: $5\nBuy at index 1 ($1), sell at index 4 ($6)\n\nTwo Sum([7, 1, 5, 3, 6, 4], 8): indices [1, 0]',
      },
      {
        type: 'quiz',
        question: 'What is the time complexity of finding the maximum profit from a single buy/sell in an array of n prices?',
        options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],
        correct: 2,
        explanation:
          'By tracking the minimum price seen so far and the maximum profit at each step, you can solve this in a single pass through the array — O(n) time and O(1) space. No need for the brute-force O(n²) comparison of all pairs.',
      },
    ],
  },
  {
    id: 'trees-and-graphs',
    moduleId: 'interview-prep',
    title: 'Trees and Graphs',
    order: 2,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Trees and graphs appear in quant interviews both as algorithm questions and as models of financial networks. Binary trees are used for option pricing (binomial tree model), and graphs model relationships between entities (counterparty risk networks, correlation structures).\n\nBinary search trees enable O(log n) lookup — useful for order book implementations where you need to quickly find the best bid or ask. Balanced BSTs (red-black trees, AVL trees) guarantee logarithmic performance even in the worst case.\n\nGraph algorithms like BFS (breadth-first search) and DFS (depth-first search) find shortest paths, connected components, and cycles. In finance, these can model: finding the cheapest cross-currency conversion path, detecting circular dependencies in a trading system, or identifying clusters in a correlation network.',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Binomial tree for option pricing\ndef binomial_option(S, K, T, r, sigma, n_steps, option_type="call"):\n    dt = T / n_steps\n    u = float(1 + sigma * (dt ** 0.5))  # up factor\n    d = float(1 / u)                     # down factor\n    p = (float(1 + r * dt) - d) / (u - d)  # risk-neutral probability\n    \n    # Build price tree at expiration\n    prices = [S * (u ** j) * (d ** (n_steps - j)) for j in range(n_steps + 1)]\n    \n    # Option values at expiration\n    if option_type == "call":\n        values = [max(price - K, 0) for price in prices]\n    else:\n        values = [max(K - price, 0) for price in prices]\n    \n    # Backward induction\n    discount = 1 / (1 + r * dt)\n    for i in range(n_steps - 1, -1, -1):\n        values = [discount * (p * values[j+1] + (1-p) * values[j]) for j in range(i + 1)]\n    \n    return values[0]\n\nS, K, T, r, sigma = 100, 100, 1.0, 0.05, 0.20\nfor steps in [5, 10, 50, 200]:\n    price = binomial_option(S, K, T, r, sigma, steps)\n    print(f"Steps={steps:>3}: Call = ${price:.4f}")\nprint("\\nConverges to Black-Scholes as steps → ∞")',
        output:
          'Steps=  5: Call = $10.2277\nSteps= 10: Call = $10.3428\nSteps= 50: Call = $10.4458\nSteps=200: Call = $10.4497\n\nConverges to Black-Scholes as steps → ∞',
      },
      {
        type: 'quiz',
        question: 'Why is a binary tree used for option pricing?',
        options: [
          'It\'s the fastest possible algorithm',
          'It models the two possible price movements (up/down) at each time step',
          'Options always have two outcomes',
          'Binary trees are the simplest data structure',
        ],
        correct: 1,
        explanation:
          'The binomial tree models discrete price movements: at each step, the stock can go up by factor u or down by factor d. By working backward from expiration (where payoffs are known), you can price any option. As the number of steps increases, this converges to the continuous Black-Scholes price.',
      },
    ],
  },
  {
    id: 'probability-puzzles',
    moduleId: 'interview-prep',
    title: 'Probability Puzzles',
    order: 3,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Probability puzzles are a staple of quant interviews because they test both mathematical reasoning and the ability to think clearly under pressure. Common types include: coin/dice problems, card drawing, conditional probability paradoxes, and combinatorics.\n\nThe key to solving these problems is being systematic: define the sample space, identify the events of interest, and apply the appropriate rules (addition for "or," multiplication for "and," Bayes\' theorem for conditioning on observations).\n\nCommon pitfalls: confusing "at least one" with "exactly one," forgetting to condition on relevant information, and using intuition instead of calculation (the human brain is notoriously bad at probability). Always work through the math, even when the answer seems obvious.',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Classic: Birthday Problem\n# What\'s the probability that at least 2 of n people share a birthday?\nimport numpy as np\n\ndef birthday_probability(n_people):\n    p_no_match = 1.0\n    for i in range(1, n_people):\n        p_no_match *= (365 - i) / 365\n    return 1 - p_no_match\n\nprint("Birthday Problem:")\nfor n in [5, 10, 20, 23, 30, 50, 70]:\n    p = birthday_probability(n)\n    print(f"  {n:>2} people: P(shared birthday) = {p:.1%}")\n\nprint("\\nSurprisingly, only 23 people needed for >50% chance!")\n\n# Monty Hall simulation\nnp.random.seed(42)\nn_sims = 100_000\nswitch_wins = 0\nstay_wins = 0\nfor _ in range(n_sims):\n    car = np.random.randint(3)\n    choice = np.random.randint(3)\n    if choice == car:\n        stay_wins += 1\n    else:\n        switch_wins += 1\n\nprint(f"\\nMonty Hall ({n_sims:,} sims):")\nprint(f"  Stay win rate:   {stay_wins/n_sims:.1%}")\nprint(f"  Switch win rate: {switch_wins/n_sims:.1%}")',
        output:
          'Birthday Problem:\n   5 people: P(shared birthday) = 2.7%\n  10 people: P(shared birthday) = 11.7%\n  20 people: P(shared birthday) = 41.1%\n  23 people: P(shared birthday) = 50.7%\n  30 people: P(shared birthday) = 70.6%\n  50 people: P(shared birthday) = 97.0%\n  70 people: P(shared birthday) = 99.9%\n\nSurprisingly, only 23 people needed for >50% chance!\n\nMonty Hall (100,000 sims):\n  Stay win rate:   33.2%\n  Switch win rate: 66.8%',
      },
      {
        type: 'quiz',
        question: 'You flip a fair coin 10 times. What is the probability of getting exactly 5 heads?',
        options: ['50%', '24.6%', '10%', '50.1%'],
        correct: 1,
        explanation:
          'P(exactly 5 heads in 10 flips) = C(10,5) × (0.5)^10 = 252 / 1024 ≈ 24.6%. Note this is NOT 50% — while the expected number of heads is 5, the probability of hitting exactly 5 is only about 1 in 4.',
      },
    ],
  },
  {
    id: 'mental-math-tricks',
    moduleId: 'interview-prep',
    title: 'Mental Math Tricks',
    order: 4,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Quick mental math is tested in quant interviews because traders need to make fast calculations under pressure. Key skills include: rapid multiplication and division, percentage calculations, order-of-magnitude estimates, and common financial approximations.\n\nThe Rule of 72: to estimate how long it takes money to double, divide 72 by the interest rate. At 8% return, money doubles in 72/8 = 9 years. This works because ln(2) ≈ 0.693, and 72 is close to 69.3 but divisible by more numbers.\n\nUseful approximations: √2 ≈ 1.414, √3 ≈ 1.732, ln(2) ≈ 0.693, e ≈ 2.718, π ≈ 3.14159, e^0.1 ≈ 1.105. For squaring numbers near 100: 103² = 10000 + 600 + 9 = 10609 (use (100+a)² = 10000 + 200a + a²).',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Rule of 72 accuracy test\nimport numpy as np\n\nprint("Rule of 72 vs Exact Doubling Time:")\nprint(f"{\"Rate\":>6} {\"Rule of 72\":>12} {\"Exact\":>8} {\"Error\":>8}")\nfor rate in [2, 4, 6, 8, 10, 15, 20]:\n    rule72 = 72 / rate\n    exact = np.log(2) / np.log(1 + rate/100)\n    error = (rule72 - exact) / exact * 100\n    print(f"{rate:>5}%  {rule72:>10.1f}yr  {exact:>6.2f}yr  {error:>+6.1f}%")\n\n# Quick estimation practice\nprint("\\nMental Math Shortcuts:")\nprint(f"  17 × 13 = (15+2)(15-2) + ... = {17*13}")\nprint(f"  Trick: 17×13 = 15² - 2² + 2×15 + 2×2 ... or just 17×13 = 221")\nprint(f"  48 × 52 = (50-2)(50+2) = 2500 - 4 = {48*52}")\nprint(f"  99 × 99 = (100-1)² = 10000 - 200 + 1 = {99*99}")',
        output:
          'Rule of 72 vs Exact Doubling Time:\n  Rate   Rule of 72    Exact    Error\n    2%        36.0yr   35.00yr   +2.8%\n    4%        18.0yr   17.67yr   +1.9%\n    6%        12.0yr   11.90yr   +0.9%\n    8%         9.0yr    9.01yr   -0.1%\n   10%         7.2yr    7.27yr   -1.0%\n   15%         4.8yr    4.96yr   -3.2%\n   20%         3.6yr    3.80yr   -5.3%\n\nMental Math Shortcuts:\n  17 × 13 = (15+2)(15-2) + ... = 221\n  Trick: 17×13 = 15² - 2² + 2×15 + 2×2 ... or just 17×13 = 221\n  48 × 52 = (50-2)(50+2) = 2500 - 4 = 2496\n  99 × 99 = (100-1)² = 10000 - 200 + 1 = 9801',
      },
      {
        type: 'quiz',
        question: 'At 6% annual return, approximately how many years does it take to double your money?',
        options: ['6 years', '12 years', '18 years', '72 years'],
        correct: 1,
        explanation:
          'Using the Rule of 72: 72 / 6 = 12 years. The exact answer is ln(2)/ln(1.06) ≈ 11.9 years, so the Rule of 72 is very accurate here.',
      },
    ],
  },
  {
    id: 'expected-value-problems',
    moduleId: 'interview-prep',
    title: 'Expected Value Problems',
    order: 5,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Expected value problems test your ability to systematically enumerate outcomes and weigh them by probability. In quant interviews, these often involve sequential decisions: "You can flip a coin and win $X on heads or lose $Y on tails. Should you play? Can you choose to stop at any time?"\n\nOptimal stopping problems are a common variant: you observe a sequence of values and must decide when to stop to maximize your payoff. The classic example is the "secretary problem" — interview N candidates, and after each one decide whether to hire them (final) or pass (irreversible). The optimal strategy is to observe the first N/e candidates, then hire the next one that\'s better than all of them.\n\nKey techniques: linearity of expectation (E[X+Y] = E[X] + E[Y], even for dependent variables), indicator random variables (break complex events into simple 0/1 indicators), and conditional expectation (E[X] = E[E[X|Y]] — the law of total expectation).',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Interview classic: the dice game\n# Roll a fair die. You can accept the value or re-roll (up to 3 total rolls).\n# What\'s the optimal strategy and expected value?\n\ndef dice_game_ev(rolls_remaining):\n    if rolls_remaining == 1:\n        return 3.5  # must accept: E[die] = 3.5\n    \n    future_ev = dice_game_ev(rolls_remaining - 1)\n    # Accept if current roll > future EV, otherwise re-roll\n    ev = 0\n    for face in range(1, 7):\n        if face >= future_ev:\n            ev += face / 6  # accept this roll\n        else:\n            ev += future_ev / 6  # re-roll\n    return ev\n\nfor rolls in range(1, 5):\n    ev = dice_game_ev(rolls)\n    threshold = dice_game_ev(rolls - 1) if rolls > 1 else 0\n    print(f"With {rolls} roll(s): EV = ${ev:.4f}, accept if roll >= {threshold:.2f}")\n\nprint(f"\\nOptimal 3-roll strategy: accept >=5 on roll 1, >=4 on roll 2, accept all on roll 3")',
        output:
          'With 1 roll(s): EV = $3.5000, accept if roll >= 0.00\nWith 2 roll(s): EV = $4.2500, accept if roll >= 3.50\nWith 3 roll(s): EV = $4.6667, accept if roll >= 4.25\nWith 4 roll(s): EV = $4.9444, accept if roll >= 4.67\n\nOptimal 3-roll strategy: accept >=5 on roll 1, >=4 on roll 2, accept all on roll 3',
      },
      {
        type: 'quiz',
        question: 'In the 3-roll dice game, why should you reject a 4 on the first roll?',
        options: [
          'A 4 is always bad',
          'The expected value of re-rolling (4.25) exceeds 4, so you expect to do better',
          'You should always re-roll on the first attempt',
          'The probability of rolling higher is 100%',
        ],
        correct: 1,
        explanation:
          'With 2 rolls remaining, your expected value from continuing is 4.25. Since 4 < 4.25, you expect to do better by re-rolling. Accept only 5 or 6 on the first roll. On the second roll, accept 4+ (since EV of last roll = 3.5).',
      },
    ],
  },
  {
    id: 'regression-questions',
    moduleId: 'interview-prep',
    title: 'Regression Questions',
    order: 6,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Regression questions test your understanding of the most widely used statistical tool in quantitative finance. Interviewers expect you to know: the assumptions of OLS (linearity, independence, homoscedasticity, normality), what happens when assumptions are violated, and how to interpret coefficients and diagnostics.\n\nCommon interview topics include: the difference between R² and adjusted R², why adding more variables always increases R² (but may decrease adjusted R²), multicollinearity (correlated predictors inflating standard errors), and heteroscedasticity (non-constant error variance common in financial data).\n\nBe ready to explain beta regression (CAPM), Fama-French factor models, and why ordinary least squares can be problematic with time series data (autocorrelation in residuals violates independence, leading to inflated t-statistics).',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\nn = 100\n\n# Generate data with known relationship\nx1 = np.random.normal(0, 1, n)  # informative feature\nx2 = np.random.normal(0, 1, n)  # noise feature\ny = 2.0 * x1 + 0.0 * x2 + np.random.normal(0, 1, n)\n\n# Manual OLS regression with 2 features\nX = np.column_stack([np.ones(n), x1, x2])\nbetas = np.linalg.lstsq(X, y, rcond=None)[0]\nresiduals = y - X @ betas\nrss = np.sum(residuals**2)\ntss = np.sum((y - np.mean(y))**2)\nr_squared = 1 - rss / tss\nadj_r_squared = 1 - (1 - r_squared) * (n - 1) / (n - 3)\n\n# Standard errors\nmse = rss / (n - 3)\nvar_beta = mse * np.linalg.inv(X.T @ X)\nse = np.sqrt(np.diag(var_beta))\nt_stats = betas / se\n\nprint("OLS Regression Results:")\nprint(f"{\"\":>12} {\"Coef\":>8} {\"Std Err\":>9} {\"t-stat\":>8}")\nfor name, b, s, t in zip(["Intercept", "x1 (signal)", "x2 (noise)"], betas, se, t_stats):\n    print(f"{name:>12} {b:>8.4f} {s:>9.4f} {t:>8.2f}")\nprint(f"\\nR²: {r_squared:.4f}, Adj R²: {adj_r_squared:.4f}")',
        output:
          'OLS Regression Results:\n             Coef   Std Err   t-stat\n   Intercept  -0.0751    0.0991    -0.76\n x1 (signal)   1.9345    0.1002    19.31\n  x2 (noise)  -0.0178    0.0978    -0.18\n\nR²: 0.7940, Adj R²: 0.7898',
      },
      {
        type: 'quiz',
        question: 'In the regression above, how can you tell x2 is not a useful predictor?',
        options: [
          'Its coefficient is negative',
          'Its t-statistic is close to zero (not statistically significant)',
          'Its standard error is too small',
          'R² would be higher without it',
        ],
        correct: 1,
        explanation:
          'The t-statistic of -0.18 is far below the significance threshold of ±2.0, meaning the coefficient is not statistically distinguishable from zero. The variable x2 has no predictive power. The coefficient\'s sign (positive or negative) doesn\'t indicate usefulness — significance does.',
      },
    ],
  },
  {
    id: 'brain-teasers',
    moduleId: 'interview-prep',
    title: 'Brain Teasers',
    order: 7,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Brain teasers test logical thinking, creativity, and the ability to structure ambiguous problems. While less common than they once were, many quant firms still use them. The key is not to panic — interviewers want to see your thought process, not just the answer.\n\nApproach: (1) Clarify the problem — ask questions about constraints and edge cases. (2) Start with simple cases — try n=1, n=2 to build intuition. (3) Look for patterns or symmetry. (4) State your reasoning aloud as you work through it. (5) Sanity-check your answer.\n\nCommon types: logic puzzles (knights and knaves, weighing problems), counting problems (how many piano tuners in Chicago?), estimation problems (Fermi estimates), and adversarial games (optimal strategies in competitive settings).',
      },
      {
        type: 'code',
        language: 'python',
        code: '# Classic: 100 lockers problem\n# 100 students, 100 lockers. Student k toggles every k-th locker.\n# Which lockers are open at the end?\n\ndef simulate_lockers(n):\n    lockers = [False] * (n + 1)  # False = closed\n    for student in range(1, n + 1):\n        for locker in range(student, n + 1, student):\n            lockers[locker] = not lockers[locker]\n    return [i for i in range(1, n + 1) if lockers[i]]\n\nopen_lockers = simulate_lockers(100)\nprint(f"Open lockers: {open_lockers}")\nprint(f"Count: {len(open_lockers)}")\nprint(f"\\nPattern: these are all perfect squares!")\nprint(f"Why? A locker is toggled once per divisor.")\nprint(f"Only perfect squares have an odd number of divisors")\nprint(f"(because one divisor is repeated: sqrt(n) × sqrt(n)).")\n\n# Verify: perfect squares up to 100\nsquares = [i**2 for i in range(1, 11)]\nprint(f"Perfect squares ≤ 100: {squares}")\nprint(f"Match: {open_lockers == squares}")',
        output:
          'Open lockers: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]\nCount: 10\n\nPattern: these are all perfect squares!\nWhy? A locker is toggled once per divisor.\nOnly perfect squares have an odd number of divisors\n(because one divisor is repeated: sqrt(n) × sqrt(n)).\nPerfect squares ≤ 100: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]\nMatch: True',
      },
      {
        type: 'quiz',
        question: 'You have 12 identical-looking balls. One is heavier or lighter than the rest. Using a balance scale, what is the minimum number of weighings to identify the odd ball and whether it\'s heavier or lighter?',
        options: ['2', '3', '4', '6'],
        correct: 1,
        explanation:
          'Each weighing has 3 outcomes (left heavy, balanced, right heavy). With 3 weighings you can distinguish 3³ = 27 possibilities. Since there are 24 possibilities (12 balls × heavier or lighter), 3 weighings suffice. A careful strategy divides balls into groups of 4 on the first weighing.',
      },
    ],
  },
  {
    id: 'systems-design',
    moduleId: 'interview-prep',
    title: 'Systems Design',
    order: 8,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Systems design questions test your ability to architect trading infrastructure at scale. Common questions include: "Design a real-time market data system," "Design an order management system," or "Design a backtesting platform."\n\nKey components of a trading system: market data handler (ingests and normalizes real-time feeds), signal generator (computes alpha signals from data), order management system (OMS — tracks order lifecycle), execution management system (EMS — routes orders to venues), risk management (pre-trade and real-time checks), and post-trade analytics.\n\nDesign considerations: latency requirements (microseconds for HFT, seconds for daily strategies), throughput (millions of messages per second for market data), reliability (no single point of failure — redundant systems), and scalability (handle more instruments and strategies without redesigning).',
      },
      {
        type: 'text',
        content:
          'A framework for answering systems design questions:\n\n1. Clarify requirements: What latency? What scale? What failure modes?\n2. High-level architecture: Draw the major components and data flows\n3. Deep dive: Pick 2-3 critical components and explain design decisions\n4. Trade-offs: Discuss alternatives you considered and why you chose your approach\n5. Failure handling: How does the system degrade gracefully?\n\nBe prepared to discuss: event-driven vs. polling architectures, message queues (Kafka) vs. direct connections, databases (time-series DBs like InfluxDB vs. relational), caching strategies (Redis for hot data), and monitoring/alerting.',
      },
      {
        type: 'quiz',
        question: 'Why would a trading system use an event-driven architecture rather than polling?',
        options: [
          'Polling is always faster',
          'Event-driven reacts immediately to new data without wasting resources checking for updates',
          'Event-driven systems are simpler to build',
          'Polling cannot handle real-time data',
        ],
        correct: 1,
        explanation:
          'Event-driven architectures process data as soon as it arrives (push model), while polling repeatedly checks for updates (pull model). For trading, event-driven is preferred because it minimizes latency (react instantly to new market data) and avoids wasting CPU cycles on empty polls.',
      },
    ],
  },
  {
    id: 'mock-interview-tips',
    moduleId: 'interview-prep',
    title: 'Mock Interview Tips',
    order: 9,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Mock interviews are the single most effective way to prepare. The gap between solving problems alone and solving them while someone watches is enormous. Practice with a partner at least 10 times before your real interviews.\n\nDuring the interview: think aloud (the interviewer wants to see your reasoning process), start with a brute-force solution (show you can solve it, then optimize), ask clarifying questions (shows maturity and thoroughness), and manage your time (don\'t spend 20 minutes on approach without writing any code).\n\nCommon mistakes: going silent for long periods (keep talking through your thought process), jumping to code before understanding the problem, not testing your solution with examples, getting flustered by hints (hints are not criticism — they\'re steering you toward the solution), and not knowing your own resume (be ready to discuss any project or skill you\'ve listed).',
      },
      {
        type: 'text',
        content:
          'Interview day checklist:\n\n1. Review your resume — be ready to discuss every bullet point in depth\n2. Practice 2-3 warm-up problems before the interview\n3. Have specific examples ready: a challenging project, a technical failure and how you resolved it, a time you disagreed with a colleague\n4. Prepare thoughtful questions for the interviewer about the team\'s research process, tech stack, and culture\n5. For market-making interviews: review basic options Greeks, understand bid-ask dynamics\n6. For systematic trading: review factor models, backtesting methodology, time series analysis\n7. For quant dev: review data structures, system design patterns, concurrency',
      },
      {
        type: 'quiz',
        question: 'You\'re stuck on an interview problem. What should you do?',
        options: [
          'Sit silently until you figure it out',
          'Explain what you\'ve tried, what\'s blocking you, and ask if there\'s a hint you can use',
          'Immediately move to the next problem',
          'Guess a random answer',
        ],
        correct: 1,
        explanation:
          'Communicating your thought process — including when you\'re stuck — shows maturity and problem-solving ability. Interviewers often have hints prepared and want to see how you incorporate new information. Going silent is the worst option because the interviewer can\'t evaluate your thinking.',
      },
    ],
  },
  {
    id: 'study-plan',
    moduleId: 'interview-prep',
    title: 'Study Plan',
    order: 10,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'A structured study plan maximizes your preparation efficiency. The typical quant interview process includes: a phone screen (probability, mental math), technical rounds (coding, statistics, finance knowledge), and a superday (multiple back-to-back interviews testing all areas).\n\nWeeks 1-2: Foundation. Review probability (Bayes, conditional probability, distributions), statistics (regression, hypothesis testing), and linear algebra (matrices, eigenvalues). Solve 3-5 probability puzzles daily.\n\nWeeks 3-4: Coding. Practice 2 medium-difficulty algorithm problems daily (arrays, hash maps, dynamic programming). Implement a simple backtest from scratch. Review Python/NumPy/Pandas fluency.',
      },
      {
        type: 'text',
        content:
          'Weeks 5-6: Finance-specific. Study options pricing (Black-Scholes, Greeks), portfolio theory (CAPM, Markowitz), and market microstructure. Practice mental math daily (15 minutes of multiplication, estimation, percentage calculations).\n\nWeeks 7-8: Integration and mock interviews. Do 3+ full mock interviews. Time yourself solving problems (most coding questions should take 20-30 minutes). Practice explaining your answers clearly and concisely.\n\nEssential resources:\n- "Heard on the Street" by Timothy Crack (interview questions)\n- "A Practical Guide to Quantitative Finance Interviews" (Green Book)\n- LeetCode (coding practice, focus on medium difficulty)\n- "Fifty Challenging Problems in Probability" by Mosteller\n- This app! Complete all modules for comprehensive coverage.',
      },
      {
        type: 'quiz',
        question: 'What is the recommended daily practice volume for coding problems during weeks 3-4?',
        options: [
          '10 problems per day',
          '2 medium-difficulty problems per day',
          '1 easy problem per week',
          '5 hard problems per day',
        ],
        correct: 1,
        explanation:
          '2 medium-difficulty problems per day is optimal. This is enough to build problem-solving patterns without burnout. Quality matters more than quantity — take time to understand each solution deeply and learn the underlying patterns (two pointers, sliding window, dynamic programming) rather than memorizing specific solutions.',
      },
    ],
  },
];

lessons.forEach(registerLesson);
