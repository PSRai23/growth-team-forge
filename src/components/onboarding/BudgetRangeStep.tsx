import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface BudgetRangeStepProps {
  budgetMin: number;
  budgetMax: number;
  onBudgetChange: (min: number, max: number) => void;
}

export function BudgetRangeStep({ 
  budgetMin, 
  budgetMax, 
  onBudgetChange 
}: BudgetRangeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-primary mb-2">
          Budget Range
        </h2>
        <p className="text-muted-foreground">
          Set your comfortable price range per item
        </p>
      </div>

      <Card className="p-6 border-border">
        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-base font-ui">Minimum Price</Label>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-serif font-bold text-accent min-w-[100px]">
                ${budgetMin}
              </span>
              <Slider
                value={[budgetMin]}
                onValueChange={(values) => onBudgetChange(values[0], budgetMax)}
                min={0}
                max={500}
                step={10}
                className="flex-1"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$0</span>
              <span>$500</span>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-ui">Maximum Price</Label>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-serif font-bold text-accent min-w-[100px]">
                ${budgetMax}
              </span>
              <Slider
                value={[budgetMax]}
                onValueChange={(values) => onBudgetChange(budgetMin, values[0])}
                min={budgetMin + 10}
                max={1000}
                step={10}
                className="flex-1"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${budgetMin + 10}</span>
              <span>$1000+</span>
            </div>
          </div>

          <div className="bg-secondary/50 p-4 rounded-lg">
            <p className="text-sm text-center text-muted-foreground">
              Your budget range: <span className="font-semibold text-primary">${budgetMin} - ${budgetMax}</span>
            </p>
            <p className="text-xs text-center text-muted-foreground mt-2">
              We'll show you items within this price range
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
