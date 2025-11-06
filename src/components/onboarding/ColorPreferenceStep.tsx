import { cn } from "@/lib/utils";

const colors = [
  { id: "black", name: "Black", hex: "#000000" },
  { id: "white", name: "White", hex: "#FFFFFF" },
  { id: "navy", name: "Navy", hex: "#001F3F" },
  { id: "gray", name: "Gray", hex: "#AAAAAA" },
  { id: "beige", name: "Beige", hex: "#F5F5DC" },
  { id: "brown", name: "Brown", hex: "#8B4513" },
  { id: "red", name: "Red", hex: "#FF0000" },
  { id: "pink", name: "Pink", hex: "#FFC0CB" },
  { id: "orange", name: "Orange", hex: "#FFA500" },
  { id: "yellow", name: "Yellow", hex: "#FFD700" },
  { id: "green", name: "Green", hex: "#008000" },
  { id: "blue", name: "Blue", hex: "#0000FF" },
  { id: "purple", name: "Purple", hex: "#800080" },
  { id: "burgundy", name: "Burgundy", hex: "#800020" },
  { id: "olive", name: "Olive", hex: "#808000" },
  { id: "teal", name: "Teal", hex: "#008080" },
];

interface ColorPreferenceStepProps {
  selectedColors: string[];
  onColorToggle: (colorId: string) => void;
}

export function ColorPreferenceStep({ selectedColors, onColorToggle }: ColorPreferenceStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-primary mb-2">
          Color Preferences
        </h2>
        <p className="text-muted-foreground">
          Select colors you love to wear
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {colors.map((color) => {
          const isSelected = selectedColors.includes(color.id);
          return (
            <div
              key={color.id}
              onClick={() => onColorToggle(color.id)}
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              <div
                className={cn(
                  "w-16 h-16 rounded-full border-4 transition-all shadow-md",
                  isSelected
                    ? "border-accent scale-110"
                    : "border-border hover:border-accent/50"
                )}
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="bg-accent text-accent-foreground rounded-full p-1">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-xs font-ui text-center">{color.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
