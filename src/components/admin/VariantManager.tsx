import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface VariantManagerProps {
  productId: string;
}

interface VariantFormData {
  size: string;
  color: string;
  color_hex: string;
  sku: string;
  price_adjustment: number;
  is_available: boolean;
  quantity: number;
}

const defaultVariant: VariantFormData = {
  size: "",
  color: "",
  color_hex: "#000000",
  sku: "",
  price_adjustment: 0,
  is_available: true,
  quantity: 0,
};

export function VariantManager({ productId }: VariantManagerProps) {
  const [newVariant, setNewVariant] = useState<VariantFormData>(defaultVariant);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: variants, isLoading } = useQuery({
    queryKey: ["product-variants", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_variants")
        .select("*, inventory(*)")
        .eq("product_id", productId)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  const addVariantMutation = useMutation({
    mutationFn: async (variant: VariantFormData) => {
      // Create variant
      const { data: variantData, error: variantError } = await supabase
        .from("product_variants")
        .insert({
          product_id: productId,
          size: variant.size,
          color: variant.color,
          color_hex: variant.color_hex,
          sku: variant.sku,
          price_adjustment: variant.price_adjustment,
          is_available: variant.is_available,
        })
        .select()
        .single();

      if (variantError) throw variantError;

      // Create inventory record
      const { error: inventoryError } = await supabase
        .from("inventory")
        .insert({
          variant_id: variantData.id,
          quantity: variant.quantity,
        });

      if (inventoryError) throw inventoryError;

      return variantData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants", productId] });
      setNewVariant(defaultVariant);
      setShowForm(false);
      toast.success("Variant added successfully");
    },
    onError: (error) => {
      console.error("Error adding variant:", error);
      toast.error("Failed to add variant");
    },
  });

  const deleteVariantMutation = useMutation({
    mutationFn: async (variantId: string) => {
      const { error } = await supabase
        .from("product_variants")
        .delete()
        .eq("id", variantId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants", productId] });
      toast.success("Variant deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting variant:", error);
      toast.error("Failed to delete variant");
    },
  });

  const handleAddVariant = () => {
    if (!newVariant.size || !newVariant.color || !newVariant.sku) {
      toast.error("Please fill in all required fields");
      return;
    }
    addVariantMutation.mutate(newVariant);
  };

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-muted rounded-lg" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Product Variants</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Size *</Label>
                <Input
                  value={newVariant.size}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, size: e.target.value })
                  }
                  placeholder="S, M, L, XL..."
                />
              </div>
              <div className="space-y-2">
                <Label>Color Name *</Label>
                <Input
                  value={newVariant.color}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, color: e.target.value })
                  }
                  placeholder="Black, White..."
                />
              </div>
              <div className="space-y-2">
                <Label>Color Hex</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={newVariant.color_hex}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, color_hex: e.target.value })
                    }
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={newVariant.color_hex}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, color_hex: e.target.value })
                    }
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>SKU *</Label>
                <Input
                  value={newVariant.sku}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, sku: e.target.value })
                  }
                  placeholder="PROD-001-S-BLK"
                />
              </div>
              <div className="space-y-2">
                <Label>Price Adjustment ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newVariant.price_adjustment}
                  onChange={(e) =>
                    setNewVariant({
                      ...newVariant,
                      price_adjustment: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Initial Stock</Label>
                <Input
                  type="number"
                  min="0"
                  value={newVariant.quantity}
                  onChange={(e) =>
                    setNewVariant({
                      ...newVariant,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={newVariant.is_available}
                onCheckedChange={(checked) =>
                  setNewVariant({ ...newVariant, is_available: checked })
                }
              />
              <Label>Available for purchase</Label>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddVariant}
                disabled={addVariantMutation.isPending}
              >
                {addVariantMutation.isPending ? "Adding..." : "Add Variant"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {variants && variants.length > 0 ? (
          <div className="space-y-2">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: variant.color_hex || "#ccc" }}
                  />
                  <div>
                    <div className="font-medium">
                      {variant.size} / {variant.color}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      SKU: {variant.sku}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {variant.price_adjustment !== 0 && (
                    <Badge variant="secondary">
                      {variant.price_adjustment > 0 ? "+" : ""}$
                      {variant.price_adjustment}
                    </Badge>
                  )}
                  <Badge variant={variant.is_available ? "default" : "destructive"}>
                    {variant.is_available ? "Available" : "Unavailable"}
                  </Badge>
                  <Badge variant="outline">
                    Stock: {variant.inventory?.[0]?.quantity ?? 0}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteVariantMutation.mutate(variant.id)}
                    disabled={deleteVariantMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No variants added yet. Add at least one variant to make the product
            available for purchase.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
