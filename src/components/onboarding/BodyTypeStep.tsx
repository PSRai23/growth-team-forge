import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const bodyTypes = [
  { id: "hourglass", label: "Hourglass", description: "Balanced bust & hips, defined waist" },
  { id: "pear", label: "Pear", description: "Hips wider than bust" },
  { id: "apple", label: "Apple", description: "Bust wider than hips" },
  { id: "rectangle", label: "Rectangle", description: "Balanced proportions" },
  { id: "inverted-triangle", label: "Inverted Triangle", description: "Shoulders wider than hips" },
];

const heightRanges = [
  { value: "petite", label: "Petite (Under 5'4\")" },
  { value: "average", label: "Average (5'4\" - 5'7\")" },
  { value: "tall", label: "Tall (Over 5'7\")" },
];

interface BodyTypeStepProps {
  bodyType: string;
  heightRange: string;
  onBodyTypeChange: (value: string) => void;
  onHeightRangeChange: (value: string) => void;
}

export function BodyTypeStep({ 
  bodyType, 
  heightRange, 
  onBodyTypeChange, 
  onHeightRangeChange 
}: BodyTypeStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-primary mb-2">
          Your Body Type
        </h2>
        <p className="text-muted-foreground">
          Help us recommend the perfect fit for you
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-ui mb-4 block">Body Type</Label>
          <RadioGroup value={bodyType} onValueChange={onBodyTypeChange} className="space-y-3">
            {bodyTypes.map((type) => (
              <Card
                key={type.id}
                className={`p-4 cursor-pointer transition-all border-2 ${
                  bodyType === type.id
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/50"
                }`}
                onClick={() => onBodyTypeChange(type.id)}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={type.id} className="font-ui font-semibold text-base cursor-pointer">
                      {type.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {type.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="height" className="text-base font-ui mb-4 block">Height Range</Label>
          <Select value={heightRange} onValueChange={onHeightRangeChange}>
            <SelectTrigger id="height" className="w-full h-12">
              <SelectValue placeholder="Select your height range" />
            </SelectTrigger>
            <SelectContent>
              {heightRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
