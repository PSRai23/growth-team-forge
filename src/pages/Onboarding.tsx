import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { StylePreferenceStep } from "@/components/onboarding/StylePreferenceStep";
import { BodyTypeStep } from "@/components/onboarding/BodyTypeStep";
import { OccasionFrequencyStep } from "@/components/onboarding/OccasionFrequencyStep";
import { ColorPreferenceStep } from "@/components/onboarding/ColorPreferenceStep";
import { BudgetRangeStep } from "@/components/onboarding/BudgetRangeStep";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TOTAL_STEPS = 5;

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [stylePreferences, setStylePreferences] = useState<string[]>([]);
  const [bodyType, setBodyType] = useState("");
  const [heightRange, setHeightRange] = useState("");
  const [occasionFrequencies, setOccasionFrequencies] = useState<Record<string, number>>({
    work: 2,
    casual: 3,
    formal: 1,
    date: 1,
    party: 1,
    sports: 2,
  });
  const [colorPreferences, setColorPreferences] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState(50);
  const [budgetMax, setBudgetMax] = useState(200);

  const handleStyleToggle = (styleId: string) => {
    setStylePreferences((prev) =>
      prev.includes(styleId) ? prev.filter((id) => id !== styleId) : [...prev, styleId]
    );
  };

  const handleColorToggle = (colorId: string) => {
    setColorPreferences((prev) =>
      prev.includes(colorId) ? prev.filter((id) => id !== colorId) : [...prev, colorId]
    );
  };

  const handleFrequencyChange = (occasionId: string, value: number) => {
    setOccasionFrequencies((prev) => ({ ...prev, [occasionId]: value }));
  };

  const handleBudgetChange = (min: number, max: number) => {
    setBudgetMin(min);
    setBudgetMax(max);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return stylePreferences.length > 0;
      case 1:
        return bodyType && heightRange;
      case 2:
        return true; // Occasion frequencies have defaults
      case 3:
        return colorPreferences.length > 0;
      case 4:
        return budgetMin < budgetMax;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save your preferences.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { error } = await supabase.from("user_preferences").upsert({
        user_id: user.id,
        style_preferences: stylePreferences,
        body_type: bodyType,
        height_range: heightRange,
        occasion_frequencies: occasionFrequencies,
        color_preferences: colorPreferences,
        budget_min: budgetMin,
        budget_max: budgetMax,
      });

      if (error) throw error;

      toast({
        title: "Preferences Saved!",
        description: "Your style profile has been created successfully.",
      });

      navigate("/");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StylePreferenceStep
            selectedStyles={stylePreferences}
            onStyleToggle={handleStyleToggle}
          />
        );
      case 1:
        return (
          <BodyTypeStep
            bodyType={bodyType}
            heightRange={heightRange}
            onBodyTypeChange={setBodyType}
            onHeightRangeChange={setHeightRange}
          />
        );
      case 2:
        return (
          <OccasionFrequencyStep
            frequencies={occasionFrequencies}
            onFrequencyChange={handleFrequencyChange}
          />
        );
      case 3:
        return (
          <ColorPreferenceStep
            selectedColors={colorPreferences}
            onColorToggle={handleColorToggle}
          />
        );
      case 4:
        return (
          <BudgetRangeStep
            budgetMin={budgetMin}
            budgetMax={budgetMax}
            onBudgetChange={handleBudgetChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        <div className="mb-8">{renderStep()}</div>

        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {currentStep === TOTAL_STEPS - 1 ? (
              isSubmitting ? "Saving..." : "Complete"
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {currentStep === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            Step {currentStep + 1} of {TOTAL_STEPS}
          </p>
        )}
      </div>
    </div>
  );
}
