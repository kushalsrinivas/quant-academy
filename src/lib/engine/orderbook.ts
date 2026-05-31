export interface Order {
  id: string;
  side: "buy" | "sell";
  type: "limit" | "market";
  price: number;
  quantity: number;
  timestamp: number;
}

export interface Trade {
  buyOrderId: string;
  sellOrderId: string;
  price: number;
  quantity: number;
  timestamp: number;
}

export interface OrderBookState {
  bids: Order[];
  asks: Order[];
  trades: Trade[];
  midPrice: number;
  spread: number;
  bestBid: number | null;
  bestAsk: number | null;
}

let nextId = 1;
function genId(): string {
  return `ord_${nextId++}`;
}

export class OrderBook {
  private bids: Order[] = [];
  private asks: Order[] = [];
  private trades: Trade[] = [];

  placeOrder(order: Omit<Order, "id" | "timestamp">): {
    trades: Trade[];
    remainingOrder: Order | null;
  } {
    const fullOrder: Order = {
      ...order,
      id: genId(),
      timestamp: Date.now(),
    };

    const executedTrades: Trade[] = [];

    if (order.type === "market") {
      if (order.side === "buy") {
        let remaining = fullOrder.quantity;
        while (remaining > 0 && this.asks.length > 0) {
          const bestAsk = this.asks[0];
          const fillQty = Math.min(remaining, bestAsk.quantity);
          const trade: Trade = {
            buyOrderId: fullOrder.id,
            sellOrderId: bestAsk.id,
            price: bestAsk.price,
            quantity: fillQty,
            timestamp: Date.now(),
          };
          executedTrades.push(trade);
          this.trades.push(trade);
          remaining -= fillQty;
          bestAsk.quantity -= fillQty;
          if (bestAsk.quantity <= 0) this.asks.shift();
        }
      } else {
        let remaining = fullOrder.quantity;
        while (remaining > 0 && this.bids.length > 0) {
          const bestBid = this.bids[0];
          const fillQty = Math.min(remaining, bestBid.quantity);
          const trade: Trade = {
            buyOrderId: bestBid.id,
            sellOrderId: fullOrder.id,
            price: bestBid.price,
            quantity: fillQty,
            timestamp: Date.now(),
          };
          executedTrades.push(trade);
          this.trades.push(trade);
          remaining -= fillQty;
          bestBid.quantity -= fillQty;
          if (bestBid.quantity <= 0) this.bids.shift();
        }
      }
      return { trades: executedTrades, remainingOrder: null };
    }

    // Limit order
    if (order.side === "buy") {
      let remaining = fullOrder.quantity;
      while (
        remaining > 0 &&
        this.asks.length > 0 &&
        this.asks[0].price <= fullOrder.price
      ) {
        const bestAsk = this.asks[0];
        const fillQty = Math.min(remaining, bestAsk.quantity);
        const trade: Trade = {
          buyOrderId: fullOrder.id,
          sellOrderId: bestAsk.id,
          price: bestAsk.price,
          quantity: fillQty,
          timestamp: Date.now(),
        };
        executedTrades.push(trade);
        this.trades.push(trade);
        remaining -= fillQty;
        bestAsk.quantity -= fillQty;
        if (bestAsk.quantity <= 0) this.asks.shift();
      }
      if (remaining > 0) {
        const restingOrder = { ...fullOrder, quantity: remaining };
        this.bids.push(restingOrder);
        this.bids.sort((a, b) => b.price - a.price);
        return { trades: executedTrades, remainingOrder: restingOrder };
      }
    } else {
      let remaining = fullOrder.quantity;
      while (
        remaining > 0 &&
        this.bids.length > 0 &&
        this.bids[0].price >= fullOrder.price
      ) {
        const bestBid = this.bids[0];
        const fillQty = Math.min(remaining, bestBid.quantity);
        const trade: Trade = {
          buyOrderId: bestBid.id,
          sellOrderId: fullOrder.id,
          price: bestBid.price,
          quantity: fillQty,
          timestamp: Date.now(),
        };
        executedTrades.push(trade);
        this.trades.push(trade);
        remaining -= fillQty;
        bestBid.quantity -= fillQty;
        if (bestBid.quantity <= 0) this.bids.shift();
      }
      if (remaining > 0) {
        const restingOrder = { ...fullOrder, quantity: remaining };
        this.asks.push(restingOrder);
        this.asks.sort((a, b) => a.price - b.price);
        return { trades: executedTrades, remainingOrder: restingOrder };
      }
    }

    return { trades: executedTrades, remainingOrder: null };
  }

  cancelOrder(orderId: string): boolean {
    let idx = this.bids.findIndex((o) => o.id === orderId);
    if (idx >= 0) {
      this.bids.splice(idx, 1);
      return true;
    }
    idx = this.asks.findIndex((o) => o.id === orderId);
    if (idx >= 0) {
      this.asks.splice(idx, 1);
      return true;
    }
    return false;
  }

  getState(): OrderBookState {
    const bestBid = this.bids.length > 0 ? this.bids[0].price : null;
    const bestAsk = this.asks.length > 0 ? this.asks[0].price : null;
    const midPrice =
      bestBid !== null && bestAsk !== null
        ? (bestBid + bestAsk) / 2
        : (bestBid ?? bestAsk ?? 0);
    const spread = bestBid !== null && bestAsk !== null ? bestAsk - bestBid : 0;

    return {
      bids: [...this.bids],
      asks: [...this.asks],
      trades: [...this.trades],
      midPrice,
      spread,
      bestBid,
      bestAsk,
    };
  }

  generateRandomOrders(count: number, basePrice: number) {
    for (let i = 0; i < count; i++) {
      const side = Math.random() > 0.5 ? "buy" : "sell";
      const offset = (Math.random() * 4 - 2) * 0.5;
      const price =
        Math.round(
          (side === "buy"
            ? basePrice - Math.abs(offset)
            : basePrice + Math.abs(offset)) * 100,
        ) / 100;
      const quantity = Math.floor(Math.random() * 100) + 10;
      this.placeOrder({ side, type: "limit", price, quantity });
    }
  }

  reset() {
    this.bids = [];
    this.asks = [];
    this.trades = [];
  }
}
