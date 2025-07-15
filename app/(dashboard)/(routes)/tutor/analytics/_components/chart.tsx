// v.0.0.01 salah

"use client";

import { Card } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface ChartProps {
  data: {
    name: string;
    total: number;
    uv?: number;
    pv?: number;
  }[];
}

export const Chart = ({ data }: ChartProps) => {
  return (
    <Card>
      <div className="grid gap-8">
        <div>
          <ResponsiveContainer width={"100%"} height={350}>
            <BarChart data={data}>
              <XAxis
                dataKey={"name"}
                stroke="white"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                className="line-clamp-1"
              />
              <YAxis
                stroke="white"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Bar
                dataKey={"total"}
                fill="hsl(271.49deg 80.44% 55.88%)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};
