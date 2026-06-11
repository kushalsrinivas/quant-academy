# Quant Academy

An interactive mobile app for learning quantitative trading — from market fundamentals and probability theory to strategy backtesting and quant interview prep. Built with Expo and React Native.

**Not videos. Not PDFs. Interactive learning with real concepts that top quant firms look for.**

## What's Inside

- **100 lessons** across 10 structured modules covering markets, probability, statistics, Python, backtesting, technical factors, quant research, market microstructure, math, and interview prep
- **Interactive sandboxes** — order book simulator, coin toss probability lab, stock correlation tool, and a market-making exchange
- **Strategy builder & backtester** — define buy/sell rules using SMA, EMA, RSI, and momentum indicators, then backtest against synthetic market data with full performance metrics (Sharpe ratio, max drawdown, win rate)
- **25 interview problems** across coding, probability, mental math, brain teasers, and systems design — styled after firms like Jane Street, Citadel, and HRT
- **Gamification** — XP system with 6 quant career levels (Intern → HFT Engineer), 15 achievements, and per-module progress tracking
- **Fully offline** — all content, simulations, and progress stored locally on-device via SQLite

## Tech Stack

| Layer          | Technology                                                                                |
| -------------- | ----------------------------------------------------------------------------------------- |
| Framework      | [Expo SDK 56](https://docs.expo.dev/)                                                     |
| UI             | [React Native 0.85](https://reactnative.dev/) + React 19                                  |
| Navigation     | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing)            |
| Database       | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)                          |
| Math rendering | [react-native-latex-renderer](https://github.com/dawsonxiong/react-native-latex-renderer) |
| Animations     | [React Native Reanimated 4](https://docs.swmansion.com/react-native-reanimated/)          |
| Lists          | [@shopify/flash-list](https://shopify.github.io/flash-list/)                              |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli` or use `npx expo`)
- iOS Simulator (macOS) or Android Emulator, or [Expo Go](https://expo.dev/go) on a physical device

### Installation

```bash
# Clone the repository
git clone https://github.com/kushalsrinivas/quant-academy.git
cd quant-academy

# Install dependencies
npm install

# Start the development server
npx expo start
```

From the Expo dev server, press:

- `i` to open in iOS Simulator
- `a` to open in Android Emulator
- Scan the QR code with Expo Go on your phone

### Building for Production

This project uses [EAS Build](https://docs.expo.dev/build/introduction/). To create a production build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Project Structure

```
src/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Bottom tab navigator (Learn, Sandbox, Practice, Profile)
│   ├── lesson/             # Module & lesson screens
│   ├── quiz/               # Quiz screens
│   ├── simulation/         # Interactive sandbox screens
│   ├── strategy/           # Strategy builder & backtest results
│   └── problem/            # Interview problem viewer
├── components/             # Reusable UI components
├── constants/              # Theme, colors, gamification config
├── data/
│   ├── modules/            # 10 module content files (100 lessons)
│   ├── problems/           # 25 interview problems
│   └── datasets/           # Synthetic market data (Nifty50 OHLCV)
├── hooks/                  # Custom React hooks (progress, XP, backtest, etc.)
└── lib/
    ├── content/            # Lesson type definitions & registry
    ├── db/                 # SQLite schema, migrations, and data access
    └── engine/             # Backtest engine, indicators, probability, order book
```

## Learning Modules

| #   | Module                | Topics                                                         |
| --- | --------------------- | -------------------------------------------------------------- |
| 1   | Markets 101           | Stocks, ETFs, futures, options, exchanges, order types         |
| 2   | Probability           | Expected value, distributions, Bayes' theorem, Monte Carlo     |
| 3   | Statistics            | Correlation, regression, hypothesis testing, time series       |
| 4   | Python for Quants     | NumPy, Pandas, returns, rolling calculations                   |
| 5   | Backtesting           | MA crossover, overfitting, walk-forward analysis, Sharpe ratio |
| 6   | Technical Factors     | RSI, MACD, Bollinger Bands, momentum, custom factors           |
| 7   | Quant Research        | Signal generation, alpha decay, portfolio construction         |
| 8   | Market Microstructure | Order books, market making, slippage, HFT, dark pools          |
| 9   | Math for Quants       | Linear algebra, PCA, optimization, stochastic processes        |
| 10  | Interview Prep        | Coding problems, brain teasers, mental math, system design     |

## Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Security

To report a security vulnerability, please see our [Security Policy](SECURITY.md).

## License

This project is licensed under the Apache License 2.0 — see the [LICENSE](LICENSE) file for details.

```
Copyright 2025 Kushal Srinivas

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
```
