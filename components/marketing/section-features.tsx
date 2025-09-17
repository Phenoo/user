"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  BarChart3,
  Calendar,
  Target,
  Brain,
  Clock,
} from "lucide-react";
import { MagicCard } from "../ui/magic-card";
import { cn } from "@/lib/utils";
import Container from "../container";

const features = [
  {
    icon: BookOpen,
    title: "Smart Study Tracking",
    description:
      "Automatically track your study sessions and analyze your learning patterns with AI-powered insights.",
  },
  {
    icon: BarChart3,
    title: "Grade Analytics",
    description:
      "Visualize your academic performance with detailed analytics and predictive grade forecasting.",
  },
  {
    icon: Calendar,
    title: "Intelligent Scheduling",
    description:
      "AI-optimized study schedules that adapt to your learning style and upcoming deadlines.",
  },
  {
    icon: Target,
    title: "Goal Management",
    description:
      "Set and track academic goals with personalized milestones and achievement tracking.",
  },
  {
    icon: Brain,
    title: "Learning Optimization",
    description:
      "Personalized study recommendations based on your performance and learning preferences.",
  },
  {
    icon: Clock,
    title: "Time Management",
    description:
      "Advanced time tracking and productivity insights to maximize your study efficiency.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mt-6">
            AI-Powered studying <br /> made{" "}
            <span className="font-subheading italic">simple</span>
          </h2>
          <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
            Transform your studying with AI-powered automation. Create campaigns
            faster, generate better content, and make smarter decisions in
            minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Container
              key={feature.title}
              delay={0.1 + index * 0.1}
              className={cn(
                "relative flex flex-col rounded-2xl lg:rounded-3xl bg-card border border-border/50 hover:border-border/100 transition-colors",
                index === 3 && "lg:col-span-2",
                index === 2 && "md:col-span-2 lg:col-span-1"
              )}
            >
              <MagicCard
                key={index}
                gradientFrom="#38bdf8"
                gradientTo="#3b82f6"
                className="p-4 lg:p-6 lg:rounded-3xl"
                gradientColor="rgba(59,130,246,0.1)"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <feature.icon className="size-5 text-primary" />
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>

                <div className="mt-6 w-full bg-card/50 overflow-hidden"></div>
              </MagicCard>
            </Container>
          ))}
        </div>
      </div>
    </section>
  );
}
