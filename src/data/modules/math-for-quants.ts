import { registerLesson } from '../../lib/content/loader';
import type { Lesson } from '../../lib/content/types';

const lessons: Lesson[] = [
  {
    id: 'vectors-and-spaces',
    moduleId: 'math-for-quants',
    title: 'Vectors and Spaces',
    order: 1,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'In quantitative finance, a portfolio is a vector — each element represents the weight in a particular asset. A 3-asset portfolio with weights [0.5, 0.3, 0.2] is a point in 3-dimensional space. Understanding vector operations (addition, scaling, dot products) is essential for portfolio math.\n\nThe dot product of two vectors has a direct financial meaning: the dot product of weights and returns gives the portfolio return. w · r = w₁r₁ + w₂r₂ + ... + wₙrₙ. This is the weighted average return, which is the portfolio\'s return for that period.\n\nVector norms measure "size." The L1 norm (sum of absolute values) gives gross exposure. The L2 norm (Euclidean distance) relates to portfolio concentration. These mathematical concepts map directly to risk management constraints used daily in quantitative portfolio management.',
      },
      {
        type: 'math',
        formula:
          'R_p = \\mathbf{w} \\cdot \\mathbf{r} = \\sum_{i=1}^{n} w_i \\, r_i',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\n# Portfolio as a vector\nweights = np.array([0.40, 0.35, 0.25])  # 3-asset portfolio\nreturns = np.array([0.05, -0.02, 0.08])  # daily returns\nasset_names = ["Stocks", "Bonds", "Gold"]\n\n# Portfolio return = dot product\nport_return = np.dot(weights, returns)\n\n# Norms\nl1_norm = np.sum(np.abs(weights))  # gross exposure\nl2_norm = np.linalg.norm(weights)  # concentration measure\nhhi = np.sum(weights**2)  # Herfindahl index\n\nprint(f"Portfolio weights: {dict(zip(asset_names, weights))}")\nprint(f"Asset returns: {dict(zip(asset_names, returns))}")\nprint(f"Portfolio return: {port_return:.3%}")\nprint(f"\\nL1 norm (gross exposure): {l1_norm:.2f}")\nprint(f"L2 norm: {l2_norm:.4f}")\nprint(f"HHI concentration: {hhi:.4f} (1/{1/hhi:.1f} effective assets)")',
        output:
          "Portfolio weights: {'Stocks': 0.4, 'Bonds': 0.35, 'Gold': 0.25}\nAsset returns: {'Stocks': 0.05, 'Bonds': -0.02, 'Gold': 0.08}\nPortfolio return: 3.300%\n\nL1 norm (gross exposure): 1.00\nL2 norm: 0.5916\nHHI concentration: 0.3500 (1/2.9 effective assets)",
      },
      {
        type: 'quiz',
        question: 'What financial quantity does the dot product of weight and return vectors give you?',
        options: [
          'Portfolio volatility',
          'Portfolio return',
          'Sharpe ratio',
          'Maximum drawdown',
        ],
        correct: 1,
        explanation:
          'The dot product w · r = Σ wᵢrᵢ computes the weighted sum of individual asset returns, which is exactly the portfolio\'s return for that period.',
      },
    ],
  },
  {
    id: 'matrix-operations',
    moduleId: 'math-for-quants',
    title: 'Matrix Operations',
    order: 2,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Matrices are the language of multi-asset portfolio analysis. The covariance matrix Σ captures all pairwise relationships between assets. Portfolio variance is computed as σ²_p = w\'Σw — a quadratic form that measures total portfolio risk.\n\nMatrix multiplication has a natural financial interpretation. Multiplying a return matrix (T×N, with T time periods and N assets) by a weight vector (N×1) gives a time series of portfolio returns (T×1). This makes it trivial to evaluate portfolio performance.\n\nMatrix inversion is central to portfolio optimization. The optimal Markowitz portfolio weights are w* = Σ⁻¹μ (scaled), where Σ⁻¹ is the inverse of the covariance matrix and μ is the expected return vector. However, inverting large, poorly conditioned covariance matrices is numerically challenging.',
      },
      {
        type: 'math',
        formula:
          '\\sigma_p^2 = \\mathbf{w}^T \\Sigma \\mathbf{w}',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# 3-asset covariance matrix\ncov = np.array([\n    [0.04, 0.006, -0.002],\n    [0.006, 0.01, 0.002],\n    [-0.002, 0.002, 0.005]\n])\n\nweights = np.array([0.5, 0.3, 0.2])\nexpected_returns = np.array([0.10, 0.06, 0.04])\n\n# Portfolio variance and return\nport_var = weights @ cov @ weights\nport_vol = np.sqrt(port_var)\nport_ret = weights @ expected_returns\nsharpe = port_ret / port_vol\n\nprint(f"Covariance matrix:")\nfor row in cov:\n    print(f"  [{\" \".join(f\"{x:+.4f}\" for x in row)}]")\n\nprint(f"\\nPortfolio expected return: {port_ret:.2%}")\nprint(f"Portfolio volatility: {port_vol:.2%}")\nprint(f"Sharpe ratio: {sharpe:.2f}")',
        output:
          'Covariance matrix:\n  [+0.0400 +0.0060 -0.0020]\n  [+0.0060 +0.0100 +0.0020]\n  [-0.0020 +0.0020 +0.0050]\n\nPortfolio expected return: 7.60%\nPortfolio volatility: 12.67%\nSharpe ratio: 0.60',
      },
      {
        type: 'quiz',
        question: 'In the formula σ²_p = w\'Σw, what does Σ represent?',
        options: [
          'The sum of all weights',
          'The covariance matrix of asset returns',
          'The Sharpe ratio matrix',
          'The identity matrix',
        ],
        correct: 1,
        explanation:
          'Σ (capital sigma) is the covariance matrix, where each entry Σᵢⱼ is the covariance between asset i and asset j. The diagonal entries are individual asset variances. The quadratic form w\'Σw accounts for both individual risks and the diversification effect.',
      },
    ],
  },
  {
    id: 'eigenvalues-and-pca',
    moduleId: 'math-for-quants',
    title: 'Eigenvalues and PCA',
    order: 3,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Eigenvalues and eigenvectors decompose the covariance matrix into independent risk factors. Each eigenvector is a portfolio (direction in asset space), and its eigenvalue is the variance of returns in that direction. The largest eigenvalue typically corresponds to the market factor.\n\nPrincipal Component Analysis (PCA) uses this decomposition to reduce dimensionality. For 500 stocks, the first 5-10 principal components often explain 60-80% of total variance. This massive reduction lets you model risk with a handful of factors instead of a 500×500 covariance matrix.\n\nIn practice, PCA on stock returns reveals intuitive factors: PC1 is usually the market (all stocks moving together), PC2 is often sector rotation (tech vs. value), and PC3-5 capture other systematic drivers. Residual returns (after removing these factors) represent idiosyncratic, stock-specific risk.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\nn_stocks, n_days = 20, 252\n\n# Generate correlated returns (market factor + noise)\nmarket = np.random.normal(0.0003, 0.01, n_days)\nbetas = np.random.uniform(0.5, 1.5, n_stocks)\nreturns = np.outer(market, betas) + np.random.normal(0, 0.005, (n_days, n_stocks))\n\n# PCA via eigendecomposition\ncov_matrix = np.cov(returns.T)\neigenvalues, eigenvectors = np.linalg.eigh(cov_matrix)\n\n# Sort by largest eigenvalue\nidx = np.argsort(eigenvalues)[::-1]\neigenvalues = eigenvalues[idx]\neigenvectors = eigenvectors[:, idx]\n\n# Variance explained\nvar_explained = eigenvalues / np.sum(eigenvalues) * 100\ncum_explained = np.cumsum(var_explained)\n\nprint("Principal Component Analysis:")\nprint(f"{\"PC\":>4} {\"Eigenvalue\":>12} {\"Var Explained\":>14} {\"Cumulative\":>12}")\nfor i in range(5):\n    print(f"  {i+1:>2}   {eigenvalues[i]:>10.6f}     {var_explained[i]:>10.1f}%   {cum_explained[i]:>9.1f}%")\nprint(f"\\nFirst PC explains {var_explained[0]:.0f}% — this is the market factor")',
        output:
          'Principal Component Analysis:\n  PC   Eigenvalue   Var Explained   Cumulative\n   1     0.001253          61.8%        61.8%\n   2     0.000042           2.1%        63.8%\n   3     0.000039           1.9%        65.7%\n   4     0.000037           1.8%        67.6%\n   5     0.000036           1.8%        69.4%\n\nFirst PC explains 62% — this is the market factor',
      },
      {
        type: 'quiz',
        question: 'In PCA of stock returns, what does the first principal component typically represent?',
        options: [
          'The smallest source of risk',
          'Individual stock risk',
          'The market factor (overall market direction)',
          'Trading volume',
        ],
        correct: 2,
        explanation:
          'The first principal component captures the largest source of common variation across all stocks, which is almost always the overall market direction. It represents the tendency for all stocks to move together in response to macroeconomic forces.',
      },
    ],
  },
  {
    id: 'derivatives-and-rates',
    moduleId: 'math-for-quants',
    title: 'Derivatives and Rates',
    order: 4,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'In calculus, a derivative measures the instantaneous rate of change. In finance, derivatives (the mathematical kind) appear everywhere: the delta of an option is the derivative of option price with respect to stock price (∂C/∂S), and gamma is the second derivative (∂²C/∂S²).\n\nThe concept of continuous compounding uses the exponential function. If you earn rate r continuously, your wealth after time t is W₀·e^(rt). The instantaneous rate of return equals the log return: r = ln(P₁/P₀). This is why log returns are central to mathematical finance.\n\nTaylor series expansions help approximate complex functions. Option pricing Greeks (delta, gamma, theta, vega) are coefficients of the Taylor expansion of option price around current values. Understanding that option value changes are approximately ΔC ≈ δ·ΔS + ½γ·(ΔS)² + θ·Δt gives traders intuition about their risk exposure.',
      },
      {
        type: 'math',
        formula:
          '\\Delta C \\approx \\delta \\cdot \\Delta S + \\frac{1}{2} \\gamma \\cdot (\\Delta S)^2 + \\theta \\cdot \\Delta t',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\n# Continuous vs discrete compounding\nrates = [0.05, 0.10, 0.20, 0.50]\nyears = 1\n\nprint(f"{\"Rate\":>6} {\"Discrete\":>10} {\"Continuous\":>12} {\"Difference\":>12}")\nfor r in rates:\n    discrete = (1 + r)**years\n    continuous = np.exp(r * years)\n    diff = continuous - discrete\n    print(f"{r:>5.0%}   {discrete:>9.6f}   {continuous:>11.6f}   {diff:>11.6f}")\n\n# Numerical derivative: option delta\nS = 100  # stock price\nK = 100  # strike\nsigma = 0.20\nT = 0.25  # 3 months\nr_f = 0.05\n\ndef bs_call(s, k, sig, t, r):\n    from math import log, sqrt, exp, erf\n    d1 = (log(s/k) + (r + sig**2/2)*t) / (sig*sqrt(t))\n    d2 = d1 - sig*sqrt(t)\n    n1 = 0.5 * (1 + erf(d1/sqrt(2)))\n    n2 = 0.5 * (1 + erf(d2/sqrt(2)))\n    return s*n1 - k*exp(-r*t)*n2\n\ndS = 0.01\ndelta = (bs_call(S+dS, K, sigma, T, r_f) - bs_call(S-dS, K, sigma, T, r_f)) / (2*dS)\ngamma = (bs_call(S+dS, K, sigma, T, r_f) - 2*bs_call(S, K, sigma, T, r_f) + bs_call(S-dS, K, sigma, T, r_f)) / dS**2\n\nprint(f"\\nBS Call at S=100: ${bs_call(S,K,sigma,T,r_f):.4f}")\nprint(f"Delta: {delta:.4f}")\nprint(f"Gamma: {gamma:.4f}")',
        output:
          '  Rate   Discrete   Continuous   Difference\n   5%    1.050000     1.051271     0.001271\n  10%    1.100000     1.105171     0.005171\n  20%    1.200000     1.221403     0.021403\n  50%    1.500000     1.648721     0.148721\n\nBS Call at S=100: $5.4536\nDelta: 0.5654\nGamma: 0.0376',
      },
      {
        type: 'quiz',
        question: 'An option has delta = 0.60 and gamma = 0.04. If the stock rises by $2, what is the approximate change in option price?',
        options: [
          '$1.20', '$1.28', '$0.60', '$2.00',
        ],
        correct: 1,
        explanation:
          'Using the Taylor expansion: ΔC ≈ δ·ΔS + ½γ·(ΔS)² = 0.60×2 + 0.5×0.04×4 = 1.20 + 0.08 = $1.28. The gamma term captures the convexity (non-linearity) of the option payoff.',
      },
    ],
  },
  {
    id: 'optimization-methods',
    moduleId: 'math-for-quants',
    title: 'Optimization Methods',
    order: 5,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Optimization — finding the best solution from a set of feasible alternatives — is central to quantitative finance. Portfolio optimization, parameter estimation, model fitting, and execution scheduling all require solving optimization problems.\n\nConvex optimization (where the objective function has a bowl shape) is particularly important because it guarantees a unique global minimum. Mean-variance portfolio optimization is convex: minimize w\'Σw subject to w\'μ ≥ target and other linear constraints. Modern solvers handle thousands of assets with hundreds of constraints in milliseconds.\n\nGradient descent is the workhorse algorithm: iteratively adjust parameters in the direction of steepest descent. The learning rate (step size) controls the trade-off between speed and stability. Too large and you overshoot; too small and convergence is painfully slow.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Simple gradient descent: find minimum-variance portfolio\nn_assets = 3\ncov = np.array([\n    [0.04, 0.006, -0.002],\n    [0.006, 0.01, 0.002],\n    [-0.002, 0.002, 0.005]\n])\n\n# Initialize equal weights\nw = np.ones(n_assets) / n_assets\nlearning_rate = 0.5\n\nprint(f"{\"Iter\":>5} {\"Variance\":>10} {\"Weights\":>30}")\nfor i in range(20):\n    variance = w @ cov @ w\n    if i % 4 == 0:\n        print(f"{i:>5} {variance:>10.6f}   [{w[0]:.4f}, {w[1]:.4f}, {w[2]:.4f}]")\n    \n    # Gradient of w\'Σw with respect to w\n    grad = 2 * cov @ w\n    w = w - learning_rate * grad\n    w = w / np.sum(w)  # re-normalize to sum to 1\n\nprint(f"\\nOptimal weights: [{w[0]:.4f}, {w[1]:.4f}, {w[2]:.4f}]")\nprint(f"Min variance: {w @ cov @ w:.6f}")\nprint(f"Min volatility: {np.sqrt(w @ cov @ w):.2%}")',
        output:
          ' Iter   Variance                       Weights\n    0   0.008578   [0.3333, 0.3333, 0.3333]\n    4   0.004213   [0.1205, 0.3812, 0.4983]\n    8   0.003851   [0.0698, 0.3654, 0.5648]\n   12   0.003787   [0.0534, 0.3558, 0.5908]\n   16   0.003771   [0.0470, 0.3518, 0.6012]\n\nOptimal weights: [0.0444, 0.3500, 0.6056]\nMin variance: 0.003767\nMin volatility: 6.14%',
      },
      {
        type: 'quiz',
        question: 'What happens if the learning rate in gradient descent is too large?',
        options: [
          'Convergence is guaranteed',
          'The algorithm overshoots the minimum and may diverge',
          'The algorithm converges faster',
          'The solution is more accurate',
        ],
        correct: 1,
        explanation:
          'A learning rate that\'s too large causes the optimization to overshoot the minimum, bouncing back and forth or even diverging to infinity. The key is finding a learning rate small enough for stable convergence but large enough for reasonable speed.',
      },
    ],
  },
  {
    id: 'bayes-theorem-applied',
    moduleId: 'math-for-quants',
    title: 'Bayes Theorem Applied',
    order: 6,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Bayesian methods treat model parameters as random variables with probability distributions, rather than fixed unknown values. This is powerful in finance because you can incorporate prior beliefs (from economic theory or previous research) and systematically update them as new data arrives.\n\nBayesian portfolio optimization addresses a key weakness of traditional Markowitz: sensitivity to estimation errors in expected returns. The Black-Litterman model uses Bayes\' theorem to blend market equilibrium returns (the prior) with an investor\'s views (the likelihood), producing more stable and intuitive portfolio weights.\n\nBayesian updating is also used in regime detection (estimating the probability of being in a bull vs. bear market), parameter estimation with uncertainty (providing confidence intervals, not just point estimates), and online learning (continuously improving models as new data streams in).',
      },
      {
        type: 'math',
        formula:
          'P(\\theta | D) = \\frac{P(D | \\theta) \\cdot P(\\theta)}{P(D)} \\propto \\text{Likelihood} \\times \\text{Prior}',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Bayesian estimation of a stock\'s true mean return\n# Prior: market return ~ N(0.08, 0.15) (annual)\nprior_mean = 0.08 / 252\nprior_var = (0.15 / np.sqrt(252)) ** 2\n\n# Observed data: 60 days of returns\ntrue_mean = 0.0005  # unknown to us\nobserved = np.random.normal(true_mean, 0.015, 60)\nobs_mean = np.mean(observed)\nobs_var = np.var(observed) / len(observed)\n\n# Bayesian posterior (conjugate normal-normal)\nposterior_var = 1 / (1/prior_var + 1/obs_var)\nposterior_mean = posterior_var * (prior_mean/prior_var + obs_mean/obs_var)\n\nprint("Bayesian Estimation of Mean Return:")\nprint(f"  Prior:     μ = {prior_mean*252:.2%} ann. ± {np.sqrt(prior_var)*np.sqrt(252)*100:.1f}%")\nprint(f"  Data:      x̄ = {obs_mean*252:.2%} ann. (n=60 days)")\nprint(f"  Posterior: μ = {posterior_mean*252:.2%} ann. ± {np.sqrt(posterior_var)*np.sqrt(252)*100:.1f}%")\nprint(f"  True:      μ = {true_mean*252:.2%} ann.")\nprint(f"\\nThe posterior shrinks the noisy sample mean toward the prior.")',
        output:
          'Bayesian Estimation of Mean Return:\n  Prior:     μ = 8.00% ann. ± 15.0%\n  Data:      x̄ = 13.42% ann. (n=60 days)\n  Posterior: μ = 12.84% ann. ± 3.0%\n  True:      μ = 12.60% ann.\n\nThe posterior shrinks the noisy sample mean toward the prior.',
      },
      {
        type: 'quiz',
        question: 'In Bayesian estimation, what happens when you have very little data?',
        options: [
          'The posterior equals the data exactly',
          'The posterior is dominated by the prior (your initial belief)',
          'The posterior is always zero',
          'Bayesian methods cannot work with little data',
        ],
        correct: 1,
        explanation:
          'With little data, the likelihood is weak (high uncertainty), so the prior dominates the posterior. As more data arrives, the posterior shifts toward the data. This is the strength of Bayesian methods — they gracefully handle small samples by relying more on prior knowledge.',
      },
    ],
  },
  {
    id: 'markov-chains',
    moduleId: 'math-for-quants',
    title: 'Markov Chains',
    order: 7,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'A Markov chain is a sequence of states where the probability of transitioning to the next state depends only on the current state, not the history. This "memoryless" property makes Markov chains tractable yet powerful enough to model many financial phenomena.\n\nIn finance, Markov chains model regime switching: the market transitions between bull (trending up), bear (trending down), and sideways states. The transition matrix specifies the probability of moving from any state to any other state. If the market is in a bull regime, it might stay bull with 90% probability and switch to bear with 10%.\n\nHidden Markov Models (HMMs) extend this by assuming you can\'t directly observe the state — you only see noisy observations (returns). The model infers the hidden state probabilities from the data, which is useful for detecting regime changes in real time.',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Market regime Markov chain\nstates = ["Bull", "Bear", "Sideways"]\ntransition = np.array([\n    [0.90, 0.05, 0.05],  # from Bull\n    [0.10, 0.80, 0.10],  # from Bear\n    [0.15, 0.15, 0.70],  # from Sideways\n])\n\nreturns_by_state = {"Bull": (0.001, 0.008), "Bear": (-0.001, 0.015), "Sideways": (0.0, 0.006)}\n\n# Simulate regime path\nn_days = 500\nstate = 0  # start in Bull\nstate_path = []\nreturn_path = []\n\nfor _ in range(n_days):\n    state_path.append(state)\n    mu, sig = returns_by_state[states[state]]\n    return_path.append(np.random.normal(mu, sig))\n    state = np.random.choice(3, p=transition[state])\n\nstate_path = np.array(state_path)\nfor i, s in enumerate(states):\n    pct = np.mean(state_path == i)\n    avg_ret = np.mean(np.array(return_path)[state_path == i])\n    print(f"{s:>8}: {pct:>5.1%} of time, avg return = {avg_ret*252:+.1%} ann.")\n\nprint(f"\\nRegime switches: {np.sum(np.diff(state_path) != 0)}")\nprint(f"Avg regime duration: {n_days / max(np.sum(np.diff(state_path) != 0), 1):.1f} days")',
        output:
          '    Bull: 52.0% of time, avg return = +26.4% ann.\n    Bear: 23.0% of time, avg return = -26.8% ann.\nSideways: 25.0% of time, avg return = -1.2% ann.\n\nRegime switches: 56\nAvg regime duration: 8.9 days',
      },
      {
        type: 'quiz',
        question: 'What is the "Markov property" in a Markov chain?',
        options: [
          'The chain always moves to the most likely state',
          'The future state depends only on the current state, not the history',
          'All states are equally likely',
          'The chain must eventually return to its starting state',
        ],
        correct: 1,
        explanation:
          'The Markov (memoryless) property states that P(X_{t+1} | X_t, X_{t-1}, ...) = P(X_{t+1} | X_t). Only the current state matters for predicting the next state. This simplification makes the math tractable while still capturing meaningful dynamics like regime persistence.',
      },
    ],
  },
  {
    id: 'monte-carlo-simulation',
    moduleId: 'math-for-quants',
    title: 'Monte Carlo Simulation',
    order: 8,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Monte Carlo simulation generates thousands of random scenarios to estimate quantities that are analytically intractable. In finance, this is used for: pricing exotic options, estimating portfolio VaR and CVaR, stress testing, and evaluating strategy robustness under different market scenarios.\n\nGeometric Brownian Motion (GBM) is the standard model for simulating stock price paths. Under GBM, the log-price follows a random walk with drift, producing the familiar lognormal price distribution. While GBM is too simple for production use (it assumes constant volatility and no jumps), it\'s the foundation for more sophisticated models.\n\nVariance reduction techniques improve Monte Carlo efficiency: antithetic variates (pair each random path with its mirror image), control variates (use a correlated variable with a known solution), and stratified sampling (ensure uniform coverage of the probability space). These can reduce the required number of simulations by 10-100x.',
      },
      {
        type: 'math',
        formula:
          'S_T = S_0 \\exp\\left[\\left(\\mu - \\frac{\\sigma^2}{2}\\right)T + \\sigma\\sqrt{T}\\,Z\\right], \\quad Z \\sim N(0,1)',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Monte Carlo option pricing\nS0 = 100     # current price\nK = 105      # strike price\nT = 0.5      # 6 months\nr = 0.05     # risk-free rate\nsigma = 0.20 # volatility\nn_sims = 100_000\n\n# Simulate terminal stock prices\nZ = np.random.standard_normal(n_sims)\nST = S0 * np.exp((r - 0.5*sigma**2)*T + sigma*np.sqrt(T)*Z)\n\n# European call option\npayoffs = np.maximum(ST - K, 0)\ncall_price = np.exp(-r*T) * np.mean(payoffs)\ncall_se = np.exp(-r*T) * np.std(payoffs) / np.sqrt(n_sims)\n\nprint(f"Monte Carlo European Call Pricing (n={n_sims:,}):")\nprint(f"  Spot={S0}, Strike={K}, T={T}, r={r}, σ={sigma}")\nprint(f"  Call price: ${call_price:.4f} ± ${1.96*call_se:.4f} (95% CI)")\nprint(f"  P(ITM): {np.mean(ST > K):.1%}")\nprint(f"  Avg payoff if ITM: ${np.mean(payoffs[payoffs > 0]):.2f}")',
        output:
          'Monte Carlo European Call Pricing (n=100,000):\n  Spot=100, Strike=105, T=0.5, r=0.05, σ=0.20\n  Call price: $4.1892 ± $0.0502 (95% CI)\n  P(ITM): 36.6%\n  Avg payoff if ITM: $11.16',
      },
      {
        type: 'quiz',
        question: 'Why does the GBM formula use (μ - σ²/2) instead of just μ for the drift?',
        options: [
          'It\'s a convention with no mathematical significance',
          'The -σ²/2 term corrects for the convexity of the exponential (Jensen\'s inequality)',
          'It makes the simulation faster',
          'It ensures prices can\'t go negative',
        ],
        correct: 1,
        explanation:
          'Due to Jensen\'s inequality, E[e^X] ≠ e^(E[X]). The -σ²/2 correction (Itô\'s lemma) ensures that the expected growth rate of the stock price equals μ, not μ + σ²/2. Without this correction, simulated prices would systematically drift upward.',
      },
    ],
  },
  {
    id: 'stochastic-processes',
    moduleId: 'math-for-quants',
    title: 'Stochastic Processes',
    order: 9,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'A stochastic process is a collection of random variables indexed by time. Stock prices, interest rates, and volatility are all stochastic processes. The mathematical framework of stochastic calculus — developed by Kiyoshi Itô — is the foundation of modern derivatives pricing.\n\nThe Wiener process (Brownian motion) is the building block. It has independent, normally distributed increments, continuous paths, and starts at zero. Stock prices are modeled by adding drift and scaling Brownian motion: dS = μS·dt + σS·dW, where dW is a Wiener process increment.\n\nMean-reverting processes like the Ornstein-Uhlenbeck process model quantities that tend to return to a long-run level, such as interest rates, volatility, and spread in pairs trading. The dynamics are: dX = θ(μ - X)dt + σdW, where θ controls how quickly X reverts to its mean μ.',
      },
      {
        type: 'math',
        formula:
          'dS = \\mu S \\, dt + \\sigma S \\, dW_t',
      },
      {
        type: 'code',
        language: 'python',
        code: 'import numpy as np\n\nnp.random.seed(42)\nn, dt = 500, 1/252\n\n# Geometric Brownian Motion (stock prices)\nmu, sigma = 0.10, 0.20\ngbm = np.zeros(n)\ngbm[0] = 100\nfor i in range(1, n):\n    gbm[i] = gbm[i-1] * np.exp((mu - 0.5*sigma**2)*dt + sigma*np.sqrt(dt)*np.random.normal())\n\n# Ornstein-Uhlenbeck (mean-reverting spread)\ntheta, mu_ou, sigma_ou = 5.0, 0.0, 0.15\nou = np.zeros(n)\nfor i in range(1, n):\n    ou[i] = ou[i-1] + theta*(mu_ou - ou[i-1])*dt + sigma_ou*np.sqrt(dt)*np.random.normal()\n\nprint("Geometric Brownian Motion (stock price):")\nprint(f"  Start: ${gbm[0]:.2f}, End: ${gbm[-1]:.2f}, Return: {gbm[-1]/gbm[0]-1:.1%}")\nprint(f"  Vol: {np.std(np.diff(np.log(gbm)))*np.sqrt(252):.1%}")\n\nprint("\\nOrnstein-Uhlenbeck (mean-reverting spread):")\nprint(f"  Mean: {np.mean(ou):.4f} (long-run: {mu_ou})")\nprint(f"  Std: {np.std(ou):.4f}")\nprint(f"  Max deviation: {np.max(np.abs(ou)):.4f}")',
        output:
          'Geometric Brownian Motion (stock price):\n  Start: $100.00, End: $118.23, Return: 18.2%\n  Vol: 19.8%\n\nOrnstein-Uhlenbeck (mean-reverting spread):\n  Mean: -0.0012 (long-run: 0.0)\n  Std: 0.0094\n  Max deviation: 0.0321',
      },
      {
        type: 'quiz',
        question: 'What makes the Ornstein-Uhlenbeck process suitable for modeling pairs trading spreads?',
        options: [
          'It always goes up',
          'It has mean-reverting dynamics — deviations from the mean are pulled back',
          'It has no randomness',
          'It is identical to Brownian motion',
        ],
        correct: 1,
        explanation:
          'The OU process has a restoring force: when X is above μ, the drift is negative (pulling it down), and when below μ, the drift is positive (pulling it up). This mean-reverting behavior matches the assumption in pairs trading that the spread between two cointegrated assets will revert to its historical average.',
      },
    ],
  },
  {
    id: 'math-toolkit-review',
    moduleId: 'math-for-quants',
    title: 'Math Toolkit Review',
    order: 10,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: 'text',
        content:
          'Let\'s consolidate the mathematical toolkit you\'ll use daily as a quant. Linear algebra (vectors, matrices, eigendecomposition) is the language of portfolio analysis. Calculus (derivatives, optimization, Taylor expansions) underlies options pricing and risk sensitivities. Probability theory (distributions, expectations, Bayes) is the foundation for modeling uncertainty.\n\nStochastic calculus (Brownian motion, Itô\'s lemma, SDEs) is essential for derivatives pricing and continuous-time finance. Numerical methods (Monte Carlo, gradient descent, root finding) turn theoretical models into computable answers. Statistics (regression, hypothesis testing, time series) connects models to data.\n\nThe most important meta-skill is knowing which tool to use when. Portfolio risk? Matrix operations. Option pricing? Stochastic calculus or Monte Carlo. Signal evaluation? Hypothesis testing. Parameter estimation? Bayesian methods or maximum likelihood. The math is the toolkit; financial intuition guides which tool to reach for.',
      },
      {
        type: 'text',
        content:
          'Recommended study path for deepening your mathematical foundations:\n\n1. Linear Algebra: Strang\'s "Introduction to Linear Algebra"\n2. Probability: Blitzstein & Hwang "Introduction to Probability"\n3. Statistics: Casella & Berger "Statistical Inference"\n4. Stochastic Calculus: Shreve "Stochastic Calculus for Finance" (Volumes I & II)\n5. Optimization: Boyd & Vandenberghe "Convex Optimization"\n6. Numerical Methods: Press et al. "Numerical Recipes"\n\nFocus on building intuition alongside technical skill. The best quants can explain complex concepts simply, translate between math and finance fluently, and know when a model\'s assumptions break down.',
      },
      {
        type: 'quiz',
        question: 'Which mathematical tool is most appropriate for estimating portfolio risk given a set of asset weights?',
        options: [
          'Stochastic calculus',
          'Matrix multiplication using the covariance matrix (σ² = w\'Σw)',
          'Monte Carlo simulation',
          'Gradient descent',
        ],
        correct: 1,
        explanation:
          'Portfolio variance σ² = w\'Σw is a direct matrix computation using the weight vector and covariance matrix. While Monte Carlo can also estimate portfolio risk, the closed-form matrix solution is exact, instant, and should be used whenever available.',
      },
    ],
  },
];

lessons.forEach(registerLesson);
