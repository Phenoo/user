"use client";

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const description = "A radial chart with text";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  safari: {
    label: "Safari",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function TodayChartsView() {
  const user = useQuery(api.users.currentUser);

  const tasks = useQuery(api.tasks.getTasks, {
    userId: user?._id as Id<"users">,
  });
  const uncompleted = tasks && tasks.filter((item) => item.completed == false);

  //@ts-ignore
  const percentage = (uncompleted?.length || 0 / tasks?.length) * 360;

  const chartData = [
    {
      browser: "safari",
      visitors: uncompleted?.length,
      fill: "var(--color-safari)",
    },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-sm">Today Tasks</CardTitle>
      </CardHeader>
      <CardContent className="flex-1  p-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[130px] w-[140px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={90 + percentage}
            innerRadius={60}
            outerRadius={80}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[64, 52]}
            />
            <RadialBar dataKey="visitors" background cornerRadius={8} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-base font-semibold"
                        >
                          {tasks && chartData[0].visitors?.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 18}
                          className="fill-muted-foreground text-xs"
                        >
                          Tasks to do
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
