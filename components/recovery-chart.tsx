"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { format } from "date-fns";

interface RecoveryChartProps {
  data: { month: string; recovered: number }[];
}

export function RecoveryChart({ data }: RecoveryChartProps) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="month"
            stroke="var(--muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "var(--text)" }}
            formatter={(value) => [
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(value ?? 0),
              "Recovered",
            ]}
          />
          <Bar
            dataKey="recovered"
            fill="var(--green)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
