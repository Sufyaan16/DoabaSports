import { MessageCircle, Package, Factory } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
}

const FEATURES: Feature[] = [
  {
    icon: <Package className="w-14 h-14 text-red-300" />,
    title: "COD SHIPPING",
    description: "COD Shipping All Over Pakistan",
    bgColor: "bg-red-400/10",
  },
  {
    icon: <MessageCircle className="w-14 h-14 text-blue-400" />,
    title: "CUSTOMER SUPPORT",
    description: "Online Customer Support",
    bgColor: "bg-blue-400/10",
  },
  {
    icon: <Factory className="w-14 h-14 text-green-400" />,
    title: "DIRECT FACTORY OUTLET",
    description: "Quality Guarantee",
    bgColor: "bg-green-400/10",
  },
];

interface FeaturesSectionProps {
  className?: string;
}

export function FeaturesSection({ className }: FeaturesSectionProps) {
  return (
    <section className={cn("border-y border-border bg-background", className)}>
      <div className="container mx-auto px-4 md:px-8 lg:px-20 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-4 justify-center md:justify-start"
            >
              <div
                className={cn(
                  "shrink-0 w-22 h-22 rounded-full flex items-center justify-center text-primary",
                  feature.bgColor,
                )}
              >
                {feature.icon}
              </div>
              <div className="text-center md:text-left">
                <h3 className="font-bold text-md md:text-2xl  text-neutral-600">
                  {feature.title}
                </h3>
                <p className="text-xs md:text-lg text-muted-foreground">
                  {feature.description}
                </p>
              </div>
              {index < FEATURES.length - 1 && (
                <Separator orientation="vertical" className="h-24" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
