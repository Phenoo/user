"use client";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PolarGrid,
  LabelList,
} from "recharts";
import { Button } from "@/components/ui/button";
import { FilterIcon, DownloadIcon, TrendingUpIcon } from "lucide-react";
import { MagicCard } from "../ui/magic-card";
import Container from "../global/container";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A multiple line chart";

export const descriptions = "A mixed bar chart";

const chartDataSec = [
  { browser: "january", visitors: 275, fill: "var(--color-january)" },
  { browser: "february", visitors: 200, fill: "var(--color-february)" },
  { browser: "march", visitors: 187, fill: "var(--color-march)" },
  { browser: "april", visitors: 173, fill: "var(--color-april)" },
  { browser: "may", visitors: 90, fill: "var(--color-may)" },
];

const chartConfigSec = {
  visitors: {
    label: "Visitors",
  },
  january: {
    label: "January",
    color: "var(--chart-1)",
  },
  february: {
    label: "February",
    color: "var(--chart-2)",
  },
  march: {
    label: "March",
    color: "var(--chart-3)",
  },
  april: {
    label: "April",
    color: "var(--chart-4)",
  },
  may: {
    label: "May",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

const chartData = [
  { browser: "maths", visitors: 275, fill: "var(--color-maths)" },
  { browser: "english", visitors: 200, fill: "var(--color-english)" },
  { browser: "arts", visitors: 187, fill: "var(--color-arts)" },
  { browser: "physics", visitors: 173, fill: "var(--color-physics)" },
  { browser: "physics", visitors: 143, fill: "var(--color-physics)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
];
const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  maths: {
    label: "Maths",
    color: "var(--chart-1)",
  },
  english: {
    label: "English",
    color: "var(--chart-2)",
  },
  arts: {
    label: "Arts",
    color: "var(--chart-3)",
  },
  physics: {
    label: "Physics",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export default function StudentSection() {
  const performanceData = [
    { name: "Math", value: 82, fill: "#ff8da1" },
    { name: "Science", value: 76, fill: "#ffc5d3" },
    { name: "English", value: 91, fill: "#f52891" },
    { name: "Arts", value: 100, fill: "#f51481" },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center w-full py-20">
      <Container>
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug">
            Intelligent studying
            <br />
            <span className="font-subheading italic">dashboard</span>
          </h2>
          <p className="text-base md:text-lg text-foreground/80/80 mt-4">
            Gain detailed insights into your marketing performance and campaign
            metrics with our advanced analytics tools.
          </p>
        </div>
      </Container>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative w-full">
        {/* Academic Performance */}
        <Container delay={0.2}>
          <div className="rounded-2xl bg-background/40 relative border border-border/50">
            <MagicCard
              gradientFrom="#ffc5d3"
              gradientTo="#ff8da1"
              gradientColor="rgba(245, 40, 145, 0.1)"
              className="p-4 lg:p-8 w-full overflow-hidden"
            >
              <div className="absolute bottom-0 right-0 bg-rose-500 w-1/4 h-1/4 blur-[8rem] z-20"></div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Academic Performance</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize student grades across different subjects.
                </p>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-3xl font-semibold">85%</div>
                    <div className="text-sm text-green-500 flex items-center gap-1 mt-2">
                      <TrendingUpIcon className="w-4 h-4" />
                      +5% improvement this semester
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost">
                      <FilterIcon className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <DownloadIcon className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Radial Chart */}
                <div className="h-64">
                  <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <RadialBarChart
                      data={chartData}
                      innerRadius={30}
                      outerRadius={100}
                    >
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent hideLabel nameKey="browser" />
                        }
                      />
                      <PolarGrid gridType="circle" />
                      <RadialBar dataKey="visitors" />
                    </RadialBarChart>
                  </ChartContainer>
                </div>
              </div>
            </MagicCard>
          </div>
        </Container>

        {/* Engagement & Attendance */}
        <Container delay={0.2}>
          <div className="rounded-2xl bg-background/40 relative border border-border/50">
            <MagicCard
              gradientFrom="#ffc5d3"
              gradientTo="#ff8da1"
              gradientColor="rgba(245, 40, 145, 0.1)"
              className="p-4 lg:p-8 w-full overflow-hidden"
            >
              <div className="absolute bottom-0 right-0 bg-pink-500 w-1/4 h-1/4 blur-[8rem] z-20"></div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">
                  Engagement & Attendance
                </h3>
                <p className="text-sm text-muted-foreground">
                  Track how students attend and engage week by week.
                </p>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-3xl font-semibold">89%</div>
                    <div className="text-sm text-green-500 flex items-center gap-1 mt-2">
                      <TrendingUpIcon className="w-4 h-4" />
                      +8% engagement this month
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost">
                      <FilterIcon className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <DownloadIcon className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="h-72">
                  <ChartContainer config={chartConfigSec}>
                    <BarChart
                      accessibilityLayer
                      data={chartDataSec}
                      layout="vertical"
                      margin={{
                        left: 0,
                      }}
                    >
                      <YAxis
                        dataKey="browser"
                        type="category"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) =>
                          chartConfigSec[value as keyof typeof chartConfigSec]
                            ?.label
                        }
                      />
                      <XAxis dataKey="visitors" type="number" hide />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Bar dataKey="visitors" layout="vertical" radius={5} />
                    </BarChart>
                  </ChartContainer>
                </div>
              </div>
            </MagicCard>
          </div>
        </Container>
      </div>
    </div>
  );
}
