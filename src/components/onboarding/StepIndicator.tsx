import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            i < currentStep
              ? "w-8 bg-accent"
              : i === currentStep
              ? "w-12 bg-accent"
              : "w-8 bg-border"
          )}
        />
      ))}
    </div>
  );
}
