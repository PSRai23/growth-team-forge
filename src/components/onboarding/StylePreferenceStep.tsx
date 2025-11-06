import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const styleOptions = [
  { id: "casual", label: "Casual", image: "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=300&h=400&fit=crop" },
  { id: "formal", label: "Formal", image: "https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=300&h=400&fit=crop" },
  { id: "bohemian", label: "Bohemian", image: "https://images.unsplash.com/photo-1544957992-20514f595d6f?w=300&h=400&fit=crop" },
  { id: "sporty", label: "Sporty", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop" },
  { id: "elegant", label: "Elegant", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=400&fit=crop" },
  { id: "streetwear", label: "Streetwear", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=400&fit=crop" },
];

interface StylePreferenceStepProps {
  selectedStyles: string[];
  onStyleToggle: (styleId: string) => void;
}

export function StylePreferenceStep({ selectedStyles, onStyleToggle }: StylePreferenceStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-primary mb-2">
          What's Your Style?
        </h2>
        <p className="text-muted-foreground">
          Select all styles that resonate with you
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {styleOptions.map((style) => {
          const isSelected = selectedStyles.includes(style.id);
          return (
            <Card
              key={style.id}
              onClick={() => onStyleToggle(style.id)}
              className={cn(
                "relative overflow-hidden cursor-pointer transition-all border-2",
                isSelected
                  ? "border-accent shadow-lg scale-105"
                  : "border-border hover:border-accent/50"
              )}
            >
              <div className="relative">
                <img
                  src={style.image}
                  alt={style.label}
                  className="w-full h-40 object-cover"
                />
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t transition-all",
                  isSelected
                    ? "from-accent/80 to-accent/20"
                    : "from-primary/60 to-transparent"
                )} />
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-accent text-accent-foreground rounded-full p-1">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <p className="font-ui font-semibold text-center">{style.label}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
