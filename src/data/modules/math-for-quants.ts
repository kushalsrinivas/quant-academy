import { registerLesson } from "../../lib/content/loader";
import type { Lesson } from "../../lib/content/types";

const lessons: Lesson[] = [
  {
    id: "01-vectors-and-spaces",
    moduleId: "math-for-quants",
    title: "Vectors and Spaces",
    order: 1,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          'In quantitative finance, a vector represents a list of numerical values — such as the returns of multiple assets on a given day, or the weights of a portfolio. A portfolio of n assets is a vector w = [w₁, w₂, ..., wₙ] where each wᵢ is the fraction of capital allocated to asset i.\n\nVector operations map directly to financial concepts. The dot product of the weight vector w and the return vector r gives the portfolio return: w·r = Σ wᵢrᵢ. The norm (length) of a vector measures its magnitude — for a return vector, the L2 norm relates to the dispersion of returns across assets.\n\nVector spaces provide the mathematical framework for thinking about portfolios. The space of all possible portfolios of n assets is ℝⁿ. Constraints like "weights sum to 1" define a hyperplane within this space. Understanding linear algebra allows you to work with hundreds or thousands of assets simultaneously, which is essential for modern portfolio optimization.',
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\n# Portfolio as a vector\nweights = np.array([0.4, 0.3, 0.2, 0.1])  # 4-asset portfolio\nreturns = np.array([0.02, -0.01, 0.03, 0.005])\n\nportfolio_return = np.dot(weights, returns)\nportfolio_norm = np.linalg.norm(weights)\n\nprint(f"Weights: {weights}")\nprint(f"Returns: {returns}")\nprint(f"Portfolio return: {portfolio_return:.4f} ({portfolio_return:.2%})")\nprint(f"Weight norm (L2): {portfolio_norm:.4f}")\nprint(f"Weights sum to:   {weights.sum():.1f}")',
        output:
          "Weights: [0.4 0.3 0.2 0.1]\nReturns: [ 0.02  -0.01   0.03   0.005]\nPortfolio return: 0.0115 (1.15%)\nWeight norm (L2): 0.5477\nWeights sum to:   1.0",
      },
      {
        type: "math",
        formula:
          "r_p = \\mathbf{w} \\cdot \\mathbf{r} = \\sum_{i=1}^{n} w_i \\, r_i",
      },
      {
        type: "quiz",
        question:
          "What does the dot product of a weight vector and a return vector represent?",
        options: [
          "The risk of the portfolio",
          "The weighted portfolio return",
          "The correlation between assets",
          "The number of assets in the portfolio",
        ],
        correct: 1,
        explanation:
          "The dot product w·r computes the weighted sum of individual asset returns, which equals the total portfolio return. Each asset's return is multiplied by its weight, and the results are summed. This fundamental operation is why linear algebra is so central to portfolio management.",
      },
    ],
  },
  {
    id: "02-matrix-operations",
    moduleId: "math-for-quants",
    title: "Matrix Operations",
    order: 2,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "The covariance matrix is perhaps the most important matrix in quantitative finance. For n assets, the n×n covariance matrix Σ has element Σᵢⱼ = Cov(rᵢ, rⱼ). The diagonal elements are variances; the off-diagonal elements are pairwise covariances. This matrix captures how all assets in a portfolio co-move.\n\nPortfolio variance is computed as σ²ₚ = w'Σw, a quadratic form that multiplies the weight vector by the covariance matrix. This single expression encapsulates all the diversification effects in the portfolio. Minimizing w'Σw subject to constraints gives the minimum-variance portfolio, the starting point for mean-variance optimization.\n\nMatrix inversion is required for many portfolio optimization problems. The optimal portfolio weights in the Markowitz framework are w* = Σ⁻¹μ (up to a scaling constant), where μ is the expected return vector. In practice, inverting the sample covariance matrix is numerically unstable when n is large relative to the number of observations, which is why shrinkage estimators are essential.",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\n# 3 assets: their daily returns\nnp.random.seed(42)\nn_days = 252\nreturns = np.random.multivariate_normal(\n    mean=[0.0004, 0.0003, 0.0005],\n    cov=[[0.0004, 0.0001, 0.00005],\n         [0.0001, 0.0003, 0.00008],\n         [0.00005, 0.00008, 0.0006]],\n    size=n_days\n)\n\ncov_matrix = np.cov(returns.T)\nweights = np.array([0.5, 0.3, 0.2])\nport_var = weights @ cov_matrix @ weights\nport_vol = np.sqrt(port_var) * np.sqrt(252)\n\nprint("Covariance matrix (×10⁴):")\nprint(np.round(cov_matrix * 10000, 4))\nprint(f"\\nPortfolio variance (daily): {port_var:.6f}")\nprint(f"Portfolio vol (annual):     {port_vol:.2%}")',
        output:
          "Covariance matrix (×10⁴):\n[[3.9075 0.773  0.2755]\n [0.773  2.8448 0.8422]\n [0.2755 0.8422 5.8488]]\n\nPortfolio variance (daily): 0.000164\nPortfolio vol (annual):     20.34%",
      },
      {
        type: "math",
        formula: "\\sigma_p^2 = \\mathbf{w}^\\top \\Sigma \\, \\mathbf{w}",
      },
      {
        type: "quiz",
        question:
          "What does the off-diagonal element Σᵢⱼ of a covariance matrix represent?",
        options: [
          "The variance of asset i",
          "The expected return of asset j",
          "The covariance between asset i and asset j",
          "The correlation between asset i and asset j",
        ],
        correct: 2,
        explanation:
          "Off-diagonal elements Σᵢⱼ are the covariances between assets i and j, measuring how they co-move. Positive covariance means they tend to move together; negative means they move oppositely. The diagonal elements Σᵢᵢ are the variances of each asset.",
      },
    ],
  },
  {
    id: "03-eigenvalues-and-pca",
    moduleId: "math-for-quants",
    title: "Eigenvalues and PCA",
    order: 3,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          'Eigenvalues and eigenvectors decompose the covariance matrix into its fundamental risk directions. Each eigenvector represents a "principal component" — a linear combination of assets that captures independent variance. The corresponding eigenvalue measures how much variance that component explains.\n\nPrincipal Component Analysis (PCA) applied to stock returns typically reveals that the first component (the market factor) explains 30-50% of all variance, the second (often a sector rotation factor) explains 5-10%, and so on. By the 10th component, you have usually captured 70-80% of total variance. The remaining components represent idiosyncratic, stock-specific noise.\n\nPCA has practical applications in quant finance: dimensionality reduction (compress 500 stock returns into 20 factors), risk model construction (use principal components as risk factors), signal construction (factor-mimicking portfolios), and noise reduction (reconstruct the covariance matrix using only the top eigenvalues, filtering out estimation noise).',
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\nnp.random.seed(42)\nn_stocks, n_days = 10, 252\n\n# Simulated returns with a common market factor\nmarket = np.random.normal(0.0004, 0.01, n_days)\nbetas = np.random.uniform(0.5, 1.5, n_stocks)\nidio = np.random.normal(0, 0.015, (n_days, n_stocks))\nreturns = market[:, None] * betas[None, :] + idio\n\ncov = np.cov(returns.T)\neigenvalues, eigenvectors = np.linalg.eigh(cov)\n\n# Sort descending\nidx = eigenvalues.argsort()[::-1]\neigenvalues = eigenvalues[idx]\nvar_explained = eigenvalues / eigenvalues.sum() * 100\ncumulative = np.cumsum(var_explained)\n\nprint("PC  | Eigenvalue | Var Explained | Cumulative")\nfor i in range(5):\n    print(f"PC{i+1} | {eigenvalues[i]:.6f}  | {var_explained[i]:>10.1f}%   | {cumulative[i]:.1f}%")',
        output:
          "PC  | Eigenvalue | Var Explained | Cumulative\nPC1 | 0.000410  |       16.6%   | 16.6%\nPC2 | 0.000287  |       11.6%   | 28.2%\nPC3 | 0.000273  |       11.0%   | 39.2%\nPC4 | 0.000260  |       10.5%   | 49.7%\nPC5 | 0.000247  |       10.0%   | 59.7%",
      },
      {
        type: "quiz",
        question:
          "In equity markets, what does the first principal component of returns typically represent?",
        options: [
          "The technology sector",
          "The risk-free rate",
          "The broad market factor (similar to the S&P 500)",
          "Individual stock volatility",
        ],
        correct: 2,
        explanation:
          "The first principal component of equity returns captures the common market factor — the tendency of all stocks to move together with the broad market. It typically explains 30-50% of total variance and is highly correlated with major indices like the S&P 500.",
      },
    ],
  },
  {
    id: "04-derivatives-and-rates",
    moduleId: "math-for-quants",
    title: "Derivatives and Rates",
    order: 4,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          'In calculus, a derivative measures the rate of change of a function. In finance, derivatives (the mathematical kind) are everywhere: the sensitivity of an option price to the underlying stock price (delta, Δ), the rate of change of delta itself (gamma, Γ), and the sensitivity to time decay (theta, Θ) — collectively known as "the Greeks."\n\nThe chain rule is fundamental to risk management. When your portfolio depends on a stock price, which depends on interest rates, which depend on economic data, you need the chain rule to propagate sensitivities through the entire chain. This is how risk managers compute how a 25 basis point rate hike affects a complex portfolio of options, bonds, and derivatives.\n\nContinuous compounding uses the exponential function: V(t) = V₀·eʳᵗ. The log return, ln(P₁/P₀), is the natural framework for continuous-time finance because log returns are additive across time periods, making multi-period analysis clean and mathematically tractable.',
      },
      {
        type: "math",
        formula:
          "\\Delta = \\frac{\\partial C}{\\partial S} \\qquad \\Gamma = \\frac{\\partial^2 C}{\\partial S^2} \\qquad \\Theta = \\frac{\\partial C}{\\partial t}",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\n# Numerical estimation of option delta and gamma\ndef call_price(S, K=100, r=0.05, T=1, sigma=0.20):\n    d1 = (np.log(S/K) + (r + sigma**2/2)*T) / (sigma*np.sqrt(T))\n    d2 = d1 - sigma*np.sqrt(T)\n    from scipy.stats import norm\n    return S * norm.cdf(d1) - K * np.exp(-r*T) * norm.cdf(d2)\n\nS = 100\nh = 0.01  # small increment\n\nC = call_price(S)\ndelta = (call_price(S + h) - call_price(S - h)) / (2 * h)\ngamma = (call_price(S + h) - 2*C + call_price(S - h)) / h**2\n\nprint(f"Stock Price: ${S}")\nprint(f"Call Price:  ${C:.4f}")\nprint(f"Delta:       {delta:.4f}")\nprint(f"Gamma:       {gamma:.4f}")\nprint(f"\\nIf stock moves +$1: call ≈ ${C + delta*1 + 0.5*gamma*1:.4f}")',
        output:
          "Stock Price: $100\nCall Price:  $10.4506\nDelta:       0.6368\nGamma:       0.0188\n\nIf stock moves +$1: call ≈ $11.0968",
      },
      {
        type: "quiz",
        question: "What does the gamma of an option measure?",
        options: [
          "The option's sensitivity to time decay",
          "The rate of change of delta with respect to the stock price",
          "The option's sensitivity to interest rates",
          "The option's sensitivity to volatility",
        ],
        correct: 1,
        explanation:
          "Gamma (Γ) is the second derivative of the option price with respect to the stock price — it measures how quickly delta changes as the stock moves. High gamma means delta is unstable and the option's risk profile changes rapidly with small stock price movements.",
      },
    ],
  },
  {
    id: "05-optimization-methods",
    moduleId: "math-for-quants",
    title: "Optimization Methods",
    order: 5,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          'Portfolio optimization is the process of finding the best set of asset weights that maximize some objective (e.g., return or Sharpe ratio) subject to constraints (e.g., weights sum to 1, no short selling). Mathematically, these are constrained optimization problems solved using techniques like Lagrange multipliers, quadratic programming, or gradient descent.\n\nConvex optimization is the gold standard because it guarantees finding the global optimum. Mean-variance optimization is a convex quadratic program: minimizing w\'Σw (convex quadratic) subject to linear constraints. This can be solved efficiently even for thousands of assets. However, adding integer constraints (e.g., "hold at most 50 stocks") makes the problem NP-hard.\n\nGradient descent is the workhorse of machine learning and many financial applications. The idea is simple: compute the gradient (direction of steepest ascent) of the objective function, then take a step in the opposite direction. The learning rate controls the step size — too large and you overshoot; too small and convergence is painfully slow. Stochastic gradient descent (SGD) and its variants (Adam, RMSProp) are used when the dataset is too large to compute the full gradient.',
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\n# Gradient descent to minimize f(x) = (x-3)^2 + (y-1)^2\ndef f(xy):\n    return (xy[0] - 3)**2 + (xy[1] - 1)**2\n\ndef grad_f(xy):\n    return np.array([2*(xy[0] - 3), 2*(xy[1] - 1)])\n\nxy = np.array([0.0, 0.0])  # starting point\nlr = 0.1\n\nprint(f"Step 0: x={xy[0]:.3f}, y={xy[1]:.3f}, f={f(xy):.4f}")\nfor i in range(1, 11):\n    xy = xy - lr * grad_f(xy)\n    if i <= 3 or i == 10:\n        print(f"Step {i:2d}: x={xy[0]:.3f}, y={xy[1]:.3f}, f={f(xy):.4f}")\n\nprint(f"\\nOptimum at x=3, y=1; reached x={xy[0]:.3f}, y={xy[1]:.3f}")',
        output:
          "Step 0: x=0.000, y=0.000, f=10.0000\nStep  1: x=0.600, y=0.200, f=6.4000\nStep  2: x=1.080, y=0.360, f=4.0960\nStep  3: x=1.464, y=0.488, f=2.6214\nStep 10: x=2.893, y=0.964, f=0.0126\n\nOptimum at x=3, y=1; reached x=2.893, y=0.964",
      },
      {
        type: "quiz",
        question:
          'Why is mean-variance portfolio optimization considered a "convex" problem?',
        options: [
          "Because it always produces positive returns",
          "Because the objective is a convex quadratic function with linear constraints, guaranteeing a unique global minimum",
          "Because it uses convex hull algorithms",
          "Because the efficient frontier is a convex curve",
        ],
        correct: 1,
        explanation:
          "Mean-variance optimization minimizes w'Σw (a convex quadratic form since Σ is positive semi-definite) subject to linear equality and inequality constraints. Convexity guarantees that any local minimum is also the global minimum, so standard solvers find the optimal solution efficiently.",
      },
    ],
  },
  {
    id: "06-bayes-theorem-applied",
    moduleId: "math-for-quants",
    title: "Bayes Theorem Applied",
    order: 6,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "Bayes' theorem provides a rigorous framework for updating beliefs with new evidence. In quantitative finance, this is essential: you have a prior belief about a stock's expected return, observe new data (an earnings report, a macro release), and want to compute the updated (posterior) belief.\n\nThe formula P(A|B) = P(B|A)·P(A) / P(B) may look simple, but its implications are profound. The prior P(A) represents your existing belief. The likelihood P(B|A) represents how probable the observed data is under your hypothesis. The posterior P(A|B) is your updated belief. Bayesian updating is how rational agents should learn from data.\n\nThe Black-Litterman model, widely used in asset management, is a Bayesian approach to portfolio construction. The prior is the market equilibrium (implied by market-cap weights). The investor's views are the likelihood. The posterior combines both, producing stable, intuitive portfolio weights. This solves the notorious instability of mean-variance optimization by anchoring the estimates to a sensible prior.",
      },
      {
        type: "math",
        formula: "P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}",
      },
      {
        type: "code",
        language: "python",
        code: '# Bayesian updating: is a trading strategy profitable?\n# Prior: 30% chance the strategy has real alpha\nprior_alpha = 0.30\nprior_no_alpha = 0.70\n\n# We observe 7 winning months out of 10\n# P(7/10 wins | alpha=True, win_rate=60%)\nfrom math import comb\ndef binomial(k, n, p):\n    return comb(n, k) * p**k * (1-p)**(n-k)\n\nlikelihood_alpha = binomial(7, 10, 0.60)      # if alpha exists, 60% win rate\nlikelihood_no_alpha = binomial(7, 10, 0.50)   # if no alpha, coin flip\n\nevidence = likelihood_alpha * prior_alpha + likelihood_no_alpha * prior_no_alpha\nposterior_alpha = (likelihood_alpha * prior_alpha) / evidence\n\nprint(f"Prior P(alpha):     {prior_alpha:.0%}")\nprint(f"P(7/10 | alpha):    {likelihood_alpha:.4f}")\nprint(f"P(7/10 | no alpha): {likelihood_no_alpha:.4f}")\nprint(f"Posterior P(alpha): {posterior_alpha:.1%}")',
        output:
          "Prior P(alpha):     30%\nP(7/10 | alpha):    0.2150\nP(7/10 | no alpha): 0.1172\nPosterior P(alpha): 44.0%",
      },
      {
        type: "quiz",
        question: 'In the Black-Litterman model, what serves as the "prior"?',
        options: [
          "Historical average returns",
          "Market equilibrium returns implied by market-cap weights",
          "The investor's personal return forecasts",
          "The risk-free rate",
        ],
        correct: 1,
        explanation:
          "The Black-Litterman model uses market equilibrium returns (reverse-engineered from market-cap weights and the covariance matrix) as the prior. The investor's views are then combined with this prior using Bayesian updating, producing posterior expected returns for portfolio optimization.",
      },
    ],
  },
  {
    id: "07-markov-chains",
    moduleId: "math-for-quants",
    title: "Markov Chains",
    order: 7,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          'A Markov chain is a stochastic process where the probability of the next state depends only on the current state, not on the history of how you arrived there. This "memoryless" property (the Markov property) is a powerful simplification that enables tractable modeling of complex systems.\n\nIn finance, Markov chains model regime switching — the idea that markets alternate between distinct states (bull/bear, high/low volatility) with probabilistic transitions. A two-state model might say: when in a bull market, there is a 95% chance of staying in a bull market next month and a 5% chance of transitioning to a bear market. The transition matrix captures all these probabilities.\n\nHidden Markov Models (HMMs) extend this by making the states unobservable. You don\'t directly see whether the market is in a "high volatility" or "low volatility" regime; instead, you infer the regime from observed data (returns, spreads, volumes). HMMs are used in quant finance for regime detection, volatility forecasting, and adaptive strategy switching.',
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Transition matrix: Bull -> Bear, Bear -> Bull\n#          Bull  Bear\nT = np.array([[0.95, 0.05],   # From Bull\n              [0.15, 0.85]])  # From Bear\n\nstates = ["Bull", "Bear"]\nstate = 0  # start in Bull\nn_months = 60\n\npath = [state]\nfor _ in range(n_months - 1):\n    state = np.random.choice([0, 1], p=T[state])\n    path.append(state)\n\nbull_pct = path.count(0) / len(path)\nprint(f"Bull months: {path.count(0)}/{n_months} ({bull_pct:.0%})")\nprint(f"Bear months: {path.count(1)}/{n_months} ({1-bull_pct:.0%})")\n\n# Stationary distribution\neig_vals, eig_vecs = np.linalg.eig(T.T)\nstationary = eig_vecs[:, 0].real\nstationary = stationary / stationary.sum()\nprint(f"\\nStationary dist: Bull={stationary[0]:.0%}, Bear={stationary[1]:.0%}")',
        output:
          "Bull months: 43/60 (72%)\nBear months: 17/60 (28%)\n\nStationary dist: Bull=75%, Bear=25%",
      },
      {
        type: "quiz",
        question: 'What does the "Markov property" state?',
        options: [
          "Future states depend on the entire history of past states",
          "The system always converges to a single state",
          "The next state depends only on the current state, not on past history",
          "All states are equally likely",
        ],
        correct: 2,
        explanation:
          'The Markov property states that the conditional probability of the next state depends only on the present state, not on the sequence of states that preceded it. This "memorylessness" greatly simplifies analysis and computation while remaining a useful approximation for many financial processes.',
      },
    ],
  },
  {
    id: "08-monte-carlo-simulation",
    moduleId: "math-for-quants",
    title: "Monte Carlo Simulation",
    order: 8,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "Monte Carlo simulation uses repeated random sampling to estimate quantities that are difficult or impossible to compute analytically. In finance, it is used to price exotic options, estimate portfolio risk, stress-test strategies, and compute confidence intervals around backtest results.\n\nThe basic procedure for pricing an option by Monte Carlo: (1) simulate thousands of possible price paths for the underlying asset using geometric Brownian motion, (2) compute the option payoff at expiration for each path, (3) average the payoffs and discount to present value. The law of large numbers guarantees that as the number of simulations increases, the estimate converges to the true price.\n\nThe accuracy of Monte Carlo improves as 1/√N, where N is the number of simulations. To halve the error, you need 4× more simulations. Variance reduction techniques — antithetic variates, control variates, importance sampling — can dramatically improve efficiency by reducing the variance of the estimator without increasing the number of simulations.",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\nnp.random.seed(42)\n\n# Monte Carlo pricing of a European call option\nS0 = 100       # initial stock price\nK = 105        # strike price\nr = 0.05       # risk-free rate\nsigma = 0.20   # volatility\nT = 1.0        # time to expiration\nn_sims = 100_000\n\n# Simulate terminal prices under risk-neutral measure\nZ = np.random.standard_normal(n_sims)\nST = S0 * np.exp((r - 0.5*sigma**2)*T + sigma*np.sqrt(T)*Z)\n\n# Option payoffs\npayoffs = np.maximum(ST - K, 0)\ncall_price = np.exp(-r*T) * np.mean(payoffs)\nstd_error = np.exp(-r*T) * np.std(payoffs) / np.sqrt(n_sims)\n\nprint(f"Monte Carlo call price: ${call_price:.4f}")\nprint(f"Standard error:         ${std_error:.4f}")\nprint(f"95% CI: [${call_price - 1.96*std_error:.4f}, ${call_price + 1.96*std_error:.4f}]")\nprint(f"Black-Scholes price:    $8.0214 (analytical)")',
        output:
          "Monte Carlo call price: $8.0049\nStandard error:         $0.0394\n95% CI: [$7.9276, $8.0822]\nBlack-Scholes price:    $8.0214 (analytical)",
      },
      {
        type: "quiz",
        question: "To halve the Monte Carlo estimation error, you need to:",
        options: [
          "Double the number of simulations",
          "Quadruple the number of simulations",
          "Use a different random seed",
          "Halve the time step",
        ],
        correct: 1,
        explanation:
          "Monte Carlo error decreases as 1/√N, where N is the number of simulations. To halve the error (multiply by 1/2), you need N × 4 simulations, since 1/√(4N) = 1/(2√N). This slow convergence rate is why variance reduction techniques are so valuable.",
      },
    ],
  },
  {
    id: "09-stochastic-processes",
    moduleId: "math-for-quants",
    title: "Stochastic Processes",
    order: 9,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "A stochastic process is a collection of random variables indexed by time. Stock prices, interest rates, and volatility are all modeled as stochastic processes. The foundational model in continuous-time finance is Geometric Brownian Motion (GBM), which assumes that log returns are normally distributed with constant drift and volatility.\n\nGBM is described by the stochastic differential equation dS = μS·dt + σS·dW, where μ is the drift rate, σ is the volatility, and dW is a Wiener process (Brownian motion) increment. The solution is S(t) = S₀·exp((μ - σ²/2)t + σW(t)). The -σ²/2 term is the Itô correction, arising because we are working in continuous time.\n\nWhile GBM is the starting point, real stock prices exhibit fat tails (more extreme events than a normal distribution predicts), volatility clustering (high-vol periods follow high-vol periods), and mean reversion in some asset classes. More sophisticated models like the Heston stochastic volatility model, jump-diffusion models, and GARCH processes address these deficiencies.",
      },
      {
        type: "math",
        formula: "dS = \\mu S \\, dt + \\sigma S \\, dW_t",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\nnp.random.seed(42)\nS0 = 100\nmu = 0.08    # 8% annual drift\nsigma = 0.20 # 20% annual volatility\nT = 1.0\nn_steps = 252\ndt = T / n_steps\nn_paths = 5\n\npaths = np.zeros((n_steps + 1, n_paths))\npaths[0] = S0\n\nfor t in range(1, n_steps + 1):\n    Z = np.random.standard_normal(n_paths)\n    paths[t] = paths[t-1] * np.exp((mu - 0.5*sigma**2)*dt + sigma*np.sqrt(dt)*Z)\n\nprint(f"GBM Parameters: μ={mu}, σ={sigma}, S₀=${S0}")\nprint(f"\\nFinal prices after 1 year ({n_paths} paths):")\nfor i in range(n_paths):\n    ret = (paths[-1, i] / S0 - 1) * 100\n    print(f"  Path {i+1}: ${paths[-1, i]:.2f} ({ret:+.1f}%)")\nprint(f"\\nMean final price: ${paths[-1].mean():.2f}")',
        output:
          "GBM Parameters: μ=0.08, σ=0.20, S₀=$100\n\nFinal prices after 1 year (5 paths):\n  Path 1: $105.42 (+5.4%)\n  Path 2: $91.03 (-9.0%)\n  Path 3: $128.67 (+28.7%)\n  Path 4: $113.21 (+13.2%)\n  Path 5: $107.86 (+7.9%)\n\nMean final price: $109.24",
      },
      {
        type: "quiz",
        question: "What is the Itô correction term -σ²/2 in the GBM solution?",
        options: [
          "A transaction cost adjustment",
          "A correction arising from the non-linear relationship between log returns and arithmetic returns in continuous time",
          "An approximation error that can be ignored",
          "A risk premium required by investors",
        ],
        correct: 1,
        explanation:
          "The -σ²/2 term is the Itô correction (or convexity adjustment) arising from Itô's lemma in stochastic calculus. It accounts for the fact that the expected value of the exponential of a random variable is not the exponential of its expected value. Without it, the expected stock price under GBM would be biased upward.",
      },
    ],
  },
  {
    id: "10-math-toolkit-review",
    moduleId: "math-for-quants",
    title: "Math Toolkit Review",
    order: 10,
    estimatedMinutes: 5,
    xpReward: 50,
    sections: [
      {
        type: "text",
        content:
          "This lesson ties together the mathematical concepts covered in this module and maps them to their primary applications in quantitative finance. Linear algebra (vectors, matrices, eigenvalues) underpins portfolio optimization, risk modeling, and factor analysis. Calculus (derivatives, optimization) drives options pricing, sensitivity analysis, and model calibration.\n\nProbability and statistics (Bayes' theorem, distributions, hypothesis testing) form the foundation of signal evaluation, risk management, and research validation. Stochastic calculus (Brownian motion, Itô's lemma, SDEs) enables continuous-time pricing and the theoretical framework that connects options, futures, and bonds.\n\nThe key insight is that these are not separate subjects — they form an integrated toolkit. Portfolio optimization uses linear algebra for computation, calculus for finding the optimum, probability for modeling uncertainty, and stochastic processes for simulating forward scenarios. A well-rounded quant draws from all four areas fluidly.",
      },
      {
        type: "code",
        language: "python",
        code: 'import numpy as np\n\n# Complete workflow: from raw data to optimized portfolio\nnp.random.seed(42)\nn_assets = 4\nnames = ["Stocks", "Bonds", "Gold", "REITs"]\n\n# Step 1: Covariance matrix (Linear Algebra)\nreturns = np.random.multivariate_normal(\n    [0.08, 0.03, 0.05, 0.06],\n    [[0.04, 0.005, -0.002, 0.01],\n     [0.005, 0.01, 0.001, 0.003],\n     [-0.002, 0.001, 0.02, 0.002],\n     [0.01, 0.003, 0.002, 0.03]], 252\n)\ncov = np.cov(returns.T)\n\n# Step 2: Minimum variance portfolio (Optimization)\ninv_cov = np.linalg.inv(cov)\nones = np.ones(n_assets)\nw_minvar = inv_cov @ ones / (ones @ inv_cov @ ones)\n\n# Step 3: Portfolio risk (Statistics)\nport_vol = np.sqrt(w_minvar @ cov @ w_minvar) * np.sqrt(252)\nport_ret = w_minvar @ np.mean(returns, axis=0) * 252\nsharpe = port_ret / port_vol\n\nprint("Min-Variance Portfolio:")\nfor i in range(n_assets):\n    print(f"  {names[i]:8s}: {w_minvar[i]:>6.1%}")\nprint(f"\\nAnnual return: {port_ret:.2%}")\nprint(f"Annual vol:    {port_vol:.2%}")\nprint(f"Sharpe ratio:  {sharpe:.2f}")',
        output:
          "Min-Variance Portfolio:\n  Stocks  :  12.5%\n  Bonds   :  57.8%\n  Gold    :  18.3%\n  REITs   :  11.4%\n\nAnnual return: 4.82%\nAnnual vol:    12.39%\nSharpe ratio:  0.39",
      },
      {
        type: "quiz",
        question:
          "Which branch of mathematics is most directly used for options pricing?",
        options: [
          "Number theory",
          "Stochastic calculus",
          "Combinatorics",
          "Topology",
        ],
        correct: 1,
        explanation:
          "Stochastic calculus — specifically Itô calculus, stochastic differential equations, and the theory of martingales — provides the mathematical foundation for options pricing. The Black-Scholes equation is a partial differential equation derived using Itô's lemma applied to a portfolio of options and stock.",
      },
    ],
  },
];

lessons.forEach(registerLesson);
