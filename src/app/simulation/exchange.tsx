import { useCallback, useEffect, useRef, useState } from "react";
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

interface MMTrade {
  price: number;
  quantity: number;
  side: "bought" | "sold";
  tick: number;
}

export default function ExchangeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const [marketPrice, setMarketPrice] = useState(100);
  const [bidInput, setBidInput] = useState("99.50");
  const [askInput, setAskInput] = useState("100.50");
  const [qtyInput, setQtyInput] = useState("10");
  const [cash, setCash] = useState(100000);
  const [inventory, setInventory] = useState(0);
  const [trades, setTrades] = useState<MMTrade[]>([]);
  const [tickCount, setTickCount] = useState(0);
  const [auto, setAuto] = useState(false);
  const [bidPrice, setBidPrice] = useState(99.5);
  const [askPrice, setAskPrice] = useState(100.5);
  const [quotesSet, setQuotesSet] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initialCash = 100000;
  const pnl = cash + inventory * marketPrice - initialCash;
  const spread = askPrice - bidPrice;

  const doTick = useCallback(() => {
    setTickCount((t) => t + 1);
    setMarketPrice((prev) => {
      const change = (Math.random() - 0.5) * 0.6;
      return Math.round((prev + change) * 100) / 100;
    });

    if (!quotesSet) return;

    const shouldTrade = Math.random() > 0.4;
    if (!shouldTrade) return;

    const side = Math.random() > 0.5 ? "buy" : "sell";
    const qty = Math.floor(Math.random() * parseInt(qtyInput || "10", 10)) + 1;

    setTickCount((tick) => {
      if (side === "buy" && askPrice > 0) {
        setMarketPrice((mp) => {
          if (mp >= askPrice * 0.998) {
            setCash((c) => c + askPrice * qty);
            setInventory((inv) => inv - qty);
            setTrades((t) =>
              [
                { price: askPrice, quantity: qty, side: "sold" as const, tick },
                ...t,
              ].slice(0, 30),
            );
          }
          return mp;
        });
      } else if (side === "sell" && bidPrice > 0) {
        setMarketPrice((mp) => {
          if (mp <= bidPrice * 1.002) {
            setCash((c) => c - bidPrice * qty);
            setInventory((inv) => inv + qty);
            setTrades((t) =>
              [
                {
                  price: bidPrice,
                  quantity: qty,
                  side: "bought" as const,
                  tick,
                },
                ...t,
              ].slice(0, 30),
            );
          }
          return mp;
        });
      }
      return tick;
    });
  }, [quotesSet, askPrice, bidPrice, qtyInput]);

  const setQuotes = useCallback(() => {
    const bid = parseFloat(bidInput) || 0;
    const ask = parseFloat(askInput) || 0;
    if (bid <= 0 || ask <= 0 || bid >= ask) return;
    setBidPrice(bid);
    setAskPrice(ask);
    setQuotesSet(true);
  }, [bidInput, askInput]);

  useEffect(() => {
    if (auto) {
      intervalRef.current = setInterval(doTick, 800);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [auto, doTick]);

  const resetAll = useCallback(() => {
    setAuto(false);
    setCash(initialCash);
    setInventory(0);
    setTrades([]);
    setTickCount(0);
    setMarketPrice(100);
    setQuotesSet(false);
    setBidInput("99.50");
    setAskInput("100.50");
  }, []);

  const inventoryRisk = Math.abs(inventory) > 50;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Market Price */}
      <View
        style={[
          styles.priceCard,
          { backgroundColor: colors.backgroundElement },
        ]}
      >
        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
          Market Price
        </Text>
        <Text style={[styles.priceValue, { color: colors.text }]}>
          ₹{marketPrice.toFixed(2)}
        </Text>
        <Text style={[styles.tickLabel, { color: colors.textSecondary }]}>
          Tick #{tickCount}
        </Text>
      </View>

      {/* PnL Card */}
      <View
        style={[
          styles.pnlCard,
          {
            backgroundColor:
              pnl >= 0 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
          },
        ]}
      >
        <View style={styles.pnlRow}>
          <View style={styles.pnlItem}>
            <Text style={[styles.pnlLabel, { color: colors.textSecondary }]}>
              Cash
            </Text>
            <Text style={[styles.pnlValue, { color: colors.text }]}>
              ₹{cash.toFixed(0)}
            </Text>
          </View>
          <View style={styles.pnlItem}>
            <Text style={[styles.pnlLabel, { color: colors.textSecondary }]}>
              Inventory
            </Text>
            <Text
              style={[
                styles.pnlValue,
                { color: inventoryRisk ? colors.error : colors.text },
              ]}
            >
              {inventory}
            </Text>
          </View>
          <View style={styles.pnlItem}>
            <Text style={[styles.pnlLabel, { color: colors.textSecondary }]}>
              PnL
            </Text>
            <Text
              style={[
                styles.pnlValue,
                { color: pnl >= 0 ? colors.success : colors.error },
              ]}
            >
              ₹{pnl.toFixed(0)}
            </Text>
          </View>
        </View>
        {inventoryRisk && (
          <Text style={[styles.riskWarning, { color: colors.error }]}>
            Warning: High inventory risk. Consider adjusting quotes.
          </Text>
        )}
      </View>

      {/* Quote Entry */}
      <View
        style={[
          styles.quoteSection,
          { backgroundColor: colors.backgroundElement },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your Quotes
        </Text>
        <View style={styles.quoteRow}>
          <View style={styles.quoteInput}>
            <Text style={[styles.quoteLabel, { color: colors.bidGreen }]}>
              Bid
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.backgroundSelected },
              ]}
              value={bidInput}
              onChangeText={setBidInput}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.quoteInput}>
            <Text style={[styles.quoteLabel, { color: colors.askRed }]}>
              Ask
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.backgroundSelected },
              ]}
              value={askInput}
              onChangeText={setAskInput}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.quoteInput}>
            <Text style={[styles.quoteLabel, { color: colors.textSecondary }]}>
              Qty
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
        </View>

        <Pressable style={styles.setQuotesBtn} onPress={setQuotes}>
          <Text style={styles.setQuotesBtnText}>Set Quotes</Text>
        </Pressable>

        {quotesSet && (
          <Text style={[styles.spreadInfo, { color: colors.textSecondary }]}>
            Spread: ₹{spread.toFixed(2)} | Bid: ₹{bidPrice.toFixed(2)} | Ask: ₹
            {askPrice.toFixed(2)}
          </Text>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable
          style={[styles.tickBtn, { backgroundColor: "#3B82F6" }]}
          onPress={doTick}
        >
          <Text style={styles.tickBtnText}>Tick</Text>
        </Pressable>
        <Pressable
          style={[
            styles.tickBtn,
            { backgroundColor: auto ? "#EF4444" : "#10B981" },
          ]}
          onPress={() => setAuto(!auto)}
        >
          <Text style={styles.tickBtnText}>
            {auto ? "Stop Auto" : "Auto Play"}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tickBtn,
            { backgroundColor: colors.backgroundElement },
          ]}
          onPress={resetAll}
        >
          <Text style={[styles.tickBtnText, { color: colors.text }]}>
            Reset
          </Text>
        </Pressable>
      </View>

      {/* Trade Log */}
      {trades.length > 0 && (
        <View style={styles.tradeSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Trade Log
          </Text>
          {trades.slice(0, 15).map((t, i) => (
            <View
              key={i}
              style={[
                styles.tradeRow,
                { backgroundColor: colors.backgroundElement },
              ]}
            >
              <Text
                style={{
                  color: t.side === "bought" ? colors.bidGreen : colors.askRed,
                  fontWeight: "600",
                  fontSize: 12,
                  width: 60,
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
                T{t.tick}
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
  priceCard: {
    margin: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    alignItems: "center",
  },
  priceLabel: { fontSize: 12, fontWeight: "500" },
  priceValue: {
    fontSize: 32,
    fontWeight: "800",
    fontFamily: "monospace",
    marginTop: 4,
  },
  tickLabel: { fontSize: 12, marginTop: 4 },
  pnlCard: {
    marginHorizontal: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
  },
  pnlRow: { flexDirection: "row", justifyContent: "space-between" },
  pnlItem: { alignItems: "center" },
  pnlLabel: { fontSize: 11, fontWeight: "500" },
  pnlValue: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "monospace",
    marginTop: 2,
  },
  riskWarning: { fontSize: 12, marginTop: Spacing.two, textAlign: "center" },
  quoteSection: {
    margin: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    gap: Spacing.two,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  quoteRow: { flexDirection: "row", gap: Spacing.two },
  quoteInput: { flex: 1, gap: 4 },
  quoteLabel: { fontSize: 12, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  setQuotesBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  setQuotesBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  spreadInfo: { fontSize: 12, textAlign: "center" },
  controls: {
    flexDirection: "row",
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  tickBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  tickBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  tradeSection: { margin: Spacing.three, gap: Spacing.one },
  tradeRow: {
    flexDirection: "row",
    padding: 10,
    borderRadius: 8,
    gap: Spacing.two,
    alignItems: "center",
  },
  tradeDetail: { fontSize: 12, flex: 1 },
});
