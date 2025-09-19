import { FEATURES } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Container from "../global/container";
import { MagicCard } from "../ui/magic-card";

const Features = () => {
  return (
    <section id="features">
      <div className="relative flex flex-col items-center justify-center w-full py-20">
        <Container>
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mt-6">
              AI-Powered studying <br /> made{" "}
              <span className="font-subheading italic">simple</span>
            </h2>
            <p className="text-base md:text-lg text-center text-accent-foreground/80 mt-6">
              Transform your studying with AI-powered automation. Create
              campaigns faster, generate better content, and make smarter
              decisions in minutes.
            </p>
          </div>
        </Container>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 relative overflow-visible">
          {FEATURES.map((feature, index) => (
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
                gradientFrom="#ffc5d3"
                gradientTo="#ff8da1"
                gradientColor="rgba(245, 40, 145, 0.1)"
                className="p-4 lg:p-6 lg:rounded-3xl"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <feature.icon className="size-5 text-foreground" />
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>

                <div className="mt-6 w-full bg-card/50 overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={500}
                    height={500}
                    className={cn(
                      "w-full h-full object-cover rounded-sm",

                      index === 3 && "h-[250px] object-contain rounded-lg"
                    )}
                  />
                </div>
              </MagicCard>
            </Container>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
