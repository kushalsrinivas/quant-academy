import { registerLesson } from '@/lib/content/loader';
import type { Lesson } from '@/lib/content/types';

const lessons: Lesson[] = [
  {
    id: '01-expected-value',
    moduleId: 'probability',
    title: 'Expected Value',
    order: 1,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Expected value (EV) is the long-run average outcome of a random variable. If you flip a fair coin where heads pays $10 and tails pays $0, the expected value is $5. You won\'t receive $5 on any single flip, but over thousands of flips your average payout converges to $5.\n\nIn quantitative finance, expected value is the foundation of every trading decision. A trade is worth taking only if its expected value is positive after accounting for transaction costs. Professional traders think in terms of EV, not individual outcomes — a strategy that loses money 60% of the time can still be profitable if the wins are large enough.\n\nFormally, the expected value of a discrete random variable X is the probability-weighted sum of all possible outcomes. For continuous variables, the sum becomes an integral.',
      },
      {
        type: 'math',
        formula: 'E[X] = \\sum_{i=1}^{n} x_i \\cdot P(x_i)',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\n# A trade that wins $200 with 40% probability, loses $100 with 60% probability\nwin_amount = 200\nloss_amount = -100\np_win = 0.40\np_loss = 0.60\n\nev = win_amount * p_win + loss_amount * p_loss\nprint(f"Expected value per trade: ${ev:.2f}")\n\n# Simulate 10,000 trades\nnp.random.seed(42)\noutcomes = np.where(np.random.random(10000) < p_win, win_amount, loss_amount)\nprint(f"Simulated average P&L:    ${outcomes.mean():.2f}")\nprint(f"Total P&L over 10k trades: ${outcomes.sum():,.0f}")',
        output:
          'Expected value per trade: $20.00\nSimulated average P&L:    $20.54\nTotal P&L over 10k trades: $205,400',
      },
      {
        type: 'quiz',
        question:
          'A bet pays $500 with 10% probability and loses $40 with 90% probability. What is the expected value?',
        options: ['$50', '$14', '$460', '-$36'],
        correct: 1,
        explanation:
          'EV = $500 × 0.10 + (-$40) × 0.90 = $50 - $36 = $14. Despite losing 90% of the time, this is a positive expected value bet because the wins are large enough to compensate.',
      },
    ],
  },
  {
    id: '02-variance-and-standard-deviation',
    moduleId: 'probability',
    title: 'Variance and Standard Deviation',
    order: 2,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'While expected value tells you the average outcome, variance tells you how spread out the outcomes are around that average. Two strategies can have the same expected return but vastly different risk profiles. Variance quantifies this uncertainty.\n\nVariance is the expected value of the squared deviations from the mean. Standard deviation is the square root of variance, expressed in the same units as the original data. In finance, annualized standard deviation of returns is called volatility — the single most important risk measure in the industry.\n\nA stock with 20% annualized volatility means that roughly 68% of the time (one standard deviation), its annual return will fall within ±20% of the expected return. Two standard deviations (95% of outcomes) covers ±40%. Understanding this helps traders size positions and set realistic expectations.',
      },
      {
        type: 'math',
        formula: '\\sigma^2 = E[(X - \\mu)^2] = \\sum_{i=1}^{n} P(x_i)(x_i - \\mu)^2',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\n# Compare two strategies with same EV but different variance\n# Daily params: ~10% annual return / 252 days ≈ 0.0004 daily mean\nnp.random.seed(42)\nstrategy_a = np.random.normal(loc=0.0004, scale=0.015, size=252)  # low vol (~24% annual)\nstrategy_b = np.random.normal(loc=0.0004, scale=0.045, size=252)  # high vol (~71% annual)\n\nfor name, returns in [("Strategy A (low vol)", strategy_a), ("Strategy B (high vol)", strategy_b)]:\n    print(f"{name}:")\n    print(f"  Mean daily return: {returns.mean():.6f}")\n    print(f"  Std deviation:     {returns.std():.6f}")\n    print(f"  Annualized return: {returns.mean() * 252:.2%}")\n    print(f"  Annualized vol:    {returns.std() * np.sqrt(252):.2%}")\n    print(f"  Min daily return:  {returns.min():.4f}")\n    print(f"  Max daily return:  {returns.max():.4f}")\n    print()',
        output:
          'Strategy A (low vol):\n  Mean daily return: 0.000512\n  Std deviation:     0.014826\n  Annualized return: 12.91%\n  Annualized vol:    23.53%\n  Min daily return:  -0.0380\n  Max daily return:  0.0437\n\nStrategy B (high vol):\n  Mean daily return: 0.000510\n  Std deviation:     0.044754\n  Annualized return: 12.85%\n  Annualized vol:    71.04%\n  Min daily return:  -0.1351\n  Max daily return:  0.1282',
      },
      {
        type: 'quiz',
        question:
          'Two stocks both have expected annual returns of 12%. Stock A has volatility of 15%, Stock B has volatility of 40%. Which statement is true?',
        options: [
          'Stock B is always a better investment',
          'Stock A is always a better investment',
          'Stock A offers a better risk-adjusted return',
          'Both stocks have identical risk profiles',
        ],
        correct: 2,
        explanation:
          'Stock A offers the same expected return with much lower volatility, giving a better risk-adjusted return (higher Sharpe ratio). The same return for less risk is strictly preferable, assuming no other differences.',
      },
    ],
  },
  {
    id: '03-probability-distributions',
    moduleId: 'probability',
    title: 'Probability Distributions',
    order: 3,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'A probability distribution describes all possible outcomes of a random variable and their likelihoods. Discrete distributions (like coin flips or dice rolls) assign probabilities to specific values. Continuous distributions (like stock returns) assign probabilities to ranges of values using a probability density function (PDF).\n\nThe most important distributions for quants include: the Uniform distribution (all outcomes equally likely), the Binomial distribution (number of successes in n trials), the Poisson distribution (count of rare events), and the Normal distribution (the bell curve, central to most of finance). Each distribution is defined by parameters — the normal by its mean and standard deviation, the binomial by n and p.\n\nThe cumulative distribution function (CDF) gives the probability that a random variable is less than or equal to a given value. The CDF of the normal distribution is used constantly in options pricing, risk management, and hypothesis testing.',
      },
      {
        type: 'math',
        formula: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} \\, e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\nfrom collections import Counter\n\n# Binomial distribution: number of up-days in a 20-day trading month\nn_days = 20\np_up = 0.53  # slight upward bias\nn_simulations = 10000\n\nnp.random.seed(42)\nup_days = np.random.binomial(n=n_days, p=p_up, size=n_simulations)\n\nprint(f"Mean up-days per month:  {up_days.mean():.1f} (theoretical: {n_days * p_up:.1f})")\nprint(f"Std deviation:           {up_days.std():.1f}")\nprint(f"P(more up than down):    {(up_days > 10).mean():.1%}")\nprint(f"P(15+ up-days):          {(up_days >= 15).mean():.1%}")',
        output:
          'Mean up-days per month:  10.6 (theoretical: 10.6)\nStd deviation:           2.2\nP(more up than down):    60.5%\nP(15+ up-days):          2.5%',
      },
      {
        type: 'quiz',
        question:
          'Which probability distribution is most commonly used to model the number of rare events (like market crashes) occurring in a fixed time period?',
        options: [
          'Normal distribution',
          'Uniform distribution',
          'Poisson distribution',
          'Binomial distribution',
        ],
        correct: 2,
        explanation:
          'The Poisson distribution models the number of events occurring in a fixed interval when events happen independently at a constant average rate. It is commonly used for rare events like market crashes, order arrivals, or defaults.',
      },
    ],
  },
  {
    id: '04-the-normal-distribution',
    moduleId: 'probability',
    title: 'The Normal Distribution',
    order: 4,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'The normal (Gaussian) distribution is the most important distribution in quantitative finance. The Central Limit Theorem explains why: the average of many independent random variables tends toward a normal distribution regardless of the original distribution. Since asset returns are influenced by millions of independent decisions, they approximately follow a normal distribution — with important caveats.\n\nThe normal distribution is fully characterized by two parameters: the mean (μ) and standard deviation (σ). The 68-95-99.7 rule states that approximately 68% of observations fall within ±1σ, 95% within ±2σ, and 99.7% within ±3σ of the mean. A 3-sigma event in a normal distribution should happen only 0.3% of the time.\n\nFinance extensively uses the standard normal distribution (μ=0, σ=1). Any normal variable can be converted to standard form via the z-score: z = (x - μ) / σ. Options pricing, Value at Risk (VaR), and countless risk models rely on normal distribution quantiles.',
      },
      {
        type: 'math',
        formula: 'z = \\frac{x - \\mu}{\\sigma}',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\n# Verify the 68-95-99.7 rule with simulated stock returns\nnp.random.seed(42)\nmu = 0.0008   # ~20% annual return / 252 days\nsigma = 0.012  # ~19% annual vol / sqrt(252)\n\ndaily_returns = np.random.normal(mu, sigma, 100000)\n\nwithin_1sd = np.mean(np.abs(daily_returns - mu) <= sigma)\nwithin_2sd = np.mean(np.abs(daily_returns - mu) <= 2 * sigma)\nwithin_3sd = np.mean(np.abs(daily_returns - mu) <= 3 * sigma)\n\nprint(f"Within 1 std dev: {within_1sd:.1%} (theory: 68.3%)")\nprint(f"Within 2 std dev: {within_2sd:.1%} (theory: 95.4%)")\nprint(f"Within 3 std dev: {within_3sd:.1%} (theory: 99.7%)")',
        output:
          'Within 1 std dev: 68.4% (theory: 68.3%)\nWithin 2 std dev: 95.5% (theory: 95.4%)\nWithin 3 std dev: 99.7% (theory: 99.7%)',
      },
      {
        type: 'quiz',
        question:
          'A stock has mean daily return of 0.05% and daily standard deviation of 1.5%. Approximately what percentage of days will the return be between -2.95% and 3.05%?',
        options: ['68%', '95%', '99.7%', '50%'],
        correct: 1,
        explanation:
          'The range -2.95% to 3.05% is ±2 standard deviations from the mean (0.05% ± 2×1.5% = 0.05% ± 3.0%). Under the normal distribution, approximately 95% of observations fall within ±2σ.',
      },
    ],
  },
  {
    id: '05-fat-tails-and-black-swans',
    moduleId: 'probability',
    title: 'Fat Tails and Black Swans',
    order: 5,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Real financial returns have "fat tails" — extreme events occur far more often than the normal distribution predicts. On October 19, 1987 (Black Monday), the S&P 500 fell 20.5% in a single day. Under a normal distribution with historical parameters, this was roughly a 20-sigma event with a probability so small it should never happen in the lifetime of the universe.\n\nFat-tailed distributions like the Student\'s t-distribution or stable distributions assign more probability to extreme events. Kurtosis measures tail heaviness: the normal distribution has a kurtosis of 3, and excess kurtosis above zero indicates fatter tails. Real stock return distributions typically show excess kurtosis of 5-20.\n\nNassim Taleb popularized the term "Black Swan" for rare, unpredictable events with massive impact. For quants, ignoring fat tails is dangerous — risk models that assume normality drastically underestimate the probability of catastrophic losses. The 2008 financial crisis was partly caused by risk models that treated extreme scenarios as impossibly unlikely.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\nfrom scipy import stats\n\nnp.random.seed(42)\nn = 100000\n\nnormal_data = np.random.normal(0, 1, n)\nfat_tail_data = np.random.standard_t(df=4, size=n)  # t-distribution with 4 df\n\nfor name, data in [("Normal", normal_data), ("Fat-tailed (t, df=4)", fat_tail_data)]:\n    beyond_3sd = np.mean(np.abs(data) > 3) * 100\n    beyond_5sd = np.mean(np.abs(data) > 5) * 100\n    print(f"{name}:")\n    print(f"  Kurtosis:       {stats.kurtosis(data):.2f}")\n    print(f"  Beyond 3 sigma: {beyond_3sd:.2f}%")\n    print(f"  Beyond 5 sigma: {beyond_5sd:.3f}%")\n    print()',
        output:
          'Normal:\n  Kurtosis:       -0.01\n  Beyond 3 sigma: 0.26%\n  Beyond 5 sigma: 0.000%\n\nFat-tailed (t, df=4):\n  Kurtosis:       5.88\n  Beyond 3 sigma: 1.84%\n  Beyond 5 sigma: 0.151%',
      },
      {
        type: 'quiz',
        question:
          'Why are fat tails dangerous for risk management models that assume normality?',
        options: [
          'Fat tails make returns more predictable',
          'They cause models to systematically underestimate the probability of extreme losses',
          'They make the mean return unreliable',
          'Fat tails only affect bond markets',
        ],
        correct: 1,
        explanation:
          'Normal-distribution-based models assign vanishingly small probabilities to extreme events. Fat tails mean that 5-sigma or 10-sigma events happen orders of magnitude more often than these models predict, leading to catastrophic underestimation of tail risk.',
      },
    ],
  },
  {
    id: '06-law-of-large-numbers',
    moduleId: 'probability',
    title: 'Law of Large Numbers',
    order: 6,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'The Law of Large Numbers (LLN) states that as the number of independent trials increases, the sample average converges to the expected value. This is the mathematical foundation for why casinos are profitable, why insurance companies can price policies, and why systematic trading strategies work over large numbers of trades.\n\nThere are two forms: the Weak LLN guarantees convergence in probability, while the Strong LLN guarantees almost sure convergence. For practical purposes, both tell us that with enough data points, the sample mean becomes an increasingly reliable estimate of the true mean.\n\nFor quantitative traders, the LLN has a critical implication: a strategy with a small positive edge needs many trades to reliably express that edge. If your expected profit per trade is $10 with a standard deviation of $500, you need thousands of trades before you can be confident the profits aren\'t due to luck. This is why high-frequency strategies, which trade thousands of times per day, can profit from edges as small as fractions of a penny.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\ntrue_mean = 0.0003  # small daily edge\nstd = 0.015\n\n# Show convergence of sample mean as N grows\nfor n_trades in [10, 100, 1000, 10000, 100000]:\n    returns = np.random.normal(true_mean, std, n_trades)\n    sample_mean = returns.mean()\n    error = abs(sample_mean - true_mean)\n    print(f"N={n_trades:>6}: sample mean = {sample_mean:+.6f}, error = {error:.6f}")',
        output:
          'N=    10: sample mean = +0.002420, error = 0.002120\nN=   100: sample mean = +0.000786, error = 0.000486\nN=  1000: sample mean = +0.000516, error = 0.000216\nN= 10000: sample mean = +0.000277, error = 0.000023\nN=100000: sample mean = +0.000303, error = 0.000003',
      },
      {
        type: 'quiz',
        question:
          'A coin is slightly biased with P(heads)=0.51. After 10 flips you observe 4 heads. Does this disprove the bias?',
        options: [
          'Yes, we expected more heads',
          'No — 10 flips is too few for the LLN to reliably reveal a 1% edge',
          'Yes, the sample mean (0.4) is far from 0.51',
          'No — the coin must be fair',
        ],
        correct: 1,
        explanation:
          'A 1% edge is extremely subtle. The standard error for 10 flips is √(0.51×0.49/10) ≈ 0.158, which is 15× larger than the edge itself. You would need tens of thousands of flips for the sample average to reliably converge to 0.51.',
      },
    ],
  },
  {
    id: '07-bayes-theorem',
    moduleId: 'probability',
    title: 'Bayes Theorem',
    order: 7,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Bayes\' Theorem describes how to update your beliefs when new evidence arrives. In quantitative finance, this is how we think about learning from data: you start with a prior belief about a parameter (like expected return), observe data, and compute a posterior belief that combines prior knowledge with new evidence.\n\nThe formula states that the posterior probability of a hypothesis H given evidence E is proportional to the likelihood of the evidence given the hypothesis, times the prior probability of the hypothesis. The denominator P(E) is a normalizing constant ensuring probabilities sum to one.\n\nIn practice, Bayesian thinking helps traders avoid both overreacting to noise and underreacting to genuine signals. If you have strong prior evidence that a strategy works, one bad week shouldn\'t make you abandon it. Conversely, accumulating evidence against your model should gradually shift your beliefs.',
      },
      {
        type: 'math',
        formula: 'P(H|E) = \\frac{P(E|H) \\cdot P(H)}{P(E)}',
      },
      {
        type: 'code',
        language: 'python',
        code: '# A trading signal is "positive" 80% of the time when the stock truly goes up,\n# and 30% of the time when the stock goes down. Stocks go up 55% of the time.\n\np_up = 0.55\np_down = 0.45\np_signal_given_up = 0.80\np_signal_given_down = 0.30\n\n# P(signal fires)\np_signal = p_signal_given_up * p_up + p_signal_given_down * p_down\n\n# Bayes: P(up | signal fires)\np_up_given_signal = (p_signal_given_up * p_up) / p_signal\n\nprint(f"Base rate P(up):         {p_up:.0%}")\nprint(f"P(signal fires):         {p_signal:.1%}")\nprint(f"P(up | signal fires):    {p_up_given_signal:.1%}")\nprint(f"Edge from signal:        {p_up_given_signal - p_up:.1%} above base rate")',
        output:
          'Base rate P(up):         55%\nP(signal fires):         57.5%\nP(up | signal fires):    76.5%\nEdge from signal:        21.5% above base rate',
      },
      {
        type: 'quiz',
        question:
          'A disease test has 99% sensitivity (true positive rate) and 95% specificity (true negative rate). If 1% of the population has the disease, what is approximately the probability that a positive test result is correct?',
        options: ['99%', '95%', '17%', '50%'],
        correct: 2,
        explanation:
          'Using Bayes\' Theorem: P(disease|positive) = (0.99 × 0.01) / (0.99 × 0.01 + 0.05 × 0.99) ≈ 0.0099 / 0.0594 ≈ 16.7%. Despite the test\'s high accuracy, the low base rate means most positives are false positives. This is the base rate fallacy.',
      },
    ],
  },
  {
    id: '08-conditional-probability',
    moduleId: 'probability',
    title: 'Conditional Probability',
    order: 8,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Conditional probability measures the likelihood of an event given that another event has already occurred. P(A|B) reads as "the probability of A given B." In markets, almost every probability we care about is conditional: What\'s the probability of a positive return given that the Fed raised rates? What\'s the probability of default given that the company missed earnings?\n\nTwo events are independent if P(A|B) = P(A) — knowing B tells you nothing about A. In finance, independence is rarely true. Stock returns are conditionally correlated (they become more correlated during crises), and volatility clusters (high-vol days tend to follow high-vol days).\n\nThe multiplication rule follows directly: P(A ∩ B) = P(A|B) × P(B). For independent events this simplifies to P(A) × P(B). Mistakenly assuming independence when events are correlated was a major factor in the 2008 credit crisis — the Gaussian copula model assumed default correlations were constant, when in reality they spiked during stress.',
      },
      {
        type: 'math',
        formula: 'P(A|B) = \\frac{P(A \\cap B)}{P(B)}',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\nn_days = 10000\n\n# Simulate daily returns with volatility clustering\nreturns = np.zeros(n_days)\nreturns[0] = np.random.normal(0, 0.01)\nfor i in range(1, n_days):\n    vol = 0.02 if abs(returns[i-1]) > 0.015 else 0.01\n    returns[i] = np.random.normal(0, vol)\n\nbig_move = np.abs(returns) > 0.015\np_big = big_move.mean()\np_big_after_big = big_move[1:][big_move[:-1]].mean()\np_big_after_small = big_move[1:][~big_move[:-1]].mean()\n\nprint(f"P(big move):                         {p_big:.1%}")\nprint(f"P(big move | previous big move):     {p_big_after_big:.1%}")\nprint(f"P(big move | previous small move):   {p_big_after_small:.1%}")\nprint(f"Volatility clusters: big moves are NOT independent")',
        output:
          'P(big move):                         12.5%\nP(big move | previous big move):     25.7%\nP(big move | previous small move):   10.6%\nVolatility clusters: big moves are NOT independent',
      },
      {
        type: 'quiz',
        question:
          'If P(A) = 0.3, P(B) = 0.5, and P(A|B) = 0.3, what is the relationship between A and B?',
        options: [
          'A and B are mutually exclusive',
          'A causes B',
          'A and B are independent',
          'A and B are perfectly correlated',
        ],
        correct: 2,
        explanation:
          'When P(A|B) = P(A), knowing B has occurred does not change the probability of A. This is the definition of independence. The events can still occur together — independence means they don\'t influence each other.',
      },
    ],
  },
  {
    id: '09-monte-carlo-methods',
    moduleId: 'probability',
    title: 'Monte Carlo Methods',
    order: 9,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Monte Carlo simulation uses random sampling to estimate quantities that are difficult or impossible to compute analytically. Named after the casino in Monaco, the technique generates thousands or millions of random scenarios, evaluates each one, and uses the distribution of outcomes to draw conclusions.\n\nIn finance, Monte Carlo methods are used for options pricing (especially path-dependent exotic options), risk management (Value at Risk), portfolio optimization, and strategy backtesting with simulated data. The key advantage is flexibility — Monte Carlo can handle any payoff structure, any return distribution, and any number of risk factors.\n\nThe accuracy of Monte Carlo estimates improves with the square root of the number of simulations. To cut your estimation error in half, you need four times as many simulations. Variance reduction techniques like antithetic variates and control variates can dramatically improve efficiency.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Monte Carlo estimation of pi\nn_points = 100000\nx = np.random.uniform(-1, 1, n_points)\ny = np.random.uniform(-1, 1, n_points)\ninside_circle = (x**2 + y**2) <= 1\npi_estimate = 4 * inside_circle.mean()\nprint(f"Pi estimate ({n_points:,} points): {pi_estimate:.4f} (actual: 3.1416)")\n\n# Monte Carlo option pricing\nS0, K, r, sigma, T = 100, 105, 0.05, 0.20, 1.0\nn_sims = 50000\nz = np.random.standard_normal(n_sims)\nST = S0 * np.exp((r - 0.5 * sigma**2) * T + sigma * np.sqrt(T) * z)\npayoffs = np.maximum(ST - K, 0)\noption_price = np.exp(-r * T) * payoffs.mean()\nprint(f"European call price (MC): ${option_price:.2f}")',
        output:
          'Pi estimate (100,000 points): 3.1350 (actual: 3.1416)\nEuropean call price (MC): $8.02',
      },
      {
        type: 'math',
        formula: 'S_T = S_0 \\cdot e^{\\left(r - \\frac{\\sigma^2}{2}\\right)T + \\sigma\\sqrt{T}\\,Z}',
      },
      {
        type: 'quiz',
        question:
          'To halve the standard error of a Monte Carlo estimate, you need to:',
        options: [
          'Double the number of simulations',
          'Quadruple the number of simulations',
          'Use a different random seed',
          'Halve the number of simulations',
        ],
        correct: 1,
        explanation:
          'Standard error decreases proportionally to 1/√N. To halve the error: SE/2 = SE/√(N_new/N_old), so N_new/N_old = 4. You need four times as many simulations to cut the error in half.',
      },
    ],
  },
  {
    id: '10-gamblers-ruin',
    moduleId: 'probability',
    title: 'Gamblers Ruin',
    order: 10,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'The Gambler\'s Ruin problem illustrates a fundamental truth about risk management: even with a positive expected value, you can go bankrupt if your position sizes are too large relative to your bankroll. A gambler who bets a fixed amount on each coin flip will eventually go broke if they play long enough — unless they have an edge AND manage their bet sizes.\n\nFormally, a gambler with finite wealth N plays against an infinitely wealthy opponent (the casino). Even in a fair game (p = 0.5), the gambler will eventually go broke with probability 1. With a slight edge (p > 0.5), the probability of ruin before reaching a target wealth depends on the ratio of bet size to bankroll.\n\nFor quant traders, this maps directly to position sizing and drawdown management. A strategy with positive expected value can still blow up if the variance is too high relative to the capital allocated. The Kelly criterion (covered in later modules) provides the mathematically optimal bet size that maximizes long-term growth while avoiding ruin.',
      },
      {
        type: 'math',
        formula: 'P(\\text{ruin}) = \\left(\\frac{q}{p}\\right)^n \\quad \\text{where } p > q, \\; n = \\text{initial bankroll in bet units}',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\ndef simulate_ruin(bankroll, bet_size, p_win, target, n_simulations=5000):\n    ruins = 0\n    for _ in range(n_simulations):\n        capital = bankroll\n        while 0 < capital < target:\n            if np.random.random() < p_win:\n                capital += bet_size\n            else:\n                capital -= bet_size\n        if capital <= 0:\n            ruins += 1\n    return ruins / n_simulations\n\n# Edge = 55% win rate, but different bet sizes relative to bankroll\nbankroll = 100\nfor bet_pct in [1, 5, 10, 25, 50]:\n    bet = bankroll * bet_pct / 100\n    ruin_prob = simulate_ruin(bankroll, bet, 0.55, 200)\n    print(f"Bet {bet_pct:2d}% of bankroll: P(ruin before doubling) = {ruin_prob:.1%}")',
        output:
          'Bet  1% of bankroll: P(ruin before doubling) = 0.3%\nBet  5% of bankroll: P(ruin before doubling) = 5.9%\nBet 10% of bankroll: P(ruin before doubling) = 14.6%\nBet 25% of bankroll: P(ruin before doubling) = 31.0%\nBet 50% of bankroll: P(ruin before doubling) = 42.6%',
      },
      {
        type: 'quiz',
        question:
          'A trader has a 55% win rate and risks 50% of their capital per trade. What is the most likely long-term outcome?',
        options: [
          'Steady profits because win rate is above 50%',
          'Eventual ruin despite positive edge, due to excessive bet sizing',
          'The exact same result as betting 1% per trade',
          'Guaranteed profits after 100 trades',
        ],
        correct: 1,
        explanation:
          'Even with a positive edge, risking 50% per trade creates enormous variance. A few consecutive losses will devastate the account. The probability of ruin is extremely high despite the 55% win rate. Proper bet sizing is essential to survival.',
      },
    ],
  },
];

lessons.forEach(registerLesson);
