import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Canvas, Circle, Line, Path, Rect, Skia } from "@shopify/react-native-skia";

interface ChartTheme {
  text: string;
  textSecondary: string;
  backgroundElement: string;
  grid: string;
}

export function themeFromColors(colors: Record<string, string>): ChartTheme {
  return {
    text: colors.text ?? "#000",
    textSecondary: colors.textSecondary ?? "#888",
    backgroundElement: colors.backgroundElement ?? "#F0F0F3",
    grid: "rgba(128,128,128,0.25)",
  };
}

const PAD = { l: 8, r: 8, t: 10, b: 10 };

function scale(
  v: number,
  min: number,
  max: number,
  h: number,
): number {
  const range = max - min || 1;
  return h - PAD.b - ((v - min) / range) * (h - PAD.t - PAD.b);
}

export function SkiaLineChart({
  data,
  width = 320,
  height = 160,
  color = "#3B82F6",
  fill = true,
  colors,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  colors: Record<string, string>;
}) {
  const theme = themeFromColors(colors);
  const { linePath, areaPath, min, max } = useMemo(() => {
    if (data.length === 0)
      return { linePath: null, areaPath: null, min: 0, max: 1 };
    const mn = Math.min(...data);
    const mx = Math.max(...data);
    const stepX =
      data.length > 1 ? (width - PAD.l - PAD.r) / (data.length - 1) : 0;
    const lp = Skia.Path.Make();
    data.forEach((v, i) => {
      const x = PAD.l + i * stepX;
      const y = scale(v, mn, mx, height);
      if (i === 0) lp.moveTo(x, y);
      else lp.lineTo(x, y);
    });
    let ap = null;
    if (fill) {
      ap = Skia.Path.Make();
      ap.moveTo(PAD.l, height - PAD.b);
      data.forEach((v, i) => {
        const x = PAD.l + i * stepX;
        ap!.lineTo(x, scale(v, mn, mx, height));
      });
      ap.lineTo(width - PAD.r, height - PAD.b);
      ap.close();
    }
    return { linePath: lp, areaPath: ap, min: mn, max: mx };
  }, [data, width, height, fill]);

  if (data.length === 0 || !linePath) {
    return (
      <View
        style={[
          styles.empty,
          { width, height, backgroundColor: theme.backgroundElement },
        ]}
      >
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
          No data
        </Text>
      </View>
    );
  }
  const midY = scale((min + max) / 2, min, max, height);
  return (
    <View>
      <Canvas style={{ width, height }}>
        <Line
          p1={{ x: PAD.l, y: midY }}
          p2={{ x: width - PAD.r, y: midY }}
          color={theme.grid}
          strokeWidth={1}
        />
        {fill && areaPath ? (
          <Path
            path={areaPath}
            color={color}
            opacity={0.18}
            style="fill"
          />
        ) : null}
        <Path
          path={linePath}
          color={color}
          strokeWidth={2}
          style="stroke"
          strokeJoin="round"
          strokeCap="round"
        />
        <Circle
          cx={width - PAD.r}
          cy={scale(data[data.length - 1], min, max, height)}
          r={3.5}
          color={color}
        />
      </Canvas>
    </View>
  );
}

export function SkiaBarChart({
  data,
  width = 320,
  height = 160,
  colors,
  positiveColor = "#10B981",
  negativeColor = "#EF4444",
}: {
  data: { label?: string; value: number }[];
  width?: number;
  height?: number;
  colors: Record<string, string>;
  positiveColor?: string;
  negativeColor?: string;
}) {
  const theme = themeFromColors(colors);
  if (data.length === 0) {
    return (
      <View
        style={[
          styles.empty,
          { width, height, backgroundColor: theme.backgroundElement },
        ]}
      >
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
          No data
        </Text>
      </View>
    );
  }
  const values = data.map((d) => d.value);
  const mn = Math.min(0, ...values);
  const mx = Math.max(0, ...values);
  const zeroY = scale(0, mn, mx, height);
  const gap = 3;
  const barW = Math.max(
    2,
    (width - PAD.l - PAD.r - gap * (data.length - 1)) / data.length,
  );
  return (
    <Canvas style={{ width, height }}>
      <Line
        p1={{ x: PAD.l, y: zeroY }}
        p2={{ x: width - PAD.r, y: zeroY }}
        color={theme.grid}
        strokeWidth={1}
      />
      {data.map((d, i) => {
        const x = PAD.l + i * (barW + gap);
        const y = scale(Math.max(d.value, 0), mn, mx, height);
        const y0 = scale(Math.min(d.value, 0), mn, mx, height);
        const top = Math.min(y, y0);
        const bh = Math.max(Math.abs(y0 - y), 2);
        return (
          <Rect
            key={i}
            x={x}
            y={top}
            width={barW}
            height={bh}
            color={d.value >= 0 ? positiveColor : negativeColor}
            opacity={0.85}
          />
        );
      })}
    </Canvas>
  );
}

export function SkiaHistogram({
  bins,
  width = 320,
  height = 160,
  colors,
  color = "#3B82F6",
}: {
  bins: { bin: number; count: number }[];
  width?: number;
  height?: number;
  colors: Record<string, string>;
  color?: string;
}) {
  return (
    <SkiaBarChart
      data={bins.map((b) => ({ value: b.count }))}
      width={width}
      height={height}
      colors={colors}
      positiveColor={color}
      negativeColor={color}
    />
  );
}

export function SkiaScatter({
  points,
  width = 320,
  height = 160,
  colors,
  color = "#8B5CF6",
}: {
  points: { x: number; y: number }[];
  width?: number;
  height?: number;
  colors: Record<string, string>;
  color?: string;
}) {
  const theme = themeFromColors(colors);
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs, 0);
  const xMax = Math.max(...xs, 1);
  const yMin = Math.min(...ys, 0);
  const yMax = Math.max(...ys, 1);
  const px = (x: number) =>
    PAD.l + ((x - xMin) / (xMax - xMin || 1)) * (width - PAD.l - PAD.r);
  const py = (y: number) => scale(y, yMin, yMax, height);
  return (
    <Canvas style={{ width, height }}>
      {points.slice(0, 400).map((p, i) => (
        <Circle key={i} cx={px(p.x)} cy={py(p.y)} r={3} color={color} opacity={0.7} />
      ))}
      <Line
        p1={{ x: PAD.l, y: height - PAD.b }}
        p2={{ x: width - PAD.r, y: height - PAD.b }}
        color={theme.grid}
        strokeWidth={1}
      />
    </Canvas>
  );
}

export function SkiaCandlesticks({
  bars,
  width = 320,
  height = 180,
  colors,
  count = 60,
}: {
  bars: { open: number; high: number; low: number; close: number }[];
  width?: number;
  height?: number;
  colors: Record<string, string>;
  count?: number;
}) {
  const theme = themeFromColors(colors);
  const sliced = bars.slice(-count);
  if (sliced.length === 0) {
    return (
      <View
        style={[
          styles.empty,
          { width, height, backgroundColor: theme.backgroundElement },
        ]}
      >
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
          No data
        </Text>
      </View>
    );
  }
  const mn = Math.min(...sliced.map((b) => b.low));
  const mx = Math.max(...sliced.map((b) => b.high));
  const gap = 2;
  const cw = Math.max(
    3,
    (width - PAD.l - PAD.r - gap * (sliced.length - 1)) / sliced.length,
  );
  return (
    <Canvas style={{ width, height }}>
      {sliced.map((b, i) => {
        const yO = scale(b.open, mn, mx, height);
        const yC = scale(b.close, mn, mx, height);
        const up = b.close >= b.open;
        const col = up ? "#22C55E" : "#EF4444";
        const top = Math.min(yO, yC);
        const bh = Math.max(Math.abs(yC - yO), 2);
        const bx = PAD.l + i * (cw + gap);
        return (
          <Rect
            key={`b${i}`}
            x={bx}
            y={top}
            width={cw}
            height={bh}
            color={col}
          />
        );
      })}
      {sliced.map((b, i) => {
        const x = PAD.l + i * (cw + gap) + cw / 2;
        const yH = scale(b.high, mn, mx, height);
        const yL = scale(b.low, mn, mx, height);
        const col = b.close >= b.open ? "#22C55E" : "#EF4444";
        return (
          <Line
            key={`w${i}`}
            p1={{ x, y: yH }}
            p2={{ x, y: yL }}
            color={col}
            strokeWidth={1.5}
          />
        );
      })}
    </Canvas>
  );
}

const styles = StyleSheet.create({
  empty: {
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
