import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

import { Colors, Spacing } from "@/constants/theme";

interface BookOrder {
  id: string;
  price: number;
  quantity: number;
}

interface BookTrade {
  price: number;
  quantity: number;
  side: "buy" | "sell";
  time: string;
}

let orderId = 0;
function nextId() {
  return `o${++orderId}`;
}

export default function OrderBookScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const [bids, setBids] = useState<BookOrder[]>(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: nextId(),
      price: 100 - (i + 1) * 0.25,
      quantity: Math.floor(Math.random() * 200) + 50,
    })),
  );
  const [asks, setAsks] = useState<BookOrder[]>(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: nextId(),
      price: 100 + (i + 1) * 0.25,
      quantity: Math.floor(Math.random() * 200) + 50,
    })),
  );
  const [trades, setTrades] = useState<BookTrade[]>([]);
  const [priceInput, setPriceInput] = useState("100.00");
  const [qtyInput, setQtyInput] = useState("50");
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");

  const bestBid = bids.length > 0 ? bids[0].price : 0;
  const bestAsk = asks.length > 0 ? asks[0].price : 0;
  const midPrice = (bestBid + bestAsk) / 2;
  const spread = bestAsk - bestBid;
  const maxQty = Math.max(
    ...bids.map((b) => b.quantity),
    ...asks.map((a) => a.quantity),
    1,
  );

  const placeBuy = useCallback(() => {
    const qty = parseInt(qtyInput, 10) || 0;
    if (qty <= 0) return;

    if (orderType === "market") {
      let remaining = qty;
      const newAsks = [...asks];
      const newTrades = [...trades];
      while (remaining > 0 && newAsks.length > 0) {
        const best = newAsks[0];
        const fill = Math.min(remaining, best.quantity);
        newTrades.unshift({
          price: best.price,
          quantity: fill,
          side: "buy",
          time: new Date().toLocaleTimeString(),
        });
        remaining -= fill;
        best.quantity -= fill;
        if (best.quantity <= 0) newAsks.shift();
      }
      setAsks(newAsks);
      setTrades(newTrades.slice(0, 20));
    } else {
      const price = parseFloat(priceInput) || 0;
      if (price <= 0) return;
      let remaining = qty;
      const newAsks = [...asks];
      const newTrades = [...trades];
      while (remaining > 0 && newAsks.length > 0 && newAsks[0].price <= price) {
        const best = newAsks[0];
        const fill = Math.min(remaining, best.quantity);
        newTrades.unshift({
          price: best.price,
          quantity: fill,
          side: "buy",
          time: new Date().toLocaleTimeString(),
        });
        remaining -= fill;
        best.quantity -= fill;
        if (best.quantity <= 0) newAsks.shift();
      }
      setAsks(newAsks);
      setTrades(newTrades.slice(0, 20));
      if (remaining > 0) {
        const newBids = [
          ...bids,
          { id: nextId(), price, quantity: remaining },
        ].sort((a, b) => b.price - a.price);
        setBids(newBids);
      }
    }
  }, [asks, bids, trades, priceInput, qtyInput, orderType]);

  const placeSell = useCallback(() => {
    const qty = parseInt(qtyInput, 10) || 0;
    if (qty <= 0) return;

    if (orderType === "market") {
      let remaining = qty;
      const newBids = [...bids];
      const newTrades = [...trades];
      while (remaining > 0 && newBids.length > 0) {
        const best = newBids[0];
        const fill = Math.min(remaining, best.quantity);
        newTrades.unshift({
          price: best.price,
          quantity: fill,
          side: "sell",
          time: new Date().toLocaleTimeString(),
        });
        remaining -= fill;
        best.quantity -= fill;
        if (best.quantity <= 0) newBids.shift();
      }
      setBids(newBids);
      setTrades(newTrades.slice(0, 20));
    } else {
      const price = parseFloat(priceInput) || 0;
      if (price <= 0) return;
      let remaining = qty;
      const newBids = [...bids];
      const newTrades = [...trades];
      while (remaining > 0 && newBids.length > 0 && newBids[0].price >= price) {
        const best = newBids[0];
        const fill = Math.min(remaining, best.quantity);
        newTrades.unshift({
          price: best.price,
          quantity: fill,
          side: "sell",
          time: new Date().toLocaleTimeString(),
        });
        remaining -= fill;
        best.quantity -= fill;
        if (best.quantity <= 0) newBids.shift();
      }
      setBids(newBids);
      setTrades(newTrades.slice(0, 20));
      if (remaining > 0) {
        const newAsks = [
          ...asks,
          { id: nextId(), price, quantity: remaining },
        ].sort((a, b) => a.price - b.price);
        setAsks(newAsks);
      }
    }
  }, [asks, bids, trades, priceInput, qtyInput, orderType]);

  const addRandom = useCallback(() => {
    const mid = midPrice || 100;
    const newBids = [...bids];
    const newAsks = [...asks];
    for (let i = 0; i < 5; i++) {
      const offset = Math.random() * 2;
      newBids.push({
        id: nextId(),
        price: Math.round((mid - offset) * 100) / 100,
        quantity: Math.floor(Math.random() * 150) + 20,
      });
      newAsks.push({
        id: nextId(),
        price: Math.round((mid + offset) * 100) / 100,
        quantity: Math.floor(Math.random() * 150) + 20,
      });
    }
    newBids.sort((a, b) => b.price - a.price);
    newAsks.sort((a, b) => a.price - b.price);
    setBids(newBids.slice(0, 15));
    setAsks(newAsks.slice(0, 15));
  }, [bids, asks, midPrice]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Stats */}
      <View
        style={[styles.statsRow, { backgroundColor: colors.backgroundElement }]}
      >
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Mid Price
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            ₹{midPrice.toFixed(2)}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Spread
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            ₹{spread.toFixed(2)}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Best Bid
          </Text>
          <Text style={[styles.statValue, { color: colors.bidGreen }]}>
            ₹{bestBid.toFixed(2)}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Best Ask
          </Text>
          <Text style={[styles.statValue, { color: colors.askRed }]}>
            ₹{bestAsk.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Order Book */}
      <View style={styles.bookContainer}>
        <Text style={[styles.bookTitle, { color: colors.text }]}>
          Order Book
        </Text>
        <View style={styles.bookHeaders}>
          <Text style={[styles.bookHeader, { color: colors.textSecondary }]}>
            Price
          </Text>
          <Text
            style={[
              styles.bookHeader,
              { color: colors.textSecondary, textAlign: "right" },
            ]}
          >
            Quantity
          </Text>
        </View>

        {/* Asks (reversed so lowest is at bottom near spread) */}
        {[...asks]
          .reverse()
          .slice(0, 10)
          .map((a) => (
            <View key={a.id} style={styles.bookRow}>
              <View
                style={[
                  styles.bookBar,
                  styles.askBar,
                  { width: `${(a.quantity / maxQty) * 100}%` },
                ]}
              />
              <Text style={[styles.bookPrice, { color: colors.askRed }]}>
                ₹{a.price.toFixed(2)}
              </Text>
              <Text style={[styles.bookQty, { color: colors.text }]}>
                {a.quantity}
              </Text>
            </View>
          ))}

        <View
          style={[
            styles.spreadLine,
            { borderColor: colors.backgroundSelected },
          ]}
        >
          <Text style={[styles.spreadText, { color: colors.textSecondary }]}>
            Spread: ₹{spread.toFixed(2)}
          </Text>
        </View>

        {bids.slice(0, 10).map((b) => (
          <View key={b.id} style={styles.bookRow}>
            <View
              style={[
                styles.bookBar,
                styles.bidBar,
                { width: `${(b.quantity / maxQty) * 100}%` },
              ]}
            />
            <Text style={[styles.bookPrice, { color: colors.bidGreen }]}>
              ₹{b.price.toFixed(2)}
            </Text>
            <Text style={[styles.bookQty, { color: colors.text }]}>
              {b.quantity}
            </Text>
          </View>
        ))}
      </View>

      {/* Order Entry */}
      <View
        style={[
          styles.orderEntry,
          { backgroundColor: colors.backgroundElement },
        ]}
      >
        <View style={styles.typeRow}>
          {(["limit", "market"] as const).map((t) => (
            <Pressable
              key={t}
              style={[styles.typeBtn, orderType === t && styles.typeBtnActive]}
              onPress={() => setOrderType(t)}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  orderType === t && styles.typeBtnTextActive,
                ]}
              >
                {t.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        {orderType === "limit" && (
          <View style={styles.inputRow}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Price
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.backgroundSelected },
              ]}
              value={priceInput}
              onChangeText={setPriceInput}
              keyboardType="decimal-pad"
            />
          </View>
        )}
        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Quantity
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.backgroundSelected },
            ]}
            value={qtyInput}
            onChangeText={setQtyInput}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.buttonRow}>
          <Pressable style={[styles.buyBtn]} onPress={placeBuy}>
            <Text style={styles.buyBtnText}>BUY</Text>
          </Pressable>
          <Pressable style={[styles.sellBtn]} onPress={placeSell}>
            <Text style={styles.sellBtnText}>SELL</Text>
          </Pressable>
        </View>

        <Pressable
          style={[
            styles.randomBtn,
            { backgroundColor: colors.backgroundSelected },
          ]}
          onPress={addRandom}
        >
          <Text style={[styles.randomBtnText, { color: colors.text }]}>
            + Add Random Orders
          </Text>
        </Pressable>
      </View>

      {/* Trade History */}
      {trades.length > 0 && (
        <View style={styles.tradeSection}>
          <Text style={[styles.bookTitle, { color: colors.text }]}>
            Recent Trades
          </Text>
          {trades.slice(0, 10).map((t, i) => (
            <View
              key={i}
              style={[
                styles.tradeRow,
                { backgroundColor: colors.backgroundElement },
              ]}
            >
              <Text
                style={{
                  color: t.side === "buy" ? colors.bidGreen : colors.askRed,
                  fontWeight: "600",
                  fontSize: 12,
                }}
              >
                {t.side.toUpperCase()}
              </Text>
              <Text style={[styles.tradeDetail, { color: colors.text }]}>
                ₹{t.price.toFixed(2)}
              </Text>
              <Text
                style={[styles.tradeDetail, { color: colors.textSecondary }]}
              >
                {t.quantity} qty
              </Text>
              <Text
                style={[styles.tradeDetail, { color: colors.textSecondary }]}
              >
                {t.time}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsRow: {
    flexDirection: "row",
    padding: Spacing.three,
    margin: Spacing.three,
    borderRadius: 12,
    justifyContent: "space-between",
  },
  stat: { alignItems: "center" },
  statLabel: { fontSize: 11, fontWeight: "500" },
  statValue: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  bookContainer: { marginHorizontal: Spacing.three, marginTop: Spacing.two },
  bookTitle: { fontSize: 16, fontWeight: "600", marginBottom: Spacing.two },
  bookHeaders: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  bookHeader: { fontSize: 11, fontWeight: "500" },
  bookRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 28,
    marginBottom: 1,
  },
  bookBar: { position: "absolute", right: 0, height: "100%", borderRadius: 2 },
  askBar: { backgroundColor: "rgba(239,68,68,0.15)" },
  bidBar: { backgroundColor: "rgba(34,197,94,0.15)" },
  bookPrice: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    fontFamily: "monospace",
  },
  bookQty: {
    fontSize: 13,
    textAlign: "right",
    minWidth: 60,
    fontFamily: "monospace",
  },
  spreadLine: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 4,
    marginVertical: 4,
    alignItems: "center",
  },
  spreadText: { fontSize: 11 },
  orderEntry: {
    margin: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    gap: Spacing.two,
  },
  typeRow: { flexDirection: "row", gap: Spacing.two },
  typeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(128,128,128,0.15)",
  },
  typeBtnActive: { backgroundColor: "#3B82F6" },
  typeBtnText: { fontSize: 12, fontWeight: "600", color: "#888" },
  typeBtnTextActive: { color: "#fff" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  inputLabel: { fontSize: 13, width: 60 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  buttonRow: { flexDirection: "row", gap: Spacing.two },
  buyBtn: {
    flex: 1,
    backgroundColor: "#22C55E",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  sellBtn: {
    flex: 1,
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  sellBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  randomBtn: { paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  randomBtnText: { fontSize: 13, fontWeight: "600" },
  tradeSection: { marginHorizontal: Spacing.three, marginTop: Spacing.three },
  tradeRow: {
    flexDirection: "row",
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
    gap: Spacing.two,
    alignItems: "center",
  },
  tradeDetail: { fontSize: 12 },
});
