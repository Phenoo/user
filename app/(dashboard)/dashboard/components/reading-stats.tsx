"use client";

import { Area, AreaChart, Line, LineChart } from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";

export const data = [
  {
    revenue: 10400,
    subscription: 40,
  },
  {
    revenue: 14405,
    subscription: 90,
  },
  {
    revenue: 9400,
    subscription: 200,
  },
  {
    revenue: 8200,
    subscription: 278,
  },
  {
    revenue: 7000,
    subscription: 89,
  },
  {
    revenue: 9600,
    subscription: 239,
  },
  {
    revenue: 11244,
    subscription: 78,
  },
  {
    revenue: 26475,
    subscription: 89,
  },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
  },
  subscription: {
    label: "Subscriptions",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ReadingCardsStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
      {/* <Card className="">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground"></CardTitle>
          <CardDescription> Current GPA</CardDescription>
          <CardTitle className="text-3xl">3.84</CardTitle>
          <CardDescription>+12% from last semester</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[80px] flex items-baseline justify-baseline">
            <Progress value={84} className="mt-3 h-2" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Target: 3.9</p>
        </CardContent>
      </Card> */}
      <Card>
        <CardHeader>
          <CardDescription>Study Streak</CardDescription>
          <CardTitle className="text-3xl">12 days</CardTitle>
          <CardDescription>+20.1% from last month</CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <ChartContainer config={chartConfig} className="h-[80px] w-full">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <Line
                type="monotone"
                strokeWidth={2}
                dataKey="revenue"
                stroke="var(--color-revenue)"
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="pb-0 ">
        <CardHeader>
          <CardDescription>Hours This Week</CardDescription>
          <CardTitle className="text-3xl">28.5h</CardTitle>
          <CardDescription>+180.1% from last month</CardDescription>
          <CardAction>
            <Button variant="ghost" size="sm">
              View More
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="mt-auto max-h-[124px] flex-1 p-0">
          <ChartContainer config={chartConfig} className="size-full">
            <AreaChart
              data={data}
              margin={{
                left: 0,
                right: 0,
              }}
            >
              <Area
                dataKey="subscription"
                fill="var(--color-subscription)"
                fillOpacity={0.05}
                stroke="var(--color-subscription)"
                strokeWidth={2}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
