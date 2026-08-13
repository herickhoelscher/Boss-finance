// Requer: npm install react recharts
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";

export interface EntradasSaidasDatum {
  mes: string; // ex: "SET-2025"
  entradas: number;
  saidas: number;
}

export interface EntradasSaidasChartProps {
  data?: EntradasSaidasDatum[];
  height?: number;
}

const CARD_BG = "#0d0f14";
const BADGE_BG = "#000000";
const AXIS_TEXT = "#9ca3af";
const GRID_LINE = "rgba(255,255,255,0.08)";
const TOOLTIP_BG = "#151824";
const TOOLTIP_BORDER = "#2a2f3d";

const ENTRADAS_COLOR = "#1e88ff";
const SAIDAS_COLOR = "#00d9a3";

const YEAR_STEP = 50000;

const currencyFormatter = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function buildYAxisTicks(maxValue: number, step = YEAR_STEP): number[] {
  const nextMultiple =
    maxValue % step === 0 ? maxValue + step : Math.ceil(maxValue / step) * step;
  const top = nextMultiple + step;
  const ticks: number[] = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  return ticks;
}

/**
 * 8 meses (SET-2025 a ABR-2026): entradas sempre acima de saídas, tendência
 * de crescimento com oscilações, saídas entre 45% e 65% das entradas.
 */
export function generateMockData(): EntradasSaidasDatum[] {
  const months = [
    "SET-2025",
    "OUT-2025",
    "NOV-2025",
    "DEZ-2025",
    "JAN-2026",
    "FEV-2026",
    "MAR-2026",
    "ABR-2026",
  ];
  const entradas = [158000, 176000, 169000, 191000, 205000, 214000, 296000, 251000];
  const saidasPct = [0.52, 0.48, 0.58, 0.5, 0.55, 0.46, 0.5, 0.6];

  return months.map((mes, i) => ({
    mes,
    entradas: entradas[i],
    saidas: Math.round(entradas[i] * saidasPct[i]),
  }));
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        background: TOOLTIP_BG,
        border: `1px solid ${TOOLTIP_BORDER}`,
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <p style={{ margin: 0, marginBottom: 6, fontSize: 12, fontWeight: 700, color: "#f3f4f6" }}>
        {label}
      </p>
      {payload.map((entry) => (
        <p
          key={entry.dataKey as string}
          style={{
            margin: 0,
            fontSize: 12,
            color: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: entry.color,
              display: "inline-block",
            }}
          />
          {entry.dataKey === "entradas" ? "Entradas" : "Saídas"}:{" "}
          {currencyFormatter(entry.value as number)}
        </p>
      ))}
    </div>
  );
}

export default function EntradasSaidasChart({
  data,
  height = 380,
}: EntradasSaidasChartProps) {
  const chartData = data && data.length ? data : generateMockData();
  const maxValue = Math.max(...chartData.map((d) => Math.max(d.entradas, d.saidas)));
  const ticks = buildYAxisTicks(maxValue);
  const yMax = ticks[ticks.length - 1];

  return (
    <div
      style={{
        position: "relative",
        background: CARD_BG,
        borderRadius: 20,
        padding: "28px 20px 12px",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 20,
          left: 24,
          background: BADGE_BG,
          color: "#ffffff",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.5,
          padding: "8px 16px",
          borderRadius: 999,
          textTransform: "uppercase",
        }}
      >
        Entradas x Saídas
      </span>

      <div style={{ height, marginTop: 52 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barGap={8}
            barCategoryGap="30%"
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke={GRID_LINE} />
            <XAxis
              dataKey="mes"
              tick={{ fill: AXIS_TEXT, fontSize: 12 }}
              axisLine={{ stroke: GRID_LINE }}
              tickLine={false}
            />
            <YAxis
              domain={[0, yMax]}
              ticks={ticks}
              tickFormatter={(v) => currencyFormatter(v as number)}
              tick={{ fill: AXIS_TEXT, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={116}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Legend
              verticalAlign="bottom"
              align="right"
              iconType="square"
              formatter={(value) => (value === "entradas" ? "Entradas" : "Saídas")}
              wrapperStyle={{ fontSize: 13, color: AXIS_TEXT, paddingTop: 16 }}
            />
            <Bar dataKey="entradas" fill={ENTRADAS_COLOR} radius={[6, 6, 0, 0]} />
            <Bar dataKey="saidas" fill={SAIDAS_COLOR} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
