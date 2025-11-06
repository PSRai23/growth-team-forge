import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const occasions = [
  { id: "work", label: "Work / Office", icon: "💼" },
  { id: "casual", label: "Casual Everyday", icon: "👕" },
  { id: "formal", label: "Formal Events", icon: "🎩" },
  { id: "date", label: "Date Night", icon: "🌹" },
  { id: "party", label: "Parties", icon: "🎉" },
  { id: "sports", label: "Sports / Gym", icon: "⚽" },
];

const frequencyLabels = ["Never", "Rarely", "Sometimes", "Often", "Always"];

interface OccasionFrequencyStepProps {
  frequencies: Record<string, number>;
  onFrequencyChange: (occasionId: string, value: number) => void;
}

export function OccasionFrequencyStep({ 
  frequencies, 
  onFrequencyChange 
}: OccasionFrequencyStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-primary mb-2">
          Occasion Frequency
        </h2>
        <p className="text-muted-foreground">
          How often do you dress for these occasions?
        </p>
      </div>

      <div className="space-y-6">
        {occasions.map((occasion) => {
          const frequency = frequencies[occasion.id] || 2;
          return (
            <Card key={occasion.id} className="p-4 border-border">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{occasion.icon}</span>
                  <Label className="font-ui font-semibold text-base flex-1">
                    {occasion.label}
                  </Label>
                  <span className="text-sm font-ui text-accent font-medium">
                    {frequencyLabels[frequency]}
                  </span>
                </div>
                <Slider
                  value={[frequency]}
                  onValueChange={(values) => onFrequencyChange(occasion.id, values[0])}
                  min={0}
                  max={4}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Never</span>
                  <span>Always</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
