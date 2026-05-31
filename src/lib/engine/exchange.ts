import { OrderBook, type Trade } from "./orderbook";

export interface MarketMakerState {
  cash: number;
  inventory: number;
  pnl: number;
  unrealizedPnl: number;
  bidPrice: number;
  askPrice: number;
  bidQuantity: number;
  askQuantity: number;
  tradesExecuted: Trade[];
  currentPrice: number;
  tickCount: number;
}

export class ExchangeSimulator {
  private cash: number;
  private inventory: number = 0;
  private initialCash: number;
  private currentPrice: number;
  private bidPrice: number = 0;
  private askPrice: number = 0;
  private bidQuantity: number = 0;
  private askQuantity: number = 0;
  private tradesExecuted: Trade[] = [];
  private orderBook: OrderBook;
  private bidOrderId: string | null = null;
  private askOrderId: string | null = null;
  private tickCount: number = 0;

  constructor(initialCash: number, basePrice: number) {
    this.cash = initialCash;
    this.initialCash = initialCash;
    this.currentPrice = basePrice;
    this.orderBook = new OrderBook();
    this.orderBook.generateRandomOrders(20, basePrice);
  }

  setQuotes(bidPrice: number, askPrice: number, quantity: number) {
    if (this.bidOrderId) {
      this.orderBook.cancelOrder(this.bidOrderId);
      this.bidOrderId = null;
    }
    if (this.askOrderId) {
      this.orderBook.cancelOrder(this.askOrderId);
      this.askOrderId = null;
    }

    this.bidPrice = bidPrice;
    this.askPrice = askPrice;
    this.bidQuantity = quantity;
    this.askQuantity = quantity;

    const bidResult = this.orderBook.placeOrder({
      side: "buy",
      type: "limit",
      price: bidPrice,
      quantity,
    });
    if (bidResult.remainingOrder) {
      this.bidOrderId = bidResult.remainingOrder.id;
    }
    for (const t of bidResult.trades) {
      this.cash -= t.price * t.quantity;
      this.inventory += t.quantity;
      this.tradesExecuted.push(t);
    }

    const askResult = this.orderBook.placeOrder({
      side: "sell",
      type: "limit",
      price: askPrice,
      quantity,
    });
    if (askResult.remainingOrder) {
      this.askOrderId = askResult.remainingOrder.id;
    }
    for (const t of askResult.trades) {
      this.cash += t.price * t.quantity;
      this.inventory -= t.quantity;
      this.tradesExecuted.push(t);
    }
  }

  tick(): {
    incomingOrder: { side: string; price: number; quantity: number } | null;
    trade: Trade | null;
    state: MarketMakerState;
  } {
    this.tickCount++;

    const priceChange = (Math.random() - 0.5) * 0.5;
    this.currentPrice =
      Math.round((this.currentPrice + priceChange) * 100) / 100;

    const shouldOrder = Math.random() > 0.3;
    let incomingOrder: {
      side: string;
      price: number;
      quantity: number;
    } | null = null;
    let executedTrade: Trade | null = null;

    if (shouldOrder) {
      const side = Math.random() > 0.5 ? "buy" : "sell";
      const qty = Math.floor(Math.random() * 20) + 5;
      const isAggressive = Math.random() > 0.5;

      const price = isAggressive
        ? side === "buy"
          ? this.currentPrice + Math.random() * 1
          : this.currentPrice - Math.random() * 1
        : side === "buy"
          ? this.currentPrice - Math.random() * 2
          : this.currentPrice + Math.random() * 2;

      const roundedPrice = Math.round(price * 100) / 100;
      incomingOrder = { side, price: roundedPrice, quantity: qty };

      const result = this.orderBook.placeOrder({
        side: side as "buy" | "sell",
        type: "limit",
        price: roundedPrice,
        quantity: qty,
      });

      for (const t of result.trades) {
        const isMakerBuy = t.buyOrderId === this.bidOrderId;
        const isMakerSell = t.sellOrderId === this.askOrderId;

        if (isMakerBuy) {
          this.cash -= t.price * t.quantity;
          this.inventory += t.quantity;
          this.tradesExecuted.push(t);
          executedTrade = t;
        } else if (isMakerSell) {
          this.cash += t.price * t.quantity;
          this.inventory -= t.quantity;
          this.tradesExecuted.push(t);
          executedTrade = t;
        }
      }
    }

    return {
      incomingOrder,
      trade: executedTrade,
      state: this.getState(),
    };
  }

  getState(): MarketMakerState {
    const unrealizedPnl = this.inventory * this.currentPrice;
    const totalValue = this.cash + unrealizedPnl;
    const pnl = totalValue - this.initialCash;

    return {
      cash: Math.round(this.cash * 100) / 100,
      inventory: this.inventory,
      pnl: Math.round(pnl * 100) / 100,
      unrealizedPnl: Math.round(unrealizedPnl * 100) / 100,
      bidPrice: this.bidPrice,
      askPrice: this.askPrice,
      bidQuantity: this.bidQuantity,
      askQuantity: this.askQuantity,
      tradesExecuted: [...this.tradesExecuted],
      currentPrice: this.currentPrice,
      tickCount: this.tickCount,
    };
  }

  reset() {
    this.cash = this.initialCash;
    this.inventory = 0;
    this.tradesExecuted = [];
    this.bidOrderId = null;
    this.askOrderId = null;
    this.tickCount = 0;
    this.orderBook.reset();
    this.orderBook.generateRandomOrders(20, this.currentPrice);
  }
}
