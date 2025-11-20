import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Variant {
  id: string;
  size: string;
  color: string;
  color_hex: string | null;
  price_adjustment: number;
  is_available: boolean;
  stock: number;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string | null;
  onVariantChange: (variantId: string) => void;
  basePrice: number;
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onVariantChange,
  basePrice,
}: VariantSelectorProps) {
  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const finalPrice = selectedVariant
    ? basePrice + Number(selectedVariant.price_adjustment)
    : basePrice;

  // Get unique sizes and colors
  const sizes = Array.from(new Set(variants.map((v) => v.size)));
  const colors = Array.from(
    new Map(variants.map((v) => [v.color, v.color_hex])).entries()
  );

  const selectedSize = selectedVariant?.size;
  const selectedColor = selectedVariant?.color;

  const handleSizeChange = (size: string) => {
    // Find a variant with this size and the currently selected color (or any available color)
    const variant = variants.find(
      (v) =>
        v.size === size &&
        v.is_available &&
        (selectedColor ? v.color === selectedColor : true)
    );
    if (variant) {
      onVariantChange(variant.id);
    }
  };

  const handleColorChange = (color: string) => {
    // Find a variant with this color and the currently selected size (or any available size)
    const variant = variants.find(
      (v) =>
        v.color === color &&
        v.is_available &&
        (selectedSize ? v.size === selectedSize : true)
    );
    if (variant) {
      onVariantChange(variant.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Price Display */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-primary">
          ${finalPrice.toFixed(2)}
        </span>
        {selectedVariant && Number(selectedVariant.price_adjustment) !== 0 && (
          <span className="text-sm text-muted-foreground line-through">
            ${basePrice.toFixed(2)}
          </span>
        )}
      </div>

      {/* Size Selector */}
      {sizes.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Size</Label>
          <RadioGroup
            value={selectedSize || ""}
            onValueChange={handleSizeChange}
            className="flex flex-wrap gap-2"
          >
            {sizes.map((size) => {
              const sizeVariants = variants.filter((v) => v.size === size);
              const isAvailable = sizeVariants.some((v) => v.is_available);
              const isSelected = size === selectedSize;

              return (
                <label
                  key={size}
                  className={cn(
                    "flex items-center justify-center min-w-[60px] h-12 px-4 border-2 rounded-md cursor-pointer transition-all",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-input hover:border-primary/50",
                    !isAvailable && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <RadioGroupItem
                    value={size}
                    id={size}
                    disabled={!isAvailable}
                    className="sr-only"
                  />
                  <span className="font-medium">{size}</span>
                </label>
              );
            })}
          </RadioGroup>
        </div>
      )}

      {/* Color Selector */}
      {colors.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Color</Label>
          <RadioGroup
            value={selectedColor || ""}
            onValueChange={handleColorChange}
            className="flex flex-wrap gap-3"
          >
            {colors.map(([color, colorHex]) => {
              const colorVariants = variants.filter((v) => v.color === color);
              const isAvailable = colorVariants.some((v) => v.is_available);
              const isSelected = color === selectedColor;

              return (
                <label
                  key={color}
                  className={cn(
                    "flex flex-col items-center gap-2 cursor-pointer",
                    !isAvailable && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <RadioGroupItem
                    value={color}
                    id={color}
                    disabled={!isAvailable}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all",
                      isSelected ? "border-primary ring-2 ring-primary/20" : "border-input"
                    )}
                    style={{
                      backgroundColor: colorHex || "#ccc",
                    }}
                  />
                  <span className="text-sm font-medium">{color}</span>
                </label>
              );
            })}
          </RadioGroup>
        </div>
      )}

      {/* Stock Status */}
      {selectedVariant && (
        <div>
          {selectedVariant.stock > 0 ? (
            <Badge variant="secondary" className="text-sm">
              {selectedVariant.stock} in stock
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-sm">
              Out of stock
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
